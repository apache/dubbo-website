---
aliases:
    - /zh/docs/references/lifecycle/brief/
description: 使用方法
linkTitle: 使用方法
title: 使用方法
type: docs
weight: 9
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/dubbo-kubernetes-probe/)。
{{% /pageinfo %}}

[Pod 的生命周期](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/) 与服务调度息息相关，通过对 Kubernetes 官方探针的实现，能够使 Dubbo 乃至整个应用的生命周期与 Pod 的生命周期对齐。

通过 Dubbo 的 SPI 机制，在内部实现多种“探针”，基于 Dubbo QOS 运维模块的 HTTP 服务，使容器探针能够获取到应用内对应探针的状态。另外，SPI 的实现机制也利于用户自行拓展内部“探针”，使整个应用的生命周期更有效的进行管控。


## 使用方法


参考配置（具体可以参考 dubbo-samples 中 Kubernetes 注册中心的配置文件）


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


目前三种探针均有对应的接口，路径为 QOS 中的命令，端口信息请根据 QOS 配置进行对应修改（默认端口为 22222）。其他参数请参考[官方文档说明](https://kubernetes.io/zh/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。


注：为了使 Kubernetes 集群能够正常访问到探针，需要开启 QOS 允许远程访问，此操作有可能带来安全风险，请仔细评估后再打开。


## 实现细节


三种探针对应的 SPI 接口如下：

- livenessProbe: `org.apache.dubbo.qos.probe.LivenessProbe`
- readinessProbe: `org.apache.dubbo.qos.probe.ReadinessProbe`
- startupProbe: `org.apache.dubbo.qos.probe.StartupProbe`



接口将自动获取当前应用所有 SPI 的实现，对应接口的 SPI 实现均成功就绪则接口返回成功。


#### 存活检测
对于 livenessProbe 存活检测，由于 Dubbo 框架本身无法获取到应用的存活状态，因此本接口无默认实现，且默认返回成功。开发者可以根据 SPI 定义对此 SPI 接口进行拓展，从应用层次对是否存活进行判断。


#### 就绪检测
对于 readinessProbe 就绪检测，目前 Dubbo 默认提供了两个检测维度，一是对 Dubbo 服务自身是否启停做判断，另外是对所有服务是否存在已注册接口，如果所有服务均已从注册中心下线（可以通过 QOS 运维进行操作）将返回未就绪的状态。


#### 启动检测
对于 startupProbe 启动检测，目前Dubbo 默认提供了一个检测维度，即是在所有启动流程（接口暴露、注册中心写入等）均结束后返回已就绪状态。
