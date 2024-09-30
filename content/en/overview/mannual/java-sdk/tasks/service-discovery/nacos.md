---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: "This example demonstrates how to use Nacos as a registration center to achieve automatic service discovery."
linkTitle: Using Nacos as Registration Center
title: Using Nacos as Registration Center for Automatic Service Discovery
type: docs
weight: 4
---

This example demonstrates Nacos as a registration center for automatic service discovery, based on a Spring Boot application. You can view the [complete sample code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-nacos) here.

## 1 Basic Configuration

### 1.1 Add Dependency
Add the dependencies for dubbo and nacos-client:
```xml
<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>3.3.0</version>
    </dependency>
    <dependency>
      <groupId>com.alibaba.nacos</groupId>
      <artifactId>nacos-client</artifactId>
      <version>2.1.0</version>
    </dependency>
</dependencies>
```

For Spring Boot applications, you can use the following spring-boot-starter:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>3.3.0</version>
</dependency>
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-nacos-spring-boot-starter</artifactId>
    <version>3.3.0</version>
</dependency>
```

### 1.2 Nacos Version
Nacos version mapping:
| Dubbo | Recommended Nacos Version | Nacos Compatibility Range |
| --- | --- | --- |
| 3.3.0 | 2.2.3 | 2.x |
| 3.2.21 | 2.1.0 | 2.x |
| 3.1.11 | 2.0.9 | 2.x |
| 3.0.10 | 2.0.9 | 2.x |
| 2.7.21 | 1.x | 1.x |
| 2.6.0 | 1.x | 1.x |

### 1.3 Configure and Enable Nacos

```yaml
# application.yml (Spring Boot)
dubbo
 registry
   address: nacos://localhost:8848
   register-mode: instance # New users should set this value, indicating the enablement of application-level service discovery. Options: interface, instance, all. Default is all; future versions will change default to instance.
```
or
```properties
# dubbo.properties
dubbo.registry.address=nacos://localhost:8848
dubbo.registry.register-mode=instance
```
or
```xml
<dubbo:registry address="nacos://localhost:8848" register-mode="instance"/>
```

## 2 Advanced Configuration

### 2.1 Authentication

```yaml
# application.yml (Spring Boot)
dubbo
 registry
   address: nacos://localhost:8848?username=nacos&password=nacos
   register-mode: instance
```

or

```properties
# dubbo.properties
dubbo.registry.address: nacos://nacos:nacos@localhost:8848
dubbo.registry.register-mode=instance
```

### 2.2 Custom Namespace

```yaml
# application.yml (Spring Boot)
dubbo:
 registry:
   address: nacos://localhost:8848?namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932
   register-mode: instance # New users should set this value, indicating the enablement of application-level service discovery. Options: interface, instance, all
```

or

```yaml
# application.yml (Spring Boot)
dubbo:
 registry:
   address: nacos://localhost:8848
   register-mode: instance # New users should set this value, indicating the enablement of application-level service discovery. Options: interface, instance, all
   parameters.namespace: 5cbb70a5-xxx-xxx-xxx-d43479ae0932
```

### 2.3 Custom Group

```yaml
# application.yml
dubbo:
 registry:
   address: nacos://localhost:8848
   register-mode: instance # New users should set this value, indicating the enablement of application-level service discovery. Options: interface, instance, all
   group: dubbo
```

> If not configured, the group is specified by Nacos by default. The group and namespace represent different isolation levels in Nacos. Generally, the namespace is used to isolate different users or environments, while the group is used to further organize data within the same environment.

### 2.4 Register Interface-Level Consumer
Since Dubbo version 3.0.0, a parameter has been added to indicate whether to register consumers. If you need to register consumers in the Nacos registration center, set the parameter (register-consumer-url) to true; the default is false.
```yaml
# application.yml
dubbo:
  registry:
    register-mode: instance # New users should set this value, indicating the enablement of application-level service discovery. Options: interface, instance, all
    address: nacos://localhost:8848?register-consumer-url=true
