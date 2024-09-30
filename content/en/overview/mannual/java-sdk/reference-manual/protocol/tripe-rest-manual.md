---
aliases:
  - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/rest/manual/
  - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/rest/manual/
  - /en/overview/mannual/java-sdk/reference-manual/protocol/rest/
  - /en/overview/mannual/java-sdk/reference-manual/protocol/http/
description: "This article is the user manual for Triple Rest"
linkTitle: Triple Rest User Manual
title: Triple Rest User Manual
type: docs
weight: 7
---

{{% alert title="Note" color="warning" %}}
Starting from Dubbo version 3.3, the original Rest protocol has been moved to the Extensions library, with the Triple protocol providing more comprehensive support for Rest. If you need to continue using the original Rest protocol, you can introduce the corresponding [dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-rpc-extensions/dubbo-rpc-rest) library dependency.
{{% /alert %}}

## Introduction

Since the Dubbo version 3.3, the Triple protocol reuses the existing HTTP protocol stack, achieving comprehensive REST-style service export capabilities. Users can decentralize directly to access backend Triple protocol services via HTTP protocol without using generic or gateway layer protocol conversion or configuration. Additionally, rich annotations and SPI extension support is provided for advanced REST usage, such as path customization, output format customization, and exception handling. Key features include:

- **Triple Protocol Integration**  
  Reuses the existing Triple HTTP protocol stack, requiring no additional configuration or new ports to simultaneously support HTTP/1, HTTP/2, and HTTP/3 protocols.

- **Decentralization**  
  Allows direct exposure of REST APIs without relying on gateway applications for traffic forwarding, thereby improving performance and reducing stability risks caused by gateways. Security issues can be resolved through internal application extensions, a practice already validated within Taobao's MTOP.

- **Support for Existing Servlet Facilities**  
  Supports Servlet API and Filters, allowing users to reuse existing security components based on the Servlet API. Integration with security frameworks like OAuth and Spring Security can be easily achieved by implementing a Servlet Filter.

- **Multiple Dialects**  
  Considering that most users are accustomed to using SpringMVC or JAX-RS for REST API development, Triple Rest allows for continued use of these methods to define services and supports most of the extensions and exception handling mechanisms (providing more than 80% of the functionality of the original framework). For users pursuing a lightweight solution, the Basic dialect can be used. The out-of-the-box REST access capability of Triple is based on this dialect for service exposure.

- **Strong Extensibility**  
  Provides more than 20 extension points, enabling users to not only easily create custom dialects but also flexibly customize parameter retrieval, type conversion, error handling, and other logic.

- **Out-of-the-Box**  
  REST capabilities are available out-of-the-box; by simply enabling the Triple protocol, you gain direct REST service access capabilities.

