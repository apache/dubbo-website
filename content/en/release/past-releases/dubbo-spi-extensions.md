---
type: docs
title: "Dubbo SPI Extensions"
linkTitle: "Dubbo SPI Extensions"
weight: 5
---

## Verify

You can follow the [steps](https://www.apache.org/info/verification) here, and use the [KEYS](https://downloads.apache.org/dubbo/KEYS) file to verify the download.

> GitHub: https://github.com/apache/dubbo-spi-extensions\
> Release notes: https://github.com/apache/dubbo-spi-extensions/releases
>

## Dubbo SPI Extensions 1.0.2 (2022-08-02)

#### Source Release

* [source](https://archive.apache.org/dist/dubbo/dubbo-spi-extensions/1.0.2/apache-dubbo-extensions-1.0.2-src.zip) |
  [asc](https://archive.apache.org/dist/dubbo/dubbo-spi-extensions/1.0.2/apache-dubbo-extensions-1.0.2-src.zip.asc) |
  [sha512](https://archive.apache.org/dist/dubbo/dubbo-spi-extensions/1.0.2/apache-dubbo-extensions-1.0.2-src.zip.sha512)

#### Maven Release

```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>${component_name}</artifactId>
  <version>${component_version}</version>
</dependency>
```

#### Included Components

- dubbo-configcenter-extensions
  - dubbo-configcenter-consul:1.0.0
  - dubbo-configcenter-etcd:1.0.0
- dubbo-filter-extensions
  - dubbo-filter-seata:1.0.0
- dubbo-metadata-report-extensions
  - dubbo-metadata-report-consul:1.0.0
  - dubbo-metadata-report-etcd:1.0.0
- dubbo-registry-extensions
  - dubbo-registry-consul:1.0.0
  - dubbo-registry-etcd3:1.0.0
  - dubbo-registry-redis:1.0.0
  - dubbo-registry-sofa:1.0.0
- dubbo-remoting-extensions
  - dubbo-remoting-etcd3:1.0.0
  - dubbo-remoting-grizzly:1.0.0
  - dubbo-remoting-mina:1.0.0
  - dubbo-remoting-p2p:1.0.0
  - dubbo-remoting-redis:1.0.0
- dubbo-rpc-extensions
  - dubbo-rpc-hessian:1.0.0
  - dubbo-rpc-memcached:1.0.0
  - dubbo-rpc-redis:1.0.0
- dubbo-serialization-extensions
  - dubbo-serialization-msgpack:1.0.0
  - dubbo-serialization-native-hession:1.0.0

## Dubbo SPI Extensions 1.0.1 (2022-03-14)

#### Source Release

* [source](https://archive.apache.org/dist/dubbo/dubbo-spi-extensions/1.0.1/apache-dubbo-extensions-1.0.1-src.zip) |
  [asc](https://archive.apache.org/dist/dubbo/dubbo-spi-extensions/1.0.1/apache-dubbo-extensions-1.0.1-src.zip.asc) |
  [sha512](https://archive.apache.org/dist/dubbo/dubbo-spi-extensions/1.0.1/apache-dubbo-extensions-1.0.1-src.zip.sha512)

#### Maven Release

```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>${component_name}</artifactId>
  <version>${component_version}</version>
</dependency>
```

#### Included Components

- dubbo-api-docs:1.0.0
- dubbo-cluster-extensions
  - dubbo-cluster-broadcast-1:1.0.0
  - dubbo-cluster-loadbalance-peakewma:.1.0.0
  - dubbo-cluster-specify-address-dubbo2:1.0.0
  - dubbo-cluster-specify-address-dubbo3:1.0.0
- dubbo-registry-extensions
  - dubbo-registry-dns:1.0.0
  - dubbo-registry-kubernetes:1.0.0
  - dubbo-registry-xds:1.0.0
- dubbo-remoting-extensions
  - dubbo-remoting-quic:1.0.0
- dubbo-rpc-extensions
  - dubbo-rpc-native-thrift:1.0.0
  - dubbo-rpc-http:1.0.0
  - dubbo-rpc-webservice:1.0.0
  - dubbo-rpc-rmi:1.0.0
- dubbo-serialization-extensions
  - dubbo-serialization-protostuff:1.0.0
  - dubbo-serialization-protobuf:1.0.0
  - dubbo-serialization-kryo:1.0.0
  - dubbo-serialization-gson:1.0.0
  - dubbo-serialization-fst:1.0.0
  - dubbo-serialization-fastjson:1.0.0
  - dubbo-serialization-avro:1.0.0