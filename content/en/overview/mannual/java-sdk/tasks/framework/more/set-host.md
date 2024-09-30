---
aliases:
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/others/set-host/
description: Customizing the host address exposed by Dubbo services
linkTitle: Host Configuration
title: Host Configuration
type: docs
weight: 37
---



## Background

In Dubbo, when a Provider starts, it does two main things: it starts the server and registers the service with the registry. When starting the server, it needs to bind the socket, and when registering the service with the registry, it also needs to send the socket's unique identifier as the service address.

1. What is the default `host` when `host` is not set in `dubbo`?
2. How do we specify the service's `host` in `dubbo`, can we use a hostname or domain instead of an IP address as `host`?
3. When using Docker, sometimes port mapping needs to be set, in this case, how should we set the socket bound during server startup and the socket registered with the registry to use different port numbers?

## Example
#### What is the default host when host is not set in dubbo

The general dubbo protocol configuration is as follows:
``` xml
    ...
    <dubbo:protocol name="dubbo" port="20890" />
    ...
```

It can be seen that only the port number is configured, and the host is not set. So what is the host set in this case?

Looking at the code, it is found that in `org.apache.dubbo.config.ServiceConfig#findConfigedHosts()`, the default host is obtained through `InetAddress.getLocalHost().getHostAddress()`. Its return values are as follows:

1. When not connected to the network, returns 127.0.0.1
2. On Alibaba Cloud servers, returns a private address, e.g., 172.18.46.234
3. When testing on localhost, returns a public address, e.g., 30.5.10.11

#### How to specify the service's socket in dubbo?

In addition, the `host` can be configured through the `dubbo.protocol` or `dubbo.provider` `host` attribute, supporting both IP addresses and domain names, as follows:

``` xml
    ...
    <dubbo:protocol name="dubbo" port="20890" host="www.example.com"/>
    ...
```

#### When using Docker, sometimes port mapping needs to be set, how should we configure it if the socket bound during server startup and the socket registered with the registry use different port numbers?

See [Setting host in Dubbo via environment variables](https://github.com/dubbo/dubbo-samples/tree/master/2-advanced/dubbo-samples-docker)

Some deployment scenarios require dynamically specifying the service registration address, such as specifying the IP of the host machine under the Docker bridge network mode to achieve external communication. Dubbo provides two pairs of system properties at startup for setting the communication IP and port address.

* **DUBBO_IP_TO_REGISTRY**: IP address registered with the registry
* **DUBBO_PORT_TO_REGISTRY**: Port registered with the registry
* **DUBBO_IP_TO_BIND**: Listening IP address
* **DUBBO_PORT_TO_BIND**: Listening port

All four configuration items are optional, if not configured, dubbo will automatically obtain the IP and port, please flexibly choose configurations based on specific deployment scenarios. 
Dubbo supports multiple protocols; if an application exposes multiple different protocol services and requires separate IP or port for each service, please add the protocol prefix to these properties. For example:

* **HESSIAN_DUBBO_PORT_TO_BIND**: Port bound to the Hessian protocol
* **DUBBO_DUBBO_PORT_TO_BIND**: Port bound to the Dubbo protocol
* **HESSIAN_DUBBO_IP_TO_REGISTRY**: IP registered for the Hessian protocol
* **DUBBO_DUBBO_IP_TO_REGISTRY**: IP registered for the Dubbo protocol

PORT_TO_REGISTRY or IP_TO_REGISTRY will not be used as the default PORT_TO_BIND or IP_TO_BIND, but the opposite is valid. For example:

* Setting `PORT_TO_REGISTRY=20881` and `IP_TO_REGISTRY=30.5.97.6` will not affect `PORT_TO_BIND` and `IP_TO_BIND`
* Setting `PORT_TO_BIND=20881` and `IP_TO_BIND=30.5.97.6` will default `PORT_TO_REGISTRY=20881` and `IP_TO_REGISTRY=30.5.97.6`

## Summary

1. The `host` can be configured through the `dubbo.protocol` or `dubbo.provider` `host` attributes, supporting IP addresses and domain names. However, the registered IP address and listening IP address will be the same value.
2. To solve communication issues between consumer and provider in virtual or local area network environments, you can set the registered IP address and listening IP address using environment variables, which have a higher priority than the `host` configuration in `dubbo.protocol` or `dubbo.provider`.

## References

1. [Proposal: support hostname or domain in service discovery.](https://github.com/apache/dubbo/issues/2043)
2. [Setting host in Dubbo via environment variables](https://github.com/dubbo/dubbo-samples/tree/master/2-advanced/dubbo-samples-docker)

