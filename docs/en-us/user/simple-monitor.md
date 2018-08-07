> ![warning](sources/images/check.gif)Monitor service is a standard Dubbo service，can be exported to the registry，also can be connected straightly。

> ![warning](sources/images/check.gif)[Install the simple registry](admin-guide-install-manual#Install the simple registry)

0. export a simple monitor service to the registry: (If you use the installer, you don't need to write this configuration yourself. if you implement the monitor service yourself，need it)

      ```xml
      <beans xmlns="http://www.springframework.org/schema/beans"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
      xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
       
      <!-- configuration of current application -->
      <dubbo:application name="simple-monitor" />
       
      <!-- connection address of the registry -->
      <dubbo:registry address="127.0.0.1:9090" />
       
      <!-- protool configuration of exposed services -->
      <dubbo:protocol port="7070" />
       
      <!-- configuration of certain exposed service -->
      <dubbo:service interface="com.alibaba.dubbo.monitor.MonitorService" ref="monitorService" />
       
      <bean id="monitorService" class="com.alibaba.dubbo.monitor.simple.SimpleMonitorService" />
      </beans>
      ```

1. Discovery the monitor service int the registry:

    ```xml
    <dubbo:monitor protocol="registry" />
    ```

    or

    > dubbo.properties

    ```xml
    dubbo.monitor.protocol=registry
    ```

2. Export a simple monitor service ，but don't register it to th registry: (If you use the installer, you don't need to write this configuration yourself. if you implement the monitor service yourself，need it)

    ```xml   
    <beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
     
    <!-- configuration of current application -->
    <dubbo:application name="simple-monitor" />
     
    <!-- protool configuration of exposed service -->
    <dubbo:protocol port="7070" />
     
    <!-- configuration of exposed service -->
    <dubbo:service interface="com.alibaba.dubbo.monitor.MonitorService" ref="monitorService" registry="N/A" />
     
    <bean id="monitorService" class="com.alibaba.dubbo.monitor.simple.SimpleMonitorService" />   
    </beans>
    ```

3. connected to the monitor service straightly

    ```xml
    <dubbo:monitor address="dubbo://127.0.0.1:7070/com.alibaba.dubbo.monitor.MonitorService" />
    ```

    or：

    ```sh
    <dubbo:monitor address="127.0.0.1:7070" />
    ```

    or：

    **dubbo.properties**

    ```sh
    dubbo.monitor.address=127.0.0.1:7070
    ```


