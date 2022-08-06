---
type: docs
title: "Dubbo SPI Extensions"
linkTitle: "Dubbo SPI Extensions"
weight: 5
---

## 验证

可以按照这里的[步骤](https://www.apache.org/info/verification), 利用[KEYS](https://downloads.apache.org/dubbo/KEYS)文件来验证下载。

> GitHub: https://github.com/apache/dubbo-spi-extensions \
> 发布说明: https://github.com/apache/dubbo-spi-extensions/releases
>

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
