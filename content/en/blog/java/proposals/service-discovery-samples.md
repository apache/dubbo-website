---
aliases:
    - /en/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-samples/
    - /en/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-samples/
    - /en/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-samples/
linkTitle: Application-Level Service Discovery Migration Example
title: Application-Level Service Discovery Migration Example
tags: ["Java","Service Discovery"]
date: 2024-05-13
---






Application-level service discovery serves as a protocol for service discovery between applications. Therefore, to utilize application-level service discovery, both the consumer and provider must upgrade to Dubbo version 3.0 and enable the new features (enabled by default) to effectively leverage the advantages of application-level service discovery.

## Enabling Methods
### Provider
After the application is upgraded to Dubbo 3.0, the provider automatically activates dual registration for interface-level + application-level, requiring no modification from developers.

### Consumer
After the application is upgraded to Dubbo 3.0, the consumer automatically starts the dual subscription for interface-level + application-level, with no configuration changes needed from developers. It is recommended to close interface-level subscription in the consumer after all providers upgrade to Dubbo 3.0 and enable application-level registration to free up corresponding memory.

## Detailed Explanation
### Provider Configuration

1. Global Switch

The application configuration (can be specified via configuration files or -D) `dubbo.application.register-mode` as instance (registers only application level) or all (registers both interface level and application level) enables the global registration switch. With this switch configured, application-level addresses will be registered with all registries for consumer service discovery.
> [Reference Example](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-provider1/src/main/resources/application.yml)

```
# Dual Registration
dubbo:
    registry:
        register-mode: all
```
```
# Application-Level Registration Only
dubbo:
    registry:
        register-mode: instance
```

2. Registry Address Parameter Configuration

You can configure the registry address with `registry-type=service` to explicitly specify that this registry is for application-level service discovery, and registries with this configuration will only perform application-level service discovery.

```xml
<dubbo:registry address="nacos://${nacos.address:127.0.0.1}:8848?registry-type=service"/>
```
### Consumer Subscription Mode
FORCE_INTERFACE: Only interface-level subscription, consistent with Dubbo 2.7 and previous versions.
APPLICATION_FIRST: Dual subscription for interface-level + application-level; if addresses can be subscribed at the application level, it will use that, otherwise it falls back to interface-level subscription to ensure maximum compatibility during migration. (Note: Due to simultaneous subscriptions, memory usage will increase; thus, after all providers upgrade to Dubbo 3.0, it is recommended to switch to FORCE_APPLICATION mode to reduce memory consumption.)
FORCE_APPLICATION: Only application-level subscription, adopting the new service discovery model exclusively.
### Consumer Configuration

1. Default Configuration (No configuration needed)

After upgrading to Dubbo 3.0, the default behavior is dual subscription for interface-level + application-level; if addresses can be subscribed at the application level, it uses that, otherwise it falls back to interface-level subscription for maximum compatibility.

2. Subscription Parameter Configuration

Application configuration (can be specified via configuration files or -D) `dubbo.application.service-discovery.migration` set to `APPLICATION_FIRST` enables dual subscription mode; configuring it as `FORCE_APPLICATION` enforces application-level subscription mode only. Specific interface subscriptions can be configured in `ReferenceConfig` under `parameters` with key `migration.step`, value either `APPLICATION_FIRST` or `FORCE_APPLICATION`.
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

3. Dynamic Configuration (Highest Priority, can be modified at runtime)

This configuration needs to be pushed based on the configuration center, with the key being the application name + `.migration` (e.g., `demo-application.migration`), and group set to `DUBBO_SERVICEDISCOVERY_MIGRATION`. For rule body configuration, refer to the [Guidelines for Migrating Interface-Level Service Discovery to Application-Level Service Discovery](../migration-service-discovery/).
> [Reference Example](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-consumer/src/main/java/org/apache/dubbo/demo/consumer/UpgradeUtil.java)

```java
step: FORCE_INTERFACE
```

