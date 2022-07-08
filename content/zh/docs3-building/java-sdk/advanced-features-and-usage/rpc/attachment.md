---
type: docs
title: "调用链路传递隐式参数"
linkTitle: "调用链路传递隐式参数"
weight: 5
description: "通过 Dubbo 中的 Attachment 在服务消费方和提供方之间隐式传递参数"
---
## 特性说明
可以通过 `RpcContext` 上的 `setAttachment` 和 `getAttachment` 在服务消费方和提供方之间进行参数的隐式传递。 


![/user-guide/images/context.png](/imgs/user/context.png)
#### 注意：
path, group, version, dubbo, token, timeout 几个 key 是保留字段，请使用其它值。

#### 隐式参数配置：
- 服务消费方
- 服务提供方

## 使用场景

内部系统通过 Dubbo 调用时, traceId 如何透传到服务提供方。

## 使用方式
#### 注意：
`setAttachment` 设置的 KV 对，在完成下面一次远程调用会被清空，即多次远程调用要多次设置。
#### 在服务消费方端设置隐式参数
```xml
RpcContext.getContext().setAttachment("index", "1"); // 隐式传参，后面的远程调用都会隐式将这些参数发送到服务器端，类似cookie，用于框架集成，不建议常规业务使用
xxxService.xxx(); // 远程调用
// ...
```
#### 在服务提供方端获取隐式参数
```java
public class XxxServiceImpl implements XxxService {
 
    public void xxx() {
        // 获取客户端隐式传入的参数，用于框架集成，不建议常规业务使用
        String index = RpcContext.getContext().getAttachment("index"); 
    }
}
```
