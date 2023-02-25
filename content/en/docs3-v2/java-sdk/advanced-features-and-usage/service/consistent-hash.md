---
type: docs
title: "Consistent Hash Site Selection"
linkTitle: "Consistent Hash Site Selection"
weight: 6
description: "Address selection based on consistent hash in the load balancing phase"
---
## Feature description

[Analysis of Dubbo Consistent Hash Load Balancing Implementation](/zh-cn/blog/2019/05/01/dubbo-%E4%B8%80%E8%87%B4%E6%80%A7hash%E8%B4%9F%E8 %BD%BD%E5%9D%87%E8%A1%A1%E5%AE%9E%E7%8E%B0%E5%89%96%E6%9E%90/)

## scenes to be used

When there are multiple servers, the server is selected according to the consistent hashing of the request parameters.

## How to use

There are many ways to configure consistent hashing, the most common are:

### Annotation configuration

> @DubboReference(loadbalance = "consistenthash")

### API configuration

> referenceConfig.setLoadBalance("consistenthash");

### Properties configuration

> dubbo.reference.loadbalance=consistenthash

### XML configuration

> <dubbo:reference loadbalance="consistenthash" />

By default, the first parameter is used as the hash key. If you need to switch parameters, you can specify the `hash.arguments` property

```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<DemoService>();
// ...init
Map<String, String> parameters = new HashMap<String, String>();
parameters. put("hash. arguments", "1");
parameters. put("sayHello. hash. arguments", "0,1");
referenceConfig.setParameters(parameters);
referenceConfig.setLoadBalance("consistenthash");
referenceConfig. get();
```