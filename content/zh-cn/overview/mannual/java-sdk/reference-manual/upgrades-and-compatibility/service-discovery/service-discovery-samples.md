---
aliases:
    - /zh/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-samples/
    - /zh-cn/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-samples/
description: 本文具体说明了用户在升级到 Dubbo 3.0 之后如何快速开启应用级服务发现新特性。
linkTitle: 应用级服务发现迁移示例
title: 应用级服务发现迁移示例
type: docs
weight: 5
---






应用级服务发现为应用间服务发现的协议，因此使用应用级服务发现需要消费端和服务端均升级到 Dubbo 3.0 版本并开启新特性（默认开启）才能在链路中使用应用级服务发现，真正发挥应用级服务发现的优点。
## 开启方式
### 服务端
应用升级到 Dubbo 3.0 后，服务端自动开启接口级 + 应用级双注册功能，默认无需开发者修改任何配置

### 消费端
应用升级到 Dubbo 3.0 后，消费端自动始接口级 + 应用级双订阅功能，默认无需开发者修改任何配置。建议在服务端都升级到 Dubbo 3.0 并开启应用级注册以后通过规则配置消费端关闭接口级订阅，释放对应的内存空间。

## 详细说明
### 服务端配置

1. 全局开关

应用配置（可以通过配置文件或者 -D 指定）`dubbo.application.register-mode` 为 instance（只注册应用级）、all（接口级+应用级均注册）开启全局的注册开关，配置此开关后，默认会向所有的注册中心中注册应用级的地址，供消费端服务发现使用。
> [参考示例](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-provider2/src/main/resources/dubbo.properties)

```
# 双注册
dubbo.application.register-mode=all
```
```
# 仅应用级注册
dubbo.application.register-mode=instance
```

2. 注册中心地址参数配置

注册中心的地址上可以配置 `registry-type=service` 来显示指定该注册中心为应用级服务发现的注册中心，带上此配置的注册中心将只进行应用级服务发现。
> [参考示例](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-demo-servicediscovery-xml/servicediscovery-provider/src/main/resources/spring/dubbo-provider.xml)

```xml
<dubbo:registry address="nacos://${nacos.address:127.0.0.1}:8848?registry-type=service"/>
```
### 消费端订阅模式
FORCE_INTERFACE：仅接口级订阅，行为和 Dubbo 2.7 及以前版本一致。
APPLICATION_FIRST：接口级 + 应用级多订阅，如果应用级能订阅到地址就使用应用级的订阅，如果订阅不到地址则使用接口级的订阅，以此保证迁移过程中最大的兼容性。（注：由于存在同时进行订阅的行为，此模式下内存占用会有一定的增长，因此在所有服务端都升级到 Dubbo 3.0 以后建议迁移到 FORCE_APPLICATION 模式降低内存占用）
FORCE_APPLICATION：仅应用级订阅，将只采用全新的服务发现模型。
### 消费端配置

1. 默认配置（不需要配置）

升级到 Dubbo 3.0 后默认行为为接口级+应用级多订阅，如果应用级能订阅到地址就使用应用级的订阅，如果订阅不到地址则使用接口级的订阅，以此保证最大的兼容性。

2. 订阅参数配置

应用配置（可以通过配置文件或者 -D 指定）`dubbo.application.service-discovery.migration` 为 `APPLICATION_FIRST` 可以开启多订阅模式，配置为 `FORCE_APPLICATION` 可以强制为仅应用级订阅模式。
具体接口订阅可以在 `ReferenceConfig` 中的 `parameters` 中配置 Key 为 `migration.step`，Value 为 `APPLICATION_FIRST` 或 `FORCE_APPLICATION` 的键值对来对单一订阅进行配置。
> [参考示例](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-consumer/src/test/java/org/apache/dubbo/demo/consumer/DemoServiceConfigIT.java)

```java
System.setProperty("dubbo.application.service-discovery.migration", "APPLICATION_FIRST");
```
```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<>(applicationModel.newModule());
referenceConfig.setInterface(DemoService.class);
referenceConfig.setParameters(new HashMap<>());
referenceConfig.getParameters().put("migration.step", mode);
return referenceConfig.get();
```

3. 动态配置（优先级最高，可以在运行时修改配置）

此配置需要基于配置中心进行推送，Key 为应用名 + `.migration` （如 `demo-application.migraion`），Group 为 `DUBBO_SERVICEDISCOVERY_MIGRATION`。规则体配置详见[接口级服务发现迁移至应用级服务发现指南](../migration-service-discovery/)。
> [参考示例](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-consumer/src/main/java/org/apache/dubbo/demo/consumer/UpgradeUtil.java)

```java
step: FORCE_INTERFACE
```
