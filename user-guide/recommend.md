#### 在Provider上尽量多配置Consumer端属性

原因如下：

* 作服务的提供者，比服务使用方更清楚服务性能参数，如调用的超时时间，合理的重试次数，等等
* 在Provider配置后，Consumer不配置则会使用Provider的配置值，即Provider配置可以作为Consumer的缺省值。否则，Consumer会使用Consumer端的全局设置，这对于Provider不可控的，并且往往是不合理的。

PS: 配置的覆盖规则：1) 方法级配置别优于接口级别，即小Scope优先 2) Consumer端配置 优于 Provider 配置 优于全局配置，最后是Dubbo Hard Code的配置值（见[Dubbo配置参考手册](user-guide-configuration-ref#配置参考手册)）

Provider上尽量多配置Consumer端的属性，让Provider实现者一开始就思考Provider服务特点、服务质量的问题。

示例：

```xml
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService"
    timeout="300" retry="2" loadbalance="random" actives="0"
/>
 
<dubbo:service interface="com.alibaba.hello.api.WorldService" version="1.0.0" ref="helloService"
    timeout="300" retry="2" loadbalance="random" actives="0" >
    <dubbo:method name="findAllPerson" timeout="10000" retries="9" loadbalance="leastactive" actives="5" />
<dubbo:service/>
```

在Provider可以配置的Consumer端属性有：

0. `timeout` 方法调用超时
1. `retries` 失败重试次数，缺省是2（表示加上第一次调用，会调用3次）
2. `loadbalance` 负载均衡算法（有多个Provider时，如何挑选Provider调用），缺省是随机（random）。还可以有轮询(roundrobin)、最不活跃优先（leastactive，指从Consumer端并发调用最好的Provider，可以减少的反应慢的Provider的调用，因为反应更容易累积并发的调用）
3. `actives` 消费者端，最大并发调用限制，即当Consumer对一个服务的并发调用到上限后，新调用会Wait直到超时。
在方法上配置（dubbo:method ）则并发限制针对方法，在接口上配置（dubbo:service），则并发限制针对服务。

详细配置说明参见：[Dubbo配置参考手册](./reference-xmlconf/introduction.md)

#### Provider上配置合理的Provider端属性

```xml
<dubbo:protocol threads="200" />
 
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService"
    executes="200" >
    <dubbo:method name="findAllPerson" executes="50" />
</dubbo:service>
```

Provider上可以配置的Provider端属性有：

0. `threads` 服务线程池大小
1. `executes` 一个服务提供者并行执行请求上限，即当Provider对一个服务的并发调用到上限后，新调用会Wait（Consumer可能到超时）。在方法上配置（dubbo:method ）则并发限制针对方法，在接口上配置（dubbo:service），则并发限制针对服务。

#### 配置上管理信息

目前有负责人信息和组织信息（用于区分站点）。有问题时便于的找到服务的负责人，至少写两个人以便备份。负责人和组织的信息可以在注册中心的上看到。

示例：

**应用配置负责人、组织**

```xml
<dubbo:application owner=”ding.lid,william.liangf” organization=”intl” />
```

**service配置负责人**

```xml
<dubbo:service owner=”ding.lid,william.liangf” />
```

**reference配置负责人**

```xml
<dubbo:reference owner=”ding.lid,william.liangf” />
```

dubbo:service、dubbo:reference没有配置负责人，则使用dubbo:application设置的负责人。

#### 配置上Dubbo缓存文件

配置方法如下：

**提供者列表缓存文件**

```xml
<dubbo:registry file=”${user.home}/output/dubbo.cache” />
```

注意：

0. 文件的路径，应用可以根据需要调整，保证这个文件不会在发布过程中被清除。
1. 如果有多个应用进程注意不要使用同一个文件，避免内容被覆盖。

这个文件会缓存：

0. 注册中心的列表
1. 服务提供者列表

有了这项配置后，当应用重启过程中，Dubbo注册中心不可用时则应用会从这个缓存文件读取服务提供者列表的信息，进一步保证应用可靠性。

#### 监控配置

0. 使用固定端口暴露服务，而不要使用随机端口

    这样在注册中心推送有延迟的情况下，消费者通过缓存列表也能调用到原地址，保证调用成功。

1. 使用Dragoon的http监控项监控注册中心上服务提供方

    Dragoon监控服务在注册中心上的状态：http://dubbo-reg1.hst.xyi.cn.alidc.net:8080/status/com.alibaba.morgan.member.MemberService:1.0.5 确保注册中心上有该服务的存在。

2. 服务提供方，使用Dragoon的telnet或shell监控项

    监控服务提供者端口状态：`echo status | nc -i 1 20880 | grep OK | wc -l`，其中的20880为服务端口

3. 服务消费方，通过将服务强制转型为EchoService，并调用$echo()测试该服务的提供者是可用

    如 `assertEqauls(“OK”, ((EchoService)memberService).$echo(“OK”));`
    
#### 不要使用dubbo.properties文件配置，推荐使用对应XML配置

Dubbo2中所有的配置项都可以Spring配置中，并且可以针对单个服务配置。

如完全不配置使用Dubbo缺省值，参见 [Dubbo配置参考手册](reference-xmlconf/introduction.md) 中的说明。

在Dubbo1中需要在dubbo.properties文件中的配置项，Dubbo2中配置示例如下：

0. 应用名 

    ```xml
    <dubbo:application name="myalibaba" >
    ```
    对应dubbo.properties中的Key名`dubbo.application.name`
    
1. 注册中心地址
    
    ```xml
    <dubbo:registry address="11.22.33.44:9090" >
    ```
    对应dubbo.properties中的Key名`dubbo.registry.address`
    
2. 调用超时

    可以在多个配置项设置超时，由上至下覆盖（即上面的优先），示例如下：

    其它的参数（retries、loadbalance、actives等）的覆盖策略也一样。

    **提供者端特定方法的配置**
    
     ```xml 
    <dubbo:service interface="com.alibaba.xxx.XxxService" >
        <dubbo:method name="findPerson" timeout="1000" />
    </dubbo:service>
    ```
    
    **提供者端特定接口的配置**
    
    ```xml
    <dubbo:service interface="com.alibaba.xxx.XxxService" timeout="200" />
    ```
    
    timeout可以在多处设置，配置项及覆盖规则详见： [Dubbo配置参考手册](reference-xmlconf/introduction.md)

    全局配置项值，对应dubbo.properties中的Key名`dubbo.service.invoke.timeout`
    
4. 服务提供者协议、服务的监听端口

    ```xml
<dubbo:protocol name="dubbo" port="20880" />
```
    对应dubbo.properties中的Key名`dubbo.service.protocol、dubbo.service.server.port`
    
5. 服务线程池大小

    ```xml
    <dubbo:protocol threads="100" />
    ```
    对应 dubbo.properties 中的Key名`dubbo.service.max.thread.threads.size`
    
6. 消费者启动时，没有提供者是否抛异常Fast-Fail

    ```xml
    <dubbo:reference interface="com.alibaba.xxx.XxxService" check="false" />
    ```
    对应 dubbo.properties 中的Key名`alibaba.intl.commons.dubbo.service.allow.no.provider`