---
aliases:
    - /zh/download/spi-extensions/
description: SPI Extensions
title: SPI Extensions
type: docs
weight: 60
---


## Verify

You can follow the [steps](https://www.apache.org/info/verification) here, and use the [KEYS](https://downloads.apache.org/dubbo/KEYS) file to verify the download.

> GitHub: https://github.com/apache/dubbo-spi-extensions\
> Release notes: https://github.com/apache/dubbo-spi-extensions/releases
>

## Dubbo SPI Extensions 1.0.3 (2022-11-28)

#### Source Release

* [source](https://www.apache.org/dyn/closer.lua/dubbo/dubbo-spi-extensions/1.0.2/apache-dubbo-extensions-1.0.2-src.zip) |
  [asc](https://www.apache.org/dyn/closer.lua/dubbo/dubbo-spi-extensions/1.0.2/apache-dubbo-extensions-1.0.2-src.zip.asc) |
  [sha512](https://www.apache.org/dyn/closer.lua/dubbo/dubbo-spi-extensions/1.0.2/apache-dubbo-extensions-1.0.2-src.zip.sha512)

#### Maven Release

```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>${component_name}</artifactId>
  <version>${component_version}</version>
</dependency>
```

#### Included Components

- dubbo-cluster-extensions
  - dubbo-cluster-broadcast-1:1.0.1
  - dubbo-cluster-loadbalance-peakewma:1.0.1
  - dubbo-cluster-specify-address-dubbo3:1.0.1
  - dubbo-cluster-specify-address-dubbo2:1.0.1
- dubbo-filter-extensions
  - dubbo-filter-seata:1.0.1
- dubbo-configcenter-extensions
  - dubbo-configcenter-consul:1.0.1
  - dubbo-configcenter-etcd:1.0.1
- dubbo-metadata-report-extensions
  - dubbo-metadata-report-consul:1.0.1
- dubbo-remoting-extensions
  - dubbo-remoting-etcd3:1.0.1
  - dubbo-metadata-report-etcd:1.0.1
  - dubbo-remoting-quic:1.0.1
  - dubbo-remoting-grizzly:1.0.1
  - dubbo-remoting-mina:1.0.1
  - dubbo-remoting-p2p:1.0.1
- dubbo-registry-extensions
  - dubbo-registry-dns:1.0.1
  - dubbo-registry-consul:1.0.1
  - dubbo-registry-etcd3:1.0.1
  - dubbo-remoting-redis:1.0.1
  - dubbo-registry-redis:1.0.1
  - dubbo-registry-sofa:1.0.1
  - dubbo-registry-nameservice:1.0.0
- dubbo-rpc-extensions
  - dubbo-rpc-native-thrift:1.0.1
  - dubbo-rpc-http:1.0.1
  - dubbo-rpc-webservice:1.0.1
  - dubbo-rpc-rmi:1.0.1
  - dubbo-rpc-hessian:1.0.1
  - dubbo-rpc-memcached:1.0.1
  - dubbo-rpc-redis:1.0.1
  - dubbo-rpc-rocketmq:1.0.0
- dubbo-serialization-extensions
  - dubbo-serialization-native-hessian:1.0.1
  - dubbo-serialization-protostuff
  - dubbo-serialization-protobuf:1.0.1
  - dubbo-serialization-kryo:1.0.1
  - dubbo-serialization-gson:1.0.1
  - dubbo-serialization-fst:1.0.1
  - dubbo-serialization-fastjson:1.0.1
  - dubbo-serialization-avro:1.0.1
  - dubbo-serialization-msgpack:1.0.1

## All Dubbo SPI Extensions status

### dubbo-cluster

| Module | Version Number | Adapted to Dubbo Version |
| --- |-------|---------------|
| dubbo-cluster-broadcast-1 | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-cluster-loadbalance-peakewma | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-cluster-specify-address-dubbo2 | 1.0.1 | 2.7.x |
| dubbo-cluster-specify-address-dubbo3 | 1.0.1 | 3.x.x |

### dubbo-configcenter

| Module | Version Number | Adapted to Dubbo Version |
| --- |-------|---------------|
| dubbo-configcenter-consul | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-configcenter-etcd | 1.0.1 | 2.7.x ~ 3.x.x |

### dubbo-filter

| Module | Version Number | Adapted to Dubbo Version |
| --- |-------|---------------|
| dubbo-filter-seata | 1.0.1 | 2.7.x ~ 3.x.x |

### dubbo-metadata-report

| Module | Version Number | Adapted to Dubbo Version |
| --- |-------|---------------|
| dubbo-metadata-report-consul | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-metadata-report-etcd | 1.0.1 | 2.7.x ~ 3.x.x |

### dubbo-registry

| Module | Version Number | Adapted to Dubbo Version |
| --- |-------|---------------|
| dubbo-registry-dns | 1.0.1 | 3.0.1 ~ 3.0.5 |
| dubbo-registry-kubernetes | 1.0.1 | 3.0.1 ~ 3.0.5 |
| dubbo-registry-xds | 1.0.1 | 3.0.1 ~ 3.0.5 |
| dubbo-registry-consul | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-registry-etcd3 | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-registry-redis | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-registry-sofa | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-registry-nameservice | 1.0.0 | 2.7.x ~ 3.x.x |

### dubbo-remoting

| Module | Version Number | Adapted to Dubbo Version |
| --- |-------|---------------|
| dubbo-remoting-quic | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-remoting-etcd3 | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-remoting-grizzly | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-remoting-mina | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-remoting-p2p | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-remoting-redis | 1.0.1 | 2.7.x ~ 3.x.x |

### dubbo-rpc

| Module | Version Number | Adapted to Dubbo Version |
| --- |-------|---------------|
| dubbo-rpc-native-thrift | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-rpc-http | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-rpc-webservice | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-rpc-rmi | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-rpc-hessian | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-rpc-memcached | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-rpc-redis | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-rpc-rocketmq | 1.0.0 | 2.7.x ~ 3.x.x |

### dubbo-serialization

| Module | Version Number | Adapted to Dubbo Version |
| --- |-------|---------------|
| dubbo-serialization-protostuff | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-serialization-protobuf | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-serialization-kryo | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-serialization-gson | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-serialization-fst | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-serialization-fastjson | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-serialization-avro | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-serialization-hession | 1.0.1 | 2.7.x ~ 3.x.x |
| dubbo-serialization-msgpack | 1.0.1 | 2.7.x ~ 3.x.x |

### dubbo-plugin

| Module | Version Number | Adapted to Dubbo Version |
|----------------|-------|--------------|
| dubbo-api-docs | 
