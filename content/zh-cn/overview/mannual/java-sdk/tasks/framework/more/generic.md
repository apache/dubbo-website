---
aliases:
    - /zh/overview/tasks/develop/generic/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/generic-reference/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/generic-service/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/generic/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/generic-service/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/generic-reference/
description: 泛化调用，用于在调用方没有服务方提供的 API（SDK）的情况下，对服务方进行调用
linkTitle: 泛化调用
title: 泛化调用
type: docs
weight: 1
---

泛化调用（客户端泛化调用）是指在调用方没有服务方提供的 API（SDK）的情况下，对服务方进行调用，并且可以正常拿到调用结果。调用方没有接口及模型类元，知道服务的接口的全限定类名和方法名的情况下，可以通过泛化调用调用对应接口。

## 使用场景

泛化调用可通过一个通用的 GenericService 接口对所有服务发起请求。典型使用场景如下：

1. 网关服务：如果要搭建一个网关服务，那么服务网关要作为所有 RPC 服务的调用端。但是网关本身不应该依赖于服务提供方的接口 API（这样会导致每有一个新的服务发布，就需要修改网关的代码以及重新部署），所以需要泛化调用的支持。

2. 测试平台：如果要搭建一个可以测试 RPC 调用的平台，用户输入分组名、接口、方法名等信息，就可以测试对应的 RPC 服务。那么由于同样的原因（即会导致每有一个新的服务发布，就需要修改网关的代码以及重新部署），所以平台本身不应该依赖于服务提供方的接口 API。所以需要泛化调用的支持。


## 使用方式

本示例中使用"发布和调用" 中示例代码

接口定义：
```java
public interface DevelopService {
    String hello(String param);
}
```

接口实现1：
```java
@DubboService(group = "group1",version = "1.0")
public class DevelopProviderServiceV1 implements DevelopService{
    @Override
    public String hello(String param) {
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
        Object result = genericService.$invoke("hello", new String[]{"java.lang.String"}, new Object[]{"g1"});
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
        ReferenceCache cache = DubboBootstrap.getInstance().getCache();
        try {
            return cache.get(reference);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}
```

1. 在设置 `ReferenceConfig` 时，使用 `setGeneric("true")` 来开启泛化调用
2. 配置完 `ReferenceConfig` 后，使用 `referenceConfig.get()` 获取到 `GenericService` 类的实例
3. 使用其 `$invoke` 方法获取结果
4. 其他设置与正常服务调用配置一致即可

## 更多用法

### 通过 Spring 使用泛化调用
Spring 中服务暴露与服务发现有多种使用方式，如 xml，注解。这里以 xml 为例。
步骤：

1. 生产者端无需改动

2. 消费者端原有的 `dubbo:reference` 标签加上 `generic=true` 的属性。

``` xml
   <dubbo:reference id="helloService" generic = "true" interface="org.apache.dubbo.samples.generic.call.api.HelloService"/>
```

3. 获取到 Bean 容器，通过 Bean 容器拿到 `GenericService` 实例。

4. 调用 `$invoke` 方法获取结果

``` java

    private static GenericService genericService;

    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/generic-impl-consumer.xml");
        context.start();
        //服务对应bean的名字由xml标签的id决定
        genericService = context.getBean("helloService");
        //获得结果
        Object result = genericService.$invoke("sayHello", new String[]{"java.lang.String"}, new Object[]{"world"});
    }
```


### Protobuf 对象泛化调用

一般泛化调用只能用于生成的服务参数为 POJO 的情况，而 GoogleProtobuf 的对象是基于 Builder 生成的非正常 POJO，可以通过 protobuf-json 泛化调用。

GoogleProtobuf 序列化相关的 Demo 可以参考 [protobuf-demo](https://github.com/apache/dubbo-samples/tree/master/3-extensions/serialization/dubbo-samples-protobuf)

#### 通过 Spring 对 Google Protobuf 对象泛化调用

在 Spring 中配置声明 generic = "protobuf-json"

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" generic="protobuf-json" />
```

在 Java 代码获取 barService 并开始泛化调用：

```java
GenericService barService = (GenericService) applicationContext.getBean("barService");
Object result = barService.$invoke("sayHello",new String[]{"org.apache.dubbo.protobuf.GooglePbBasic$CDubboGooglePBRequestType"}, new Object[]{"{\"double\":0.0,\"float\":0.0,\"bytesType\":\"Base64String\",\"int32\":0}"});
```

#### 通过 API 方式对 Google Protobuf 对象泛化调用

```java
ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
// 弱类型接口名
reference.setInterface(GenericService.class.getName());
reference.setInterface("com.xxx.XxxService");
// 声明为Protobuf-json
reference.setGeneric(Constants.GENERIC_SERIALIZATION_PROTOBUF);

GenericService genericService = reference.get();
Map<String, Object> person = new HashMap<String, Object>();
person.put("fixed64", "0");
person.put("int64", "0");
// 参考google官方的protobuf 3 的语法，服务的每个方法中只传输一个POJO对象
// protobuf的泛化调用只允许传递一个类型为String的json对象来代表请求参数
String requestString = new Gson().toJson(person);
// 返回对象是GoolgeProtobuf响应对象的json字符串。
Object result = genericService.$invoke("sayHello", new String[] {
    "com.xxx.XxxService.GooglePbBasic$CDubboGooglePBRequestType"},
    new Object[] {requestString});
```

#### GoogleProtobuf 对象的处理

GoogleProtobuf 对象是由 Protocol 契约生成,相关知识请参考 [ProtocolBuffers 文档](https://developers.google.com/protocol-buffers/?hl=zh-CN)。假如有如下 Protobuf 契约

```proto
syntax = "proto3";
package com.xxx.XxxService.GooglePbBasic.basic;
message CDubboGooglePBRequestType {
    double double = 1;
    float float = 2;
    int32 int32 = 3;
    bool bool = 13;
    string string = 14;
    bytes bytesType = 15;
}

message CDubboGooglePBResponseType {
    string msg = 1;
}

service CDubboGooglePBService {
    rpc sayHello (CDubboGooglePBRequestType) returns (CDubboGooglePBResponseType);
}
```

则对应请求按照如下方法构造

```java
Map<String, Object> person = new HashMap<>();
person.put("double", "1.000");
person.put("float", "1.00");
person.put("int32","1" );
person.put("bool","false" );
//String 的对象需要经过base64编码
person.put("string","someBaseString");
person.put("bytesType","150");
```

#### GoogleProtobuf 服务元数据解析

Google Protobuf 对象缺少标准的 JSON 格式，生成的服务元数据信息存在错误。请添加如下依赖元数据解析的依赖。

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-definition-protobuf</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

从服务元数据中也可以比较容易构建泛化调用对象。


{{% alert title="注意事项" color="primary" %}}

1. 如果参数为基本类型或者 Date,List,Map 等，则不需要转换，直接调用。

2. 如果参数为其他 POJO，则使用 Map 代替。
{{% /alert %}}

如：
``` java
public class Student {
    String name;
    int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}

```

在调用时应该转换为：

``` java
Map<String, Object> student = new HashMap<String, Object>();
student.put("name", "xxx");
student.put("age", "xxx");
```

3. 对于其他序列化格式，需要特殊配置
