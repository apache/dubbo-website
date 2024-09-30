---
title: "Dubbo Cluster Fault Tolerance"
linkTitle: "Dubbo Cluster Fault Tolerance"
tags: ["Java"]
date: 2018-08-22
description: >
    In distributed systems, it is quite likely that some nodes in a cluster will encounter problems. Therefore, it is essential to treat failure as a first-class design citizen when designing a distributed RPC framework. How to choose a failure handling strategy after a call fails is subjective, as each strategy may have its unique application scenarios. As a framework, multiple strategies should be provided for user selection based on different scenarios. This article introduces several error handling strategies provided by the Dubbo framework and explains how to configure them through examples.
---

### Design For failure

In distributed systems, it is quite likely that some nodes in a cluster will encounter problems. Therefore, it is essential to treat failure as a first-class design citizen when designing a distributed RPC framework. How to choose a failure handling strategy after a call fails is subjective, as each strategy may have its unique application scenarios. As a framework, multiple strategies should be provided for user selection based on different scenarios.

In Dubbo's design, the interface abstraction of the Cluster combines a set of callable Provider information into a unified `Invoker` for invocation. After filtering through routing rules and load balancing, a specific address is chosen for invocation. If the call fails, fault tolerance handling will be performed according to the cluster configuration.

Dubbo has several built-in fault tolerance strategies by default, which can be configured through custom fault tolerance strategies if user needs are not met.

### Built-in Fault Tolerance Strategies

Dubbo mainly has the following strategies:

* Failover
* Failsafe
* Failfast
* Failback
* Forking
* Broadcast

These names are quite similar, and the concepts can be easily confused, so let's explain them one by one.

#### Failover

`Failover` is a common concept in high-availability systems. The server typically has a primary and backup machine configuration. If the primary server fails, it automatically switches to the backup server, ensuring overall high availability.

Dubbo adopts this idea, making it the `default fault tolerance strategy` for Dubbo. When a call fails, it automatically selects an available address based on the configured retry count until the call succeeds or the retry limit is reached.

In Dubbo, the default configured retry count is 2, meaning that including the first call, it will make a maximum of 3 calls.

Its configuration can be set at both the service provider and service consumer sides. The configuration for retry count is even more flexible, as it can be configured at both the service and method levels. The specific priority order is:

```
Consumer method-level configuration > Consumer service-level configuration > Provider method-level configuration > Provider service-level configuration
```

For example, in XML format, the specific configuration methods are as follows:

Provider side, service-level configuration:

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="failover" retries="2" />
```

Provider side, method-level configuration:

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="failover">
     <dubbo:method name="sayHello" retries="2" />
 </dubbo:reference>
```

Consumer side, service-level configuration:

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failover" retries="1"/>
```

Consumer side, method-level configuration:

```xml
 <dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failover">
     <dubbo:method name="sayHello" retries="3" />
 </dubbo:reference>
```

Failover can automatically retry on failures, shielding the caller from failure details; however, the Failover strategy can also bring some side effects:

* Retries add extra overhead, such as resource usage, which can exacerbate issues in high-load systems.
* Retries can increase response times.
* In certain cases, retries may cause resource wastage. Consider a call scenario, A->B->C; if A has a timeout of 100ms and the first call from B to C exceeds that when it completes, and B->C fails, the retry will be pointless. In A's view, this call has timed out and may have begun executing other logic.

#### Failsafe

The core of the failsafe strategy is that even if it fails, it will not affect the overall call process. It is usually used in bypass systems or processes where failures do not affect the correctness of core business. In implementation, when a call fails, this error is ignored, a log is recorded, and an empty result is returned, making it appear successful to upstream.

Application scenarios include operations like writing audit logs.

Specific configuration method:

Provider side, service-level configuration:

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="failsafe" />
```

Consumer side, service-level configuration:

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failsafe"/>
```

Where consumer-side configurations take precedence over provider-side configurations.

#### Failfast

In some business scenarios, certain operations may be non-idempotent, and repeating the call can lead to dirty data. For example, if a service is called that includes a database write operation, if the write operation completes but there is an error in sending the result to the caller, the call appears to have failed, even though the data has already been written. In such cases, retrying may not be a good strategy, necessitating the use of the `Failfast` strategy, which immediately reports an error on failure. This allows the caller to decide the next steps and ensure business idempotency.

Specific configuration method:

Provider side, service-level configuration:

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="failfast" />
```

