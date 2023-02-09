---
title: "Dubbo 协议详解"
linkTitle: "Dubbo 协议详解"
tags: ["Java"]
date: 2018-10-05
description: 本文介绍了 Dubbo 协议的设计
---

## 协议的概念

协议是两个网络实体进行通信的基础，数据在网络上从一个实体传输到另一个实体，以字节流的形式传递到对端。在这个字节流的世界里，如果没有协议，就无法将这个一维的字节流重塑成为二维或者多维的数据结构以及领域对象。



### 协议是什么

协议是双方确定的交流语义，比如：我们设计一个字符串传输的协议，它允许客户端发送一个字符串，服务端接收到对应的字符串。这个协议很简单，首先发送一个4字节的消息总长度，然后再发送1字节的字符集charset长度，接下来就是消息的payload，字符集名称和字符串正文。

发送一个`iso-8859-1`的字符串`abc`到对端。经过协议编码，内容是：`18 = 4 + 1 + 10 + 3|10|iso-8859-1|abc`，当这些字节流发往服务端后，当服务端收到字节流后，首先读取4个字节，将其转换为int，在这个例子中是18，接下来继续读14个字节，将首个字节得到字符集名称长度10，将后续内容的前10字节转换为字符串，内容是`iso-8859-1`，使用该字符集将后续的字节数组造型成为字符串`new String(bytes, "iso-8859-1")`。

在前面自定义字符串传输协议的例子中，我们已经看到协议在双方传输数据中起到的作用，没有协议就无法完成数据交换，下面是维基百科对于通信协议的定义。

> In telecommunication, a communication protocol is a system of rules that allow two or more entities of a communications system to transmit information via any kind of variation of a physical quantity. The protocol defines the rules syntax, semantics and synchronization of communication and possible error recovery methods. Protocols may be implemented by hardware, software, or a combination of both.

可以看到通信协议需要定义语法、语义以及通信上的同步操作，这里描述的内容实际就是对前面自定义字符串传输协议的形式化描述。

### `Codec`的定义

`org.apache.dubbo.remoting.Codec2`定义为I/O的 **Codec** 过程，因此主要的方法就是`encode`和`decode`，具体定义如下所示：

```java
@SPI
public interface Codec2 {

    @Adaptive({Constants.CODEC_KEY})
    void encode(Channel channel, ChannelBuffer buffer, Object message) throws IOException;

    @Adaptive({Constants.CODEC_KEY})
    Object decode(Channel channel, ChannelBuffer buffer) throws IOException;


    enum DecodeResult {
        NEED_MORE_INPUT, SKIP_SOME_INPUT
    }

}
```

​	`Codec`工作在一种协议上，`encode`是将通信对象编码到`ByteBufferWrapper`中，`decode`是将从网络上读取的`ChannelBuffer`解码为`Object`，也就是通信对象。



## 常见的协议模式

应用层协议一般的形式有三种：定长协议、特殊结束符和协议头+payload模式，下面介绍一下这些形式的具体内容。

从网络上以流的形式进行数据的读取，需要确定的是一次有意义的传输内容在读到何时结束，因为一个一个byte传输过来，需要有一个结束。而且数据在网络上的传输，存在粘包和半包的情况，能够应对这个问题的办法就是协议能够准确的识别，当粘包发生时不会多读，当半包发生时会继续读取。



### 定长协议

定长的协议是指协议内容的长度是固定的，比如协议byte长度是50，当从网络上读取50个byte后，就进行decode解码操作。定长协议在读取或者写入时，效率比较高，因为数据缓存的大小基本都确定了，就好比数组一样，缺陷就是适应性不足，以RPC场景为例，很难估计出定长的长度是多少。

> 可以参考Netty的`FixedLengthFrameDecoder`



### 特殊结束符

相比定长协议，如果能够定义一个特殊字符作为每个协议单元结束的标示，就能够以变长的方式进行通信，从而在数据传输和高效之间取得平衡，比如用特殊字符`\n`。

特殊结束符方式的问题是过于简单的思考了协议传输的过程，对于一个协议单元必须要全部读入才能够进行处理，除此之外必须要防止用户传输的数据不能同结束符相同，否则就会出现紊乱。

> 可以参考Netty的`DelimiterBasedFrameDecoder`



### 变长协议（协议头+payload）

一般是自定义协议，会以定长加不定长的部分组成，其中定长的部分需要描述不定长的内容长度。

```sh
+———+
|定长|
+———+
|内容|
+———+
```

> 可以参考Netty的`LengthFieldBasedFrameDecoder`

Dubbo 协议实际上就是一种变长协议，后面的章节会详细介绍。

## Dubbo 协议

### 协议概览

Dubbo 框架定义了私有的RPC协议，其中请求和响应协议的具体内容我们使用表格来展示。

