---
type: docs
title: "Host Address Custom Exposure"
linkTitle: "Host address custom exposure"
weight: 3
description: "Custom Dubbo service exposed host address"
---

## Feature description

In Dubbo, Provider mainly does two things when it starts
- One is to start the server
- The second is to register the service with the registration center. When starting the server, the socket needs to be bound, and when the service is registered with the registration center, the unique service address of the socket needs to be sent.

1. What is the default `host` when `host` is not set in `dubbo`?
2. How to specify the `host` of the service in `dubbo`, can we use hostname or domain instead of IP address as `host`?
3. When using docker, sometimes it is necessary to set port mapping. At this time, the socket bound when starting the server and the socket registered with the registration center use different port numbers. How to set it at this time?

## scenes to be used
## How to use
### Default host when no host is set

The general dubbo protocol configuration is as follows:
```xml
    ...
    <dubbo:protocol name="dubbo" port="20890" />
    ...
```

It can be seen that only the port number is configured, and the host is not configured. What is the host set at this time?

Looking at the code, it is found that in `org.apache.dubbo.config.ServiceConfig#findConfigedHosts()`, the default host is obtained through `InetAddress.getLocalHost().getHostAddress()`. Its return value is as follows:

1. When not connected to the Internet, return 127.0.0.1
2. In the Alibaba Cloud server, return the private address, such as: 172.18.46.234
3. When testing locally, return the public address, such as: 30.5.10.11

### Specify the socket of the service

Besides, you can configure `host` through `dubbo.protocol` or `dubbo.provider`’s `host` property, which supports IP address and domain name, as follows:

```xml
    ...
    <dubbo:protocol name="dubbo" port="20890" host="www.example.com"/>
    ...
```

### socket uses a different port number

See [dubbo set host by environment variable](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-docker)

Some deployment scenarios need to dynamically specify the address of the service registration, such as the docker bridge network mode to specify the registration host ip to achieve external network communication. dubbo provides two pairs of system properties in the startup phase, which are used to set the ip and port addresses for external communication.

* **DUBBO_IP_TO_REGISTRY**: Register to the ip address of the registration center
* **DUBBO_PORT_TO_REGISTRY**: Register to the port of the registry center
* **DUBBO_IP_TO_BIND**: Listening ip address
* **DUBBO_PORT_TO_BIND**: Listening port

The above four configuration items are optional. If you do not configure dubbo, it will automatically obtain the ip and port. Please choose the configuration flexibly according to the specific deployment scenario.
dubbo supports multiple protocols. If an application exposes multiple different protocol services at the same time, and you need to specify an ip or port for each service separately, please add a protocol prefix before the above attributes. Such as:

* **HESSIAN_DUBBO_PORT_TO_BIND**: port bound by hessian protocol
* **DUBBO_DUBBO_PORT_TO_BIND**: port bound by dubbo protocol
* **HESSIAN_DUBBO_IP_TO_REGISTRY**: ip registered by hessian protocol
* **DUBBO_DUBBO_IP_TO_REGISTRY**: ip registered by dubbo protocol

PORT_TO_REGISTRY or IP_TO_REGISTRY will not be used as default PORT_TO_BIND or IP_TO_BIND, but the reverse is true. Such as:

* Set `PORT_TO_REGISTRY=20881` and `IP_TO_REGISTRY=30.5.97.6`, then `PORT_TO_BIND` and `IP_TO_BIND` will not be affected
* Set `PORT_TO_BIND=20881` and `IP_TO_BIND=30.5.97.6`, then default `PORT_TO_REGISTRY=20881` and `IP_TO_REGISTRY=30.5.97.6`

### Summarize

1. You can configure `host` through the `host` attribute of `dubbo.protocol` or `dubbo.provider`, and support IP addresses and domain names. But at this time, the IP address registered to the registration center and the listening IP address are the same value
2. In order to solve the problem that the consumer cannot communicate with the provider in the virtual environment or LAN, you can set the IP address registered to the registration center and the listening IP address respectively through environment variables, and its priority is higher than `dubbo.protocol` or `dubbo. provider`s `host` configuration

### refer to

1. [Proposal: support hostname or domain in service discovery.](https://github.com/apache/dubbo/issues/2043)
2. [dubbo sets host through environment variables](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-docker)