---
aliases:
    - /zh/overview/tasks/mesh/migration/proxyless/
description: ""
linkTitle: 其他问题？
title: 其他问题？
type: docs
weight: 3
---



Proxyless 模式是指 Dubbo 直接与 Istiod 通信，通过 xDS 协议实现服务发现和服务治理等能力。
本示例中将通过一个简单的示例来演示如何使用 Proxyless 模式。

[示例地址](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-xds)

## 代码架构

本小节中主要介绍本文所使用的示例的代码架构，通过模仿本示例中的相关配置改造已有的项目代码可以使已有的项目快速跑在 Proxyless Mesh 模式下。

### 1. 接口定义

为了示例足够简单，这里使用了一个简单的接口定义，仅对参数做拼接进行返回。

```java
public interface GreetingService {
    String sayHello(String name);
}
```

### 2. 接口实现

```java
@DubboService(version = "1.0.0")
public class AnnotatedGreetingService implements GreetingService {
    @Override
    public String sayHello(String name) {
        System.out.println("greeting service received: " + name);
        return "hello, " + name + "! from host: " + NetUtils.getLocalHost();
    }
}
```

### 3. 客户端订阅方式

**由于原生 xDS 协议无法支持获取从接口到应用名的映射，因此需要配置 `providedBy` 参数来标记此服务来自哪个应用。**

未来我们将基于 Dubbo Mesh 的控制面实现自动的[服务映射](/zh-cn/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/)关系获取，届时将不需要独立配置参数即可将 Dubbo 运行在 Mesh 体系下，敬请期待。

```java
@Component("annotatedConsumer")
public class GreetingServiceConsumer {
    @DubboReference(version = "1.0.0", providedBy = "dubbo-samples-xds-provider")
    private GreetingService greetingService;
    public String doSayHello(String name) {
        return greetingService.sayHello(name);
    }
}
```

### 4. 服务端配置

服务端配置注册中心为 istio 的地址，协议为 xds。

我们建议将 `protocol` 配置为 tri 协议（全面兼容 grpc 协议），以获得在 istio 体系下更好的体验。

为了使 Kubernetes 感知到应用的状态，需要配置 `qosAcceptForeignIp` 参数，以便 Kubernetes 可以获得正确的应用状态，[对齐生命周期](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/dubbo-kubernetes-probe/)。

```properties
dubbo.application.name=dubbo-samples-xds-provider
dubbo.application.metadataServicePort=20885
dubbo.registry.address=xds://istiod.istio-system.svc:15012
dubbo.protocol.name=tri
dubbo.protocol.port=50052
dubbo.application.qosAcceptForeignIp=true
```

### 5. 客户端配置

客户端配置注册中心为 istio 的地址，协议为 xds。

```properties
dubbo.application.name=dubbo-samples-xds-consumer
dubbo.application.metadataServicePort=20885
dubbo.registry.address=xds://istiod.istio-system.svc:15012
dubbo.application.qosAcceptForeignIp=true
```

## 快速开始

### Step 1: 搭建 Kubernetes 环境

目前 Dubbo 仅支持在 Kubernetes 环境下的 Mesh 部署，所以在运行启动本示例前需要先搭建 Kubernetes 环境。

搭建参考文档：

