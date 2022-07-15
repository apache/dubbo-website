---
type: docs
title: "Nacos"
linkTitle: "Nacos"
weight: 3
description: "Nacos 注册中心的基本使用和工作原理。"
---

## 1 前置条件
* 了解 [Dubbo 基本开发步骤](../../../quick-start/spring-boot/)
* 安装并启动 [Nacos 服务](https://nacos.io/zh-cn/docs/quick-start.html)

## 2 使用说明
在此查看[完整示例代码](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-nacos/dubbo-samples-nacos-registry/)

### 2.1 增加依赖
```xml
<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>3.0.9</version>
    </dependency>
    <!-- Introduce Nacos dependency, or you can add Nacos dependency directly as shown blow-->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-registry-nacos</artifactId>
        <version>3.0.9</version>
    </dependency>
    <!--
    <dependency>
      <groupId>com.alibaba.nacos</groupId>
      <artifactId>nacos-client</artifactId>
      <version></version>
    </dependency>
    -->
</dependencies>
```

增加 Dubbo 与 Nacos 依赖

### 2.2 配置并启用 Nacos

```yaml
# application.yml (Spring Boot)
dubbo
 registry
   address: nacos://localhost:8848
```
或
```properties
# dubbo.properties
dubbo.registry.address=nacos://localhost:8848
```
或
```xml
<dubbo:registry address="nacos://localhost:8848" />
```

启用应用，查看注册后的效果或工作原理，请查看 [工作原理](#4-工作原理)。

## 3 高级配置

### 3.1 认证

```yaml
# application.yml (Spring Boot)
dubbo
 registry
   address: nacos://localhost:8848?username=nacos&password=nacos
```

或

```properties
# dubbo.properties
dubbo.registry.address: nacos://nacos:nacos@localhost:8848
```

### 3.1 自定义命名空间

```yaml
# application.yml (Spring Boot)
dubbo
 registry
   address: nacos://localhost:8848?namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932
```

或者

```yaml
# application.yml (Spring Boot)
dubbo
 registry
   address: nacos://localhost:8848
   parameters.namespace: 5cbb70a5-xxx-xxx-xxx-d43479ae0932
```

### 3.2 自定义分组

```yaml
# application.yml
dubbo
 registry
   address: nacos://localhost:8848
   group: dubbo
```

> 如果不配置的话，group 是由 Nacos 默认指定。group 和 namespace 在 Nacos 中代表不同的隔离层次，通常来说 namespace 用来隔离不同的用户或环境，group 用来对同一环境内的数据做进一步归组。

### 3.3 更多配置
在nacos-server@`1.0.0`版本后，支持客户端通过上报一些包含特定的元数据的实例到服务端来控制实例的一些行为。

   例如:

   `preserved.heart.beat.timeout`   : 该实例在不发送心跳后，从健康到不健康的时间。（单位:毫秒）
   `preserved.ip.delete.timeout`    : 该实例在不发送心跳后，被服务端下掉该实例的时间。（单位:毫秒）
   `preserved.heart.beat.interval`  : 该实例在客户端上报心跳的间隔时间。（单位:毫秒）
   `preserved.instance.id.generator`: 该实例的id生成策略，值为`snowflake`时，从0开始增加。
   `preserved.register.source`      : 保留键，目前未使用。

  这些参数都可以类似 `namespace` 的方式通过通过参数扩展配置到 Nacos，如

  ```properties
  dubbo.registry.parameters.preserved.heart.beat.timeout=5000
  ```

## 4 工作原理

以下仅为展示 Nacos 作为 Dubbo 注册中心的工作原理，Dubbo 服务运维建议使用 [Dubbo Admin](https://github.com/apache/dubbo-admin)

### 4.1 Dubbo2 注册数据

随后，重启您的 Dubbo 应用，Dubbo 的服务提供和消费信息在 Nacos 控制台中可以显示：

![dubbo-registry-nacos-1.png](/imgs/blog/dubbo-registry-nacos-1.png)

如图所示，服务名前缀为 `providers:` 的信息为服务提供者的元信息，`consumers:` 则代表服务消费者的元信息。点击“**详情**”可查看服务状态详情：

![image-dubbo-registry-nacos-2.png](/imgs/blog/dubbo-registry-nacos-2.png)

### 4.2 Dubbo3 注册数据
应用级服务发现的 "服务名" 为应用名



> Dubbo3 默认采用 "应用级服务发现 + 接口级服务发现" 的双注册模式，因此会发现应用级服务（应用名）和接口级服务（接口名）同时出现在 Nacos 控制台，可以通过配置 `dubbo.registry.register-mode=instance/interface/all` 来改变注册行为。