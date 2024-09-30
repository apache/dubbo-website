---
aliases:
  - /en/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/migration-service-discovery/
title: "Smoothly Migrating from Interface-Level Service Discovery to Application-Level Service Discovery"
linkTitle: "Dubbo3 Service Discovery Smooth Migration Steps and Principles"
tags: ["Java","Service Discovery"]
date: 2024-05-13
description: >
   "Details on migrating to application-level service discovery in Dubbo3, including migration rules and operational principles."
---

Overall, in the address registration and discovery phase, `3.x` is fully compatible with `2.x`, which means users can choose to upgrade any number of applications or machines within the cluster to `3.x` while maintaining interoperability with `2.x` during the process.

> For details on the migration principles, please refer to [migration rules and principles](../service-discovery-rule).

## 1 Quick Upgrade Steps

Simply updating the pom.xml to the latest version completes the upgrade; if migrating to application-level addresses, just adjust the switch controlling the default behavior of 3.x.

1. Upgrade the Provider application to the latest 3.x version dependency and configure the dual registration switch `dubbo.application.register-mode=all` (preferably set through the global configuration center, which is enabled by default), completing the application release.
2. Upgrade the Consumer application to the latest 3.x version dependency and configure the dual subscription switch `dubbo.application.service-discovery.migration=APPLICATION_FIRST` (preferably set through the global configuration center, which is enabled by default), completing the application release.
3. Once all Consumers on the Provider have completed the application-level address migration, the Provider can switch to application-level address single registration to finish the upgrade.

Below is a detailed description of the migration process.

## 2 Provider Upgrade Process Explained

Without changing any Dubbo configurations, an application or instance can be upgraded to version 3.x. The upgraded Dubbo instance will still ensure compatibility with version 2.x, meaning it will register the 2.x formatted addresses to the registry normally, keeping the upgraded instance visible to the entire cluster.

At the same time, the new address discovery model (registering application-level addresses) will also be automatically registered.