> [minikube(https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/)](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/)
> 
> [kubeadm(https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/)](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/)
> 
> [k3s(https://k3s.io/)](https://k3s.io/)

### Step 2: 搭建 Istio 环境

搭建 Istio 环境参考文档：

[Istio 安装文档(https://istio.io/latest/docs/setup/getting-started/)](https://istio.io/latest/docs/setup/getting-started/)

注：安装 Istio 的时候**需要开启 [first-party-jwt 支持](https://istio.io/latest/docs/ops/best-practices/security/#configure-third-party-service-account-tokens)（使用 `istioctl` 工具安装的时候加上 `--set values.global.jwtPolicy=first-party-jwt` 参数）**，否则将导致客户端认证失败的问题。

附安装命令参考：

```bash
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.xx.x
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo --set values.global.jwtPolicy=first-party-jwt -y
```

### Step 3: 拉取代码并构建

```bash
git clone https://github.com/apache/dubbo-samples.git
cd dubbo-samples/dubbo-samples-xds
mvn clean package -DskipTests
```

### Step 4: 构建镜像

由于 Kubernetes 采用容器化部署，需要将代码打包在镜像中再进行部署。

```bash
cd ./dubbo-samples-xds-provider/
# dubbo-samples-xds/dubbo-samples-xds-provider/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-provider_0.0.1 .
cd ../dubbo-samples-xds-consumer/
# dubbo-samples-xds/dubbo-samples-xds-consumer/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-consumer_0.0.1 .
cd ../
```

### Step 5: 创建namespace

```bash
# 初始化命名空间
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-xds/deploy/Namespace.yml

# 切换命名空间
kubens dubbo-demo
```

### Step 6: 部署容器

```bash
cd ./dubbo-samples-xds-provider/src/main/resources/k8s
# dubbo-samples-xds/dubbo-samples-xds-provider/src/main/resources/k8s/Deployment.yml
# dubbo-samples-xds/dubbo-samples-xds-provider/src/main/resources/k8s/Service.yml
kubectl apply -f Deployment.yml
kubectl apply -f Service.yml
cd ../../../../../dubbo-samples-xds-consumer/src/main/resources/k8s
# dubbo-samples-xds/dubbo-samples-xds-consumer/src/main/resources/k8s/Deployment.yml
kubectl apply -f Deployment.yml
cd ../../../../../
```

查看 consumer 的日志可以观察到如下的日志：
```
result: hello, xDS Consumer! from host: 172.17.0.5
result: hello, xDS Consumer! from host: 172.17.0.5
result: hello, xDS Consumer! from host: 172.17.0.6
result: hello, xDS Consumer! from host: 172.17.0.6
```

## 常见问题

1. 配置独立的 Istio 集群 `clusterId`

通常在 Kubernetes 体系下 Istio 的 `clusterId` 是 `Kubernetes`，如果你使用的是自建的 istio 生产集群或者云厂商提供的集群则可能需要配置 `clusterId`。

配置方式：指定 `ISTIO_META_CLUSTER_ID` 环境变量为所需的 `clusterId`。

参考配置：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dubbo-samples-xds-consumer
spec:
  selector:
    matchLabels:
      demo: consumer
  replicas: 2
  template:
    metadata:
      labels:
        demo: consumer
    spec:
      containers:
        - env:
            - name: ISTIO_META_CLUSTER_ID
              value: Kubernetes
        - name: dubbo-samples-xds-provider
          image: xxx
```

`clusterId` 获取方式：
> kubectl describe pod -n istio-system istiod-58b4f65df9-fq2ks
> 读取环境变量中 `CLUSTER_ID` 的值

2. Istio 认证失败

由于当前 Dubbo 版本还不支持 istio 的 `third-party-jwt` 认证，所以需要配置 `jwtPolicy` 为 `first-party-jwt`。

3. providedBy

由于当前 Dubbo 版本受限于 istio 的通信模型无法获取接口所对应的应用名，因此需要配置 `providedBy` 参数来标记此服务来自哪个应用。
未来我们将基于 Dubbo Mesh 的控制面实现自动的[服务映射](/zh-cn/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/)关系获取，届时将不需要独立配置参数即可将 Dubbo 运行在 Mesh 体系下，敬请期待。

4. protocol name

Proxyless 模式下应用级服务发现通过 `Kubernetes Native Service` 来进行应用服务发现，而由于 istio 的限制，目前只支持 `http` 协议和 `grpc` 协议的流量拦截转发，所以 `Kubernetes Service` 在配置的时候需要指定 `spec.ports.name` 属性为 `http` 或者 `grpc` 开头。
因此我们建议使用 triple 协议（完全兼容 grpc 协议）。此处即使 `name` 配置为 `grpc` 开头，但是实际上是 `dubbo` 协议也可以正常服务发现，但是影响流量路由的功能。

参考配置：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: dubbo-samples-xds-provider
spec:
  clusterIP: None
  selector:
    demo: provider
  ports:
    - name: grpc-tri
      protocol: TCP
      port: 50052
      targetPort: 50052
```

5. metadataServicePort

由于 Dubbo 3 应用级服务发现的元数据无法从 istio 中获取，需要走服务自省模式。这要求了 `Dubbo MetadataService` 的端口在全集群的是统一的。

参考配置：
```properties
dubbo.application.metadataServicePort=20885
```

未来我们将基于 Dubbo Mesh 的控制面实现自动的[服务元数据](/zh-cn/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/)获取，届时将不需要独立配置参数即可将 Dubbo 运行在 Mesh 体系下，敬请期待。

6. qosAcceptForeignIp

由于 Kubernetes probe 探活机制的工作原理限制，探活请求的发起方不是 `localhost`，所以需要配置 `qosAcceptForeignIp` 参数开启允许全局访问。

```properties
dubbo.application.qosAcceptForeignIp=true
```

注：qos 端口存在危险命令，请先评估网络的安全性。即使 qos 不开放也仅影响 Kubernetes 无法获取 Dubbo 的生命周期状态。

7. 不需要开启注入

Proxyless 模式下 pod 不需要再开启 envoy 注入，请确认 namespace 中没有 `istio-injection=enabled` 的标签。

8. 明文连接istiod

Proxyless 模式下默认通过ssl方式连接istiod，同时也支持通过明文的方式连接istiod。

明文连接参考配置：
```properties
dubbo.registry.secure=plaintext
```
