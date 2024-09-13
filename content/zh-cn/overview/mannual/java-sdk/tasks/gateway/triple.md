---
aliases:
    - /zh/overview/tasks/ecosystem/gateway/
    - /zh-cn/overview/tasks/ecosystem/gateway/
description: |
    通过 Higress 云原生网关实现 Dubbo Service 代理，支持 triple 协议。
linkTitle: triple协议
title: 通过网关将 http 流量接入 Dubbo 后端服务
type: docs
weight: 3
---

在 [triple协议规范](/zh-cn/overview/reference/protocols/triple-spec/) 中我们曾详细介绍了 triple 对于浏览器、网关的友好性设计，其中非常重要的一点是 triple 同时支持跑在 HTTP/1、HTTP/2 上：
* 在后端服务之间使用高效的 triple 二进制协议。
* 对于前端接入层，则支持所有标准 HTTP 工具如 cURL 等以标准 `application/json` 、`application/yaml` 等格式请求后端服务。

接下来我们就看一下，对于前端 HTTP 流量而言，如何通过一些通用的网关产品快速接入后端的 triple 微服务体系。

{{% alert title="注意" color="warning" %}}
使用 triple 协议后，不再需要泛化调用、`http -> dubbo` 协议转换等步骤，任何主流的网关设备都可以通过 http 流量直接访问后端 triple 协议服务。
具体参见 [发布 REST 风格的服务](../../protocols/rest/)
{{% /alert %}}

## 原生 HTTP 接入

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/http-to-triple.png"/>

如上图所示，从浏览器、手机或 Web 服务器过来的 HTTP 请求，网关可直接转发给后端 Dubbo 服务，后端服务之间则继续走 triple 二进制协议。**由于进出网关的都是标准的 HTTP 流量，网关不需要做任何的私有协议转换工作，不需要任何定制化逻辑，只需专注于流量路由等职责即可。**

在真正的生产环境下，**唯一需要网关解决的只剩下地址发现问题，即如何动态感知后端 triple 服务的实例变化？** 好消息是，目前几款主流的开源网关产品如 Apache APISIX、Higress 等普遍支持以 Nacos、Zookeeper、Kubernetes 作为 upstream 数据源。

以下我们以 `Higress + Nacos + Dubbo` 的典型用法为例，详细说明整套机制的工作流程。

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/triple-higress.png"/>

### 启动示例应用

本示例完整源码请参见 [dubbo-samples-gateway-higress-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple)。

该示例中定义并发布了一个定义为 `org.apache.dubbo.samples.gateway.api.DemoService` 的 triple 服务：

```java
public interface DemoService {
    String sayHello(String name);
}
```

接下来，我们演示如何启动 Dubbo 服务，并使用 Higress 网关转发请求到后端服务。

### 接入 Higress 网关

接下来，我们具体演示 Higress 网关接入应用的具体步骤。包括部署 Dubbo 应用、Nacos 注册中心、Higress 网关等。

#### 安装 Higress 和 Nacos

以下示例部署在 Kubernetes 环境，因此请确保您已经连接到一个可用 Kubernetes 集群。

