---
title: Introduction to the Dubbo protocol
keywords: Dubbo, Protocol, RPC
description: This article introduces the design of the Dubbo protocol.
---

## The concept of the protocol
The protocol is the foundation of communication between two network entities, and data is transmitted from one entity to another in the form of a byte stream over the network. In the world of byte streams, this one-dimensional byte stream cannot be reshaped into two-dimensional or multi-dimensional data structures and domain objects without a protocol.


### What is the protocol
The protocol is the semantics determined by both parties for the communication. For example, we design a protocol for string transmission, which allows the client to send a string and the server receives the corresponding string.

This protocol is quite simple, first 4-byte represent the total length of the message, followed by 1-byte represents the length of the charset, and then followed by the message payload, charset name and string body.

For example, Send a string `abc` encoded by `iso-8859-1` to the server end. After protocol trans-coding, the content is: `18 = 4 + 1 + 10 + 3|10|iso-8859-1|abc`, when the server receives these byte streams, it first reads 4-byte and converts it to int, in this case is 18, which is the length of message. Then continue to read the remaining 14 bytes, the remaining first byte read will be the length of the charset name, which is 10, the after 10-byte content is converted to a string, the content is `iso-8859-1`. Use this charset to construct the subsequent byte array into the string `new String(bytes, "iso-8859-1")`.

In the previous example of a custom string transfer protocol, we have already seen the role of protocols in data transmission. Without a protocol, the data exchange cannot be completed. The following is Wikipedia's definition of the communication protocol.

> In telecommunication, a communication protocol is a system of rules that allow two or more entities of a communications system to transmit information via any kind of variation of a physical quantity. The protocol defines the rules syntax, semantics and synchronization of communication and possible error recovery methods. Protocols may be implemented by hardware, software, or a combination of both.

Communication protocols need to define syntax, semantics, and communication synchronization operations. The content described here is actually a formal description of the previous custom string transfer protocol.

### The definition of `Codec`

`org.apache.dubbo.remoting.Codec2` define the **Codec**'s I/O processing, so the main methods are `encode` and `decode`, as defined below:

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

​	`Codec` works on a protocol, `encode` method means to encode the communication object to the `ByteBufferWrapper`, and `decode` method decodes the `ChannelBuffer` read from the network into `Object`, which is the communication object.


## Common protocol mode
Protocols in application layer have three general forms: fixed-length protocol, special delimiter protocol and protocol header + payload mode. The specific contents of these forms are described below.

When reading data from the network in the form of a byte stream, it is necessary to determine when a meaningful transmission content ends. Moreover, the transmission of data on the network, there are sticky packets and fragment packets problem. The solution to this problem is that the protocol can accurately identify, when the sticky packets or fragment packets occurs, it can handle it correctly.


### Fixed-length protocol

The fixed-length protocol means that the length of the protocol content is fixed. For example, the protocol byte length is 50. When 50 bytes are read from the network, the decoding operation is performed. The fixed-length protocol is more efficient when reading or writing, because the size of the data cache is basically determined, just like an array. The defect is the lack of adaptability. Taking the RPC scene as an example, it is difficult to estimate the length.

> Refer to Netty's `FixedLengthFrameDecoder`

### Special delimiter protocol
Compared to fixed-length protocols, if we can define a special character as the end of each protocol unit, we can communicate in a variable length, so as to balance the data transmission and efficiency, such as the delimiter \n.

The problem with the special delimiter method is that it think about the process of protocol transmission in a simple way. For a protocol unit, it must be read all before it can be processed. In addition, it must be prevented that the data transmitted by the user cannot be the same as the delimiter, otherwise it will be disordered.

> Refer to Netty's `DelimiterBasedFrameDecoder`

### Variable length protocol(protocol head + payload)

Generally, it is a custom protocol, which is composed of a fixed length and a variable content. The fixed length part needs to specify the length of the variable content part.

```sh
+————————————————+
|fixed-length    |
+————————————————+
|variable content|
+————————————————+
```

> Refer to Netty's `LengthFieldBasedFrameDecoder`

The Dubbo protocol is actually a variable length protocol, which is covered in more detail in later chapters.

## The Dubbo protocol

