---
type: docs
title: "Multicast"
linkTitle: "Multicast"
weight: 4
description: "Multicast broadcast registration center (use only in development stage)."
---

The Multicast registration center does not need to start any central nodes, as long as the broadcast address is the same, they can discover each other.

![/user-guide/images/multicast.jpg](/imgs/user/multicast.jpg)

## 1 Instructions for use

```xml
<dubbo:registry address="multicast://224.5.6.7:1234" />
```

or

```xml
<dubbo:registry protocol="multicast" address="224.5.6.7:1234" />
```
#### Notice:
In order to reduce the amount of broadcasting, Dubbo uses unicast to send provider address information to consumers by default.
If multiple consumer processes are started on a machine at the same time, the consumer must declare `unicast=false`, otherwise only one consumer can receive the message; when the server and the consumer run on the same machine, the consumer It is also necessary to declare `unicast=false`, otherwise the consumer cannot receive the message, resulting in No provider available for the service exception:

```xml
<dubbo:application name="demo-consumer">
    <dubbo:parameter key="unicast" value="false" />
</dubbo:application>
```

or

```xml
<dubbo:consumer>
    <dubbo:parameter key="unicast" value="false" />
</dubbo:consumer>
```


## 2 How it works

### 2.1 Basic process
0. The provider broadcasts its own address when it starts
1. Broadcast subscription request when consumer starts
2. When the provider receives the subscription request, it will unicast its own address to the subscribers. If `unicast=false` is set, it will broadcast to the subscribers
3. When the consumer receives the provider's address, it connects to the address to make an RPC call.

### 2.2 Restrictions on Use
Multicast is limited by the network structure and is only suitable for small-scale applications or development stages. Multicast address segment: 224.0.0.0 - 239.255.255.255