---
description: "This article introduces the detailed design and implementation of Dubbo application-level service discovery and interface-level service discovery."
linkTitle: Application Level vs Interface Level
title: Application Level Service Discovery vs Interface Level Service Discovery
type: docs
weight: 6
---

Dubbo3 currently supports interface-level service discovery.

## Application Level Service Discovery

### Design Goals
* Significantly reduce resource consumption during the service discovery process, including enhancing the registration center's capacity and reducing resource usage for consumer address resolution, allowing the Dubbo3 framework to support service governance for larger clusters and achieve unlimited horizontal scaling.
* Adapt to underlying infrastructure service discovery models, such as Kubernetes and Service Mesh.

### Comparison with Interface Level
![interface-arc](/imgs/blog/proposals/discovery/arc.png)

Starting from the most classic working principle diagram of Dubbo, service address discovery has been built into Dubbo since its inception. Providers register addresses with the registration center, and consumers subscribe to real-time updates of these addresses from the registration center. Upon receiving the address list, consumers initiate RPC calls to providers based on specific load balancing strategies.

In this process:
* Each provider registers its accessible address with the registration center using a specific key.
* The registration center aggregates provider instance addresses based on this key.
* Consumers subscribe using the same key to receive the aggregated address list in a timely manner.

![interface-data1](/imgs/blog/proposals/discovery/interface-data1.png)

Here, we conduct a detailed analysis of the internal data structure of interface-level address discovery.

First, let's look at the data and behavior within the provider instance at the bottom right. Typically, a provider-deployed application will have multiple services (the services defined in Dubbo2), each potentially having its unique configurations. The process we discuss regarding service publication is essentially the address URL generation process based on this service configuration, as shown in the generated address data; likewise, other services will also generate addresses.

Next, let's examine the address data storage structure of the registration center. The registration center divides the data based on the service name, aggregating all address data of a service as sub-nodes, where the content of the sub-nodes represents the actual accessible IP addresses, i.e., the URLs in Dubbo.

![interface-data2](/imgs/blog/proposals/discovery/interface-data2.png)

Here, the URL address data is divided into several parts:
* First is the instance accessible address, with key information including IP and port, which the consumer will use to establish TCP network links for subsequent RPC data transmission.
* Next is the RPC metadata, defining and describing an RPC request; it indicates that this address data is related to a specific RPC service, including its version number, group, and method-related information.
* The next part is RPC configuration data, with some configurations controlling the behavior of RPC calls and others synchronizing the status of provider process instances, such as timeout duration and serialization method for data encoding.
* The last part is custom metadata, unlike the predefined configurations, offering users greater flexibility to expand and add custom metadata to further enrich instance status.

Combining the above two pages of analysis on the Dubbo2 interface-level address model and the fundamental principle diagram of Dubbo, we can deduce the following conclusions:
* First, the key for address discovery aggregation is the RPC-granular service.
* Second, the data synchronized by the registration center includes not just addresses but also various metadata and configurations.
* Thanks to points 1 and 2, Dubbo has achieved service governance capabilities that support applications, RPC services, and method granularity.

This is the true reason why Dubbo2 has always excelled over many service frameworks in terms of usability, service governance functionality, and scalability.

![interface-defect](/imgs/blog/proposals/discovery/interface-defect.png)

Every system has its duality. While Dubbo2's address model brings ease of use and powerful features, it also imposes certain limitations on the horizontal scalability of the entire architecture. This issue remains unnoticed in standard-scale microservice clusters, but as the cluster scales, components within the cluster begin to encounter capacity bottlenecks when applications and machines reach a certain number. After summarizing the characteristics of several typical users in production environments, including Alibaba and Industrial and Commercial Bank, we outline the following prominent issues (highlighted in red in the diagram):
* First, the capacity of the registration center cluster reaches its upper limit. As all URL address data is sent to the registration center, the storage capacity reaches its limit, leading to a decrease in push efficiency.
* On the consumer side, the memory usage of the Dubbo2 framework exceeds 40%, with each address push causing high resource consumption such as CPU, affecting normal business calls.

Why does this issue arise? We will elaborate with a specific provider example to illustrate why applications under the interface-level address model are prone to capacity issues. In the cyan section, suppose there is an ordinary Dubbo provider application with 10 RPC services defined, deployed on 100 machine instances. The data generated by this application in the cluster will be "service count * machine instance count," which translates to 10 * 100 = 1000 entries. The data is amplified from two dimensions:
* From the address perspective, the 100 unique instance addresses are amplified by 10 times.
* From the service perspective, the 10 unique service metadata entries are amplified by 100 times.

### Detailed Design

![app-principle](/imgs/blog/proposals/discovery/app-principle.png)

Faced with this problem, we must rethink two questions under the Dubbo3 architecture:
* How can we reorganize URL address data while retaining usability and functionality, avoiding redundant data, to enable Dubbo3 to support larger-scale cluster horizontal scaling?
* How can we connect address discovery at this level with other microservice systems like Kubernetes and Spring Cloud?

![app-data1](/imgs/blog/proposals/discovery/app-data1.png)

