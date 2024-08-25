---
aliases:
  - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/rest/manual/
  - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/rest/manual/
description: "本文是Triple Rest的用户使用手册"
linkTitle: triple-rest用户手册
title: triple-rest用户手册
type: docs
weight: 7
---

{{% alert title="注意" color="warning" %}}
从 Dubbo 3.3 版本开始，原 Rest 协议已移至 Extensions 库，由 Triple 协议来对 Rest 提供更全面的支持，如需继续使用原 Rest 协议，
可引入对应 [dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-rpc-extensions/dubbo-rpc-rest) 库依赖
{{% /alert %}}

## 前言

从 Dubbo 3.3 版本开始，Triple 协议重用已有的 HTTP 协议栈，实现了全面的 REST 风格服务导出能力。无需使用泛化或网关层协议转换，无需配置，用户即可通过 HTTP 协议去中心化直接访问后端的 Triple
协议服务。同时，针对高级 REST 用法，如路径定制、输出格式定制和异常处理，提供了丰富的注解和
SPI 扩展支持。其主要特性包括：

- **Triple协议融合**  
  重用Triple原有HTTP协议栈， 无需额外配置或新增端口，即可同时支持 HTTP/1、HTTP/2 和 HTTP/3 协议的访问。
- **去中心化**  
  可直接对外暴露 Rest API，不再依赖网关应用进行流量转发，从而提升性能，并降低因网关引发的稳定性风险。安全问题可通过应用内部扩展解决，这一实践已在淘宝内部的 MTOP 中得到验证。
- **支持已有servlet设施**  
  支持 Servlet API 和 Filter，用户可以重用现有基于 Servlet API 的安全组件。通过实现一个 Servlet Filter，即可集成 OAuth 和 Spring Security 等安全框架。
- **多种方言**  
  考虑到大部分用户习惯使用 SpringMVC 或 JAX-RS 进行 REST API 开发，Triple Rest 允许继续沿用这些方式定义服务，并支持大部分扩展和异常处理机制（具备原框架 80% 以上的功能）。对于追求轻量级的用户，可使用
  Basic 方言，Triple 的开箱即用
  REST 访问能力即基于此方言导出服务。
- **扩展能力强**  
  提供超过 20 个 扩展点，用户不仅可以轻松实现自定义方言，还能灵活定制参数获取、类型转换、错误处理等逻辑。
- **开箱即用**  
  REST 能力开箱即用，只需启用 Triple 协议，即具备 REST 直接访问服务能力。
