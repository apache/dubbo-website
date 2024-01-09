---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description:
linkTitle: 服务发现与负载均衡
title: 配置服务发现
type: docs
weight: 1
---
Dubbo 支持基于注册中心同步的自动实例发现机制，即 Dubbo 提供者注册实例地址到注册中心，Dubbo 消费者通过订阅注册中心变更事件自动获取最新实例变化，从而确保流量始终转发到正确的节点之上。Dubbo 目前支持 Nacos、Zookeeper、Kubernetes Service 等多种注册中心接入。

## 服务发现

### 注册中心配置
以下是 Dubbo 服务发现接入的一些主流注册中心实现，更多扩展实现与工作原理请查看 [注册中心参考手册]()：

| 注册中心 | 配置值 | 服务发现模型 | 是否支持鉴权 | spring-boot-starter |
| --- | --- | --- | --- | --- |
| Nacos | nacos | 应用级、接口级 | 是 | dubbo-nacos-spring-boot-starter |
| Zookeeper | zookeeper | 应用级、接口级 | 是 | - dubbo-zookeeper-spring-boot-starter <br/> - dubbo-zookeeper-curator5-spring-boot-starter |
| Kubernetes Service | 参考下文使用文档 | 应用级 | 是 | 无 |

### 延迟注册
## 特性说明
如果你的服务需要预热时间，比如初始化缓存，等待相关资源就位等，可以使用 delay 进行延迟暴露。我们在 Dubbo 2.6.5 版本中对服务延迟暴露逻辑进行了细微的调整，将需要延迟暴露（delay > 0）服务的倒计时动作推迟到了 Spring 初始化完成后进行。你在使用 Dubbo 的过程中，并不会感知到此变化，因此请放心使用。

## 使用场景
当服务完全配置并准备好向外界暴露时才会触发服务的暴露，保证服务在准备就绪时暴露，提高了服务系统可靠性。


## 使用方式

### Dubbo 2.6.5 之前版本

延迟到 Spring 初始化完成后，再暴露服务[^1]

```xml
<dubbo:service delay="-1" />
```

延迟 5 秒暴露服务

```xml
<dubbo:service delay="5000" />
```

### Dubbo 2.6.5 及以后版本

所有服务都将在 Spring 初始化完成后进行暴露，如果你不需要延迟暴露服务，无需配置 delay。

延迟 5 秒暴露服务

```xml
<dubbo:service delay="5000" />
```

### Spring 2.x 初始化死锁问题

### 触发条件

在 Spring 解析到 `<dubbo:service />` 时，就已经向外暴露了服务，而 Spring 还在接着初始化其它 Bean。如果这时有请求进来，并且服务的实现类里有调用 `applicationContext.getBean()` 的用法。

1. 请求线程的 applicationContext.getBean() 调用，先同步 singletonObjects 判断 Bean 是否存在，不存在就同步 beanDefinitionMap 进行初始化，并再次同步 singletonObjects 写入 Bean 实例缓存。

    ![deadlock](/imgs/user/lock-get-bean.jpg)

2. 而 Spring 初始化线程，因不需要判断 Bean 的存在，直接同步 beanDefinitionMap 进行初始化，并同步 singletonObjects 写入 Bean 实例缓存。

    ![/user-guide/images/lock-init-context.jpg](/imgs/user/lock-init-context.jpg)

    这样就导致 getBean 线程，先锁 singletonObjects，再锁 beanDefinitionMap，再次锁 singletonObjects。
而 Spring 初始化线程，先锁 beanDefinitionMap，再锁 singletonObjects。反向锁导致线程死锁，不能提供服务，启动不了。

### 规避办法

1. 强烈建议不要在服务的实现类中有 applicationContext.getBean() 的调用，全部采用 IoC 注入的方式使用 Spring的Bean。
2. 如果实在要调 getBean()，可以将 Dubbo 的配置放在 Spring 的最后加载。
3. 如果不想依赖配置顺序，可以使用 `<dubbo:provider delay=”-1” />`，使 Dubbo 在 Spring 容器初始化完后，再暴露服务。
4. 如果大量使用 getBean()，相当于已经把 Spring 退化为工厂模式在用，可以将 Dubbo 的服务隔离单独的 Spring 容器。

[^1]: 基于 Spring 的 ContextRefreshedEvent 事件触发暴露


### 优雅上下线

### 启动时检查

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

### 多注册中心
Dubbo 支持在同一应用内配置多个注册中心，一个或一组服务可同时注册到多个注册中心，一个或一组服务可同时订阅多个中心的地址，对于订阅方而言，你还可以设置如何调用来自多个注册中心的地址（优先调用某一个注册中心或者其他策略）。

指定全局默认的一个或注册中心，所有的服务默认都注册到或订阅配置的注册中心：
```yaml
```

指定某个服务注册到多个注册中心：
```yaml
```

指定某个服务订阅来自多个注册中心的地址：
```yaml
```

关于多注册中心的更多配置、使用场景说明请参见[【参考手册 - 注册中心 - 多注册中心】]()

### 应用级vs接口级
Dubbo3 在兼容 Dubbo2 `接口级服务发现`的同时，定义了新的`应用级服务发现`模型，关于它们的含义与工作原理请参考 [应用级服务发现]()。

