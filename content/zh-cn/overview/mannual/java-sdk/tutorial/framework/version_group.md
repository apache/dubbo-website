---
aliases:
    - /zh/overview/tasks/develop/version_group/
description: ""
linkTitle: 版本与分组
title: 版本与分组
type: docs
weight: 4
---


## 版本与分组
Dubbo服务中，接口并不能唯一确定一个服务，只有接口+分组+版本号才能唯一确定一个服务。

## 使用场景
* 当同一个接口针对不同的业务场景、不同的使用需求或者不同的功能模块等场景，可使用服务分组来区分不同的实现方式。同时，这些不同实现所提供的服务是可并存的，也支持互相调用。
* 当接口实现需要升级又要保留原有实现的情况下，即出现不兼容升级时，我们可以使用不同版本号进行区分。


## 使用方式
使用 @DubboService 注解，添加 group 参数和 version 参数
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
接口实现2：
```java
@DubboService(group = "group2",version = "2.0")
public class DevelopProviderServiceV2 implements DevelopService{
    @Override
    public String invoke(String param) {
        StringBuilder s = new StringBuilder();
        s.append("ServiceV2 param:").append(param);
        return s.toString();
    }
}
```

启动服务后，可以在注册中心看到对应的服务列表，如下：
`![serviceList](/imgs/v3/develop/develop-service-list.png)`


客户端接口调用：

> 使用 @DubboReference 注解，添加 group 参数和 version 参数

```java
@DubboReference(group = "group1",version = "1.0")
private DevelopService developService;

@DubboReference(group = "group2",version = "2.0")
private DevelopService developServiceV2;

@Override
public void run(String... args) throws Exception {
    //调用DevelopService的group1分组实现
    System.out.println("Dubbo Remote Return ======> " + developService.invoke("1"));
    //调用DevelopService的另一个实现
    System.out.println("Dubbo Remote Return ======> " + developServiceV2.invoke("2"));
}
```