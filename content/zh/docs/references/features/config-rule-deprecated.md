---
type: docs
title: "旧配置规则"
linkTitle: "旧配置规则"
weight: 35
description: "Dubbo 中旧版本的规则配置方式"
---

向注册中心写入动态配置覆盖规则。该功能通常由监控中心或治理中心的页面完成。

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("override://0.0.0.0/com.foo.BarService?category=configurators&dynamic=false&application=foo&timeout=1000"));
```

其中：

* `override://` 表示数据采用覆盖方式，支持 `override` 和 `absent`，可扩展，**必填**。
* `0.0.0.0` 表示对所有 IP 地址生效，如果只想覆盖某个 IP 的数据，请填入具体 IP，**必填**。
* `com.foo.BarService` 表示只对指定服务生效，**必填**。
* `category=configurators` 表示该数据为动态配置类型，**必填**。
* `dynamic=false` 表示该数据为持久数据，当注册方退出时，数据依然保存在注册中心，**必填**。
* `enabled=true` 覆盖规则是否生效，可不填，缺省生效。
* `application=foo` 表示只对指定应用生效，可不填，表示对所有应用生效。
* `timeout=1000` 表示将满足以上条件的 `timeout` 参数的值覆盖为 1000。如果想覆盖其它参数，直接加在 `override` 的 URL 参数上。

示例：

1. 禁用提供者：(通常用于临时踢除某台提供者机器，相似的，禁止消费者访问请使用路由规则)

    ```
    override://10.20.153.10/com.foo.BarService?category=configurators&dynamic=false&disbaled=true
    ```
    
2. 调整权重：(通常用于容量评估，缺省权重为 100)

    ```
    override://10.20.153.10/com.foo.BarService?category=configurators&dynamic=false&weight=200
    ```
    
3. 调整负载均衡策略：(缺省负载均衡策略为 random)

    ```
    override://10.20.153.10/com.foo.BarService?category=configurators&dynamic=false&loadbalance=leastactive
    ```
    
4. 服务降级：(通常用于临时屏蔽某个出错的非关键服务)

    ```
    override://0.0.0.0/com.foo.BarService?category=configurators&dynamic=false&application=foo&mock=force:return+null
    ```
    

{{% alert title="提示" color="primary" %}}
`2.2.0` 以上版本支持
{{% /alert %}}