```
or
```yaml
# application.yml
dubbo:
  registry:
    address: nacos://localhost:8848
    register-mode: instance # New users should set this value, indicating the enablement of application-level service discovery. Options: interface, instance, all
    parameters.register-consumer-url: true
```

### 2.5 More Configuration

Parameter Name | Description | Default Value
---|---|---
username|Username to connect to Nacos Server|nacos
password|Password to connect to Nacos Server|nacos
backup|Backup address|empty
namespace|Namespace ID|public
group|Group name|DEFAULT_GROUP
register-consumer-url|Whether to register the consumer|false
com.alibaba.nacos.naming.log.filename|Initialization log filename|naming.log
endpoint|Specified connection point for connecting to Nacos Server, refer to [documentation](https://nacos.io/zh-cn/blog/address-server.html)|empty
endpointPort|Port for the specified connection point to Nacos Server, refer to [documentation](https://nacos.io/zh-cn/blog/address-server.html)|empty
endpointQueryParams|Query parameters for endpoint|empty
isUseCloudNamespaceParsing|Whether to parse the namespace parameter in a cloud environment|true
isUseEndpointParsingRule|Whether to enable endpoint parameter rule parsing|true
namingLoadCacheAtStart|Whether to prioritize reading local cache at startup|true
namingCacheRegistryDir|Specify cache subdirectory, located at .../nacos/{SUB_DIR}/naming|empty
namingClientBeatThreadCount|Size of the thread pool for client heartbeat|half the number of CPU cores
namingPollingThreadCount|Size of the thread pool for regular data polling updates|half the number of CPU cores
namingRequestDomainMaxRetryCount|Number of retries when client requests Nacos Server via HTTP|3
namingPushEmptyProtection|Whether to enable protection when no valid (healthy) instance exists, after enabling it will use the old service instance|false
push.receiver.udp.port|Client UDP port|empty

In nacos-server@`1.0.0`, clients can report instances with specific metadata to control instance behavior.

Parameter Name | Description | Default Value
---|---|---
preserved.heart.beat.timeout|Time (ms) for the instance to become unhealthy after not sending heartbeat|15000
preserved.ip.delete.timeout|Time (ms) for the instance to be removed by the server after not sending heartbeat|30000
preserved.heart.beat.interval|Interval (ms) for the instance to report heartbeat|5000
preserved.instance.id.generator|ID generation strategy for the instance. When the value is `snowflake`, it increases from 0|simple
preserved.register.source|Service framework type during instance registration (e.g., Dubbo, Spring Cloud, etc.)|empty

These parameters can be configured in Nacos similarly to `namespace`, such as

```properties
dubbo.registry.parameters.preserved.heart.beat.timeout=5000
```

## 3 Working Principle

In the previous section, we explained the difference between application-level service discovery and interface-level service discovery. Below are the specific storage structures for both modes in Nacos.

### 3.1 Dubbo2 Registration Data

Then restart your Dubbo application. The service provision and consumption information of Dubbo can be displayed in the Nacos console:

![dubbo-registry-nacos-1.png](/imgs/blog/dubbo-registry-nacos-1.png)

As shown, the service prefix `providers:` contains metadata for service providers, while `consumers:` represents metadata for service consumers. Click on "**Details**" to view service status details:

![image-dubbo-registry-nacos-2.png](/imgs/blog/dubbo-registry-nacos-2.png)

### 3.2 Dubbo3 Registration Data
The "service name" for application-level service discovery is the application name.

> Dubbo3 adopts a "dual registration model" of "application-level service discovery + interface-level service discovery" by default, so you will find both application-level service (application name) and interface-level service (interface name) appearing in the Nacos console. You can change the registration behavior by configuring `dubbo.registry.register-mode=instance/interface/all`.

### 3.3 Client Cache

### 3.4 Heartbeat Detection

### 3.5
