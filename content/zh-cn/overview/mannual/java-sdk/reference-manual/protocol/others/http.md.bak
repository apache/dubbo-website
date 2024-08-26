---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/http/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/http/
    - /zh/overview/what/ecosystem/protocol/http/
description: HTTP协议
linkTitle: HTTP协议
title: HTTP协议
type: docs
weight: 6
---







## 特性说明
基于 HTTP 表单的远程调用协议，采用 Spring 的 HttpInvoker 实现，`2.3.0` 以上版本支持。

* 连接个数：多连接
* 连接方式：短连接
* 传输协议：HTTP
* 传输方式：同步传输
* 序列化：表单序列化
* 适用范围：传入传出参数数据包大小混合，提供者比消费者个数多，可用浏览器查看，可用表单或URL传入参数，暂不支持传文件。
* 适用场景：需同时给应用程序和浏览器 JS 使用的服务。

#### 约束
* 参数及返回值需符合 Bean 规范

## 使用场景

http短连接，协议标准化且易读，容易对接外部系统，适用于上层业务模块。

## 使用方式

从 Dubbo 3 开始，Http 协议已经不再内嵌在 Dubbo 中，需要单独引入独立的[模块](/zh-cn/download/spi-extensions/#dubbo-rpc)。
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-http</artifactId>
    <version>3.3.0</version>
</dependency>
```

### 配置协议
```xml
<dubbo:protocol name="http" port="8080" />
```

### 配置 Jetty Server (默认)
```xml
<dubbo:protocol ... server="jetty" />
```

### 配置 Servlet Bridge Server (推荐使用)
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
如果使用 servlet 派发请求
* 协议的端口 `<dubbo:protocol port="8080" />` 必须与 servlet 容器的端口相同，
* 协议的上下文路径 `<dubbo:protocol contextpath="foo" />` 必须与 servlet 应用的上下文路径相同。
{{% /alert %}}
