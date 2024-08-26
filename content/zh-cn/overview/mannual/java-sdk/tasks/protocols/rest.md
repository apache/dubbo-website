---
aliases:
  - /zh/overview/tasks/protocols/
  - /zh-cn/overview/tasks/protocols/
description: "演示了如何以标准 `rest` 请求访问 triple、dubbo 协议发布的服务。"
hide: true
linkTitle: rest协议
title: 发布 REST 风格的服务
type: docs
weight: 3
---

{{% alert %}}
本文要讲的 "rest 协议" 实际上并不是一个真正的协议实现，而是关于如何使得 triple 协议支持以 rest 风格的 http 请求直接访问。
我们将演示如何使用 rest 请求访问标准 triple 协议的 Dubbo 服务。
{{% /alert %}}

{{% alert title="注意" color="warning" %}}
从 Dubbo 3.3 版本开始，rest 协议已移至 extensions 库，由 triple 协议来对 Rest 提供更全面的支持，新版本的内置协议实现只剩下 triple 和 dubbo。
<br>因此，当我们提到 rest 时，都是指 triple 协议的 rest 访问支持能力，具体参见 [Triple Rest用户手册](../../../reference-manual/protocol/tripe-rest-manual/)
{{% /alert %}}

在讲解 [triple 协议示例](../triple/interface/#curl) 时，我们曾提到 triple 协议支持以 `application/json` 格式直接访问：

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50052/org.apache.dubbo.samples.api.GreetingsService/sayHi/
```

如果你认为以上
`http://localhost:50052/org.apache.dubbo.samples.api.GreetingsService/sayHi` 格式的 path 请求不够友好，还可以通过注解自定义 http 请求的路径和方法等参数，
目前已支持 内置，Spring Web和JAX-RS 三种注解格式。以下示例的完整代码请参见 [dubbo-samples-triple-rest](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest)。

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

代码讲解：<br />可以看到输出了 "Hello world" ，有双引号是因为默认输出 content-type 为 application/json<br />通过这个例子可以了解 Triple 默认将服务导出到
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

代码讲解：<br />可以看到输出 Hello Mr. Yang, 3 ，没有双引号是因为通过指定后缀 txt 的方式要求用 `text/plain` 输出<br />通过这个例子可以了解如何通过 Mapping 注解来定制路径，通过 Param 注解来定制参数来源，并支持通过 post body 或 url方式传递参数，详细说明参见： [Basic使用指南](../../../reference-manual/protocol/tripe-rest-manual/#GdlnC)
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

## 实际应用场景

接下来，我们看一下在 triple 协议支持 rest 格式访问后，能被应用于哪些场景中解决实际问题。

### Spring Cloud 互调

首先，第一个场景就是实现 Dubbo 体系与 http 微服务体系互通。

设想你是一条业务线负责人，你们有一套基于 Dubbo 开发的微服务集群，集群内服务间都是基于 triple 二进制协议通信；公司内还有一个重要业务，是跑在基于 Spring Cloud 开发的微服务集群上，而 Spring Cloud 集群内的服务间都是 http+json 协议通信。现在要实现这两个业务的互通，服务之间如何实现互调那？triple 协议支持 rest 格式访问可以解决这个问题，对于 Dubbo 微服务集群而言，相当于是对内使用 triple 二进制协议通信，对外交互使用 triple 提供的 rest 请求格式。

关于这部分的具体使用示例，请参考博客 [微服务最佳实践零改造实现 Spring Cloud、Apache Dubbo 互通](zh-cn/blog/2023/10/07/微服务最佳实践零改造实现-spring-cloud-apache-dubbo-互通/)。

### 网关流量接入

支持 rest 格式访问的另外一个非常有价值的场景就是方便网关流量接入。二进制格式的 rpc 协议接入一直是个难题，之前 dubbo 还特意提供了
`泛化调用` 来解决这个问题，网关可以基于泛化调用实现 `http -> dubbo` 协议转换来接入后端微服务集群。

现在，有了 rest 格式支持，无需任何网关做协议转换，即可实现去中心化接入。具体请参见 [HTTP 网关流量接入](../../gateway/)

