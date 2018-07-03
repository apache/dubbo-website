# Simple Registry Server

Simple registry server itself is a regular dubbo service. In this way, third-party dependency is unnecessary, and communication keeps consistent at the same moment.

## Configuration

Register simple registry server as dubbo service:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <!-- application info configuration -->
    <dubbo:application name="simple-registry" />
    <!-- service protocol configuration -->
    <dubbo:protocol port="9090" />
    <!-- service configuration -->
    <dubbo:service interface="com.alibaba.dubbo.registry.RegistryService" ref="registryService" registry="N/A" ondisconnect="disconnect" callbacks="1000">
        <dubbo:method name="subscribe"><dubbo:argument index="1" callback="true" /></dubbo:method>
        <dubbo:method name="unsubscribe"><dubbo:argument index="1" callback="false" /></dubbo:method>
    </dubbo:service>
    <!-- simple registry server implementation, register other implementation if cluster ability is a requirement-->
    <bean id="registryService" class="com.alibaba.dubbo.registry.simple.SimpleRegistryService" />
</beans>
```

Reference simple registry server service:

```xml
<dubbo:registry address="127.0.0.1:9090" />
```

Or:

```xml
<dubbo:service interface="com.alibaba.dubbo.registry.RegistryService" group="simple" version="1.0.0" ... >
```

Or:

```xml
<dubbo:registry address="127.0.0.1:9090" group="simple" version="1.0.0" />
```

## Applicability

This `SimpleRegistryService` is just a simple implementation for register server, and it doesn't have cluster support. It is useful for the implementation reference for the custom registery server, but not suitable for use in production environment directly.
