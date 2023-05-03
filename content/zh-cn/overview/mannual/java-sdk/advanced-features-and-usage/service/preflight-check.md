---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/preflight-check/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/preflight-check/
description: 在启动时检查依赖的服务是否可用
linkTitle: 启动时检查
title: 启动时检查
type: docs
weight: 1
---





## 特性说明
Dubbo 缺省会在启动时检查依赖的服务是否可用，不可用时会抛出异常，阻止 Spring 初始化完成，以便上线时，能及早发现问题，默认  `check="true"`。  

可以通过 `check="false"` 关闭检查，比如，测试时，有些服务不关心，或者出现了循环依赖，必须有一方先启动。

另外，如果你的 Spring 容器是懒加载的，或者通过 API 编程延迟引用服务，请关闭 check，否则服务临时不可用时，会抛出异常，拿到 null 引用，如果 `check="false"`，总是会返回引用，当服务恢复时，能自动连上。

## 使用场景

- 单向依赖：有依赖关系（建议默认设置）和无依赖关系（可以设置 check=false）
- 相互依赖：即循环依赖，(不建议设置 check=false) 
- 延迟加载处理

> check 只用来启动时检查，运行时没有相应的依赖仍然会报错。 

## 使用方式

**配置含义**

`dubbo.reference.com.foo.BarService.check`，覆盖 `com.foo.BarService`的 reference 的 check 值，就算配置中有声明，也会被覆盖。

`dubbo.consumer.check=false`，是设置 reference 的 `check` 的缺省值，如果配置中有显式的声明，如：`<dubbo:reference check="true"/>`，不会受影响。

`dubbo.registry.check=false`，前面两个都是指订阅成功，但提供者列表是否为空是否报错，如果注册订阅失败时，也允许启动，需使用此选项，将在后台定时重试。

### 通过 spring 配置文件

关闭某个服务的启动时检查

```xml
<dubbo:reference interface="com.foo.BarService" check="false" />
```

关闭所有服务的启动时检查

```xml
<dubbo:consumer check="false" />
```

关闭注册中心启动时检查

```xml
<dubbo:registry check="false" />
```

### 通过 dubbo.properties

```properties
dubbo.reference.com.foo.BarService.check=false
dubbo.consumer.check=false
dubbo.registry.check=false
```

### 通过 -D 参数

```sh
java -Ddubbo.reference.com.foo.BarService.check=false
java -Ddubbo.consumer.check=false 
java -Ddubbo.registry.check=false
```