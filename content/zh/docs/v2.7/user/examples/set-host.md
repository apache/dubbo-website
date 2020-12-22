---
type: docs
title: "主机配置"
linkTitle: "主机配置"
weight: 37
description: "自定义 Dubbo 服务对外暴露的主机地址"
---

## 背景

在 Dubbo 中， Provider 启动时主要做两个事情，一是启动 server，二是向注册中心注册服务。启动 server 时需要绑定 socket，向注册中心注册服务时也需要发送 socket 唯一标识服务地址。

1. `dubbo`中不设置`host`时默认`host`是什么?
2. 那在`dubbo`中如何指定服务的`host`,我们是否可以用hostname或domain代替IP地址作为`host`?
3. 在使用docker时,有时需要设置端口映射,此时,启动server时绑定的socket和向注册中心注册的socket使用不同的端口号,此时又该如何设置?

#### dubbo 中不设置 host 时默认 host 是什么

一般的 dubbo 协议配置如下:
``` xml
    ...
    <dubbo:protocol name="dubbo" port="20890" />
    ...
```

可以看到,只配置了端口号,没有配置 host，此时设置的 host 又是什么呢?

查看代码发现,在 `org.apache.dubbo.config.ServiceConfig#findConfigedHosts()` 中,通过 `InetAddress.getLocalHost().getHostAddress()` 获取默认 host。其返回值如下：

1. 未联网时，返回 127.0.0.1
2. 在阿里云服务器中，返回私有地址,如: 172.18.46.234
3. 在本机测试时，返回公有地址，如: 30.5.10.11

#### 那在 dubbo 中如何指定服务的 socket?

除此之外,可以通过 `dubbo.protocol` 或 `dubbo.provider `的 `host` 属性对 `host` 进行配置,支持IP地址和域名,如下:

``` xml
    ...
    <dubbo:protocol name="dubbo" port="20890" host="www.example.com"/>
    ...
```

####  在使用 docker 时，有时需要设置端口映射，此时，启动 server 时绑定的 socket 和向注册中心注册的 socket 使用不同的端口号，此时又该如何设置？

见 [dubbo 通过环境变量设置 host](https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-docker)

有些部署场景需要动态指定服务注册的地址，如 docker bridge 网络模式下要指定注册宿主机 ip 以实现外网通信。dubbo 提供了两对启动阶段的系统属性，用于设置对外通信的ip、port地址。

* DUBBO_IP_TO_REGISTRY --- 注册到注册中心的ip地址
* DUBBO_PORT_TO_REGISTRY --- 注册到注册中心的port端口
* DUBBO_IP_TO_BIND --- 监听ip地址
* DUBBO_PORT_TO_BIND --- 监听port端口

以上四个配置项均为可选项，如不配置 dubbo 会自动获取 ip 与端口，请根据具体的部署场景灵活选择配置。
dubbo 支持多协议，如果一个应用同时暴露多个不同协议服务，且需要为每个服务单独指定 ip 或 port，请分别在以上属性前加协议前缀。 如：

* HESSIAN_DUBBO_PORT_TO_BIND hessian协议绑定的port
* DUBBO_DUBBO_PORT_TO_BIND   dubbo协议绑定的port
* HESSIAN_DUBBO_IP_TO_REGISTRY hessian协议注册的ip
* DUBBO_DUBBO_PORT_TO_BIND     dubbo协议注册的ip

PORT_TO_REGISTRY 或 IP_TO_REGISTRY 不会用作默认 PORT_TO_BIND 或 IP_TO_BIND，但是反过来是成立的
如设置 PORT_TO_REGISTRY=20881 IP_TO_REGISTRY=30.5.97.6，则 PORT_TO_BIND IP_TO_BIND 不受影响
如果设置 PORT_TO_BIND=20881 IP_TO_BIND=30.5.97.6，则默认 PORT_TO_REGISTRY=20881 IP_TO_REGISTRY=30.5.97.6

## 总结

 1. 可以通过`dubbo.protocol`或`dubbo.provider`的`host`属性对`host`进行配置,支持IP地址和域名.但此时注册到注册中心的IP地址和监听IP地址是同一个值
 2. 为了解决在虚拟环境或局域网内consumer无法与provider通信的问题,可以通过环境变量分别设置注册到注册中心的IP地址和监听IP地址,其优先级高于`dubbo.protocol`或`dubbo.provider`的`host`配置

## 参考

 1. [Proposal: support hostname or domain in service discovery.](https://github.com/apache/dubbo/issues/2043)
 2. [dubbo通过环境变量设置host](https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-docker)
