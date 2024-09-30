---
aliases:
  - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/3.3/
  - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/3.3/
description: "This article introduces the new features of the triple protocol in version 3.3."
linkTitle: New Features of Tripe 3.3
title: New Features of Tripe 3.3
type: docs
weight: 5
---

<a name="lipv5"></a>

## Brand New REST Support

<a name="BrKuK"></a>

### Features

In version 3.3, based on the existing HTTP protocol stack, triple implements comprehensive REST-style service export capabilities without the need for generic or gateway layer protocol conversion. Users can directly access backend Triple protocol services via HTTP protocol in a decentralized manner without configuration. It provides rich annotations and SPI extension support for advanced REST usage such as path customization, output format customization, and exception handling. Its main features include:

- **Triple Protocol Integration**  
  Reuses the existing HTTP protocol stack of Triple, requiring no extra configuration or new ports, supporting access to HTTP/1, HTTP/2, and HTTP/3 protocols simultaneously.
- **Decentralization**  
  Can expose REST APIs directly without relying on gateway applications for traffic forwarding, thus improving performance and reducing stability risks caused by gateways. Security issues can be resolved through internal application extensions, a practice validated in Taobao's MTOP.
- **Support Existing Servlet Facilities**  
  Supports Servlet API and Filter, allowing users to reuse existing security components based on Servlet API. By implementing a Servlet Filter, it can integrate security frameworks like OAuth and Spring Security.
- **Multiple Dialects**  
  Considering that most users prefer using SpringMVC or JAX-RS for REST API development, Triple REST allows continued use of these methods to define services and supports most extension and exception handling mechanisms (with over 80% of the functionality of the original framework). For users pursuing lightweight options, the Basic dialect can be used; the out-of-the-box REST access capability of Triple is based on this dialect.
- **Strong Extendability**  
  Offers more than 20 extension points, enabling users to easily implement custom dialects and flexibly customize logic for parameter acquisition, type conversion, and error handling.
- **Out-of-the-Box**  
  REST capability is ready to use out of the box; simply enabling the Triple protocol provides REST direct access to services.
- **High-Performance Routing**  
  The routing part adopts optimized [Radix Tree](https://github.com/apache/dubbo/blob/3.3/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/RadixTree.java) and Zero Copy technologies, enhancing routing performance.
- **Seamless Integration with OpenAPI (TBD)**  
  OpenAPI integration will be completed soon, providing an out-of-the-box support for exporting OpenAPI Schema. By introducing Swagger dependencies, services can be tested directly using the Web UI. With OpenAPI Schema, API tools like [Postman](https://www.postman.com/) and [Apifox](https://apifox.com/) can be used to manage and test APIs; leveraging the OpenAPI ecosystem allows for easy cross-language calls. Future support for Schema First will be further advanced, allowing the front-end team to define OpenAPI together and generate calling code and mocks based on OpenAPI while the back-end generates stubs for service development, greatly enhancing collaborative efficiency.
  <a name="eyypL"></a>

### Example

<a name="tiFyi"></a>

###### Example Code

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

###### curl Test

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
# Code Explanation
# You can see the output "Hello world", the double quotes are because the default output content-type is application/json.
# This example shows that Triple defaults to exporting services to /{serviceInterface}/{methodName} paths, supporting parameter passing via URL.

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
# Code Explanation
# You can see the output Hello Mr. Yang, 3, without double quotes because the suffix txt requires a text/plain output.
# This example demonstrates how to customize paths with the Mapping annotation and the source of parameters with the Param annotation, which supports parameter passing through post body or URL.
```

<a name="apMqg"></a>

### Detailed Documentation

Please refer to the user manual: [Tripe Rest Manual](../tripe-rest-manual/)
<a name="pMgxF"></a>

## Support for Servlet Access

In version 3.3, reusable Spring Boot servlet listening ports can access HTTP traffic without Netty listening on new ports, simplifying deployment and reducing maintenance costs. By reducing reliance on external ports, it helps easily pass through corporate firewalls and gateways, simplifying network deployment and enhancing the maintainability and security of enterprise applications.
<a name="n9HZO"></a>

### Example

<a name="qP23R"></a>

###### Download and Run Example

```bash
# Get example code
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-servlet
# Run directly
mvn spring-boot:run
```

<a name="RuppW"></a>

###### curl Test

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

### Detailed Documentation

Please visit: [how-to-enable-servlet-support-for-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-servlet#how-to-enable-servlet-support-for-triple) to learn how to configure and enable servlet support.

<a name="uvvts"></a>

## Support for HTTP/3 Protocol

<a name="anV9K"></a>

### Features

In version 3.3, triple implements support for the HTTP/3 protocol, allowing both RPC requests and REST requests to be transmitted via the HTTP/3 protocol. Using HTTP/3 offers the following benefits:

- **Performance Improvement**  
  With HTTP/3 support, latency is reduced using the QUIC protocol, speeding up request response times, especially in high-latency or complex network environments, significantly enhancing overall service performance.
- **Enhanced Reliability**  
  HTTP/3 avoids head-of-line blocking through multiplexing and connection migration, maintaining connection stability even in poor network conditions, ensuring reliable service delivery.
- **Improved Security**  
  HTTP/3 mandates TLS1.3 encryption, providing more secure communication guarantees compared to the optional encryption of traditional HTTP/2.
- **Adaptation to Weak Network Environments**  
  In conditions of high packet loss or unstable bandwidth, HTTP/3 can maintain high connection quality and service performance, improving performance in weak network environments.

Since HTTP/3 is based on the QUIC protocol (UDP), it may be blocked by firewalls or gateways. Therefore, triple implements HTTP/3 negotiation capabilities and enables them by default. Connections are first established via HTTP/2, and if successful and the server returns a header indicating support for HTTP/3, the client will automatically switch to HTTP/3.

<a name="TqXgf"></a>

### Example

<a name="oSP0r"></a>

###### Download and Run Example

```bash
# Get example code
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-http3
# Run directly
mvn spring-boot:run
```

<a name="fb4sX"></a>

###### curl Test

Note that curl needs to be updated to a new version that supports HTTP/3, see: [https://curl.se/docs/http3.html](https://curl.se/docs/http3.html)

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

#### Impact of Packet Loss Rate on QPS

![http3-qps.jpg](/imgs/v3/manual/java/protocol/http3-qps.jpg)

#### Impact of Packet Loss Rate on RT

![http3-rt.jpg](/imgs/v3/manual/java/protocol/http3-rt.jpg)

<a name="NIoKX"></a>

### Architecture Diagram

![http3-arch.jpg](/imgs/v3/manual/java/protocol/http3-arch.jpg)

### Detailed Documentation

Please visit: [how-to-enable-http3-support-for-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-http3#how-to-enable-http3-support-for-triple) to learn how to configure and enable HTTP/3 support.