The design of Dubbo3's application-level service discovery solution fundamentally revolves around the above two questions. Its basic approach is to adjust the aggregation element along the address discovery chain from service to application, hence its name as application-level service discovery; additionally, the data content synchronized by the registration center has been significantly streamlined, retaining only the core IP and port address data.

![app-data2](/imgs/blog/proposals/discovery/app-data2.png)

This is a detailed analysis of the internal data structure after upgrading to application-level address discovery. Compared to the previous interface-level discovery model, we mainly focus on the changes in the orange section. First, on the provider instance side, instead of registering an address data entry for each RPC service, a provider instance registers only one address with the registration center; on the registration center side, addresses are aggregated by application name, with the application name node containing the streamlined provider instance addresses.

![app-metadataservice](/imgs/blog/proposals/discovery/app-metadataservice.png)

The above adjustments to application-level service discovery not only achieve a decrease in the size and total number of address data entries but also introduce new challenges: the loss of the foundational usability and functionality emphasized in Dubbo2 because the transmission of metadata has been simplified. How to control the behaviors of individual services finely becomes unachievable.

To address this issue, Dubbo3 introduces a built-in MetadataService, transforming centralized push into a peer-to-peer pull from consumer to provider. In this model, the volume of metadata transmission data will no longer be a problem, so more parameters can be expanded, and more governance data can be exposed.

![app-metadataservice](/imgs/blog/proposals/discovery/app-workflow.png)

Here, we focus on the address subscription behavior of the consumer, where the consumer reads address data in two steps: first, it receives the streamlined address from the registration center, and then it invokes the MetadataService to read the downstream metadata information. Once these two parts of data are received, the consumer completes the address data aggregation and ultimately restores a URL address format similar to Dubbo2 in runtime. Therefore, in ultimate terms, the application-level address model balances performance at the address transmission layer with functionality at the runtime layer.

This concludes the background and working principle discussion of application-level service discovery.


## Interface Level Service Discovery

Interface-level service discovery continues to be supported in the implementation of Dubbo3 and remains the framework's default service discovery model, mainly for compatibility with older versions. In future versions, we will switch the default model to application-level service discovery.

{{% alert title="Resolving Performance Issues in Interface-Level Service Discovery" color="info" %}}
If your cluster is sufficiently large and has encountered performance bottlenecks in interface-level service discovery, and you are temporarily unable to switch to application-level service discovery, you can achieve performance optimization by simplifying URL parameters.
{{% /alert %}}

### URL Parameter Simplification
**Design Goals and Objectives:**
1. Simplify the number of provider and consumer configurations entering the registration center.
2. Store certain configuration items in other forms. These configuration items need to satisfy: they do not exist on the service call path, and they do not belong to the core link of the registration center (service query, service list).

Service configuration items in the Dubbo provider have nearly [30 configuration items](/en/docs/references/xml/dubbo-parameter). Excluding the needs for registration center service governance, a substantial number of configuration items are used internally by the provider and do not need to be passed to consumers. This data does not need to enter the registration center but can be persistently stored in key-value format.

Similarly, there are [20+ configuration items](/en/docs/references/xml/dubbo-consumer) in the Dubbo consumer. Within the registration center, the consumer list only needs to focus on a small number of configurations such as application, version, group, IP, and Dubbo version, while other configurations can also be persisted in key-value format. Registering this data on a service basis leads to data volume inflation, resulting in increased network overhead and reduced performance for the registration center (e.g., Zookeeper).

{{% alert title="Note" color="warning" %}}
Simplifying registration center configurations is only supported in versions after 2.7.
{{% /alert %}}

The following are the default configuration items retained in the URL after enabling provider or consumer simplified configuration:

**Provider Side:**

| Static Variable | URL Key           | Description |
| ------ |---------------| ------ |
| APPLICATION_KEY | application   |  |
| CODEC_KEY | codec         |  |
| EXCHANGER_KEY | exchanger     |   |
| SERIALIZATION_KEY | serialization |   |
| CLUSTER_KEY | cluster       |  |
| CONNECTIONS_KEY | connections   |   |
| DEPRECATED_KEY | deprecated    |  |
| GROUP_KEY | group         |   |
| LOADBALANCE_KEY | loadbalance   |  |
| MOCK_KEY | mock          |  |
| PATH_KEY | path          |  |
| TIMEOUT_KEY | timeout       |  |
| TOKEN_KEY | token         |  |
| VERSION_KEY | version       |  |
| WARMUP_KEY | warmup        |  |
| WEIGHT_KEY | weight        |  |
| DUBBO_VERSION_KEY | dubbo         |  |
| RELEASE_KEY | release       |  |
| SIDE_KEY | side          |  |

**Consumer Side:**

| Static Variable | URL Key  | Description |
| ------ | ------ | ------ |
| APPLICATION_KEY | application |  |
| VERSION_KEY |  version |  |
| GROUP_KEY | group |  |
| DUBBO_VERSION_KEY | dubbo |  |

Let's proceed with an example of how to enable URL simplification, with all content available for [source code in the sample](https://github.com/dubbo/dubbo-samples/tree/master).

#### How to Enable URL Simplification (Example Usage)