1. 安装 Higress，参考 [Higress安装部署文档](https://higress.io/zh-cn/docs/ops/deploy-by-helm)

2. 安装 Nacos，运行

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple/deploy/nacos/Nacos.yaml
```

#### 启动 Dubbo 应用

将以上示例应用打包为 docker image 后（这里我们使用官方示例提前打包好的镜像），以标准 Kubernetes Deployment 形式启动应用：

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple/deploy/provider/Deployment.yaml
```

具体的部署文件定义如下：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: gateway-higress-triple-provider
    namespace: default
    labels:
        app: gateway-higress-triple-provider
spec:
    replicas: 1
    selector:
        matchLabels:
            app: gateway-higress-triple-provider
    template:
        metadata:
            labels:
                app: gateway-higress-triple-provider
        spec:
            containers:
                -   name: gateway-higress-triple-provider
                    image: docker.io/allenyi/higress-triple:2.0.0
                    imagePullPolicy: IfNotPresent
                    ports:
						# 与容器暴露的端口一致
                        - containerPort: 50052
                    env:
						# 配置Nacos注册中心地址，对应Dubbo服务配置中的${nacos.address:127.0.0.1}
                        - name: NACOS_ADDRESS
                          value: nacos-server.default.svc.cluster.local
```

#### 通过 Higress 转发请求到 Dubbo 服务

Higress 可以通过 McpBridge 来对接 Nacos 作为服务来源，在 K8s 集群中 apply 以下资源来配置 McpBridge：

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple/deploy/mcp/mcpbridge.yaml
```

以上安装的 McpBridge 资源的具体定义如下：

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: nacos-service-resource
  namespace: higress-system
spec:
  registries:
  - domain: nacos-server.default.svc.cluster.local
    nacosGroups:
    - DEFAULT_GROUP
    name: nacos-service-resource
    port: 8848
    type: nacos2
```

> 更多详细配置参考[McpBridge配置说明](https://higress.io/zh-cn/docs/user/mcp-bridge)


接下来我们创建如下 Ingress，从而创建一条指向 Dubbo 服务的 HTTP 路由：

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple/deploy/ingress/Ingress.yaml
```

这样，path 前缀为 `/org.apache.dubbo.samples.gateway.api.DemoService` 的请求就会被路由到我们刚刚创建的 Dubbo 服务上。

以上 apply 安装的具体资源定义如下：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    higress.io/destination: gateway-higress-triple-provider.DEFAULT-GROUP.public.nacos
  name: demo
  namespace: default #与应用部署namespace保持一致
spec:
    ingressClassName: higress
    rules:
        - http:
              paths:
                  - backend:
                        resource:
                            apiGroup: networking.higress.io
                            kind: McpBridge
                            name: default
                    path: /org.apache.dubbo.samples.gateway.api.DemoService
                    pathType: Prefix
```

注意这里通过注解 higress.io/destination 指定路由最终要转发到的目标服务： `gateway-higress-triple-provider`，gateway-higress-triple-provider 为刚刚启动 Dubbo 服务的应用名（这里依赖 Dubbo3 默认注册的应用粒度地址列表）。

对于 Nacos 来源的服务，这里的目标服务格式为：“服务名称.服务分组.命名空间ID.nacos”，注意这里需要遵循 DNS 域名格式，因此服务分组中的下划线'_'被转换成了横杠'-'。命名空间未指定时，这里默认值为"public"。

> 更多流量治理相关配置参考[Ingress Annotation 配置说明](https://higress.io/zh-cn/docs/user/annotation)和[通过Ingress Annotation实现高阶流量治理](https://higress.io/zh-cn/docs/user/annotation-use-case)

### 请求验证

通过 cURL 访问 Higress，可以实现对 triple 后端服务的调用：

```shell
$ curl "localhost/org.apache.dubbo.samples.gateway.api.DemoService/sayHello?name=HigressTriple"

"Hello HigressTriple"
```

{{% alert title="注意" color="info" %}}
这里要运行 `kubectl port-forward service/higress-gateway -n higress-system 80:80 443:443` 将集群内的 Higress 暴露出来才可访问。
{{% /alert %}}

`/org.apache.dubbo.samples.gateway.api.DemoService/sayHello/` 这种根据 Java 路径名与方法直接暴露的访问路径，虽然可以很容易调通，但对于前端来说并不友好。接下来我们一起看一下如何发布 REST 风格的 HTTP 服务。

## REST 风格接口

在前面的示例中，如类似 `http://127.0.0.1:9080/triple/demo/hello` 会是更符合前端使用的访问方式，要做到这一点，我们可以通过在 Higress 等网关配置 uri rewrite 重写，实现前端 `/triple/demo/hello` 到后端 `/org.apache.dubbo.samples.gateway.api.DemoService/sayHello/` 的映射。

除了配置网关 rewrite 重新规则之外，**Dubbo 框架还为 triple 服务暴露 REST 风格的 HTTP 访问路径提供了内置支持**，具体使用方式取决于你使用的是基于 [protobuf 的服务定义模式](/zh-cn/overview/mannual/java-sdk/tasks/protocols/triple/idl/)，还是基于 [java 接口的服务定义模式](/zh-cn/overview/mannual/java-sdk/tasks/protocols/triple/interface/)：
* Java 接口模式，通过直接为 java 接口增加注解可以同时发布 REST 风格服务，目前支持 Spring Web 与 JAX-RS 两套注解标准。
* Protobuf 模式，通过使用 grpc-gateway 可发布 REST 风格服务。

### 为服务定义增加注解
通过为 Java 接口增加以下任意一种注解，即可发布 triple 二进制、REST 风格的服务。这样配置之后，对于同一个服务，你既可以使用标准二进制 triple 格式访问服务，也可以使用 REST HTTP 方式以 JSON 格式访问服务。

Spring Web 风格注解：
```java
@RequestMapping("/triple/demo")
public interface DemoService {

    @RequestMapping(method = RequestMethod.GET, value = "/hello")
    String sayHello(@RequestParam("name") String name);

}
```

{{% alert title="注意" color="info" %}}
关于接口注解
* 在之前的示例 [dubbo-samples-gateway-higress-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple) 中已经启用，可查看源码了解实际用法。
* 在[【进阶学习 - 协议 - rest】](/zh-cn/overview/mannual/java-sdk/tasks/protocols/rest/)一节中有详细的说明和使用示例，也可以前往查看。
{{% /alert %}}

这时我们的路由前缀配置如下，Nacos 地址配置与之前保持一致，path 前缀改为访问更为友好的 `/triple/demo`：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    higress.io/destination: gateway-higress-triple-provider.DEFAULT-GROUP.public.nacos
  name: demo
  namespace: default
spec:
    ingressClassName: higress
    rules:
        - http:
              paths:
                  - backend:
                        resource:
                            apiGroup: networking.higress.io
                            kind: McpBridge
                            name: default
                    path: /triple/demo
                    pathType: Prefix
```

可以使用 `/triple/demo/hello` 访问服务：

```shell
$ curl "localhost/triple/demo/hello?name=HigressTriple"

"Hello HigressTriple"
```

{{% alert title="注意" color="info" %}}
本文描述内容，仅适用于 Dubbo 3.3.0 之后发布的 triple 协议版本。
{{% /alert %}}

## 参考连接
* [使用 Apache APISIX 代理 triple 协议流量](/zh-cn/blog/2024/04/22/使用-apache-apisix-代理-dubbo-服务triple协议/)
* [Higress 实现基于 http 协议微服务发现与路由配置](https://higress.io/zh-cn/docs/user/spring-cloud)