---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/registry/nacos/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/registry/nacos/
    - /zh-cn/overview/what/ecosystem/registry/nacos/
description: Nacos 注册中心的基本使用和工作原理。
linkTitle: Nacos
title: Nacos
type: docs
weight: 3
---






## 1 前置条件
* 了解 [Dubbo 基本开发步骤](../../../quick-start/spring-boot/)
* 安装并启动 [Nacos 服务](https://nacos.io/zh-cn/docs/quick-start.html)
>当Dubbo使用`3.0.0`及以上版本时，需要使用Nacos `2.0.0`及以上版本。

## 2 使用说明
在此查看[完整示例代码](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-nacos/dubbo-samples-nacos-registry)

### 2.1 增加依赖
```xml
<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>3.0.9</version>
    </dependency>
    <dependency>
      <groupId>com.alibaba.nacos</groupId>
      <artifactId>nacos-client</artifactId>
      <version>2.1.0</version>
    </dependency>
     <!-- Introduce Dubbo Nacos extension, or you can add Nacos dependency directly as shown above-->
     <!--
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-registry-nacos</artifactId>
            <version>3.0.9</version>
        </dependency>
     -->
</dependencies>
```
增加 Dubbo 与 Nacos 依赖

> Dubbo `3.0.0` 及以上版本需 nacos-client `2.0.0` 及以上版本

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

### 3.2 自定义命名空间

```yaml
# application.yml (Spring Boot)
dubbo:
 registry:
   address: nacos://localhost:8848?namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932
```

或者

```yaml
# application.yml (Spring Boot)
dubbo:
 registry:
   address: nacos://localhost:8848
   parameters.namespace: 5cbb70a5-xxx-xxx-xxx-d43479ae0932
```

### 3.3 自定义分组

```yaml
# application.yml
dubbo:
 registry:
   address: nacos://localhost:8848
   group: dubbo
```

> 如果不配置的话，group 是由 Nacos 默认指定。group 和 namespace 在 Nacos 中代表不同的隔离层次，通常来说 namespace 用来隔离不同的用户或环境，group 用来对同一环境内的数据做进一步归组。

### 3.4 注册接口级消费者
Dubbo3.0.0版本以后，增加了是否注册消费者的参数，如果需要将消费者注册到nacos注册中心上，需要将参数(register-consumer-url)设置为true，默认是false。
```yaml
# application.yml
dubbo:
  registry:
    address: nacos://localhost:8848?register-consumer-url=true
```
或者
```yaml
# application.yml
dubbo:
  registry:
    address: nacos://localhost:8848
    parameters.register-consumer-url: true
    
```

### 3.5 更多配置

参数名 | 中文描述| 默认值
---|---|---
username|连接Nacos Server的用户名|nacos
paasword|连接Nacos Server的密码|nacos
backup|备用地址|空
namespace|命名空间的ID|public
group|分组名称|DEFAULT_GROUP
register-consumer-url|是否注册消费端|false
com.alibaba.nacos.naming.log.filename|初始化日志文件名|naming.log
endpoint|连接Nacos Server指定的连接点，可参考[文档](https://nacos.io/zh-cn/blog/address-server.html)|空
endpointPort|连接Nacos Server指定的连接点端口，可以参考[文档](https://nacos.io/zh-cn/blog/address-server.html)|空
endpointQueryParams|endpoint查参数询|空
isUseCloudNamespaceParsing|是否解析云环境中的namespace参数|true
isUseEndpointParsingRule|是否开启endpoint 参数规则解析|true
namingLoadCacheAtStart|启动时是否优先读取本地缓存|true
namingCacheRegistryDir|指定缓存子目录，位置为 .../nacos/{SUB_DIR}/naming|空
namingClientBeatThreadCount|客户端心跳的线程池大小|机器的CPU数的一半
namingPollingThreadCount|客户端定时轮询数据更新的线程池大小|机器的CPU数的一半
namingRequestDomainMaxRetryCount|client通过HTTP向Nacos Server请求的重试次数|3
namingPushEmptyProtection|在服务没有有效（健康）实例时，是否开启保护，开启后则会使用旧的服务实例|false
push.receiver.udp.port|客户端UDP的端口|空

在nacos-server@`1.0.0`版本后，支持客户端通过上报一些包含特定的元数据的实例到服务端来控制实例的一些行为。

参数名 | 中文描述| 默认值
---|---|---
preserved.heart.beat.timeout|该实例在不发送心跳后，从健康到不健康的时间（毫秒）|15000
preserved.ip.delete.timeout|该实例在不发送心跳后，被服务端下掉该实例的时间(毫秒)|30000
preserved.heart.beat.interval|该实例在客户端上报心跳的间隔时间(毫秒)|5000
preserved.instance.id.generator|该实例的id生成策略，值为`snowflake`时，从0开始增加|simple
preserved.register.source|注册实例注册时服务框架类型（例如Dubbo,Spring Cloud等）|空

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