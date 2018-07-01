# Simple 注册中心

Simple 注册中心本身就是一个普通的 Dubbo 服务，可以减少第三方依赖，使整体通讯方式一致。

## 配置

将 Simple 注册中心暴露成 Dubbo 服务：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <!-- 当前应用信息配置 -->
    <dubbo:application name="simple-registry" />
    <!-- 暴露服务协议配置 -->
    <dubbo:protocol port="9090" />
    <!-- 暴露服务配置 -->
    <dubbo:service interface="com.alibaba.dubbo.registry.RegistryService" ref="registryService" registry="N/A" ondisconnect="disconnect" callbacks="1000">
        <dubbo:method name="subscribe"><dubbo:argument index="1" callback="true" /></dubbo:method>
        <dubbo:method name="unsubscribe"><dubbo:argument index="1" callback="false" /></dubbo:method>
    </dubbo:service>
    <!-- 简单注册中心实现，可自行扩展实现集群和状态同步 -->
    <bean id="registryService" class="com.alibaba.dubbo.registry.simple.SimpleRegistryService" />
</beans>
```

引用 Simple Registry 服务：

```xml
<dubbo:registry address="127.0.0.1:9090" />
```

或者：

```xml
<dubbo:service interface="com.alibaba.dubbo.registry.RegistryService" group="simple" version="1.0.0" ... >
```

或者：

```xml
<dubbo:registry address="127.0.0.1:9090" group="simple" version="1.0.0" />
```

## 适用性说明  

此 `SimpleRegistryService` 只是简单实现，不支持集群，可作为自定义注册中心的参考，但不适合直接用于生产环境。
