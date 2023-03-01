---
aliases:
    - /zh/overview/tasks/develop/generic/
description: 在调用方没有服务方提供的 API（SDK）的情况下，对服务方进行调用
linkTitle: 泛化调用
title: 开发服务
type: docs
weight: 6
---


## 泛化调用
泛化调用（客户端泛化调用）是指在调用方没有服务方提供的 API（SDK）的情况下，对服务方进行调用，并且可以正常拿到调用结果。

## 使用场景
调用方没有接口及模型类元，知道服务的接口的全限定类名和方法名的情况下，可以通过泛化调用调用对应接口。
比如：实现一个通用的服务测试框架

## 使用方式

本示例中使用"发布和调用" 中示例代码

接口定义：
```java
public interface DevelopService {
    String invoke(String param);
}
```

接口实现1：
```java
@DubboService(group = "group1",version = "1.0")
public class DevelopProviderServiceV1 implements DevelopService{
    @Override
    public String invoke(String param) {
        StringBuilder s = new StringBuilder();
        s.append("ServiceV1 param:").append(param);
        return s.toString();
    }
}
```

## 客户端调用

```java
@Component
public class GenericTask implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        GenericService genericService = buildGenericService("org.apache.dubbo.samples.develop.DevelopService","group2","2.0");
        //传入需要调用的方法，参数类型列表，参数列表
        Object result = genericService.$invoke("invoke", new String[]{"java.lang.String"}, new Object[]{"g1"});
        System.out.println("GenericTask Response: " + JSON.toJSONString(result));
    }

    private GenericService buildGenericService(String interfaceClass, String group, String version) {
        ReferenceConfig<GenericService> reference = new ReferenceConfig<>();
        reference.setInterface(interfaceClass);
        reference.setVersion(version);
        //开启泛化调用
        reference.setGeneric("true");
        reference.setTimeout(30000);
        reference.setGroup(group);
        ReferenceCache cache = SimpleReferenceCache.getCache();
        try {
            return cache.get(reference);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}
```