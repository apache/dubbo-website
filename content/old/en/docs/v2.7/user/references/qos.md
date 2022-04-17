---
type: docs
title: "Qos Command Usage "
linkTitle: "Qos"
weight: 11
description: "Telnet (new version) command usage in dubbo"
---

In dubbo `2.5.8` a new QOS module is introduced, to provide new telnet command support. 

## Port
the port of new version telnet is different from the port of dubbo protocol. The default port is `22222`, which can be changed by modifying configuration file `dubbo.properties`

```
dubbo.application.qos.port=33333
```

or by modifying the JVM parameter

```
-Ddubbo.application.qos.port=33333
```

## Safety

By default, dubbo can receive any command sent from the host, which can be changed by modifying the configuration file `dubbo.properties`  

```
dubbo.application.qos.accept.foreign.ip=false
```

or by configuring the JVM parameter

```
-Ddubbo.application.qos.accept.foreign.ip=false
```

to reject command sent from the remote host, allowing only the local server to run the command 

## Telnet and HTTP protocol 

The telnet module supports both http and telnet protocol, in order to facilitate the use of various situations

For example, 

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

## Supported Commands

### ls List consumers and providers 

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

List the services of the provides and the consumers that dubbo provide

### Online service command

When using delay publishing function(org.apache.dubbo.config.AbstractServiceConfig#register set as false), you can use “online” command to online the service 

```
//online all services
dubbo>online
OK

//online part of servies according to regularity.
dubbo>online com.*
OK
```

Common usage situations:
- Because there is no JIT or the related resources warm-up, when the machine is restarted and the online QPS is relatively high , a large amount of timeout situations may occur. At this time,the problem can be solved by distributing the batch service and increasing the traffic gradually.
- A machine needs to be back online after going offline due to some reasons.

### Offline service Command

Offline command can be used if temporary offline service is needed when fault occurs. 

```
//offline all service 
dubbo>offline
OK

//offline some services according to regular rules
dubbo>offline com.*
OK
```

### help command

```
//list all commands
dubbo>help

//list the specific use case of a command 
dubbo>help online
+--------------+----------------------------------------------------------------------------------+
| COMMAND NAME | online                                                                           |
+--------------+----------------------------------------------------------------------------------+
|      EXAMPLE | online dubbo                                                                     |
|              | online xx.xx.xxx.service                                                         |
+--------------+----------------------------------------------------------------------------------+
dubbo>
```

## QoS' Parameters

You can use parameters that QoS provides to config its startup. These parameters include:

| Parameter             | Explanation              | Default |
| ------------------ | ----------------- | ------ |
| qosEnable          | Activate QoS or not       | true   |
| qosPort            | The port QoS would bind to | 22222  |
| qosAcceptForeignIp | Enable remote access or not  | false  |

> Attention. From 2.6.4/2.7.0, `qosAcceptForeignIp` is set to `false` by default, because it's risky if this property is set to `true`. Think twice before you turn it on.

You can configure these parameters in the following ways:

* System property
* `dubbo.properties`
* XML
* Spring-boot auto configuration

They have priority in the following order: system property > `dubbo.properties` > XML > spring-boot.

### System Property

```
-Ddubbo.application.qos.enable=true
-Ddubbo.application.qos.port=33333
-Ddubbo.application.qos.accept.foreign.ip=false
```

### `Dubbo.properties`

Create a `dubbo.properties` file in this directory `src/main/resources` in your project, and copy the following codes into it:

```
dubbo.application.qos.enable=true
dubbo.application.qos.port=33333
dubbo.application.qos.accept.foreign.ip=false
```

### XML

If you are going to config using XML, you can try this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
  <dubbo:application name="demo-provider">
    <dubbo:parameter key="qos.enable" value="true"/>
    <dubbo:parameter key="qos.accept.foreign.ip" value="false"/>
    <dubbo:parameter key="qos.port" value="33333"/>
  </dubbo:application>
  <dubbo:registry address="multicast://224.5.6.7:1234"/>
  <dubbo:protocol name="dubbo" port="20880"/>
  <dubbo:service interface="org.apache.dubbo.demo.provider.DemoService" ref="demoService"/>
  <bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
</beans>
```

### spring-boot auto configuration

If you are developing a spring-boot application, you can configure in `application.properties` or `application.yml`:

```
dubbo.application.qosEnable=true
dubbo.application.qosPort=33333
dubbo.application.qosAcceptForeignIp=false
```
