---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/metadata-center/redis/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/metadata-center/redis/
    - /zh-cn/overview/what/ecosystem/metadata-center/redis/
description: "更多元数据中心扩展实现，包括 redis、etcd、consul 等"
linkTitle: 扩展实现
title: 更多元数据中心扩展实现
type: docs
weight: 4
---

Dubbo 框架还默认提供了 redis、etcd、consul 等元数据中心适配实现

## Redis

Redis 实现由主干库提供内置实现，但需要增加以下依赖：

```xml
<dependency>
	<dependency>
      <groupId>redis.clients</groupId>
      <artifactId>jedis</artifactId>
      <version>3.10.0</version>
    </dependency>
</dependency>
```

```yaml
dubbo
  metadata-report
    address: redis://127.0.0.1:1111
```

或者

```properties
dubbo.metadata-report.address=redis://127.0.0.1:1111
```

## Etcd

Etcd 元数据中心由社区生态库维护，具体可参见 [](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-metadata-report-extensions/dubbo-metadata-report-etcd)。

增加依赖：

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-metadata-report-etcd</artifactId>
    <version>3.3.0</version>
</dependency>
```

调整配置：

```yaml
dubbo
  metadata-report
    address: etcd://127.0.0.1:1111
```


## Consul

Consul 元数据中心由社区生态库维护，具体可参见 [](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-metadata-report-extensions/dubbo-metadata-report-consul)。

增加依赖：

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-metadata-report-consul</artifactId>
    <version>3.3.0</version>
</dependency>
```

调整配置：

```yaml
dubbo
  metadata-report
    address: consul://127.0.0.1:1111
```