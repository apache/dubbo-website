---
aliases:
    - /zh/docsv2.7/user/recommend/
description: Dubbo 推荐用法举例
linkTitle: 推荐用法
title: 推荐用法
type: docs
weight: 14
---



## 在 Provider 端尽量多配置 Consumer 端属性

原因如下：

* 作为服务的提供方，比服务消费方更清楚服务的性能参数，如调用的超时时间、合理的重试次数等
* 在 Provider 端配置后，Consumer 端不配置则会使用 Provider 端的配置，即 Provider 端的配置可以作为 Consumer 的缺省值 [^1]。否则，Consumer 会使用 Consumer 端的全局设置，这对于 Provider 是不可控的，并且往往是不合理的

Provider 端尽量多配置 Consumer 端的属性，让 Provider 的实现者一开始就思考 Provider 端的服务特点和服务质量等问题。

示例：

```xml
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService"
    timeout="300" retries="2" loadbalance="random" actives="0" />
 
<dubbo:service interface="com.alibaba.hello.api.WorldService" version="1.0.0" ref="helloService"
    timeout="300" retries="2" loadbalance="random" actives="0" >
    <dubbo:method name="findAllPerson" timeout="10000" retries="9" loadbalance="leastactive" actives="5" />
<dubbo:service/>
```

建议在 Provider 端配置的 Consumer 端属性有：

1. `timeout`：方法调用的超时时间
2. `retries`：失败重试次数，缺省是 2 [^2]
3. `loadbalance`：负载均衡算法 [^3]，缺省是随机 `random`。还可以配置轮询 `roundrobin`、最不活跃优先 [^4] `leastactive` 和一致性哈希 `consistenthash` 等
4. `actives`：消费者端的最大并发调用限制，即当 Consumer 对一个服务的并发调用到上限后，新调用会阻塞直到超时，在方法上配置 `dubbo:method` 则针对该方法进行并发限制，在接口上配置 `dubbo:service`，则针对该服务进行并发限制

详细配置说明请参考：[Dubbo配置参考手册](../references/xml/)

## 在 Provider 端配置合理的 Provider 端属性

```xml
<dubbo:protocol threads="200" /> 
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService"
    executes="200" >
    <dubbo:method name="findAllPerson" executes="50" />
</dubbo:service>
```

建议在 Provider 端配置的 Provider 端属性有：

1. `threads`：服务线程池大小
2. `executes`：一个服务提供者并行执行请求上限，即当 Provider 对一个服务的并发调用达到上限后，新调用会阻塞，此时 Consumer 可能会超时。在方法上配置 `dubbo:method` 则针对该方法进行并发限制，在接口上配置 `dubbo:service`，则针对该服务进行并发限制

## 配置管理信息

目前有负责人信息和组织信息用于区分站点。以便于在发现问题时找到服务对应负责人，建议至少配置两个人以便备份。负责人和组织信息可以在运维平台 (Dubbo Ops) 上看到。

在应用层面配置负责人、组织信息：

```xml
<dubbo:application owner=”ding.lid,william.liangf” organization=”intl” />
```

在服务层面（服务端）配置负责人：

```xml
<dubbo:service owner=”ding.lid,william.liangf” />
```

在服务层面（消费端）配置负责人：

```xml
<dubbo:reference owner=”ding.lid,william.liangf” />
```

若没有配置服务层面的负责人，则默认使用 `dubbo:application` 设置的负责人。

## 配置 Dubbo 缓存文件

提供者列表缓存文件：

```xml
<dubbo:registry file=”${user.home}/output/dubbo.cache” />
```

注意：

1. 可以根据需要调整缓存文件的路径，保证这个文件不会在发布过程中被清除；
2. 如果有多个应用进程，请注意不要使用同一个文件，避免内容被覆盖；

该文件会缓存注册中心列表和服务提供者列表。配置缓存文件后，应用重启过程中，若注册中心不可用，应用会从该缓存文件读取服务提供者列表，进一步保证应用可靠性。

## 监控配置

1. 使用固定端口暴露服务，而不要使用随机端口

    这样在注册中心推送有延迟的情况下，消费者通过缓存列表也能调用到原地址，保证调用成功。

2. 使用 Dubbo Admin 监控注册中心上的服务提供方

    使用 [Dubbo Admin](https://github.com/apache/dubbo-admin) 监控服务在注册中心上的状态，确保注册中心上有该服务的存在。

3. 服务提供方可使用 Dubbo Qos 的 telnet 或 shell 监控项

    监控服务提供者端口状态：`echo status | nc -i 1 20880 | grep OK | wc -l`，其中的 20880 为服务端口

4. 服务消费方可通过将服务强制转型为 EchoService，并调用 `$echo()` 测试该服务的提供者是可用

    如 `assertEqauls(“OK”, ((EchoService)memberService).$echo(“OK”));`
    
## 不要使用 dubbo.properties 文件配置，推荐使用对应 XML 配置

Dubbo 中所有的配置项都可以配置在 Spring 配置文件中，并且可以针对单个服务配置。

如完全不配置则使用 Dubbo 缺省值，详情请参考 [Dubbo配置参考手册](../references/xml/) 中的说明。

### dubbo.properties 中属性名与 XML 的对应关系

1. 应用名 `dubbo.application.name`

    ```xml
    <dubbo:application name="myalibaba" >
    ```
    
2. 注册中心地址 `dubbo.registry.address`
   
    ```xml
    <dubbo:registry address="11.22.33.44:9090" >
    ```
    
3. 调用超时 `dubbo.service.*.timeout`

    可以在多个配置项设置超时 `timeout`，由上至下覆盖（即上面的优先）[^5]，其它的参数（`retries`、`loadbalance`、`actives`等）的覆盖策略与 `timeout` 相同。示例如下：

    提供者端特定方法的配置
    
    ```xml 
    <dubbo:service interface="com.alibaba.xxx.XxxService" >
        <dubbo:method name="findPerson" timeout="1000" />
    </dubbo:service>
    ```
    
    提供者端特定接口的配置
    
    ```xml
    <dubbo:service interface="com.alibaba.xxx.XxxService" timeout="200" />
    ```
    
4. 服务提供者协议 `dubbo.service.protocol`、服务的监听端口 `dubbo.service.server.port`

    ```xml
    <dubbo:protocol name="dubbo" port="20880" />
    ```
    
5. 服务线程池大小 `dubbo.service.max.thread.threads.size`

    ```xml
    <dubbo:protocol threads="100" />
    ```
    
6. 消费者启动时，没有提供者是否抛异常 `alibaba.intl.commons.dubbo.service.allow.no.provider`

    ```xml
    <dubbo:reference interface="com.alibaba.xxx.XxxService" check="false" />
    ```
    
[^1]: 配置的覆盖规则：1) 方法级别配置优于接口级别，即小 Scope 优先 2) Consumer 端配置优于 Provider 端配置，优于全局配置，最后是 Dubbo 硬编码的配置值（[Dubbo 配置参考手册](../configuration/properties))
[^2]: 表示加上第一次调用，会调用 3 次
[^3]: 有多个 Provider 时，如何挑选 Provider 调用
[^4]: 指从 Consumer 端并发调用最好的 Provider，可以减少对响应慢的 Provider 的调用，因为响应慢更容易累积并发调用
[^5]: `timeout` 可以在多处设置，配置项及覆盖规则请参考： [Dubbo 配置参考手册](../references/xml/)