### Overview to the Dubbo protocol
The Dubbo framework defines a proprietary RPC protocol in which the specific content of the request and response protocols is presented using a table.

![/dev-guide/images/dubbo_protocol_header.jpg](http://dubbo.apache.org/docs/zh-cn/dev/sources/images/dubbo_protocol_header.png)

### Dubbo protocol details

- Magic - Magic High & Magic Low (16 bits)

  Identify protocol version, Dubbo protocol: 0xdabb

- Req/Res (1 bit)

  Identify a request or response. request: 1; response: 0.

- 2 Way (1 bit)

  Only useful when Req/Res is 1(request), identifying if you expect to return a value from the server. Set to 1 if a return value from the server is required.

- Event (1 bit)

  Identifies whether it is an event message, for example, a heartbeat event. Set to 1 if this is an event.

- Serialization ID (5 bit)

  Identifies the serialization type: for example, the value of fastjson is 6.

- Status (8 bits)

   Only useful when Req/Res is 0 (response), used to identify the status of the response

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

  Identifies the only request, the type is long.

- Data Length (32 bits)

   The length of the serialized content (variable part), counted in bytes, the type is int.

- Variable Part

   After being serialized by a specific serialization type (identified by the serialization ID), each part is a byte [] or byte.

  - If it is a request packet (Req/Res = 1), each part is:
    - Dubbo version
    - Service name
    - Service version
    - Method name
    - Method parameter types
    - Method arguments
    - Attachments
  - If it is a response packet (Req/Res = 0), each part is:
    - Return value's type (byte), identifying the type of value returned from the server:
      - Return null: RESPONSE_NULL_VALUE 2
      - Normal response value: RESPONSE_VALUE  1
      - Exception: RESPONSE_WITH_EXCEPTION  0
    - Return value: response bytes returned from the server

**Note: ** For the variable part, when uses json serialization in current version of Dubbo framework, an additional line break is added as a separator between each part of the content. Please add a new line break after each part of the variable part, such as:

```
Dubbo version bytes (line break)
Service name bytes  (line break)
...
```

## Advantages and disadvantages about the Dubbo protocol

### Advantages

- The protocol is designed to be very compact. The data type can be represented by 1 bit will not be represented by a byte, such as a boolean type identifier.
- The request header is the same as response header, and the specific content is assembled to the variable part through the serializer, and it is simple to implement.

### To be improved

- Similar to the http request, the header can determine the resource to be accessed, and Dubbo needs to involve the specific serializer to resolve the service name, method, method signature, and these resource locators are string type or string array. It's easy to convert to bytes, so it can be assembled into the header. Similar to http2 header compression, resources called for rpc can also be negotiated with an int to identify, which improves performance. This is easier to implement if the resource locator is assembled on `header`.

- Use req/res to determine if it is a request, then you can refine the protocol, remove some unwanted identifiers and add some specific identifiers. For example, `status`, `twoWay` can be strictly customized to remove redundant identifiers. There is also a timeout identifier that is transmitted as the `attachment` of the Dubbo. In theory, it should be placed in the header of the request protocol, because the timeout is essential in the network request. Referring to `attachment`, you can see from the implementation that there are some fields in `attachment` that are duplicated with existing fields in `content`, such as `path` and `version`, which increase the protocol size. 

- Dubbo will convert the service name `com.alibaba.middleware.hsf.guide.api.param.ModifyOrderPriceParam` to `Lcom/alibaba/middleware/hsf/guide/api/param/ModifyOrderPriceParam;`, which is theoretically unnecessary, simply append a `;` will be fine.

- The Dubbo protocol does not reserve extension fields, and cannot add new identifiers. The scalability is not very good. For example, the only way to add the `response context` function is to change the protocol version, but this requires both the client and server versions to be upgraded. Very unfriendly in distributed scenarios.

## Conclusion

This article mainly introduces the concept of the protocol and the commonly used protocol mode. Then it analyzes the Dubbo protocol in detail and also mentions some shortcomings. However, compared with its simplicity and ease of implementation, the above shortcomings are not enough to drive us to redesign a new version of the protocol, so we welcome suggestions and features for protocol optimization.
