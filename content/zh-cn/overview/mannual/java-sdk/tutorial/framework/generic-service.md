---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/generic-service/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/generic-service/
description: 实现一个通用的远程服务 Mock 框架，可通过实现 GenericService 接口处理所有服务请求
linkTitle: 泛化调用
title: 实现泛化实现（服务端泛化）
type: docs
weight: 17
---





## 特性说明
泛接口实现方式主要用于服务器端没有 API 接口及模型类元的情况，参数及返回值中的所有 POJO 均用 Map 表示，通常用于框架集成，比如：实现一个通用的远程服务 Mock 框架，可通过实现 GenericService 接口处理所有服务请求。

## 使用场景
注册服务: 服务提供者在服务注册表中注册服务，例如 Zookeeper，服务注册表存储有关服务的信息，例如其接口、实现类和地址。

部署服务: 服务提供商将服务部署在服务器并使其对消费者可用。

调用服务: 使用者使用服务注册表生成的代理调用服务，代理将请求转发给服务提供商，服务提供商执行服务并将响应发送回消费者。

监视服务：提供者和使用者可以使用 Dubbo 框架监视服务，允许他们查看服务的执行情况，并在必要时进行调整。


## 使用方式
在 Java 代码中实现 `GenericService` 接口

```java
package com.foo;
public class MyGenericService implements GenericService {
 
    public Object $invoke(String methodName, String[] parameterTypes, Object[] args) throws GenericException {
        if ("sayHello".equals(methodName)) {
            return "Welcome " + args[0];
        }
    }
}
```

### 通过 Spring 暴露泛化实现

在 Spring 配置申明服务的实现

```xml
<bean id="genericService" class="com.foo.MyGenericService" />
<dubbo:service interface="com.foo.BarService" ref="genericService" />
```

### 通过 API 方式暴露泛化实现

```java
... 
// 用org.apache.dubbo.rpc.service.GenericService可以替代所有接口实现 
GenericService xxxService = new XxxGenericService(); 

// 该实例很重量，里面封装了所有与注册中心及服务提供方连接，请缓存 
ServiceConfig<GenericService> service = new ServiceConfig<GenericService>();
// 弱类型接口名 
service.setInterface("com.xxx.XxxService");  
service.setVersion("1.0.0"); 
// 指向一个通用服务实现 
service.setRef(xxxService); 
 
// 暴露及注册服务 
service.export();
```