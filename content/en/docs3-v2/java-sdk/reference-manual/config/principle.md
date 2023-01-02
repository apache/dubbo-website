---
type: docs
title: "How Configuration Works"
linkTitle: "How configuration works"
weight: 5
description: "An in-depth interpretation of Dubbo configuration methods and working principles, including configuration formats, design ideas, sources, loading processes, etc."
---

The following is an example of Dubbo property configuration [dubbo-spring-boot-samples](https://github.com/apache/dubbo-spring-boot-project/tree/master/dubbo-spring-boot-samples)

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

  ## service default version
  dubbo.provider.version=1.0.0
```
Next, around this example, we analyze the working principle of Dubbo configuration from three aspects: configuration format, configuration source, and loading process.

## 1 configuration format

All configurations currently supported by Dubbo are in `.properties` format, including `-D`, `Externalized Configuration`, etc. All configuration items in `.properties` follow a `path-based` configuration format.

In the Spring application, you can also put the attribute configuration in `application.yml`, and the tree hierarchy is more readable.

```properties
# Application-level configuration (no id)
dubbo.{config-type}.{config-item}={config-item-value}

# Instance-level configuration (specify id or name)
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}

# Service interface configuration
dubbo.service.{interface-name}.{config-item}={config-item-value}
dubbo.reference.{interface-name}.{config-item}={config-item-value}

# method configuration
dubbo.service.{interface-name}.{method-name}.{config-item}={config-item-value}
dubbo.reference.{interface-name}.{method-name}.{config-item}={config-item-value}

# Method argument configuration
dubbo.reference.{interface-name}.{method-name}.{argument-index}.{config-item}={config-item-value}

```

### 1.1 Application-level configuration (no id)

The format of application-level configuration is: configuration type singular prefix, no id/name.
```properties
# Application-level configuration (no id)
dubbo.{config-type}.{config-item}={config-item-value}
```

Similar to `application`, `monitor`, `metrics`, etc. are all application-level components, so only a single instance is allowed to be configured; while `protocol`, `registry`, etc. allow to configure multiple components, when only singleton configuration is required , in the format described in this section. Common examples are as follows:

```properties
dubbo.application.name=demo-provider
dubbo.application.qos-enable=false

dubbo.registry.address=zookeeper://127.0.0.1:2181

dubbo.protocol.name=dubbo
dubbo.protocol.port=-1
```

### 1.2 Instance-level configuration (specify id or name)

The attribute configuration for an instance needs to specify an id or name, and its prefix format is: configuration type plural prefix + id/name. Applicable to `protocol`, `registry` and other components that support multiple configurations.

```properties
# Instance-level configuration (specify id or name)
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}
```

* If there is no instance of the id or name, the framework will create a configuration component instance based on the properties listed here.
* If an instance with the same id or name already exists, the framework will use the attributes listed here as a supplement to the existing instance configuration. For details, please refer to [Attribute Override](../principle#32-Attribute Override).
* Please refer to the [single and plural configuration comparison table] (../principle#17-single and plural configuration item comparison table)

Configuration example:

```properties
dubbo.registries.unit1.address=zookeeper://127.0.0.1:2181
dubbo.registries.unit2.address=zookeeper://127.0.0.1:2182

dubbo.protocols.dubbo.name=dubbo
dubbo.protocols.dubbo.port=20880

dubbo.protocols.hessian.name=hessian
dubbo.protocols.hessian.port=8089
```

### 1.3 Service interface configuration

```properties
dubbo.service.org.apache.dubbo.samples.api.DemoService.timeout=5000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.timeout=6000
```

### Method configuration

Method configuration format:

```properties
# method configuration
dubbo.service.{interface-name}.{method-name}.{config-item}={config-item-value}
dubbo.reference.{interface-name}.{method-name}.{config-item}={config-item-value}

# Method argument configuration
dubbo.reference.{interface-name}.{method-name}.{argument-index}.{config-item}={config-item-value}
```

Example method configuration:
```properties
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.timeout=7000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.oninvoke=notifyService.onInvoke
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.onreturn=notifyService.onReturn
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.onthrow=notifyService.onThrow
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.0.callback=true
```

Equivalent to XML configuration:

```xml
<dubbo:reference interface="org.apache.dubbo.samples.api.DemoService">
    <dubbo:method name="sayHello" timeout="7000" oninvoke="notifyService.onInvoke"
                  onreturn="notifyService.onReturn" onthrow="notifyService.onThrow">
        <dubbo:argument index="0" callback="true" />
    </dubbo:method>
</dubbo:reference>
```

### 1.4 Parameter configuration

The parameters parameter is a map object, which supports configuration in the form of xxx.parameters=[{key:value},{key:value}].
```properties
dubbo.application.parameters=[{item1:value1},{item2:value2}]
dubbo.reference.org.apache.dubbo.samples.api.DemoService.parameters=[{item3:value3}]
```

### 1.5 Transport layer configuration

The triple protocol uses Http2 as the underlying communication protocol, allowing users to customize [6 settings parameters] of Http2 (https://datatracker.ietf.org/doc/html/rfc7540#section-6.5.2)

The configuration format is as follows:

```properties
# Notify the peer header of the upper limit of compressed index tables
dubbo.rpc.tri.header-table-size=4096

