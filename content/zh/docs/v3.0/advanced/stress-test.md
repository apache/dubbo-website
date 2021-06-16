---
title: "Dubbo压测实施方案"
linkTitle: "压测"
weight: 100
description: >-
     这篇文档主要介绍对Dubbo服务进行线上压测的1种思路，涵盖了 技术选型、资源配置、报告生成 等方面。
如果用户有评估生产环境服务容量的诉求，可以参考本文档中提到的设计方案，来建设自己的压测平台。
---

# 背景

* 互联网公司通常会面临 大促、赛事、节日 等流量热点聚集场景，确保系统在这种场景下能够提供流畅的用户服务，往往是技术部门的核心目标之一。 

* 在实际生产中，各核心系统往往环环相扣，其中一个系统出现瓶颈问题，将会影响到整个调用链路，从而直接损伤用户体验，甚至还会导致整体雪崩。 

* 由于基础设施差异，在线下环境压测得到的性能数据仅能作为参考，而无法反映生产环境的实际性能，这也是淘宝双11、京东618实施线上压测的原因之一。 

* 如果没有办法得到准确的生产环境容量数据，也就无法进行合理的容量规划：如果资源投入不足，则造成系统过载；如果资源投入过多，又造成闲置浪费。 

# 方案

为了解决上述问题，2019年底我们基于Dubbo和阿里云建设了1套压测方案，下面将展开介绍。

## 整体架构

![avatar](https://cdn.nlark.com/yuque/0/2021/png/12424757/1623413264963-8b0e4791-48fb-434d-9de7-b57f0501b22b.png)

## 技术选型

### 压测引擎

* 支持3种协议：

    * grpc 采用ghz引擎；

    * http 采用jmeter引擎；

    * dubbo 需要引入jmeter插件。

* 分为 调度器 和 执行器 这2个部分；

* 其中调度器基于jmeter二开，由Systemd启动；

* 执行器是指jmeter、ghz以及 后续可能引入的其它施压引擎。

### 施压机

* 施压机 采用按量付费ECS；

* 通过ECS镜像克隆方式实现扩容。

### 控制器

* 切分 和 下发 压测任务 给施压机；

* 感知 各施压机 的实际负载 和 存活状态；

* 根据 施压机 实际负载，动态调整下发的任务量；

* 查询TSDB的监控数据，可视化地展示在UI界面上。

### 压测SDK

* 可热插拔；

* 模拟外部依赖项；

* 根据压测标记，改写SQL语句；

* 根据压测标记，改写Redis命令；

* 上报压测相关的监控打点，写入到TSDB；

* 订阅压测策略相关的配置，比如Mock外部依赖项的具体策略。

## 关键细节

### Mock逻辑

以下是压测SDK的Mock逻辑，仅供参考：

![avatar](https://cdn.nlark.com/yuque/0/2021/png/12424757/1623414565449-57f161d2-b2d1-48fc-ab05-dafbef9a76e6.png)

Mock的实现细节：
* 接口配置名称：类名#方法名；
* Mock Json反序列化：
    在DubboFilter中获取到响应类型的Bean的GenericReturnType，Gson Api反序列化。
*  MockValue缓存：本地ConcurrentHashMap，缓存mockJson反序列化后的Bean；
* Mock缓存会随配置变更而批量清空。

Mock配置示例：

```javascript
 "dubboConfig": {
        "status": 2,
        "wlRatio": 100,
        "delay": 0,//模拟延迟ms
        "resConfigMap":{//包含多个接口配置的对象
           "classA#methodA":{
               "delay":50, //延时模拟
               "mockText":"{\"error\":0,\"data\":1}"//mock返回的json
           }
        }//mock json字符串
    },
```

## 施压插件

### Grpc插件

原生ghz不支持注册中心，我们二开后采用etcd作为注册中心，ghz官网地址 https://ghz.sh，压测示例如下：

```bash
ghz --insecure  -m '{"app.id":"123456"}' --proto=repo/my_app.proto --call com.test.HelloService.sayHello -d '{"user": "zhangsan"}' --etcd 127.0.0.1:2379 --grpc-name my_discovery_protocol --concurrency 4 --duration 5s
```

### Dubbo插件

采用 jmeter-plugins-for-apache-dubbo 来施压，该插件现在已支持到Dubbo 2.7.8。

## 问题和改进

### Dubbo插件性能问题

![avatar](https://cdn.nlark.com/yuque/0/2021/png/12424757/1623416303457-8044d0f8-a798-4ac3-8e87-5d9ff39447cb.png)

压测过程中发现性能未达到预期，原因是每次请求都会调用ReferenceConfig的get方法。

该方法会导致大量线程block住。dubbo压测过程中，发现单机性能只有200 ~ 1500QPS。

经对比发现该方法只在2.7.0 ~ 2.7.4 这几个版本中存在，低版本的2.6.x 和 高版本的 2.7.5 都没有。

因此，升级到2.7.5以上版本可以解决这个问题。



