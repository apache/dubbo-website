---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description:
linkTitle: 服务发现
title: 配置服务发现
type: docs
weight: 1
---
Dubbo 支持基于注册中心同步的自动实例发现机制，即 Dubbo 提供者注册实例地址到注册中心，Dubbo 消费者通过订阅注册中心变更事件自动获取最新实例变化，从而确保流量始终转发到正确的节点之上。Dubbo 目前支持 Nacos、Zookeeper、Kubernetes Service 等多种注册中心接入。

## 注册中心
以下是 Dubbo 服务发现接入的一些主流注册中心实现，更多扩展实现与工作原理请查看 [注册中心参考手册]()：

| 注册中心 | 配置值 | 服务发现模型 | 是否支持鉴权 | spring-boot-starter |
| --- | --- | --- | --- | --- |
| Nacos | nacos | 应用级、接口级 | 是 | dubbo-nacos-spring-boot-starter |
| Zookeeper | zookeeper | 应用级、接口级 | 是 | - dubbo-zookeeper-spring-boot-starter <br/> - dubbo-zookeeper-curator5-spring-boot-starter |
| Kubernetes Service | 参考下文使用文档 | 应用级 | 是 | 无 |

## 延迟注册
如果你的服务需要预热时间，比如初始化缓存，等待相关资源就位等，可以使用 delay 参数进行延迟注册。如果是在 Spring 应用中，则 `delay = n(n > 0)` 延迟的时间是 Spring 上下文初始化完成后开始算起。

```java
@DubboService(delay = 5000)
public class DemoServiceImpl implements DemoService {
}
```

以上配置后，应用将延迟 5 秒暴露服务。

## 优雅上下线

## 启动时检查

### 消费端地址列表检查
Dubbo 缺省会在启动时检查依赖的服务是否可用，不可用时（这里指地址列表为空）会抛出异常，阻止应用初始化完成，以便上线时能及早发现问题，默认 `check="true"`。

可以通过 `check="false"` 关闭检查，比如，测试时，有些服务不关心，或者出现了循环依赖，必须有一方先启动。注意如果 `check="false"` 且启动时无地址可用，此时总是会正常返回 rpc 引用，但如果此时发起调用就会出现 “无地址可用异常”，当服务地址列表恢复时，rpc 应用会自动可用。

**1. 使用场景**
- 单向依赖：有依赖关系（建议默认设置）和无依赖关系（可以设置 check=false）
- 相互依赖：即循环依赖，(不建议设置 check=false)
- 延迟加载处理

> check 只用来启动时检查，运行时没有相应的依赖仍然会报错。

**2. 配置方式**
```java
@DubboReference(check = false)
private DemoService demoService;
```

```yaml
dubbo:
  consumer:
    check: false
```
### 注册中心连通性检查
除了检查消费者端地址列表之外，还有一个唯独是与注册中心的连通性检查。默认情况下，不论是提供者、消费者，如果启动阶段连接不上注册中心都会导致进程启动失败。

可以关闭注册中心启动时检查，即使注册中心连接失败进程也会继续正常启动：

```yaml
dubbo:
  registry:
    check: false
```

## 多注册中心
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

## 应用级vs接口级
Dubbo3 在兼容 Dubbo2 `接口级服务发现`的同时，定义了新的`应用级服务发现`模型，关于它们的含义与工作原理请参考 [应用级服务发现]()。

Dubbo3 具备自动协商服务发现模型的能力，因此老版本 Dubbo2 用户可以无缝升级 Dubbo3。强烈建议新用户明确配置使用应用级服务发现。
```yml
dubbo:
  registry:
    address: "nacos://127.0.0.1:8848"
    register-mode: instance # 新用户请设置此值，表示启用应用级服务发现，可选值 interface、instance、all
```
新用户与老用户均建议参考 [应用级服务发现迁移指南]() 了解更多配置详情。

## 注册中心缓存

## 断网恢复

