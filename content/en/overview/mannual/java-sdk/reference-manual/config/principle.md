---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config/principle/
    - /en/docs3-v2/java-sdk/reference-manual/config/principle/
description: An in-depth interpretation of Dubbo's configuration methods and working principles, including configuration formats, design ideas, sources, loading processes, etc.
linkTitle: Configuration Loading Process
title: Configuration Working Principle
type: docs
weight: 5
---

This article mainly explains the APIs and working principles related to Dubbo configuration, learning about Dubbo's multiple configuration sources, the specific configuration methods for each source, and the priority and coverage relationships between different configuration sources.

## Implementation Principles

To better manage various configurations, Dubbo abstracts a structured configuration component set, dividing the components by purpose to control behaviors in different scopes.

![dubbo-config](/imgs/user/dubbo-config.jpg)


Component Name | Description | Scope | Is Configuration Required
------ | ------ | ------ | ------
application | Specifies application name and other application-level related information | Only one allowed per application | Required
service | Declares a normal interface or implementation class as a Dubbo service | Can have 0 to multiple services in an application | At least one service/reference
reference | Declares a normal interface as a Dubbo service | Can have 0 to multiple references in an application | At least one service/reference
protocol | RPC protocol to be exposed and related configurations like port number | Multiple allowed in an application, a protocol can apply to a group of services & references | Optional, default is dubbo
registry | Registry type, address, and related configurations | Multiple allowed in an application, a registry can apply to a group of services & references| Required
config-center | Configuration center type, address, and related configurations | Multiple allowed in an application, shared by all services | Optional
metadata-report | Metadata center type, address, and related configurations | Multiple allowed in an application, shared by all services | Optional
consumer | Default configuration shared between references | Multiple allowed in an application, a consumer can apply to a group of references | Optional
provider | Default configuration shared between services | Multiple allowed in an application, a provider can apply to a group of services | Optional
monitor | Monitoring system type and address | Only one allowed in an application | Optional
metrics | Configuration related to data collection module | Only one allowed in an application | Optional
ssl | Configuration related to ssl/tls secure links, etc. | Only one allowed in an application | Optional
method | Method-level configuration | Sub-configuration of service and reference | Optional
argument | Argument configuration for a method | Sub-configuration of method | Optional


> From the perspective of implementation principles, all configuration items in Dubbo will ultimately be assembled into URLs, using URLs as carriers during subsequent startup and RPC calls to control framework behaviors.

> For specific configuration items supported by each component and their meanings, please refer to [configuration item manual](../properties).


{{% alert title="Note" color="info" %}}
**Background**

In each Dubbo application, certain types of configuration class instances can only appear once (such as `ApplicationConfig`, `MonitorConfig`, `MetricsConfig`, `SslConfig`, `ModuleConfig`), while some can appear multiple times (e.g., `RegistryConfig`, `ProtocolConfig`, etc.).