- **High-Performance Routing**  
  Uses an optimized [Radix Tree](https://github.com/apache/dubbo/blob/3.3/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/RadixTree.java) and Zero Copy technology to enhance routing performance.

- **Seamless OpenAPI Integration (TBD)**  
  OpenAPI integration is nearing completion, providing support for exporting OpenAPI Schemas out-of-the-box. By introducing the Swagger dependency, you can use a web UI for service testing. With OpenAPI Schema, tools like [Postman](https://www.postman.com/) and [Apifox](https://apifox.com/) can be used to manage and test APIs, enabling easy cross-language calls through the OpenAPI ecosystem. In the future, further support for the Schema-First approach will be implemented, allowing teams to first define OpenAPI together with frontend teams. The frontend can generate calling code and mocks based on OpenAPI, while the backend uses OpenAPI to generate stubs for service development, greatly improving collaboration efficiency.

## Quick Start

Let's start with a simple example to understand Triple Rest. You can directly download existing sample projects to get started quickly, assuming you have Java, Maven, and Git installed.

### Download and Run Sample

```bash
# Get sample code
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic
# Run directly
mvn spring-boot:run
# Or package and run
mvn clean package -DskipTests
java -jar target/dubbo-samples-triple-rest-basic-1.0.0-SNAPSHOT.jar
```

Of course, you can also import the project directly using an IDE and execute `org.apache.dubbo.rest.demo.BasicRestApplication#main` to run.

### Sample Code

```java
// Service Interface
package org.apache.dubbo.rest.demo;

import org.apache.dubbo.remoting.http12.rest.Mapping;
import org.apache.dubbo.remoting.http12.rest.Param;

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

### Test Basic Service

```bash
curl -v "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hello?name=world"
# Output as follows
#> GET /org.apache.dubbo.rest.demo.DemoService/hello?name=world HTTP/1.1
#> Host: 127.0.0.1:8081
#> User-Agent: curl/8.7.1
#> Accept: */*
#>
#* Request completely sent off
#< HTTP/1.1 200 OK
#< content-type: application/json
#< alt-svc: h2=":8081"
#< content-length: 13
#<
#"Hello world"
```

Code Explanation: <br> You can see the output "Hello world". The double quotes are due to the default output content-type being application/json.<br> This example demonstrates that Triple by default exports services to `/{serviceInterface}/{methodName}` and supports passing parameters via URL. 
<a name="vSW6b"></a>

### Test Advanced Service

```bash
curl -v -H "c: 3" -d 'name=Yang' "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr"
# Output as follows
#> POST /org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr HTTP/1.1
#> Host: 127.0.0.1:8081
#> User-Agent: curl/8.7.1
#> Accept: */*
#> c: 3
#> Content-Length: 9
#> Content-Type: application/x-www-form-urlencoded
#>
#* upload completely sent off: 9 bytes
#< HTTP/1.1 200 OK
#< content-type: text/plain
#< alt-svc: h2=":8081"
#< content-length: 17
#<
#Hello Mr. Yang, 3
```

Code Explanation: <br> You can see the output Hello Mr. Yang, 3. The absence of double quotes is because the output is specified as `text/plain` due to the use of the .txt suffix.<br> This example illustrates how to customize paths using the Mapping annotation, which allows for the customization of parameter sources, and supports passing parameters through post body or URL. For detailed explanations, see: [Basic Usage Guide](#GdlnC).
<a name="KNfuq"></a>

### Log Observation

You can enable debug logging to understand the startup and response request process of REST.

```yaml
logging:
  level:
    "org.apache.dubbo.rpc.protocol.tri": debug
    "org.apache.dubbo.remoting": debug
```

Once enabled, you can observe the Rest mapping registration and request response process.

```
# Register mapping
DEBUG o.a.d.r.p.t.TripleProtocol               :  [DUBBO] Register triple grpc mapping: 'org.apache.dubbo.rest.demo.DemoService' -> invoker[tri://192.168.2.216:8081/org.apache.dubbo.rest.demo.DemoService]
 INFO .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] BasicRequestMappingResolver resolving rest mappings for ServiceMeta{interface=org.apache.dubbo.rest.demo.DemoService, service=DemoServiceImpl@2a8f6e6} at url [tri://192.168.2.216:8081/org.apache.dubbo.rest.demo.DemoService]
DEBUG .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Register rest mapping: '/org.apache.dubbo.rest.demo.DemoService/hi' -> mapping=RequestMapping{name='DemoServiceImpl#hello', path=PathCondition{paths=[org.apache.dubbo.rest.demo.DemoService/hi]}, methods=MethodsCondition{methods=[POST]}}, method=MethodMeta{method=org.apache.dubbo.rest.demo.DemoService.hello(User, int), service=DemoServiceImpl@2a8f6e6}
DEBUG .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Register rest mapping: '/org.apache.dubbo.rest.demo.DemoService/hello' -> mapping=RequestMapping{name='DemoServiceImpl#hello~S', path=PathCondition{paths=[org.apache.dubbo.rest.demo.DemoService/hello]}}, method=MethodMeta{method=org.apache.dubbo.rest.demo.DemoService.hello(String), service=DemoServiceImpl@2a8f6e6}
 INFO .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Registered 2 REST mappings for service [DemoServiceImpl@44627686] at url [tri://192.168.2.216:8081/org.apache.dubbo.rest.demo.DemoService] in 11ms

# Request Response
DEBUG .a.d.r.p.t.r.m.RestRequestHandlerMapping :  [DUBBO] Received http request: DefaultHttpRequest{method='POST', uri='/org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr', contentType='application/x-www-form-urlencoded'}
DEBUG .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Matched rest mapping=RequestMapping{name='DemoServiceImpl#hello', path=PathCondition{paths=[/org.apache.dubbo.rest.demo.DemoService/hi]}, methods=MethodsCondition{methods=[POST]}}, method=MethodMeta{method=org.apache.dubbo.rest.demo.DemoService.hello(User, int), service=DemoServiceImpl@2a8f6e6}
DEBUG .a.d.r.p.t.r.m.RestRequestHandlerMapping :  [DUBBO] Content-type negotiate result: request='application/x-www-form-urlencoded', response='text/plain'
DEBUG .d.r.h.AbstractServerHttpChannelObserver :  [DUBBO] Http response body is: '"Hello Mr. Yang, 3"'
DEBUG .d.r.h.AbstractServerHttpChannelObserver :  [DUBBO] Http response headers sent: {:status=[200], content-type=[text/plain], alt-svc=[h2=":8081"], content-length=[17]}
```

<a name="hx06z"></a>

## General Functionality

<a name="Q6XyG"></a>

### Path Mapping

Compatible with SpringMVC and JAX-RS mapping methods. Relevant documentation:

- [Spring Mapping Requests](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html#mvc-ann-requestmapping-uri-templates)
- [Spring PathPattern](https://docs.spring.io/spring-framework/docs/6.1.12/javadoc-api/org/springframework/web/util/pattern/PathPattern.html)
- [Spring AntPathMatcher](https://docs.spring.io/spring-framework/docs/6.1.12/javadoc-api/org/springframework/util/AntPathMatcher.html)
- [JAX-RS Path and regular expression mappings](https://docs.jboss.org/resteasy/docs/6.2.7.Final/userguide/html/ch04.html)

It also supports custom path mapping through the SPI `org.apache.dubbo.rpc.protocol.tri.rest.mapping.RequestMappingResolver`.
<a name="DGIWw"></a>

#### Supported Patterns

1. `books`: String constant, the most basic type, matches a fixed segment.
2. `?`: Matches a single character.
3. `*`: Matches zero or more characters in a path segment.
4. `**`: Matches zero or more path segments until the end of the path.
5. `{spring}`: Matches a path segment and captures it as a variable named "spring".
6. `{spring:[a-z]+}`: Matches a path segment using the regex `[a-z]+` and captures it as a path variable named "spring".
7. `{*spring}`: Matches zero or more path segments until the end, capturing them as a variable named "spring"; if written as `{*}`, it indicates no capture.
   <a name="jXGEY"></a>

#### Examples (from Spring documentation)

- `/pages/t?st.html` — Matches `/pages/test.html` and `/pages/tXst.html`, but not `/pages/toast.html`.
- `/resources/*.png` — Matches all `.png` files in the resources directory.
- `com/**/test.jsp` — Matches all `test.jsp` files under the `com` path.
- `org/springframework/**/*.jsp` — Matches all `.jsp` files under the `org/springframework` path.
- `/resources/**` — Matches all files under the `/resources/` path, including `/resources/image.png` and `/resources/css/spring.css`.
- `/resources/{*path}` — Matches all files under `/resources/` and captures their relative paths in a variable named "path".
- `/resources/{filename:\\w+}.dat` — Matches `/resources/spring.dat` and assigns "spring" to the `filename` variable.
- `/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}` — Matches `/example-2.1.5.html` where `name` is `example`, `version` is `2.1.5`, and `ext` is `.html`.

A little tip: if you use regex and want to avoid crossing segments, you can use `{name:[^/]+}` to match.
<a name="JK47X"></a>

#### Complete Process of Mapping Matching

The specific matching processing code: [DefaultRequestMappingRegistry.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/DefaultRequestMappingRegistry.java#L196) [RequestMapping.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/RequestMapping.java#L127)

1. Use `PathUtils.normalize` to clean the path, removing indirect paths such as `/one/../` and ensuring it starts with `/`.
2. Check if the `http method` matches.
3. Check if the `path` matches.
4. Check if the `parameter` matches (JAX-RS does not support this).
5. Check if the `header` matches.
6. Check if the `content-type` matches (Consumes).
7. Check if the `accept` matches (Produces).
8. Check if the `serviceGroup` and `serviceVersion` match.
9. Check if the `method` initial signature matches.
10. If no matches were found and tailing `/` matching is enabled, try removing the tailing `/` to see if it matches from step 2.
11. If no matches were found, and suffix matching is enabled and supported, try removing the suffix to see if it matches from step 2.
12. If the last path segment contains `~`, indicating initial method signature matching is enabled, try matching from step 2.
13. If there are zero candidates, the matching ends and returns null.
14. If there are candidates, the matching ends and returns the hit item.
15. If more than one candidate, sort the candidates.
16. Perform sequential comparison between the first and second items.
17. A result of 0 indicates the final match cannot be confirmed, throwing an exception.
18. If the first item wins, match ends and return the hit item.
    <a name="dkeSI"></a>

#### Path Duplication Issue

Unlike Spring, which reports errors and prevents startup when paths are identical, Triple Rest has out-of-the-box characteristics. To avoid affecting existing services, by default it only logs WARN messages. At runtime, if it cannot ultimately determine the highest priority mapping, it throws an error.
<a name="kmCzf"></a>

### Parameter Types

Different dialects support different parameter types; details can be found in various dialect user guides.<br> It also supports custom parameter parsing by implementing the SPI `org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver`.
<a name="dCgzz"></a>

#### General Type Parameters

| Name             | Description             | Basic Annotation             | SpringMVC Annotation | JAX-RS Annotation | Array/Collection Handling | Map Handling          |
|------------------|-------------------------|--------------------|-------------------|--------------|----------------|------------------|
| Param            | Query or Form parameter | @Param              | @RequestParam     | -            | Multi-value       | All params as Map      |
| Query            | URL parameters          | -                     | -                 | @QueryParam  | Multi-value       | All Query params as Map |
| Form             | Form parameters         | -                     | -                 | @FormParam   | Multi-value       | All Form params as Map  |
| Header           | HTTP header             | @Param(type=Header) | @RequestHeader    | @HeaderParam | Multi-value       | All Header params as Map |
| Cookie           | Cookie values           | @Param(type=Cookie) | @CookieValue      | @CookieParam | Multi-value       | All Cookie params as Map  |
| Attribute        | Request attribute       | @Param(type=Attribute)| @RequestAttribute | -            | Multi-value       | All Attributes as Map |
| Part             | Multipart file          | @Param(type=Part)   | @RequestHeader    | @HeaderParam | Multi-value       | All Parts as Map       |
| Body             | Request body            | @Param(type=Body)   | @RequestBody      | @Body        | Attempt to parse as array or collection | Attempt to parse to target type  |
| PathVariable     | Path variable           | @Param(type=PathVariable)| @PathVariable   | @PathParam   | Single-value array or collection | Single-value Map         |
| MatrixVariable   | Matrix variable         | @Param(type=MatrixVariable)| @MatrixVariable | @MatrixParam | Multi-value      | Single-value Map          |
| Bean             | Java bean              | No annotation        | @ModelAttribute   | @BeanParam   | Attempt to parse as Bean array or collection | -                      |

<a name="fjYQ8"></a>

#### Special Type Parameters

| Type                                            | Description             | Activation Condition       |
|------------------------------------------------|---------------------------|-------------------|
| org.apache.dubbo.remoting.http12.HttpRequest   | HttpRequest object        | Default activated              |
| org.apache.dubbo.remoting.http12.HttpResponse  | HttpResponse object       | Default activated                |
| org.apache.dubbo.remoting.http12.HttpMethods   | Request Http method       | Default activated               |
| java.util.Locale                                | Request Locale            | Default activated                |
| java.io.InputStream                             | Request Input stream      | Default activated                |
| java.io.OutputStream                            | Response Output stream    | Default activated                |
| javax.servlet.http.HttpServletRequest           | Servlet HttpRequest object | Include Servlet API jar       |
| javax.servlet.http.HttpServletResponse          | Servlet HttpResponse object| Same as above                |
| javax.servlet.http.HttpSession                  | Servlet HttpSession object | Same as above                |
| javax.servlet.http.Cookie                       | Servlet Cookie object      | Same as above                |
| java.io.Reader                                  | Servlet Request Reader object | Same as above            |
| java.io.Writer                                  | Servlet Response Writer object | Same as above          |

<a name="zS6y1"></a>

#### Parameters Without Annotations

Different dialects handle this differently; please refer to each dialect's user instructions.
<a name="MikXl"></a>

#### Accessing HTTP Input and Output Parameters Without Parameters

You can access them via `RpcContext`.

```java
// Dubbo http req/resp
HttpRequest request = RpcContext.getServiceContext().getRequest(HttpRequest.class);
HttpResponse response = RpcContext.getServiceContext().getRequest(HttpResponse.class);
// Servlet http req/resp
HttpServletRequest request = RpcContext.getServiceContext().getRequest(HttpServletRequest.class);
HttpServletResponse response = RpcContext.getServiceContext().getRequest(HttpServletResponse.class);
```

After obtaining the request, you can access some built-in attributes through attributes; see: [RestConstants.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/RestConstants.java#L40).
<a name="I56vX"></a>

### Parameter Type Conversion

By default, most parameter type conversions from String to target type are supported, including the following major categories:

- Java built-in types, including primitive types and dates, Optionals, etc.
- Array types
- Collection types
- Map types

It fully supports generic types, including complex nesting. For specific implementation code, see: [GeneralTypeConverter.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/argument/GeneralTypeConverter.java). <br> It also supports custom parameter type conversion by implementing the SPI `org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentConverter`.

| Source Type  | Target Type                | Description                 | Default Value |
|--------------|-----------------------------|-----------------------------|---------------|
| `String`     | `double`                   | Converts to a double        | 0.0d          |
| `String`     | `float`                    | Converts to a float         | 0.0f          |
| `String`     | `long`                     | Converts to a long          | 0L            |
| `String`     | `int`                      | Converts to an integer      | 0             |
| `String`     | `short`                    | Converts to a short         | 0             |
| `String`     | `char`                     | Converts to a character     | 0             |
| `String`     | `byte`                     | Converts to a byte          | 0             |
| `String`     | `boolean`                  | Converts to a boolean       | false         |
| `String`     | `BigInteger`               | Converts to a BigInteger    | null          |
| `String`     | `BigDecimal`               | Converts to a BigDecimal    | null          |
| `String`     | `Date`                     | Converts to a Date          | null          |
| `String`     | `Calendar`                 | Converts to a Calendar      | null          |
| `String`     | `Timestamp`                | Converts to a Timestamp     | null          |
| `String`     | `Instant`                  | Converts to an Instant      | null          |
| `String`     | `ZonedDateTime`            | Converts to a ZonedDateTime | null          |
| `String`     | `LocalDate`                | Converts to a LocalDate     | null          |
| `String`     | `LocalTime`                | Converts to a LocalTime     | null          |
| `String`     | `LocalDateTime`            | Converts to a LocalDateTime | null          |
| `String`     | `ZoneId`                   | Converts to a ZoneId        | null          |
| `String`     | `TimeZone`                 | Converts to a TimeZone      | null          |
| `String`     | `File`                     | Converts to a File          | null          |
| `String`     | `Path`                     | Converts to a Path          | null          |
| `String`     | `Charset`                  | Converts to a Charset       | null          |
| `String`     | `InetAddress`              | Converts to an InetAddress  | null          |
| `String`     | `URI`                      | Converts to a URI           | null          |
| `String`     | `URL`                      | Converts to a URL           | null          |
| `String`     | `UUID`                     | Converts to a UUID          | null          |
| `String`     | `Locale`                   | Converts to a Locale        | null          |
| `String`     | `Currency`                 | Converts to a Currency      | null          |
| `String`     | `Pattern`                  | Converts to a Pattern       | null          |
| `String`     | `Class`                    | Converts to a Class         | null          |
| `String`     | `byte[]`                   | Converts to a byte array    | null          |
| `String`     | `char[]`                   | Converts to a char array    | null          |
| `String`     | `OptionalInt`              | Converts to an OptionalInt  | null          |
| `String`     | `OptionalLong`             | Converts to an OptionalLong | null          |
| `String`     | `OptionalDouble`           | Converts to an OptionalDouble| null          |
| `String`     | `Enum class`               | Enum.valueOf                | null          |
| `String`     | `Array` or `Collection`    | Split by comma              | null          |
| `String`     | `Specified class`          | Try JSON String to Object    | null          |
| `String`     | `Specified class`          | Try construct with single String | null          |
| `String`     | `Specified class`          | Try call static method `valueOf` | null          |

<a name="VxFtB"></a>

### Supported Content-Type

By default, the following Content-Type is supported, providing corresponding encoding and decoding functionality. <br> It also supports extending by implementing the SPI `org.apache.dubbo.remoting.http12.message.(HttpMessageDecoderFactory|HttpMessageEncoderFactory)`.

| Media Type                             | Description              |
|----------------------------------------|--------------------------|
| `application/json`                     | JSON format              |
| `application/xml`                      | XML format               |
| `application/yaml`                     | YAML format              |
| `application/octet-stream`             | Binary data              |
| `application/grpc`                     | gRPC format              |
| `application/grpc+proto`               | gRPC with Protocol Buffers|
| `application/x-www-form-urlencoded`    | URL-encoded form data    |
| `multipart/form-data`                  | Form data with file upload|
| `text/json`                            | JSON format as text      |
| `text/xml`                             | XML format as text       |
| `text/yaml`                            | YAML format as text      |
| `text/css`                             | CSS format               |
| `text/javascript`                      | JavaScript format as text |
| `text/html`                            | HTML format              |
| `text/plain`                           | Plain text               |

<a name="qbOvN"></a>

### Content Negotiation

Supports a complete content negotiation mechanism, which can negotiate the output Content-Type based on mappings or input, with the following process:

1. Try to read mediaType specified by the Mapping, obtaining the list of mediaTypes specified by Produces, and wildcard matching to suitable Media Type. For example, Spring's: `@RequestMapping(produces = "application/json")`.
2. Try to find mediaType through the Accept header, parsing the incoming `Accept` header and wildcard matching to suitable Media Type. For example: `Accept: application/json`.
3. Try to find mediaType through format parameter, reading format parameter values to match suitable Media Type as file suffix. For example `/hello?format=yml`.
4. Try to find mediaType through the extension of the request path, matching the suffix as a file extension suitable Media Type. For example `/hello.txt`.
5. Try to read the Content-Type header of the request as Media Type (excluding form types). For example `Content-Type: application/json`.
6. Use `application/json` as fallback.
   <a name="DtUnB"></a>

### CORS Support

Provides complete CORS support, which can be enabled by configuring global parameters; the default behavior is consistent with SpringMVC. Additionally, in SpringMVC dialects, there is support for fine-tuned configuration through `@CrossOrigin`. <br> Supported CORS configuration items can be referred to: [8.4 CORS Configuration](#NLQqj).
<a name="O4KNd"></a>

### Custom HTTP Output

Many scenarios require custom HTTP output, such as performing 302 redirects or writing HTTP headers. For this, Triple Rest provides the following generic solutions and also supports specific methods in various dialects. Please refer to the respective dialect user guides.

- Set the return value to: `org.apache.dubbo.remoting.http12.HttpResult`; you can build via `HttpResult#builder`.
- Throw Payload exception: `throw new org.apache.dubbo.remoting.http12.exception.HttpResultPayloadException(HttpResult)` Example code:

```java
throw new HttpResult.found("https://a.com").toPayload();
```

This exception avoids filling erroneous stack traces, has little impact on performance, and does not require considering return value logic; this method is recommended for customizing output.

- Obtain HttpResponse and customize, example code:

```java
HttpResponse response = RpcContext.getServiceContext().getRequest(HttpResponse.class);

response.sendRedirect("https://a.com");
response.setStatus(404);
response.outputStream().write(data);
// It is recommended to call commit after writing to avoid being overridden by other extensions
response.commit();
```

If only adding `http header`, this method is recommended.
<a name="OlLbS"></a>

### Custom JSON Parsing and Output

Supports various JSON frameworks such as Jackson, fastjson2, fastjson, and gson etc.; please ensure that the corresponding jar dependencies are included before use.

#### Specify the JSON Framework to Use
```properties
dubbo.protocol.triple.rest.json-framework=jackson
```

#### Customize using JsonUtil SPI
You can customize JSON handling by implementing the SPI `org.apache.dubbo.common.json.JsonUtil`; specific implementations can be referenced from [org/apache/dubbo/common/json/impl](https://github.com/apache/dubbo/tree/3.3/dubbo-common/src/main/java/org/apache/dubbo/common/json/impl). It is recommended to inherit existing implementations and override them.
<a name="XeDPr"></a>

### Exception Handling

Unhandled exceptions are ultimately converted into the encoded `ErrorResponse` class and output:

```java
@Data
public class ErrorResponse {
    /**
     * http status code
     */
    private String status;

    /**
     * exception message
     */
    private String message;
}
```

Note: For errors 500 and above, to avoid leaking internal server information, only the message "Internal Server Error" will be output by default. If you need to customize the message, create a custom exception inheriting from `org.apache.dubbo.remoting.http12.exception.HttpStatusException` and override the `getDisplayMessage` method.<br> The following utilities are provided for customizing exception handling:

- Refer to [9.2 Custom Exception Return Results](#zFD9A) for using SPI to customize global exception handling.
- Use Dubbo's Filter SPI to process and convert exceptions; if access to the Http context is needed, inherit `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilterAdapter`.
- Use the SPI `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilter` to convert exceptions; this is lightweight and provides path-matching capabilities.

Note: The last two methods can only intercept exceptions occurring in the invoke chain; if an exception occurs during the path-matching stage, only method 1 can handle it.
<a name="GdlnC"></a>

## Basic Usage Guide

See examples: [dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic).
<a name="yCnsD"></a>

### Path Mapping

Basic, as an out-of-the-box REST mapping, will default to map methods to: `/{contextPath}/{serviceInterface}/{methodName}`. If 
`/{contextPath}` is not configured, it will be ignored, thus resulting in: `/{serviceInterface}/{methodName}`.<br> Custom mapping is supported through the annotation `org.apache.dubbo.remoting.http12.rest.Mapping`, with the following property descriptions:

| Configuration Name | Description                                                       | Default Behavior    |
|-------------------|-------------------------------------------------------------------|---------------------|
| `value`           | Mapped URL path, can be one or more paths.                       | Empty array          |
| `path`            | Mapped URL path, same as `value`, can be one or more paths.      | Empty array          |
| `method`          | List of supported HTTP methods, e.g. `GET`, `POST`, etc.          | Empty array (supports all methods) |
| `params`          | List of parameters that must be included in the request.           | Empty array          |
| `headers`         | List of headers that must be included in the request.              | Empty array          |
| `consumes`        | Content types (Content-Type) for processing requests, can be one or more types. | Empty array      |
| `produces`        | Content types (Content-Type) generated for responses, can be one or more types. | Empty array    |
| `enabled`         | Whether to enable this mapping.                                    | `true` (enabled)    |

- Properties support configuration using placeholders: `@Mapping("${prefix}/hi")`.
- If you do not want a specific service or method to be exported as REST, you can set `@Mapping(enabled = false)` to resolve the issue.
<a name="mnjpv"></a>

### Parameter Types

General parameters can be referred to in: [3.2 Parameter Types](#kmCzf).
<a name="pqC9y"></a>

#### Parameters Without Annotations

Basic's unannotated parameters are supported by the class: [FallbackArgumentResolver.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/support/basic/FallbackArgumentResolver.java#L41) and the detailed processing flow is as follows: <br>![rest-arg.jpg](/imgs/v3/manual/java/protocol/rest-arg.jpg).
<a name="nilSu"></a>

## SpringMVC Usage Guide

See examples: [dubbo-samples-triple-rest/dubbo-samples-triple-rest-springmvc](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-springmvc).
<a name="m2q2A"></a>

### Path Mapping

Directly refer to SpringMVC documentation, supporting most features: [Mapping Requests :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html#mvc-ann-requestmapping-uri-templates). <br> Note that there is no need for `@Controller` or `@RestController` annotations; in addition to `@RequestMapping`, a new `@HttpExchange` is also supported.
<a name="zJiVQ"></a>

### Parameter Types

<a name="p6VR0"></a>

#### General Parameters

See: [3.2 Parameter Types](#kmCzf).
<a name="Ukbuz"></a>

#### Annotated Type Parameters

Refer to [3.2.1 General Type Parameters](#dCgzz).
<a name="xuy6I"></a>

#### Special Type Parameters

| Type                                                       | Description                    | Activation Condition |
|-----------------------------------------------------------|--------------------------------|----------------------|
| org.springframework.web.context.request.WebRequest         | WebRequest object               | Include SpringWeb dependency |
| org.springframework.web.context.request.NativeWebRequest    | NativeWebRequest object         | Same as above          |
| org.springframework.http.HttpEntity                          | HTTP entity                    | Same as above          |
| org.springframework.http.HttpHeaders                         | HTTP headers                   | Same as above          |
| org.springframework.util.MultiValueMap                       | Multi-value map                | Same as above          |

<a name="p64XS"></a>

#### Parameters Without Annotations

- For basic types (determined by [TypeUtils#isSimpleProperty](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/util/TypeUtils.java#L105)), they are obtained directly from Parameter.
- For non-basic types, use [@ModelAttribute :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html) to bind complex bean type parameters.
<a name="w0D3L"></a>

### Parameter Type Conversion

Prioritize using Spring's `org.springframework.core.convert.ConversionService` to convert parameters; if the application is a Spring Boot application, `mvcConversionService` will be used by default; otherwise, obtain the shared `ConversionService` through `org.springframework.core.convert.support.DefaultConversionService#getSharedInstance`. <br>If `ConversionService` does not support it, it will fall back to general type conversion: [3.3 Parameter Type Conversion](#I56vX).
<a name="DIwI5"></a>

### Exception Handling

In addition to supporting the methods mentioned in [3.8 Exception Handling](#XeDPr), it also supports the Spring `@ExceptionHandler` annotation method: [Exceptions :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html). Note that using this method can only handle exceptions thrown during method calls; other exceptions cannot be caught.
<a name="twi2x"></a>

### CORS Configuration

In addition to supporting global configuration for [8.4 CORS Configuration](#NLQqj), it also supports Spring `@CrossOrigin` for fine-tuning configuration: [CORS :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html#mvc-cors-controller).
<a name="GSx1f"></a>

### Custom HTTP Output

Supports the following Spring customization methods:

1. Use `@ResponseStatus` annotation.
2. Return `org.springframework.http.ResponseEntity` object.
   <a name="HGZX4"></a>

### Supported Extensibility

- org.springframework.web.servlet.HandlerInterceptor<br> Similar usage to [7.1 Using Filter Extensions](#xCEi3).
  <a name="cjzUk"></a>

## JAX-RS Usage Guide

See examples: [dubbo-samples-triple-rest/dubbo-samples-triple-rest-jaxrs](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-jaxrs).
<a name="QxR7G"></a>

### Path Mapping

The service needs to explicitly add the @Path annotation, and methods need to add request method annotations like @GET, @POST, @HEAD, etc. <br> Directly refer to the Resteasy documentation, supporting most features: [Chapter 4. Using @Path and @GET, @POST, etc](https://docs.jboss.org/resteasy/docs/6.2.7.Final/userguide/html/ch04.html).
<a name="TfvLf"></a>

### Parameter Types

<a name="HhsqE"></a>

#### General Parameters

See: [3.2 Parameter Types](#kmCzf).
<a name="GuQvr"></a>

#### Annotated Type Parameters

| Annotation     | Parameter Location | Description                        |
|----------------|---------------------|------------------------------------|
| @QueryParam    | querystring         | Corresponding parameters to ?a=a&b=b |
| @HeaderParam   | header              |                                    |
| @PathParam     | path                |                                    |
| @FormParam     | form                | Body in the format key1=value2&key2=value2 |
| Without annotation | body            | Not explicitly using an annotation  |

<a name="HmEQe"></a>

#### Special Type Parameters

| Type                              | Description             | Activation Condition           |
|-----------------------------------|-------------------------|--------------------------------|
| javax.ws.rs.core.Cookie           | Cookie object           | Include Jax-rs dependencies     |
| javax.ws.rs.core.Form             | Form object              | Same as above                   |
| javax.ws.rs.core.HttpHeaders      | HTTP Headers             | Same as above                   |
| javax.ws.rs.core.MediaType        | Media type              | Same as above                   |
| javax.ws.rs.core.MultivaluedMap   | Multi-value map         | Same as above                   |
| javax.ws.rs.core.UriInfo          | URI information         | Same as above                   |

<a name="f4wnR"></a>

#### Parameters Without Annotations

- For basic types (determined by [TypeUtils#isSimpleProperty](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/util/TypeUtils.java#L105)), get them directly from the Parameter.
- For non-basic types, treat them as request body (body) to decode into an object.
  <a name="iXjJH"></a>

### Parameter Type Conversion

You can extend to customize parameter conversion using the extension interface:

```
org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver
javax.ws.rs.ext.ParamConverterProvider
```
<a name="XRrsZ"></a>

### Exception Handling

You can extend to customize exception handling using the extension interface:

```
javax.ws.rs.ext.ExceptionMapper
org.apache.dubbo.remoting.http12.ExceptionHandler
```
<a name="rJBUU"></a>

### CORS Configuration

Supports global configuration for [8.4 CORS Configuration](#NLQqj).
<a name="JI88c"></a>

### Custom HTTP Output

Supports the following JAX-RS customization methods:

- Return `javax.ws.rs.core.Response` object.
  <a name="BOh83"></a>

### Supported Extensions

1. javax.ws.rs.container.ContainerRequestFilter<br> Request filters that allow preprocessing requests before they reach resource methods.
2. javax.ws.rs.container.ContainerResponseFilter<br> Response filters that allow post-processing of responses after they leave resource methods.
3. javax.ws.rs.ext.ExceptionMapper<br> Exception mappers that map thrown exceptions to HTTP responses.
4. javax.ws.rs.ext.ParamConverterProvider<br> Parameter converters that allow converting request parameters to resource method parameter types.
5. javax.ws.rs.ext.ReaderInterceptor<br> Read interceptors that allow interception and processing when reading request entities.
6. javax.ws.rs.ext.WriterInterceptor<br> Write interceptors that allow interception and processing when writing response entities.
   <a name="TL2NU"></a>

## Servlet Usage Guide

Supports both low-version javax and high-version jakarta servlet APIs, with priority given to jakarta APIs. Just include the JAR to use HttpServletRequest and HttpServletResponse as parameters.
<a name="xCEi3"></a>

### Using Filter Extensions

Method 1: Implement the `Filter` interface and `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtension` interface, then register SPI.

```java
import org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtension;

import javax.servlet.Filter;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

public class DemoFilter implements Filter, RestExtension {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        chain.doFilter(request, response);
    }

    @Override
    public String[] getPatterns() {
        return new String[]{"/demo/**", "!/demo/one"};
    }

    @Override
    public int getPriority() {
        return -200;
    }
}
```

Method 2: Implement the `Supplier<Filter>` interface and `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtension` interface, then register SPI.

```java
public class DemoFilter implements Supplier<Filter>, RestExtension {

    private final Filter filter = new SsoFilter();

    @Override
    public Filter get() {
        return filter;
    }
}
```

This method is very convenient for reusing existing filters and allows obtaining Filter instances from Spring Context and registering.

```java
public class DemoFilter implements Supplier<Filter>, RestExtension {

    private final Filter filter = new SsoFilter();

    public DemoFilter(FrameworkModel frameworkModel) {
        SpringExtensionInjector injector = SpringExtensionInjector.get(frameworkModel.defaultApplication());
        filter = injector.getInstance(SsoFilter.class, null);
    }

    @Override
    public Filter get() {
        return filter;
    }
}
```

<a name="ZAxSp"></a>

### HttpSession Support

Implement SPI `org.apache.dubbo.rpc.protocol.tri.rest.support.servlet.HttpSessionFactory`.
<a name="qYI1a"></a>

### Features Not Yet Supported

- The request and response objects wrapped in the filter will not function because there are many types of filters supported by REST, and using wrappers can lead to nested handling complexities.
- The `request.getRequestDispatcher` is not supported.
<a name="Sxium"></a>

### Security Configuration

When REST services are exposed directly to the public, there is a security risk of being attacked. Therefore, before exposing services, it is necessary to evaluate risks thoroughly and choose appropriate authentication methods to ensure security. Triple provides various security authentication mechanisms, and users can also implement extensions for access security validation.

#### Basic Authentication

To enable Basic authentication, modify the following configuration:

```yaml
dubbo:
  provider:
    auth: true
    authenticator: basic
    username: admin  
    password: admin
```

Once enabled, all HTTP requests will require Basic authentication to access.

If RPC calls are involved, the consumer side must also configure the corresponding username and password:

```yaml
dubbo:
  consumer:
    auth: true
    authenticator: basic  
    username: admin
    password: admin
```

With this configuration, communication between provider and consumer will use Basic authentication to ensure security. Please ensure strong passwords are used in production environments and consider using HTTPS for secure transmission.

### Authentication Extensions
#### Implement Custom Authenticator
You can customize authentication using SPI `org.apache.dubbo.auth.spi.Authenticator`, and select the enabled Authenticator through configuration `dubbo.provider.authenticator`.

#### Implement HTTP Request Filtering
You can customize HTTP filter logic using SPI `org.apache.dubbo.rpc.HeaderFilter` or `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilter`.

## Global Parameter Configuration

<a name="rerFd"></a>

### Case Sensitivity

Configuration name: `dubbo.protocol.triple.rest.case-sensitive-match`<br> Whether path matching should be case-sensitive. If enabled, methods mapped to `/users` will not match `/Users`.<br> Default is `true`.
<a name="f1OJD"></a>

### Tailing Matching

Configuration name: `dubbo.protocol.triple.rest.trailing-slash-match`<br> Whether path matching should match paths with trailing slashes. If enabled, methods mapped to `/users` will also match `/users/`.<br> Default is `true`.
<a name="U3mWL"></a>

### Suffix Matching

Configuration name: `dubbo.protocol.triple.rest.suffix-pattern-match`<br> Whether path matching should use suffix pattern matching (.*); if enabled, methods mapped to `/users` will also match `/users.*`, and suffix content negotiation will also be enabled, with media types inferred from URL suffixes, such as `.json` corresponding to `application/json`.<br> Default is `true`.
<a name="NLQqj"></a>

### CORS Configuration

| Configuration Name                                   | Description                                                                 | Default Value                 |
|------------------------------------------------------|-----------------------------------------------------------------------------|-------------------------------|
| `dubbo.protocol.triple.rest.cors.allowed-origins`   | List of origins permitted for cross-domain requests; may be specific domains or the special value `*` representing all origins. | Not set (no origins allowed) |
| `dubbo.protocol.triple.rest.cors.allowed-methods`   | List of allowed HTTP methods, such as `GET`, `POST`, `PUT`, etc.; a special value `*` represents all methods. | Not set (only `GET` and `HEAD` allowed) |
| `dubbo.protocol.triple.rest.cors.allowed-headers`   | List of allowed request headers for preflight requests; a special value `*` represents all headers.             | Not set                      |
| `dubbo.protocol.triple.rest.cors.exposed-headers`   | List of response headers that may be exposed to clients; a special value `*` represents all response headers.    | Not set                      |
| `dubbo.protocol.triple.rest.cors.allow-credentials` | Whether to support user credentials.                                          | Not set (user credentials not supported) |
| `dubbo.protocol.triple.rest.cors.max-age`           | Time (in seconds) that the response to a preflight request can be cached by the client.                            | Not set                      |

<a name="hAbrw"></a>

## Advanced Usage Guide

<a name="wKrDG"></a>

### Summary of Supported Extension Points

1. javax.servlet.Filter<br> Servlet API filters.
2. org.apache.dubbo.rpc.protocol.tri.rest.support.servlet.HttpSessionFactory<br> Supports HttpSession in Servlet API.
3. javax.ws.rs.container.ContainerRequestFilter<br> Implements request filters in JAX-RS, allowing for preprocessing requests before they reach resource methods.
4. javax.ws.rs.container.ContainerResponseFilter<br> Implements response filters in JAX-RS, allowing for post-processing of responses after they leave resource methods.
5. javax.ws.rs.ext.ExceptionMapper<br> Implements exception mappers in JAX-RS, mapping thrown exceptions to HTTP responses.
6. javax.ws.rs.ext.ParamConverterProvider<br> Provides parameter converters in JAX-RS, allowing for converting request parameters to resource method parameter types.
7. javax.ws.rs.ext.ReaderInterceptor<br> Implements reading interceptors in JAX-RS, allowing for interception and processing while reading request entities.
8. javax.ws.rs.ext.WriterInterceptor<br> Implements writing interceptors in JAX-RS, allowing for interception and processing while writing response entities.
9. org.springframework.web.servlet.HandlerInterceptor<br> Implements handler interceptors in Spring MVC.
10. org.apache.dubbo.remoting.http12.ExceptionHandler<br> Provides custom exception handling mechanisms.
11. org.apache.dubbo.remoting.http12.message.HttpMessageAdapterFactory<br> Provides matching and conversion features for HTTP messages.
12. org.apache.dubbo.remoting.http12.message.HttpMessageDecoderFactory<br> Provides decoding features for HTTP messages.
13. org.apache.dubbo.remoting.http12.message.HttpMessageEncoderFactory<br> Provides encoding features for HTTP messages.
14. org.apache.dubbo.rpc.HeaderFilter<br> Implements a header filter in Dubbo RPC, allowing for filtering and processing of request and response headers.
15. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestHeaderFilterAdapter<br> Header filter adapter that provides access to HTTP input and output capabilities.
16. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilterAdapter<br> Dubbo Filter REST adapter that provides access to HTTP input and output capabilities.
17. org.apache.dubbo.rpc.protocol.tri.route.RequestHandlerMapping<br> Implements request mapping capabilities in Dubbo Triple.
18. org.apache.dubbo.rpc.protocol.tri.rest.mapping.RequestMappingResolver<br> Resolves REST request mappings.
19. org.apache.dubbo.rpc.protocol.tri.rest.util.RestToolKit<br> Provides REST-related utilities.
20. org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentConverter<br> Provides parameter type conversion features.
21. org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver<br> Provides parameter resolution features.
22. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilter<br> Provides filtering capabilities for REST requests and responses.
23. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtensionAdapter<br> Provides adaptation capabilities for RestExtension, mapping existing filter interfaces to RestFilter interfaces.
    <a name="zFD9A"></a>

### Customize Exception Return Results

You can customize exception handling logic through SPI `org.apache.dubbo.remoting.http12.ExceptionHandler`.

```java
public interface ExceptionHandler<E extends Throwable, T> {
    /**
     * Resolves the log level for a given throwable.
     */
    default Level resolveLogLevel(E throwable) {
        return null;
    }

    /**
     * Handle the exception and return a result.
     */
    default T handle(E throwable, RequestMetadata metadata, MethodDescriptor descriptor) {
        return null;
    }
}
```

Implement the SPI and specify the generic E as the type of exception to handle.

- resolveLogLevel<br> Dubbo framework will print log messages for REST handling exceptions; you can implement this method to customize the log level to print or ignore the log.
- handle<br> If the returned result is not null, it will be directly output; you can return an `org.apache.dubbo.remoting.http12.HttpResult` to customize the headers and status code of the output.
<a name="hvJ5F"></a>

### Enable Debug Logging

```yaml
logging:
  level:
    "org.apache.dubbo.rpc.protocol.tri": debug
    "org.apache.dubbo.remoting": debug
```

Enabling debug logging will output detailed startup logs and request-response logs for better issue diagnosis.
<a name="UlKU9"></a>

### Enable Verbose Output

```yaml
dubbo:
  protocol:
    triple:
      verbose: true
```

Enabling verbose output will return internal error stacks to callers and output more error logs for better issue diagnosis.

