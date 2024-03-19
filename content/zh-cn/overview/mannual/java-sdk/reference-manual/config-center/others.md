---
description: "更多配置中心扩展实现，包括 etcd、consul 等"
linkTitle: 扩展实现
title: 更多配置中心扩展实现
type: docs
weight: 4
---

Dubbo 框架还默认提供了 etcd、consul 等配置中心适配实现。

## Etcd

Etcd 配置中心由社区生态库维护，具体可参见 [](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-configcenter-extensions/dubbo-configcenter-etcd)。

增加依赖：

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-configcenter-etcd</artifactId>
    <version>3.3.0</version>
</dependency>
```

调整配置：

```yaml
dubbo
  config-center
    address: etcd://127.0.0.1:1111
```


## Consul

Consul 配置中心由社区生态库维护，具体可参见 [](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-configcenter-extensions/dubbo-configcenter-consul)。

增加依赖：

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-configcenter-consul</artifactId>
    <version>3.3.0</version>
</dependency>
```

调整配置：

```yaml
dubbo
  config-center
    address: consul://127.0.0.1:1111
```