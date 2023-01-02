---
type: docs
title: "Multiple Registries"
linkTitle: "Multiple Registration Centers"
weight: 10
description: "Register the same service to multiple registries in Dubbo"
---
## Feature description
Dubbo supports the simultaneous registration of the same service to multiple registries, or the registration of different services to different registries, or even references to services with the same name registered on different registries at the same time. In addition, the registry is [^1] that supports custom extensions.
## scenes to be used

## How to use
### Multi-registry registration

For example: Some services of the Chinese website are too late to be deployed in Qingdao, and are only deployed in Hangzhou, while other applications in Qingdao need to reference this service, so the service can be registered to two registration centers at the same time.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema /dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <dubbo:application name="world" />
    <!-- Multi-registry configuration -->
    <dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" />
    <dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" default="false" />
    <!-- Register with multiple registries -->
    <dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="hangzhouRegistry,qingdaoRegistry" />
</beans>
```

### Different services use different registries

For example: some CRM services are specially designed for international websites, and some services are specially designed for Chinese websites.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema /dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <dubbo:application name="world" />
    <!-- Multi-registry configuration -->
    <dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
    <dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
    <!-- Register with the Chinese Station Registration Center -->
    <dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="chinaRegistry" />
    <!-- Register with the International Station Registration Center -->
    <dubbo:service interface="com.alibaba.hello.api.DemoService" version="1.0.0" ref="demoService" registry="intlRegistry" />
</beans>
```

### Multiple Registry References

For example: CRM needs to call the PC2 service of the Chinese station and the international station at the same time. PC2 is deployed in both the Chinese station and the international station. The interface and version number are the same, but the connected databases are different.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema /dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <dubbo:application name="world" />
    <!-- Multi-registry configuration -->
    <dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
    <dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
    <!-- Quote Chinese station service -->
    <dubbo:reference id="chinaHelloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" registry="chinaRegistry" />
    <!-- Reference international station service -->
    <dubbo:reference id="intlHelloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" registry="intlRegistry" />
</beans>
```

If only the test environment temporarily needs to connect to two different registration centers, use vertical symbols to separate multiple different registration center addresses:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema /dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <dubbo:application name="world" />
    <!-- Multi-registry configuration, separated by a vertical sign means connecting to multiple different registries at the same time, and multiple cluster addresses of the same registrant are separated by commas -->
    <dubbo:registry address="10.20.141.150:9090|10.20.154.177:9010" />
    <!-- Reference service -->
    <dubbo:reference id="helloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" />
</beans>
```

[^1]: You can extend the registry by yourself, see: [Registry Extension](../../../reference-manual/spi/description/registry)