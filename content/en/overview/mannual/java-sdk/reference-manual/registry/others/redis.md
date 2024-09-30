---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/registry/redis/
    - /en/docs3-v2/java-sdk/reference-manual/registry/redis/
    - /en/overview/what/ecosystem/registry/redis/
    - /en/overview/mannual/java-sdk/reference-manual/registry/redis/
description: Basic usage and working principle of the Redis registry.
linkTitle: Redis
title: Redis
type: docs
weight: 5
---



## Prerequisites
* Understand [Dubbo basic development steps](/en/overview/mannual/java-sdk/quick-start/starter/)
* Install and start the [Redis](http://redis.io) service

## Instructions

### Add Dependency

Starting from Dubbo3, the Redis registry adaptation is no longer embedded in Dubbo and needs to be separately introduced as an independent [module](/en/download/spi-extensions/#dubbo-registry).

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-registry-redis</artifactId>
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

### Other Configuration Items

* You can set the prefix for the keys in Redis with `<dubbo:registry group="dubbo" />`, default is `dubbo`.
* You can set the Redis cluster policy with `<dubbo:registry cluster="replicate" />`, default is `failover`:
    * `failover`: Only write and read from any one, retry another on failure, data synchronization needs to be configured on the server side.
    * `replicate`: Write to all servers simultaneously from the client, read from one, no synchronization needed on the server side, the registration center cluster increases and so does performance pressure.


## Working Principle

The registry is implemented based on Redis [^1].

Redis expired data is detected for dirty data through heartbeat; server time must be synchronized and there is certain pressure on the server, otherwise the expiration detection may be inaccurate.

![/user-guide/images/dubbo-redis-registry.jpg](/imgs/user/dubbo-redis-registry.jpg)

Using Redis’s Key/Map structure to store data:

* The main Key is the service name and type.
* The Key in the Map is the URL address.
* The Value in the Map is the expiration time, used to determine dirty data, dirty data is deleted by the monitoring center [^3].

Using Redis’s Publish/Subscribe event to notify data changes:

* Distinguish event types through the event value: `register`, `unregister`, `subscribe`, `unsubscribe`.
* Ordinary consumers subscribe directly to the Key of the specified service provider, only receiving `register`, `unregister` events for that service.
* The monitoring center subscribes to `/dubbo/*` through `psubscribe`, receiving all change events for all services.

Call process:

0. When the service provider starts, it adds the current provider's address under `Key:/dubbo/com.foo.BarService/providers`.
1. And sends the `register` event to `Channel:/dubbo/com.foo.BarService/providers`.
2. When the service consumer starts, it subscribes to `register` and `unregister` events from `Channel:/dubbo/com.foo.BarService/providers`.
3. And adds the current consumer's address under `Key:/dubbo/com.foo.BarService/consumers`.
4. The service consumer retrieves the provider address list from `Key:/dubbo/com.foo.BarService/providers` after receiving `register` and `unregister` events.
5. When the service monitoring center starts, it subscribes to `register`, `unregister`, `subscribe`, and `unsubscribe` events from `Channel:/dubbo/*`.
6. The service monitoring center retrieves the provider address list from `Key:/dubbo/com.foo.BarService/providers` after receiving `register` and `unregister` events.
7. The service monitoring center retrieves the consumer address list from `Key:/dubbo/com.foo.BarService/consumers` after receiving `subscribe` and `unsubscribe` events.

