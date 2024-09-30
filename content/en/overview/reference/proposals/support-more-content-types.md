---
aliases:
    - /en/overview/reference/proposals/support-more-content-type/
author: Wu Yuhao
description: |
    This article mainly introduces how Triple supports more standard HTTP Content-Types and how services should handle these requests.
title: Enhanced HTTP Standard Capabilities of Triple - Multi Content-Type Support
type: docs
working_in_progress: true
---

### **Enhanced HTTP Standard Capabilities of Triple - Multi Content-Type Support**
> This article mainly introduces how Triple supports more standard HTTP Content-Types and how services should handle these requests.
#### **Overview**

Triple currently supports two serialization methods: Json and protobuf, corresponding to the ContentTypes:

* application/json
* application/grpc+proto

This poses no problem when both consumers and providers are backend services. However, for browser clients, they may send more types of ContentTypes that the server needs to support for decoding, such as:

* multipart/formdata
* text/plain
* application/x-www-form-urlencoded
* application/xml

Rest has basically implemented the above decoding capabilities, making it an important step for Triple to achieve complete interoperability between Triple servers and browser clients.

#### **Usage**

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

Receiving:

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

* Each part is decoded based on its Content-Type.
* If the method parameter is byte[] or Byte[], the corresponding field will not be decoded.
* The response is encoded using application/json.

##### application/x-www-form-urlencoded

```http
POST /org.apache.dubbo.samples.tri.noidl.api.PojoGreeter/greetUrlForm HTTP/1.1
Host: 192.168.202.1:50052
Content-Type: application/x-www-form-urlencoded
Content-Length: 33
Accept: application/json
Hello=World&Apache=Dubbo&id=10086
```

Two receiving methods:

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

* If the parameter is a Map, it is decoded as Map<String,String>.
* If the parameters are all String or numeric types, they are decoded one by one according to the parameter list.
* The response is encoded using application/json.

##### text/plain

```http
POST /org.apache.dubbo.samples.tri.noidl.api.PojoGreeter/greetString HTTP/1.1
Host: 192.168.202.1:50052
Content-Type: text/plain; charset=UTF-8
Content-Length: 6
Accept: application/json
World!
```

Receiving:

```java
    public ServerResponse greetUrlForm(String world){
        System.out.println("Hello:"+ world);
        return new ServerResponse("Server Received url form.");
    }
```

* Charset supports ASCII, UTF-8, UTF-16, etc., defaulting to UTF-8.
* The response is encoded using application/json.

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

Receiving:

```java
    @Override
    public ServerResponse greetXml(User user) {
        System.out.println(user.getUsername());
        System.out.println(user.getLocation());
        return new ServerResponse("Server Received xml.");
    }
```

* This implementation is the same as Rest's XMLCodec.
* The response is encoded using application/xml.

