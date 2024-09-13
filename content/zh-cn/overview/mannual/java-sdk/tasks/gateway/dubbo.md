---
aliases:
    - /zh/overview/tasks/ecosystem/gateway/
    - /zh-cn/overview/tasks/ecosystem/gateway/
description: |
    本文介绍借助 Apache Higress 实现 Dubbo Service 服务代理，后端服务使用 dubbo 通信协议。
linkTitle: dubbo协议
title: 通过网关将 http 流量接入 Dubbo 后端服务
type: docs
weight: 2
---

由于 dubbo 协议是基于 TCP 的二进制私有协议，因此更适合作为后端微服务间的高效 RPC 通信协议，这也导致 dubbo 协议对于前端流量接入不是很友好。在 Dubbo 框架中，有两种方式可以帮助开发者解决这个问题：
* **多协议发布【推荐】**，为 dubbo 协议服务暴露 rest 风格的 http 协议访问方式，这种模式架构上会变得非常简单，通用的网关产品即可支持。
* **通过网关实现 `http->dubbo` 协议转换**，这种方式需要将 http 协议转换为后端服务能识别的 dubbo 协议，要求网关必须支持 dubbo 协议。

## 同时发布 http、dubbo 协议
**如果我们能让一个服务同时发布 dubbo、http 协议，这样后端调用是基于高效的 dubbo 二进制协议，同时浏览器、web服务等前端设施也可以用 http 协议访问到相同的服务。** 好消息是，Dubbo 框架支持为同一个服务发布多个协议，并且支持客户端通过同一个端口以不同的协议访问服务，如下所示：

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/dubbo-rest.png"/>

为了实现同时发布 dubbo、http 协议，我们只需要在配置文件中增加一行配置即可：

```yaml
dubbo:
  protocol:
    dubbo: dubbo
    port: 20880
    ext-protocol: tri
```

增加 `ext-protocol: tri` 配置后，进程就可以在 20880 端口上提供 http 服务了，这点我们从之前的 triple 协议中有过具体了解了，启用应用后就可以在 20880 端口访问：

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:20880/org.apache.dubbo.protocol.multiple.demo.DemoService/sayHello
```

此时，网关就可以直接以 http 方式接入后端 dubbo 服务，任何 http 网关都可以非常容易接入，操作非常简洁明了。

{{% alert title="注意" color="info" %}}
另外，关于 dubbo、triple 多协议发布的完整示例源码和讲解可参见 [dubbo+rest 双协议发布的示例](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/multi-protocols/)。
{{% /alert %}}

如果你对 `/org.apache.dubbo.protocol.multiple.demo.DemoService/sayHello` 格式的前端访问路径不满意，可以选择发布 rest 风格的 http 接口，我们只需要在接口上增加注解即可（目前支持 Spring Web、JAX-RS 两种注解）。如下所示，假设我们已经有一个名为 DemoService 的 dubbo 服务，只需要增加以下注解：

```java
@RestController
@RequestMapping("/triple")
public interface DemoService {
    @GetMapping(value = "/demo")
    String sayHello();
}
```

这样，就能发布同时支持 dubbo、rest 两种协议的服务，对于 http 网关接入更为简单便捷，唯一成本是需要改造接口增加注解。

为 dubbo 协议服务增加了 http 访问方式之后，就可以很容易的将 dubbo 服务接入网关了，具体可以参见下一小节中的 [triple 协议网关接入](/zh-cn/overview/mannual/java-sdk/tasks/gateway/triple/) 示例，那里有详细的说明。

## http 转 dubbo 协议
{{% alert title="注意" color="warning" %}}
如果您使用的是 Dubbo3 3.3.x 版本，在决定考虑此方案之前，我们强烈推荐您仔细评估本文前一节的 `多协议发布方案`。除非您因为某些特殊原因真的无法接受多协议发布带来的应用改造成本（实际上只是改一行配置而已），否则这个方案应该作为第二选择。
{{% /alert %}}

如果要从网关接入后端 dubbo 服务，则前端的 HTTP 流量要经过一层 `http -> dubbo` 的协议转换才能实现正常调用

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/http-to-dubbo.png"/>

如上图所示，从浏览器、手机或者 Web 服务器发送的 HTTP 请求，经过网关进行 http 到 dubbo 协议转换，网关最终转发 dubbo 协议到后端微服务集群。因此，我们需要一个支持 dubbo 协议转换的网关，来帮助实现协议转发，以下是该架构下网关需要实现的几个关键点：
* **协议转换**，支持 http 到 dubbo 的协议转换，包括参数映射。
* **自动地址发现**，支持 Nacos、Zookeeper、Kubernetes 等主流注册中心，动态感知后端 dubbo 实例变化。
* **结合 dubbo 协议的路由**，如在发起 dubbo 协议调用时，支持按照特定规则地址筛选、传递附加参数到 dubbo 后端服务。

目前市面上支持 dubbo 协议接入、且对以上三点提供比较完善支持的开源网关产品众多，包括大家 Higress、Apache APISIX、Apache Shenyu 等。接下来，让我们通过一些示例来了解网关产品搭配 Dubbo 的具体使用方法吧：
*  [使用 Higress 代理 Dubbo 流量]({{< relref "../../../../../../blog/integration/how-to-proxy-dubbo-in-higress" >}})
*  [使用 Apache APISIX 代理 Dubbo 流量]({{< relref "../../../../../../blog/integration/how-to-proxy-dubbo-in-apache-apisix" >}})
*  [使用 Apache Shenyu 代理 Dubbo 流量]({{< relref "../../../../../../blog/integration/how-to-proxy-dubbo-in-apache-shenyu" >}})

如果您并没有使用现成的网关产品，而是使用自建的流量转换组件，您很有可能使用到了 Dubbo 框架中的 [**泛化调用**](/zh-cn/overview/mannual/java-sdk/tasks/framework/more/generic/) 机制，具体请参考相关文档了解详情。
