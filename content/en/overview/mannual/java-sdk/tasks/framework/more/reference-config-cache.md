---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/reference-config-cache/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/reference-config-cache/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/reference-config-cache/
description: Caching ReferenceConfig in Dubbo
linkTitle: Service Reference Configuration Object Cache
title: Service Reference Configuration Object Cache
type: docs
weight: 50
---




   
## Function Description

`ReferenceConfig` instances are heavy because they encapsulate the connections to the registry and the providers, necessitating caching. Otherwise, repeatedly generating `ReferenceConfig` can lead to performance issues and memory and connection leaks. This problem is often overlooked in API-oriented programming.

Therefore, starting from version `2.4.0`, Dubbo provides a simple utility class `ReferenceConfigCache` for caching `ReferenceConfig` instances.

## Usage Scenarios

In scenarios such as gateways where subscriptions are dynamically created, the `ReferenceConfig` itself is heavy and creates many intermediate objects, while the proxy can be reused. Hence, `ReferenceConfigCache` can cache these properties.

## Usage Method

### Eviction and Destruction
Evict `ReferenceConfig` from the Cache, which will destroy the `ReferenceConfig` and release corresponding resources.
```java  
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>();  
reference.setInterface(XxxService.class);  
reference.setVersion("1.0.0");  
......  
ReferenceConfigCache cache = ReferenceConfigCache.getCache();  
// The cache.get method will cache the Reference object and invoke ReferenceConfig.get to start ReferenceConfig  
XxxService xxxService = cache.get(reference);  
// Note! The cache will hold the ReferenceConfig, do not call the destroy method of ReferenceConfig externally, as this will invalidate the ReferenceConfig in the cache!  
// Use xxxService object  
xxxService.sayHello();  
```  
```java  
ReferenceConfigCache cache = ReferenceConfigCache.getCache();  
cache.destroy(reference);  
```   
By default, `ReferenceConfigCache` treats `ReferenceConfig` with the same service Group, interface, and version as identical, caching only one. The service Group, interface, and version serve as the cache key.

### Modification Strategy
This strategy can be modified by passing a `KeyGenerator` when calling `ReferenceConfigCache.getCache`. Refer to the methods in `ReferenceConfigCache` class for more details.
```java  
KeyGenerator keyGenerator = new ...  
ReferenceConfigCache cache = ReferenceConfigCache.getCache(keyGenerator);  
```
