---
aliases:
    - /zh/docsv2.7/user/examples/generic-invoke-with-json/
description: 支持Json字符串参数的泛化调用
linkTitle: JSON泛化调用
title: JSON泛化调用
type: docs
weight: 15
---


## 背景
{{% alert title="提示" color="primary" %}}
支持版本：`2.7.12` 之后
{{% /alert %}}

对于Dubbo泛化调用，提供一种新的方式：直接传递字符串来完成一次调用。即用户可以直接传递参数对象的json字符串来完成一次Dubbo泛化调用。

## 示例

### 通过API方式使用json泛化调用

对于以下provider：

```java
public User setUser(User user) {
        return user;
    }
```

用到的实体类：

```java
@Data
public class User {
    String name;
    int age;
}
```

进行一次泛化调用：

```java
public class GenericInvoke {
    public static void main(String[] args) {
        ApplicationConfig app = new ApplicationConfig("ConsumerTest");
        RegistryConfig reg = new RegistryConfig("nacos://localhost:8848");

        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application(app);
        bootstrap.registry(reg);
        bootstrap.start();

            try {
                // 引用远程服务
                ReferenceConfig<GenericService> reference = new ReferenceConfig<>();
                // 弱类型接口名    
                reference.setInterface("com.xxx.api.service.TestService");
                reference.setGroup("dev");
                reference.setVersion("1.0");
                reference.setRetries(0);
                // RpcContext中设置generic=gson
                RpcContext.getContext().setAttachment("generic","gson");
                // 声明为泛化接口
                reference.setGeneric(true);
                reference.setCheck(false);
                GenericService genericService = ReferenceConfigCache.getCache().get(reference);
                // 传递参数对象的json字符串进行一次调用
                Object res = genericService.$invoke("setUser", new String[]{"com.xxx.api.service.User"}, new Object[]{"{'name':'Tom','age':24}"});
                System.out.println("result[setUser]："+res); // 响应结果:result[setUser]：{name=Tom, class=com.xxx.api.service.User, age=24}
            } catch (Throwable ex) {
                ex.printStackTrace();
            }
    }
}
```