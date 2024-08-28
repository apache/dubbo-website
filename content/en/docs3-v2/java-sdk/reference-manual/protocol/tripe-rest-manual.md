---
linkTitle: Triple Rest User Manual
title: Triple Rest User Manual
type: docs
weight: 14
---

{{% alert title="Note" color="warning" %}}
Since Dubbo 3.3, the original Rest protocol has been moved to the Extensions library, and the Triple protocol now provides more comprehensive support for Rest. To continue using
the original Rest protocol, you can add the corresponding [dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-rpc-extensions/dubbo-rpc-rest)
library dependency.
{{% /alert %}}

## Introduction

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
  <a name="eyypL"></a>

## Quick Start

Let's explore Triple Rest with a simple example. You can directly download the existing sample project to get started quickly. Assume you have Java, Maven, and Git installed.

### Download and Run the Example

```bash
# Get the sample code
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic
# Run directly
mvn spring-boot:run
# Or package and run
mvn clean package -DskipTests
java -jar target/dubbo-samples-triple-rest-basic-1.0.0-SNAPSHOT.jar
```

Alternatively, you can import the project into your IDE and directly execute `org.apache.dubbo.rest.demo.BasicRestApplication#main` to run it. You can also debug by setting
breakpoints to deeply understand the principles.

### Example Code

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

<a name="H68dv"></a>

### Test the Basic Service

```bash
curl -v "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hello?name=world"
# Output:
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

Explanation:<br />You see the output `"Hello world"`. The quotes are because the default content-type is `application/json`. This example demonstrates how Triple exports services
to the `/{serviceInterface}/{methodName}` path by default and supports passing parameters via URL.
<a name="vSW6b"></a>

### Test the Advanced Service

```bash
curl -v -H "c: 3" -d 'name=Yang' "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr"
# Output:
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

