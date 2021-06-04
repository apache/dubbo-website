---
type: docs
title: "GoogleProtobuf 对象泛化调用"
linkTitle: "Protobuf 泛化调用"
weight: 17
description: "对 Google Protobuf 对象进行泛化调用"
---

泛化接口调用方式主要用于客户端没有 API 接口及模型类元的情况，参考 [泛化调用](../generic-reference)。
一般泛化调用只能用于生成的服务参数为POJO的情况，而 GoogleProtobuf 的对象是基于 Builder 生成的非正常POJO，可以通过 protobuf-json 泛化调用。  

GoogleProtobuf 序列化相关的Demo可以参考 [protobuf-demo](https://github.com/vio-lin/dubbo-samples/tree/protobuf-demo)

## 通过Spring对Google Protobuf对象泛化调用

在 Spring 中配置声明 generic = "protobuf-json"

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" generic="protobuf-json" />
```

在 Java 代码获取 barService 并开始泛化调用：

```java
GenericService barService = (GenericService) applicationContext.getBean("barService");
Object result = barService.$invoke("sayHello",new String[]{"org.apache.dubbo.protobuf.GooglePbBasic$CDubboGooglePBRequestType"}, new Object[]{"{\"double\":0.0,\"float\":0.0,\"bytesType\":\"Base64String\",\"int32\":0}"});
```

## 通过 API 方式对 Google Protobuf 对象泛化调用

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

## GoogleProtobuf 对象的处理

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

## GoogleProtobuf 服务元数据解析

Google Protobuf 对象缺少标准的 JSON 格式，生成的服务元数据信息存在错误。请添加如下依赖元数据解析的依赖。

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-definition-protobuf</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

从服务元数据中也可以比较容易构建泛化调用对象。
