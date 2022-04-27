---
type: docs
title: "泛化调用"
linkTitle: "泛化调用"
weight: 4
description: "实现一个通用的远程服务 Mock 框架，可通过实现 GenericService 接口处理所有服务请求"
---

# 实现泛化服务暴露

泛接口实现方式主要用于服务器端没有 API 接口及模型类元的情况，参数及返回值中的所有 POJO 均用 Map 表示，通常用于框架集成，比如：实现一个通用的远程服务 Mock 框架，可通过实现 GenericService 接口处理所有服务请求。

在 Java 代码中实现 `GenericService` 接口：

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

## 通过 Spring 暴露泛化实现

在 Spring 配置申明服务的实现：

```xml
<bean id="genericService" class="com.foo.MyGenericService" />
<dubbo:service interface="com.foo.BarService" ref="genericService" />
```

## 通过 API 方式暴露泛化实现

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

# 实现泛化服务调用

泛化接口调用方式主要用于客户端没有 API 接口及模型类元的情况，参数及返回值中的所有 POJO 均用 `Map` 表示，通常用于框架集成，比如：实现一个通用的服务测试框架，可通过 `GenericService` 调用所有服务实现。

## 通过 Spring 使用泛化调用

在 Spring 配置申明 `generic="true"`：

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" generic="true" />
```

在 Java 代码获取 barService 并开始泛化调用：

```java
GenericService barService = (GenericService) applicationContext.getBean("barService");
Object result = barService.$invoke("sayHello", new String[] { "java.lang.String" }, new Object[] { "World" });
```

## 通过 API 方式使用泛化调用

```java
import org.apache.dubbo.rpc.service.GenericService; 
... 
 
// 引用远程服务 
// 该实例很重量，里面封装了所有与注册中心及服务提供方连接，请缓存
ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>(); 
// 弱类型接口名
reference.setInterface("com.xxx.XxxService");  
reference.setVersion("1.0.0");
// 声明为泛化接口 
reference.setGeneric(true);  

// 用org.apache.dubbo.rpc.service.GenericService可以替代所有接口引用  
GenericService genericService = reference.get(); 
 
// 基本类型以及Date,List,Map等不需要转换，直接调用 
Object result = genericService.$invoke("sayHello", new String[] {"java.lang.String"}, new Object[] {"world"}); 
 
// 用Map表示POJO参数，如果返回值为POJO也将自动转成Map 
Map<String, Object> person = new HashMap<String, Object>(); 
person.put("name", "xxx"); 
person.put("password", "yyy"); 
// 如果返回POJO将自动转成Map 
Object result = genericService.$invoke("findPerson", new String[]
{"com.xxx.Person"}, new Object[]{person}); 
 
...
```

## 有关泛化类型的进一步解释

假设存在 POJO 如：

```java
package com.xxx;

public class PersonImpl implements Person {
    private String name;
    private String password;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

则 POJO 数据：

```java
Person person = new PersonImpl(); 
person.setName("xxx"); 
person.setPassword("yyy");
```

可用下面 Map 表示：

```java
Map<String, Object> map = new HashMap<String, Object>(); 
// 注意：如果参数类型是接口，或者List等丢失泛型，可通过class属性指定类型。
map.put("class", "com.xxx.PersonImpl"); 
map.put("name", "xxx"); 
map.put("password", "yyy");
```