Explanation:<br />The output `"Hello Mr. Yang, 3"` has no quotes because the `.txt` suffix was specified to request `text/plain` output. This example shows how to customize paths
using the `Mapping` annotation, customize parameter sources with the `Param` annotation, and pass parameters via post body or URL. For more details, see
the [Basic Usage Guide](#GdlnC)
<a name="KNfuq"></a>

### Observe Logs

Enable debug logging to understand the rest startup and request response process:

```yaml
logging:
  level:
    "org.apache.dubbo.rpc.protocol.tri": debug
    "org.apache.dubbo.remoting": debug
```

Once enabled, you can observe the Rest mapping registration and request process:

```
# Register mapping
DEBUG o.a.d.r.p.t.TripleProtocol               :  [DUBBO] Register triple grpc mapping: 'org.apache.dubbo.rest.demo.DemoService' -> invoker[tri://192.168.2.216:8081/org.apache.dubbo.rest.demo.DemoService]
 INFO .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] BasicRequestMappingResolver resolving rest mappings for ServiceMeta{interface=org.apache.dubbo.rest.demo.DemoService, service=DemoServiceImpl@2a8f6e6} at url [tri://192.168.2.216:8081/org.apache.dubbo.rest.demo.DemoService]
DEBUG .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Register rest mapping: '/org.apache.dubbo.rest.demo.DemoService/hi' -> mapping=RequestMapping{name='DemoServiceImpl#hello', path=PathCondition{paths=[org.apache.dubbo.rest.demo.DemoService/hi]}, methods=MethodsCondition{methods=[POST]}}, method=MethodMeta{method=org.apache.dubbo.rest.demo.DemoService.hello(User, int), service=DemoServiceImpl@2a8f6e6}
DEBUG .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Register rest mapping: '/org.apache.dubbo.rest.demo.DemoService/hello' -> mapping=RequestMapping{name='DemoServiceImpl#hello~S', path=PathCondition{paths=[org.apache.dubbo.rest.demo.DemoService/hello]}}, method=MethodMeta{method=org.apache.dubbo.rest.demo.DemoService.hello(String), service=DemoServiceImpl@2a8f6e6}
 INFO .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Registered 2 REST mappings for service [DemoServiceImpl@44627686] at url [tri://192.168.2.216:8081/org.apache.dubbo.rest.demo.DemoService] in 11ms

# 请求响应
DEBUG .a.d.r.p.t.r.m.RestRequestHandlerMapping :  [DUBBO] Received http request: DefaultHttpRequest{method='POST', uri='/org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr', contentType='application/x-www-form-urlencoded'}
DEBUG .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Matched rest mapping=RequestMapping{name='DemoServiceImpl#hello', path=PathCondition{paths=[/org.apache.dubbo.rest.demo.DemoService/hi]}, methods=MethodsCondition{methods=[POST]}}, method=MethodMeta{method=org.apache.dubbo.rest.demo.DemoService.hello(User, int), service=DemoServiceImpl@2a8f6e6}
DEBUG .a.d.r.p.t.r.m.RestRequestHandlerMapping :  [DUBBO] Content-type negotiate result: request='application/x-www-form-urlencoded', response='text/plain'
DEBUG .d.r.h.AbstractServerHttpChannelObserver :  [DUBBO] Http response body is: '"Hello Mr. Yang, 3"'
DEBUG .d.r.h.AbstractServerHttpChannelObserver :  [DUBBO] Http response headers sent: {:status=[200], content-type=[text/plain], alt-svc=[h2=":8081"], content-length=[17]}
```

<a name="hx06z"></a>

## General Features

<a name="Q6XyG"></a>

### Path Mapping

The Triple protocol is compatible with both SpringMVC and JAX-RS mapping methods. For more information, refer to:

- [Spring Mapping Requests](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html#mvc-ann-requestmapping-uri-templates)
- [Spring PathPattern](https://docs.spring.io/spring-framework/docs/6.1.12/javadoc-api/org/springframework/web/util/pattern/PathPattern.html)
- [Spring AntPathMatcher](https://docs.spring.io/spring-framework/docs/6.1.12/javadoc-api/org/springframework/util/AntPathMatcher.html)
- [JAX-RS Path and regular expression mappings](https://docs.jboss.org/resteasy/docs/6.2.7.Final/userguide/html/ch04.html)

You can also customize path mapping by implementing the SPI `org.apache.dubbo.rpc.protocol.tri.rest.mapping.RequestMappingResolver`.
<a name="DGIWw"></a>

#### Supported Patterns

1. `books`: A string constant matching a fixed segment.
2. `?`: Matches a single character.
3. `*`: Matches zero or more characters within a path segment.
4. `**`: Matches zero or more path segments until the end of the path.
5. `{spring}`: Matches a path segment and captures it as a variable named "spring."
6. `{spring:[a-z]+}`: Uses a regular expression `[a-z]+` to match a path segment and captures it as a variable named "spring."
7. `{*spring}`: Matches zero or more path segments until the end of the path and captures them as a variable named "spring." `{*}` without a variable name indicates that no
   capturing is done.
   <a name="jXGEY"></a>

#### Examples (from Spring Documentation)

- `/pages/t?st.html`: Matches `/pages/test.html` and `/pages/tXst.html`, but not `/pages/toast.html`.
- `/resources/*.png`: Matches all `.png` files in the `resources` directory.
- `com/**/test.jsp`: Matches all `test.jsp` files under the `com` path.
- `org/springframework/**/*.jsp`: Matches all `.jsp` files under the `org/springframework` path.
- `/resources/**`: Matches all files under the `/resources/` path, including `/resources/image.png` and `/resources/css/spring.css`.
- `/resources/{*path}`: Matches all files under `/resources/` as well as `/resources` itself, capturing the relative path as the variable "path." For example,
  `/resources/image.png` would map to "path" → "/image.png", and `/resources/css/spring.css` would map to "path" → "/css/spring.css".
- `/resources/{filename:\\w+}.dat`: Matches `/resources/spring.dat` and assigns the value "spring" to the `filename` variable.
- `/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}`: Matches `/example-2.1.5.html`, with `name` as `example`, `version` as `2.1.5`, and `ext` as `.html`.

Tip: If you do not want the regular expression to span multiple segments, use `{name:[^/]+}`.
<a name="JK47X"></a>

#### Full Mapping Process

The detailed matching logic is implemented in the following
code: [DefaultRequestMappingRegistry.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/DefaultRequestMappingRegistry.java#L196), [RequestMapping.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/RequestMapping.java#L127).

1. Normalize the path using `PathUtils.normalize` to remove indirect paths such as `/one/../` or `/one/./`, ensuring the path starts with `/`.
2. Check if the HTTP method matches.
3. Check if the path matches.
4. Check if the parameter matches (not supported by JAX-RS).
5. Check if the header matches.
6. Check if the content type matches (Consumes).
7. Check if the accept header matches (Produces).
8. Check if `serviceGroup` and `serviceVersion` match.
9. Check if the method signature matches.
10. If no match is found, retry after removing the trailing `/` if trailing slash matching is enabled.
11. If no match is found, retry after removing the extension if extension matching is enabled.
12. If the last path segment contains `~`, retry with method signature matching enabled.
13. If no candidates remain, return `null`.
14. If one candidate remains, return it.
15. If multiple candidates remain, sort them.
16. Compare the first and second candidates.
17. If the result is inconclusive, throw an exception.
18. If the first candidate wins, return it.
    <a name="dkeSI"></a>

#### Handling Path Conflicts

Unlike Spring, which raises an error and prevents startup when paths are identical, Triple Rest focuses on out-of-the-box usage. To avoid disrupting existing services, it logs a
warning by default. At runtime, if it cannot determine the highest priority mapping, an error will be thrown.

<a name="kmCzf"></a>

### Parameter Types

Supported parameter types vary by dialect. Please refer to the specific dialect's guide for more details. You can also customize parameter resolution by implementing the SPI
`org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver`.

#### Common Parameter Types

| Name           | Description             | Basic Annotation            | SpringMVC Annotation | JAX-RS Annotation | Array or Collection Handling                  | Map Handling                     |
|----------------|-------------------------|-----------------------------|----------------------|-------------------|-----------------------------------------------|----------------------------------|
| Param          | Query or Form parameter | @Param                      | @RequestParam        | -                 | Multi-value                                   | Map of all parameters            |
| Query          | URL parameter           | -                           | -                    | @QueryParam       | Multi-value                                   | Map of all Query parameters      |
| Form           | Form parameter          | -                           | -                    | @FormParam        | Multi-value                                   | Map of all Form parameters       |
| Header         | HTTP header             | @Param(type=Header)         | @RequestHeader       | @HeaderParam      | Multi-value                                   | Map of all Headers               |
| Cookie         | Cookie value            | @Param(type=Cookie)         | @CookieValue         | @CookieParam      | Multi-value                                   | Map of all Cookies               |
| Attribute      | Request attribute       | @Param(type=Attribute)      | @RequestAttribute    | -                 | Multi-value                                   | Map of all Attributes            |
| Part           | Multipart file          | @Param(type=Part)           | @RequestHeader       | @HeaderParam      | Multi-value                                   | Map of all Parts                 |
| Body           | Request body            | @Param(type=Body)           | @RequestBody         | @Body             | Attempts to parse as array or collection      | Attempts to parse as target type |
| PathVariable   | Path variable           | @Param(type=PathVariable)   | @PathVariable        | @PathParam        | Single-value array or collection              | Single-value Map                 |
| MatrixVariable | Matrix variable         | @Param(type=MatrixVariable) | @MatrixVariable      | @MatrixParam      | Multi-value                                   | Single-value Map                 |
| Bean           | Java Bean               | No annotation needed        | @ModelAttribute      | @BeanParam        | Attempts to parse as Bean array or collection | -                                |

<a name="fjYQ8"></a>

#### Special Parameter Types

| Type                                            | Description                    | Activation Condition     |
|-------------------------------------------------|--------------------------------|--------------------------|
| `org.apache.dubbo.remoting.http12.HttpRequest`  | HttpRequest object             | Activated by default     |
| `org.apache.dubbo.remoting.http12.HttpResponse` | HttpResponse object            | Activated by default     |
| `org.apache.dubbo.remoting.http12.HttpMethods`  | HTTP request method            | Activated by default     |
| `java.util.Locale`                              | Request Locale                 | Activated by default     |
| `java.io.InputStream`                           | Request InputStream            | Activated by default     |
| `java.io.OutputStream`                          | Response OutputStream          | Activated by default     |
| `javax.servlet.http.HttpServletRequest`         | Servlet HttpRequest object     | Requires Servlet API jar |
| `javax.servlet.http.HttpServletResponse`        | Servlet HttpResponse object    | Same as above            |
| `javax.servlet.http.HttpSession`                | Servlet HttpSession object     | Same as above            |
| `javax.servlet.http.Cookie`                     | Servlet Cookie object          | Same as above            |
| `java.io.Reader`                                | Servlet Request Reader object  | Same as above            |
| `java.io.Writer`                                | Servlet Response Writer object | Same as above            |

<a name="zS6y1"></a>

#### Parameters without Annotations

The handling varies by dialect; refer to the specific dialect's guide.
<a name="MikXl"></a>

#### Accessing HTTP Input and Output Parameters without Annotations

You can use `RpcContext` to retrieve them:

```java
// Dubbo http req/resp
HttpRequest request = RpcContext.getServiceContext().getRequest(HttpRequest.class);
HttpResponse response = RpcContext.getServiceContext().getRequest(HttpResponse.class);
// Servlet http req/resp
HttpServletRequest request = RpcContext.getServiceContext().getRequest(HttpServletRequest.class);
HttpServletResponse response = RpcContext.getServiceContext().getRequest(HttpServletResponse.class);
```

After obtaining the request, you can access some built-in attributes through `attribute`.
See: [RestConstants.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/RestConstants.java#L40)
<a name="I56vX"></a>

### Parameter Type Conversion

By default, most parameter type conversions from `String` to target types are supported, including:

- JDK built-in types (e.g., basic types, date, `Optional`, etc.)
- Array types
- Collection types
- Map types

Generic types, including complex nesting, are fully supported. For implementation details, refer
to: [GeneralTypeConverter.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/argument/GeneralTypeConverter.java).
Custom parameter type conversion can also be achieved by implementing SPI `org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentConverter`.

| Source Type | Target Type             | Description                      | Default Value |
|-------------|-------------------------|----------------------------------|---------------|
| `String`    | `double`                | Converts to a double             | 0.0d          |
| `String`    | `float`                 | Converts to a float              | 0.0f          |
| `String`    | `long`                  | Converts to a long               | 0L            |
| `String`    | `int`                   | Converts to an integer           | 0             |
| `String`    | `short`                 | Converts to a short              | 0             |
| `String`    | `char`                  | Converts to a character          | 0             |
| `String`    | `byte`                  | Converts to a byte               | 0             |
| `String`    | `boolean`               | Converts to a boolean            | false         |
| `String`    | `BigInteger`            | Converts to a BigInteger         | null          |
| `String`    | `BigDecimal`            | Converts to a BigDecimal         | null          |
| `String`    | `Date`                  | Converts to a Date               | null          |
| `String`    | `Calendar`              | Converts to a Calendar           | null          |
| `String`    | `Timestamp`             | Converts to a Timestamp          | null          |
| `String`    | `Instant`               | Converts to an Instant           | null          |
| `String`    | `ZonedDateTime`         | Converts to a ZonedDateTime      | null          |
| `String`    | `LocalDate`             | Converts to a LocalDate          | null          |
| `String`    | `LocalTime`             | Converts to a LocalTime          | null          |
| `String`    | `LocalDateTime`         | Converts to a LocalDateTime      | null          |
| `String`    | `ZoneId`                | Converts to a ZoneId             | null          |
| `String`    | `TimeZone`              | Converts to a TimeZone           | null          |
| `String`    | `File`                  | Converts to a File               | null          |
| `String`    | `Path`                  | Converts to a Path               | null          |
| `String`    | `Charset`               | Converts to a Charset            | null          |
| `String`    | `InetAddress`           | Converts to an InetAddress       | null          |
| `String`    | `URI`                   | Converts to a URI                | null          |
| `String`    | `URL`                   | Converts to a URL                | null          |
| `String`    | `UUID`                  | Converts to a UUID               | null          |
| `String`    | `Locale`                | Converts to a Locale             | null          |
| `String`    | `Currency`              | Converts to a Currency           | null          |
| `String`    | `Pattern`               | Converts to a Pattern            | null          |
| `String`    | `Class`                 | Converts to a Class              | null          |
| `String`    | `byte[]`                | Converts to a byte array         | null          |
| `String`    | `char[]`                | Converts to a char array         | null          |
| `String`    | `OptionalInt`           | Converts to an OptionalInt       | null          |
| `String`    | `OptionalLong`          | Converts to an OptionalLong      | null          |
| `String`    | `OptionalDouble`        | Converts to an OptionalDouble    | null          |
| `String`    | `Enum class`            | Enum.valueOf                     | null          |
| `String`    | `Array` or `Collection` | Split by comma                   | null          |
| `String`    | `Specified class`       | Try JSON String to Object        | null          |
| `String`    | `Specified class`       | Try construct with single String | null          |
| `String`    | `Specified class`       | Try call static method `valueOf` | null          |

<a name="VxFtB"></a>

### Supported Content-Types

By default, the following Content-Types are supported with corresponding encoding and decoding capabilities. Extension is available by implementing SPI
`org.apache.dubbo.remoting.http12.message.(HttpMessageDecoderFactory|HttpMessageEncoderFactory)`.

| Media Type                          | Description                |
|-------------------------------------|----------------------------|
| `application/json`                  | JSON format                |
| `application/xml`                   | XML format                 |
| `application/yaml`                  | YAML format                |
| `application/octet-stream`          | Binary data                |
| `application/grpc`                  | gRPC format                |
| `application/grpc+proto`            | gRPC with Protocol Buffers |
| `application/x-www-form-urlencoded` | URL-encoded form data      |
| `multipart/form-data`               | Form data with file upload |
| `text/json`                         | JSON format as text        |
| `text/xml`                          | XML format as text         |
| `text/yaml`                         | YAML format as text        |
| `text/css`                          | CSS format                 |
| `text/javascript`                   | JavaScript format as text  |
| `text/html`                         | HTML format                |
| `text/plain`                        | Plain text                 |

<a name="qbOvN"></a>

### Content Negotiation

Supports comprehensive content negotiation to determine the output Content-Type based on mapping or input. The process is as follows:

1. Try to read the mediaType specified by Mapping, retrieve the list of mediaTypes specified by Produces, and match wildcard to appropriate Media Type. For example, Spring's:
   `@RequestMapping(produces = "application/json")`
2. Try to find mediaType using the Accept header, parse the request's `Accept` header, and match wildcard to appropriate Media Type. For example: `Accept: application/json`
3. Try to find mediaType using the format parameter, read the format parameter value, and match it to an appropriate Media Type. For example `/hello?format=yml`
4. Try to find mediaType using the request path extension, match the extension to an appropriate Media Type. For example `/hello.txt`
5. Try to use the request's Content-Type header as Media Type (excluding two form types). For example `Content-Type: application/json`
6. Default to `application/json`

<a name="DtUnB"></a>

### CORS Support

Provides full CORS support, enabled by configuring global parameters. Default behavior is consistent with SpringMVC. Fine-grained configuration is also supported through
`@CrossOrigin` in SpringMVC. For supported CORS configuration items, refer to: [8.4 CORS Configuration](#NLQqj)
<a name="O4KNd"></a>

### Custom HTTP Output

Custom HTTP output is required in many scenarios, such as 302 redirects or setting HTTP headers. Triple Rest offers the following generic solutions, with dialect-specific
approaches available in each dialect's user guide:

- Set the return value to: `org.apache.dubbo.remoting.http12.HttpResult` and build using `HttpResult#builder`.
- Throw a Payload exception: `throws new org.apache.dubbo.remoting.http12.exception.HttpResultPayloadException(HttpResult)`. Example code:

```java
throw new HttpResult.found("https://a.com").

toPayload();
```

This exception avoids filling error stacks, has minimal performance impact, and does not require return value logic, making it recommended for customizing output.

- Customize after obtaining HttpResponse. Example code:

```java
HttpResponse response = RpcContext.getServiceContext().getRequest(HttpResponse.class);

response.

sendRedirect("https://a.com");
response.

setStatus(404);
response.

outputStream().

write(data);
// It is recommended to commit after writing to avoid being modified by other extensions
response.

commit();
```

If only adding `http headers`, use this method.
<a name="OlLbS"></a>

### Custom JSON Serialization

<a name="XeDPr"></a>

### Exception Handling

Unhandled exceptions are ultimately converted to the `ErrorResponse` class and encoded for output:

```java

@Data
public class ErrorResponse {
    /**
     * HTTP status code
     */
    private String status;

    /**
     * Exception message
     */
    private String message;
}
```

Note that for errors with status 500 and above, to avoid disclosing internal server information, the default message output is "Internal Server Error". To customize the message,
create an exception that extends `org.apache.dubbo.remoting.http12.exception.HttpStatusException` and override the `getDisplayMessage` method.<br />The following general methods
are available for customizing exception handling:

- Refer to [9.2 Custom Exception Return Results](#zFD9A) for using SPI to customize global exception handling.
- Use Dubbo's Filter SPI to process and transform exceptions. To access the HTTP context, extend `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilterAdapter`.
- Use SPI `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilter` to transform exceptions, which is more lightweight and provides path matching configuration capabilities.

Note that the latter two methods only intercept exceptions occurring in the invoke chain. If exceptions occur during path matching, only method 1 can handle them.
<a name="GdlnC"></a>

## Basic Usage Guide

See
example: [dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic)
<a name="yCnsD"></a>

### Path Mapping

Basic, as an out-of-the-box REST mapping, will by default map methods to: `/{contextPath}/{serviceInterface}/{methodName}`, where `/{contextPath}` will be ignored if not
configured, resulting in: `/{serviceInterface}/{methodName}`.<br />Custom mappings are supported through the `org.apache.dubbo.remoting.http12.rest.Mapping` annotation. The
attribute descriptions are as follows:

| Config Name | Description                                                                            | Default Behavior                   |
|-------------|----------------------------------------------------------------------------------------|------------------------------------|
| `value`     | Mapped URL paths, which can be one or more paths.                                      | Empty array                        |
| `path`      | Mapped URL paths, same as `value`, can be one or more paths.                           | Empty array                        |
| `method`    | Supported HTTP methods list, such as `GET`, `POST`, etc.                               | Empty array (supports all methods) |
| `params`    | List of parameters that must be included in the request.                               | Empty array                        |
| `headers`   | List of headers that must be included in the request.                                  | Empty array                        |
| `consumes`  | Content types (Content-Type) for processing requests, which can be one or more types.  | Empty array                        |
| `produces`  | Content types (Content-Type) for generating responses, which can be one or more types. | Empty array                        |
| `enabled`   | Whether to enable this mapping.                                                        | `true` (enabled)                   |

- Attributes can be configured using placeholders: `@Mapping("${prefix}/hi")`
- To prevent a specific service or method from being exported as REST, set `@Mapping(enabled = false)`
  <a name="mnjpv"></a>

### Parameter Types

General parameters are discussed in: [3.2 Parameter Types](#kmCzf)

<a name="pqC9y"></a>

#### Parameters Without Annotations

Basic supports parameters without annotations through the
class: [FallbackArgumentResolver.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/support/basic/FallbackArgumentResolver.java#L41).
The detailed processing flow is as follows:<br />![rest-arg.jpg](/imgs/v3/manual/java/protocol/rest-arg.jpg)
<a name="nilSu"></a>

## SpringMVC Usage Guide

See
example: [dubbo-samples-triple-rest/dubbo-samples-triple-rest-springmvc](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-springmvc)
<a name="m2q2A"></a>

### Path Mapping

Refer directly to the SpringMVC documentation, which supports most
features, [Mapping Requests :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html#mvc-ann-requestmapping-uri-templates)<br />
Note that `@Controller` or `@RestController` annotations are not required; in addition to `@RequestMapping`, the new `@HttpExchange` is also supported.
<a name="zJiVQ"></a>

### Parameter Types

<a name="p6VR0"></a>

#### General Parameters

See: [3.2 Parameter Types](#kmCzf)
<a name="Ukbuz"></a>

#### Annotated Parameter Types

See [3.2.1 Annotated Parameter Types](#dCgzz)
<a name="xuy6I"></a>

#### Special Parameter Types

| Type                                                     | Description             | Activation Condition          |
|----------------------------------------------------------|-------------------------|-------------------------------|
| org.springframework.web.context.request.WebRequest       | WebRequest object       | SpringWeb dependency required |
| org.springframework.web.context.request.NativeWebRequest | NativeWebRequest object | Same as above                 |
| org.springframework.http.HttpEntity                      | Http entity             | Same as above                 |
| org.springframework.http.HttpHeaders                     | Http headers            | Same as above                 |
| org.springframework.util.MultiValueMap                   | Multi-value map         | Same as above                 |

<a name="p64XS"></a>

#### Parameters Without Annotations

- For basic types (as determined
  by [TypeUtils#isSimpleProperty](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/util/TypeUtils.java#L105)),
  directly obtained from Parameter
- For non-basic types,
  use [@ModelAttribute :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html) to bind complex
  bean type parameters
  <a name="w0D3L"></a>

### Parameter Type Conversion

Prefer using Spring's `org.springframework.core.convert.ConversionService` to convert parameters. For Spring Boot applications, the default is `mvcConversionService`; otherwise,
use `org.springframework.core.convert.support.DefaultConversionService#getSharedInstance` to obtain the shared `ConversionService`.<br />If `ConversionService` does not support it,
it will fall back to general type conversion: [3.3 Parameter Type Conversion](#I56vX)
<a name="DIwI5"></a>

### Exception Handling

In addition to supporting the methods mentioned in [3.8 Exception Handling](#XeDPr), Spring's `@ExceptionHandler` annotation method is also
supported, [Exceptions :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html). Note that this method only
handles exceptions thrown during method calls; other exceptions cannot be captured.
<a name="twi2x"></a>

### CORS Configuration

In addition to supporting global CORS configuration as described in [8.4 CORS Configuration](#NLQqj), Spring's `@CrossOrigin` allows for fine-grained
configuration, [CORS :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html#mvc-cors-controller).
<a name="GSx1f"></a>

### Custom HTTP Output

Supports the following Spring customization methods:

1. Use `@ResponseStatus` annotation
2. Return `org.springframework.http.ResponseEntity` object
   <a name="HGZX4"></a>

### Supported Extensions

- org.springframework.web.servlet.HandlerInterceptor<br />Usage is similar to [7.1 Using Filter Extensions](#xCEi3)
  <a name="cjzUk"></a>

## JAX-RS Usage Guide

See
example: [dubbo-samples-triple-rest/dubbo-samples-triple-rest-jaxrs](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-jaxrs)
<a name="QxR7G"></a>

### Path Mapping

Services need to explicitly add the @Path annotation, and methods need to add request method annotations like @GET, @POST, @HEAD.<br />Refer directly to the Resteasy documentation,
which supports most features, [Chapter 4. Using @Path and @GET, @POST, etc](https://docs.jboss.org/resteasy/docs/6.2.7.Final/userguide/html/ch04.html)
<a name="TfvLf"></a>

### Parameter Types

<a name="HhsqE"></a>

#### General Parameters

See: [3.2 Parameter Types](#kmCzf)
<a name="GuQvr"></a>

#### Annotation Type Parameters

| Annotation    | Parameter Location | Description                            |
|---------------|--------------------|----------------------------------------|
| @QueryParam   | querystring        | Parameters corresponding to ?a=a&b=b   |
| @HeaderParam  | header             |                                        |
| @PathParam    | path               |                                        |
| @FormParam    | form               | body in key1=value2&key2=value2 format |
| No annotation | body               | Not explicitly annotated               |

<a name="HmEQe"></a>

#### Special Type Parameters

| Type                            | Description     | Activation Condition       |
|---------------------------------|-----------------|----------------------------|
| javax.ws.rs.core.Cookie         | Cookie object   | Requires Jax-rs dependency |
| javax.ws.rs.core.Form           | Form object     | Same as above              |
| javax.ws.rs.core.HttpHeaders    | Http headers    | Same as above              |
| javax.ws.rs.core.MediaType      | Media type      | Same as above              |
| javax.ws.rs.core.MultivaluedMap | Multivalued Map | Same as above              |
| javax.ws.rs.core.UriInfo        | Uri information | Same as above              |

<a name="f4wnR"></a>

#### Non-Annotated Parameters

- For basic types (as determined
  by [TypeUtils#isSimpleProperty](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/util/TypeUtils.java#L105)),
  directly retrieved from Parameter
- For non-basic types, treated as request body to decode the object
  <a name="iXjJH"></a>

### Parameter Type Conversion

Custom parameter conversion can be extended via the following interfaces:

```
org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver
javax.ws.rs.ext.ParamConverterProvider
```

<a name="XRrsZ"></a>

### Exception Handling

Custom exception handling can be extended via the following interfaces:

```
javax.ws.rs.ext.ExceptionMapper
org.apache.dubbo.remoting.http12.ExceptionHandler
```

<a name="rJBUU"></a>

### CORS Configuration

Supports [8.4 CORS Configuration](#NLQqj) global configuration
<a name="JI88c"></a>

### Custom HTTP Output

Supports the following JAX-RS customizations:

- Returning `javax.ws.rs.core.Response` object
  <a name="BOh83"></a>

### Supported Extensions

1. javax.ws.rs.container.ContainerRequestFilter<br /> Request filter, allows pre-processing of requests before they reach the resource method.
2. javax.ws.rs.container.ContainerResponseFilter<br /> Response filter, allows post-processing of responses after they leave the resource method.
3. javax.ws.rs.ext.ExceptionMapper<br /> Exception mapper, maps thrown exceptions to HTTP responses.
4. javax.ws.rs.ext.ParamConverterProvider<br /> Parameter converter, allows conversion of request parameters to resource method parameter types.
5. javax.ws.rs.ext.ReaderInterceptor<br /> Reader interceptor, allows interception and handling when reading request entities.
6. javax.ws.rs.ext.WriterInterceptor<br /> Writer interceptor, allows interception and handling when writing response entities.
   <a name="TL2NU"></a>

## Servlet Usage Guide

For both lower version javax and higher version jakarta servlet APIs, jakarta API has higher priority. Simply include the jar to use HttpServletRequest and HttpServletResponse as
parameters.
<a name="xCEi3"></a>

### Using Filter Extension

Method 1: Implement `Filter` interface and `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtension` interface, then register SPI

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

Method 2: Implement `Supplier<Filter>` interface and `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtension` interface, then register SPI

```java
public class DemoFilter implements Supplier<Filter>, RestExtension {

    private final Filter filter = new SsoFilter();

    @Override
    public Filter get() {
        return filter;
    }
}
```

This method is convenient for reusing existing Filters, and can even obtain Filter instances from Spring Context and register them

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

Implement SPI `org.apache.dubbo.rpc.protocol.tri.rest.support.servlet.HttpSessionFactory`
<a name="qYI1a"></a>

### Unsupported Features

- Wrapping request and response objects in Filter will not work due to the large number of filter types supported by Rest, leading to complex nesting and handling.
- `request.getRequestDispatcher` is not supported
  <a name="Sxium"></a>

## Global Parameter Configuration

<a name="rerFd"></a>

### Case Sensitivity

Configuration Name: `dubbo.protocol.triple.rest.case-sensitive-match`<br />Whether path matching should be case-sensitive. If enabled, methods mapped to `/users` will not match
`/Users`<br />Default is `true`
<a name="f1OJD"></a>

### Trailing Slash Matching

Configuration Name: `dubbo.protocol.triple.rest.trailing-slash-match`<br />Whether path matching should match paths with trailing slashes. If enabled, methods mapped to `/users`
will also match `/users/`<br />Default is `true`
<a name="U3mWL"></a>

### Suffix Matching

Configuration Name: `dubbo.protocol.triple.rest.suffix-pattern-match`<br />Whether path matching uses suffix pattern matching (.*). If enabled, methods mapped to `/users` will also
match `/users.*`, with suffix content negotiation enabled, media types inferred from URL suffix, e.g., `.json` corresponds to `application/json`<br />Default is `true`
<a name="NLQqj"></a>

### CORS Configuration

| Configuration Name                                  | Description                                                                                        | Default Value                            |
|-----------------------------------------------------|----------------------------------------------------------------------------------------------------|------------------------------------------|
| `dubbo.protocol.triple.rest.cors.allowed-origins`   | List of allowed origins for cross-origin requests, can be specific domains or `*` for all origins. | Not set (no origins allowed)             |
| `dubbo.protocol.triple.rest.cors.allowed-methods`   | List of allowed HTTP methods, e.g., `GET`, `POST`, `PUT`, `*` for all methods.                     | Not set (only `GET` and `HEAD`)          |
| `dubbo.protocol.triple.rest.cors.allowed-headers`   | List of allowed request headers in preflight requests, `*` for all headers.                        | Not set                                  |
| `dubbo.protocol.triple.rest.cors.exposed-headers`   | List of response headers exposed to clients, `*` for all headers.                                  | Not set                                  |
| `dubbo.protocol.triple.rest.cors.allow-credentials` | Whether user credentials are supported.                                                            | Not set (user credentials not supported) |
| `dubbo.protocol.triple.rest.cors.max-age`           | Time (in seconds) that the client can cache the preflight request response.                        | Not set                                  |

<a name="hAbrw"></a>

## Advanced Usage Guide

<a name="wKrDG"></a>

### Summary of Supported Extensions

1. javax.servlet.Filter<br />Servlet API filter.
2. org.apache.dubbo.rpc.protocol.tri.rest.support.servlet.HttpSessionFactory<br />Supports HttpSession in Servlet API.
3. javax.ws.rs.container.ContainerRequestFilter<br />JAX-RS request filter, allows pre-processing of requests before they reach the resource method.
4. javax.ws.rs.container.ContainerResponseFilter<br />JAX-RS response filter, allows post-processing of responses after they leave the resource method.
5. javax.ws.rs.ext.ExceptionMapper<br />JAX-RS exception mapper, maps thrown exceptions to HTTP responses.
6. javax.ws.rs.ext.ParamConverterProvider<br />JAX-RS parameter converter, allows conversion of request parameters to resource method parameter types.
7. javax.ws.rs.ext.ReaderInterceptor<br />JAX-RS reader interceptor, allows interception and handling when reading request entities.
8. javax.ws.rs.ext.WriterInterceptor<br />JAX-RS writer interceptor, allows interception and handling when writing response entities.
9. org.springframework.web.servlet.HandlerInterceptor<br />Spring MVC handler interceptor.
10. org.apache.dubbo.remoting.http12.ExceptionHandler<br />Provides custom exception handling mechanism.
11. org.apache.dubbo.remoting.http12.message.HttpMessageAdapterFactory<br />Provides adaptation and conversion functions for HTTP messages.
12. org.apache.dubbo.remoting.http12.message.HttpMessageDecoderFactory<br />Provides HTTP message decoding functions.
13. org.apache.dubbo.remoting.http12.message.HttpMessageEncoderFactory<br />Provides HTTP message encoding functions.
14. org.apache.dubbo.rpc.HeaderFilter<br />Dubbo RPC header filter, allows filtering and handling of request and response headers.
15. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestHeaderFilterAdapter<br />Header filter adapter providing access to HTTP input and output capabilities.
16. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilterAdapter<br />Dubbo Filter REST adapter, providing access to HTTP input and output capabilities.
17. org.apache.dubbo.rpc.protocol.tri.route.RequestHandlerMapping<br />Provides request mapping capability in Dubbo Triple.
18. org.apache.dubbo.rpc.protocol.tri.rest.mapping.RequestMappingResolver<br />Resolves REST request mappings.
19. org.apache.dubbo.rpc.protocol.tri.rest.util.RestToolKit<br />Provides REST-related tools and utilities.
20. org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentConverter<br />Provides argument type conversion functionality.
21. org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver<br />Provides argument resolution functionality.
22. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilter<br />Provides filtering functionality for REST requests and responses.
23. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtensionAdapter<br />RestExtension adapter providing mapping of existing filter interfaces to RestFilter interfaces.
    <a name="zFD9A"></a>

### Custom Exception Handling

Custom exception handling logic can be implemented via the SPI `org.apache.dubbo.remoting.http12.ExceptionHandler`

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

Implement SPI and specify the exception type E to handle

- resolveLogLevel<br />Dubbo framework will log Rest handling exceptions, customize log level or ignore logs by implementing this method.
- handle<br />If the result is not null, it will be directly returned; customize output headers and status code by returning `org.apache.dubbo.remoting.http12.HttpResult`.
  <a name="hvJ5F"></a>

### Enable Debug Logging

```yaml
logging:
  level:
    "org.apache.dubbo.rpc.protocol.tri": debug
    "org.apache.dubbo.remoting": debug
```

Enable debug logging will output detailed startup logs and request/response logs for troubleshooting.
<a name="UlKU9"></a>

### Enable Verbose Output

```yaml
dubbo:
  protocol:
    triple:
      verbose: true
```

Enable verbose output will return internal error stack traces to the caller and output more error logs for troubleshooting.
