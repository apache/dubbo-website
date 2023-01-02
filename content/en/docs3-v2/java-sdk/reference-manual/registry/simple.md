---
type: docs
title: "Simple Registry"
linkTitle: "Simple"
weight: 7
description: "Simple Registry Reference Manual"
---

{{% pageinfo %}} This function has been removed in Dubbo 2.7, please select [other registry](../) for migration.
{{% /pageinfo %}}

The Simple registry itself is an ordinary Dubbo service, which can reduce third-party dependencies and make the overall communication method consistent.

## configuration

Expose the Simple registry as a Dubbo service:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema /dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <!-- Current application information configuration -->
    <dubbo:application name="simple-registry" />
    <!-- Expose service protocol configuration -->
    <dubbo:protocol port="9090" />
    <!-- Expose service configuration -->
    <dubbo:service interface="org.apache.dubbo.registry.RegistryService" ref="registryService" registry="N/A" ondisconnect="disconnect" callbacks="1000">
        <dubbo:method name="subscribe"><dubbo:argument index="1" callback="true" /></dubbo:method>
        <dubbo:method name="unsubscribe"><dubbo:argument index="1" callback="false" /></dubbo:method>
    </dubbo:service>
    <!-- Implementation of a simple registration center, which can be expanded by itself to achieve cluster and state synchronization -->
    <bean id="registryService" class="org.apache.dubbo.registry.simple.SimpleRegistryService" />
</beans>
```

Quoting the Simple Registry service:

```xml
<dubbo:registry address="127.0.0.1:9090" />
```

or:

```xml
<dubbo:service interface="org.apache.dubbo.registry.RegistryService" group="simple" version="1.0.0" ... >
```

or:

```xml
<dubbo:registry address="127.0.0.1:9090" group="simple" version="1.0.0" />
```

## Applicability Notes

This `SimpleRegistryService` is just a simple implementation and does not support clustering. It can be used as a reference for a custom registry, but it is not suitable for direct use in a production environment.