![/dev-guide/images/dubbo_protocol_header.jpg](/imgs/dev/dubbo_protocol_header.png)

### 协议详情

- Magic - Magic High & Magic Low (16 bits)

  标识协议版本号，Dubbo 协议：0xdabb

- Req/Res (1 bit)

  标识是请求或响应。请求： 1; 响应： 0。

- 2 Way (1 bit)

  仅在 Req/Res 为1（请求）时才有用，标记是否期望从服务器返回值。如果需要来自服务器的返回值，则设置为1。

- Event (1 bit)

  标识是否是事件消息，例如，心跳事件。如果这是一个事件，则设置为1。

- Serialization ID (5 bit)

  标识序列化类型：比如 fastjson 的值为6。

- Status (8 bits)

   仅在 Req/Res 为0（响应）时有用，用于标识响应的状态。

  - 20 - OK
  - 30 - CLIENT_TIMEOUT
  - 31 - SERVER_TIMEOUT
  - 40 - BAD_REQUEST
  - 50 - BAD_RESPONSE
  - 60 - SERVICE_NOT_FOUND
  - 70 - SERVICE_ERROR
  - 80 - SERVER_ERROR
  - 90 - CLIENT_ERROR
  - 100 - SERVER_THREADPOOL_EXHAUSTED_ERROR

- Request ID (64 bits)

  标识唯一请求。类型为long。

- Data Length (32 bits)

   序列化后的内容长度（可变部分），按字节计数。int类型。

- Variable Part

   被特定的序列化类型（由序列化 ID 标识）序列化后，每个部分都是一个 byte [] 或者 byte

  - 如果是请求包 ( Req/Res = 1)，则每个部分依次为：
    - Dubbo version
    - Service name
    - Service version
    - Method name
    - Method parameter types
    - Method arguments
    - Attachments
  - 如果是响应包（Req/Res = 0），则每个部分依次为：
    - 返回值类型(byte)，标识从服务器端返回的值类型：
      - 返回空值：RESPONSE_NULL_VALUE 2
      - 正常响应值： RESPONSE_VALUE  1
      - 异常：RESPONSE_WITH_EXCEPTION  0
    - 返回值：从服务端返回的响应bytes

**注意：** 对于(Variable Part)变长部分，当前版本的Dubbo 框架使用json序列化时，在每部分内容间额外增加了换行符作为分隔，请在Variable Part的每个part后额外增加换行符， 如：

```
Dubbo version bytes (换行符)
Service name bytes  (换行符)
...
```

## Dubbo 协议的优缺点

### 优点

- 协议设计上很紧凑，能用 1 个 bit 表示的，不会用一个 byte 来表示，比如 boolean 类型的标识。
- 请求、响应的 header 一致，通过序列化器对 content 组装特定的内容，代码实现起来简单。

### 可以改进的点

- 类似于 http 请求，通过 header 就可以确定要访问的资源，而 Dubbo 需要涉及到用特定序列化协议才可以将服务名、方法、方法签名解析出来，并且这些资源定位符是 string 类型或者 string 数组，很容易转成 bytes，因此可以组装到 header 中。类似于 http2 的 header 压缩，对于 rpc 调用的资源也可以协商出来一个int来标识，从而提升性能，如果在`header`上组装资源定位符的话，该功能则更易实现。

- 通过 req/res 是否是请求后，可以精细定制协议，去掉一些不需要的标识和添加一些特定的标识。比如`status`,`twoWay`标识可以严格定制，去掉冗余标识。还有超时时间是作为 Dubbo 的 `attachment` 进行传输的，理论上应该放到请求协议的header中，因为超时是网络请求中必不可少的。提到 `attachment` ，通过实现可以看到 `attachment` 中有一些是跟协议 `content`中已有的字段是重复的，比如 `path`和`version`等字段，这些会增大协议尺寸。 

- Dubbo 会将服务名`com.alibaba.middleware.hsf.guide.api.param.ModifyOrderPriceParam`，转换为`Lcom/alibaba/middleware/hsf/guide/api/param/ModifyOrderPriceParam;`，理论上是不必要的，最后追加一个`;`即可。

- Dubbo 协议没有预留扩展字段，没法新增标识，扩展性不太好，比如新增`响应上下文`的功能，只有改协议版本号的方式，但是这样要求客户端和服务端的版本都进行升级，对于分布式场景很不友好。


## 总结

本文主要介绍了协议的概念和常用的协议模式，后面对 Dubbo 协议进行了详细分析，也提到了一些不足的地方，但是相对于其简洁性和易于实现性，以上提出的缺点不足以有动力设计出一个新版本的协议，所以欢迎大家提出对协议优化方面的建议和特性。












