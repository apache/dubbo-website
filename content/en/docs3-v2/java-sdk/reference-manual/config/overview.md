---
type: docs
title: "Configuration Overview"
linkTitle: "Configuration Overview"
weight: 1
description: "A general overview of the overall design and working principle of Dubbo configuration, including configuration components, configuration sources, configuration methods, and configuration loading processes."
---
Quickly jump to the content you care about through the following links:
* [Use Spring Boot to quickly develop Dubbo applications](../../../quick-start/spring-boot/)
* [Configuration item reference manual to know what configuration items are available](../properties)
* [How configuration loading and overriding works](../principle)

## Configuration components

In order to better manage various configurations, Dubbo abstracts a set of structured configuration components. Each component is generally divided by purpose and controls the behavior of different scopes.

![dubbo-config](/imgs/user/dubbo-config.jpg)

Component Name | Description | Scope | Required
------ | ------ | ------ | ------
application | Specify the application-level information such as the application name | Only one application is allowed in an application | Required
service | Declare a common interface or implementation class as a Dubbo service | There can be 0 or more services in an application | At least one service/reference
reference | Declare a common interface as a Dubbo service | There can be 0 or more references in an application | At least one service/reference
protocol | The RPC protocol to be exposed and related configurations such as port numbers, etc. | One application can be configured with multiple, one protocol can be used for a set of service&reference | optional, default dubbo
registry | Registry type, address and related configuration | Multiple configurations can be made in one application, and one registry can be applied to a group of service&references | Mandatory
config-center | configuration center type, address and related configurations | multiple configurations in one application, shared by all services | optional
metadata-report | metadata center type, address and related configuration | multiple configurations in one application, shared by all services | optional
Consumer | The default configuration shared between references | Multiple configurations can be configured in one application, and one consumer can act on a group of references | Optional
Provider | The default configuration shared between services | Multiple configurations can be configured in one application, and one provider can be used for a group of services | Optional
monitor | monitoring system type and address | only one can be configured in an application | optional
metrics | related configuration of the data acquisition module | only one configuration is allowed in an application | optional
ssl | ssl/tls security link-related certificate configuration | Only one configuration is allowed in an application | optional
method | specifies method-level configuration | subconfigurations for service and reference | optional
argument | parameter configuration of a method | subconfiguration of method | optional


