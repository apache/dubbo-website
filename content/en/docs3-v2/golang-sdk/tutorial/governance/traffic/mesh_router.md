---
title: routing rules
weight: 12
type: docs
---

## Introduction to routing rules
["Microservice Mesh Routing Scheme Draft V2"](https://www.yuque.com/docs/share/c132d5db-0dcb-487f-8833-7c7732964bd4?# )

## Introduction

Routing rules, in simple terms, are to send **specific request** traffic to **specific service provider** according to **specific conditions**. Thereby realizing the distribution of flow.

In the definition of Dubbo3 unified routing rules, two resources in yaml format need to be provided: virtual service and destination rule. Its format is very similar to the routing rules defined by service mesh.
- virtual service

Define the host, which is used to establish a relationship with the destination rule. \
Define service matching rules\
Define match matching rules\
After matching a specific request, search and verify the target cluster, and use the fallback mechanism for empty cases.

-destination rule

Define a specific cluster subset and the tags that the subset is adapted to. The tags are obtained from the url exposed on the provider side and try to match.

## Provide capabilities
### Routing configuration based on configuration center

For the sample example, see [Mesh Router](https://github.com/apache/dubbo-go-samples/tree/master/route/meshroute)

#### 1. Routing rule file annotation

The routing rules are only for the client. For the server, you only need to label specific parameters when the service is provided.

##### 1.1 virtual-service

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata: {name: demo-route}
spec:
  dubbo:
    # Use a regular expression to match the service name, only a request that satisfies the service name can be routed.
    # For this example, if the request does not satisfy the service name, the provider will not be found directly
    # - services:
    # - { regex: org.apache.dubbo.UserProvider* }
    - route detail:
        - match:
          # Matching rules, if (sourceLabel) client url satisfies the parameter `trafficLabel: xxx`, the match can be successful
            - sourceLabels: {trafficLabel: xxx}
          name: xxx-project
          route: # Once the above match rule is matched, the subset named isolation defined in dest_rule will be selected
            - destination: {host: demo, subset: isolation}
        - match:
            - sourceLabels: {trafficLabel: testing-trunk}
          name: testing-trunk
          route: # Once the above match rule is matched, the subset named testing-trunk defined in dest_rule will be selected
            - destination: {host: demo, subset: testing-trunk}
        - name: testing # There is no match, the bottom-up logic, if the above-mentioned dissatisfaction is met, it will be matched.
          route:
            - destination: {host: demo, subset: testing}
      services:
        - {exact: com.apache.dubbo.sample.basic.IGreeter}
  hosts: [demo] # Match the host in dest_rule.yml as demo
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

#### 2. Client and server routing parameter settings

- client side

  dubbogo.yml

  Define configuration center

```yaml
  config-center:
    protocol: zookeeper
    address: 127.0.0.1:2181
    data-id: "dubbo-go-samples-configcenter-zookeeper-client"
```

Publish the configuration to the configuration center through the API in the code, or manually configure it in advance.

```go
dynamicConfiguration, err := config.GetRootConfig().ConfigCenter.GetDynamicConfiguration()
if err != nil {
  panic(err)
}

// publish mesh route config
err = dynamicConfiguration. PublishConfig("dubbo.io. MESHAPPRULE", "dubbo", MeshRouteConf)
if err != nil {
  return
}
```



server side

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
          env-sign: zzz # server label, corresponding to the testing in the destination Rule, that is, the bottom-up logic
```

#### 3. Run method

Run this example directly using goland


After running, it can be observed that all client traffic is routed to the server. According to the source label, there is no virtualService hit, so it is routed to the bottom-up test.