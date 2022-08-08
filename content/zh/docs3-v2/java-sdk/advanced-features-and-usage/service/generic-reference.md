---
type: docs
linkTitle: "泛化调用"
title: "泛化调用（客户端泛化）"
weight: 4
description: "不需要服务端API的RPC调用"
---

## 特性说明

泛化调用是指在调用方没有服务方提供的API（SDK）的情况下，对服务方进行调用，并且可以正常拿到调用结果。

## 使用场景

泛化调用主要用于实现一个通用的远程服务 Mock 框架，可通过实现 GenericService 接口处理所有服务请求。比如如下场景：

1. 网关服务：如果要搭建一个网关服务，那么服务网关要作为所有RPC服务的调用端。但是网关本身不应该依赖于服务提供方的接口API（这样会导致每有一个新的服务发布，就需要修改网关的代码以及重新部署），所以需要泛化调用的支持。

2. 测试平台：如果要搭建一个可以测试RPC调用的平台，用户输入分组名、接口、方法名等信息，就可以测试对应的RPC服务。那么由于同样的原因（即会导致每有一个新的服务发布，就需要修改网关的代码以及重新部署），所以平台本身不应该依赖于服务提供方的接口API。所以需要泛化调用的支持。

## 使用方式

demo可见[dubbo 项目中的示例代码](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-generic)

API部分以此demo为例讲解使用方式。

### 服务定义

#### 服务接口

``` java
public interface HelloService {

    String sayHello(String name);

    CompletableFuture<String> sayHelloAsync(String name);

    CompletableFuture<Person> sayHelloAsyncComplex(String name);

    CompletableFuture<GenericType<Person>> sayHelloAsyncGenericComplex(String name);
}

```

#### 服务实现类

``` java
public class HelloServiceImpl implements HelloService {

    @Override
    public String sayHello(String name) {
        return "sayHello: " + name;
    }

    @Override
    public CompletableFuture<String> sayHelloAsync(String name) {
        CompletableFuture<String> future = new CompletableFuture<>();
        new Thread(() -> {
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            future.complete("sayHelloAsync: " + name);
        }).start();

        return future;
    }

    @Override
    public CompletableFuture<Person> sayHelloAsyncComplex(String name) {
        Person person = new Person(1, "sayHelloAsyncComplex: " + name);
        CompletableFuture<Person> future = new CompletableFuture<>();
        new Thread(() -> {
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            future.complete(person);
        }).start();

        return future;
    }

    @Override
    public CompletableFuture<GenericType<Person>> sayHelloAsyncGenericComplex(String name) {
        Person person = new Person(1, "sayHelloAsyncGenericComplex: " + name);
        GenericType<Person> genericType = new GenericType<>(person);
        CompletableFuture<GenericType<Person>> future = new CompletableFuture<>();
        new Thread(() -> {
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            future.complete(genericType);
        }).start();

        return future;
    }
}

```

### 通过API使用泛化调用

#### 服务启动方

1. 在设置 `ServiceConfig` 时，使用`setGeneric("true")`来开启泛化调用

2. 在设置 `ServiceConfig` 时，使用setRef指定实现类时，要设置一个 `GenericService` 的对象。而不是真正的服务实现类对象

3. 其他设置与正常Api服务启动一致即可

``` java
private static String zookeeperAddress = "zookeeper://" + System.getProperty("zookeeper.address", "127.0.0.1") + ":2181";

    public static void main(String[] args) throws Exception {
        new EmbeddedZooKeeper(2181, false).start();

        //创建ApplicationConfig
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("generic-impl-provider");
        //创建注册中心配置
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress(zookeeperAddress);
        
        //新建服务实现类，注意要使用GenericService接收
        GenericService helloService = new GenericImplOfHelloService();

        //创建服务相关配置
        ServiceConfig<GenericService> service = new ServiceConfig<>();
        service.setApplication(applicationConfig);
        service.setRegistry(registryConfig);
        service.setInterface("org.apache.dubbo.samples.generic.call.api.HelloService");
        service.setRef(helloService);
        //重点：设置为泛化调用
        //注：不再推荐使用参数为布尔值的setGeneric函数
        //应该使用referenceConfig.setGeneric("true")代替
        service.setGeneric("true");
        service.export();

        System.out.println("dubbo service started");
        
        new CountDownLatch(1).await();
    }
}
```

#### 泛化调用方
步骤：

1. 在设置 `ReferenceConfig` 时，使用 `setGeneric("true")` 来开启泛化调用

2. 配置完 `ReferenceConfig` 后，使用 `referenceConfig.get()` 获取到 `GenericService` 类的实例

3. 使用其 `$invoke` 方法获取结果

4. 其他设置与正常 Api 服务启动一致即可

``` java
    //定义泛化调用服务类
    private static GenericService genericService;
    public static void main(String[] args) throws Exception {
        //创建ApplicationConfig
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("generic-call-consumer");
        //创建注册中心配置
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("zookeeper://127.0.0.1:2181");
        //创建服务引用配置
        ReferenceConfig<GenericService> referenceConfig = new ReferenceConfig<>();
        //设置接口
        referenceConfig.setInterface("org.apache.dubbo.samples.generic.call.api.HelloService");
        applicationConfig.setRegistry(registryConfig);
        referenceConfig.setApplication(applicationConfig);
        //重点：设置为泛化调用
        //注：不再推荐使用参数为布尔值的setGeneric函数
        //应该使用referenceConfig.setGeneric("true")代替
        referenceConfig.setGeneric(true);
        //设置异步，不必须，根据业务而定。
        referenceConfig.setAsync(true);
        //设置超时时间
        referenceConfig.setTimeout(7000);
        
        //获取服务，由于是泛化调用，所以获取的一定是GenericService类型
        genericService = referenceConfig.get();
        
        //使用GenericService类对象的$invoke方法可以代替原方法使用
        //第一个参数是需要调用的方法名
        //第二个参数是需要调用的方法的参数类型数组，为String数组，里面存入参数的全类名。
        //第三个参数是需要调用的方法的参数数组，为Object数组，里面存入需要的参数。
        Object result = genericService.$invoke("sayHello", new String[]{"java.lang.String"}, new Object[]{"world"});
        //使用CountDownLatch，如果使用同步调用则不需要这么做。
        CountDownLatch latch = new CountDownLatch(1);
        //获取结果
        CompletableFuture<String> future = RpcContext.getContext().getCompletableFuture();
        future.whenComplete((value, t) -> {
            System.err.println("invokeSayHello(whenComplete): " + value);
            latch.countDown();
        });
        //打印结果
        System.err.println("invokeSayHello(return): " + result);
        latch.await();
    }
```

### 通过Spring使用泛化调用
Spring中服务暴露与服务发现有多种使用方式，如xml，注解。这里以xml为例。
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


### Protobuf对象泛化调用

一般泛化调用只能用于生成的服务参数为POJO的情况，而 GoogleProtobuf 的对象是基于 Builder 生成的非正常POJO，可以通过 protobuf-json 泛化调用。

GoogleProtobuf 序列化相关的Demo可以参考 [protobuf-demo](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-protobuf)

#### 通过Spring对Google Protobuf对象泛化调用

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

GoogleProtobuf 对象是由 Protocol 契约生成,相关知识请参考 [ProtocolBuffers 文档](https://developers.google.com/protocol-buffers/?hl=zh-CN)。假如有如下Protobuf 契约

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


## 注意事项

1. 如果参数为基本类型或者Date,List,Map等，则不需要转换，直接调用。

2. 如果参数为其他POJO，则使用Map代替。

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