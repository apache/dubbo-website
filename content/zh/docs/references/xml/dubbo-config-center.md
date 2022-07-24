---
type: docs
title: "dubbo:config-center"
linkTitle: "dubbo:config-center"
weight: 1
description: "dubbo:config-center 配置"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/config/properties/#config-center)。
{{% /pageinfo %}}

配置中心。对应的配置类：`org.apache.dubbo.config.ConfigCenterConfig`

| 属性             | 对应URL参数            | 类型                | 是否必填 | 缺省值           | 描述                                                         | 兼容性 |
| ---------------- | ---------------------- | ------------------- | -------- | ---------------- | ------------------------------------------------------------ | ------ |
| protocol         | config.protocol        | string              | 可选     | zookeeper        | 使用哪个配置中心：apollo、zookeeper、nacos等。<br />以zookeeper为例<br />1. 指定protocol，则address可以简化为`127.0.0.1:2181`；<br />2. 不指定protocol，则address取值为`zookeeper://127.0.0.1:2181` | 2.7.0+ |
| address          | config.address         | string              | 必填     |                  | 配置中心地址。<br />取值参见protocol说明                     | 2.7.0+ |
| highest-priority  | config.highestPriority | boolean             | 可选     | true             | 来自配置中心的配置项具有最高优先级，即会覆盖本地配置项。     | 2.7.0+ |
| namespace        | config.namespace       | string              | 可选     | dubbo            | 通常用于多租户隔离，实际含义视具体配置中心而不同。<br />如：<br />zookeeper - 环境隔离，默认值`dubbo`；<br />apollo - 区分不同领域的配置集合，默认使用`dubbo`和`application` | 2.7.0+ |
| cluster          | config.cluster         | string              | 可选     |                  | 含义视所选定的配置中心而不同。<br />如Apollo中用来区分不同的配置集群 | 2.7.0+ |
| group            | config.group           | string              | 可选     | dubbo            | 含义视所选定的配置中心而不同。<br />nacos - 隔离不同配置集<br />zookeeper - 隔离不同配置集 | 2.7.0+ |
| check            | config.check           | boolean             | 可选     | true             | 当配置中心连接失败时，是否终止应用启动。                     | 2.7.0+ |
| config-file       | config.configFile      | string              | 可选     | dubbo.properties | 全局级配置文件所映射到的key<br />zookeeper - 默认路径/dubbo/config/dubbo/dubbo.properties<br />apollo - dubbo namespace中的dubbo.properties键 | 2.7.0+ |
| timeout          | config.timeout         | integer             |          | 3000ms           | 获取配置的超时时间                                           | 2.7.0+ |
| username         |                        | string              |          |                  | 如果配置中心需要做校验，用户名<br />Apollo暂未启用           | 2.7.0+ |
| password         |                        | string              |          |                  | 如果配置中心需要做校验，密码<br />Apollo暂未启用             | 2.7.0+ |
| parameters       |                        | Map<string, string> |          |                  | 扩展参数，用来支持不同配置中心的定制化配置参数               | 2.7.0+ |
| include-spring-env |                        | boolean             | 可选     | false            | 使用Spring框架时支持，为true时，会自动从Spring Environment中读取配置。<br />默认依次读取<br />key为dubbo.properties的配置<br />key为dubbo.properties的PropertySource | 2.7.0+ |
