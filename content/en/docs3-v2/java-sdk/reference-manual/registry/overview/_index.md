---
type: docs
title: "Overview"
linkTitle: "Overview"
weight: 1
description: ""
---

The registration center is the core component of Dubbo service governance. Dubbo relies on the coordination of the registration center to realize service (address) discovery. Automatic service discovery is the basis for microservices to achieve dynamic scaling, load balancing, and traffic management. Dubbo's service discovery mechanism has experienced interface-level service discovery in the Dubbo2 era and application-level service discovery in the Dubbo3 era. For details, see [Service Discovery Mechanism](/en/docs3-v2/java-sdk/concepts-and-architecture/service -discovery/) analysis to understand the specific evolution process.

## Basic usage
The Dubbo registry component must be specified when developing an application. The configuration is very simple, just specify the cluster address of the registry:

Taking Spring Boot development as an example, add a registry configuration item in application.yml

```yaml
dubbo
 registry
  address: {protocol}://{cluster-address}
```
Among them, protocol is the selected configuration center type, and cluster-address is the cluster address for accessing the registration center, such as

`address: nacos://localshot:8848`

If you need a cluster format address, you can use the backup parameter

`address: nacos://localshot:8848?backup=localshot:8846,localshot:8847`

> The application must specify the Dubbo registration center, even if the registration center is not enabled (you can set the address to be empty address='N/A' ).

In addition to the rest, depending on each configuration center, you can refer to the [registry configuration reference manual](/en/docs3-v2/java-sdk/reference-manual/config/properties/#registry) or expand through the parameters parameter.

## Configuration Center and Metadata Center
The configuration center and metadata center are the basic components to realize Dubbo's high-level service governance capabilities. Compared with the registration center, the configuration of these two components is usually optional.

In order to be compatible with configurations of 2.6 and older versions, Dubbo will use it as both a metadata center and a configuration center for some registry types (such as Zookeeper, Nacos, etc.).

```yaml
dubbo
 registry
  address: nacos://localhost:8848
```

Default behavior after frame resolution

```yaml
dubbo
 registry
  address: nacos://localhost:8848
 config-center
  address: nacos://localhost:8848
 metadata-report
  address: nacos://localhost:8848
```

The default behavior can be adjusted or controlled by the following two parameters

```yaml
dubbo
 registry
  address: nacos://localhost:8848
  use-as-config-center: false
  use-as-metadata-report: false
```

## Registration Center Ecology
The mainstream registry implementations currently supported by the Dubbo backbone include
* Zookeeper
* Nacos
* Redis

It also supports service discovery of Kubernetes and Mesh systems.

In addition, [Dubbo extension ecology](https://github.com/apache/dubbo-spi-extensions) also provides registry extension implementations such as Consul, Eureka, and Etcd. Also welcome to contribute more registry implementations to the Dubbo ecosystem through [registry spi extension](../../spi/).

Dubbo also supports [specifying multiple registries] (../multiple-registry/) in an application, and grouping services according to registries, which makes service group management or service migration easier.