![//imgs/v3/migration/provider-registration.png](/imgs/v3/migration/provider-registration.png)

1. Global Switch

Application configuration (can be set via configuration files or -D) `dubbo.application.register-mode` to instance (register application-level only) or all (register both interface-level and application-level) opens the global registration switch. After configuring this switch, it will, by default, register application-level addresses in all registration centers for consumer service discovery.

```
# Dual Registration
dubbo.application.register-mode=all
```
```
# Application-Level Registration Only
dubbo.application.register-mode=instance
```
By using the -D parameter, you can specify the registration behavior when the provider starts.

```text
-Ddubbo.application.register-mode=all
# Optional values are interface, instance, all; the default is all, meaning registering both interface-level and application-level addresses.
```

Additionally, you can modify the global default behavior in the configuration center to control the registration behavior of all 3.x instances. The priority of the global switch is lower than the -D parameter.

2. Registry Address Parameter Configuration

The address of the registry can be configured with `registry-type=service` to explicitly designate that registry as the application-level service discovery registry. Registries configured with this will only conduct application-level service discovery.
> [Reference Example](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-demo-servicediscovery-xml/servicediscovery-provider/src/main/resources/spring/dubbo-provider.xml)

```xml
<dubbo:registry address="nacos://${nacos.address:127.0.0.1}:8848?registry-type=service"/>
```

To ensure smooth migration so that instances upgraded to 3.x can be discovered by both 2.x and 3.x consumer instances, 3.x instances must enable dual registration; once all upstream consumers have migrated to the 3.x address model, the provider can switch to instance mode (only registering application-level addresses). For information on how to upgrade consumers to 3.x, please refer to the next section.

### 2.1 Resource Consumption from Dual Registration

Dual registration will inevitably bring additional storage pressure to the registration center, but considering the significant storage advantage of the application-level address discovery model, even for users with extremely large-scale clusters, the added data volume will not pose a storage problem. Overall, for an ordinary cluster, data growth can be controlled to be between 1/100 and 1/1000 of the previous total data volume.

For a medium-sized cluster instance: 2000 instances, 50 applications (500 Dubbo interfaces, with an average of 10 interfaces per application).

Assuming the average size of each interface-level URL is 5kb and each application-level URL is 0.5kb.

Old interface-level address amount: 2000 * 500 * 5kb ≈ 4.8G

New application-level address amount: 2000 * 50 * 0.5kb  ≈ 48M

The dual registration only increases the data volume by 48M.

## 3 Consumer Upgrade Process

For 2.x consumer instances, they naturally see a list of providers at version 2.x;

For 3.x consumers, they have the capability to discover both 2.x and 3.x provider addresses. By default, if there exists any consumable 3.x addresses in the cluster, they will automatically consume those, and if not, they will automatically consume 2.x addresses. Dubbo3 provides a switch to control this behavior:

```text
dubbo.application.service-discovery.migration=APPLICATION_FIRST
# Optional values:
# FORCE_INTERFACE, only consume interface-level addresses, if no address exists, report an error, single subscribe to 2.x address.
# APPLICATION_FIRST, intelligently decide between interface-level and application-level addresses, dual subscription.
# FORCE_APPLICATION, only consume application-level addresses; if no address exists, report an error, single subscribe to 3.x address.
```

![//imgs/v3/migration/consumer-subscription.png](/imgs/v3/migration/consumer-subscription.png)

1. Default Configuration (No configuration needed)

After upgrading to Dubbo 3.0, the default behavior is to dual subscribe to interface-level and application-level addresses. If application-level addresses can be subscribed, they will use the application-level subscription; if not, they will use the interface-level subscription to ensure maximum compatibility.

2. Subscription Parameter Configuration

Application configuration (can be set via configuration files or -D) `dubbo.application.service-discovery.migration` to `APPLICATION_FIRST` enables the dual subscription mode, and configuring it as `FORCE_APPLICATION` forces it to single subscribe to application-level only.
Specific interface subscription can be configured in `ReferenceConfig` within `parameters` with key `migration.step` and value as `APPLICATION_FIRST` or `FORCE_APPLICATION` for single subscription configuration.

`dubbo.application.service-discovery.migration` can be configured via `-D` and `global configuration center`.

> [Reference Example](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-consumer/src/test/java/org/apache/dubbo/demo/consumer/DemoServiceConfigIT.java)

```java
System.setProperty("dubbo.application.service-discovery.migration", "APPLICATION_FIRST");
```
```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<>(applicationModel.newModule());
referenceConfig.setInterface(DemoService.class);
referenceConfig.setParameters(new HashMap<>());
referenceConfig.getParameters().put("migration.step", mode);
return referenceConfig.get();
```

3. Dynamic Configuration (Highest Priority, can modify configuration at runtime)

This configuration needs to be pushed based on the configuration center, where the key is the application name + `.migration` (e.g., `demo-application.migration`), and the group is `DUBBO_SERVICEDISCOVERY_MIGRATION`. For detailed configuration of the rule body, refer to [the guide to migrating from interface-level service discovery to application-level service discovery](../migration-service-discovery/).
> [Reference Example](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-consumer/src/main/java/org/apache/dubbo/demo/consumer/UpgradeUtil.java)

```java
step: FORCE_INTERFACE
```

Next, let's take a closer look at how dual subscription mode (APPLICATION_FIRST) allows the upgraded 3.x consumers to migrate to application-level addresses. Before diving into specifics, it's essential to clarify a consumer's addressing behavior: **For dual subscription scenarios, although the consumer can hold both 2.x and 3.x addresses, the addressing process is completely isolated; it will either use the 2.x addresses or the 3.x addresses, without mixing calls from both sets. This decision-making process is completed upon receiving the first address notification.**

Here’s an example of the operation process under the `APPLICATION_FIRST` strategy.

First, set a configuration item in the global configuration center Nacos in advance (all consumer instances will execute this addressing strategy by default):

![//imgs/v3/migration/nacos-migration-item.png](/imgs/v3/migration/nacos-migration-item.png)

Next, upgrade the consumer to version 3.x and start it. At this point, the consumer reads the `APPLICATION_FIRST` config and executes the dual subscription logic (subscribing to both the 2.x interface-level addresses and the 3.x application-level addresses).

Thus, the upgrade operation is completed, and the remaining task is handled internally by the framework. Before invocation occurs, the framework will have an "addressing process" at the consumer end, which differs from the previous 2.x version; this addressing process includes two levels of filtering:

* First, filter the address list (ClusterInvoker) (interface-level address or application-level address)
* Then filter the actual provider addresses (Invoker).

![//imgs/v3/migration/migration-cluster-item.png](/imgs/v3/migration/migration-cluster-invoker.png)

The basis upon which ClusterInvoker filters can be defined through the MigrationAddressComparator SPI. Currently, there is a simple address count comparison strategy provided by the official; it allows migration when `the number of application-level addresses == the number of interface-level addresses`.

> Actually, FORCE_INTERFACE, APPLICATION_FIRST, and FORCE_APPLICATION all control the filtering strategy of ClusterInvoker.

### 3.1 Resource Consumption from Dual Subscription

Dual subscription will inevitably increase memory consumption on the consumer side, but due to the advantages of application-level address discovery in terms of the total number of addresses, this increase is usually acceptable. We will analyze it from two perspectives:

1. Increase in address-push data volume due to dual subscription. This was addressed in the section on "Resource Consumption from Dual Registration" where the increase in registration center data volume from application-level service discovery is very limited.
2. Increase in memory on the consumer side caused by dual subscription. Note that dual subscription only exists transiently at startup; after the ClusterInvoker's decision-making process, one set of addresses will be completely discarded; for a single service, the memory increase during the startup phase caused by dual subscription is generally controllable within 30% ~ 40% of the original memory volume, after which it will decrease to single subscription levels. If it switches to application-level addresses, a reduction of up to 50% in memory can be achieved.

### 3.2 Finer Control on Consumer Side

In addition to the global migration strategy, Dubbo provides finer-grained migration strategy support on the consumer side. Control can be at the level of a particular consumer application, with services A and B consuming it potentially having their respective independent migration strategies. This is achieved by configuring migration rules on the consumer side:

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

This method allows for precise migration control, but the modification cost for both now and in the future can be high, and we do not generally recommend activating this configuration mode except in special cases.
Officially, the recommended global switch migration strategy in the [migration guide](../service-discovery-rule/) allows consumer instances to decide which available address list to use during the startup phase.

## 4 Convergence of Migration States

To simultaneously support version 2.x while upgrading to version 3.x, applications will need to either be in a dual registration state or a dual subscription state for a period.

To resolve this, we will look at it from the provider perspective. Once all Providers have switched to application-level address registration, the dual subscription issue will no longer exist.

### 4.1 The Impact of Different Upgrade Strategies

Undoubtedly, the sooner and more thoroughly the upgrade can be performed, the quicker this situation can be resolved. Suppose all applications within the organization can be upgraded to version 3.x; then the version convergence process becomes very straightforward: during the upgrade, Providers continue to maintain dual registration, and once all applications are upgraded to 3.x, the global default behavior can be adjusted, enabling Providers to switch to application-level single registration. This transition will not confuse Consumer applications because they will already be able to recognize application-level addresses as 3.x versions.

If a full upgrade of applications is not feasible and only a portion can be upgraded for a considerable amount of time, the migration state will inevitably persist longer.
In this case, our goal can only be to maintain version and function convergence for upgraded applications in upstream and downstream implementations as much as possible. Encourage certain upstream consumers of Providers to upgrade to Dubbo3; doing so will allow for the removal of dual registration for those Providers. Achieving this may require support from auxiliary statistical tools.

1. The ability to analyze the dependency relationships between applications, such as which consumer applications consume a Provider application, can be implemented using the service metadata reporting capability provided by Dubbo.
2. Knowing which Dubbo version each application is currently using can be achieved through scanning or active reporting methods.

## 5 Migration State Model

Before Dubbo 3, the address registration model registered at the interface level granularity in the registry, whereas the new application-level registration model in Dubbo 3 registers at the application level granularity. From the perspective of registry implementation, they are almost completely different, which leads to the fact that invokers obtained from interface-level registrations cannot be merged with those obtained from application-level registrations. To help users migrate from interface-level to application-level, Dubbo 3 has designed a Migration mechanism that implements address model switching through three state transitions.

![//imgs/v3/migration/migration-1.png](/imgs/v3/migration/migration-1.png)

Currently, there are three states: FORCE_INTERFACE (force interface level), APPLICATION_FIRST (application level first), FORCE_APPLICATION (force application level).

FORCE_INTERFACE: Only enable the registry logic for interface-level service discovery under compatibility mode, where 100% of invocation traffic flows through the original process.
APPLICATION_FIRST: Enable dual subscription for interface-level and application-level, dynamically deciding the invocation traffic direction based on thresholds and gray traffic ratios.
FORCE_APPLICATION: Only enable the registry logic for application-level service discovery under the new model, where 100% of invocation traffic flows through application-level subscribed addresses.

### 5.1 Rule Body Description

The rules are configured in YAML format, with specific configurations as shown below:
```yaml
key: Consumer Application Name (required)
step: State Name (required)
threshold: Decision Threshold (default 1.0)
proportion: Gray Ratio (default 100)
delay: Decision Delay Time (default 0)
force: Forced Switch (default false)
interfaces: Interface Granularity Configuration (optional)
  - serviceKey: Interface Name (Interface + : + Version Number) (required)
    threshold: Decision Threshold
    proportion: Gray Ratio
    delay: Decision Delay Time
    force: Forced Switch
    step: State Name (required)
  - serviceKey: Interface Name (Interface + : + Version Number)
    step: State Name
applications: Application Granularity Configuration (optional)
  - serviceKey: Application Name (name of the upstream application consumed) (required)
    threshold: Decision Threshold
    proportion: Gray Ratio
    delay: Decision Delay Time
    force: Forced Switch
    step: State Name (required)
``` 

- key: Consumer Application Name
- step: State Name (FORCE_INTERFACE, APPLICATION_FIRST, FORCE_APPLICATION)
- threshold: Decision Threshold (float, see further explanation below)
- proportion: Gray Ratio (0 to 100, determines the call frequency ratio)
- delay: Decision Delay Time (the actual waiting time is 1 to 2 times the delay time, depending on the timing of the first notification from the registry; for the current registries implemented by Dubbo, this configuration can be kept at 0)
- force: Forced Switch (whether to switch directly without considering decisions for FORCE_INTERFACE and FORCE_APPLICATION, which may lead to addressing failures)
- interfaces: Interface Granularity Configuration

Reference configuration example:
```yaml
key: demo-consumer
step: APPLICATION_FIRST
threshold: 1.0
proportion: 60
delay: 0
force: false
interfaces:
  - serviceKey: DemoService:1.0.0
    threshold: 0.5
    proportion: 30
    delay: 0
    force: true
    step: APPLICATION_FIRST
  - serviceKey: GreetingService:1.0.0
    step: FORCE_APPLICATION
```

### 5.1 Configuration Method Description
#### 1. Configuration Center File Delivery (Recommended)

- Key: Consumer application name + ".migration"
- Group: DUBBO_SERVICEDISCOVERY_MIGRATION

Configuration item content refers to the previous section.

When the program starts, this configuration will be pulled as the highest priority startup item; if the configuration item is a startup item, no checking operation will be executed, directly reaching the terminal state based on state information.
During the program's operation, upon receiving a new configuration item, migration will be executed, following which checks will occur based on configuration details; if the checks fail, it will roll back to the state before migration. Migration will be executed at the interface granularity, so if an application has 10 interfaces, and 8 migrate successfully while 2 fail, the terminal state will have the 8 successfully migrated interfaces executing new behaviors, while the 2 that failed will remain in the old state. If a re-triggering of migration is necessary, this can be accomplished by resubmitting the rules.

Note: If the program rolls back due to check failures during migration, since there is no write-back behavior for configuration items, a program restart will cause it to initialize directly according to the new behaviors without checks.

#### 2. Startup Parameter Configuration

- Configuration Name: dubbo.application.service-discovery.migration
- Allowed Value Range: FORCE_INTERFACE, APPLICATION_FIRST, FORCE_APPLICATION

This configuration item can be passed through environment variables or the configuration center and has a lower priority than configurations from configuration files at startup, meaning that when the configuration center’s configuration file does not exist, this configuration item will be read as the startup state.

#### 3. Local File Configuration

| Configuration Name | Default Value | Description |
| --- | --- | --- |
| dubbo.migration.file | dubbo-migration.yaml | Local configuration file path |
| dubbo.application.migration.delay | 60000 | Delay effect time for configuration file (milliseconds) |

The format of configurations within local files is consistent with the aforementioned rules.

The local file configuration method essentially serves as a delayed notification method; the local file will not affect the default startup method. Once the delay time is reached, it triggers a notification containing the same content as the local file. This delay time is independent of the delay field in the rules body. 
The local file configuration method can ensure that the initialization starts with default behavior and trigger migration operations with corresponding checks after the delay time has been reached.

### 5.2 Decision Explanation
##### 1. Threshold Detection

The threshold mechanism aims to check the number of available addresses before switching traffic. If the number of usable application-level addresses compared to the interface-level addresses does not meet the threshold, the check will fail.

The core code is as follows:
```java
if (((float) newAddressSize / (float) oldAddressSize) >= threshold) {
    return true;
}
return false;
```

Additionally, the MigrationAddressComparator serves as an SPI extension point, allowing users to create their own extensions, with all check results yielding an intersection.

##### 2. Gray Ratio

The gray ratio function is only effective under application-level priority status. This function enables users to decide the call frequency ratio to new application-level registered center addresses. Gray effects are dependent on threshold detection being satisfied. In application-level priority status, if the threshold detection passes, `currentAvailableInvoker` will switch to the corresponding application-level address invoker; if detection fails, `currentAvailableInvoker` will still reference the existing interface-level address invoker.

The flowchart shows:
Detection Phase
![//imgs/v3/migration/migration-2.png](/imgs/v3/migration/migration-2.png)
Invocation Phase
![//imgs/v3/migration/migration-3.png](/imgs/v3/migration/migration-3.png)

Core code is as follows:
```java
// currentAvailableInvoker is based on MigrationAddressComparator's result
if (currentAvailableInvoker != null) {
    if (step == APPLICATION_FIRST) {
        // call ratio calculation based on random value
        if (ThreadLocalRandom.current().nextDouble(100) > promotion) {
            return invoker.invoke(invocation);
        }
    }
    return currentAvailableInvoker.invoke(invocation);
}
```

### 5.3 Switching Process Description

The address migration process involves state switching. To ensure a smooth migration, a total of 6 switch paths need to be supported. These can be summarized as switching from forced interface-level or forced application-level to application-level priority; from application-level priority to forced interface-level or forced application-level; and mutual switching between forced interface-level and forced application-level.
For the process of switching the same interface, it is always synchronized; if the previous rule has not been completed before receiving a new rule, the process will wait.

###### 1. Switch to Application-Level Priority

Switching from forced interface-level or forced application-level to application-level priority fundamentally transitions from single to dual subscription, retaining the original subscription and creating an additional subscription. In this switching mode, the delay configurations specified in the rule body will not take effect, meaning that after the subscription is created, threshold detection and decision-making will occur immediately to select one group of subscriptions for priority invocation. As the application-level priority mode supports dynamic threshold detection at runtime, for some registries where the full addresses cannot be obtained at startup, the thresholds will be recalculated and switched once all address notifications are complete. 
The dynamic switching mechanism in application-level priority mode is based on service directory (Directory) address listeners.
![//imgs/v3/migration/migration-4.png](/imgs/v3/migration/migration-4.png)

###### 2. Application-Level Priority Switch to Forced

The process of switching from application-level priority to forced interface-level or forced application-level involves checking the dual subscriptions; if satisfied, the other subscription will be destroyed, and if not satisfied, it will roll back to the original application-level priority state.
If users wish for the switch process to occur without checks, they can enable the force parameter.
![//imgs/v3/migration/migration-5.png](/imgs/v3/migration/migration-5.png)

###### 3. Mutual Switching Between Forced Interface-Level and Forced Application-Level

Mutual switching between forced interface-level and forced application-level requires temporarily creating a new subscription to determine whether the new subscription (i.e., use the number of addresses in new subscriptions after threshold calculations to deduce the number of old subscriptions) meets the standards for switching; if met, the switch will proceed; if not, the new subscription will be destroyed, rolling back to the previous state.
![//imgs/v3/migration/migration-6.png](/imgs/v3/migration/migration-6.png)

