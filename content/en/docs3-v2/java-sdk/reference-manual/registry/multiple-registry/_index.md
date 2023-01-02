---
type: docs
title: "Multiple Registries"
linkTitle: "Multiple Registration Centers"
weight: 6
description: "This article introduces Dubbo's multi-registry support and usage scenarios, how to implement cross-regional service deployment and service migration through multi-registration/multi-subscription, and also describes the implementation of traffic scheduling across computer rooms with limited access to the same computer room."
---

## 1 Associated service and multiple registration centers

### 1.1 Global Default Registration Center

The Dubbo registry and services are configured independently. Usually, developers do not need to set the relationship between services and registry components. The Dubbo framework will automatically perform the following actions:
* For all Service services, register the service address with all global default registries.
* For all Reference services, subscribe service addresses from all global default registries.

```yml
# application.yml (Spring Boot)
dubbo
 registries
  beijing Registry
   address: zookeeper://localhost:2181
  shanghai Registry
   address: zookeeper://localhost:2182
```

```java
@DubboService
public class DemoServiceImpl implements DemoService {}

@DubboService
public class HelloServiceImpl implements HelloService {}
```

The above takes Spring Boot development as an example (XML and API methods are similar) to configure two global default registries, beijingRegistry and shanghaiRegistry, and the services DemoService and HelloService will be registered to the two default registries respectively.

In addition to the framework mentioned above to automatically set the global registry for the service, there are two ways to flexibly adjust the association between the service and multiple registry.

### 1.2 Set the global default registration center
```yml
# application.yml (Spring Boot)
dubbo
 registries
  beijing Registry
   address: zookeeper://localhost:2181
   default: true
  shanghai Registry
   address: zookeeper://localhost:2182
   default: false
```

`default` is used to set the global default registry, the default value is `true` which is regarded as the global registry. Services that do not specify a registry id will automatically register or subscribe to the global default registry.

### 1.3 Display associated services and registry

By adding the registry configuration to the Dubbo service definition component, the service is associated with the registry.

```java
@DubboServiceregistry = {"beijingRegistry"}
public class DemoServiceImpl implements DemoService {}

@DubboServiceregistry = {"shanghaiRegistry"}
public class HelloServiceImpl implements HelloService {}
```

After adding the above configuration, DemoService will only be registered to beijingRegistry, and HelloService will be registered to shanghaiRegistry.

## 2 Multi-registry subscription

Since service subscription involves address aggregation and routing address selection, the logic will be more complicated. From the perspective of a single service subscription, if there is a multi-registry subscription, it can be divided into two scenarios according to whether the addresses between the registries are aggregated.

### 2.1 Multi-registry addresses are not aggregated

```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" />
```

For the independently configured registry component shown above, the address list is completely isolated on the consumer side by default, and the load balancing address selection needs to go through two steps:
1. Site selection among the registration center clusters, select a cluster
2. Select the address in the registration center cluster, and perform address screening in the cluster

![multi-registris-no-aggregation](/imgs/v3/registry/no-aggregation.png)

Below we will focus on how to control **Registration center inter-cluster site selection**, the optional strategies are as follows
**random**
Each request is randomly assigned to a registry cluster

> There will be an availability check in the random process, that is, each cluster must ensure that at least one address is available before it can be selected.

**preferred priority**
```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" preferred="true"/>
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" />
```
If there is a registry cluster configured with `preferred="true"`, all traffic will be routed to this cluster.

**weighted**
```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" weight="100"/>
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" weight="10" />
```

Based on weighted random load balancing, there will be about 10:1 traffic distribution among the above clusters.

**same zone priority**
```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" zone="hangzhou" />
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" zone="qingdao" />
```

```java
RpcContext.getContext().setAttachment("registry_zone", "qingdao");
```

According to the traffic parameters carried in the Invocation or the parameters set through the context context on the current node, the traffic will be accurately guided to the corresponding cluster.

### 2.2 Multi-registry address aggregation
```xml
<dubbo:registry address="multiple://127.0.0.1:2181?separator=;&reference-registry=zookeeper://address11?backup=address12,address13;zookeeper://address21?backup=address22,address23" />
```

Here, a registration center starting with a special multiple protocol is added, where:
* `multiple://127.0.0.1:2181` has no specific meaning, it is just a placeholder in a specific format, and the address can be specified at will
* `reference-registry` specifies the list of registry clusters to be aggregated. In the example, there are two clusters, `zookeeper://address11?backup=address12,address13` and `zookeeper://address21?backup=address22` ,address23`, which also specifies the cluster separator `separator=";"`

As shown in the figure below, the addresses of different registration center clusters will be aggregated into one address pool for load balancing or routing address selection on the consumer side.

![multi-registris-aggregation](/imgs/v3/registry/aggregation.png)

In version 3.1.0 and later, it is also supported to set specific attachments attributes on each registry cluster to achieve specific marking of addresses under the registry cluster, and then cooperate with Router component extensions such as TagRouter to realize cross-machine rooms traffic management capabilities.

```xml
<dubbo:registry address="multiple://127.0.0.1:2181?separator=;&reference-registry=zookeeper://address11?attachments=zone=hangzhou,tag=middleware;zookeeper://address21" />
```

After adding `attachments=zone=hangzhou,tag=middleware`, all URL addresses from the registration center will automatically carry the two identifiers of `zone` and `tag`, which facilitates more flexible traffic management on the consumer side.

## 3 Scenario example

### 3.1 Scenario 1: Cross-region registration service

For example: Some services of the Chinese website are too late to be deployed in Qingdao, and are only deployed in Hangzhou, while other applications in Qingdao need to reference this service, so the service can be registered to two registration centers at the same time.

```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" default="false" />
<!-- Register with multiple registries -->
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="hangzhouRegistry,qingdaoRegistry" />
```

### 3.2 Scenario 2: Isolation based on business

Some CRM services are specially designed for international websites, and some services are specially designed for Chinese websites.

```xml
<!-- Multi-registry configuration -->
<dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
<!-- Register with the Chinese Station Registration Center -->
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="chinaRegistry" />
<!-- Register with the International Station Registration Center -->
<dubbo:service interface="com.alibaba.hello.api.DemoService" version="1.0.0" ref="demoService" registry="intlRegistry" />
```

### 3.3 Scenario 3: Invoking services based on business

CRM needs to call the PC2 service of the Chinese station and the international station at the same time. PC2 is deployed in both the Chinese station and the international station. The interface and version number are the same, but the connected database is different.

```xml
<!-- Multi-registry configuration -->
<dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
<!-- Quote Chinese station service -->
<dubbo:reference id="chinaHelloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" registry="chinaRegistry" />
<!-- Reference international station service -->
<dubbo:reference id="intlHelloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" registry="intlRegistry" />
```

If only the test environment temporarily needs to connect to two different registration centers, use vertical symbols to separate multiple different registration center addresses:

```xml
<!-- Multi-registry configuration, separated by a vertical sign means connecting to multiple different registries at the same time, and multiple cluster addresses of the same registrant are separated by commas -->
<dubbo:registry address="10.20.141.150:9090|10.20.154.177:9010" />
<!-- Reference service -->
<dubbo:reference id="helloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" />
```