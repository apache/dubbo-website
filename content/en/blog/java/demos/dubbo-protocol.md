---
title: "Detailed Explanation of Dubbo Protocol"
linkTitle: "Detailed Explanation of Dubbo Protocol"
tags: ["Java"]
date: 2018-10-05
description: This article introduces the design of the Dubbo protocol
---

## Concept of Protocol

A protocol is the foundation for communication between two network entities, where data is transmitted from one entity to another in the form of a byte stream. Without a protocol, it is impossible to reshape this one-dimensional byte stream into two-dimensional or multi-dimensional data structures and domain objects.

### What is a Protocol

A protocol is the agreed-upon semantic for communication between parties. For instance, when designing a string transmission protocol, it allows the client to send a string, which the server receives. This protocol is simple: first, send a 4-byte total message length, then send a 1-byte charset length, followed by the message payload, charset name, and string body.

Sending an `iso-8859-1` string `abc` to the other end results in the encoded content: `18 = 4 + 1 + 10 + 3|10|iso-8859-1|abc`. When these bytes are sent to the server, it first reads the 4 bytes, converts them to int (in this case, 18), then continues to read 14 bytes to get the charset name length of 10 and converts the next 10 bytes into the string `iso-8859-1`, using that charset to form the string from subsequent byte arrays with `new String(bytes, "iso-8859-1")`.

From this custom string transmission protocol example, we see that a protocol plays a crucial role in data transmission between parties; without it, data exchange would be impossible. Below is the definition of a communication protocol from Wikipedia.

> In telecommunication, a communication protocol is a system of rules that allow two or more entities of a communications system to transmit information via any kind of variation of a physical quantity. The protocol defines the rules syntax, semantics, and synchronization of communication and possible error recovery methods. Protocols may be implemented by hardware, software, or a combination of both.

It is clear that communication protocols need to define syntax, semantics, and synchronization operations. What is described here is a formal description of the previously defined custom string transmission protocol.

### Definition of `Codec`

`org.apache.dubbo.remoting.Codec2` is defined as the **Codec** process for I/O, with the main methods being `encode` and `decode`, as defined below:

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

The `Codec` works on a protocol, where `encode` encodes the communication object into `ByteBufferWrapper`, and `decode` decodes the `ChannelBuffer` read from the network into an `Object`.

## Common Protocol Patterns

General forms of application layer protocols can be classified into three types: fixed-length protocol, special end character, and protocol header + payload pattern. Below is an introduction to the specifics of these forms.

When reading data from the network as a stream, it is essential to determine when a meaningful transmission ends, as data is transmitted byte by byte and needs an endpoint. Additionally, transmission across networks may face issues like packet loss or half packets; the way to address this is through protocols that can accurately identify. When packet loss occurs, they should not read more; when half packets occur, they should continue reading.

### Fixed-Length Protocol

A fixed-length protocol means the length of protocol content is fixed, e.g., if the protocol byte length is 50, decode after reading 50 bytes from the network. Fixed-length protocols are efficient when reading or writing, as the size of the data buffer is mostly predetermined, similar to arrays. However, the drawback is a lack of adaptability, as estimating the length is tough in RPC scenarios.

> Refer to Netty's `FixedLengthFrameDecoder`

### Special End Character

In comparison to fixed-length protocols, defining a special character to signify the end of each protocol unit allows for variable-length communication, maintaining a balance between data transmission and efficiency, e.g., using a special character `\n`.

The problem with the special end character approach is that it simplifies the process of protocol transmission. The entire protocol unit must be read to process it, and it's crucial to ensure that data transferred by users does not match the end character, or it will create confusion.

> Refer to Netty's `DelimiterBasedFrameDecoder`

### Variable-Length Protocol (Header + Payload)

Typically a custom protocol, consisting of fixed-length and variable-length sections where the fixed part describes the length of the variable content.

```sh
+———+
|Fixed Part|
+———+
|Content|
+———+
```

> Refer to Netty's `LengthFieldBasedFrameDecoder`

