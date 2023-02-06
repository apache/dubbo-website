---
type: docs
title: "Kubernetes 生命周期探针"
linkTitle: "Kubernetes 生命周期探针"
weight: 5
description: "了解 Dubbo3 与 Kubernetes 生命周期对齐探针的扩展与应用场景"
---
## 特性说明
[Pod 的生命周期](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/pod-lifecycle/)  与服务调度息息相关，通过对 Kubernetes 官方探针的实现，能够使 Dubbo3 乃至整个应用的生命周期与 Pod 的生命周期，在 Pod 的整个生命周期中，影响到 Pod 的就只有健康检查这一部分, 我们可以通过配置 liveness probe（存活探针）和 readiness probe（可读性探针）来影响容器的生命周期。

通过 Dubbo3 的 SPI 机制，在内部实现多种“探针”，基于 Dubbo3 QOS 运维模块的 HTTP 服务，使容器探针能够获取到应用内对应探针的状态。另外，SPI 的实现机制也利于用户自行拓展内部“探针”，使整个应用的生命周期更有效的进行管控。

**三种探针对应的 SPI 接口**

-   livenessProbe:  `org.apache.dubbo.qos.probe.LivenessProbe`
-   readinessProbe:  `org.apache.dubbo.qos.probe.ReadinessProbe`
-   startupProbe:  `org.apache.dubbo.qos.probe.StartupProbe`

接口将自动获取当前应用所有 SPI 的实现，对应接口的 SPI 实现均成功就绪则接口返回成功。

Dubbo3 SPI 更多扩展的介绍见 [Dubbo SPI扩展](/zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/)

## 使用场景
- kubelet 使用 `liveness probe` 来确定你的应用程序是否正在运行，查看是否存活。一般来说，如果你的程序一旦崩溃了， Kubernetes 就会立刻知道这个程序已经终止了，然后就会重启这个程序。而我们的 liveness probe 的目的就是来捕获到当前应用程序还没有终止，还没有崩溃，如果出现了这些情况，那么就重启处于该状态下的容器，使应用程序在存在 bug 的情况下依然能够继续运行下去。
- kubelet 使用 `readiness probe` 来确定容器是否已经就绪可以接收流量过来。是否准备就绪，现在是否可以开始工作。只有当 Pod 中的容器都处于就绪状态的时候 kubelet 才会认定该 Pod 处于就绪状态，因为一个 Pod 下面可能会有多个容器。 Pod 如果处于非就绪状态，那么我们就会将他从 Service 的 Endpoints 列表中移除出来，这样我们的流量就不会被路由到这个 Pod 里面。
 
## 使用方式

### 存活检测

对于 livenessProbe 存活检测，由于 Dubbo3 框架本身无法获取到应用的存活状态，因此本接口无默认实现，且默认返回成功。开发者可以根据 SPI 定义对此 SPI 接口进行拓展，从应用层次对是否存活进行判断。

关于 [liveness 存活探针](../../../reference-manual/spi/description/liveness/) 扩展示例
### 就绪检测

对于 readinessProbe 就绪检测，目前 Dubbo3 默认提供了两个检测维度，一是对 Dubbo3 服务自身是否启停做判断，另外是对所有服务是否存在已注册接口，如果所有服务均已从注册中心下线（可以通过 QOS 运维进行操作）将返回未就绪的状态。

关于 [readiness 就绪探针](../../../reference-manual/spi/description/readiness/) 扩展示例

### 启动检测

对于 startupProbe 启动检测，目前 Dubbo3 默认提供了一个检测维度，即是在所有启动流程（接口暴露、注册中心写入等）均结束后返回已就绪状态。

关于 [startup 启动探针](../../../reference-manual/spi/description/startup/) 扩展示例

### 参考示例
```yaml
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
> QOS 当计算节点检测到内存压力时，kuberentes 会 BestEffort -> Burstable -> Guaranteed 依次驱逐 Pod。

目前三种探针均有对应的接口，路径为 QOS 中的命令，端口信息请根据 QOS 配置进行对应修改（默认端口为 22222）。其他参数请参考 [Kubernetes官方文档说明](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。
