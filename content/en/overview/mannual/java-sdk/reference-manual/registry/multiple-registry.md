---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/registry/multiple-registry/
    - /en/docs3-v2/java-sdk/reference-manual/registry/multiple-registry/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/multi-registry/
description: This article introduces the multi-registry support of Dubbo and its use cases, detailing how to achieve cross-region service deployment and service migration through multiple registries/subscriptions, as well as the implementation methods for cross-datacenter traffic scheduling with limited resources.
linkTitle: Multi-Registry
title: Multi-Registry
type: docs
weight: 6
---

## 1 Associating Services with Multiple Registries

### 1.1 Global Default Registry

Dubbo registries and services are independently configured, and developers usually do not need to set up the relationship between service and registry components. The Dubbo framework will automatically perform the following actions:
* For all Service services, register service addresses with all global default registries.
* For all Reference services, subscribe to service addresses from all global default registries.

```yml
# application.yml (Spring Boot)
dubbo
 registries
  beijingRegistry
   address: zookeeper://localhost:2181
  shanghaiRegistry
   address: zookeeper://localhost:2182
```

```java
@DubboService
public class DemoServiceImpl implements DemoService {}

@DubboService
public class HelloServiceImpl implements HelloService {}
```

The above configuration, developed using Spring Boot (XML and API methods are similar), sets up two global default registries, beijingRegistry and shanghaiRegistry. The services DemoService and HelloService will be registered to the two default registries respectively.

In addition to the automatic configuration of the global registry mentioned above, there are two ways to flexibly adjust the association between services and multiple registries.

### 1.2 Setting Global Default Registry
```yml
# application.yml (Spring Boot)
dubbo
 registries
  beijingRegistry
   address: zookeeper://localhost:2181
   default: true
  shanghaiRegistry
   address: zookeeper://localhost:2182
   default: false
```

`default` is used to set the global default registry, and its default value is `true`, indicating it is viewed as the global registry. Services that do not specify a registry ID will automatically register or subscribe to the global default registry.

### 1.3 Explicitly Associating Services with Registries

By adding the registry configuration to the Dubbo service definition component, services can be associated with registries.

```java
@DubboService(registry = {"beijingRegistry"})
public class DemoServiceImpl implements DemoService {}

@DubboService(registry = {"shanghaiRegistry"})
public class HelloServiceImpl implements HelloService {}
```

With the above configuration, DemoService will only be registered to beijingRegistry, while HelloService will be registered to shanghaiRegistry.

## 2 Multi-Registry Subscription

Service subscription involves address aggregation and routing selection, making the logic more complex. From the perspective of subscriptions from a single service, if there are multiple registry subscriptions, they can be divided into two scenarios based on whether the addresses between registries are aggregated.

### 2.1 Non-Aggregated Multi-Registry Addresses

```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" />
```

As shown, independently configured registry components have isolated address lists by default at the consumer end, and load balancing requires two steps:
1. Selection among registry clusters to choose a cluster
2. Selection within the registry cluster to filter addresses

![multi-registris-no-aggregation](/imgs/v3/registry/no-aggregation.png)

Next, we will focus on how to control **selection among registry clusters**. Available strategies include:
**Random**
Each request is randomly assigned to a registry cluster.

> During the random process, availability checks are performed, ensuring that each cluster must have at least one available address to be potentially selected.

**Preferred**
```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" preferred="true"/>
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" />
```
If a registry cluster is configured with `preferred="true"`, all traffic will be routed to this cluster.

**Weighted**
```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" weight="100"/>
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" weight="10" />
```

Based on weight for random load balancing, traffic distribution is roughly 10:1 across the clusters.

**Same Zone Priority**
```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" zone="hangzhou" />
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" zone="qingdao" />
```

```java
RpcContext.getContext().setAttachment("registry_zone", "qingdao");
```

Traffic can be precisely guided to the corresponding cluster based on parameters from the invocation or parameters set through the context at the current node. 

In addition to setting the zone via `RpcContext` parameters, the extension `org.apache.dubbo.rpc.ZoneDetector` can be implemented to determine the current request's zone more flexibly. RuleConverter

### 2.2 Aggregated Multi-Registry Addresses
```xml
<dubbo:registry address="multiple://127.0.0.1:2181?separator=;&reference-registry=zookeeper://address11?backup=address12,address13;zookeeper://address21?backup=address22,address23" />
```

This introduces a special registry prefixed with the multiple protocol, where:
* `multiple://127.0.0.1:2181` serves as a specific format placeholder and has no specific meaning.
* `reference-registry` specifies the list of aggregated registry clusters, which in the example include two clusters: `zookeeper://address11?backup=address12,address13` and `zookeeper://address21?backup=address22,address23`, along with a specified cluster separator `separator=";"`.

As seen in the last image, different registry cluster addresses will be aggregated into a single pool of addresses for load balancing or routing selection at the consumer end.

![multi-registris-aggregation](/imgs/v3/registry/aggregation.png)

From version 3.1.0 onwards, support has been added for setting specific attachments for each registry cluster to provide special tags for the addresses under that cluster. With components such as Router and TagRouter, traffic management capabilities across data centers can be achieved.

```xml
<dubbo:registry address="multiple://127.0.0.1:2181?separator=;&reference-registry=zookeeper://address11?attachments=zone=hangzhou,tag=middleware;zookeeper://address21" />
```

By adding `attachments=zone=hangzhou,tag=middleware`, all URLs from the registry will automatically carry the `zone` and `tag` identifiers, facilitating more flexible traffic management for the consumer.

## 3 Scenario Examples

### 3.1 Scenario 1: Cross-Region Registered Services

For example: some services for the Chinese site could not be deployed in Qingdao in time, but only in Hangzhou, and other applications in Qingdao need to reference these services. Thus, they can be registered to two registries simultaneously.

```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" default="false" />
<!-- Register to multiple registries -->
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="hangzhouRegistry,qingdaoRegistry" />
```

### 3.2 Scenario 2: Isolation Based on Business

Some CRM services are designed specifically for the international site, while others are tailored for the Chinese site.

```xml
<!-- Multi-registry configuration -->
<dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
<!-- Register to the Chinese site registry -->
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="chinaRegistry" />
<!-- Register to the international site registry -->
<dubbo:service interface="com.alibaba.hello.api.DemoService" version="1.0.0" ref="demoService" registry="intlRegistry" />
```

### 3.3 Scenario 3: Service Calls Based on Business

CRM requires invoking services from both the Chinese site and the international site. The PC2 service is deployed in both sites with the same interface and version but connects to different databases.

```xml
<!-- Multi-registry configuration -->
<dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
<!-- Reference the Chinese site's service -->
<dubbo:reference id="chinaHelloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" registry="chinaRegistry" />
<!-- Reference the international site's service -->
<dubbo:reference id="intlHelloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" registry="intlRegistry" />
```

If there's a temporary need to connect to two different registries in a test environment, multiple registry addresses can be specified separated by vertical bars:

```xml
<!-- Multi-registry configuration, using vertical bars to connect to multiple registries, and comma for multiple addresses in the same registry -->
<dubbo:registry address="10.20.141.150:9090|10.20.154.177:9010" />
<!-- Reference the service -->
<dubbo:reference id="helloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" />
```

