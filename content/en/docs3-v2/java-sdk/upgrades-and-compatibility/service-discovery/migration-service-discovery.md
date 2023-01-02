---
type: docs
title: "Guidelines for migrating interface-level service discovery to application-level service discovery"
linkTitle: "Guidelines for migrating interface-level service discovery to application-level service discovery"
weight: 10
description: "This document is specifically aimed at old users of version 2.x. It explains in detail the default address registration and discovery behavior after upgrading to 3.x, and how to smoothly migrate to the address model of the new version."
---

**In general, 3.x is fully compatible with 2.x in address registration and discovery, which means that users can choose to upgrade any number of applications or machines in the cluster to 3.x, and at the same time Interoperability with 2.x versions is maintained in the process. **
If you are concerned about the working principle behind migration, please refer to [Migration Rule Details and Working Principle](../service-discovery-rule)

## 1 Quick upgrade steps

Simply modify the pom.xml to the latest version to complete the upgrade. If you want to migrate to the application-level address, you only need to adjust the switch to control the default behavior of the 3.x version.

1. Upgrade the Provider application to the latest 3.x version dependency, configure the dual registration switch `dubbo.application.register-mode=all` (it is recommended to set it through the global configuration center, it is automatically enabled by default), and complete the application release.
2. Upgrade the Consumer application to the latest 3.x version dependency, configure the dual subscription switch `dubbo.application.service-discovery.migration=APPLICATION_FIRST` (it is recommended to set it through the global configuration center, it is automatically enabled by default), and complete the application release.
3. After confirming that all consumers on the Provider have completed the application-level address migration, the Provider switches to the application-level address list registration. complete upgrade



The following is a detailed description of the migration process.

## 2 Provider-side upgrade process details

Without changing any Dubbo configuration, an application or instance can be upgraded to version 3.x, and the upgraded Dubbo instance will tacitly guarantee compatibility with version 2.x, that is, the 2.x format will be registered normally address to the registry, so upgraded instances will still remain visible to the entire cluster.



At the same time, the new address discovery model (registering application-level addresses) will also be automatically registered.