- **高性能路由**  
  路由部分采用优化的 [Radix Tree](https://github.com/apache/dubbo/blob/3.3/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/RadixTree.java) 和
  Zero Copy 技术，提升路由性能。
- **OpenAPI无缝集成(TBD)**  
  即将完成 OpenAPI 集成，开箱即用支持导出 OpenAPI Schema， 引入 Swagger 依赖可直接使用 Web UI 来进行服务测试。有了 OpenAPI Schema
  可使用 [Postman](https://www.postman.com/)、[Apifox](https://apifox.com/) 等API工具来管理和测试
  API，利用 OpenAPI 生态可轻松实现跨语言调用。未来会进一步支持 Schema First 的方式，先和前端团队一起定义 OpenAPI, 前端基于 OpenAPI 来生成调用代码和 Mock，后端基于 OpenAPI 来生成 Stub
  来开发服务，极大提升协同效率。
  <a name="eyypL"></a>

## 快速开始

让我们从一个简单的例子开始了解 Triple Rest。您可以直接下载已有的示例项目以快速上手，假设您已经安装好 Java、Maven 和 Git
<a name="uXTNI"></a>

### 下载并运行示例

```bash
# 获取示例代码
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic
# 直接运行
mvn spring-boot:run
# 或打包后运行
mvn clean package -DskipTests
java -jar target/dubbo-samples-triple-rest-basic-1.0.0-SNAPSHOT.jar
```

当然，也可以直接用IDE导入工程后直接执行
`org.apache.dubbo.rest.demo.BasicRestApplication#main` 来运行，并通过下断点 debug 的方式来深入理解原理。
<a name="DBA0D"></a>

### 示例代码

```java
// 服务接口
package org.apache.dubbo.rest.demo;

import org.apache.dubbo.remoting.http12.rest.Mapping;
import org.apache.dubbo.remoting.http12.rest.Param;

public interface DemoService {
    String hello(String name);

    @Mapping(path = "/hi", method = HttpMethods.POST)
    String hello(User user, @Param(value = "c", type = ParamType.Header) int count);
}

// 服务实现
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

// 模型
@Data
public class User {
    private String title;
    private String name;
}
```

<a name="H68dv"></a>

### 测试基本服务

```bash
curl -v "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hello?name=world"
# 输出如下
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

代码讲解：<br>可以看到输出了 "Hello world" ，有双引号是因为默认输出 content-type 为 application/json<br>通过这个例子可以了解 Triple 默认将服务导出到
`/{serviceInterface}/{methodName}`路径，并支持通过url方式传递参数
<a name="vSW6b"></a>

### 测试高级服务

```bash
curl -v -H "c: 3" -d 'name=Yang' "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr"
# 输出如下
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

代码讲解：<br>可以看到输出 Hello Mr. Yang, 3 ，没有双引号是因为通过指定后缀 txt 的方式要求用 `text/plain` 输出<br>通过这个例子可以了解如何通过 Mapping 注解来定制路径，通过 Param
注解来定制参数来源，并支持通过 post body 或
url方式传递参数，详细说明参见： [Basic使用指南](#GdlnC)
<a name="KNfuq"></a>

### 观察日志

可以通过打开 debug 日志的方式来了解rest的启动和响应请求过程

```yaml
logging:
  level:
    "org.apache.dubbo.rpc.protocol.tri": debug
    "org.apache.dubbo.remoting": debug
```

打开后可以观察到 Rest 映射注册和请求响应过程

```
# 注册mapping
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

## 通用功能

<a name="Q6XyG"></a>

### 路径映射

兼容 SpringMVC 和 JAX-RS 的映射方式，相关文档：

- [Spring Mapping Requests](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html#mvc-ann-requestmapping-uri-templates)
- [Spring PathPattern](https://docs.spring.io/spring-framework/docs/6.1.12/javadoc-api/org/springframework/web/util/pattern/PathPattern.html)
- [Spring AntPathMatcher](https://docs.spring.io/spring-framework/docs/6.1.12/javadoc-api/org/springframework/util/AntPathMatcher.html)
- [JAX-RS Path and regular expression mappings](https://docs.jboss.org/resteasy/docs/6.2.7.Final/userguide/html/ch04.html)

还支持通过实现 SPI `org.apache.dubbo.rpc.protocol.tri.rest.mapping.RequestMappingResolver` 来自定义路径映射
<a name="DGIWw"></a>

#### 支持的模式

1. `books` 字符串常量，最基本的类型，匹配一个固定的段
2. `?` 匹配一个字符
3. `*` 匹配路径段中的零个或多个字符
4. `**` 匹配直到路径末尾的零个或多个路径段
5. `{spring}` 匹配一个路径段并将其捕获为名为 "spring" 的变量
6. `{spring:[a-z]+}` 使用正则表达式 `[a-z]+` 匹配路径段，并将其捕获为名为 "spring" 的路径变量
7. `{*spring}` 匹配直到路径末尾的零个或多个路径段，并将其捕获为名为 "spring" 的变量，如果写 `{*}` 表示不捕获
   <a name="jXGEY"></a>

#### 示例（来自Spring文档）

- `/pages/t?st.html` — 匹配 `/pages/test.html` 以及 `/pages/tXst.html`，但不匹配 `/pages/toast.html`
- `/resources/*.png` — 匹配 `resources` 目录中的所有 `.png` 文件
- `com/**/test.jsp` — 匹配 `com` 路径下的所有 `test.jsp` 文件
- `org/springframework/**/*.jsp` — 匹配 `org/springframework` 路径下的所有 `.jsp` 文件
- `/resources/**` — 匹配 `/resources/` 路径下的所有文件，包括 `/resources/image.png` 和 `/resources/css/spring.css`
- `/resources/{*path}` — 匹配 `/resources/` 下的所有文件，以及 `/resources`，并将其相对路径捕获在名为 "path" 的变量中；例如，
  `/resources/image.png` 会匹配到 "path" → "/image.png"，`/resources/css/spring.css` 会匹配到 "path" → "/css/spring.css"
- `/resources/{filename:\\w+}.dat` — 匹配 `/resources/spring.dat` 并将值 "spring" 分配给 `filename` 变量
- `/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}` — 匹配 `/example-2.1.5.html` 则 `name` 为 `example`，
  `version` 为 `2.1.5`，`ext` 为 `.html`

小技巧如果使用正则不希望跨段可以使用 `{name:[^/]+}` 来匹配
<a name="JK47X"></a>

#### 映射匹配完整流程

具体的匹配处理代码：[DefaultRequestMappingRegistry.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/DefaultRequestMappingRegistry.java#L196) [RequestMapping.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/mapping/RequestMapping.java#L127)

1. 使用 `PathUtils.normalize` 对路径进行清洗，去掉诸如 `/one/../` `/one/./` 之类间接路径，保证一定已 `/` 开头
2. 检查 `http method` 是否匹配
3. 检查 `path` 是否匹配
4. 检查 `paramter` 是否匹配（JAX-RS不支持）
5. 检查 `header` 是否匹配
6. 检查 `content-type` 是否匹配（Consumes）
7. 检查 `accept` 是否匹配 （Produces）
8. 检查 `serviceGroup` 和 `serviceVersion` 是否匹配
9. 检查 `method` 首字母签名是否匹配
10. 未找到任何匹配项，如果尾 `/` 匹配开启并且路径 `/` 结尾则去掉尾 `/` 尝试从第2步开始匹配
11. 未找到任何匹配项，如果扩展名匹配开启并且扩展名被支持，则去掉扩展名尝试从第2步开始匹配
12. 如果最后一段路径包含 `~` 表示开启 method 首字母签名匹配，尝试从第2步开始匹配
13. 如果候选项为0，匹配结束，返回null
14. 如果候选项为0，匹配结束，返回命中项
15. 如果不止一个候选项，对候选项进行排序
16. 对第一项和第二项进行顺序比较
17. 结果为0表示无法确认最终匹配项，抛异常失败
18. 第一项胜出，匹配结束，返回命中项
    <a name="dkeSI"></a>

#### 路径重复问题

与 Spring 不同，Spring 在路径完全相同时会直接报错并阻止启动，而 Triple Rest 具备开箱即用的特性，为了避免影响现有服务，默认只会打印 WARN 日志。在运行时，如果最终无法确定最高优先级的映射，才会抛出错误。
<a name="kmCzf"></a>

### 入参类型

不同方言支持的入参类型不同，详情请参见各方言使用指南。<br>还支持通过实现 SPI
`org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver` 来自定义入参解析
<a name="dCgzz"></a>

#### 通用类型参数

| 名称             | 说明            | Basic 注解                    | SpringMVC注解       | JAX-RS注解     | 数组或集合处理方式      | Map处理方式         |
|----------------|---------------|-----------------------------|-------------------|--------------|----------------|-----------------|
| Param          | Query或Form的参数 | @Param                      | @RequestParam     | -            | 多值             | 所有参数的Map        |
| Query          | url上带的参数      | -                           | -                 | @QueryParam  | 多值             | 所有Query参数的Map   |
| Form           | form表单带的参数    | -                           | -                 | @FormParam   | 多值             | 所有Form参数的Map    |
| Header         | HTTP头         | @Param(type=Header)         | @RequestHeader    | @HeaderParam | 多值             | 所有Header参数的Map  |
| Cookie         | Cookie值       | @Param(type=Cookie)         | @CookieValue      | @CookieParam | 多值             | 所有Cookie参数的Map  |
| Attribute      | Request属性     | @Param(type=Attribute)      | @RequestAttribute | -            | 多值             | 所有Attribute的Map |
| Part           | Multipart文件   | @Param(type=Part)           | @RequestHeader    | @HeaderParam | 多值             | 所有Part的Map      |
| Body           | 请求body        | @Param(type=Body)           | @RequestBody      | @Body        | 尝试解析为数组或集合     | 尝试解析为目标类型       |
| PathVariable   | path变量        | @Param(type=PathVariable)   | @PathVariable     | @PathParam   | 单值数组或集合        | 单值Map           |
| MatrixVariable | matrix变量      | @Param(type=MatrixVariable) | @MatrixVariable   | @MatrixParam | 多值             | 单值Map           |
| Bean           | java bean     | 无需注解                        | @ModelAttribute   | @BeanParam   | 尝试解析为Bean数组或集合 | -               |

<a name="fjYQ8"></a>

#### 特殊类型参数

| 类型                                            | 说明                        | 激活条件              |
|-----------------------------------------------|---------------------------|-------------------|
| org.apache.dubbo.remoting.http12.HttpRequest  | HttpRequest对象             | 默认激活              |
| org.apache.dubbo.remoting.http12.HttpResponse | HttpResponse对象            | 默认激活              |
| org.apache.dubbo.remoting.http12.HttpMethods  | 请求Http方法                  | 默认激活              |
| java.util.Locale                              | 请求Locale                  | 默认激活              |
| java.io.InputStream                           | 请求输入流                     | 默认激活              |
| java.io.OutputStream                          | 响应输出流                     | 默认激活              |
| javax.servlet.http.HttpServletRequest         | Servlet HttpRequest对象     | 引入Servlet API jar |
| javax.servlet.http.HttpServletResponse        | Servlet HttpResponse对象    | 同上                |
| javax.servlet.http.HttpSession                | Servlet HttpSession对象     | 同上                |
| javax.servlet.http.Cookie                     | Servlet Cookie对象          | 同上                |
| java.io.Reader                                | Servlet Request Reader对象  | 同上                |
| java.io.Writer                                | Servlet Response Writer对象 | 同上                |

<a name="zS6y1"></a>

#### 无注解参数

不同方言处理方式不同，请参见各方言使用说明
<a name="MikXl"></a>

#### 无入参方式获取 HTTP 输入输出参数

可通过 `RpcContext` 来获取

```java
// Dubbo http req/resp
HttpRequest request = RpcContext.getServiceContext().getRequest(HttpRequest.class);
HttpResponse response = RpcContext.getServiceContext().getRequest(HttpResponse.class);
// Servlet http req/resp
HttpServletRequest request = RpcContext.getServiceContext().getRequest(HttpServletRequest.class);
HttpServletResponse response = RpcContext.getServiceContext().getRequest(HttpServletResponse.class);
```

拿到request之后，通过 attribute
可以访问一些内置属性，参见：[RestConstants.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/RestConstants.java#L40)
<a name="I56vX"></a>

### 参数类型转换

默认支持大部分从 String 到目标类型的参数类型转换，主要包括以下几大类：

- Jdk内置类型，包括基础类型和日期、Optional等
- 数组类型
- 集合类型
- Map类型

同时也完整支持泛型类型，包括复杂嵌套，具体地实现代码参见: [GeneralTypeConverter.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/argument/GeneralTypeConverter.java)<br>
还支持通过实现SPI
`org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentConverter` 来自定义参数类型转换

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

### 支持的Content-Type

默认支持以下 Content-Type，提供相应的编码和解码功能。<br>还支持通过实现SPI
`org.apache.dubbo.remoting.http12.message.(HttpMessageDecoderFactory|HttpMessageEncoderFactory)`来扩展

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

### 内容协商

支持完善的内容协商机制，可根据映射或输入来协商输出的 Content-Type，具体流程如下：

1. 尝试读取 Mapping 指定的 mediaType，获取 Produces指定的 mediaType 列表，并将通配符匹配到合适的 Media Type。例如Spring的:
   `@RequestMapping(produces = "application/json")`
2. 尝试通过 Accept 头查找 mediaType，解析请求的 `Accept` 头，并将通配符匹配到合适的 Media Type。例如：
   `Accept: application/json`
3. 尝试通过 format 参数查找 mediaType，读取 format 参数值，做为文件后缀匹配到合适的 Media Type。例如 `/hello?format=yml`
4. 尝试通过请求路径的扩展名查找 mediaType，扩展名做为文件后缀匹配到合适的 Media Type。例如 `/hello.txt`
5. 尝试读取请求的 Content-Type 头做为 Media Type（两种form类型除外）。例如 `Content-Type: application/json`
6. 使用 `application/json` 兜底
   <a name="DtUnB"></a>

### CORS支持

提供完整的CORS支持，通过配置全局参数即可启用，默认行为和SpringMVC一致，同时在SpringMVC方言中，也支持通过
`@CrossOrigin` 来做精细化配置。<br>支持的CORS 配置项参见：[8.4CORS配置](#NLQqj)
<a name="O4KNd"></a>

### 自定义HTTP输出

很多场景需要对HTTP输出进行定制，比如做302跳转，写Http头，为此 Triple Rest提供以下通用方案，同时也支持各方言的特定写法，详情参见各方言使用指南

- 返回值设置为： `org.apache.dubbo.remoting.http12.HttpResult` 可通过 `HttpResult#builder` 来构建
- 抛出Payload异常：
  `throws new org.apache.dubbo.remoting.http12.exception.HttpResultPayloadException(HttpResult)` 示例代码:

```java
throw new HttpResult.found("https://a.com").

toPayload();
```

此异常已避免填充错误栈，对性能无太大影响，并且不用考虑返回值逻辑，推荐用这个方式来定制输出

- 获取 HttpResponse 后自定义，实例代码：

```java
HttpResponse response = RpcContext.getServiceContext().getRequest(HttpResponse.class);

response.

sendRedirect("https://a.com");
response.

setStatus(404);
response.

outputStream().

write(data);
// 写完输出建议 commit 来避免被其他扩展改写
response.

commit();
```

如果只是增加 `http header` 推荐用这个方式
<a name="OlLbS"></a>

### 自定义JSON序列化

<a name="XeDPr"></a>

### 异常处理

未被处理的异常最终被转换成 `ErrorResponse` 类编码后输出：

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

注意对于500及以上错误，为避免泄露服务端内部信息，默认只会输出 message "Internal Server Error"，如果需要自定义 message 可创建继承自
`org.apache.dubbo.remoting.http12.exception.HttpStatusException` 异常并重写
`getDisplayMessage` 方法。<br>提供了以下通用方法来定制异常处理：

- 参考 [9.2自定义异常返回结果](#zFD9A) 使用SPI 自定义全局异常处理
- 使用 Dubbo的 Filter SPI 来加工转换异常，如果需要访问 Http 上下文，可继承 `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilterAdapter`
- 使用 SPI `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilter` 来转换异常，使用上更轻量并提供路径匹配配置能力

注意后2项只能拦截 invoke 链中出现的异常，如果在路径匹配阶段出现异常，只有有方法1能处理
<a name="GdlnC"></a>

## Basic使用指南

示例参见：[dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic)
<a name="yCnsD"></a>

### 路径映射

Basic做为开箱即用 Rest 映射，默认会将方法映射到: `/{contextPath}/{serviceInterface}/{methodName}` ，其中
`/{contextPath}` 如果协议没有配置会忽略，即为：`/{serviceInterface}/{methodName}`<br>映射的自定义通过注解
`org.apache.dubbo.remoting.http12.rest.Mapping` 来支持，属性说明如下：

| 配置名        | 说明                                  | 默认行为        |
|------------|-------------------------------------|-------------|
| `value`    | 映射的 URL 路径，可以是一个或多个路径。              | 空数组         |
| `path`     | 映射的 URL 路径，与 `value` 相同，可以是一个或多个路径。 | 空数组         |
| `method`   | 支持的 HTTP 方法列表，例如 `GET`、`POST` 等。    | 空数组（支持所有方法） |
| `params`   | 请求必须包含的参数列表。                        | 空数组         |
| `headers`  | 请求必须包含的头部列表。                        | 空数组         |
| `consumes` | 处理请求的内容类型（Content-Type），可以是一个或多个类型。 | 空数组         |
| `produces` | 生成响应的内容类型（Content-Type），可以是一个或多个类型。 | 空数组         |
| `enabled`  | 是否启用该映射。                            | `true`（启用）  |

- 属性支持用占位符方式配置：`@Mapping("${prefix}/hi")`
- 如果不希望特定服务或方法被 rest 导出，可以通过设置 `@Mapping(enabled = false)` 解决
  <a name="mnjpv"></a>

### 入参类型

通用入参见：[3.2入参类型](#kmCzf)
<a name="pqC9y"></a>

#### 无注解参数

Basic
的无注解参数由类：[FallbackArgumentResolver.java](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/support/basic/FallbackArgumentResolver.java#L41)
支持，具体处理流程如下：<br>![rest-arg.jpg](/imgs/v3/manual/java/protocol/rest-arg.jpg)
<a name="nilSu"></a>

## SpringMVC使用指南

示例参见：[dubbo-samples-triple-rest/dubbo-samples-triple-rest-springmvc](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-springmvc)
<a name="m2q2A"></a>

### 路径映射

直接参考SpringMVC文档即可，支持绝大多数特性，[Mapping Requests :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html#mvc-ann-requestmapping-uri-templates)<br>
注意无需
`@Controller` 或 `@RestController` 注解，除了 `@RequestMapping` 还支持新的 `@HttpExchange`
<a name="zJiVQ"></a>

### 入参类型

<a name="p6VR0"></a>

#### 通用入参

参见：[3.2入参类型](#kmCzf)
<a name="Ukbuz"></a>

#### 注解类型参数

参见 [3.2.1通用类型参数](#dCgzz)
<a name="xuy6I"></a>

#### 特殊类型参数

| 类型                                                       | 说明                 | 激活条件          |
|----------------------------------------------------------|--------------------|---------------|
| org.springframework.web.context.request.WebRequest       | WebRequest对象       | 引入SpringWeb依赖 |
| org.springframework.web.context.request.NativeWebRequest | NativeWebRequest对象 | 同上            |
| org.springframework.http.HttpEntity                      | Http实体             | 同上            |
| org.springframework.http.HttpHeaders                     | Http头              | 同上            |
| org.springframework.util.MultiValueMap                   | 多值Map              | 同上            |

<a name="p64XS"></a>

#### 无注解参数

- 如果是基本类型 (
  根据 [TypeUtils#isSimpleProperty](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/util/TypeUtils.java#L105)
  判断)，直接从Parameter中获取
- 如果非基本类型，使用 [@ModelAttribute :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html)
  来绑定复杂 bean 类型参数
  <a name="w0D3L"></a>

### 参数类型转换

优先使用 Spring 的 `org.springframework.core.convert.ConversionService` 来转换参数，如果应用为spring boot应用则默认使用
`mvcConversionService` 否则使用
`org.springframework.core.convert.support.DefaultConversionService#getSharedInstance` 获取共享
`ConversionService` <br>如果 `ConversionService` 不支持则会回退到通用类型转换：[3.3参数类型转换](#I56vX)
<a name="DIwI5"></a>

### 异常处理

除了支持 [3.8异常处理](#XeDPr) 中提到的方式，还支持 Spring
`@ExceptionHandler` 注解方式，[Exceptions :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html)
，注意通过这种方式仅能处理方法调用时抛出的异常，其他异常无法捕获
<a name="twi2x"></a>

### CORS配置

除了支持 [8.4CORS配置](#NLQqj) 全局配置，还支持 Spring
`@CrossOrigin` 来精细化配置，[CORS :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html#mvc-cors-controller)
<a name="GSx1f"></a>

### 自定义HTTP输出

支持以下 Spring 自定义方式：

1. 使用 `@ResponseStatus` 注解
2. 返回 `org.springframework.http.ResponseEntity` 对象
   <a name="HGZX4"></a>

### 支持的扩展

- org.springframework.web.servlet.HandlerInterceptor<br>使用方式类似 [7.1使用 Filter 扩展](#xCEi3)
  <a name="cjzUk"></a>

## JAX-RS使用指南

示例参见：[dubbo-samples-triple-rest/dubbo-samples-triple-rest-jaxrs](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-jaxrs)
<a name="QxR7G"></a>

### 路径映射

Service需要显式添加注解@Path，方法需要添加@GET、@POST、@HEAD等请求方法注解<br>
直接参考Resteasy文档即可，支持绝大多数特性，[Chapter 4. Using @Path and @GET, @POST, etc](https://docs.jboss.org/resteasy/docs/6.2.7.Final/userguide/html/ch04.html)
<a name="TfvLf"></a>

### 入参类型

<a name="HhsqE"></a>

#### 通用入参

参见：[3.2入参类型](#kmCzf)
<a name="GuQvr"></a>

#### 注解类型参数

| 注解           | 参数位置        | 说明                             |
|--------------|-------------|--------------------------------|
| @QueryParam  | querystring | ?a=a&b=b对应的参数                  |
| @HeaderParam | header      |                                |
| @PathParam   | path        | <br>                           |
| @FormParam   | form        | body为key1=value2&key2=value2格式 |
| 无注解          | body        | 不显式使用注解                        |

<a name="HmEQe"></a>

#### 特殊类型参数

| 类型                              | 说明       | 激活条件       |
|---------------------------------|----------|------------|
| javax.ws.rs.core.Cookie         | Cookie对象 | 引入Jax-rs依赖 |
| javax.ws.rs.core.Form           | 表单对象     | 同上         |
| javax.ws.rs.core.HttpHeaders    | Http头    | 同上         |
| javax.ws.rs.core.MediaType      | 媒体类型     | 同上         |
| javax.ws.rs.core.MultivaluedMap | 多值Map    | 同上         |
| javax.ws.rs.core.UriInfo        | Uri信息    | 同上         |

<a name="f4wnR"></a>

#### 无注解参数

- 如果是基本类型 (
  根据 [TypeUtils#isSimpleProperty](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.5/dubbo-rpc/dubbo-rpc-triple/src/main/java/org/apache/dubbo/rpc/protocol/tri/rest/util/TypeUtils.java#L105)
  判断)，直接从Parameter中获取
- 如果非基本类型， 将其视为请求体 (body)来解码对象
  <a name="iXjJH"></a>

### 参数类型转换

可通过扩展自定义参数转换，扩展接口:

```
org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver
javax.ws.rs.ext.ParamConverterProvider
```

<a name="XRrsZ"></a>

### 异常处理

可通过扩展自定义异常处理，扩展接口:

```
javax.ws.rs.ext.ExceptionMapper
org.apache.dubbo.remoting.http12.ExceptionHandler
```

<a name="rJBUU"></a>

### CORS配置

支持 [8.4CORS配置](#NLQqj) 全局配置
<a name="JI88c"></a>

### 自定义HTTP输出

支持以下 Jaxrs 自定义方式：

- 返回 `javax.ws.rs.core.Response` 对象
  <a name="BOh83"></a>

### 支持的扩展

1. javax.ws.rs.container.ContainerRequestFilter<br>请求过滤器，允许在请求到达资源方法之前对请求进行预处理。
2. javax.ws.rs.container.ContainerResponseFilter<br>响应过滤器，允许在响应离开资源方法之后对响应进行后处理。
3. javax.ws.rs.ext.ExceptionMapper<br>异常映射器，将抛出的异常映射为HTTP响应。
4. javax.ws.rs.ext.ParamConverterProvider<br>参数转换器，允许将请求参数转换为资源方法的参数类型。
5. javax.ws.rs.ext.ReaderInterceptor<br>读取拦截器，允许在读取请求实体时进行拦截和处理。
6. javax.ws.rs.ext.WriterInterceptor<br>写入拦截器，允许在写入响应实体时进行拦截和处理。
   <a name="TL2NU"></a>

## Servlet使用指南

同时低版本javax和高版本jakarta servlet API，jakarta API 优先级更高，只需要引入jar即可使用HttpServletRequest和HttpServletResponse作为参数
<a name="xCEi3"></a>

### 使用 Filter 扩展

方法1，实现 `Filter` 接口和 `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtension` 接口，然后注册SPI

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

方法2，实现 `Supplier<Filter>` 接口和 `org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtension` 接口，然后注册SPI

```java
public class DemoFilter implements Supplier<Filter>, RestExtension {

    private final Filter filter = new SsoFilter();

    @Override
    public Filter get() {
        return filter;
    }
}
```

这种方式对于重用已有 Filter 非常方便，甚至可以从 Spring Context 中获取 Filter 实例并注册

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

### HttpSession支持

实现 SPI `org.apache.dubbo.rpc.protocol.tri.rest.support.servlet.HttpSessionFactory`
<a name="qYI1a"></a>

### 尚不支持的特性

- Filter 中 wrap request 和 response对象不会生效，原因是 Rest支持的 过滤器种类很多，使用wrapper会导致反复嵌套，处理过于复杂
- 不支持 `request.getRequestDispatcher`
  <a name="Sxium"></a>

## 全局参数配置

<a name="rerFd"></a>

### 大小写敏感

配置名：`dubbo.protocol.triple.rest.case-sensitive-match`<br>是否路径匹配应区分大小写。如果启用，映射到 `/users` 的方法不会匹配到
`/Users`<br>默认为 `true`
<a name="f1OJD"></a>

### 尾匹配

配置名：`dubbo.protocol.triple.rest.trailing-slash-match`<br>是否路径匹配应匹配带有尾部斜杠的路径。如果启用，映射到
`/users` 的方法也会匹配到 `/users/`<br>默认为 `true`
<a name="U3mWL"></a>

### 扩展名匹配

配置名：`dubbo.protocol.triple.rest.suffix-pattern-match`<br>是否路径匹配使用后缀模式匹配(.*) ，如果启用，映射到
`/users` 的方法也会匹配到 `/users.*` ，后缀内容协商会被同时启用，媒体类型从URL后缀推断，例如 `.json` 对应
`application/json`<br>默认为 `true`
<a name="NLQqj"></a>

### CORS配置

| 配置名                                                 | 说明                                                    | 默认值                     |
|-----------------------------------------------------|-------------------------------------------------------|-------------------------|
| `dubbo.protocol.triple.rest.cors.allowed-origins`   | 允许跨域请求的来源列表，可以是具体域名或特殊值 `*` 代表所有来源。                   | 未设置（不允许任何来源）            |
| `dubbo.protocol.triple.rest.cors.allowed-methods`   | 允许的 HTTP 方法列表，例如 `GET`、`POST`、`PUT` 等，特殊值 `*` 代表所有方法。 | 未设置（仅允许 `GET` 和 `HEAD`） |
| `dubbo.protocol.triple.rest.cors.allowed-headers`   | 预检请求中允许的请求头列表，特殊值 `*` 代表所有请求头。                        | 未设置                     |
| `dubbo.protocol.triple.rest.cors.exposed-headers`   | 实际响应中可以暴露给客户端的响应头列表，特殊值 `*` 代表所有响应头。                  | 未设置                     |
| `dubbo.protocol.triple.rest.cors.allow-credentials` | 是否支持用户凭证。                                             | 未设置（不支持用户凭证）            |
| `dubbo.protocol.triple.rest.cors.max-age`           | 预检请求的响应可以被客户端缓存的时间（以秒为单位）。                            | 未设置                     |

<a name="hAbrw"></a>

## 高级使用指南

<a name="wKrDG"></a>

### 支持的扩展点汇总

1. javax.servlet.Filter<br> Servlet API过滤器。
2. org.apache.dubbo.rpc.protocol.tri.rest.support.servlet.HttpSessionFactory<br>用于在Servlet API中支持 HttpSession。
3. javax.ws.rs.container.ContainerRequestFilter<br>用于在JAX-RS中实现请求过滤器，允许在请求到达资源方法之前对请求进行预处理。
4. javax.ws.rs.container.ContainerResponseFilter<br>用于在JAX-RS中实现响应过滤器，允许在响应离开资源方法之后对响应进行后处理。
5. javax.ws.rs.ext.ExceptionMapper<br>用于在JAX-RS中实现异常映射器，将抛出的异常映射为HTTP响应。
6. javax.ws.rs.ext.ParamConverterProvider<br>用于在JAX-RS中提供参数转换器，允许将请求参数转换为资源方法的参数类型。
7. javax.ws.rs.ext.ReaderInterceptor<br>用于在JAX-RS中实现读取拦截器，允许在读取请求实体时进行拦截和处理。
8. javax.ws.rs.ext.WriterInterceptor<br>用于在JAX-RS中实现写入拦截器，允许在写入响应实体时进行拦截和处理。
9. org.springframework.web.servlet.HandlerInterceptor<br>用于在Spring MVC中实现处理器拦截器。
10. org.apache.dubbo.remoting.http12.ExceptionHandler<br>提供异常自定义处理机制。
11. org.apache.dubbo.remoting.http12.message.HttpMessageAdapterFactory<br>提供HTTP消息的适配和转换功能。
12. org.apache.dubbo.remoting.http12.message.HttpMessageDecoderFactory<br>提供HTTP消息的解码功能。
13. org.apache.dubbo.remoting.http12.message.HttpMessageEncoderFactory<br>提供HTTP消息的编码功能。
14. org.apache.dubbo.rpc.HeaderFilter<br>用于在Dubbo RPC中实现头部过滤器，允许对请求和响应的头部进行过滤和处理。
15. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestHeaderFilterAdapter<br>头部过滤器适配器，提供访问http输入输出能力。
16. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilterAdapter<br>Dubbo Filter Rest适配器，提供访问http输入输出能力。
17. org.apache.dubbo.rpc.protocol.tri.route.RequestHandlerMapping<br>用于在Dubbo Triple中实现请求映射能力。
18. org.apache.dubbo.rpc.protocol.tri.rest.mapping.RequestMappingResolver<br>用于解析REST请求映射。
19. org.apache.dubbo.rpc.protocol.tri.rest.util.RestToolKit<br>提供REST相关的工具和实用程序。
20. org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentConverter<br>提供参数的类型转换功能。
21. org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver<br>提供参数的解析功能。
22. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestFilter<br>提供REST请求和响应的过滤功能。
23. org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtensionAdapter<br>提供RestExtension的adapt能力，将已有filter接口映射到RestFilter接口。
    <a name="zFD9A"></a>

### 自定义异常返回结果

通过 SPI `org.apache.dubbo.remoting.http12.ExceptionHandler` 来自定义异常处理逻辑

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

实现 SPI 并将泛型 E 指定为需要处理的异常类型

- resolveLogLevel<br>Dubbo框架内部会打印Rest处理异常日志，可以通过实现这个方法来自定义需要打印的日志级别或忽略日志。
- handle<br>如果返回结果不是 null ，则将直接输出返回结果，可以通过返回
  `org.apache.dubbo.remoting.http12.HttpResult` 来定制输出的 headers 和 status code。
  <a name="hvJ5F"></a>

### 打开debug日志

```yaml
logging:
  level:
    "org.apache.dubbo.rpc.protocol.tri": debug
    "org.apache.dubbo.remoting": debug
```

开启 debug 日志会输出详细的启动日志和请求响应日志，便于排查问题。
<a name="UlKU9"></a>

### 打开verbose输出

```yaml
dubbo:
  protocol:
    triple:
      verbose: true
```

开启 verbose 输出会将内部错误堆栈返回给调用方，并输出更多错误日志，便于排查问题。
