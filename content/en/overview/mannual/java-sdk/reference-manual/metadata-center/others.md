---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/metadata-center/redis/
    - /en/docs3-v2/java-sdk/reference-manual/metadata-center/redis/
    - /en/overview/what/ecosystem/metadata-center/redis/
description: "More metadata center extension implementations, including redis, etcd, consul, etc."
linkTitle: Extension Implementations
title: More Metadata Center Extension Implementations
type: docs
weight: 4
---

The Dubbo framework also provides default implementations for metadata center adapters such as Redis, etcd, and Consul.

## Redis

The Redis implementation is provided by the core library but requires the following dependency:

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

or

```properties
dubbo.metadata-report.address=redis://127.0.0.1:1111
```

## Etcd

The etcd metadata center is maintained by the community ecosystem library. For details, see [](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-metadata-report-extensions/dubbo-metadata-report-etcd).

Add the dependency:

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-metadata-report-etcd</artifactId>
    <version>3.3.0</version>
</dependency>
```

Adjust the configuration:

```yaml
dubbo
  metadata-report
    address: etcd://127.0.0.1:1111
```

## Consul

The Consul metadata center is maintained by the community ecosystem library. For details, see [](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-metadata-report-extensions/dubbo-metadata-report-consul).

Add the dependency:

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-metadata-report-consul</artifactId>
    <version>3.3.0</version>
</dependency>
```

Adjust the configuration:

```yaml
dubbo
  metadata-report
    address: consul://127.0.0.1:1111
```

