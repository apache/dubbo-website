---
type: docs
title: "在线运维命令参考手册"
linkTitle: "QOS 手册"
weight: 11
description: "新版本 telnet 命令使用说明"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/qos/)。
{{% /pageinfo %}}

dubbo `2.5.8` 新版本增加了 QOS 模块，提供了新的 telnet 命令支持。

## 端口
新版本的 telnet 端口 与 dubbo 协议的端口是不同的端口，默认为 `22222`，可通过配置文件`dubbo.properties` 修改:

```
dubbo.application.qos-port=33333
```

或者通过设置 JVM 参数:

```
-Ddubbo.application.qos-port=33333
```

## 安全

默认情况下，dubbo 接收任何主机发起的命令，可通过配置文件`dubbo.properties` 修改:

```
dubbo.application.qos-accept-foreign-ip=false
```

或者通过设置 JVM 参数:

```
-Ddubbo.application.qos-accept-foreign-ip=false
```

拒绝远端主机发出的命令，只允许服务本机执行


## telnet 与 http 协议

telnet 模块现在同时支持 http 协议和 telnet 协议，方便各种情况的使用

示例如下：

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

## 支持的命令

### ls 列出消费者和提供者

```
dubbo>ls
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|org.apache.dubbo.demo.DemoService| Y |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```

列出 dubbo 的所提供的服务和消费的服务，以及消费的服务地址数

### Online 上线服务命令

当使用延迟发布功能的时候(通过设置 org.apache.dubbo.config.AbstractServiceConfig#register 为 false)，后续需要上线的时候，可通过 Online 命令

```
//上线所有服务
dubbo>online
OK

//根据正则，上线部分服务
dubbo>online com.*
OK
```

常见使用场景：

 - 当线上的 QPS 比较高的时候，当刚重启机器的时候，由于没有进行JIT 预热或相关资源没有预热，可能会导致大量超时，这个时候，可通过分批发布服务，逐渐加大流量
 - 当由于某台机器由于某种原因，需要下线服务，然后又需要重新上线服务



### Offline 下线服务命令

由于故障等原因，需要临时下线服务保持现场，可以使用 Offline 下线命令。


```
//下线所有服务
dubbo>offline
OK

//根据正则，下线部分服务
dubbo>offline com.*
OK
```

### help 命令



```
//列出所有命令
dubbo>help

//列出单个命令的具体使用情况
dubbo>help online
+--------------+----------------------------------------------------------------------------------+
| COMMAND NAME | online                                                                           |
+--------------+----------------------------------------------------------------------------------+
|      EXAMPLE | online dubbo                                                                     |
|              | online xx.xx.xxx.service                                                         |
+--------------+----------------------------------------------------------------------------------+

dubbo>
```

## 相关参数说明

QoS提供了一些启动参数，来对启动进行配置，他们主要包括：

| 参数               | 说明              | 默认值 |
| ------------------ | ----------------- | ------ |
| qos-enable          | 是否启动QoS       | true   |
| qos-port            | 启动QoS绑定的端口 | 22222  |
| qos-accept-foreign-ip | 是否允许远程访问  | false  |

> 注意，从2.6.4/2.7.0开始，qos-accept-foreign-ip默认配置改为false，如果qos-accept-foreign-ip设置为true，有可能带来安全风险，请仔细评估后再打开。

QoS参数可以通过如下方式进行配置

* 系统属性
* dubbo.properties
* XML方式
* Spring-boot自动装配方式

其中，上述方式的优先顺序为系统属性 > dubbo.properties > XML/Spring-boot自动装配方式。

### 使用系统属性方式进行配置

```
-Ddubbo.application.qos-enable=true
-Ddubbo.application.qos-port=33333
-Ddubbo.application.qos-accept-foreign-ip=false
```

### 使用dubbo.properties文件进行配置

在项目的`src/main/resources`目录下添加dubbo.properties文件，内容如下:
```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
```

### 使用XML方法进行配置

如果要通过XML配置响应的QoS相关的参数，可以进行如下配置：

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

### 使用spring-boot自动装配方式配置

如果是spring-boot的应用，可以在`application.properties`或者`application.yml`上配置:

```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
```