> 1. From the perspective of implementation principle, all configuration items of Dubbo will be assembled into the URL in the end, and the URL will be used as the carrier to pass during subsequent startup and RPC calls, thereby controlling the behavior of the framework. For more information, please refer to the Dubbo source code analysis series of documents or [Blog](/zh-cn/blog/2019/10/17/dubbo-in-url-unified model/#rpc call).
> 2. For the specific configuration items supported by each component and their meanings, please refer to [Configuration Item Manual](../properties)

### service and reference
`service` and `reference` are the two most basic configuration items of Dubbo, they are used to register a specified interface or implementation class as a Dubbo service, and control the behavior of the service through configuration items.
* `service` is used on the service provider side, the interface and implementation class configured by `service` will be defined as a standard Dubbo service, so as to provide external RPC request services.
* `reference` is used for service consumers, the interface configured by `reference` will be defined as a standard Dubbo service, and the generated proxy can initiate an RPC request to the remote end.

Any number of `service` and `reference` can be configured in an application.

### consumer and provider
* When there are multiple `reference` configurations in the application, `consumer` specifies the default values shared by these `reference`s, such as shared timeouts, etc. to simplify cumbersome configurations, such as setting configurations separately in a `reference` Item value, the configuration in this `reference` takes precedence.
* When there are multiple `service` configurations in the application, `provider` specifies the default value shared by these `service`, if a configuration item value is set separately in a `service`, the configuration priority in the `service` higher.

> The consumer component can also carry out virtual grouping of references, and references under different groups can have different consumer default value settings; for example, in XML format configuration, the <dubbo:reference /> tag can be nested in <dubbo:consumer / > Implement grouping within tags. The same effect can also be achieved between provider and service.

## configuration method

According to the driving mode, it can be divided into the following five modes:

### API configuration
The configuration is organized in the form of Java coding, including Raw API and Bootstrap API. For details, please refer to [API configuration](../api).

```java
public static void main(String[] args) throws IOException {
        ServiceConfig<GreetingsService> service = new ServiceConfig<>();
        service.setApplication(new ApplicationConfig("first-dubbo-provider"));
        service.setRegistry(new RegistryConfig("multicast://224.5.6.7:1234"));
        service.setInterface(GreetingsService.class);
        service.setRef(new GreetingsServiceImpl());
        service. export();
        System.out.println("first-dubbo-provider is running.");
        System.in.read();
}
```

### XML configuration
Configure various components in XML and support seamless integration with Spring. For details, please refer to [XML Configuration](../xml).

```xml
  <!-- dubbo-provier.xml -->

  <dubbo:application name="demo-provider"/>
  <dubbo:config-center address="zookeeper://127.0.0.1:2181"/>

  <dubbo:registry address="zookeeper://127.0.0.1:2181" simplified="true"/>
  <dubbo:metadata-report address="redis://127.0.0.1:6379"/>
  <dubbo:protocol name="dubbo" port="20880"/>

  <bean id="demoService" class="org.apache.dubbo.samples.basic.impl.DemoServiceImpl"/>
  <dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService" ref="demoService"/>
```

### Annotation configuration
Expose services and reference service interfaces in the form of annotations, and support seamless integration with Spring. For details, please refer to [Annotation Configuration](../annotation).

```java
  // AnnotationService service implementation

  @DubboService
  public class AnnotationServiceImpl implements AnnotationService {
      @Override
      public String sayHello(String name) {
          System.out.println("async provider received: " + name);
          return "annotation: hello, " + name;
      }
  }
```

```properties
## dubbo.properties

dubbo.application.name=annotation-provider
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.protocol.name=dubbo
dubbo.protocol.port=20880
```

### Spring Boot
Use Spring Boot to reduce unnecessary configuration, and combine Annotation and application.properties/application.yml to develop Dubbo applications. For details, please refer to [Annotation Configuration](../annotation).

```properties
## application.properties

# Spring boot application
spring.application.name=dubbo-externalized-configuration-provider-sample

# Base packages to scan Dubbo Component: @com.alibaba.dubbo.config.annotation.Service
dubbo.scan.base-packages=com.alibaba.boot.dubbo.demo.provider.service

# Dubbo Application
## The default value of dubbo.application.name is ${spring.application.name}
## dubbo.application.name=${spring.application.name}

#Dubbo Protocol
dubbo.protocol.name=dubbo
dubbo.protocol.port=12345

## Dubbo Registry
dubbo.registry.address=N/A

## DemoService version
demo.service.version=1.0.0
```

### Property configuration
Generate configuration components according to the attribute Key-value, similar to SpringBoot's ConfigurationProperties, please refer to [property configuration](../properties) for details.

Another important feature of property configuration is [property override](../principle/#32-property override), which overrides the created configuration component property with the value of an external property.

If you want to put the attribute configuration in an external configuration center, please refer to [Externalized Configuration](../principle/#33-Externalized Configuration).

In addition to the differences in peripheral drive methods, Dubbo's configuration reading generally follows the following principles:

1. Dubbo supports multi-level configuration, and automatically realizes the coverage between configurations according to the predetermined priority. Finally, all configurations are summarized into the data bus URL to drive subsequent service exposure, reference and other processes.
2. The configuration format is mainly Properties, and the configuration content follows the agreed `path-based`[naming convention](../principle/#1-configuration format)


## Configure the loading process

### Configuration specifications and sources

Dubbo follows a [path-based configuration specification](../principle/), and each configuration component can be expressed in this way. In terms of configuration sources, a total of 6 configuration sources are supported, that is, Dubbo will try to load configuration data from the following locations:

- JVM System Properties, JVM -D parameter
- System environment, the environment variable of the JVM process
- Externalized Configuration, [externalized configuration] (../principle/#33-externalized configuration), read from the configuration center
- Application Configuration, application attribute configuration, extract the attribute set starting with "dubbo" from the Spring application Environment
- The configuration collected by programming interfaces such as API/XML/annotation can be understood as a kind of configuration source, which is a configuration collection method directly oriented to user programming
- Read configuration file dubbo.properties from classpath