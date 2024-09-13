---
description: "Dubbo 多实例相关领域模型与概念"
linkTitle: 模型与概念
title: 多实例相关的模型与概念定义
type: docs
weight: 3
---

## Dubbo 架构

JVM —— 虚拟机层
目的：Dubbo 框架之间完全隔离（端口不能复用）

Dubbo Framework —— 框架层
目的：将需要全局缓存的进行复用（端口、序列化等）

Application —— 应用层
目的：隔离应用之间的信息，包括注册中心、配置中心、元数据中心

Services —— 模块层
目的：提供热加载能力，可以按 ClassLoader、Spring Context 进行隔离上下文

## Dubbo 概念对齐

1. DubboBoorstrap
   1. 需要拆分 export/refer services、ServiceInstance、Metadata/Config 等 Client
2. ConfigManager
   1. 需要拆分应用级配置信息、模块级配置信息
3. ApplicationModel
   1. 实际存储应用层信息，持有到 ConfigManager 应用级配置信息的引用
4. ConsumerModel
   1. 实际存储接口信息，由 ModuleModel 持有引用
5. ProviderModel
   1. 实际存储接口信息，由 ModuleModel 持有引用
6. ExtensionLoader
   1. 需要根据不同层级 load 出不同的实例对象
7. Registry
   1. 应用级别共享，需要确保多实例订阅正常（考虑单元化场景）
8. Router / Filter
   1. 模块级别共享
9. Protocol / Remoting
   1. 框架级别共享，复用 IO，多应用间贡献
10. Metadata
   1. 应用级别共享，考虑应用级服务发现
11. QoS
   1. 框架级别共享，与 IO 有关
12. Serialization
   1. 框架级别共享，与 IO 有关
13. ConfigCenter
   1. 应用级别贡献
14. ModuleModel（新）
   1. 实际存储模块层信息，持有接口级信息
15. FrameworkModel（新）
   1. 实际存储框架层信息

## 配置存储梳理

### FrameworkModel
Qos、Protocol、Remoting、Serialization、ExtensionLoader

### ApplicationModel
ConfigManager（应用级）、DubboBootstrap（类 Fluent API）、Registry、Metadata、ServiceInstance、ConfigCenter、ExtensionLoader

### ModuleModel
ConsumerModel、ProviderModel、Router、Filter、ExtensionLoader


