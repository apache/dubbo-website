---
description: Basic usage and working principles of the Etcd registry.
linkTitle: Etcd
title: Etcd
type: docs
weight: 5
---



## Prerequisites
* Understand [basic development steps of Dubbo](/en/overview/mannual/java-sdk/quick-start/starter/)
* Install and start the Etcd service

## Instructions

### Adding Dependencies

Starting from Dubbo 3, the Etcd registry adapter is no longer embedded in Dubbo and needs to be included as a separate [module](/en/download/spi-extensions/#dubbo-registry).

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-registry-etcd</artifactId>
    <version>3.3.0</version>
</dependency>
```

### Basic Configuration
```xml
<dubbo:registry address="etcd://10.20.153.10:6379" />
```

or

```xml
<dubbo:registry address="etcd://10.20.153.10:6379?backup=10.20.153.11:6379,10.20.153.12:6379" />
```

or

```xml
<dubbo:registry protocol="etcd" address="10.20.153.10:6379" />
```

or

```xml
<dubbo:registry protocol="etcd" address="10.20.153.10:6379,10.20.153.11:6379,10.20.153.12:6379" />
```

