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

* [source](https://www.apache.org/dyn/closer.lua/dubbo/dubbo-spi-extensions/1.0.1/apache-dubbo-extensions-1.0.1-src.zip) |
  [asc](https://www.apache.org/dyn/closer.lua/dubbo/dubbo-spi-extensions/1.0.1/apache-dubbo-extensions-1.0.1-src.zip.asc) |
  [sha512](https://www.apache.org/dyn/closer.lua/dubbo/dubbo-spi-extensions/1.0.1/apache-dubbo-extensions-1.0.1-src.zip.sha512)

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

## All Dubbo SPI Extensions status

### dubbo-cluster

| 模块 | 版本号   | 适配 Dubbo 版本   |
| --- |-------|---------------|
| dubbo-cluster-broadcast-1 | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-cluster-loadbalance-peakewma | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-cluster-specify-address-dubbo2 | 1.0.0 | 2.7.x |
| dubbo-cluster-specify-address-dubbo3 | 1.0.0 | 3.x.x |

### dubbo-configcenter

待发布

### dubbo-filter

待发布

### dubbo-metadata-report

待发布

### dubbo-registry

| 模块 | 版本号   | 适配 Dubbo 版本   |
| --- |-------|---------------|
| dubbo-registry-dns | 1.0.0 | 3.0.1 ~ 3.0.5 |
| dubbo-registry-kubernetes | 1.0.0 | 3.0.1 ~ 3.0.5 |
| dubbo-registry-xds | 1.0.0 | 3.0.1 ~ 3.0.5 |

### dubbo-remoting

| 模块 | 版本号   | 适配 Dubbo 版本   |
| --- |-------|---------------|
| dubbo-remoting-quic | 1.0.0 | 2.7.x ~ 3.x.x |

### dubbo-rpc

| 模块 | 版本号   | 适配 Dubbo 版本   |
| --- |-------|---------------|
| dubbo-rpc-native-thrift | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-rpc-http | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-rpc-webservice | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-rpc-rmi | 1.0.0 | 2.7.x ~ 3.x.x |

### dubbo-serialization

| 模块 | 版本号   | 适配 Dubbo 版本   |
| --- |-------|---------------|
| dubbo-serialization-protostuff | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-serialization-protobuf | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-serialization-kryo | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-serialization-gson | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-serialization-fst | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-serialization-fastjson | 1.0.0 | 2.7.x ~ 3.x.x |
| dubbo-serialization-avro | 1.0.0 | 2.7.x ~ 3.x.x |

### dubbo-plugin

| 模块             | 版本号   | 适配 Dubbo 版本  |
|----------------|-------|--------------|
| dubbo-api-docs | 1.0.0 | 2.7.x |