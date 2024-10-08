---
description: "More implementations of configuration center extensions, including etcd, consul, etc."
linkTitle: Extension Implementations
title: More Implementations of Configuration Center Extensions
type: docs
weight: 4
---

The Dubbo framework also provides default implementations for configuration centers such as etcd and consul.

## Etcd

The Etcd configuration center is maintained by the community ecosystem library, for more details see [](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-configcenter-extensions/dubbo-configcenter-etcd).

Add dependency:

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-configcenter-etcd</artifactId>
    <version>3.3.0</version>
</dependency>
```

Adjust configuration:

```yaml
dubbo
  config-center
    address: etcd://127.0.0.1:1111
```


## Consul

The Consul configuration center is maintained by the community ecosystem library, for more details see [](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-configcenter-extensions/dubbo-configcenter-consul).

Add dependency:

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-configcenter-consul</artifactId>
    <version>3.3.0</version>
</dependency>
```

Adjust configuration:

```yaml
dubbo
  config-center
    address: consul://127.0.0.1:1111
```
