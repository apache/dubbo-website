---
type: docs
title: "Dubbo3 application-level service discovery"
linkTitle: "Application-Level Service Discovery"
weight: 5
description: "This article specifically explains how users can quickly enable new features of application-level service discovery after upgrading to Dubbo 3.0."
---

Application-level service discovery is a protocol for service discovery between applications. Therefore, to use application-level service discovery, both the consumer and the server must be upgraded to Dubbo 3.0 and new features enabled (enabled by default) to use application-level service discovery in the link. Take advantage of application-level service discovery.
## Open method
## Server
After the application is upgraded to Dubbo 3.0, the server will automatically enable the interface-level + application-level dual registration function, and the developer does not need to modify any configuration by default

### Consumer side
After the application is upgraded to Dubbo 3.0, the consumer side automatically starts the interface-level + application-level dual subscription function, and the developer does not need to modify any configuration by default. It is recommended that after the server is upgraded to Dubbo 3.0 and the application-level registration is enabled, configure the consumer end to close the interface-level subscription through rules to release the corresponding memory space.

## Detailed description
### Server configuration

1. Global switch

Application configuration (can be specified by configuration file or -D) `dubbo.application.register-mode` enables the global registration switch for instance (only register application level) and all (both interface level and application level registration). After configuring this switch , by default, application-level addresses will be registered with all registries for service discovery on the consumer side.
> Example: [https://github.com/apache/dubbo-samples/blob/master/dubbo-samples-cloud-native/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-provider2/src/main/resources/ dubbo.properties](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-provider2/src /main/resources/dubbo.properties)

```
# double registration
dubbo.application.register-mode=all
```
```
# Application-level registration only
dubbo.application.register-mode=instance
```

2. Registration center address parameter configuration

Registry-type=service can be configured on the address of the registry to display the registry that specifies the registry as application-level service discovery, and the registry with this configuration will only perform application-level service discovery.
> Example: [https://github.com/apache/dubbo-samples/blob/master/dubbo-samples-cloud-native/dubbo-demo-servicediscovery-xml/servicediscovery-provider/src/main/resources/spring/ dubbo-provider.xml](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-demo-servicediscovery-xml/servicediscovery-provider/src /main/resources/spring/dubbo-provider.xml)

```xml
<dubbo:registry address="nacos://${nacos.address:127.0.0.1}:8848?registry-type=service"/>
```
### Consumer Subscription Mode

FORCE_INTERFACE: only interface-level subscription, the behavior is consistent with Dubbo 2.7 and previous versions.
APPLICATION_FIRST: interface level + application level multi-subscription, if the application level can subscribe to the address, use the application level subscription, if the address cannot be subscribed, use the interface level subscription, so as to ensure the greatest compatibility during the migration process. (Note: Due to the simultaneous subscription behavior, the memory usage in this mode will increase to a certain extent, so after all servers are upgraded to Dubbo 3.0, it is recommended to migrate to FORCE_APPLICATION mode to reduce memory usage)
FORCE_APPLICATION: Only application-level subscriptions will only use the new service discovery model.

### Consumer configuration

1. Default configuration (no configuration required)

After upgrading to Dubbo 3.0, the default behavior is interface-level + application-level multi-subscription. If the address can be subscribed at the application level, the application-level subscription will be used. If the address cannot be subscribed, the interface-level subscription will be used to ensure maximum compatibility.

2. Subscription parameter configuration

Application configuration (can be specified by configuration file or -D) `dubbo.application.service-discovery.migration` is `APPLICATION_FIRST` to enable multi-subscription mode, and configuration to `FORCE_APPLICATION` can force application-level subscription mode only.
The specific interface subscription can be configured in `parameters` in `ReferenceConfig`, and the Key is `migration.step`, and the Value is `APPLICATION_FIRST` or `FORCE_APPLICATION` key-value pair to configure a single subscription.
> Example: [https://github.com/apache/dubbo-samples/blob/master/dubbo-samples-cloud-native/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-consumer/src/test/java/ org/apache/dubbo/demo/consumer/DemoServiceConfigIT.java](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration /dubbo-servicediscovery-migration-consumer/src/test/java/org/apache/dubbo/demo/consumer/DemoServiceConfigIT.java)

```java
System.setProperty("dubbo.application.service-discovery.migration", "APPLICATION_FIRST");
```
```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<>(applicationModel. newModule());
referenceConfig.setInterface(DemoService.class);
referenceConfig.setParameters(new HashMap<>());
referenceConfig.getParameters().put("migration.step", mode);
return referenceConfig.get();
```

3. Dynamic configuration (highest priority, configuration can be modified at runtime)

This configuration needs to be pushed based on the configuration center, the Key is the application name + `.migration` (such as `demo-application.migraion`), and the Group is `DUBBO_SERVICEDISCOVERY_MIGRATION`. For details on rule body configuration, see [Guidelines for migrating from interface-level service discovery to application-level service discovery](/en/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-rule/).
> Example: [https://github.com/apache/dubbo-samples/blob/master/dubbo-samples-cloud-native/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-consumer/src/main/java/ org/apache/dubbo/demo/consumer/UpgradeUtil.java](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration /dubbo-servicediscovery-migration-consumer/src/main/java/org/apache/dubbo/demo/consumer/UpgradeUtil.java)

```java
step: FORCE_INTERFACE
```
