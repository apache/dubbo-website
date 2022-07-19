---
type: docs
title: "QOS 概述"
linkTitle: "QOS 概述"
weight: 1
---

## 特性说明
dubbo `2.5.8` 新版本增加了 QOS 模块，提供了新的 telnet 命令支持。

#### 相关参数说明
QoS 提供了一些启动参数，来对启动进行配置，他们主要包括：

| 参数               | 说明              | 默认值 |
| ------------------ | ----------------- | ------ |
| qos-enable          | 是否启动QoS       | true   |
| qos-port            | 启动QoS绑定的端口 | 22222  |
| qos-accept-foreign-ip | 是否允许远程访问  | false  |

> 注意，从2.6.4/2.7.0开始，qos-accept-foreign-ip默认配置改为false，如果qos-accept-foreign-ip设置为true，有可能带来安全风险，请仔细评估后再打开。

#### QoS 参数配置

* 系统属性
* dubbo.properties
* XML方式
* Spring-boot 自动装配方式

其中，上述方式的优先顺序为系统属性 > dubbo.properties > XML/Spring-boot 自动装配方式。

## 使用说明
#### 端口
新版本的 telnet 端口 与 dubbo 协议的端口是不同的端口，默认为 `22222`

可以通过配置文件`dubbo.properties` 修改:
```
dubbo.application.qos-port=33333
```
或者
可以通过设置 JVM 参数:
```
-Ddubbo.application.qos-port=33333
```

#### 安全
默认情况下，dubbo 接收任何主机发起的命令

可以通过配置文件`dubbo.properties` 修改:
```
dubbo.application.qos-accept-foreign-ip=false
```
或者

可以通过设置 JVM 参数:
```
-Ddubbo.application.qos-accept-foreign-ip=false
```
拒绝远端主机发出的命令，只允许服务本机执行。


#### telnet 与 http 协议

telnet 模块现在同时支持 http 协议和 telnet 协议，方便各种情况的使用
示例：
```
➜  ~ telnet localhost 22222
Trying ::1...
telnet: connect to address ::1: Connection refused
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
  ████████▄  ███    █▄  ▀█████████▄  ▀█████████▄   ▄██████▄
  ███   ▀███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███  ▄███▄▄▄██▀   ▄███▄▄▄██▀  ███    ███
  ███    ███ ███    ███ ▀▀███▀▀▀██▄  ▀▀███▀▀▀██▄  ███    ███
  ███    ███ ███    ███   ███    ██▄   ███    ██▄ ███    ███
  ███   ▄███ ███    ███   ███    ███   ███    ███ ███    ███
  ████████▀  ████████▀  ▄█████████▀  ▄█████████▀   ▀██████▀


dubbo>ls
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|org.apache.dubbo.demo.DemoService| N |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+

dubbo>
```


```
➜  ~ curl "localhost:22222/ls?arg1=xxx&arg2=xxxx"
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|org.apache.dubbo.demo.DemoService| N |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```

#### 使用系统属性方式配置
```
-Ddubbo.application.qos-enable=true
-Ddubbo.application.qos-port=33333
-Ddubbo.application.qos-accept-foreign-ip=false
```

#### 使用 dubbo.properties 文件配置
在项目的`src/main/resources`目录下添加 dubbo.properties文件，内容如下:
```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
```

#### 使用XML方法配置
如果要通过 XML 配置响应的QoS相关的参数，可以进行如下配置：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
  <dubbo:application name="demo-provider">
    <dubbo:parameter key="qos-enable" value="true"/>
    <dubbo:parameter key="qos-accept-foreign-ip" value="false"/>
    <dubbo:parameter key="qos-port" value="33333"/>
  </dubbo:application>
  <dubbo:registry address="multicast://224.5.6.7:1234"/>
  <dubbo:protocol name="dubbo" port="20880"/>
  <dubbo:service interface="org.apache.dubbo.demo.provider.DemoService" ref="demoService"/>
  <bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
</beans>
```

#### 使用 spring-boot 自动装配方式配置
如果是 spring-boot 的应用，可以在`application.properties`或者`application.yml`上配置:

```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
```
