---
type: docs
title: "Registration Information Simplified"
linkTitle: "Registration Information Simplified"
weight: 3
description: "Learn about dubbo3 to reduce the registration data of services on the registry"
---

## Feature description

There are nearly [30 configuration items](/zh-cn/docs/references/xml/dubbo-parameter) in the service configuration items in Dubbo provider. Excluding the need for registry service governance, a large part of configuration items are used by the provider itself and do not need to be transparently passed to consumers. This part of data does not need to enter the registry, but only needs to be stored persistently in the form of key-value.

The configuration items in Dubbo consumer also have [20+ configuration items](/zh-cn/docs/references/xml/dubbo-consumer). In the registration center, only a small amount of configuration such as application, version, group, ip, and dubbo version need to be concerned in the service consumer list, and other configurations can also be stored persistently in the form of key-value.
These data are registered into the registration center in the dimension of service, which leads to the expansion of the data volume, which in turn leads to an increase in the network overhead of the registration center (such as zookeeper) and a decrease in performance.

#### Design goals and objectives
It is desirable to simplify the number of provider and consumer configurations that go into the registry.
It is expected that some configuration items will be stored in other forms. These configuration items need to be satisfied: not on the service call link, and these configuration items are not on the core link of the registration center (service query, service list).

#### Configuration

Simplify the configuration of the registry, only supported in versions after 2.7.
After enabling provider or consumer to simplify the configuration, the default reserved configuration items are as follows:

provider:

| Constant Key | Key | remark |
| ------ |---------------| ------ |
| APPLICATION_KEY | application | |
| CODEC_KEY | codec | |
| EXCHANGER_KEY | exchanger | |
| SERIALIZATION_KEY | serialization | |
| CLUSTER_KEY | cluster | |
| CONNECTIONS_KEY | connections | |
| DEPRECATED_KEY | deprecated | |
| GROUP_KEY | group | |
| LOADBALANCE_KEY | loadbalance | |
| MOCK_KEY | mock | |
| PATH_KEY | path | |
| TIMEOUT_KEY | timeout | |
| TOKEN_KEY | token | |
| VERSION_KEY | version | |
| WARMUP_KEY | warmup | |
| WEIGHT_KEY | weight | |
| DUBBO_VERSION_KEY | dubbo | |
| RELEASE_KEY | release | |
| SIDE_KEY | side | |


consumer:

| Constant Key | Key | remark |
| ------ | ------ | ------ |
| APPLICATION_KEY | application | |
| VERSION_KEY | version | |
| GROUP_KEY | group | |
| DUBBO_VERSION_KEY | dubbo | |

Constant Key represents a field from the class org.apache.dubbo.common.Constants.

