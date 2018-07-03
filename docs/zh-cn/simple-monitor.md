> ![warning](sources/images/check.gif)监控中心也是一个标准的Dubbo服务，可以通过注册中心发现，也可以直连。

> ![warning](sources/images/check.gif)[简易注册中心安装](admin-guide-install-manual#简易注册中心安装)

0. 暴露一个简单监控中心服务到注册中心: (如果是用安装包，不需要自己写这个配置，如果是自己实现监控中心，则需要)

    ```xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
     
    <!-- 当前应用信息配置 -->
    <dubbo:application name="simple-monitor" />
     
    <!-- 连接注册中心配置 -->
    <dubbo:registry address="127.0.0.1:9090" />
     
    <!-- 暴露服务协议配置 -->
    <dubbo:protocol port="7070" />
     
    <!-- 暴露服务配置 -->
    <dubbo:service interface="com.alibaba.dubbo.monitor.MonitorService" ref="monitorService" />
     
    <bean id="monitorService" class="com.alibaba.dubbo.monitor.simple.SimpleMonitorService" />
</beans>
```

1. 通过注册中心发现监控中心服务:

    ```xml
    <dubbo:monitor protocol="registry" />
    ```

    或
    
    > dubbo.properties
    
    ```xml
    dubbo.monitor.protocol=registry
    ```
    
2. 暴露一个简单监控中心服务，但不注册到注册中心: (如果是用安装包，不需要自己写这个配置，如果是自己实现监控中心，则需要)

    ```xml   
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
     
    <!-- 当前应用信息配置 -->
    <dubbo:application name="simple-monitor" />
     
    <!-- 暴露服务协议配置 -->
    <dubbo:protocol port="7070" />
     
    <!-- 暴露服务配置 -->
    <dubbo:service interface="com.alibaba.dubbo.monitor.MonitorService" ref="monitorService" registry="N/A" />
     
    <bean id="monitorService" class="com.alibaba.dubbo.monitor.simple.SimpleMonitorService" />   
</beans>
    ```
    
3. 直连监控中心服务

    ```xml
    <dubbo:monitor address="dubbo://127.0.0.1:7070/com.alibaba.dubbo.monitor.MonitorService" />
    ```
    
    或：
    
    ```sh
    <dubbo:monitor address="127.0.0.1:7070" />
    ```
    
    或：
    
    **dubbo.properties**
    
    ```sh
    dubbo.monitor.address=127.0.0.1:7070
    ```