Dubbo protocol is essentially a type of variable-length protocol, which will be elaborated in subsequent chapters.

## Dubbo Protocol

### Protocol Overview

The Dubbo framework defines a private RPC protocol, with details for requests and responses displayed in a table.

![/dev-guide/images/dubbo_protocol_header.jpg](/imgs/dev/dubbo_protocol_header.png)

### Protocol Details

- Magic - Magic High & Magic Low (16 bits) indicates protocol version number, Dubbo protocol: 0xdabb
- Req/Res (1 bit) indicates whether it is a request or response. Request: 1; Response: 0.
- 2 Way (1 bit) only useful when Req/Res = 1, indicating expectation of a return value from the server.
- Event (1 bit) indicates whether it is an event message, such as a heartbeat event.
- Serialization ID (5 bit) indicates serialization type, e.g., fastjson's value is 6.
- Status (8 bits) only useful when Req/Res = 0, indicates response status.

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

- Request ID (64 bits) uniquely identifies the request. Type: long.
- Data Length (32 bits) length of the serialized content (variable part), counted in bytes. Type: int.
- Variable Part is serialized by a specific serialization type identified by the serialization ID. Each part is a byte[] or byte.

  - For request packets (Req/Res = 1), each part includes:
    - Dubbo version
    - Service name
    - Service version
    - Method name
    - Method parameter types
    - Method arguments
    - Attachments
  - For response packets (Req/Res = 0), each part includes:
    - Return value type (byte), indicating the type of value returned from the server:
      - Null value: RESPONSE_NULL_VALUE 2
      - Normal response value: RESPONSE_VALUE  1
      - Exception: RESPONSE_WITH_EXCEPTION  0
    - Return value: response bytes returned from the server

**Note:** For (Variable Part), the current version of the Dubbo framework adds an extra newline character as a separator when using JSON serialization. Please ensure an extra newline character is added after each part in the Variable Part, e.g.:

```
Dubbo version bytes (newline)
Service name bytes  (newline)
...
```

## Pros and Cons of Dubbo Protocol

### Advantages

- The protocol design is very compact; what can be represented with 1 bit will not use a byte, e.g., boolean type indicators.
- The headers for requests and responses are consistent, assembling specific content through the serializer, making implementation straightforward.

### Points for Improvement

- Similar to HTTP requests, resources can be identified through headers; however, Dubbo requires specific serialization protocols to parse service names, methods, and method signatures. These resource identifiers, being of string type or string array, easily convert to bytes, so they could be assembled into the header. Comparably, HTTP/2 header compression could also negotiate an int to identify RPC calling resources, enhancing performance. If resource identifiers were assembled in the `header`, this function would be easier to implement.

- By examining whether req/res is a request, the protocol can be fine-tuned by removing unnecessary identifiers and adding specific ones. For instance, `status` and `twoWay` identifiers could be strictly customized to eliminate redundancy. Moreover, timeout is transmitted as a Dubbo `attachment`, but theoretically, it should be placed in the request protocol header as timeout is essential in network requests. Referring to `attachment`, it can be observed that some fields within it are redundant to those in the protocol's `content`, such as `path` and `version`, which increase the protocol's size.

- Dubbo converts the service name `com.alibaba.middleware.hsf.guide.api.param.ModifyOrderPriceParam` into `Lcom/alibaba/middleware/hsf/guide/api/param/ModifyOrderPriceParam;`, which is unnecessary and could just append a `;`.

- The Dubbo protocol has no reserved extension fields, making it challenging to add new identifiers, leading to poor extensibility. For example, adding `response context` functionality would necessitate changing the protocol version number, which requires upgrading both the client and server versions—an unfavorable scenario in distributed contexts.

## Conclusion

This article mainly introduces the concept of protocols and common protocol patterns, followed by a detailed analysis of the Dubbo protocol, highlighting some drawbacks. However, considering its simplicity and ease of implementation, the listed shortcomings do not provide enough incentive to design a new version of the protocol. Suggestions and features for protocol optimization are welcome.

