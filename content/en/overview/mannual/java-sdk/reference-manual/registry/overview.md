---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/registry/overview/
    - /en/docs3-v2/java-sdk/reference-manual/registry/overview/
description: ""
linkTitle: Overview of the Registry
title: Overview of the Registry
type: docs
weight: 1
---


The registry is the core component of Dubbo service governance. Dubbo relies on the registry for coordinating service (address) discovery, where automated service discovery is foundational for dynamic scaling, load balancing, and traffic management in microservices. Dubbo's service discovery mechanism has evolved from interface-level service discovery in Dubbo 2 to application-level service discovery in Dubbo 3. For specific evolution details, refer to [Service Discovery Mechanism](/en/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/).

![service-discovery](/imgs/v3/feature/service-discovery/arc.png)

## Basic Usage
When developing applications, you can specify the Dubbo registry component. Configuration is straightforward; you only need to specify the cluster address of the registry:

For example, in a Spring Boot application, add the registry configuration to application.yml:

```yaml
dubbo
 registry
  address: {protocol}://{cluster-address}
```
Here, protocol is the chosen configuration center type, and cluster-address is the address of the registry, such as:

`address: nacos://localhost:8848`

For cluster format addresses, you can use the backup parameter:

`address: nacos://localhost:8848?backup=localshot:8846,localshot:8847`

{{% alert title="Flow Semantic Guarantee" color="info" %}}
In versions 3.3.0 and later, the registry is optional. However, in versions prior to 3.3.0, Dubbo applications must specify registry configuration, even if the registry is not enabled (it can be set to an empty address: address='N/A').
{{% /alert %}}

Each registry component has its unique configurations to control namespaces, groups, authentication, etc. For more details, refer to the [Registry Configuration Reference Manual](/en/overview/mannual/java-sdk/reference-manual/config/properties/#registry) or extend through parameters.

## Configuration Center and Metadata Center
The configuration center and metadata center are components that Dubbo relies on to implement advanced service governance capabilities, such as traffic control rules. Compared to the registry, the configurations for these two components are typically optional.

It is important to note that **for some registry types (e.g., Zookeeper, Nacos, etc.), Dubbo will default to using them as both the metadata center and configuration center (it is recommended to keep the default on).**

```yaml
dubbo
 registry
  address: nacos://localhost:8848
```

The default behavior after framework parsing is:

```yaml
dubbo
 registry
  address: nacos://localhost:8848
 config-center
  address: nacos://localhost:8848
 metadata-report
  address: nacos://localhost:8848
```

If you do not want to use Nacos as the configuration center, you can adjust the default behavior with the following two parameters:

```yaml
dubbo
 registry
  address: nacos://localhost:8848
  use-as-config-center: false
  use-as-metadata-report: false
 config-center
   address: apollo://localhost:8848
```

## Registry Ecosystem
The mainstream registry implementations currently supported by Dubbo include:
* Zookeeper
* Nacos
* Redis
* Consul
* Etcd
* More implementations

It also supports service discovery in Kubernetes and Mesh architectures. For more details, refer to [Tutorial - Kubernetes Deployment](http://localhost:1313/zh-cn/overview/mannual/java-sdk/tasks/deploy/).

Additionally, the [Dubbo Extension Ecosystem](https://github.com/apache/dubbo-spi-extensions) provides extension implementations for registries like Consul, Eureka, Etcd, etc. Contributions of more registry implementations to the Dubbo ecosystem are welcome through the [Registry SPI Extension](../../spi/).

Dubbo also supports [specifying multiple registries](../multiple-registry/) in a single application and grouping services according to the registry, making service group management or migration easier.

