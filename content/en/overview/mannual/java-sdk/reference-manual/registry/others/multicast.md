---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/registry/multicast/
    - /en/docs3-v2/java-sdk/reference-manual/registry/multicast/
    - /en/overview/mannual/java-sdk/reference-manual/registry/multicast/
description: Multicast broadcast registry center (for development phase use only).
linkTitle: Multicast
title: Multicast
type: docs
weight: 4
---






The Multicast registry center does not require starting any central node; as long as the broadcast addresses are the same, they can discover each other.

![/user-guide/images/multicast.jpg](/imgs/user/multicast.jpg)

## 1 Usage Instructions

```xml
<dubbo:registry address="multicast://224.5.6.7:1234" />
```

or

```xml
<dubbo:registry protocol="multicast" address="224.5.6.7:1234" />
```
#### Note:
To reduce broadcast volume, Dubbo defaults to sending provider address information to consumers via unicast. If multiple consumer processes are started on one machine, the consumer must declare `unicast=false`, otherwise only one consumer will receive the message; when the provider and consumer run on the same machine, the consumer also needs to declare `unicast=false`, otherwise the consumer cannot receive messages, leading to the No provider available for the service exception:

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


## 2 Working Principle

### 2.1 Basic Process
0.  The provider broadcasts its address when starting
1.  The consumer broadcasts subscription requests when starting
2.  When the provider receives a subscription request, it unicasts its address to the subscriber; if `unicast=false` is set, it broadcasts to the subscriber
3.  The consumer connects to the address of the provider for RPC calls when it receives the provider address.

### 2.2 Usage Limitations
Multicast is limited by network structure and is only suitable for small-scale applications or use during the development phase. Multicast address range: 224.0.0.0 - 239.255.255.255

