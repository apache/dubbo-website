---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: "Demonstrates how to use Nacos as a registry for automatic service discovery through examples."
linkTitle: nacos
title: Use Nacos as a Registry for Automatic Service Discovery
type: docs
weight: 4
---

This example demonstrates automatic service discovery using Nacos as a registry based on a Spring Boot application. You can view the [complete example code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-nacos).

## 1 Basic Configuration

### 1.1 Add Dependencies

For Spring Boot applications, use the following spring-boot-starter:
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

Non-Spring Boot users can add dubbo and nacos-client dependencies:
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

### 1.2 Nacos Version Mapping
| Dubbo | Recommended Nacos Version | Nacos Compatibility Range |
| --- | --- | --- |
| 3.3.0 | 2.3.0 | 2.x |
| 3.2.21 | 2.1.0 | 2.x |
| 3.1.11 | 2.0.9 | 2.x |
| 3.0.10 | 2.0.9 | 2.x |
| 2.7.21 | Latest 1.x Version | 1.x |
| 2.6.0 | Latest 1.x Version | 1.x |

### 1.3 Configure and Enable Nacos

```yaml
# application.yml (Spring Boot)
dubbo
 registry
   address: nacos://localhost:8848
```
or
```properties
# dubbo.properties
dubbo.registry.address=nacos://localhost:8848
```
or
```xml
<dubbo:registry address="nacos://localhost:8848" />
```

## 2 Advanced Configuration

### 2.1 Authentication

```yaml
# application.yml (Spring Boot)
dubbo
 registry
   address: nacos://localhost:8848?username=nacos&password=nacos
```

or

```properties
# dubbo.properties
dubbo.registry.address: nacos://nacos:nacos@localhost:8848
```

### 2.2 Custom Namespace

```yaml
# application.yml (Spring Boot)
dubbo:
 registry:
   address: nacos://localhost:8848?namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932
```

or

```yaml
# application.yml (Spring Boot)
dubbo:
 registry:
   address: nacos://localhost:8848
   parameters.namespace: 5cbb70a5-xxx-xxx-xxx-d43479ae0932
```

### 2.3 Custom Group

```yaml
# application.yml
dubbo:
 registry:
   address: nacos://localhost:8848
   group: dubbo
```

> If not configured, the group is specified by Nacos by default. The group and namespace represent different isolation levels in Nacos; generally, a namespace is used to isolate different users or environments, while a group is used to further categorize data within the same environment.

### 2.4 Register Interface-level Consumers
Starting from Dubbo 3.0.0, a parameter was added to indicate whether to register consumers. To register the consumer in the Nacos registry, set the parameter (register-consumer-url) to true; the default is false.
```yaml
# application.yml
dubbo:
  registry:
    address: nacos://localhost:8848?register-consumer-url=true
```
or
```yaml
# application.yml
dubbo:
  registry:
    address: nacos://localhost:8848
    parameters.register-consumer-url: true
```

### 2.5 More Configurations

Parameter Name | Description | Default Value
---|---|---
username | Username for connecting to Nacos Server | nacos
password | Password for connecting to Nacos Server | nacos
backup | Backup address | empty
namespace | ID of the namespace | public
group | Group name | DEFAULT_GROUP
register-consumer-url | Whether to register the consumer | false
com.alibaba.nacos.naming.log.filename | Log filename during initialization | naming.log
endpoint | Specified connection point to connect to Nacos Server, can refer to [documentation](https://nacos.io/zh-cn/blog/address-server.html) | empty
endpointPort | Port of the specified connection point to Nacos Server, can refer to [documentation](https://nacos.io/zh-cn/blog/address-server.html) | empty
endpointQueryParams | Query parameters for endpoint | empty
isUseCloudNamespaceParsing | Whether to parse the namespace parameter in a cloud environment | true
isUseEndpointParsingRule | Whether to enable endpoint parameter rule parsing | true
namingLoadCacheAtStart | Whether to prioritize reading local cache on startup | true
namingCacheRegistryDir | Specify cache subdirectory, location is .../nacos/{SUB_DIR}/naming | empty
namingClientBeatThreadCount | Thread pool size for client heartbeats | half of the machine's CPU count
namingPollingThreadCount | Thread pool size for client timed polling data updates | half of the machine's CPU count
namingRequestDomainMaxRetryCount | Number of retries for client requests to Nacos Server via HTTP | 3
namingPushEmptyProtection | Whether to enable protection when there are no valid (healthy) instances; if enabled, it will use old service instances | false
push.receiver.udp.port | Client UDP port | empty

After version `1.0.0` of nacos-server, clients can report instances with specific metadata to the server to control instance behaviors.

Parameter Name | Description | Default Value
---|---|---
preserved.heart.beat.timeout | Time (in milliseconds) for an instance to go from healthy to unhealthy without sending heartbeats | 15000
preserved.ip.delete.timeout | Time (in milliseconds) for the server to remove the instance after it stops sending heartbeats | 30000
preserved.heart.beat.interval | Interval time (in milliseconds) for the instance to report heartbeats | 5000
preserved.instance.id.generator | Instance ID generation strategy; when the value is `snowflake`, it starts increasing from 0 | simple
preserved.register.source | The type of service framework during instance registration (e.g., Dubbo, Spring Cloud, etc.) | empty

These parameters can be configured similarly to `namespace` by extending parameters in Nacos, such as

```properties
dubbo.registry.parameters.preserved.heart.beat.timeout=5000
```

## 3 Working Principle

In a previous section, we explained the difference between application-level service discovery and interface-level service discovery. Below are the specific storage structures of both modes in Nacos.

### 3.1 Dubbo2 Registration Data

Then, restart your Dubbo application, and the service provider and consumer information in Dubbo can be displayed in the Nacos console:

![dubbo-registry-nacos-1.png](/imgs/blog/dubbo-registry-nacos-1.png)

As shown in the figure, the information with the service name prefix `providers:` is the metadata of the service provider, while `consumers:` represents the metadata of the service consumer. Click "**Details**" to view service status details:

![image-dubbo-registry-nacos-2.png](/imgs/blog/dubbo-registry-nacos-2.png)

### 3.2 Dubbo3 Registration Data
The application-level service discovery "service name" is the application name.

> Dubbo3 defaults to a dual registration mode of "application-level service discovery + interface-level service discovery," so both application-level services (application name) and interface-level services (interface name) will appear in the Nacos console. You can change the registration behavior by configuring `dubbo.registry.register-mode=instance/interface/all`.

### 3.3 Client Caching

### 3.4 Heartbeat Detection

### 3.5

