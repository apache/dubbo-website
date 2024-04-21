---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/metadata-center/nacos/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/metadata-center/nacos/
    - /zh-cn/overview/what/ecosystem/metadata-center/nacos/
description: Nacos 元数据中心基本使用与工作原理
linkTitle: Nacos
title: Nacos
type: docs
weight: 2
---






## 1 预备工作
- 了解 [Dubbo 基本开发步骤](/zh-cn/overview/mannual/java-sdk/quick-start/spring-boot/)
- 参考 [Nacos快速入门](https://nacos.io/zh-cn/docs/quick-start.html) 启动 Nacos server

> 当Dubbo使用`3.0.0`及以上版本时，需要使用Nacos `2.0.0`及以上版本

## 2 使用说明
Dubbo 融合 Nacos 成为元数据中心的操作步骤非常简单，大致分为 `增加 Maven 依赖` 以及 `配置元数据中心` 两步。
> 如果元数据地址(dubbo.metadata-report.address)也不进行配置，会使用注册中心的地址来用作元数据中心。

### 2.1 增加 Maven 依赖
如果项目已经启用 Nacos 作为注册中心，则无需增加任何额外配置。

如果未启用 Nacos 注册中心，则请参考 [为注册中心增加 Nacos 依赖](../../registry/nacos/#21-增加依赖)。

### 2.2 启用 Nacos 配置中心
```xml
<dubbo:metadata-report address="nacos://127.0.0.1:8848"/>
```

或者

```yaml
dubbo
  metadata-report
    address: nacos://127.0.0.1:8848
```

或者

```properties
dubbo.metadata-report.address=nacos://127.0.0.1:8848
```

或者

```java
MetadataReportConfig metadataConfig = new MetadataReportConfig();
metadataConfig.setAddress("nacos://127.0.0.1:8848");
```

`address` 格式请参考 [Nacos 注册中心 - 启用配置](../../registry/nacos/#22-配置并启用-nacos)

## 3 高级配置

完整配置参数请参考 [metadata-report-config](../../config/properties/#metadata-report-config)。

## 4 工作原理

### 4.1 [服务运维元数据](../overview/#2-服务运维元数据)

在 Nacos 的控制台上可看到服务提供者、消费者注册的服务运维相关的元数据信息：

![image-dubbo-metadata-nacos-1.png](/imgs/blog/dubbo-metadata-nacos-1.png)

在 Nacos 中，本身就存在配置中心这个概念，正好用于元数据存储。在配置中心的场景下，存在命名空间- namespace 的概念，在 namespace 之下，还存在 group 概念。即通过 namespace 和 group 以及 dataId 去定位一个配置项，在不指定 namespace 的情况下，默认使用 ```public``` 作为默认的命名空间。

```properties
Provider: namespace: 'public', dataId: '{service name}:{version}:{group}:provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:{version}:{group}:consumer:{application name}', group: 'dubbo'
```
当 version 或者 group 不存在时`:` 依然保留:
```properties
Provider: namespace: 'public', dataId: '{service name}:::provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:::consumer:{application name}', group: 'dubbo'
```

Providers接口元数据详情 (通过 `report-definition=true` 控制此部分数据是否需要上报)：

![image-dubbo-metadata-nacos-3.png](/imgs/blog/dubbo-metadata-nacos-3.png)

Consumers接口元信息详情（通过 `report-consumer-definition=true` 控制是否上报，默认 false）：

![image-dubbo-metadata-nacos-4.png](/imgs/blog/dubbo-metadata-nacos-4.png)

### 4.2 [地址发现 - 接口-应用映射](../overview//#11-接口---应用映射关系)
在上面提到，service name 和 application name 可能是一对多的，在 nacos 中，使用单个 key-value 进行保存，多个 application name 通过英文逗号`,`隔开。由于是单个 key-value 去保存数据，在多客户端的情况下可能会存在并发覆盖的问题。因此，我们使用 nacos 中 publishConfigCas 的能力去解决该问题。在 nacos 中，使用 publishConfigCas 会让用户传递一个参数 casMd5，该值的含义是之前配置内容的 md5 值。不同客户端在更新之前，先去查一次 nacos 的 content 的值，计算出 md5 值，当作本地凭证。在更新时，把凭证 md5 传到服务端比对 md5 值, 如果不一致说明在此期间被其他客户端修改过，重新获取凭证再进行重试(CAS)。目前如果重试6次都失败的话，放弃本次更新映射行为。

Nacos api:
```java
ConfigService configService = ...
configService.publishConfigCas(key, group, content, ticket);
```

映射信息位于 namespace: 'public', dataId: '{service name}', group: 'mapping'.

![nacos-metadata-report-service-name-mapping.png](/imgs/user/nacos-metadata-report-service-name-mapping.png)

### 4.3 [地址发现 - 接口配置元数据](../overview/#12-接口配置元数据)

要开启远程接口配置元数据注册，需在应用中增加以下配置，因为默认情况下 Dubbo3 应用级服务发现会启用服务自省模式，并不会注册数据到元数据中心。

```properties
 dubbo.application.metadata-type=remote
 ```

或者，在自省模式下仍开启中心化元数据注册

```properties
dubbo.application.metadata-type=local
dubbo.metadata-report.report-metadata=true
```

Nacos server 中的元数据信息详情如下：

![image-dubbo-metadata-nacos-2.png](/imgs/blog/dubbo-metadata-nacos-2.png)