We will start with an example that has not enabled URL simplification and compare it with a provider that has enabled URL simplification and a consumer that has enabled URL simplification.

##### Example Without URL Simplification

Project source code [dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-nosimple](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-nosimple). Note to run ZKClean for configuration cleanup before running the sample.

dubbo-provider.xml

```
<dubbo:application name="simplified-registry-nosimple-provider"/>
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
<bean id="demoService" class="org.apache.dubbo.samples.simplified.registry.nosimple.impl.DemoServiceImpl"/>
<dubbo:service async="true" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService"
               version="1.2.3" group="dubbo-simple" ref="demoService"
               executes="4500" retries="7" owner="vict" timeout="5300"/>
```

After starting the provider's main method, check the leaf nodes in Zookeeper (path: /dubbo/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService/providers directory):

```
dubbo://30.5.124.158:20880/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
?anyhost=true
&application=simplified-registry-xml-provider
&async=true
&dubbo=2.0.2
&executes=4500
&generic=false
&group=dubbo-simple
&interface=org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
&methods=sayHello
&owner=vict
&pid=2767
&retries=7
&revision=1.2.3
&side=provider
&timeout=5300
&timestamp=1542361152795
&valid=true
&version=1.2.3
```

From this, we can see fields such as: `executes`, `retries`, `owner`, `timeout`. However, not all of these fields need to be passed to Dubbo ops or Dubbo consumers. Similarly, the consumer has this issue, which can be observed by starting the consumer's main method in the example.

##### Example with URL Simplification Enabled (XML Mode)

Project source code [dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-xml](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-xml). Make sure to clean up configurations with ZKClean before running the sample.

```properties
dubbo.registry.simplified=true
dubbo.registry.extra-keys=retries,owner
```
In comparison to the previous **existing functionality sample**, the above sample includes four configuration items: executes, retries, owner, and timeout all entering the registration center. However, in this instance, the configuration situation is as follows:

* Configuration: dubbo.registry.simplified=true; by default, timeout is in the default configuration item list, thus will still enter the registration center.
* Configuration: dubbo.registry.extra-keys=retries,owner; hence retries and owner will also enter the registration center.

**1. Provider Side**

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
The value of the leaf node in Zookeeper obtained is:
```
dubbo://30.5.124.149:20880/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
?application=simplified-registry-xml-provider
&dubbo=2.0.2
&group=dubbo-simple
&owner=vict
&retries=7
&timeout=5300
&timestamp=1542594503305
&version=1.2.3
```

**2. Consumer Side**

* Configuration: dubbo.registry.simplified=true.
* By default: application, version, group, dubbo are in the default configuration item list; thus will still enter the registration center.
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
The value of the leaf node in Zookeeper obtained is:
```
consumer://30.5.124.149/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
?actives=6
&application=simplified-registry-xml-consumer
&category=consumers
&check=false
&dubbo=2.0.2
&group=dubbo-simple
&owner=vvv
&version=1.2.3
```

##### Example with URL Simplification Enabled (API Mode)

Project source code [dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-annotation](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-annotation). Make sure to clean up configurations with ZKClean before running the sample.

The effects are consistent with the dubbo.properties in the previous sample.

* By default: timeout is in the default configuration item list, and thus will still enter the registration center.
* Configuration: retries, owner are treated as extra keys entering the registration center. So retries and owner will also enter the registration center.


**1. Provider Side Bean Configuration**

```java
// Equivalent to the dubbo.properties configuration, configured in @Bean style
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
// Expose Service
@Service(version = "1.1.8", group = "d-test", executes = 4500, retries = 7, owner = "victanno", timeout = 5300)
public class AnnotationServiceImpl implements AnnotationService {
    @Override
    public String sayHello(String name) {
        System.out.println("async provider received: " + name);
        return "annotation: hello, " + name;
    }
}
```

**2. Consumer Configuration**

The consumer side configuration is the same as above.

By default: application, version, group, dubbo are in the default configuration item list, and thus will still enter the registration center.

#### Consumer Side Bean Configuration
```java
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    return registryConfig;
}
```

Service Consumption

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

> Note: If an application contains both a provider and a consumer, the configuration needs to be combined as follows:

```java
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    // Only effective for provider
    registryConfig.setExtraKeys("retries,owner");
    return registryConfig;
}
```

### Customizing URL Parameters

The above methods have reduced the control of URL parameters to two. 

The first method is using `dubbo.properties`:

```properties
dubbo.registry.simplified=true
dubbo.registry.extra-keys=retries,owner
```

The second method is through `RegistryConfig` settings:

```java
registryConfig.setSimplified(true);
registryConfig.setExtraKeys("retries,owner");
```

There is also a third method, which is to extend `org.apache.dubbo.registry.integration.ServiceURLCustomizer` SPI, allowing for very flexible addition or removal of parameters in the URL:

```java
@SPI(scope = APPLICATION)
public interface ServiceURLCustomizer extends Prioritized {
    /**
     * Customizes {@link URL the service url}
     *
     * @param serviceURL {@link URL the service url}
     * @return new service url
     */
    URL customize(URL serviceURL, ApplicationModel applicationModel);
}
```
