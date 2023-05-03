---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/qos/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/qos/overview/
description: dubbo 2.5.8 新版本增加了 QOS 模块，提供了新的 telnet 命令支持。
linkTitle: QOS 概述
title: QOS 概述
type: docs
weight: 1
---






## 参数说明
QoS 提供了一些启动参数，来对启动进行配置，他们主要包括：

| 参数                              | 说明             | 默认值       |
|---------------------------------|----------------|-----------|
| qos-enable                      | 是否启动QoS        | true      |
| qos-port                        | 启动QoS绑定的端口     | 22222     |
| qos-accept-foreign-ip           | 是否允许远程访问       | false     |
| qos-accept-foreign-ip-whitelist | 支持的远端主机ip地址（段） | (无)       |
| qos-anonymous-access-permission-level | 支持的匿名访问的权限级别   | PUBLIC(1) |

> 注意，从2.6.4/2.7.0开始，qos-accept-foreign-ip默认配置改为false，如果qos-accept-foreign-ip设置为true，有可能带来安全风险，请仔细评估后再打开。

## 协议
### telnet 与 http 协议

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

## 其他方式

### 端口
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

### 安全
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

同时可以通过设置`qos-accept-foreign-ip-whitelist`来指定支持的远端主机ip地址（段），多个ip地址（段）之间用**逗号**分隔，如：

配置文件`dubbo.properties`
```
dubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13, 132.12.10.13/24
```
设置 JVM 参数:
```
-Ddubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13,132.12.10.13/24
```

### 权限
为了对生命周期探针的默认支持，QoS 提供了匿名访问的能力以及对权限级别的设置，目前支持的权限级别有：
- PUBLIC(1)   
  默认支持匿名访问的命令权限级别，目前只支持生命周期探针相关的命令
- PROTECTED(2)  
  命令默认的权限级别
- PRIVATE(3)  
  保留的最高权限级别，目前未支持
- NONE(4)
  最低权限级别，即不支持匿名访问

> 权限级别 `PRIVATE`> `PROTECTED`> `PUBLIC`> `NONE`, 高级别权限可访问同级别和低级别权限命令。
当前以下命令权限为`PUBLIC`, 其它命令默认权限别为`PROTECTED`。

| 命令                                    | 权限等级      |
|---------------------------------------|-------------------|
| Live                                  | PUBLIC (1)    |
| Startup                               | PUBLIC (1)     |
| Ready                                 | PUBLIC (1)     |
| Quit                                  | PUBLIC (1)|

默认情况下，dubbo 允许匿名主机发起匿名访问，只有`PUBLIC`权限级别的命令可以执行，其他更高权限的命令会被拒绝。

**关闭匿名访问**  
可以通过设置`qos-anonymous-access-permission-level=NONE`来关闭匿名访问。

**设置权限级别**  
可以通过配置文件`dubbo.properties` 修改:
```
dubbo.application.qos-anonymous-access-permission-level=PROTECTED
```
或者

可以通过设置 JVM 参数:
```
-Ddubbo.application.qos-anonymous-access-permission-level=PROTECTED
```
来允许匿名访问更高级别的权限的命令。




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
## 配置方式
> 优先顺序: **系统属性 > dubbo.properties > XML/Spring-boot 自动装配**

### 系统属性
```
-Ddubbo.application.qos-enable=true
-Ddubbo.application.qos-port=33333
-Ddubbo.application.qos-accept-foreign-ip=false
-Ddubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13,132.12.10.13/24
-Ddubbo.application.qos-anonymous-access-permission-level=PUBLIC
```

### dubbo.properties
在项目的`src/main/resources`目录下添加 dubbo.properties文件，内容如下:
```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
dubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13, 132.12.10.13/24
dubbo.application.qos-anonymous-access-permission-level=PUBLIC
```

### XML
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
    <dubbo:parameter key="qos-accept-foreign-ip-whitelist" value="123.12.10.13,132.12.10.13/24"/>
    <dubbo:parameter key="qos-anonymous-access-permission-level" value="NONE"/>
    <dubbo:parameter key="qos-port" value="33333"/>
  </dubbo:application>
  <dubbo:registry address="multicast://224.5.6.7:1234"/>
  <dubbo:protocol name="dubbo" port="20880"/>
  <dubbo:service interface="org.apache.dubbo.demo.provider.DemoService" ref="demoService"/>
  <bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
</beans>
```

###  spring-boot 自动装配
如果是 spring-boot 的应用，可以在`application.properties`或者`application.yml`上配置:

```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
dubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13, 132.12.10.13/24
dubbo.application.qos-anonymous-access-permission-level=NONE
```