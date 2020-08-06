# Multicast Registry

Multicast registry doesn't require to setup any central node. Just like IP address broadcast, dubbo service providers and consumers can discover each other through this mechanism.

![/user-guide/images/multicast.jpg](../../sources/images/multicast.jpg)

0. Service provider broadcasts its address when it boots up.
1. Service consumer broadcasts its subscription request when it boots up.
2. Once service provider receives subscription request, it unicasts its own address to the corresponding consumer, if `unicast=false` is set, then broadcast will be used instead.
3. When service consumer receives provider's address, it can start RPC invocation on the received address.

Multicast is limited to network topology, and is only suitable for development purpose or small deployment. The valid multcast addresses scope is: 224.0.0.0 - 239.255.255.255.

## Configuration

```xml
<dubbo:registry address="multicast://224.5.6.7:1234" />
```

Or

```xml
<dubbo:registry protocol="multicast" address="224.5.6.7:1234" />
```

In order to avoid multicast as much as possible, dubbo uses unicast for address information from service provider to service consumer, if there are multiple consumer processes on one single machine, consumers need to set `unicast=false`, otherwise only one consumer can be able to receive the address info:

```xml
<dubbo:registry address="multicast://224.5.6.7:1234?unicast=false" />
```

Or

```xml
<dubbo:registry protocol="multicast" address="224.5.6.7:1234">
    <dubbo:parameter key="unicast" value="false" />
</dubbo:registry>
```