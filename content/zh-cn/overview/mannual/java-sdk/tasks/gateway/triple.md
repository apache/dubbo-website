---
aliases:
    - /zh/overview/tasks/ecosystem/gateway/
    - /zh-cn/overview/tasks/ecosystem/gateway/
description: |
    本文为大家介绍了如何借助 Apache APISIX 实现 Dubbo Service 的代理，通过引入 dubbo-proxy 插件便可为 Dubbo 框架的后端系统构建更简单更高效的流量链路
linkTitle: triple协议
title: 通过网关将 http 流量接入 Dubbo 后端服务
type: docs
weight: 2
---

在 [triple协议规范]() 中我们曾详细介绍了 triple 对于浏览器、网关的友好性设计，其中非常重要的一点是 triple 同时支持跑在 HTTP/1、HTTP/2 上：
* 在后端服务之间使用高效的 triple 二进制协议。
* 对于前端接入层，则支持所有标准 HTTP 工具如 cURL 等以标准 `application/json` 格式请求后端服务。

接下来我们就看一下，对于前端 HTTP 流量而言，如何通过一些通用的网关产品快速接入后端的 triple 微服务体系。

## 原生 HTTP 接入

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/http-to-triple.png"/>

如上图所示，从浏览器、手机或 Web 服务器过来的 HTTP 请求，网关可直接以 `application/json` 格式转发给后端 Dubbo 服务，后端服务之间则继续走 triple 二进制协议。**由于进出网关的都是标准的 HTTP 流量，网关不需要做任何的私有协议转换工作，不需要任何定制化逻辑，只需专注于流量路由等职责即可。**

在真正的生产环境下，**唯一需要网关解决的只剩下地址发现问题，即如何动态感知后端 triple 服务的实例变化？** 好消息是，目前几款主流的开源网关产品如 Apache APISIX、Higress 等普遍支持以 Nacos、Zookeeper、Kubernetes 作为 upstream 数据源。

以下我们以 `APISIX + Nacos + Dubbo` 的典型用法为例，详细说明整套机制的工作流程。

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/apisix-nacos-dubbo.png"/>

Dubbo 后端应用就选用我们 quickstart 中的示例，其源码与启动方式可参见相应文档，在该示例中定义并发布了一个 `org.apache.dubbo.samples.quickstart.dubbo.api.DemoService` 的 triple 服务：

```java

```

在 APISIX 中配置 nacos upstream 及路由，即可实现后端实例地址自动发现（假设 APISIX 端口是 9080）：

```shell
curl http://127.0.0.1:9080/apisix/admin/routes/1 -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -i -d '
{
    "uri": "/org.apache.dubbo.samples.quickstart.dubbo.api.DemoService/sayHello/",
    "upstream": {
        "service_name": "dubbo-quickstart",
        "type": "roundrobin",
        "discovery_type": "nacos"
    }
}'
```

{{% alert title="注意" color="info" %}}
* 说一下示例用的是应用级服务发现。接口级服务发现如何配置？
{{% /alert %}}

通过 cURL 访问 APISIX 网关，可以实现对 triple 后端服务的调用：

```shell
$ curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://127.0.0.1:9080/org.apache.dubbo.samples.quickstart.dubbo.api.DemoService/sayHello/
```

`/org.apache.dubbo.samples.quickstart.dubbo.api.DemoService/sayHello/` 是后端 triple 服务原生的 http 访问路径。

{{% alert title="注意" color="info" %}}
* 说以下 json 格式参数问题？
{{% /alert %}}

`/org.apache.dubbo.samples.quickstart.dubbo.api.DemoService/sayHello/` 这种根据 Java 路径名与方法直接暴露的访问路径，虽然可以很容易调通，但对于前端来说并不友好。接下来我们一起看一下如何发布 REST 风格的 HTTP 服务。

## REST 风格接口

在前面的示例中，如类似 `http://127.0.0.1:9080/triple/demo/hello` 会是更符合前端使用的访问方式，要做到这一点，我们可以通过在 APISIX 等网关配置 uri rewrite 重写，实现前端 `/triple/demo/hello` 到后端 `/org.apache.dubbo.samples.quickstart.dubbo.api.DemoService/sayHello/` 的映射。

除了配置网关 rewrite 重新规则之外，**Dubbo 框架还为 triple 服务暴露 REST 风格的 HTTP 访问路径提供了内置支持**，具体使用方式取决于你使用的是基于 [protobuf 的服务定义模式]()，还是基于 [java 接口的服务定义模式]()：
* Java 接口模式，通过直接为 java 接口增加注解可以同时发布 REST 风格服务，目前支持 Spring Web 与 JAX-RS 两套注解标准。
* Protobuf 模式，通过使用 grpc-gateway 可发布 REST 风格服务。

### Java接口模式(注解)
通过为 Java 接口增加以下任意一种注解，即可发布 triple 二进制、REST 风格的服务。这样配置之后，对于同一个服务，你既可以使用标准二进制 triple 格式访问服务，也可以使用 REST HTTP 方式以 JSON 格式访问服务。

Spring Web 风格注解：
```java
```

JAX-RS 风格注解：
```java
```

这种模式，我们在[【进阶学习 - 协议 - rest】]()一节中有更详细的说明和使用示例，可以前往查看。

### Protobuf模式(grpc-gateway)

grpc-gateway 的介绍，要确认 Dubbo 是否支持。

## 灰度发布
> 针对 triple 协议的灰度方案写一写。

1. `curl -H "x-traffic-type: gray"`
2. 网关配置好灰度规则，此时网关会选择好后端triple实例
3. 网关透传给 triple `/org.apache.dubbo.samples.quickstart.dubbo.api.DemoService/sayHello/`，dubbo进程读出来，并将某些参数透传给 attachment - dubbo.tag
4. dubbo.tag
	* 框架还是得自动传下去？但不force tag；额外增加参数放弃表示一次性
	* tracing 框架帮助往下传？

https://help.aliyun.com/zh/mse/use-cases/implement-full-link-phased-release-based-on-ingress-apisix-gateway

{{% alert title="注意" color="info" %}}
本文描述内容，仅适用于 Dubbo 3.3.0 之后发布的 triple 协议版本。
{{% /alert %}}
