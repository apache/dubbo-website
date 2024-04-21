---
description: "TCP (Dubbo2) 协议规范"
linkTitle: Dubbo2 协议规范
title: Dubbo2 协议规范
type: docs
weight: 2
---

![/dev-guide/images/dubbo_protocol_header.jpg](/imgs/dev/dubbo_protocol_header.png)

## 协议规范 Specification

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

## 协议特点分析

### 优点

- 协议设计上很紧凑，能用 1 个 bit 表示的，不会用一个 byte 来表示，比如 boolean 类型的标识。
- 请求、响应的 header 一致，通过序列化器对 content 组装特定的内容，代码实现起来简单。

### 可以改进的点

- 对于网关代理类组件不友好。http 请求而言，通过 header 就可以确定要访问的资源，而 Dubbo 需要涉及到用特定序列化协议才可以将服务名、方法、方法签名解析出来，并且这些资源定位符是 string 类型或者 string 数组，很容易转成 bytes，因此可以组装到 header 中。类似于 http2 的 header 压缩，对于 rpc 调用的资源也可以协商出来一个int来标识，从而提升性能，如果在`header`上组装资源定位符的话，该功能则更易实现。

- 通过 req/res 是否是请求后，可以精细定制协议，去掉一些不需要的标识和添加一些特定的标识。比如`status`,`twoWay`标识可以严格定制，去掉冗余标识。还有超时时间是作为 Dubbo 的 `attachment` 进行传输的，理论上应该放到请求协议的header中，因为超时是网络请求中必不可少的。提到 `attachment` ，通过实现可以看到 `attachment` 中有一些是跟协议 `content`中已有的字段是重复的，比如 `path`和`version`等字段，这些会增大协议尺寸。

- Dubbo 会将服务名`com.alibaba.middleware.hsf.guide.api.param.ModifyOrderPriceParam`，转换为`Lcom/alibaba/middleware/hsf/guide/api/param/ModifyOrderPriceParam;`，理论上是不必要的，最后追加一个`;`即可。

- Dubbo 协议没有预留扩展字段，没法新增标识，扩展性不太好，比如新增`响应上下文`的功能，只有改协议版本号的方式，但是这样要求客户端和服务端的版本都进行升级，对于分布式场景很不友好。


