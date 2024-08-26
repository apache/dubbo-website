---
type: docs
title: "Tripe 3.3 New Features"
linkTitle: "Tripe 3.3 New Features"
weight: 13
---

<a name="lipv5"></a>

## New REST Support

### Rest Features

Since Dubbo 3.3, the Triple protocol reuses the existing HTTP stack to fully support RESTful service exports. Without the need for generic or gateway protocol conversion, users can
directly access backend Triple protocol services via HTTP in a decentralized manner. Additionally, it offers extensive annotation and SPI extension support for advanced REST usage,
such as path customization, output format customization, and exception handling. Key features include:

- **Triple Protocol Integration**  
  Reuses the existing Triple HTTP stack, allowing support for HTTP/1, HTTP/2, and HTTP/3 without additional configuration or new ports.
- **Decentralization**  
  Exposes Rest APIs directly, eliminating dependency on gateway applications for traffic forwarding, thus improving performance and reducing stability risks caused by gateways.
  Security concerns can be addressed through internal application extensions, a practice verified in Taobao’s MTOP.
- **Support for Existing Servlet Infrastructure**  
  Supports Servlet API and Filter, allowing users to reuse existing security components based on the Servlet API. Integrating OAuth and Spring Security is as simple as implementing
  a Servlet Filter.
- **Multiple Dialects**  
  Considering that most users are accustomed to using SpringMVC or JAX-RS for REST API development, Triple Rest allows continued use of these methods for service definitions and
  supports most extensions and exception handling mechanisms (with over 80% of the original framework’s functionality). For lightweight users, the Basic dialect is available, and
  Triple’s out-of-the-box REST capabilities are based on this dialect.
- **Strong Extensibility**  
  Offers more than 20 extension points, enabling users to easily create custom dialects and flexibly customize parameter retrieval, type conversion, error handling, and other
  logic.
- **Out-of-the-Box**  
  REST capabilities are available out of the box; simply enable the Triple protocol to have direct REST access to services.
