---
type: docs
title: "Service Reference Configuration Object Cache"
linkTitle: "Service Reference Configuration Object Cache"
weight: 2
description: "Cache ReferenceConfig in Dubbo3"
---
## Feature description

The `ReferenceConfig` instance is heavy, encapsulates the connection to the registry and the connection to the provider, and needs to be cached. Otherwise repeatedly generating `ReferenceConfig` may cause performance problems and have memory and connection leaks. It's easy to overlook this problem when programming in the API way.

Therefore, since `2.4.0` version, dubbo provides a simple tool class `ReferenceConfigCache` for caching `ReferenceConfig` instances.
## scenes to be used

There are scenarios such as gateways that dynamically create subscriptions. Because ReferenceConfig itself is very heavy, it will create a lot of intermediate objects, and proxy itself can be reused, so the properties of this part can be cached through ReferenceConfigCache.

## How to use
### Eliminate and destroy
Eliminating the `ReferenceConfig` in the Cache will destroy the `ReferenceConfig` and release the corresponding resources.
```java
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>();
reference.setInterface(XxxService.class);
reference.setVersion("1.0.0");
 …
ReferenceConfigCache cache = ReferenceConfigCache. getCache();
// The reference object will be cached in the cache.get method, and the ReferenceConfig.get method will be called to start the ReferenceConfig
XxxService xxxService = cache. get(reference);
// Notice! The Cache will hold the ReferenceConfig, do not call the destroy method of the ReferenceConfig outside, causing the ReferenceConfig in the Cache to become invalid!
// Use the xxxService object
xxxService. sayHello();
```
```java
ReferenceConfigCache cache = ReferenceConfigCache. getCache();
cache.destroy(reference);
```
The default `ReferenceConfigCache` considers `ReferenceConfig` of the same service group, interface, and version to be the same, and caches a copy. That is, the service group, interface, and version are cached keys.

### Modify strategy
You can modify this strategy to pass a `KeyGenerator` when `ReferenceConfigCache.getCache`. See methods of the `ReferenceConfigCache` class for details.
```java
KeyGenerator keyGenerator = new...
ReferenceConfigCache cache = ReferenceConfigCache. getCache(keyGenerator);
```