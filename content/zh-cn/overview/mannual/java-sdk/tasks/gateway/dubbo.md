---
aliases:
    - /zh/overview/tasks/ecosystem/gateway/
    - /zh-cn/overview/tasks/ecosystem/gateway/
description: |
    本文为大家介绍了如何借助 Apache APISIX 实现 Dubbo Service 的代理，通过引入 dubbo-proxy 插件便可为 Dubbo 框架的后端系统构建更简单更高效的流量链路
linkTitle: dubbo协议
title: 通过网关将 http 流量接入 Dubbo 后端服务
type: docs
weight: 2
---


由于 dubbo 协议是基于 TCP 的二进制私有协议，因此更适合作为后端微服务间的高效 RPC 通信协议，这也导致 dubbo 协议对于前端流量接入不是很友好。在 Dubbo 框架中，有两种方式可以帮助开发者解决这个问题：
* **多协议发布**，为 dubbo 协议服务暴露 rest 风格的 http 协议访问方式，这种模式架构上会变得非常简单，通用的网关产品即可支持。
* **通过网关实现协议转换**，这种方式需要将 http 协议转换为后端服务能识别的 dubbo 协议，要求网关必须支持 dubbo 协议。

## 同时发布 rest、dubbo 协议
**如果我们能让一个服务同时发布 dubbo、http 协议，这样后端调用是基于高效的 dubbo 二进制协议，同时浏览器、web服务等前端设施也可以用 http 协议访问到相同的服务。** 好消息是，Dubbo 框架支持为同一个服务发布多个协议，并且支持客户端通过同一个端口以不同的协议访问服务，如下所示：

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/dubbo-rest.png"/>

要为我们的 dubbo 服务额外发布 http 访问方式，我们只需要在接口上增加注解即可（目前支持 Spring Web、JAX-RS 两种注解）。如下所示，假设我们已经有一个名为 DemoService 的 dubbo 服务，需要增加以下注解：

```java
@RestController
@RequestMapping("/dubbo")
public interface DemoService {
    @GetMapping(value = "/demo")
    String sayHello();
}
```

接下来，我们需要在配置文件中增加如下配置：
```yaml
dubbo:
  protocols:
    dubbo: dubbo
    port: 20880
    extra-protocols: rest
```

> 文档写的过程中，确认配置是否正确？是不是要配置到某个服务上，而不是配置全局多协议，因为没有注解的可能会报错（或者不让它报错）。

完整的示例请参见 [dubbo-samples 中增加一个 dubbo+rest 双协议发布的示例]()

## http 转 dubbo 协议

如果你觉得增加 rest 注解是一项很大的编程挑战，那么也是一个前端的 HTTP 流量要经过一层 `http -> dubbo` 的协议转换才能实现正常调用

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/http-to-dubbo.png"/>

如上图所示，从浏览器、手机或者 Web 服务器发送的 HTTP 请求，经过网关进行 http 到 dubbo 协议转换，网关最终转发 dubbo 协议到后端微服务集群。因此，我们需要一个支持 dubbo 协议转换的网关，来帮助实现协议转发，以下是该架构下网关需要实现的几个关键点：
* **协议转换**，支持 http 到 dubbo 的协议转换，包括参数映射。
* **自动地址发现**，支持 Nacos、Zookeeper、Kubernetes 等主流注册中心，动态感知后端 dubbo 实例变化。
* **结合 dubbo 协议的路由**，如在发起 dubbo 协议调用时，支持按照特定规则地址筛选、传递附加参数到 dubbo 后端服务。

目前市面上支持 dubbo 协议接入、且对以上三点提供比较完善支持的开源网关产品众多，包括大家 Apache APISIX、Higress、Apache Shenyu 等。接下来，让我们通过一些示例来了解网关产品搭配 Dubbo 的具体使用方法把。

### 案例
我们有非常详细的网关接入 dubbo 案例，请参考：
*  [使用 Apache APISIX 代理 Dubbo 流量]({{< relref "../../../../../../blog/integration/how-to-proxy-dubbo-in-apache-shenyu" >}})
*  [使用 Apache Shenyu 代理 Dubbo 流量]({{< relref "../../../../../../blog/integration/how-to-proxy-dubbo-in-apache-shenyu" >}})
*  [使用 Higress 代理 Dubbo 流量]({{< relref "../../../../../../blog/integration/how-to-proxy-dubbo-in-higress" >}})