# Enable server-side push function
dubbo.rpc.tri.enable-push=false

# Notify the peer of the maximum number of concurrent streams allowed
dubbo.rpc.tri.max-concurrent-streams=2147483647

# Declare the window size of the sender
dubbo.rpc.tri.initial-window-size=1048576

# Set the maximum number of bytes for the frame
dubbo.rpc.tri.max-frame-size=32768

# Notify the peer of the maximum number of uncompressed bytes in the header
dubbo.rpc.tri.max-header-list-size=8192
```

Equivalent to yml configuration:

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



### 1.6 Attribute and XML configuration mapping rules

The xml tag name and attribute name can be combined, separated by '.'. One attribute per line.

* `dubbo.application.name=foo` is equivalent to `<dubbo:application name="foo" />`
* `dubbo.registry.address=10.20.153.10:9090` is equivalent to `<dubbo:registry address="10.20.153.10:9090" /> `

If there is more than one tag in xml configuration, then you can use 'id' to differentiate. If you don't specify an id, it will apply to all tags.

* `dubbo.protocols.rmi.port=1099` is equivalent to `<dubbo:protocol id="rmi" name="rmi" port="1099" /> `
* `dubbo.registries.china.address=10.20.153.10:9090` is equivalent to `<dubbo:registry id="china" address="10.20.153.10:9090" />`

### 1.7 Single and plural comparison table for configuration items
Plural configurations are named in the same way as regular words are pluralized:

1. When the letter y ends, remove y and change to ies
2. At the end of the letter s, add es
3. Others add s

| Config Type | Singular Configuration | Plural Configuration |
| ------------------------------------ | --------------- ------------------------------------------------ | ---- ---------------------------------- |
| application | dubbo.application.xxx=xxx | dubbo.applications.{id}.xxx=xxx <br/> dubbo.applications.{name}.xxx=xxx |
| protocol | dubbo.protocol.xxx=xxx | dubbo.protocols.{id}.xxx=xxx <br/> dubbo.protocols.{name}.xxx=xxx |
| module | dubbo.module.xxx=xxx | dubbo.modules.{id}.xxx=xxx <br/> dubbo.modules.{name}.xxx=xxx |
| registry | dubbo.registry.xxx=xxx | dubbo.registries.{id}.xxx=xxx |
| monitor | dubbo.monitor.xxx=xxx | dubbo.monitors.{id}.xxx=xxx |
| config-center | dubbo.config-center.xxx=xxx | dubbo.config-centers.{id}.xxx=xxx |
| metadata-report | dubbo.metadata-report.xxx=xxx | dubbo.metadata-reports.{id}.xxx=xxx |
| ssl | dubbo.ssl.xxx=xxx | dubbo.ssls.{id}.xxx=xxx |
| metrics | dubbo.metrics.xxx=xxx | dubbo.metricses.{id}.xxx=xxx |
| provider | dubbo.provider.xxx=xxx | dubbo.providers.{id}.xxx=xxx |
| consumer | dubbo.consumer.xxx=xxx | dubbo.consumers.{id}.xxx=xxx |
| service | dubbo.service.{interfaceName}.xxx=xxx | None |
| reference | dubbo.reference.{interfaceName}.xxx=xxx | None |
| method | dubbo.service.{interfaceName}.{methodName}.xxx=xxx <br/> dubbo.reference.{interfaceName}.{methodName}.xxx=xxx | None |
| argument | dubbo.service.{interfaceName}.{methodName}.{arg-index}.xxx=xxx | None |


## 2 Configure sources

Dubbo supports 6 configuration sources by default:

- JVM System Properties, JVM -D parameter
- System environment, the environment variable of the JVM process
- Externalized Configuration, [externalized configuration] (#33-externalized configuration), read from the configuration center
- Application Configuration, application attribute configuration, extract the attribute set starting with "dubbo" from the Spring application Environment
- The configuration collected by programming interfaces such as API/XML/annotation can be understood as a kind of configuration source, which is a configuration collection method directly oriented to user programming
- Read configuration file dubbo.properties from classpath

About the dubbo.properties attribute:

1. If there is more than one dubbo.properties file under the classpath, for example, two jar packages each contain dubbo.properties, dubbo will randomly select one to load and print an error log.
2. Dubbo can automatically load dubbo.properties in the root directory of the classpath, but you can also use JVM parameters to specify the path: `-Ddubbo.properties.file=xxx.properties`.

### 2.1 Coverage relationship

If the same configuration item is specified through multiple configuration sources, configuration items will overlap each other. Please refer to the next section for specific coverage relationship and priority.

## 3 Configuration loading process

### 3.1 Processing flow

Dubbo configuration loading is roughly divided into two stages:

![Configuration loading process](/imgs/v3/config/config-load.svg)

* The first stage is before the initialization of DubboBootstrap, parse and process the XML configuration/annotation configuration/Java-config or execute the API configuration code when the Spring context starts, create a config bean and add it to the ConfigManager.
* The second stage is the DubboBootstrap initialization process, which reads the external configuration from the configuration center, processes instance-level attribute configuration and application-level attribute configuration in turn, and finally refreshes the attributes of all configuration instances, that is, [property override](../principle#32 -property override).

### 3.2 Property Override

There may be two situations where property overriding occurs, and the two may occur at the same time:
1. The same configuration item is configured in different configuration sources
2. The same configuration source, but the same configuration item is specified at different levels

#### 3.2.1 Different configuration sources

![Override relationship](/imgs/blog/configuration.jpg)

#### 3.2.1 Same configuration source

Property override refers to overriding the properties of the config bean instance with the configured property values, similar to Spring [PropertyOverrideConfigurer](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/ factory/config/PropertyOverrideConfigurer.html) .

> Property resource configurer that overrides bean property values in an application context definition. It pushes values from a properties file into bean definitions.
Configuration lines are expected to be of the following form:
>
> beanName.property=value

But the difference from `PropertyOverrideConfigurer` is that Dubbo's property override has multiple matching formats, and the priority from high to low is:

```properties
#1. Instance-level configuration of the specified id
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}