Consumer side, service-level configuration:

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failfast"/>
```

Where consumer-side configurations take precedence over provider-side configurations.

#### Failback

`Failback` is typically associated with the `Failover` concept. In high availability systems, when a server fails, it switches between primary and backup using `Failover`, and once the fault is rectified, the system should have the ability to automatically recover the original configuration.

In Dubbo's `Failback` strategy, if a call fails, this failure is treated like `Failsafe`, returning an empty result. Unlike `Failsafe`, the Failback strategy adds this failed call to an in-memory list of failures. For calls in this list, asynchronous retries are made in another thread, and if retries fail again, they will be ignored. Even if the retries succeed, the original caller remains unaware of them. Hence, it is usually suitable for some asynchronous operations that are not real-time and do not require return values.

Specific configuration method:

Provider side, service-level configuration:

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="failsafe" />
```

Consumer side, service-level configuration:

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failsafe"/>
```

Where consumer-side configurations take precedence over provider-side configurations.

As currently implemented, the Failback strategy has limitations, such as the absence of an upper limit on the in-memory failure list, which may lead to a backlog and the inability to adjust the interval for asynchronous retries, which defaults to 5 seconds.

#### Forking

The strategies mentioned above mainly consider compensating for failures after a call has failed, whereas the `Forking` strategy differs by employing a cost-for-time approach. That is, multiple calls are simultaneously initiated during the first call, and success is considered if any one of them succeeds. This strategy can be used in scenarios with abundant resources and low tolerance for failures.

Specific configuration method:

Provider side, service-level configuration:

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="forking" />
```

Consumer side, service-level configuration:

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="forking"/>
```

Where consumer-side configurations take precedence over provider-side configurations.

#### Broadcast

In certain scenarios, it may be necessary to operate on all service providers. In this case, the broadcast calling strategy can be used. This strategy will invoke all providers one by one, and if any provider encounters an error, the call is considered failed. It is typically used to inform all providers to update caches or logs and other local resource information.

Specific configuration method:

Provider side, service-level configuration:

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="broadcast" />
```

Consumer side, service-level configuration:

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="broadcast"/>
```

Where consumer-side configurations take precedence over provider-side configurations.

#### Comparison of Various Strategies

The table below provides a simple comparison of various strategies.

| Strategy Name | Advantages                       | Disadvantages                             | Main Application Scenarios                                 |
|---------------|----------------------------------|------------------------------------------|-----------------------------------------------------------|
| Failover      | Masks call failures from the caller | Increases RT, additional resource overhead, resource wastage | Scenarios insensitive to call RT                             |
| Failfast      | Quickly informs of failure state for autonomous decision-making | Generates numerous error messages | Non-idempotent operations needing quick failure awareness   |
| Failsafe      | Ensures core processes are unaffected by failures | Insensitive to failure information, requires extra monitoring | Bypass systems where failure does not affect core processes |
| Failback      | Automatic asynchronous retry on failure | Retry tasks may accumulate | Asynchronous operations that are not real-time and require no return values |
| Forking       | Initiates multiple calls in parallel, reducing failure probability | Consumes additional machine resources, requires ensuring operation idempotency | Resource-rich and low failure tolerance scenarios with high real-time requirements |
| Broadcast      | Supports operations on all service providers | Consumes significant resources | Notifying all providers to update caches or logs           |

### Custom Fault Tolerance Strategy

If the built-in fault tolerance strategies above cannot meet your needs, you can also implement a custom fault tolerance strategy through extension.

#### Extension Interface

`com.alibaba.dubbo.rpc.cluster.Cluster`

#### Extension Configuration

```xml
<dubbo:service cluster="xxx" />
```

#### Example of Extension

Below is an example demonstrating how to use a custom fault tolerance strategy.
Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCluster.java (implementing the Cluster interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.Cluster (plain text file with content: xxx=com.xxx.XxxCluster)
```

XxxCluster.java:

```java
package com.xxx;
 
import org.apache.dubbo.rpc.cluster.Cluster;
import org.apache.dubbo.rpc.cluster.support.AbstractClusterInvoker;
import org.apache.dubbo.rpc.cluster.Directory;
import org.apache.dubbo.rpc.cluster.LoadBalance;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Result;
import org.apache.dubbo.rpc.RpcException;

import java.util.List;

public class XxxCluster implements Cluster {

    @Override
    public <T> Invoker<T> join(Directory<T> directory) throws RpcException {
        return new AbstractClusterInvoker<T>() {
            @Override
            protected Result doInvoke(Invocation invocation, List<Invoker<T>> invokers, LoadBalance loadbalance) throws RpcException {
                // your customized fault tolerance strategy goes here
            }
        };
    }

}
```

The content of the `META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.Cluster` file is:

```
xxx=com.xxx.XxxCluster
```

