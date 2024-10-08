---
description: Basic use and working principles of the Consul registration center.
linkTitle: Consul
title: Consul
type: docs
weight: 5
---


## Prerequisites
* Understand [Dubbo basic development steps](/en/overview/mannual/java-sdk/quick-start/starter/)
* Install and start the [Consul](http://consul.io) service

## Instructions

### Add Dependencies

Starting from Dubbo 3, the Consul registration center adaptation is no longer embedded in Dubbo. It needs to be separately introduced with an independent [module](/en/download/spi-extensions/#dubbo-registry).

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-registry-consul</artifactId>
    <version>3.3.0</version>
</dependency>
```

### Basic Configuration
```xml
<dubbo:registry address="redis://10.20.153.10:6379" />
```

or

```xml
<dubbo:registry address="redis://10.20.153.10:6379?backup=10.20.153.11:6379,10.20.153.12:6379" />
```

or

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379" />
```

or

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379,10.20.153.11:6379,10.20.153.12:6379" />
```
