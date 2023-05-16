---
aliases:
    - /zh-cn/overview/tasks/ecosystem/rate-limit/
    - /zh-cn/overview/what/ecosystem/rate-limit/
    - /zh-cn/overview/what/ecosystem/rate-limit/sentinel/
description: "使用 Sentinel 保护您的应用，防止应用因个别服务的突发流量过载而出现稳定性问题。"
linkTitle: Sentinel 限流
title: Sentinel 限流
type: docs
weight: 1
---

## Sentinel 是什么

随着微服务的流行，服务和服务之间的稳定性变得越来越重要。Sentinel 是面向分布式、多语言异构化服务架构的流量治理组件，主要以流量为切入点，从流量路由、流量控制、流量整形、熔断降级、系统自适应过载保护、热点流量防护等多个维度来帮助开发者保障微服务的稳定性。

## 一、示例架构说明

完整示例项目地址 <a href="https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-sentinel" target="_blank">dubbo-samples-sentinel</a>

接口定义：

```java
public interface FooService {

    String sayHello(String name);
}
```

接口实现：

```java
@DubboService(timeout = 3000)
public class FooServiceImpl implements FooService {

    @Override
    public String sayHello(String name) {
        return String.format("Hello, %s at %s", name, LocalDateTime.now());
    }
}
```

限流配置：

```java
FlowRule flowRule = new FlowRule(FooService.class.getName())
        .setCount(10)
        .setGrade(RuleConstant.FLOW_GRADE_QPS);
FlowRuleManager.loadRules(Collections.singletonList(flowRule));
```

## 二、快速启动示例

### Step 1: 下载源码

```shell script
git clone -b master https://github.com/apache/dubbo-samples.git
cd ./dubbo-samples-sentinel/
```

### Step 2: 构建用例

执行 maven 命令，打包 demo 工程

```bash
mvn clean package
```

### Step 3: 启动 Provider

```java
java -classpath ./target/dubbo-samples-sentinel-1.0-SNAPSHOT.jar org.apache.samples.sentinel.FooProviderBootstrap
```

### Step 4: 启动 OrderService

```java
java -classpath ./target/dubbo-samples-sentinel-1.0-SNAPSHOT.jar org.apache.samples.sentinel.FooConsumerBootstrap
```

可以看到控制台输出中，`Blocked` 代表已经开始拦截。

```
Success: Hello, dubbo at 2022-08-08T15:42:40.809
Success: Hello, dubbo at 2022-08-08T15:42:40.812
Success: Hello, dubbo at 2022-08-08T15:42:40.815
Success: Hello, dubbo at 2022-08-08T15:42:40.818
Success: Hello, dubbo at 2022-08-08T15:42:40.821
Success: Hello, dubbo at 2022-08-08T15:42:40.823
Success: Hello, dubbo at 2022-08-08T15:42:40.826
Success: Hello, dubbo at 2022-08-08T15:42:40.828
Success: Hello, dubbo at 2022-08-08T15:42:40.830
Success: Hello, dubbo at 2022-08-08T15:42:40.834
Blocked
Blocked
Blocked
Blocked
Blocked
```

> 关于 Sentinel 的更多使用方式可以参考：[Sentinel 为 Dubbo 服务保驾护航]({{< relref "../../../../blog/integration/sentinel-introduction-for-dubbo" >}})，[Sentinel 官网](https://sentinelguard.io/zh-cn/index.html)