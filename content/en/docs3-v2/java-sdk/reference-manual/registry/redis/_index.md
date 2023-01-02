---
type: docs
title: "Redis"
linkTitle: "Redis"
weight: 5
description: "The basic usage and working principle of the Redis registry."
---

## precondition
* Understand [Dubbo basic development steps](../../../quick-start/spring-boot/)
* Install and start the [Redis](http://redis.io) service

## Instructions for use

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

## options

* You can set the prefix of the key in redis through `<dubbo:registry group="dubbo" />`, the default is `dubbo`.
* The redis cluster strategy can be set via `<dubbo:registry cluster="replicate" />`, the default is `failover`:
  * `failover`: Only write and read any one, and retry another one when it fails, the server needs to configure data synchronization by itself
  * `replicate`: Write to all servers at the same time on the client side, only read a single server, the server side does not need to be synchronized, the registration center cluster increases, and the performance pressure will also be greater


## working principle

A registry implemented based on Redis [^1].

Redis expired data detects dirty data through heartbeat, the server time must be synchronized, and there is a certain pressure on the server, otherwise the expiration detection will be inaccurate

![/user-guide/images/dubbo-redis-registry.jpg](/imgs/user/dubbo-redis-registry.jpg)

Use Redis's Key/Map structure to store data structures:

* The main key is the service name and type
* The Key in the Map is the URL address
* The Value in the Map is the expiration time, which is used to judge dirty data, and the dirty data will be deleted by the monitoring center [^3]

Use Redis's Publish/Subscribe events to notify data changes:

* Differentiate the event type by the value of the event: `register`, `unregister`, `subscribe`, `unsubscribe`
* Ordinary consumers directly subscribe to the Key of the specified service provider, and will only receive `register`, `unregister` events of the specified service
* The monitoring center subscribes to `/dubbo/*` through the `psubscribe` function, and will receive all change events of all services

Call process:

0. When the service provider starts, add the address of the current provider to `Key:/dubbo/com.foo.BarService/providers`
1. And send `register` event to `Channel:/dubbo/com.foo.BarService/providers`
2. When the service consumer starts, subscribe to `register` and `unregister` events from `Channel:/dubbo/com.foo.BarService/providers`
3. Add the address of the current consumer to `Key:/dubbo/com.foo.BarService/consumers`
4. After receiving the `register` and `unregister` events, the service consumer obtains the provider address list from `Key:/dubbo/com.foo.BarService/providers`
5. When the service monitoring center starts, subscribe to `register` and `unregister`, and `subscribe` and `unsubscribe` events from `Channel:/dubbo/*`
6. After receiving the `register` and `unregister` events, the service monitoring center obtains the provider address list from `Key:/dubbo/com.foo.BarService/providers`
7. After receiving the `subscribe` and `unsubscribe` events, the service monitoring center obtains the consumer address list from `Key:/dubbo/com.foo.BarService/consumers`