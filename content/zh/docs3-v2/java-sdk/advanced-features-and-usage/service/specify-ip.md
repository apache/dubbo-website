---
type: docs
title: "动态指定 IP 调用"
linkTitle: "运行时动态指定 IP 调用"
weight: 5
description: "在发起 Dubbo 调用之前指定本次调用的目标 IP"
---

## 使用场景

发起请求的时候需要指定本次调用的服务端，如消息回调、流量隔离等。

## 使用方式

#### 插件依赖

适配 Dubbo 3 版本

```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>dubbo-cluster-specify-address-dubbo3</artifactId>
  <version>1.0.0</version>
</dependency>
```

适配 Dubbo 2 版本

```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>dubbo-cluster-specify-address-dubbo2</artifactId>
  <version>1.0.0</version>
</dependency>
```

#### 调用示例

```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<>();
// ... init
DemoService demoService = referenceConfig.get();

// for invoke
// 1. find 10.10.10.10:20880 exist
// 2. if not exist, create a invoker to 10.10.10.10:20880 if `needToCreate` is true (only support in Dubbo 3.x's implementation)
UserSpecifiedAddressUtil.setAddress(new Address("10.10.10.10", 20880, true));
demoService.sayHello("world");


// for invoke
// 1. find 10.10.10.10:any exist
// 2. if not exist, create a invoker to 10.10.10.10:20880 if `needToCreate` is true (only support in Dubbo 3.x's implementation)
UserSpecifiedAddressUtil.setAddress(new Address("10.10.10.10", 0, true));
demoService.sayHello("world");
```

#### 参数说明

指定 IP 调用的参数围绕 `Address` 对象展开。参数类型参考如下：

```java
package org.apache.dubbo.rpc.cluster.specifyaddress;

public class Address implements Serializable {
    // ip - priority: 3
    private String ip;

    // ip+port - priority: 2
    private int port;

    // address - priority: 1
    private URL urlAddress;
    
    private boolean needToCreate = false;

    // ignore setter and getter
}
```

1. `urlAddress` 为最高优先级，如果指定了目标的 URL 地址，会优先使用该地址。(不再匹配后续)
2. ip + port（非 0 端口） 为第二优先级，会从注册中心已经推送的地址中进行匹配。(不再匹配后续)
3. ip 为第三优先级，会从注册中心已经推送的地址中进行匹配。

特别的，如果指定了 `needToCreate` 为 `true`，将会自动根据传入的参数构建一个 invoker。对于通过指定 ip ( + port ) 方式指定的地址，
将会自动使用注册中心中第一个地址的参数为模板进行创建；如果无地址将基于 Dubbo 协议自动创建。
如需定制创建 invoker 的逻辑请实现 `org.apache.dubbo.rpc.cluster.specifyaddress.UserSpecifiedServiceAddressBuilder` SPI 接口。（此功能仅**Dubbo 3 实现支持**）

在构建完 `Address` 参数每次请求前通过 `UserSpecifiedAddressUtil` 工具类传给 Dubbo 框架。

```java
package org.apache.dubbo.rpc.cluster.specifyaddress;

public class UserSpecifiedAddressUtil {
    
    public static void setAddress(Address address) { ... }
    
}
```

注：**必须每次都设置，而且设置后必须马上发起调用**，如果出现拦截器报错（Dubbo 框架内 remove 此值是在选址过程进行的）建议设置 null 以避免 ThreadLocal 内存泄漏导致影响后续调用。