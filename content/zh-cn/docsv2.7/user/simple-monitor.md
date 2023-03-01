---
aliases:
    - /zh/docsv2.7/user/simple-monitor/
description: Dubbo 中的简单监控服务
linkTitle: 简单监控
title: 简单监控
type: docs
weight: 20
---



{{% alert title="Warning" color="warning" %}}
监控中心也是一个标准的 Dubbo 服务，可以通过注册中心发现，也可以直连。
{{% /alert %}}



1. 暴露一个简单监控中心服务到注册中心: (如果是用安装包，不需要自己写这个配置，如果是自己实现监控中心，则需要)

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
       <dubbo:service interface="org.apache.dubbo.monitor.MonitorService" ref="monitorService" />
     
       <bean id="monitorService" class="org.apache.dubbo.monitor.simple.SimpleMonitorService" />
    </beans>
    ```

2. 通过注册中心发现监控中心服务:

    ```xml
    <dubbo:monitor protocol="registry" />
    ```

    或者在 dubbo.properties 配置：
    
    ```properties
    dubbo.monitor.protocol=registry
    ```
    
3. 暴露一个简单监控中心服务，但不注册到注册中心: (如果是用安装包，不需要自己写这个配置，如果是自己实现监控中心，则需要)

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
        <dubbo:service interface="org.apache.dubbo.monitor.MonitorService" ref="monitorService" registry="N/A" />
     
        <bean id="monitorService" class="org.apache.dubbo.monitor.simple.SimpleMonitorService" />   
    </beans>
    ```
    
3. 直连监控中心服务

    ```xml
    <dubbo:monitor address="dubbo://127.0.0.1:7070/org.apache.dubbo.monitor.MonitorService" />
    ```
    
    或：
    
    ```xml
    <dubbo:monitor address="127.0.0.1:7070" />
    ```
    
    或者在 dubbo.properties 中配置:
    
    ```properties
    dubbo.monitor.address=127.0.0.1:7070
    ```