The following introduces several commonly used methods. All samples, you can view [sample-2.7](https://github.com/dubbo/dubbo-samples/tree/master)

## scenes to be used

A large amount of data leads to an increase in the network overhead of the registration center and a decrease in performance.

## How to use

**EXISTING FUNCTIONALITY sample** A simple demonstration of the current state of affairs. Through this demonstration, analyze why simplified configuration is needed.

Refer to the sample subproject: dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-nosimple (before running the sample, first run ZKClean to clean up the configuration items)

##### dubbo-provider.xml configuration:

```
<dubbo:application name="simplified-registry-nosimple-provider"/>
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
<bean id="demoService" class="org.apache.dubbo.samples.simplified.registry.nosimple.impl.DemoServiceImpl"/>
<dubbo:service async="true" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService"
               version="1.2.3" group="dubbo-simple" ref="demoService"
               executes="4500" retries="7" owner="vict" timeout="5300"/>
```

After starting the provider's main method, view the content of the zookeeper leaf node (path: /dubbo/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService/providers directory) as follows:

```
dubbo%3A%2F%2F30.5.124.158%3A20880%2Forg.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
%3Fanyhost%3Dtrue%26application%3Dsimplified-registry-xml-provider%26async%3Dtrue%26dubbo%3D
2.0.2%26executes%3D4500%26generic%3Dfalse%26group%3Ddubbo-simple%26interface%3D
org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService%26methods%3D
sayHello%26owner%3Dvict%26pid%3D2767%26retries%3D7%26revision%3D1.2.3%26side%3D
provider%26timeout%3D5300%26timestamp%3D1542361152795%26valid%3Dtrue%26version%3D1.2.3
```

You can see that there are: `executes`, `retries`, `owner`, `timeout`. But not all these fields need to be passed to dubbo ops or dubbo consumer. Similarly, the consumer also has this problem, which can be viewed by starting the main method of the consumer in the example.



### Method 1. Configure dubbo.properties

The sample is under the dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-xml project (before running the sample, first run ZKClean to clean up the configuration items)

##### dubbo.properties

```properties
dubbo.registry.simplified=true
dubbo.registry.extra-keys=retries,owner
```
Compared with the **existing function sample** above, in the above sample, the four configuration items of executes, retries, owner, and timeout have all entered the registration center. But this example is not, the configuration is divided into:

* Configuration: dubbo.registry.simplified=true, by default, timeout is in the default configuration item list, so it will still enter the registry;
* Configuration: dubbo.registry.extra-keys=retries,owner, so retries, owner will also enter the registry.

configuration type:
- provider side configuration
- consumer side configuration

#### Provider side configuration:

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <!-- optional -->
    <dubbo:application name="simplified-registry-xml-provider"/>
    <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
    <bean id="demoService" class="org.apache.dubbo.samples.simplified.registry.nosimple.impl.DemoServiceImpl"/>
    <dubbo:service async="true" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService" version="1.2.3" group="dubbo-simple"
                   ref="demoService" executes="4500" retries="7" owner="vict" timeout="5300"/>

</beans>
```
Get the value of the leaf node of zookeeper:
```
dubbo%3A%2F%2F30.5.124.149%3A20880%2Forg.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService%3F
application%3Dsimplified-registry-xml-provider%26dubbo%3D2.0.2%26group%3Ddubbo-simple%26owner%3D
vict%26retries%3D7%26timeout%3D5300%26timestamp%3D1542594503305%26version%3D1.2.3
```

#### consumer side configuration
* Configuration: dubbo.registry.simplified=true
* Default: application, version, group, and dubbo are in the default configuration item list, so they will still enter the registration center.
```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

    <!-- optional -->
    <dubbo:application name="simplified-registry-xml-consumer"/>

    <dubbo:registry address="zookeeper://127.0.0.1:2181" username="xxx" password="yyy" check="true"/>

    <dubbo:reference id="demoService" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService"
                     owner="vvv" retries="4" actives="6" timeout="4500" version="1.2.3" group="dubbo-simple"/>

</beans>
```
Get the value of the leaf node of zookeeper:
```
consumer%3A%2F%2F30.5.124.149%2Forg.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService%3F
actives%3D6%26application%3Dsimplified-registry-xml-consumer%26category%3D
consumers%26check%3Dfalse%26dubbo%3D2.0.2%26group%3Ddubbo-simple%26owner%3Dvvv%26version%3D1.2.3
```

### Method 2. Configuration declaration spring bean

The sample is under the dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-annotation project (before running the sample, first run ZKClean to clean up the configuration items)

The effect of dubbo.properties in the above sample is the same.

* Default: timeout is in the default configuration item list, so it will still enter the registration center;
* Configuration: retries, owner enter the registry as an additional key, so retries, owner will also enter the registry.

configuration type:

-Provider configuration
-Consumer configuration

#### Provider configuration

##### private side bean configuration:
```java
// Equivalent to dubbo.properties configuration, configured in the form of @Bean
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    registryConfig.setExtraKeys("retries,owner");
    return registryConfig;
}
```

```java
// expose the service
@Service(version = "1.1.8", group = "d-test", executes = 4500, retries = 7, owner = "victanno", timeout = 5300)
public class AnnotationServiceImpl implements AnnotationService {
    @Override
    public String sayHello(String name) {
        System.out.println("async provider received: " + name);
        return "annotation: hello, " + name;
    }
}
```
#### Consumer configuration

It is the same as **consumer side configuration** in the sample above.

Default: application, version, group, and dubbo are in the default configuration item list, so they will still enter the registration center.

##### consumer side bean configuration:
```java
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    return registryConfig;
  }
```

Consumer Services:

```java
@Component("annotationAction")
public class AnnotationAction {

    @Reference(version = "1.1.8", group = "d-test", owner = "vvvanno", retries = 4, actives = 6, timeout = 4500)
    private AnnotationService annotationService;
    public String doSayHello(String name) {
        return annotationService.sayHello(name);
    }
}
```
####  Notice:
If there are both provider and consumer in an application, the configuration needs to be merged into:
```java
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    //Only valid for provider
    registryConfig.setExtraKeys("retries,owner");
    return registryConfig;
}
```

#### hint:

This version also retains a large number of configuration items, and in the next version, all configuration items will be gradually deleted.