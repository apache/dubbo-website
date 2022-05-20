---
type: docs
title: "dubbo:registry"
linkTitle: "dubbo:registry"
weight: 1
description: "dubbo:registry element"
---

The configuration of the registry center. The corresponding class is `org.apache.dubbo.config.RegistryConfig`. If you have multiple different registries, you can declare multiple `<dubbo:registry>` tags, and then reference specified registry with `registry` property in `<dubbo:service>` or `<dubbo:reference>` tag.

| Attribute | Corresponding URL parameter | Type    | Required    | Default Value | Function                  | Description                              | Compatibility |
| --------- | --------------------------- | ------- | ----------- | ------------- | ------------------------- | ---------------------------------------- | ------------- |
| id        |                             | string  | False       |               | Configuration association | Bean Id of the registry center, can be referenced in &lt;dubbo:service registry=""&gt;or  &lt;dubbo:reference registry=""&gt; | Above 1.0.16  |
| address   | &lt;host:port&gt;           | string  | <b>True</b> |               | Service discovery         | The address of the registry center. If the address has no port, default port 9999 will be adopted. Multiple addresses within the same cluster use `,` to seperate, such as `ip:port,ip:port`. Multiple registries within different cluster, please configure different `dubbo:registry` tag. | Above 1.0.16  |
| protocol  | &lt;protocol&gt;            | string  | False       | dubbo         | Service discovery         | The protocol of the registry center. `dubbo`, `multicast`, `zookeeper`, `redis`, `consul(2.7.1)`, `sofa(2.7.2)`, `etcd(2.7.2)`, `nacos(2.7.2)` are available. | Above 2.0.0   |
| port      | &lt;port&gt;                | int     | False       | 9090          | Service discovery         | The default port of the registry. When the `address` has no port, this default port will be adopted. | Above 2.0.0   |
| username  | &lt;username&gt;            | string  | False       |               | Service governance        | The usename of the registry. Do not set it if the registry doesn't need validation. | Above 2.0.0   |
| password  | &lt;password&gt;            | string  | False       |               | Service governance        | The password of the registry. Do not set it if the registry doesn't need validation. | Above 2.0.0   |
| transport | registry.transporter        | string  | False       | netty         | Performance optimize      | mina, netty are available.               | Above 2.0.0   |
| timeout   | registry.timeout            | int     | False       | 5000          | Performance optimize      | The timeout(ms) of the request to registry. | Above 2.0.0   |
| session   | registry.session            | int     | False       | 60000         | Performance optimize      | The session timeout(ms) of the registry. It's used to check whether the providers are alive. It depends on the implement of the registry. For example, for HeartBeat implement, the timeout is the interval of two heart beats. | Above 2.1.0   |
| file      | registry.file               | string  | False       |               | Service governance        | The local file to cache the address list of registries and providers. When application restarts, it will restore the registries and providers. Please use different file for different registy. | Above 2.0.0   |
| wait      | registry.wait               | int     | False       | 0             | Performance optimize      | Stop wait for a notice completion time (ms) | Above 2.0.0 |
| check     | check                       | boolean | False       | true          | Service governance        | Whether throwing exception while the registry isn't existed. | Above 2.0.0   |
| register  | register                    | boolean | False       | true          | Service governance        | whether registering to the registry center. If false, just subscribing, not registering. | Above 2.0.5   |
| subscribe | subscribe                   | boolean | False       | true          | Service governance        | whether subscribing from the registry center. If false, just registering, not subscribing. | Above 2.0.5   |
| dynamic   | dynamic                     | boolean | False       | true          | Service governance        | Whether the service is registered dynamically. If false, services will be showed as `disable`, you need to enable it manually. And you also need to disable it when provider shut down. | Above 2.0.5   |
| group     | group                       | string  | False       | dubbo         | Service governance        | Service registration grouping, cross-group services will not affect each other, and can not be called each other, suitable for environmental isolation. | Above 2.0.5 |
| simplified| simplified                  | boolean | False       | false         | Service governance        | Registered with the registry URL whether to adopt the lean mode (compatible with low version) | Above 2.7.0 |
| extra-keys| extraKeys                   | string  | False       |               | Service governance        | In simplified = true, extraKeys allows you to outside the default arguments put additional key in the URL, format: "interface, key1, key2". | Above 2.7.0 |