Dubbo3 具备自动协商服务发现模型的能力，因此老版本 Dubbo2 用户可以无缝升级 Dubbo3。强烈建议新用户明确配置使用应用级服务发现。
```yml
dubbo:
  registry:
    address: "nacos://127.0.0.1:8848"
    register-mode: instance # 新用户请设置此值，表示启用应用级服务发现，可选值 interface、instance、all
```
新用户与老用户均建议参考 [应用级服务发现迁移指南]() 了解更多配置详情。

### 注册中心缓存

### 断网恢复

### 问题排查
相比于 client 到 server 的 RPC 直连调用，开启服务发现后，常常会遇到各种个样奇怪的调用失败问题，以下是一些常见的问题与排查方法。

如果你的项目开启了服务发现，但在测试中想调用某个特定的 ip，可通过设置对端 ip 地址的 [直连模式]() 绕过服务发现机制进行调用。

1. **消费方找不到可用地址 (No Provider available)**，这里有详细的 [具体原因排查步骤]()。
2. **忘记配置注册中心**，从 3.3.0 开始，不配置注册中心应用也是能够正常启动的，只是应用的任何服务都不会注册到注册中心，或者从注册中心订阅地址列表。
3. **注册中心连不上**，会有以下默认行为：
  * 如 `dubbo.regisry.check=false`，
  * 如 `dubbo.regisry.check=true`，
4. **消费方因没有有效的地址而启动报错**，可以通过配置ReferenceConfig跳过可用地址列表检查，注解示例为 `@DubboRerefence(check=false)`
5. 多网卡选择

## 负载均衡

Dubbo 内置了 client-based 负载均衡机制，如下是当前支持的负载均衡算法，结合上文提到的自动服务发现机制，消费端会自动使用 `Weighted Random LoadBalance 加权随机负载均衡策略` 选址调用。

如果要调整负载均衡算法，以下是 Dubbo 框架内置的负载均衡策略：

| 算法                        | 特性                    | 备注                                            | 配置值                                             |
| :-------------------------- | :---------------------- | :---------------------------------------------- | :---------------------------------------------- |
| Weighted Random LoadBalance           | 加权随机                | 默认算法，默认权重相同              | random (默认) |
| RoundRobin LoadBalance       | 加权轮询                | 借鉴于 Nginx 的平滑加权轮询算法，默认权重相同， | roundrobin |
| LeastActive LoadBalance      | 最少活跃优先 + 加权随机 | 背后是能者多劳的思想                           | leastactive |
| Shortest-Response LoadBalance | 最短响应优先 + 加权随机 | 更加关注响应速度                             | shortestresponse |
| ConsistentHash LoadBalance   | 一致性哈希             | 确定的入参，确定的提供者，适用于有状态请求        | consistenthash |
| P2C LoadBalance   | Power of Two Choice    | 随机选择两个节点后，继续选择“连接数”较小的那个节点。         | p2c |
| Adaptive LoadBalance   | 自适应负载均衡       | 在 P2C 算法基础上，选择二者中 load 最小的那个节点         | adaptive |

### 使用场景
- 高可用性：部署服务的多个实例以确保即使一个或多个实例失败服务保持可用，负载均衡功能可用于在这些实例之间分配传入的请求确保以负载均衡方式使用每个实例的方式，还能最大限度地降低服务停机的风险。

- 流量管理：限制指向特定服务实例的流量，以防止过载或确保公平的资源分配，负载均衡特性提供了 Round Robin、Weighted Round Robin、Random、Least Active Load Balancing 等多种负载均衡策略，可以用来实现流量控制。

- 服务划分：将一个服务划分成多个逻辑组件，每个逻辑组件可以部署在不同的实例上，使用负载平衡以确保每个分区平衡的方式在这些实例之间分配请求，同时在实例发生故障的情况下提供故障转移功能。

- 性能优化：负载平衡可用于优化服务的性能，通过跨多个实例分发请求可以利用可用的计算资源来缩短响应时间并减少延迟。

### 使用方式

> 只需要调整 `loadbalance` 相应取值即可，每种负载均衡策略取值请参见文档最上方表格。

Dubbo 框架支持为单个服务、服务的单个方法指定独立的负载均衡策略
#### 服务端服务级别

```xml
<dubbo:service interface="..." loadbalance="roundrobin" />
```

#### 客户端服务级别

```xml
<dubbo:reference interface="..." loadbalance="roundrobin" />
```

#### 服务端方法级别

```xml
<dubbo:service interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:service>
```

#### 客户端方法级别

```xml
<dubbo:reference interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:reference>
```

### 一致性哈希配置

默认采用第一个参数作为哈希 key，如果需要切换参数，可以指定 `hash.arguments` 属性

```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<DemoService>();
// ... init
Map<String, String> parameters = new HashMap<String, String>();
parameters.put("hash.arguments", "1");
parameters.put("sayHello.hash.arguments", "0,1");
referenceConfig.setParameters(parameters);
referenceConfig.setLoadBalance("consistenthash");
referenceConfig.get();
```
