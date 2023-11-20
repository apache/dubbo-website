---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/traffic/mesh_router/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/traffic/mesh_router/
description: 路由规则
title: 路由规则
type: docs
weight: 12
---






## 路由规则介绍
[《微服务Mesh路由方案草案V2》](https://www.yuque.com/docs/share/c132d5db-0dcb-487f-8833-7c7732964bd4?# )

## 简介

路由规则，简单来说就是根据**特定的条件**，将**特定的请求**流量发送到**特定的服务提供者**。从而实现流量的分配。

在 Dubbo3 统一路由规则的定义中，需要提供两个yaml格式的资源：virtual service 和 destination rule。其格式和 service mesh 定义的路由规则非常相似。
- virtual service

定义host，用于和destination rule建立联系。\
定义 service 匹配规则\
定义 match 匹配规则\
匹配到特定请求后，进行目标集群的查找和验证，对于为空情况，使用 fallback 机制。

- destination rule

定义特定集群子集，以及子集所适配的标签，标签从 provider 端暴露的 url 中获取，并尝试匹配。

## 提供能力
### 基于配置中心的路由配置

sample示例参见[Mesh Router](https://github.com/apache/dubbo-go-samples/tree/master/route/meshroute)

#### 1. 路由规则文件注解

路由规则只针对客户端，对于服务端，只需要在服务提供时打好特定的参数标签即可。

##### 1.1 virtual-service

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata: {name: demo-route}
spec:
  dubbo:
    # 使用正则表达式匹配service名，只有个满足该service名的请求才能路由。
    # 就此例子来说，不满足service名的请求会直接找不到provider
    # - services:
    #   - { regex: org.apache.dubbo.UserProvider* }
    - routedetail:
        - match: 
          # 匹配规则，如果（sourceLabel）客户端url满足存在参数 `trafficLabel: xxx` 的才能匹配成功
            - sourceLabels: {trafficLabel: xxx}
          name: xxx-project
          route:  # 一旦匹配上述match规则，将选择 dest_rule 里定义的名为 isolation 的子集
            - destination: {host: demo, subset: isolation}
        - match:
            - sourceLabels: {trafficLabel: testing-trunk}
          name: testing-trunk
          route: # 一旦匹配上述match规则，将选择 dest_rule 里定义的名为 testing-trunk 的子集
            - destination: {host: demo, subset: testing-trunk}
        - name: testing # 没有match，兜底逻辑，上述不满足后一定会被匹配到。
          route:
            - destination: {host: demo, subset: testing}
      services:
        - {exact: com.apache.dubbo.sample.basic.IGreeter}
  hosts: [demo] # 匹配dest_rule.yml里面的 host 为demo
```

##### 1.2 destination-rule

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata: { name: demo-route }
spec:
  host: demo
  subsets:
    - labels: { env-sign: xxx, tag1: hello }
      name: isolation
    - labels: { env-sign: yyy }
      name: testing-trunk
    - labels: { env-sign: zzz }
      name: testing
  trafficPolicy:
    loadBalancer: { simple: ROUND_ROBIN }
```

#### 2. client、server 路由参数设置

- client 端
  
  dubbogo.yml
  
  定义配置中心

```yaml
  config-center:
    protocol: zookeeper
    address: 127.0.0.1:2181
    data-id: "dubbo-go-samples-configcenter-zookeeper-client"
```

在代码中通过 API 将配置发布至配置中心，也可预先手动配置。

```go
dynamicConfiguration, err := config.GetRootConfig().ConfigCenter.GetDynamicConfiguration()
if err != nil {
  panic(err)
}

// publish mesh route config
err = dynamicConfiguration.PublishConfig("dubbo.io.MESHAPPRULE", "dubbo", MeshRouteConf)
if err != nil {
  return
}
```



server 端

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      timeout: 3s
      address: 127.0.0.1:2181
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java
        params:
          env-sign: zzz # server label, 对应 destination Rule中的testing，即兜底逻辑
```

#### 3. 运行方法

直接使用goland运行本示例


运行后，可观测到所有客户端流量都路由至 server，根据source label，没有命中的virtualService，因此路由至兜底testing。