![](https://intranetproxy.alipay.com/skylark/lark/0/2021/jpeg/15256464/1628824598406-95556f0d-7817-4010-97a7-0f8e84a175cb.jpeg)
## Dubbo 流程梳理

### Model 创建

DefaultModel - FrameworkModel、ApplicationModel、ModuleModel

1. 默认 Model 创建时机
2. 用户自定义的 Model 的创建方式

### 消费端初始化

1. 消费端通过 ReferenceConfig 作为入口进行初始化配置相关信息，当前配置里面需要添加 ClassLoader 属性，ReferenceConfig 生成 ConsumerModel 注入到 ModuleModel
2. 组装的 URL 需要包含当前 ConsumerModel、ModuleModel、ApplicationModel、FrameworkModel（需要梳理全链路内 URL 转换逻辑，保证在中间不会被丢弃）
3. 组装链路上 Registry 为 ApplicationModel 域内的（订阅需要考虑订阅之间互相独立、多注册中心场景） ；Filter、Cluster、LoadBalance 为 ModuleModel 域内的
4. Directory 需要持有包括详细信息的 ConsumerURL，序列化层需要传入配置信息
5. ModuleModel 内三元组唯一，总是创建出同一个 proxy；ModuleModel 间允许重复三元组，proxy、invoker 均相互独立

### 服务端初始化

1. 服务端通过 ServiceConfig 作为入口进行初始化配置相关信息，当前配置里面需要添加 ClassLoader 属性，ServiceConfig 生成 ProviderModel 注入到 ModuleModel
2. 组装的 URL 需要包含当前 ProviderModel、ModuleModel、ApplicationModel、FrameworkModel（需要梳理全链路内 URL 转换逻辑，保证在中间不会被丢弃）
3. 组装链路上 Registry 为 ApplicationModel 域内的（订阅需要考虑服务之间互相独立、多注册中心场景） ；Filter 为 ModuleModel 域内的
4. Protocol 层持有的三元组保证唯一，可以直接找到 ProviderModel（FrameworkModel 域内）

### 地址推送流程

1. 注册中心监听需要确保三元组重复的订阅都能独立收到通知、相同三元组到注册中心的订阅链接可以进行复用
2. 注册中心工作在 ApplicationModel 域，通过持有监听列表连接 ModuleModel 层，地址的处理为 ModuleModel 域内操作，如果服用地址通知需要保证通知内容不会被某个订阅所修改
3. 每份地址通知根据不同 ModuleModel 独立创建 Invoker，Invoker 直接持有 ConsumerModel
4. Invoker 的底层 Protocol 层连接复用 TCP 连接

### 消费端调用链路

1. 消费端创建 invocation 时需要携带当前 ConsumerModel、ModuleModel、ApplicationModel、FrameworkModel （通过 consumerURL 携带），需要保证调用全链路 consumerURL 不丢失

### 服务端调用链路

1. 服务端收到请求后根据三元组定位 ProviderModel 及 invoker，进行反序列化时需要考虑 ClassLoader 切换

### 其他流程

1. 销毁流程
2. QoS 聚合方式

## 代码改动

1. ExtensionLoader 依赖注入
```java
ModuleModel.getExtensionFactory().getAdaptiveExtension(Protocol.class)
ApplicationModel.getExtensionFactory().getAdaptiveExtension(Protocol.class)
FrameworkModel.getExtensionFactory().getAdaptiveExtension(Protocol.class)


@SPI(scope = FRAMEWORK)
public interface Protocol {
}
```

- SPI 依赖注入
2. DubboBootstrap -> 功能拆分（ModuleModel 维护生命周期）
```java
// 创建新应用实例，共享FrameworkModel
DubboBootstrap.newInstance(FrameworkModel)  // SharedFrameworkModel -> NewApplicationModel
    .addModule()  // New ModuleModel
    	.addReference(ReferenceConfig)  // 将服务配置挂到模块下
    	.addReference(ReferenceConfig)
    	.addService(ServiceConfig)
    .endModule()
    .addModule()
    	.addReference(ReferenceConfig)
    	.addService(ServiceConfig)
    .endModule()
    .addRegistry()
    .addConfigCenter()
    .start()

// 兼容旧的Bootstrap API，使用默认应用实例
DubboBootstrap.getInstance()      // DefaultFrameworkModel -> DefaultApplicationModel
    .addReference(ReferenceConfig) // DefaultApplicationModel -> DefaultModuleModel
    .addService(ServiceConfig)  // DefaultApplicationModel -> DefaultModuleModel
    .setRegistry()              // DefaultApplicationModel
    .start()

// 新建应用实例
DubboBootstrap.newInstance()      // DefaultFrameworkModel -> NewApplicationModel
    .addReference(ReferenceConfig) // NewApplicationModel -> DefaultModuleModel
    .addService(ServiceConfig)  // NewApplicationModel -> DefaultModuleModel
    .setRegistry()              // NewApplicationModel
    .start()

```

3. RefenceConfig、ServiceConfig
   1. ModuleModel 动态设置
   2. 需要把 ExtensionLoader 初始化的地方下放到 setModuleModel
   3. consumerUrl 携带 ModuleModel
4. ModuleModel、ApplicationModel、FrameworkModel
   1. ModuleModel -> ConsumerModels、ProviderModels
   2. ApplicationModel -> ConfigManager（应用级的属性信息）、ModuleModels
5. ConsumerModel、ProviderModel
6. 注册中心需要支持多订阅
7. Spring


1. ModuleModel、ApplicationModel、FrameworkModel（ExtensionLoader）
2. RefenceConfig、ServiceConfig（ConsumerModel、ProviderModel）
3. ExtensionLoader (Filter 改动)