- **High-Performance Routing**  
  The routing component uses an
  optimized [Radix Tree](https://github.com/apache/dubbo/blob/3.3/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/RadixTree.java) and Zero
  Copy technology to improve routing performance.
- **Seamless OpenAPI Integration (TBD)**  
  Upcoming OpenAPI integration will allow for out-of-the-box OpenAPI Schema export. With the Swagger dependency, a Web UI can be used for service testing. Using the OpenAPI Schema,
  API tools like [Postman](https://www.postman.com/) and [Apifox](https://apifox.com/) can manage and test APIs, and the OpenAPI ecosystem can facilitate cross-language calls.
  Future enhancements will support a Schema First approach, allowing frontend teams to define OpenAPI collaboratively, generate call code and mocks based on OpenAPI, and enable
  backend development using stubs generated from OpenAPI, greatly improving collaboration efficiency.

<a name="DBA0D"></a>

### Example

<a name="tiFyi"></a>

###### Sample Code

```java
package org.apache.dubbo.rest.demo;

import org.apache.dubbo.remoting.http12.rest.Mapping;
import org.apache.dubbo.remoting.http12.rest.Param;

// Service Interface
public interface DemoService {
    String hello(String name);

    @Mapping(path = "/hi", method = HttpMethods.POST)
    String hello(User user, @Param(value = "c", type = ParamType.Header) int count);
}

// Service Implementation
@DubboService
public class DemoServiceImpl implements DemoService {
    @Override
    public String hello(String name) {
        return "Hello " + name;
    }

    @Override
    public String hello(User user, int count) {
        return "Hello " + user.getTitle() + ". " + user.getName() + ", " + count;
    }
}

// Model
@Data
public class User {
    private String title;
    private String name;
}
```

<a name="kZqN8"></a>

###### Download and Run Example

```bash
# Get the example code
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic
# Run
mvn spring-boot:run
```

<a name="udlJN"></a>

###### Curl Test

```bash
curl -v "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hello?name=world"
# Output
#> GET /org.apache.dubbo.rest.demo.DemoService/hello?name=world HTTP/1.1
#>
#< HTTP/1.1 200 OK
#< content-type: application/json
#< content-length: 13
#<
#"Hello world"
#
# Explanation
# The output shows "Hello world", with quotes because the default content-type is application/json.
# This example shows that Triple exports services to the /{serviceInterface}/{methodName} path by default, supporting parameter passing via URL.

curl -v -H "c: 3" -d 'name=Yang' "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr"
# Output
#> POST /org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr HTTP/1.1
#> c: 3
#> Content-Length: 9
#> Content-Type: application/x-www-form-urlencoded
#>
#< HTTP/1.1 200 OK
#< content-type: text/plain
#< content-length: 17
#<
#Hello Mr. Yang, 3
#
# Explanation
# The output shows "Hello Mr. Yang, 3", without quotes because the output was specified as text/plain by using the txt suffix.
# This example shows how to customize paths using the Mapping annotation and customize parameter sources using the Param annotation, supporting parameter passing via post body or URL.
```

<a name="apMqg"></a>

### Documentation

Please visit the user manual: [Triple Rest Manual](../triple-rest-manual/)
<a name="pMgxF"></a>

## Support for Servlet Integration

In version 3.3, you can reuse existing Spring Boot servlet listening ports to handle HTTP traffic, eliminating the need for Netty to listen on new ports. This simplifies deployment
and reduces maintenance costs. By reducing reliance on external ports, it helps to easily pass through enterprise firewalls and gateways, simplifying network deployment and
enhancing the maintainability and security of enterprise applications.
<a name="n9HZO"></a>

### Example

<a name="qP23R"></a>

###### Download and Run Example

```bash
# Get the sample code
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-servlet
# Run directly
mvn spring-boot:run
```

<a name="RuppW"></a>

###### Curl Test

```shell
curl --http2-prior-knowledge -v 'http://localhost:50052/org.apache.dubbo.demo.GreeterService/sayHelloAsync?request=world'
# Output
#* [HTTP/2] [1] OPENED stream for http://localhost:50052/org.apache.dubbo.demo.GreeterService/sayHelloAsync?request=world
#* [HTTP/2] [1] [:method: GET]
#* [HTTP/2] [1] [:scheme: http]
#* [HTTP/2] [1] [:authority: localhost:50052]
#* [HTTP/2] [1] [:path: /org.apache.dubbo.demo.GreeterService/sayHelloAsync?request=world]
#>
#* Request completely sent off
#< HTTP/2 200
#< content-type: application/json
#< date: Sun, 25 Aug 2024 03:38:12 GMT
#<
#"Hello world"
```

<a name="mC3d4"></a>

### Documentation

Please
visit: [how-to-enable-servlet-support-for-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-servlet#how-to-enable-servlet-support-for-triple)
to learn how to configure and enable servlet support.
<a name="uvvts"></a>

## Support for HTTP/3 Protocol

<a name="anV9K"></a>

### HTTP/3 Features

In version 3.3, Triple implements support for the HTTP/3 protocol, allowing RPC and REST requests to be transmitted via HTTP/3. Using HTTP/3 offers the following benefits:

- **Enhanced Performance**  
  With HTTP/3 support, the use of the QUIC protocol reduces latency and accelerates request-response times. This significantly boosts overall service
  performance, especially in high-latency or complex network environments.
- **Improved Reliability**  
  HTTP/3 leverages multiplexing and connection migration to avoid head-of-line blocking, maintaining stable connections even under poor network conditions
  and ensuring reliable service delivery.
- **Increased Security**  
  HTTP/3 enforces TLS 1.3 encryption, providing a more secure communication channel compared to the optional encryption in traditional HTTP/2.
- **Better Adaptation to Weak Networks**  
  In scenarios with high packet loss or unstable bandwidth, HTTP/3 maintains high connection quality and service performance, improving
  outcomes in weak network environments.

Since HTTP/3 is based on the QUIC protocol (UDP), it might be blocked by firewalls or gateways. To mitigate this, Triple has implemented HTTP/3 negotiation capabilities and enabled
it by default. Connections are initially established via HTTP/2, and if the server responds with an [Alt-Svc](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Alt-Svc)
header indicating HTTP/3 support, the client will automatically switch to HTTP/3.
<a name="TqXgf"></a>

### Example

<a name="oSP0r"></a>

###### Download and Run Example

```bash
# Get the sample code
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-http3
# Run directly
mvn spring-boot:run
```

<a name="fb4sX"></a>

###### Testing with Curl

Note that Curl must be upgraded to a version that supports HTTP/3. Refer to: [https://curl.se/docs/http3.html](https://curl.se/docs/http3.html).

```shell

curl --http3 -vk 'https://localhost:50052/org.apache.dubbo.demo.GreeterService/sayHelloAsync?request=world'
# Output
#* QUIC cipher selection: TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_CCM_SHA256
#* Skipped certificate verification
#* using HTTP/3
#* [HTTP/3] [0] OPENED stream for https://localhost:50052/org.apache.dubbo.demo.GreeterService/sayHelloAsync?request=world
#* [HTTP/3] [0] [:method: GET]
#* [HTTP/3] [0] [:scheme: https]
#* [HTTP/3] [0] [:authority: localhost:50052]
#* [HTTP/3] [0] [:path: /org.apache.dubbo.demo.GreeterService/sayHelloAsync?request=world]
#>
#* Request completely sent off
#< HTTP/3 200
#< content-type: application/json
#<
#"Hello world"
```

<a name="A7a3w"></a>

### Performance Comparison

#### Impact of Packet Loss on QPS

![http3-qps.jpg](/imgs/v3/manual/java/protocol/http3-qps.jpg)

#### Impact of Packet Loss on RT

![http3-rt.jpg](/imgs/v3/manual/java/protocol/http3-rt.jpg)

<a name="NIoKX"></a>

### Architecture Diagram

![http3-arch.jpg](/imgs/v3/manual/java/protocol/http3-arch.jpg)

### Documentation

For information on how to configure and enable HTTP/3 support, please
visit: [how-to-enable-http3-support-for-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-http3#how-to-enable-http3-support-for-triple).
