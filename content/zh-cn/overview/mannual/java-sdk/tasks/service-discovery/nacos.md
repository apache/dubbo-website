---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description:
linkTitle: 使用Nacos注册中心
title: 配置服务发现
type: docs
weight: 4
---

本示例演示 Nacos 作为注册中心实现自动服务发现，示例基于 Spring Boot 应用展开，可在此查看 [完整示例代码](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-nacos)

## 1 基本配置

### 1.1 增加依赖
增加 dubbo、nacos-client 依赖：
```xml
<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>3.3.0-beta.1</version>
    </dependency>
    <dependency>
      <groupId>com.alibaba.nacos</groupId>
      <artifactId>nacos-client</artifactId>
      <version>2.1.0</version>
    </dependency>
</dependencies>
```

对于 Spring Boot 应用，可以使用如下 spring-boot-starter：
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>3.3.0-beta.1</version>
</dependency>
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-nacos-spring-boot-starter</artifactId>
    <version>3.3.0-beta.1</version>
</dependency>
```

### 1.2 Nacos 版本
Nacos 版本映射关系：
| Dubbo | 推荐 Nacos 版本 | Nacos 兼容范围 |
| --- | --- | --- |
| 3.3.0 | 2.2.3 | 2.x |
| 3.2.21 | 2.1.0 | 2.x |
| 3.1.11 | 2.0.9 | 2.x |
| 3.0.10 | 2.0.9 | 2.x |
| 2.7.21 | 1.x | 1.x |
| 2.6.0 | 1.x | 1.x |

### 1.3 配置并启用 Nacos

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

## 2 高级配置

### 2.1 认证

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

### 2.2 自定义命名空间

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

### 2.3 自定义分组

```yaml
# application.yml
dubbo:
 registry:
   address: nacos://localhost:8848
   group: dubbo
```

> 如果不配置的话，group 是由 Nacos 默认指定。group 和 namespace 在 Nacos 中代表不同的隔离层次，通常来说 namespace 用来隔离不同的用户或环境，group 用来对同一环境内的数据做进一步归组。

### 2.4 注册接口级消费者
Dubbo 3.0.0 版本以后，增加了是否注册消费者的参数，如果需要将消费者注册到 nacos 注册中心上，需要将参数(register-consumer-url)设置为true，默认是false。
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

### 2.5 更多配置

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

### 2.6 推空保护

### 2.6 只注册/只订阅
## 特性说明
如果有两个镜像环境，两个注册中心，有一个服务只在其中一个注册中心有部署，另一个注册中心还没来得及部署，而两个注册中心的其它应用都需要依赖此服务。这个时候，可以让服务提供者方只注册服务到另一注册中心，而不从另一注册中心订阅服务。该机制通常用于提供程序相对静态且不太可能更改的场景或者提供程序和使用者互不依赖的场景。

```xml
<dubbo:registry id="hzRegistry" address="10.20.153.10:9090" />
<dubbo:registry id="qdRegistry" address="10.20.141.150:9090" subscribe="false" />
```

**或者**

```xml
<dubbo:registry id="hzRegistry" address="10.20.153.10:9090" />
<dubbo:registry id="qdRegistry" address="10.20.141.150:9090?subscribe=false" />
```

## 特性说明

为方便开发测试，经常会在线下共用一个所有服务可用的注册中心，这时，如果一个正在开发中的服务提供者注册，可能会影响消费者不能正常运行。

可以让服务提供者开发方，只订阅服务(开发的服务可能依赖其它服务)，而不注册正在开发的服务，通过直连测试正在开发的服务。

![/user-guide/images/subscribe-only.jpg](/imgs/user/subscribe-only.jpg)

## 使用场景

- 消费者是一个正在开发但尚未部署的新应用程序。消费者希望订阅未注册的服务，以确保在部署后能够访问所需的服务。
- 消费者是正在更新或修改的现有应用程序。消费者希望订阅未注册的服务以确保它能够访问更新或修改的服务。
- 消费者是在暂存环境中开发或测试的应用程序。消费者希望订阅未注册的服务，以确保在开发或测试时能够访问所需的服务。

## 使用方式

### 禁用注册配置

```xml
<dubbo:registry address="10.20.153.10:9090" register="false" />
```
**或者**

```xml
<dubbo:registry address="10.20.153.10:9090?register=false" />
```

### 2.6 启动检查
关闭注册中心启动时检查

```xml
<dubbo:registry check="false" />
```


## 3 工作原理

在前面的一节中，我们讲解了应用级服务发现与接口级服务发现的区别，以下是两种模式在 Nacos 实现中的具体存储结构。

### 3.1 Dubbo2 注册数据

随后，重启您的 Dubbo 应用，Dubbo 的服务提供和消费信息在 Nacos 控制台中可以显示：

![dubbo-registry-nacos-1.png](/imgs/blog/dubbo-registry-nacos-1.png)

如图所示，服务名前缀为 `providers:` 的信息为服务提供者的元信息，`consumers:` 则代表服务消费者的元信息。点击“**详情**”可查看服务状态详情：

![image-dubbo-registry-nacos-2.png](/imgs/blog/dubbo-registry-nacos-2.png)

### 3.2 Dubbo3 注册数据
应用级服务发现的 "服务名" 为应用名

> Dubbo3 默认采用 "应用级服务发现 + 接口级服务发现" 的双注册模式，因此会发现应用级服务（应用名）和接口级服务（接口名）同时出现在 Nacos 控制台，可以通过配置 `dubbo.registry.register-mode=instance/interface/all` 来改变注册行为。

### 3.3 客户端缓存

### 3.4 心跳检测