When the application unexpectedly scans multiple unique configuration class instances (like mistakenly configuring two `ApplicationConfig` in one Dubbo application), what strategy should be used to handle this situation? Should it throw an exception directly? Should it retain the former and ignore the latter? Should it ignore the former and keep the latter? Or should it allow some form of coexistence (for example, the latter's attributes overriding those of the former)?

Currently, in Dubbo, the unique configuration class types and allowed configuration patterns/strategies for finding multiple instances of a unique configuration type are as follows.

**Unique Configuration Class Types**

`ApplicationConfig`, `MonitorConfig`, `MetricsConfig`, `SslConfig`, `ModuleConfig`.

The first four belong to application-level, while the last one belongs to module-level.

**Configuration Patterns**

- `strict`: Strict mode. Throws an exception directly.
- `override`: Override mode. Ignores the former and keeps the latter.
- `ignore`: Ignore mode. Ignores the latter and keeps the former.
- `override_all`: Attribute override mode. Regardless of whether the former's attribute values are empty, the latter's attributes will override/set to the former.
- `override_if_absent`: If absent, attribute override mode. Only if the former corresponding attribute values are empty, will the latter's attributes override/set to the former.

Note: The last two also affect the attribute override of configuration instances. Since Dubbo has multiple configuration methods, there exist multiple configuration sources with priorities. For example, if a `ServiceConfig` is configured through XML with the property `version=1.0.0`, while we also have `dubbo.service.{interface}.version=2.0.0` configured in an external configuration (configuration center), without introducing the `config-mode` configuration item, based on the original configuration source priority, the final instance's `version=2.0.0`. However, once the `config-mode` configuration item is introduced, the priority rules are not that strict anymore; if `config-mode` is set to `override_all`, it will be `version=2.0.0`, and if `config-mode` is `override_if_absent`, it will be `version=1.0.0`, and if `config-mode` has other values, it will follow the original configuration priority for attribute setting/overriding.

**Configuration Methods**

The configuration key is `dubbo.config.mode`, and the value is one of the types described above, with the default strategy value being `strict`. Below are examples of configurations:

```properties
# JVM -D
-Ddubbo.config.mode=strict

# Environment Variable
DUBBO_CONFIG_MODE=strict

# External Configuration (Configuration Center), Spring application Environment, dubbo.properties
dubbo.config.mode=strict
```
{{% /alert %}}

### service and reference
`service` and `reference` are the two most fundamental configuration items in Dubbo, used to register a specified interface or implementation class as a Dubbo service and control the service's behavior through configuration items.
* `service` is used on the service provider side; the interfaces and implementation classes configured by `service` will be defined as standard Dubbo services, thereby providing RPC request services externally.
* `reference` is used on the consumer side; interfaces configured by `reference` will be defined as standard Dubbo services, and the generated proxy can initiate RPC requests to the remote service.

> An application can configure any number of `service` and `reference`.

### consumer and provider
* When there are multiple `reference` configurations in the application, `consumer` specifies the default values shared among these `reference`, such as shared timeout values, to simplify complex configurations. If a configuration item value is set individually in a `reference`, the priority of that configuration will be higher.
* When there are multiple `service` configurations in the application, `provider` specifies the default values shared among these `service`, such that if a configuration item value is set individually in a `service`, the priority of that configuration will be higher.

> The consumer component can also virtual-group references; references in different groups can have different default value settings, such as in XML format configuration, the <dubbo:reference /> tag can be nested within the <dubbo:consumer /> tag to achieve grouping. The same effect can be achieved between provider and service.

## Configuration Methods

### Property Configuration
Generate configuration components based on property Key-value, similar to Spring Boot's ConfigurationProperties; please refer to [Property Configuration](../properties).

Another important feature of property configuration is [Property Overrides](../principle/#32-Property Overrides), which uses values from external properties to override the properties of already created configuration components.

Please refer to [Externalized Configuration](../principle/#33-Externalized Configuration) for placing property configurations in external configuration centers.

Apart from the differences in outer driving methods, Dubbo's configuration reading generally follows these principles:

1. Dubbo supports multi-level configurations and automatically implements the overrides between configurations based on predetermined priorities. Ultimately, all configurations are summarized to the data bus URL to drive subsequent service exposure and reference processes.
2. The configuration format is primarily Properties, following the agreed-upon `path-based` [naming conventions](../principle/#1-Configuration Format).

### API Configuration
> Organizing configurations in Java code, including Raw API and Bootstrap API, please refer to [API Configuration](../api).

```java
public static void main(String[] args) throws IOException {
        ServiceConfig<GreetingsService> service = new ServiceConfig<>();
        service.setApplication(new ApplicationConfig("first-dubbo-provider"));
        service.setRegistry(new RegistryConfig("multicast://224.5.6.7:1234"));
        service.setInterface(GreetingsService.class);
        service.setRef(new GreetingsServiceImpl());
        service.export();
        System.out.println("first-dubbo-provider is running.");
        System.in.read();
}
```

### XML Configuration
> Configuring various components in XML format, supporting seamless integration with Spring; please refer to [XML Configuration](../xml).

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

### Annotation Configuration
> Exposing service and reference service interfaces using annotations, supporting seamless integration with Spring; please refer to [Annotation Configuration](../annotation).

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

### Spring Boot Configuration
> Using Spring Boot to reduce unnecessary configurations, combining Annotation with application.properties/application.yml to develop Dubbo applications; please refer to [Annotation Configuration](../annotation).

```properties
## application.properties

# Spring boot application
spring.application.name=dubbo-externalized-configuration-provider-sample

# Base packages to scan Dubbo Component: @com.alibaba.dubbo.config.annotation.Service
dubbo.scan.base-packages=com.alibaba.boot.dubbo.demo.provider.service

# Dubbo Application
## The default value of dubbo.application.name is ${spring.application.name}
## dubbo.application.name=${spring.application.name}

# Dubbo Protocol
dubbo.protocol.name=dubbo
dubbo.protocol.port=12345

## Dubbo Registry
dubbo.registry.address=N/A

## DemoService version
demo.service.version=1.0.0
```

## Configuration Specifications and Sources

Dubbo adheres to a [path-based configuration specification](../principle/), where each configuration component can be expressed in this manner. In terms of configuration sources, a total of 6 types of configuration sources are supported; that is, Dubbo will try to load configuration data from the following locations:

- JVM System Properties, JVM -D arguments
- System environment, JVM process's environment variables
- Externalized Configuration, [Externalized Configuration](../principle/#33-Externalized Configuration), reading from configuration centers
- Application Configuration, the application's property configuration, extracting attribute sets starting with "dubbo" from the Spring application's Environment
- API / XML / annotation and other programming interfaces that can be understood as a type of configuration source, a method aimed directly at user programming for configuration collection
- Reading configuration files dubbo.properties from the classpath


> [dubbo-spring-boot-samples](https://github.com/apache/dubbo-spring-boot-project/tree/master/dubbo-spring-boot-samples)

```properties
  ## application.properties

  # Spring boot application
  spring.application.name=dubbo-externalized-configuration-provider-sample

  # Base packages to scan Dubbo Component: @com.alibaba.dubbo.config.annotation.Service
  dubbo.scan.base-packages=com.alibaba.boot.dubbo.demo.provider.service

  # Dubbo Application
  ## The default value of dubbo.application.name is ${spring.application.name}
  ## dubbo.application.name=${spring.application.name}

  # Dubbo Protocol
  dubbo.protocol.name=dubbo
  dubbo.protocol.port=12345

  ## Dubbo Registry
  dubbo.registry.address=N/A

  ## service default version
  dubbo.provider.version=1.0.0
```
Next, we'll analyze the working principles of Dubbo configuration from three aspects: configuration format, configuration sources, and loading processes.

## 1 Configuration Format

All configurations currently supported by Dubbo are in `.properties` format, including `-D`, `Externalized Configuration`, etc., with all configuration items in `.properties` following a `path-based` configuration format.

In Spring applications, property configurations can also be placed in `application.yml`, which is more readable with its tree hierarchical structure.

```properties
# Application-level configuration (no id)
dubbo.{config-type}.{config-item}={config-item-value}

# Instance-level configuration (specifying id or name)
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}

# Service interface configuration
dubbo.service.{interface-name}.{config-item}={config-item-value}
dubbo.reference.{interface-name}.{config-item}={config-item-value}

# Method configuration
dubbo.service.{interface-name}.{method-name}.{config-item}={config-item-value}
dubbo.reference.{interface-name}.{method-name}.{config-item}={config-item-value}

# Method argument configuration
dubbo.reference.{interface-name}.{method-name}.{argument-index}.{config-item}={config-item-value}

```

### 1.1 Application-level Configuration (no id)

The format for application-level configuration is: singular prefix for configuration type, without id/name.
```properties
# Application-level configuration (no id)
dubbo.{config-type}.{config-item}={config-item-value}
```

Similar to `application`, `monitor`, `metrics`, etc., these belong to application-level components, thus only allowing single instances to be configured; components like `protocol`, `registry`, etc., allow multiple configurations, and one may use the described format when only needing a singleton configuration. Common examples are as follows:

```properties
dubbo.application.name=demo-provider
dubbo.application.qos-enable=false

dubbo.registry.address=zookeeper://127.0.0.1:2181

dubbo.protocol.name=dubbo
dubbo.protocol.port=-1
```

### 1.2 Instance-level Configuration (specifying id or name)

The property configuration of a specific instance requires specifying id or name, where the prefix format is: plural prefix for configuration type + id/name. Applicable to components supporting multiple instance configurations like `protocol`, `registry`, etc.

```properties
# Instance-level configuration (specifying id or name)
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}
```

* If the instance with such an id or name doesn't exist, the framework will create configuration component instances based on the properties listed here.
* If an identical id or name instance exists, the framework will use the listed properties as supplements to the existing instance configuration; refer to [Property Overrides](../principle#32-Property Overrides) for details.
* For specific plural configuration forms, refer to [Singular-Plural Configuration Correspondence Table](../principle#17-Configuration Item Singular-Plural Correspondence).

Configuration examples:

```properties
dubbo.registries.unit1.address=zookeeper://127.0.0.1:2181
dubbo.registries.unit2.address=zookeeper://127.0.0.1:2182

dubbo.protocols.dubbo.name=dubbo
dubbo.protocols.dubbo.port=20880

dubbo.protocols.hessian.name=hessian
dubbo.protocols.hessian.port=8089
```

### 1.3 Service Interface Configuration

```properties
dubbo.service.org.apache.dubbo.samples.api.DemoService.timeout=5000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.timeout=6000
```

### Method Configuration

Method configuration format:

```properties
# Method configuration
dubbo.service.{interface-name}.{method-name}.{config-item}={config-item-value}
dubbo.reference.{interface-name}.{method-name}.{config-item}={config-item-value}

# Method argument configuration
dubbo.reference.{interface-name}.{method-name}.{argument-index}.{config-item}={config-item-value}
```

Method configuration examples:
```properties
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.timeout=7000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.oninvoke=notifyService.onInvoke
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.onreturn=notifyService.onReturn
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.onthrow=notifyService.onThrow
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.0.callback=true
```

Equivalent to XML configuration:

```xml
<dubbo:reference interface="org.apache.dubbo.samples.api.DemoService" >
    <dubbo:method name="sayHello" timeout="7000" oninvoke="notifyService.onInvoke"
                  onreturn="notifyService.onReturn" onthrow="notifyService.onThrow">
        <dubbo:argument index="0" callback="true" />
    </dubbo:method>
</dubbo:reference>
```

### 1.4 Parameter Configuration

The parameters are a map object, supporting the configuration in the format of xxx.parameters=[{key:value},{key:value}].
```properties
dubbo.application.parameters=[{item1:value1},{item2:value2}]
dubbo.reference.org.apache.dubbo.samples.api.DemoService.parameters=[{item3:value3}]
```

### 1.5 Transport Layer Configuration

The triple protocol uses HTTP2 as the underlying communication protocol, allowing users to customize six settings parameters for HTTP2 [6 settings parameters](https://datatracker.ietf.org/doc/html/rfc7540#section-6.5.2)

The configuration format is as follows:

```properties
# Limit on the number of entries in the header compression index table for the other end
dubbo.rpc.tri.header-table-size=4096

# Enable server push functionality
dubbo.rpc.tri.enable-push=false

# The maximum number of concurrent streams allowed for the other end
dubbo.rpc.tri.max-concurrent-streams=2147483647

# The window size declared by the sender
dubbo.rpc.tri.initial-window-size=1048576

# Set the maximum number of bytes for frames
dubbo.rpc.tri.max-frame-size=32768

# Maximum number of bytes for uncompressed headers permitted for the other end
dubbo.rpc.tri.max-header-list-size=8192
```

Equivalent to YAML configuration:

```yaml
dubbo:
  rpc:
    tri:
      header-table-size: 4096
      enable-push: false
      max-concurrent-streams: 2147483647
      initial-window-size: 1048576
      max-frame-size: 32768
      max-header-list-size: 8192
```



### 1.6 Property and XML Configuration Mapping Rules

The tag names and property names of XML can be combined with a ‘.’ separator. One property per line.

* `dubbo.application.name=foo` is equivalent to `<dubbo:application name="foo" />`
* `dubbo.registry.address=10.20.153.10:9090` is equivalent to `<dubbo:registry address="10.20.153.10:9090" /> `

If there are more than one tags in XML configuration, you can use ‘id’ to distinguish. If you do not specify id, it will apply to all tags.

* `dubbo.protocols.rmi.port=1099` is equivalent to `<dubbo:protocol id="rmi" name="rmi" port="1099" /> `
* `dubbo.registries.china.address=10.20.153.10:9090` is equivalent to `<dubbo:registry id="china" address="10.20.153.10:9090" />`

### 1.7 Configuration Item Singular-Plural Correspondence Table
The naming for plural configurations follows the same rules for pluralizing ordinary words:

1. If it ends with the letter y, change y to ies.
2. If it ends with the letter s, add es.
3. Otherwise, add s.

| Config Type                       | Singular Configuration                                      | Plural Configuration                          |
| --------------------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| application                       | dubbo.application.xxx=xxx                                  | dubbo.applications.{id}.xxx=xxx <br/> dubbo.applications.{name}.xxx=xxx |
| protocol                          | dubbo.protocol.xxx=xxx                                     | dubbo.protocols.{id}.xxx=xxx <br/> dubbo.protocols.{name}.xxx=xxx  |
| module                            | dubbo.module.xxx=xxx                                       | dubbo.modules.{id}.xxx=xxx <br/> dubbo.modules.{name}.xxx=xxx      |
| registry                          | dubbo.registry.xxx=xxx                                     | dubbo.registries.{id}.xxx=xxx                |
| monitor                           | dubbo.monitor.xxx=xxx                                      | dubbo.monitors.{id}.xxx=xxx                  |
| config-center                     | dubbo.config-center.xxx=xxx                                | dubbo.config-centers.{id}.xxx=xxx            |
| metadata-report                   | dubbo.metadata-report.xxx=xxx                              | dubbo.metadata-reports.{id}.xxx=xxx          |
| ssl                               | dubbo.ssl.xxx=xxx                                          | dubbo.ssls.{id}.xxx=xxx                       |
| metrics                           | dubbo.metrics.xxx=xxx                                      | dubbo.metricses.{id}.xxx=xxx                  |
| provider                          | dubbo.provider.xxx=xxx                                     | dubbo.providers.{id}.xxx=xxx                  |
| consumer                          | dubbo.consumer.xxx=xxx                                     | dubbo.consumers.{id}.xxx=xxx                  |
| service                           | dubbo.service.{interfaceName}.xxx=xxx                      | None                                          |
| reference                         | dubbo.reference.{interfaceName}.xxx=xxx                    | None                                          |
| method                            | dubbo.service.{interfaceName}.{methodName}.xxx=xxx <br/> dubbo.reference.{interfaceName}.{methodName}.xxx=xxx | None                                          |
| argument                          | dubbo.service.{interfaceName}.{methodName}.{arg-index}.xxx=xxx | None                                          |


## 2 Configuration Sources

Dubbo supports six configuration sources by default:

- JVM System Properties, JVM -D arguments
- System environment, JVM process's environment variables
- Externalized Configuration, [Externalized Configuration](#33-Externalized Configuration), reading from configuration centers
- Application Configuration, the application's property configuration, extracting attribute sets starting with "dubbo" from the Spring application's Environment
- API / XML / annotation and other programming interfaces that can be understood as a configuration source, a method aimed directly at user programming for configuration collection
- Reading configuration files dubbo.properties from the classpath

Regarding the dubbo.properties attributes:

1. If there are more than one dubbo.properties files in the classpath (for example, two jar packages each containing dubbo.properties), Dubbo will randomly select one to load and print an error log.
2. Dubbo can automatically load dubbo.properties from the root directory of the classpath, but you can also specify the path using the JVM parameter: `-Ddubbo.properties.file=xxx.properties`.

### 2.1 Cover Relationship

If the same configuration item is specified through multiple configuration sources, overlaps may occur, and specific coverage relationships and priorities are referenced in the next subsection.

## 3 Configuration Loading Process

### 3.1 Handling Process

Dubbo's configuration loading roughly consists of two stages:

![Configuration Loading Process](/imgs/v3/config/config-load.svg)

* The first stage involves parsing and processing XML configuration/annotation configuration/Java configuration or executing API configuration code before the DubboBootstrap initialization, creating config beans and adding them to the ConfigManager.
* The second stage involves the DubboBootstrap initialization process, reading external configurations from the configuration center, processing instance-level attribute configurations and application-level attribute configurations in sequence, and finally refreshing all configuration instances' attributes, i.e., [Property Overrides](../principle#32-Property Overrides).

### 3.2 Property Overrides

Property overrides may occur in two ways, and both may happen simultaneously:
1. Different configuration sources specify the same configuration item.
2. The same configuration source, but the same configuration item is specified at different levels.

#### 3.2.1 Different Configuration Sources

![Cover Relationship](/imgs/blog/configuration.jpg)

#### 3.2.2 Same Configuration Sources

Property override refers to using the configured attribute values to override the properties of config bean instances, similar to Spring's [PropertyOverrideConfigurer](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/config/PropertyOverrideConfigurer.html).

> Property resource configurer that overrides bean property values in an application context definition. It pushes values from a properties file into bean definitions.
Configuration lines are expected to be of the following form:
>
> beanName.property=value

However, unlike `PropertyOverrideConfigurer`, Dubbo's property overrides have multiple matching formats, with priorities ranked from high to low as follows:

```properties
#1. Instance-level configuration specifying id
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}

#2. Instance-level configuration specifying name
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}

#3. Application-level configuration (singular)
dubbo.{config-type}.{config-item}={config-item-value}
```

Property overriding handling process:

The search is conducted from high to low priority; if a preceding prefix property is found, the properties using this prefix will be selected, ignoring subsequent configurations.

![Property Override Process](/imgs/v3/config/properties-override.svg)

### 3.3 Externalized Configuration

One of the aims of externalized configuration is to achieve centralized management of configurations. There are many mature professional configuration systems in the industry, such as Apollo and Nacos. What Dubbo does primarily is ensure proper functionality with these systems.

Externalized configurations differ in content and format, and can simply be understood as the external storage of `dubbo.properties`, allowing the configuration centers to better manage common configurations such as registry addresses and metadata center configurations.

```properties
# Centralize the management of registry address, metadata center address, etc., enabling unified environments and reducing development-side awareness.
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.registry.simplified=true

dubbo.metadata-report.address=zookeeper://127.0.0.1:2181

dubbo.protocol.name=dubbo
dubbo.protocol.port=20880

dubbo.application.qos.port=33333
```

- Priority
  By default, externalized configurations have a higher priority than local configurations, so the contents configured here will override local configuration values; details regarding the [cover relationship](#21-Cover Relationship) are explained separately in one chapter.

- Scope
  Externalized configurations come in global and application levels. Global configurations are shared among all applications, while application-level configurations are maintained by each application and are only visible to them. Current supported extended implementations include Zookeeper, Apollo, and Nacos.

#### 3.3.1 Using Externalized Configuration

1. Add config-center configuration

```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
```

2. Add global configuration items in the corresponding configuration center (Zookeeper, Nacos, etc.), as shown below in Nacos, for example:

![nacos-extenal-properties](/imgs/v3/config-center/nacos-extenal-properties.png)

After enabling externalized configuration, global configurations for registry, metadata-report, protocol, qos, etc. theoretically no longer need to be configured in the application, allowing application developers to focus on business service configurations. Shared global configurations can instead be uniformly set by the operations team in remote configuration centers.

This allows for the scenario where application only needs to care about:
* Service exposure and subscription configurations
* Configuration center address
When deployed in different environments, other configurations can automatically be retrieved from the corresponding configuration center.

For instance, Dubbo-related configurations in each application may only need to include the following content, while the rest are managed by the specific environment's configuration center:

```yaml
dubbo
  application
    name: demo
  config-center
    address: nacos://127.0.0.1:8848
```

#### 3.3.2 Custom Loading of Externalized Configuration

Dubbo's support for configuration centers essentially involves pulling `.properties` files from remote sources to the local machine, then merging them with the local configurations. Theoretically, as long as the Dubbo framework can obtain the necessary configurations, it can start normally. It doesn't matter whether these configurations were loaded by itself or directly provided by the application. Thus, Dubbo provides the following API, allowing users to push configured settings to the Dubbo framework themselves (users need to handle the configuration loading process), so that Dubbo no longer directly interacts with Apollo or Zookeeper for configuration reading.

```java
// Application loads configurations by itself
Map<String, String> dubboConfigurations = new HashMap<>();
dubboConfigurations.put("dubbo.registry.address", "zookeeper://127.0.0.1:2181");
dubboConfigurations.put("dubbo.registry.simplified", "true");

// Push the organized configurations to the Dubbo framework
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setExternalConfig(dubboConfigurations);
```

