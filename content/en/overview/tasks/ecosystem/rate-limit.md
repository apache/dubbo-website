---
type: docs
title: "Current Limit Downgrade"
linkTitle: "Current limit downgrade"
weight: 2
description: "Use Sentinel to protect your application from stability issues caused by sudden traffic overload of individual services."
---

## What is Sentinel

With the popularity of microservices, the stability between services and services has become more and more important. Sentinel is a traffic management component for distributed, multilingual and heterogeneous service architectures. It mainly uses traffic as the entry point, from traffic routing, traffic control, traffic shaping, fuse downgrade, system adaptive overload protection, hotspot traffic protection, etc. dimensions to help developers ensure the stability of microservices.

## 1. Example architecture description

Interface definition:

```java
public interface FooService {

     String sayHello(String name);
}
```

Interface implementation:

```java
@DubboService(timeout = 3000)
public class FooServiceImpl implements FooService {

     @Override
     public String sayHello(String name) {
         return String. format("Hello, %s at %s", name, LocalDateTime. now());
     }
}
```

Current limiting configuration:

```java
FlowRule flowRule = new FlowRule(FooService. class. getName())
         .setCount(10)
         .setGrade(RuleConstant.FLOW_GRADE_QPS);
FlowRuleManager. loadRules(Collections. singletonList(flowRule));
```

## 2. Quick start example

### Step 1: Download the source code

```shell script
git clone -b master https://github.com/apache/dubbo-samples.git
cd ./dubbo-samples-sentinel/
```

### Step 2: Build use cases

Execute the maven command to package the demo project

```bash
mvn clean package
```

### Step 3: Start Provider

```java
java -classpath ./target/dubbo-samples-sentinel-1.0-SNAPSHOT.jar org.apache.samples.sentinel.FooProviderBootstrap
```

### Step 4: Start OrderService

```java
java -classpath ./target/dubbo-samples-sentinel-1.0-SNAPSHOT.jar org.apache.samples.sentinel.FooConsumerBootstrap
```

You can see that in the console output, `Blocked` means that blocking has started.

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

> For more usage methods of Sentinel, please refer to: [Sentinel escorts Dubbo services](/zh-cn/blog/2018/07/27/sentinel-为-dubbo-服务保驾护航/), [Sentinel official website](https://sentinelguard.io/zh-cn/index.html)