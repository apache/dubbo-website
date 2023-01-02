---
type: docs
title: "Service Version"
linkTitle: "Service version"
weight: 1
description: "Configure multiple versions for the same service in Dubbo"
---

## Feature description
**Follow the steps below for version migration**

1. During low-stress periods, first upgrade half of the providers to the new version
2. Upgrade all consumers to the new version
3. Then upgrade the remaining half of the providers to the new version

#### Configuration
- Old and new versions of service providers
- New and old version service consumers

## scenes to be used
When an interface is implemented and an incompatible upgrade occurs, the version number can be used for transition, and services with different version numbers do not refer to each other.

## Reference use case

[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-version](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-version)

## How to use
### service provider
Old version service provider configuration
```xml
<dubbo:service interface="com.foo.BarService" version="1.0.0" />
```
New Version Service Provider Configuration
```xml
<dubbo:service interface="com.foo.BarService" version="2.0.0" />
```
### Service Consumer
Old version service consumer configuration
```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="1.0.0" />
```
New Version Service Consumer Configuration
```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="2.0.0" />
```
### Does not distinguish between versions
If you don't need to distinguish between versions, you can configure it in the following way
```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="*" />
```