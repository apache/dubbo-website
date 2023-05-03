---
aliases:
    - /zh/docs/references/xml/dubbo-registry/
description: dubbo:registry 配置
linkTitle: dubbo:registry
title: dubbo:registry
type: docs
weight: 1
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/config/properties/#registry)。
{{% /pageinfo %}}

注册中心配置。对应的配置类： `org.apache.dubbo.config.RegistryConfig`。同时如果有多个不同的注册中心，可以声明多个 `<dubbo:registry>` 标签，并在 `<dubbo:service>` 或 `<dubbo:reference>` 的 `registry` 属性指定使用的注册中心。

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | 可选 | | 配置关联 | 注册中心引用BeanId，可以在&lt;dubbo:service registry=""&gt;或&lt;dubbo:reference registry=""&gt;中引用此ID | 1.0.16以上版本 |
| address | &lt;host:port&gt; | string | <b>必填</b> | | 服务发现 | 注册中心服务器地址，如果地址没有端口缺省为9090，同一集群内的多个地址用逗号分隔，如：ip:port,ip:port，不同集群的注册中心，请配置多个&lt;dubbo:registry&gt;标签 | 1.0.16以上版本 |
| protocol | &lt;protocol&gt; | string | 可选 | dubbo | 服务发现 | 注册中心地址协议，支持`dubbo`, `multicast`, `zookeeper`, `redis`, `consul(2.7.1)`, `sofa(2.7.2)`, `etcd(2.7.2)`, `nacos(2.7.2)`等协议 | 2.0.0以上版本 |
| port | &lt;port&gt; | int | 可选 | 9090 | 服务发现 | 注册中心缺省端口，当address没有带端口时使用此端口做为缺省值 | 2.0.0以上版本 |
| username | &lt;username&gt; | string | 可选 | | 服务治理 | 登录注册中心用户名，如果注册中心不需要验证可不填 | 2.0.0以上版本 |
| password | &lt;password&gt; | string | 可选 | | 服务治理 | 登录注册中心密码，如果注册中心不需要验证可不填 | 2.0.0以上版本 |
| transport | registry.transporter | string | 可选 | netty | 性能调优 | 网络传输方式，可选mina,netty | 2.0.0以上版本 |
| timeout | registry.timeout | int | 可选 | 5000 | 性能调优 | 注册中心请求超时时间(毫秒) | 2.0.0以上版本 |
| session | registry.session | int | 可选 | 60000 | 性能调优 | 注册中心会话超时时间(毫秒)，用于检测提供者非正常断线后的脏数据，比如用心跳检测的实现，此时间就是心跳间隔，不同注册中心实现不一样。 | 2.1.0以上版本 |
| file | registry.file | string | 可选 | | 服务治理 | 使用文件缓存注册中心地址列表及服务提供者列表，应用重启时将基于此文件恢复，注意：两个注册中心不能使用同一文件存储 | 2.0.0以上版本 |
| wait | registry.wait | int | 可选 | 0 | 性能调优 | 停止时等待通知完成时间(毫秒) | 2.0.0以上版本 |
| check | check | boolean | 可选 | true | 服务治理 | 注册中心不存在时，是否报错 | 2.0.0以上版本 |
| register | register | boolean | 可选 | true | 服务治理 | 是否向此注册中心注册服务，如果设为false，将只订阅，不注册 | 2.0.5以上版本 |
| subscribe | subscribe | boolean | 可选 | true | 服务治理 | 是否向此注册中心订阅服务，如果设为false，将只注册，不订阅 | 2.0.5以上版本 |
| dynamic | dynamic | boolean | 可选 | true | 服务治理 | 服务是否动态注册，如果设为false，注册后将显示为disable状态，需人工启用，并且服务提供者停止时，也不会自动取消注册，需人工禁用。 | 2.0.5以上版本 |
| group | group | string | 可选 | dubbo | 服务治理 | 服务注册分组，跨组的服务不会相互影响，也无法相互调用，适用于环境隔离。 | 2.0.5以上版本 |
| simplified | simplified | boolean | 可选 | false | 服务治理 | 注册到注册中心的URL是否采用精简模式的（与低版本兼容） | 2.7.0以上版本 |
| extra-keys | extraKeys | string | 可选 |  | 服务治理 | 在simplified=true时，extraKeys允许你在默认参数外将额外的key放到URL中，格式："interface,key1,key2"。 | 2.7.0以上版本 |
