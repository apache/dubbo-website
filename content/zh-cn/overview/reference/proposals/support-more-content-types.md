---
aliases:
    - /zh/overview/reference/proposals/support-more-content-type/
author: 武钰皓
description: |
    本文主要介绍Triple对更多Http标准Content-Type的支持方式，以及服务该如何接收这些请求。
title: Triple协议Http标准能力增强-多Content-Type支持
type: docs
working_in_progress: true
---

### **Triple协议Http标准能力增强-多Content-Type支持**
> 本文主要介绍Triple对更多HTTP标准Content-Type的支持方式，以及服务该如何接收这些请求。
#### **概述**

Triple目前支持两种序列化方式：Json和protobuf，对应的ContentType：

* application/json
* application/grpc+proto

这在消费者和提供者都是后端服务时没有问题。但对于浏览器客户端，其可能发送更多类型的ContentType，需要服务端支持解码，如：

* multipart/formdata
* text/plain
* application/x-www-form-urlencoded
* application/xml

Rest已基本实现上述解码能力，使Triple实现这些能力是让Triple服务端与浏览器客户端完全互通的重要一步。



#### **用法**

##### **multipart/formdata**

```http
POST /org.apache.dubbo.samples.tri.noidl.api.PojoGreeter/greetPojo HTTP/1.1
Host: 192.168.202.1:50052
Content-Type: multipart/form-data; boundary=example-part-boundary
Accept: application/json
 
--example-part-boundary
Content-Disposition: form-data; name="username"
Content-Type: text/plain
    
LuYue
--example-part-boundary
Content-Disposition: form-data; name="userdetail"
Content-Type: application/json
 
{
    "location":"beijing",
    "username":"LuYue"
}
--example-part-boundary
Content-Disposition: form-data; name="userimg";filename="user.jpeg"
Content-Type: image/jpeg
<binary-image data>
--example-part-boundary--
```

接收：

```java
    @Override
    public ServerResponse greetPojo(String username, User user, byte[] attachment) {
        //LuYue
        System.out.println(username); 
        //user.name=Luyue;user.location=beijing
        System.out.println(user); 
        //<binary-image data>
        System.out.println(new String(attachment, StandardCharsets.UTF_8)); 
        return new ServerResponse("Server Received:"+username);
    }
```

* 每一个 part 根据其 Content-Type 解码
* 若方法参数是 byte[] 或 Byte[]，对应字段不会解码
* 响应使用 application/json 编码



##### application/x-www-form-urlencoded

```http
POST /org.apache.dubbo.samples.tri.noidl.api.PojoGreeter/greetUrlForm HTTP/1.1
Host: 192.168.202.1:50052
Content-Type: application/x-www-form-urlencoded
Content-Length: 33
Accept: application/json
Hello=World&Apache=Dubbo&id=10086
```

两种接收方式：

```java
    public ServerResponse greetUrlForm(String hello,String apache,long id){
        System.out.println("Hello:"+hello);
        System.out.println("Apache:"+apache);
        System.out.println("Id:"+id);
        return new ServerResponse("Server Received url form");
    }
```

```java
    public ServerResponse greetUrlForm(Map<String,Object> params){
        System.out.println("Hello:"+params.get("Hello"));
        System.out.println("Apache"+params.get("Apache"));
        System.out.println("Id"+params.get("Id"));
        return new ServerResponse("Server Received url form");
    }
```

* 若参数为Map，则解码为Map<String,String>传入
* 若参数均为String或数值类型，按照参数列表逐个解码传入
* 响应使用 application/json 编码



##### text/plain

```http
POST /org.apache.dubbo.samples.tri.noidl.api.PojoGreeter/greetString HTTP/1.1
Host: 192.168.202.1:50052
Content-Type: text/plain; charset=UTF-8
Content-Length: 6
Accept: application/json
World!
```

接收：

```java
    public ServerResponse greetUrlForm(String world){
        System.out.println("Hello:"+ world);
        return new ServerResponse("Server Received url form.");
    }
```

* charset支持ASCII、UTF-8、UTF-16等，默认UTF-8
* 响应使用 application/json 编码



##### application/xml

```http
POST /org.apache.dubbo.samples.tri.noidl.api.PojoGreeter/greetXml HTTP/1.1
Host: 192.168.202.1:50052
Content-Type: application/xml
Content-Length: 86
Accept: application/xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<User>
    <username>JohnDoe</username>
    <location>New York</location>
</User>
```

接收：

```java
    @Override
    public ServerResponse greetXml(User user) {
        System.out.println(user.getUsername());
        System.out.println(user.getLocation());
        return new ServerResponse("Server Received xml.");
    }
```

* 该实现与Rest的XMLCodec相同
* 响应使用 application/xml 编码