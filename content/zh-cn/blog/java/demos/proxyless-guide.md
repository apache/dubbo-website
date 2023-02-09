---
title: "Proxyless Mesh在Dubbo中的实践"
linkTitle: "Proxyless Mesh在Dubbo中的实践"
tags: ["Java"]
date: 2022-09-05
description: >
    Proxyless 模式是指 Dubbo 直接与 Istiod 通信，通过 xDS 协议实现服务发现和服务治理等能力。本文将带领大家熟悉 Dubbo Proxyless Mesh。
---

## 背景

随着 Dubbo 3.1 的 release，Dubbo 在云原生的路上又迈出了重要的一步。在这个版本中添加了 Proxyless Mesh 的新特性，Dubbo Proxyless Mesh 直接实现 xDS 协议解析，
实现 Dubbo 与 Control Plane 的直接通信，进而实现控制面对流量管控、服务治理、可观测性、安全等的统一管控，规避 Sidecar 模式带来的性能损耗与部署架构复杂性。

## 什么是Service Mesh

Service Mesh 又译作 “服务网格”，作为服务间通信的基础设施层。Buoyant 公司的 CEO Willian Morgan 在他的这篇文章 [WHAT’S A Service Mesh? AND WHY DO I NEED ONE? ](https://linkerd.io/2017/04/25/whats-a-service-mesh-and-why-do-i-need-one/)
中解释了什么是 Service Mesh，为什么云原生应用需要 Service Mesh。

**下面是 Willian Morgan 对 Service Mesh 的解释。**

```
A Service Mesh is a dedicated infrastructure layer for handling service-to-service communication. 
It’s responsible for the reliable delivery of requests through the complex topology of services 
that comprise a modern, cloud native application. In practice, the Service Mesh is typically implemented 
as an array of lightweight network proxies that are deployed alongside application code, without the 
application needing to be aware.
```

**翻译成中文**

```
服务网格（Service Mesh）是处理服务间通信的基础设施层。它负责构成现代云原生应用程序的复杂服务拓扑来可靠地交付请求。
在实践中，Service Mesh 通常以轻量级网络代理阵列的形式实现，这些代理与应用程序代码部署在一起，对应用程序来说无需感知代理的存在。
```

说到 Service Mesh 一定离不开 Sidecar 经典架构模式。它通过在业务 Pod 中注入 Sidecar 容器，接管业务容器的通信流量，同时 Sidecar 容器与网格平台的控制平面对接，
基于控制平面下发的策略，对代理流量实施治理和管控，将原有服务框架的治理能力下层到 Sidecar 容器中，从而实现了基础框架能力的下沉，与业务系统解耦。

![Service Mesh](/imgs/blog/20220905/1.png)

经典的 Sidecar Mesh 部署架构有很多优势，如平滑升级、多语言、业务侵入小等，但也带来了一些额外的问题，比如:

* Proxy 带来的性能损耗，在复杂拓扑的网络调用中将变得尤其明显
* 流量拦截带来的架构复杂性
* Sidecar 生命周期管理
* 部署环境受限，并不是所有环境都满足 Sidecar 流量拦截条件

针对 Sidecar Mesh 模型的问题，Dubbo 社区自很早之前就做了 Dubbo 直接对接到控制面的设想与思考，并在国内开源社区率先提出了 Proxyless Mesh 的概念，当然就 Proxyless 概念的说法而言，最开始是谷歌提出来的。

## Dubbo Proxyless Mesh

Dubbo Proxyless 模式是指 Dubbo 直接与 Istiod通信，通过 xDS协议实现服务发现和服务治理等能力。

![Proxyless](/imgs/blog/20220905/2.png)

Proxyless 模式使得微服务又回到了 2.x 时代的部署架构，同 Dubbo 经典服务治理模式非常相似，所以说这个模式并不新鲜， Dubbo 从最开始就是这样的设计模式。
这样做可以极大的提升应用性能，降低网络延迟。有人说这种做法又回到了原始的基于 SDK 的微服务模式，其实非也，它依然使用了 Envoy 的 xDS API，
但是因为不再需要向应用程序中注入 Sidecar 代理，因此可以减少应用程序性能的损耗。

但相比于 Mesh 架构，Dubbo 经典服务治理模式并没有强调控制面的统一管控，而这点恰好是 Service Mesh 所强调的，强调对流量、可观测性、证书等的标准化管控与治理，也是 Mesh 理念先进的地方。

在 Dubbo Proxyless 架构模式下，Dubbo 进程将直接与控制面通信，Dubbo 进程之间也继续保持直连通信模式，我们可以看出 Proxyless 架构的优势：

* 没有额外的 Proxy 中转损耗，因此更适用于性能敏感应用
* 更有利于遗留系统的平滑迁移
* 架构简单，容易运维部署
* 适用于几乎所有的部署环境

## 服务发现

xDS 接入以注册中心的模式对接，节点发现同其他注册中心的服务自省模型一样，对于 xDS 的负载均衡和路由配置通过 ServiceInstance 的动态运行时配置传出，
在构建 Invoker 的时候将配置参数传入配置地址。

![服务发现](/imgs/blog/20220905/3.png)

## 证书管理

零信任架构下，需要严格区分工作负载的识别和信任，而签发 X.509 证书是推荐的一种认证方式。在 Kubernetes 集群中，服务间是通过 DNS 名称互相访问的，而网络流量可能被 DNS 欺骗、BGP/路由劫持、ARP 欺骗等手段劫持，为了将服务名称（DNS 名称）与服务身份强关联起来，Istio 使用置于 X.509 证书中的安全命名机制。SPIFFE是 Istio 所采用的安全命名的规范，它也是云原生定义的一种标准化的、可移植的工作负载身份规范。

Secure Production Identity Framework For Everyone (SPIFFE) 是一套服务之间相互进行身份识别的标准，主要包含以下内容：

* SPIFFE ID 标准，SPIFFE ID 是服务的唯一标识，具体实现使用 URI 资源标识符
* SPIFFE Verifiable Identity Document (SVID) 标准，将 SPIFFE ID 编码到一个加密的可验证的数据格式中
* 颁发与撤销 SVID 的 API 标准（SVID 是 SPIFFE ID 的识别凭证）

SPIFFE ID 规定了形如 ```spiffe://<trust domain>/<workload identifier>``` 的 URI 格式，作为工作负载（Workload）的唯一标识。
而 Istio 在自身的生态中只使用到了 SPIFFE ID 作为安全命名，其数据格式由自己实现，通信格式采用 CNCF 支持的 xDS 协议规范（证书认证通信更具体来说是 xDS 的 SDS）。

Istio 使用形如 ```spiffe://<trust_domain>/ns/<namespace>/sa/<service_account>``` 格式的 SPIFFE ID 作为安全命名，注入到 X.509 证书的 subjectAltName 扩展中。
其中"trust_domain"参数通过 Istiod 环境变量TRUST_DOMAIN 注入，用于在多集群环境中交互。

以下是 Dubbo Proxyless Mesh 证书颁发的过程

![证书颁发](/imgs/blog/20220905/4.png)

* 创建 RSA 私钥（Istio 还不支持 ECDSA 私钥）
* 构建 CSR（Certificate signing request）模板
* 自签名 CSR 生成证书
* 创建 Kubernetes Secret 资源储存 CA 证书和私钥（CA Service处理）

## 案例实践

接下来我将带领大家通过一个例子使已有的项目快速跑在 Proxyless Mesh 模式下。

## 环境准备

### 安装docker

[https://www.docker.com/](https://www.docker.com/)

### 安装minikube

墙裂推荐：[https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/)

### 安装istio

[https://istio.io/latest/docs/setup/getting-started/](https://istio.io/latest/docs/setup/getting-started/)

❗❗❗ 安装 Istio 的时候需要开启 first-party-jwt 支持（使用 istioctl 工具安装的时候加上 --set values.global.jwtPolicy=first-party-jwt 参数），否则将导致客户端认证失败的问题。
参考命令如下：

```bash
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.xx.x
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo --set values.global.jwtPolicy=first-party-jwt -y
```

## 代码准备

### xds-provider

#### 定义一个接口

```java
public interface GreetingService {

    String sayHello(String name);
}
```

#### 实现对应的接口

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

#### 编写启动类

```java
public class ProviderBootstrap {

    public static void main(String[] args) throws Exception {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ProviderConfiguration.class);
        context.start();
        System.out.println("dubbo service started");
        new CountDownLatch(1).await();
    }

    @Configuration
    @EnableDubbo(scanBasePackages = "org.apache.dubbo.samples.impl")
    @PropertySource("classpath:/spring/dubbo-provider.properties")
    static class ProviderConfiguration {
    }
}
```

#### 编写配置信息

```
dubbo.application.name=dubbo-samples-xds-provider
# 由于 Dubbo 3 应用级服务发现的元数据无法从 istio 中获取，需要走服务自省模式。
# 这要求了 Dubbo MetadataService 的端口在全集群的是统一的。
dubbo.application.metadataServicePort=20885
# 走xds协议
dubbo.registry.address=xds://istiod.istio-system.svc:15012
dubbo.protocol.name=tri
dubbo.protocol.port=50051
# 对齐k8s pod生命周期，由于 Kubernetes probe 探活机制的工作原理限制，
# 探活请求的发起方不是 localhost，所以需要配置 qosAcceptForeignIp 参数开启允许全局访问
dubbo.application.qosEnable=true
dubbo.application.qosAcceptForeignIp=true
```

#### 编写Deployment.yml和Service.yml

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dubbo-samples-xds-provider
  namespace: dubbo-demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dubbo-samples-xds-provider
  template:
    metadata:
      labels:
        app: dubbo-samples-xds-provider
    spec:
      containers:
        - name: server
          image: apache/dubbo-demo:dubbo-samples-xds-provider_0.0.1
          livenessProbe:
            httpGet:
              path: /live
              port: 22222
            initialDelaySeconds: 5
            periodSeconds: 5
          readinessProbe:
            httpGet:
              path: /ready
              port: 22222
            initialDelaySeconds: 5
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /startup
              port: 22222
            failureThreshold: 30
            periodSeconds: 10
```

```
apiVersion: v1
kind: Service
metadata:
  name: dubbo-samples-xds-provider
  namespace: dubbo-demo
spec:
  clusterIP: None
  selector:
    app: dubbo-samples-xds-provider
  ports:
    - name: grpc
      protocol: TCP
      port: 50051
      targetPort: 50051
```

#### 编写Dockerfile

```
FROM openjdk:8-jdk
ADD ./target/dubbo-samples-xds-provider-1.0-SNAPSHOT.jar dubbo-samples-xds-provider-1.0-SNAPSHOT.jar
CMD java -jar -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=31000 /dubbo-samples-xds-provider-1.0-SNAPSHOT.jar
```

### xds-consumer

#### 定义一个接口

```
public interface GreetingService {

    String sayHello(String name);
}
```

#### 实现对应的接口

```
@Component("annotatedConsumer")
public class GreetingServiceConsumer {
  	// 这里特别注意的是、由于当前 Dubbo 版本受限于 istio 的通信模型无法获取接口所对应的应用名，
		// 因此需要配置 providedBy 参数来标记此服务来自哪个应用。
    @DubboReference(version = "1.0.0", providedBy = "dubbo-samples-xds-provider")
    private GreetingService greetingService;

    public String doSayHello(String name) {
        return greetingService.sayHello(name);
    }
}
```

#### 编写启动类

```
public class ConsumerBootstrap {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ConsumerConfiguration.class);
        context.start();
        GreetingServiceConsumer greetingServiceConsumer = context.getBean(GreetingServiceConsumer.class);
        while (true) {
            try {
                String hello = greetingServiceConsumer.doSayHello("xDS Consumer");
                System.out.println("result: " + hello);
                Thread.sleep(100);
            } catch (Throwable t) {
                t.printStackTrace();
            }
        }
    }

    @Configuration
    @EnableDubbo(scanBasePackages = "org.apache.dubbo.samples.action")
    @PropertySource("classpath:/spring/dubbo-consumer.properties")
    @ComponentScan(value = {"org.apache.dubbo.samples.action"})
    static class ConsumerConfiguration {

    }
}
```

#### 编写配置信息

```
dubbo.application.name=dubbo-samples-xds-consumer
dubbo.application.metadataServicePort=20885
dubbo.registry.address=xds://istiod.istio-system.svc:15012
dubbo.consumer.timeout=3000
dubbo.consumer.check=false
dubbo.application.qosEnable=true
dubbo.application.qosAcceptForeignIp=true
```

#### 编写Deployment.yml和Service.yml

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dubbo-samples-xds-consumer
  namespace: dubbo-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dubbo-samples-xds-consumer
  template:
    metadata:
      labels:
        app: dubbo-samples-xds-consumer
    spec:
      containers:
        - name: server
          image: apache/dubbo-demo:dubbo-samples-xds-consumer_0.0.1
          livenessProbe:
            httpGet:
              path: /live
              port: 22222
            initialDelaySeconds: 5
            periodSeconds: 5
          readinessProbe:
            httpGet:
              path: /ready
              port: 22222
            initialDelaySeconds: 5
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /startup
              port: 22222
            failureThreshold: 30
            periodSeconds: 10
```

```
apiVersion: v1
kind: Service
metadata:
  name: dubbo-samples-xds-consumer
  namespace: dubbo-demo
spec:
  clusterIP: None
  selector:
    app: dubbo-samples-xds-consumer
  ports:
    - name: grpc
      protocol: TCP
      port: 50051
      targetPort: 50051
```

#### 编写Dockerfile

```
FROM openjdk:8-jdk
ADD ./target/dubbo-samples-xds-consumer-1.0-SNAPSHOT.jar dubbo-samples-xds-consumer-1.0-SNAPSHOT.jar
CMD java -jar -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=31000 /dubbo-samples-xds-consumer-1.0-SNAPSHOT.jar
```

✅ 到目前为止我们的环境和代码就全都准备完毕了！

## 构建镜像

### 1、启动docker

![启动docker](/imgs/blog/20220905/5.png)

### 2、启动minikube
因为minikube是一个本地的k8s，他启动需要一个虚拟引擎，这里我们用docker来管理。我们通过如下命令启动

`minikube start`

![启动minikube](/imgs/blog/20220905/6.png)

我们可以在docker里看到minikube

![minikube](/imgs/blog/20220905/7.png)

### 3、检查istio的状态

![istio的状态](/imgs/blog/20220905/8.png)

### 4、构建镜像

在本地找到代码所在位置、依次执行以下命令

```
# 找到provider所在路径
cd ./dubbo-samples-xds-provider/
# 构建provider的镜像
docker build -t apache/dubbo-demo:dubbo-samples-xds-provider_0.0.1 .
```

![构建provider](/imgs/blog/20220905/9.png)

```
# 找到consumer所在路径
cd ../dubbo-samples-xds-consumer/
# 构建consumer的镜像
docker build -t apache/dubbo-demo:dubbo-samples-xds-consumer_0.0.1 .
```

![构建consumer](/imgs/blog/20220905/10.png)

### 5、检查本地镜像

![检查本地镜像](/imgs/blog/20220905/11.png)

### 6、创建namespace

```
# 初始化命名空间
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-xds/deploy/Namespace.yml

# 切换命名空间
kubens dubbo-demo
```

如果不创建namespace，那么会看到如下错误

![错误](/imgs/blog/20220905/12.png)

## 部署容器

```
# 找到provider所在路径
cd ./dubbo-samples-xds-provider/src/main/resources/k8s
# dubbo-samples-xds/dubbo-samples-xds-provider/src/main/resources/k8s/Deployment.yml
# dubbo-samples-xds/dubbo-samples-xds-provider/src/main/resources/k8s/Service.yml

# 部署provider的Deployment和Service
kubectl apply -f Deployment.yml
kubectl apply -f Service.yml
```

![部署provider](/imgs/blog/20220905/13.png)

```
# 找到consumer所在路径
cd ../../../../../dubbo-samples-xds-consumer/src/main/resources/k8s
# dubbo-samples-xds/dubbo-samples-xds-consumer/src/main/resources/k8s/Deployment.yml

# 部署consumer的Deployment
kubectl apply -f Deployment.yml
```

![部署provider](/imgs/blog/20220905/14.png)

在minikube dashboard看到我们已经部署的pod

![部署provider](/imgs/blog/20220905/15.png)

## 观察consumer效果

```
kubectl logs xxx

result: hello, xDS Consumer! from host: 172.17.0.5
result: hello, xDS Consumer! from host: 172.17.0.5
result: hello, xDS Consumer! from host: 172.17.0.6
result: hello, xDS Consumer! from host: 172.17.0.6
```

## 总结&展望

本文主要剖析了 Dubbo Proxyless Mesh 的架构、服务发现以及证书管理等核心流程，最后通过示例给大家演示了如何使用 Dubbo Proxyless。

![部署provider](/imgs/blog/20220905/16.png)

随着 Dubbo 3.1 的 release，Dubbo 在云原生的路上又迈出了重要的一步。在今年年底，Dubbo Mesh 将发布具有服务发现能力的版本，
届时将面向所有 Dubbo 用户提供从低版本平滑迁移到 Mesh 架构的能力；在明年年初春季的时候将发布带有治理能力的版本；在明年年底前发布带热插件更新能力的版本，
希望有兴趣见证 Dubbo 云原生之路的同学可以积极参与社区贡献！

更多关于 Dubbo Mesh 的动态可以关注 Apache Dubbo 社区官方公众号（ApacheDubbo），及时获取最新消息。