#2. Specify the instance-level configuration of the name
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}

#3. Application-level configuration (singular configuration)
dubbo.{config-type}.{config-item}={config-item-value}
```

Attribute override processing flow:

Search in order of priority from high to low. If an attribute starting with this prefix is found, use this prefix to extract the attribute and ignore the subsequent configuration.

![Properties Override Process](/imgs/v3/config/properties-override.svg)

### 3.3 Externalization configuration

One of the purposes of external configuration is to achieve centralized management of configuration. There are already many mature professional configuration systems in this part of the industry, such as Apollo, Nacos, etc. What Dubbo does is mainly to ensure that it can work with these systems.

There is no difference in content and format between externalized configuration and other local configurations. It can be simply understood as the externalized storage of `dubbo.properties`. The configuration center is more suitable for extracting some public configurations such as registration centers and metadata center configurations for future use. centralized management.

```properties
# Centralized management of registration center address, metadata center address and other configurations can achieve a unified environment and reduce development-side perception.
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.registry.simplified=true

dubbo.metadata-report.address=zookeeper://127.0.0.1:2181

dubbo.protocol.name=dubbo
dubbo.protocol.port=20880

dubbo.application.qos.port=33333
```

- priority
  By default, the externalized configuration has a higher priority than the local configuration, so the content configured here will override the local configuration value. There is a separate chapter explaining the [Override Relationship] (#21-Override Relationship) between various configuration forms.

- scope
  There are two levels of external configuration: global and application. The global configuration is shared by all applications. The application-level configuration is maintained by each application and is only visible to itself. Currently supported extensions include Zookeeper, Apollo, and Nacos.

#### 3.3.1 How to use external configuration

1. Add config-center configuration

```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
```

2. Add global configuration items in the corresponding configuration center (zookeeper, Nacos, etc.), take Nacos as an example as follows:

![nacos-extenal-properties](/imgs/v3/config-center/nacos-extenal-properties.png)

After the external configuration is enabled, global configurations such as registry, metadata-report, protocol, and qos theoretically no longer need to be configured in the application. The application development side focuses on business service configuration, and some globally shared global configurations are transferred to O&M. The personnel are uniformly configured in the remote configuration center.

The effect of this is that the application only needs to care about:
* Service exposure, subscription configuration
* Configuration center address
  When deployed to different environments, other configurations can be automatically read from the corresponding configuration center.

For example, only the following Dubbo-related configurations in each application may be sufficient, and the rest are hosted in the configuration center in the corresponding environment:

```yaml
dubbo
  application
    name: demo
  config-center
    address: nacos://127.0.0.1:8848
```

#### 3.3.2 Load external configuration by itself

The so-called Dubbo's support for the configuration center is essentially to pull `.properties` from the remote to the local, and then integrate it with the local configuration. In theory, as long as the Dubbo framework can get the required configuration, it can start normally. It doesn't care whether these configurations are loaded by itself or directly inserted by the application, so Dubbo also provides the following APIs to allow users to organize themselves. The configuration is stuffed into the Dubbo framework (the configuration loading process is to be completed by the user), so that the Dubbo framework no longer directly interacts with Apollo or Zookeeper to read the configuration.

```java
// The application loads its own configuration
Map<String, String> dubboConfigurations = new HashMap<>();
        dubboConfigurations.put("dubbo.registry.address", "zookeeper://127.0.0.1:2181");
        dubboConfigurations.put("dubbo.registry.simplified", "true");

//Throw the organized configuration into the Dubbo framework
        ConfigCenterConfig configCenter = new ConfigCenterConfig();
        configCenter.setExternalConfig(dubboConfigurations);
```