---
aliases:
  - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/3.3/
  - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/3.3/
description: "本文介绍 triple 协议在 3.3 版本中的新特性"
linkTitle: Triple 3.3新特性
title: Triple 3.3新特性
type: docs
weight: 5
---

<a name="lipv5"></a>

## 全新的 Rest 支持

<a name="BrKuK"></a>

### 特性

在3.3版本中，基于现有 HTTP 协议栈，triple实现了全面的 REST 风格服务导出能力，无需使用泛化或网关层协议转换，无需配置，用户即可通过 HTTP 协议去中心化直接访问后端的 Triple 协议服务。同时，针对高级
REST 用法，如路径定制、输出格式定制和异常处理，提供了丰富的注解和
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

### 示例

<a name="tiFyi"></a>

###### 示例代码

```java
package org.apache.dubbo.rest.demo;

import org.apache.dubbo.remoting.http12.rest.Mapping;
import org.apache.dubbo.remoting.http12.rest.Param;

// 服务接口
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

<a name="kZqN8"></a>

###### 下载运行示例

```bash
# 获取示例代码
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic
# 运行
mvn spring-boot:run
```

<a name="udlJN"></a>

###### curl测试

```bash
curl -v "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hello?name=world"
# 输出如下
#> GET /org.apache.dubbo.rest.demo.DemoService/hello?name=world HTTP/1.1
#>
#< HTTP/1.1 200 OK
#< content-type: application/json
#< content-length: 13
#<
#"Hello world"
#
# 代码讲解
# 可以看到输出了 "Hello world" ，有双引号是因为默认输出 content-type 为 application/json
# 通过这个例子可以了解 Triple 默认将服务导出到 /{serviceInterface}/{methodName}路径，并支持通过url方式传递参数

curl -v -H "c: 3" -d 'name=Yang' "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr"
# 输出如下
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
# 代码讲解
# 可以看到输出 Hello Mr. Yang, 3 ，没有双引号是因为通过指定后缀 txt 的方式要求用 text/plain 输出
 #通过这个例子可以了解如何通过 Mapping 注解来定制路径，通过 Param 注解来定制参数来源，并支持通过 post body 或 url方式传递参数
```

<a name="apMqg"></a>

### 详情文档

请访问用户手册：[Tripe Rest Manual](../tripe-rest-manual/)
<a name="pMgxF"></a>

## 支持Servlet接入

在3.3版本中，可复用Spring Boot已有servlet监听端口来接入 HTTP 流量， 无需Netty监听新端口，简化部署，降低维护成本。通过减少对外部端口的依赖，有助于轻松通过企业防火墙和网关，简化网络部署，增强企业级应用的可维护性和安全性。
<a name="n9HZO"></a>

### 示例

<a name="qP23R"></a>

###### 下载运行示例

```bash
# 获取样例代码
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-servlet
# 直接运行
mvn spring-boot:run
```

<a name="RuppW"></a>

###### curl测试

```shell
curl --http2-prior-knowledge -v 'http://localhost:50052/org.apache.dubbo.demo.GreeterService/sayHelloAsync?request=world'
# 输出如下
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

### 详情文档

请访问：[how-to-enable-servlet-support-for-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-servlet#how-to-enable-servlet-support-for-triple)
了解如何配置并启用 servlet 支持
<a name="uvvts"></a>

## 支持HTTP/3协议

<a name="anV9K"></a>

### 特性

在3.3版本中，triple实现了对HTTP/3协议的支持，rpc 请求和 rest 请求均可通过 HTTP/3 协议传输，使用 HTTP/3 可以带来一下好处：

- **提升性能**  
  支持 HTTP/3 后，利用 QUIC 协议降低延迟，加快请求响应速度，特别是在高延迟或复杂网络环境中，能够显著提升服务的整体性能。
- **增强可靠性**  
  HTTP/3 通过多路复用和连接迁移避免队头阻塞，即使在网络状况不佳时，也能保持连接的稳定性，确保服务的可靠交付。
- **提高安全性**  
  HTTP/3 强制要求 TLS1.3 加密，相比传统HTTP/2 可选加密，提供了更安全的通信保障。
- **适应弱网络环境**  
  在高丢包率或带宽不稳定的情况下，HTTP/3 能够维持较高地连接质量和服务性能，提升在弱网络环境中的性能。

由于 HTTP/3 基于 QUIC 协议（UDP），可能会被防火墙或网关阻止。因此，triple 实现了 HTTP/3 协商能力并默认启用。连接首先通过 HTTP/2 建立，如果成功且服务端返回表示支持 HTTP/3
的[Alt-Svc](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Alt-Svc) 头，客户端将自动切换到HTTP/3
<a name="TqXgf"></a>

### 示例

<a name="oSP0r"></a>

###### 下载运行示例

```bash
# 获取样例代码
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-http3
# 直接运行
mvn spring-boot:run
```

<a name="fb4sX"></a>

###### curl测试

请注意，curl 需要升级到支持 HTTP/3 的新版本， 参见：[https://curl.se/docs/http3.html](https://curl.se/docs/http3.html)

```shell

curl --http3 -vk 'https://localhost:50052/org.apache.dubbo.demo.GreeterService/sayHelloAsync?request=world'
# 输出如下
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

### 性能对比

#### 丢包率对 QPS 的影响

![http3-qps.jpg](/imgs/v3/manual/java/protocol/http3-qps.jpg)

#### 丢包率对 RT 的影响

![http3-rt.jpg](/imgs/v3/manual/java/protocol/http3-rt.jpg)

<a name="NIoKX"></a>

### 架构图

![http3-arch.jpg](/imgs/v3/manual/java/protocol/http3-arch.jpg)

### 详情文档

请访问：[how-to-enable-http3-support-for-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-http3#how-to-enable-http3-support-for-triple)
了解如何配置并启用 HTTP/3 支持
