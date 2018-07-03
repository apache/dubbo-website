# Redis Registry Server

It is a registry server implementation [^2] based on redis [^1].

![/user-guide/images/dubbo-redis-registry.jpg](../../sources/images/dubbo-redis-registry.jpg)

Use key/map structure in redis to save the registration info:

* Main key for service name and type
* Key in the map is URL address
* Value in the map is the expiration time. Monitor center uses it to track and remove dirty data [^3]

Publish/Subscribe events in redis is leveraged for data change notification:

* Distinguish event type with event's value: `register`, `unregister`, `subscribe`, `unsubscribe`.
* Regular subscriber subscribes the particular key presenting service provider, then will receive `register` and `unregister` events fired from the specified service.
* Monitor center subscribes `/dubbo/*` via `psubscribe`, then will receive all change notifications from all services.

Procedure:

0. When service provider boots up, it adds its address under `Key:/dubbo/com.foo.BarService/providers`.
1. Then service provider sends `register` event to `Channel:/dubbo/com.foo.BarService/providers`
2. When service consumer boots up, it subscribe events `register` and `unregister` from `Channel:/dubbo/com.foo.BarService/providers`
3. Then service consumer add its address under `Key:/dubbo/com.foo.BarService/providers`
4. When service consumer receives events `register` and `unregister`, it will fetch provider's addresses from `Key:/dubbo/com.foo.BarService/providers`
5. When monitor center boots up, it subscribes events `register`, `unregister`, `subscribe`, and `unsubsribe`.
6. After monitor center receives `register` and `unregister`, it fetches provider's addresses from `Key:/dubbo/com.foo.BarService/providers`
7. After monitor center receives `subscribe` and `unsubscribe`, it fetches consumer's addresses from `Key:/dubbo/com.foo.BarService/consumers`

## Configuration

```xml
<dubbo:registry address="redis://10.20.153.10:6379" />
```

Or

```xml
<dubbo:registry address="redis://10.20.153.10:6379?backup=10.20.153.11:6379,10.20.153.12:6379" />
```

Or

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379" />
```

Or

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379,10.20.153.11:6379,10.20.153.12:6379" />
```

## Options

* Config key's prefix in redis via `<dubbo:registry group="dubbo" />`, the default value is `dubbo`.
* Config redis cluster strategy via `<dubbo:registry cluster="replicate" />`, the default value is `failover`:
    * `failover`: when read/write error happens, try another instance, require the cluster to support data replication.
    * `replicate`: client writes to all nodes of the cluster, but only peeks a random node for read. The cluster doesn't need to take care of data replication, but may require more nodes and higher performance for each node, compared to option 1.

## Declaration of Reliability

A home-brewed service registry server is used in Alibaba instead of redis server. Redis based registry center does not have long-run practice within Alibaba, therefore we cannot guarantee its reliability. This registry server implementation is provided for dubbo community, and its reliability relies on redis itself largely.

## Installation

Pls. refer to [redis install manual](http://dubbo.apache.org/books/dubbo-admin-book/install/redis.html) for how to install a redis based registry server. To set it up, specify `dubbo.registry.addrss` to `redis://127.0.0.1:6379` in `conf/dubbo.properties` for both provider and consumer (you can refer to [quick start](../../preface/usage.md)) after install a redis server.

[^1]: [Redis](http://redis.io) is a high performance KV cache server
[^2]: Support since `2.1.0`
[^3]: Heartbeat mechanism is used to detect the dirty data in redis. It requires time among servers must be sync in advanced, otherwise expiration check may inaccurate, plus, heartbeats may add extra pressure on servers.
