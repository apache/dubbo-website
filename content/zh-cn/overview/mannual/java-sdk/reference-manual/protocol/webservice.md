---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/webservice/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/webservice/
description: Webservice协议
linkTitle: Webservice协议
title: Webservice协议
type: docs
weight: 11
---







## 特性说明
基于 WebService 的远程调用协议，基于 [Apache CXF](http://cxf.apache.org) 的 `frontend-simple` 和 `transports-http` 实现。`2.3.0` 以上版本支持。

CXF 是 Apache 开源的一个 RPC 框架，由 Xfire 和 Celtix 合并而来。
* 连接个数：多连接
* 连接方式：短连接
* 传输协议：HTTP
* 传输方式：同步传输
* 序列化：SOAP 文本序列化
* 适用场景：系统集成，跨语言调用

可以和原生 WebService 服务互操作，即：

* 提供者用 Dubbo 的 WebService 协议暴露服务，消费者直接用标准 WebService 接口调用，
* 或者提供方用标准 WebService 暴露服务，消费方用 Dubbo 的 WebService 协议调用。
#### 约束
* 参数及返回值需实现 `Serializable` 接口
* 参数尽量使用基本类型和 POJO

## 使用场景
发布一个服务（对内/对外），不考虑客户端类型，不考虑性能，建议使用webservice。服务端已经确定使用webservice，客户端不能选择，必须使用webservice。
## 使用方式
### 依赖

从 Dubbo 3 开始，Webservice 协议已经不再内嵌在 Dubbo 中，需要单独引入独立的[模块](/zh-cn/download/spi-extensions/#dubbo-rpc)。
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-webservice</artifactId>
    <version>1.0.0</version>
</dependency>
```

```xml
<dependency>
    <groupId>org.apache.cxf</groupId>
    <artifactId>cxf-rt-frontend-simple</artifactId>
    <version>2.6.1</version>
</dependency>
<dependency>
    <groupId>org.apache.cxf</groupId>
    <artifactId>cxf-rt-transports-http</artifactId>
    <version>2.6.1</version>
</dependency>
```

### 配置协议
```xml
<dubbo:protocol name="webservice" port="8080" server="jetty" />
```

### 配置默认协议
```xml
<dubbo:provider protocol="webservice" />
```

### 配置服务协议
```xml
<dubbo:service protocol="webservice" />
```

### 多端口
```xml
<dubbo:protocol id="webservice1" name="webservice" port="8080" />
<dubbo:protocol id="webservice2" name="webservice" port="8081" />
```

### 直连
```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="webservice://10.20.153.10:8080/com.foo.HelloWorld" />
```

### WSDL
```
http://10.20.153.10:8080/com.foo.HelloWorld?wsdl
```

### Jetty Server (默认)

```xml
<dubbo:protocol ... server="jetty" />
```

### Servlet Bridge Server (推荐)
```xml
<dubbo:protocol ... server="servlet" />
```

### 配置 DispatcherServlet
```xml
<servlet>
         <servlet-name>dubbo</servlet-name>
         <servlet-class>org.apache.dubbo.remoting.http.servlet.DispatcherServlet</servlet-class>
         <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
         <servlet-name>dubbo</servlet-name>
         <url-pattern>/*</url-pattern>
</servlet-mapping>
```
{{% alert title="注意" color="primary" %}}
 如果使用 servlet 派发请求:
 
 协议的端口 `<dubbo:protocol port="8080" />` 必须与 servlet 容器的端口相同。
 
 协议的上下文路径 `<dubbo:protocol contextpath="foo" />` 必须与 servlet 应用的上下文路径相同。
{{% /alert %}}