![//imgs/v3/migration/provider-registration.png](/imgs/v3/migration/provider-registration.png)

Through the -D parameter, you can specify the registration behavior when the provider starts

```text
-Ddubbo.application.register-mode=all
# Optional values interface, instance, all, the default is all, that is, both interface-level addresses and application-level addresses are registered
```



In addition, the global default behavior can be modified in the configuration center to control the registration behavior of all 3.x instances. Among them, the priority of the global switch is lower than that of the -D parameter.



In order to ensure smooth migration, that is, instances upgraded to 3.x can be discovered by 2.x and 3.x consumer instances at the same time, 3.x instances need to enable dual registration; when all upstream consumers are migrated to 3.x After the address model is specified, the provider can switch to the instance mode (only register application-level addresses). See the next section for how to upgrade the consumer to 3.x.

### 2.1 Resource consumption caused by double registration

Double registration will inevitably bring additional storage pressure on the registration center, but considering the great advantages of the data volume of the application-level address discovery model in terms of storage, even for some ultra-large-scale cluster users, the new data volume It doesn't cause storage problems either. Generally speaking, for an ordinary cluster, data growth can be controlled at 1/100 ~ 1/1000 of the previous total data

Take a medium-sized cluster instance: 2000 instances, 50 applications (500 Dubbo interfaces, 10 interfaces per application on average).

Assume that the average size of each interface-level URL address is 5kb, and the average size of each application-level URL is 0.5kb

Old interface-level address volume: 2000 * 500 * 5kb ≈ 4.8G

New application-level addresses: 2000 * 50 * 0.5kb ≈ 48M

After double registration, only 48M data volume has been increased.



## 3 Consumer side upgrade process

For 2.x consumer instances, they will naturally see the 2.x version of the provider address list;

For 3.x consumers, it has the ability to discover both 2.x and 3.x provider address lists. By default, if there is a 3.x address that can be consumed in the cluster, the 3.x address will be automatically consumed, and if there is no new address, the 2.x address will be automatically consumed. Dubbo3 provides a switch to control this behavior:

```text
dubbo.application.service-discovery.migration=APPLICATION_FIRST
# optional value
# FORCE_INTERFACE, only consume interface-level addresses, if there is no address, an error will be reported, and only subscribe to 2.x addresses
# APPLICATION_FIRST, intelligent decision interface level/application level address, double subscription
# FORCE_APPLICATION, only consume application-level addresses, if there is no address, an error will be reported, and only subscribe to 3.x addresses
```

`dubbo.application.service-discovery.migration` supports configuration via `-D` and `Global Configuration Center`.



![//imgs/v3/migration/consumer-subscription.png](/imgs/v3/migration/consumer-subscription.png)


Next, let's take a closer look at how to migrate consumers upgraded to 3.x to application-level addresses through the dual subscription mode (APPLICATION_FIRST). Before the specific development, first clarify the location selection behavior of the consumer: **For the dual subscription scenario, although the consumer can hold the 2.x address and the 3.x address at the same time, the two addresses are completely isolated during the location selection process Definitely: Either use 2.x address or 3.x address, there is no mixed calling of two addresses, this decision-making process is completed after receiving the first address notification. **



Next, let's look at the specific operation process of an `APPLICATION_FIRST` strategy.

First, configure a configuration item in the global configuration center Nacos in advance (all consumers will implement this address selection strategy by default):

![//imgs/v3/migration/nacos-migration-item.png](/imgs/v3/migration/nacos-migration-item.png)



Next, upgrade the consumer to version 3.x and start it. At this time, the consumer reads the `APPLICATION_FIRST` configuration and executes the double subscription logic (subscribing to 2.x interface-level addresses and 3.x application-level addresses)



At this point, the upgrade operation is completed, and the rest is the execution within the framework. Before the call occurs, the framework will have a "site selection process" on the consumer side. Note that the site selection here is different from the previous 2.x version. The site selection process includes two layers of screening:

* Filter the address list (ClusterInvoker) first (interface-level address or application-level address)
* Then perform the actual provider address (Invoker) screening.

![//imgs/v3/migration/migration-cluster-item.png](/imgs/v3/migration/migration-cluster-invoker.png)

The basis for ClusterInvoker screening can be defined by the MigrationAddressComparator SPI. Currently, the official provides a simple address quantity comparison strategy, that is, migration will be performed when `application-level address quantity == interface-level address quantity` is satisfied.

> In fact, FORCE_INTERFACE, APPLICATION_FIRST, and FORCE_APPLICATION control the filtering strategy of the ClusterInvoker type here



### 3.1 Resource consumption caused by double subscription

Double subscription will inevitably increase the memory consumption of the consumer, but due to the advantages of application-level address discovery in terms of the total number of addresses, this process is usually acceptable. We analyze it from two aspects:

1. The amount of address push data increased due to double subscription. We introduced this point in the "Double Registration Resource Consumption" section, and the data volume growth of the registration center brought about by application-level service discovery is very limited.
2. The increase in memory on the consumer side brought about by double subscriptions. It should be noted that double subscription only exists in the startup transient state, and one of the addresses will be completely destroyed after the ClusterInvoker site selection decision; for a single service, the memory growth caused by the double subscription during the startup phase can be controlled at about 30% of the original memory % ~ 40%, and then it will drop to the single subscription level. If you switch to the application-level address, you can achieve a 50% drop in memory.



### 3.2 Finer-grained control on the consumer side

In addition to the global migration strategy, Dubbo provides more fine-grained migration strategy support on the consumer side. The control unit can be a certain consumer application, and the service A and service B it consumes can have their own independent migration strategies. The specific method is to configure the migration rules on the consumer side:


```yaml
key: demo-consumer
step: APPLICATION_FIRST
applications:
 - name: demo-provider
   step: FORCE_APPLICATION
services:
 - serviceKey: org.apache.dubbo.config.api.DemoService:1.0.0
   step: FORCE_INTERFACE
```

Using this method can achieve more fine-grained migration control, but the current and subsequent transformation costs will be relatively high. Except for some special scenarios, we do not recommend enabling this configuration method.
([Migration Guide](../service-discovery-rule/)) **Officially recommended global switch-type migration strategy, allowing consumer instances to decide which available address list to use during the startup phase. **



## 4 Convergence of transition state

In order to be compatible with the 2.x version at the same time, the application upgraded to the 3.x version is either in the double registration state or in the double subscription state for a period of time.

To solve this problem, we still look at it from the Provider perspective. When all Providers are switched to application-level address registration, there will be no double subscription problem.

### 4.1 Different upgrade strategies have a great impact

There is no doubt that the sooner and more thoroughly the upgrade will be able to get rid of this situation as soon as possible. Imagine that if all applications in the organization can be upgraded to version 3.x, version convergence becomes very simple: Provider always maintains dual registration during the upgrade process. After all applications are upgraded to 3.x, you can Adjust the global default behavior to make Providers become application-level address list registrations. This process will not cause trouble for Consumer applications, because they are already version 3.x that can recognize application-level addresses.

If there is no way to upgrade the entire application, or even only a part of the application can be upgraded within a long period of time, the inevitable migration state will last for a relatively long time.
In this case, what we can only pursue is to keep the upstream and downstream implementation versions and functions of the upgraded application converged as much as possible. The upstream consumers of certain Providers are promoted to upgrade to Dubbo3, so that the dual registration of these Providers can be lifted. To do this, the support of some auxiliary statistical tools may be required.

1. To be able to analyze the dependencies between applications, such as which consumer applications a Provdier application is consumed by, this can be achieved through the service metadata reporting capability provided by Dubbo.
2. To know the dubbo version currently used by each application, you can scan or actively report.