## 推空保护
默认关闭，可通过以下方式开启
```yaml
dubbo:
  registry:
    enableEmptyProtection: true
```

## 只注册
如果有两个镜像环境，两个注册中心，有一个服务只在其中一个注册中心有部署，另一个注册中心还没来得及部署，而两个注册中心的其它应用都需要依赖此服务。这个时候，可以让服务提供者方只注册服务到另一注册中心，而不从另一注册中心订阅服务。该机制通常用于提供程序相对静态且不太可能更改的场景或者提供程序和使用者互不依赖的场景。

```yaml
dubbo:
  registry:
    subscribe: false
```

## 只订阅

为方便开发测试，经常会在线下共用一个所有服务可用的注册中心，这时，如果一个正在开发中的服务提供者注册，可能会影响消费者不能正常运行。可以让服务提供者开发方，只订阅服务(开发的服务可能依赖其它服务)，而不注册正在开发的服务，通过直连测试正在开发的服务。

![/user-guide/images/subscribe-only.jpg](/imgs/user/subscribe-only.jpg)

```yaml
dubbo:
  registry:
    register: false
```

## 权限控制
通过令牌验证在注册中心控制权限，以决定要不要下发令牌给消费者，可以防止消费者绕过注册中心访问提供者。另外通过注册中心可灵活改变授权方式，而不需修改或升级提供者。

![/user-guide/images/dubbo-token.jpg](/imgs/user/dubbo-token.jpg)

增加以下配置：
```yaml
dubbo:
  provider:
    token: true #UUID
```
或者
```yaml
dubbo:
  provider:
    token: 123456
```

## 指定注册地址
当服务提供者启动时，Dubbo 框架会自动扫描本机可用的网络设备地址，并将其中一个有效ip地址注册到注册中心。扫描遵循以下原则或顺序：

1. 未联网时，返回 127.0.0.1
2. 在阿里云服务器中，返回私有地址,如: 172.18.46.234
3. 在本机测试时，返回公有地址，如: 30.5.10.11

对于有多个网络设备的情况，Dubbo 会随机选择其中一个，此时如果注册的 ip 地址不符合预期，可以通过以下方式指定地址。

* -D 参数指定框架读取的网卡地址，如 `-Ddubbo.network.interface.preferred=eth0`。
* 系统环境变量指定上报到注册中心的 ip，如 `DUBBO_IP_TO_REGISTRY=30.5.10.11`


最后，还可以通过在 protocol 中指定监听地址，update因为监听地址会默认用作发送到注册中心的地址
```yaml
dubbo:
  protocol:
    name: dubbo
    port: 20880
    host: 30.5.10.11 # 也可以是域名，如 dubbo.apache.org
```

{{% alert title="注意" color="primary" %}}
Dubbo 框架会默认监听 `0.0.0.0:20880`，如果指定了 host，则框架会转而监听 `30.5.10.11:20880`。
{{% /alert %}}

## 性能优化
简化注册中心地址 URL

配置使用应用级服务发现

## 问题排查
相比于 client 到 server 的 RPC 直连调用，开启服务发现后，常常会遇到各种个样奇怪的调用失败问题，以下是一些常见的问题与排查方法。

如果你的项目开启了服务发现，但在测试中想调用某个特定的 ip，可通过设置对端 ip 地址的 [直连模式]() 绕过服务发现机制进行调用。

1. **消费方找不到可用地址 (No Provider available)**，这里有详细的 [具体原因排查步骤]()。
2. **忘记配置注册中心**，从 3.3.0 开始，不配置注册中心应用也是能够正常启动的，只是应用的任何服务都不会注册到注册中心，或者从注册中心订阅地址列表。
3. **注册中心连不上**，会有以下默认行为：
  * 如 `dubbo.regisry.check=false`，
  * 如 `dubbo.regisry.check=true`，
4. **消费方因没有有效的地址而启动报错**，可以通过配置ReferenceConfig跳过可用地址列表检查，注解示例为 `@DubboRerefence(check=false)`
