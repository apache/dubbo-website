---
aliases:
    - /zh/overview/tasks/mesh/migration/dubbo-mesh/
description: 本示例演示了如何使用 Istio+Envoy 的 Service Mesh 部署模式开发 Dubbo3 服务。Dubbo3 服务使用 Triple 作为通信协议，通信过程经过 Envoy 数据面拦截，同时使用标准 Istio 的流量治理能力治理 Dubbo。
linkTitle: 地址同步
title: 地址同步
type: docs
weight: 1
---



遵循以下步骤，可以轻松掌握如何开发符合 Service Mesh 架构的 Dubbo 服务，并将其部署到 Kubernetes 并接入 Istio 的流量治理体系。在此查看 [完整示例源码](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-mesh-k8s)

## 1 总体目标

* 部署 Dubbo 应用到 Kubernetes
* Istio 自动注入 Envoy 并实现流量拦截
* 基于 Istio 规则进行流量治理

## 2 基本流程与工作原理
这个示例演示了如何将 Dubbo 开发的应用部署在 Istio 体系下，以实现 Envoy 对 Dubbo 服务的自动代理，示例总体架构如下图所示。

![thinsdk](/imgs/v3/mesh/thinsdk-envoy.png)

完成示例将需要的步骤如下：

1. 创建一个 Dubbo 应用( [dubbo-samples-mesh-k8s](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-mesh-k8s) )
2. 构建容器镜像并推送到镜像仓库（ [本示例官方镜像](https://hub.docker.com/r/apache/dubbo-demo) ）
3. 分别部署 Dubbo Provider 与 Dubbo Consumer 到 Kubernetes 并验证 Envoy 代理注入成功
4. 验证 Envoy 发现服务地址、正常拦截 RPC 流量并实现负载均衡
5. 基于 Istio VirtualService 实现按比例流量转发

## 3 详细步骤

### 3.1 环境要求

请确保本地安装如下环境，以提供容器运行时、Kubernetes集群及访问工具

* [Docker](https://www.docker.com/get-started/)
* [Minikube](https://minikube.sigs.k8s.io/docs/start/)
* [Kubectl](https://kubernetes.io/docs/tasks/tools/)
* [Istio](https://istio.io/latest/docs/setup/getting-started/)
* [Kubens(optional)](https://github.com/ahmetb/kubectx)

通过以下命令启动本地 Kubernetes 集群

```shell
minikube start
```

通过 kubectl 检查集群正常运行，且 kubectl 绑定到默认本地集群

```shell
kubectl cluster-info
```

### 3.2 创建独立命名空间并开启自动注入

通过以下命令为示例项目创建独立的 Namespace `dubbo-demo`，同时开启 sidecar 自动注入。

```shell
# 初始化命名空间
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/Namespace.yml

# 切换命名空间
kubens dubbo-demo

# dubbo-demo 开启自动注入
kubectl label namespace dubbo-demo istio-injection=enabled

```

### 3.3 部署到 Kubernetes

#### 3.3.1 部署 Provider

```shell
# 部署 Service
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/provider/Service.yml

# 部署 Deployment
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/provider/Deployment.yml
```

以上命令创建了一个名为 `dubbo-samples-mesh-provider` 的 Service，注意这里的 service name 与项目中的 dubbo 应用名是一样的。

接着 Deployment 部署了一个 2 副本的 pod 实例，至此 Provider 启动完成。

可以通过如下命令检查启动日志。

```shell
# 查看 pod 列表
kubectl get pods -l app=dubbo-samples-mesh-provider

# 查看 pod 部署日志
kubectl logs your-pod-id
```

这时 pod 中应该有一个 dubbo provider 容器实例，同时还有一个 Envoy Sidecar 容器实例。

#### 3.3.2 部署 Consumer

```shell
# 部署 Service
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/consumer/Service.yml

# 部署 Deployment
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/consumer/Deployment.yml
```

部署 consumer 与 provider 是一样的，这里也保持了 K8S Service 与 Dubbo consumer application name(在 [dubbo.properties](https://github.com/apache/dubbo-samples/blob/master/3-extensions/registry//dubbo-samples-mesh-k8s/dubbo-samples-mesh-consumer/src/main/resources/spring/dubbo-consumer.properties) 中定义) 一致： `dubbo.application.name=dubbo-samples-mesh-consumer`。

> Dubbo Consumer 服务声明中还指定了消费的 Provider 服务（应用）名 `@DubboReference(version = "1.0.0", providedBy = "dubbo-samples-mesh-provider", lazy = true)`

### 3.4 检查 Provider 和 Consumer 正常通信

继执行 3.3 步骤后， 检查启动日志，查看 consumer 完成对 provider 服务的消费。

```shell
# 查看 pod 列表
kubectl get pods -l app=dubbo-samples-mesh-consumer

# 查看 pod 部署日志
kubectl logs your-pod-id

# 查看 pod isitio-proxy 日志
kubectl logs your-pod-id -c istio-proxy
```

可以看到 consumer pod 日志输出如下( Triple 协议被 Envoy 代理负载均衡):

```bash
==================== dubbo invoke 0 end ====================
[10/08/22 07:07:36:036 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18.96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 1 end ====================
[10/08/22 07:07:42:042 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18.96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

```

consumer istio-proxy 日志输出如下:

```shell
[2022-07-15T05:35:14.418Z] "POST /org.apache.dubbo.samples.Greeter/greet HTTP/2" 200
- via_upstream - "-" 19 160 2 1 "-" "-" "6b8a5a03-5783-98bf-9bee-f93ea6e3d68e"
"dubbo-samples-mesh-provider:50052" "172.17.0.4:50052"
outbound|50052||dubbo-samples-mesh-provider.dubbo-demo.svc.cluster.local 172.17.0.7:52768 10.101.172.129:50052 172.17.0.7:38488 - default
```

可以看到 provider pod 日志输出如下:

```shell
[10/08/22 07:08:47:047 UTC] tri-protocol-50052-thread-8  INFO impl.GreeterImpl: Server test dubbo tri mesh received greet request name: "service mesh"

[10/08/22 07:08:57:057 UTC] tri-protocol-50052-thread-9  INFO impl.GreeterImpl: Server test dubbo tri mesh received greet request name: "service mesh"
```

provider istio-proxy 日志输出如下:

```shell
[2022-07-15T05:25:34.061Z] "POST /org.apache.dubbo.samples.Greeter/greet HTTP/2" 200
- via_upstream - "-" 19 162 1 1 "-" "-" "201e6976-da10-96e1-8da7-ad032e58db47"
"dubbo-samples-mesh-provider:50052" "172.17.0.10:50052"
 inbound|50052|| 127.0.0.6:47013 172.17.0.10:50052 172.17.0.7:60244
  outbound_.50052_._.dubbo-samples-mesh-provider.dubbo-demo.svc.cluster.local default
```

### 3.5 流量治理 - VirtualService 实现按比例流量转发

部署 v2 版本的 demo provider
```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/provider/Deployment-v2.yml
```

设置 VirtualService 与 DestinationRule，观察流量按照 4:1 的比例分别被引导到 provider v1 与 provider v2 版本。
```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/traffic/virtual-service.yml
```

从消费端日志输出中，观察流量分布效果如下图：

```java
==================== dubbo invoke 100 end ====================
[10/08/22 07:15:58:058 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18.96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 101 end ====================
[10/08/22 07:16:03:003 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18.96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 102 end ====================
[10/08/22 07:16:08:008 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18.96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 103 end ====================
[10/08/22 07:16:13:013 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v2: 172.18.96.6:50052, client: 172.18.96.6, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 104 end ====================
[10/08/22 07:16:18:018 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18.96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 105 end ====================
[10/08/22 07:16:24:024 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18.96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 106 end ====================
[10/08/22 07:16:29:029 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18.96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 107 end ====================
[10/08/22 07:16:34:034 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18.96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 108 end ====================
[10/08/22 07:16:39:039 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18.96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

==================== dubbo invoke 109 end ====================
[10/08/22 07:16:44:044 UTC] main  INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello,service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18.96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"


```

### 3.6 查看 dashboard
Istio 官网查看 [如何启动 dashboard](https://istio.io/latest/docs/setup/getting-started/#dashboard)。

## 4 修改示例

> 1. 修改示例并非必须步骤，本小节是为想要调整代码并查看部署效果的读者准备的。
> 2. 注意项目源码存储路径一定是英文，否则 protobuf 编译失败。

修改 Dubbo Provider 配置 `dubbo-provider.properties`

```properties
# provider
dubbo.application.name=dubbo-samples-mesh-provider
dubbo.application.metadataServicePort=20885
dubbo.registry.address=N/A
dubbo.protocol.name=tri
dubbo.protocol.port=50052
dubbo.application.qosEnable=true
# 为了使 Kubernetes 集群能够正常访问到探针，需要开启 QOS 允许远程访问，此操作有可能带来安全风险，请仔细评估后再打开
dubbo.application.qosAcceptForeignIp=true
```

修改 Dubbo Consumer 配置 `dubbo-consumer.properties`

```properties
# consumer
dubbo.application.name=dubbo-samples-mesh-consumer
dubbo.application.metadataServicePort=20885
dubbo.registry.address=N/A
dubbo.protocol.name=tri
dubbo.protocol.port=20880
dubbo.consumer.timeout=30000
dubbo.application.qosEnable=true
# 为了使 Kubernetes 集群能够正常访问到探针，需要开启 QOS 允许远程访问，此操作有可能带来安全风险，请仔细评估后再打开
dubbo.application.qosAcceptForeignIp=true
# 标记开启 mesh sidecar 代理模式
dubbo.consumer.meshEnable=true
```

完成代码修改后，通过项目提供的 Dockerfile 打包镜像

```shell
# 打包并推送镜像
mvn compile jib:build
```

> Jib 插件会自动打包并发布镜像。注意，本地开发需将 jib 插件配置中的 docker registry 组织 apache/dubbo-demo 改为自己有权限的组织（包括其他 kubernetes manifests 中的 dubboteam 也要修改，以确保 kubernetes 部署的是自己定制后的镜像），如遇到 jib 插件认证问题，请参考[相应链接](https://github.com/GoogleContainerTools/jib/blob/master/docs/faq.md#what-should-i-do-when-the-registry-responds-with-unauthorized)配置 docker registry 认证信息。
> 可以通过直接在命令行指定 `mvn compile jib:build -Djib.to.auth.username=x -Djib.to.auth.password=x -Djib.from.auth.username=x -Djib.from.auth.username=x`，或者使用 docker-credential-helper.

## 5 常用命令

```shell
# dump current Envoy configs
kubectl exec -it ${your pod id} -c istio-proxy curl http://127.0.0.1:15000/config_dump > config_dump

# 进入 istio-proxy 容器
kubectl exec -it ${your pod id} -c istio-proxy -- /bin/bash

# 查看容器日志
kubectl logs ${your pod id} -n ${your namespace}

kubectl logs ${your pod id} -n ${your namespace} -c istio-proxy

# 开启自动注入sidecar
kubectl label namespace ${your namespace} istio-injection=enabled --overwrite

# 关闭自动注入sidecar
kubectl label namespace ${your namespace} istio-injection=disabled --overwrite
```
## 6 注意事项
1. 示例中，生产者消费者都属于同一个namespace；如果需要调用不同的namespace的提供者，需要按如下配置(**dubbo版本>=3.1.2**)：

注解方式：
```java
 @DubboReference(providedBy = "istio-demo-dubbo-producer",providerPort = 20885, providerNamespace = "istio-demo")

```
xml方式
```xml
<dubbo:reference id="demoService" check="true"
                  interface="org.apache.dubbo.samples.basic.api.DemoService"
                  provider-port="20885"
                  provided-by="istio-dubbo-producer"
                  provider-namespace="istio-demo"/>
```