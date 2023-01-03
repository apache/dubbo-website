---
type: docs
title: "QOS Overview"
linkTitle: "QOS Overview"
weight: 1
description: The new version of dubbo 2.5.8 adds QOS module and provides new telnet command support.
---

## Description of related parameters
QoS provides some startup parameters to configure startup, they mainly include:

| Parameters | Description | Default |
|---------------------------------|----------------|-----------|
| qos-enable | Whether to enable QoS | true |
| qos-port | Enable QoS binding port | 22222 |
| qos-accept-foreign-ip | Whether to allow remote access | false |
| qos-accept-foreign-ip-whitelist | Supported remote host ip address (segment) | (none) |
| qos-anonymous-access-permission-level | Permission level for anonymous access supported | PUBLIC(1) |

> Note, starting from 2.6.4/2.7.0, the default configuration of qos-accept-foreign-ip is changed to false. If qos-accept-foreign-ip is set to true, it may bring security risks, please evaluate carefully Open.

## QoS parameter configuration

* system properties
* dubbo.properties
* XML method
* Spring-boot automatic assembly method

Among them, the priority order of the above methods is system properties > dubbo.properties > XML/Spring-boot automatic assembly method.


## port
The port of the new version of telnet is different from the port of the dubbo protocol, the default is `22222`

It can be modified through the configuration file `dubbo.properties`:
```
dubbo.application.qos-port=33333
```
or
You can set the JVM parameter:
```
-Ddubbo.application.qos-port=33333
```

## Safety
By default, dubbo accepts commands initiated by any host

It can be modified through the configuration file `dubbo.properties`:
```
dubbo.application.qos-accept-foreign-ip=false
```
or

You can set the JVM parameter:
```
-Ddubbo.application.qos-accept-foreign-ip=false
```
Reject commands issued by the remote host, and only allow the service to execute locally.

At the same time, you can specify the supported remote host ip addresses (segments) by setting `qos-accept-foreign-ip-whitelist`, and separate multiple ip addresses (segments) with **comma**, such as:
> Configuration file `dubbo.properties`
```
dubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13, 132.12.10.13/24
```
> Set JVM parameters:
```
-Ddubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13,132.12.10.13/24
```

## Permissions
In order to support the life cycle probe by default, QoS provides the ability to access anonymously and set the permission level. The currently supported permission levels are:
- PUBLIC(1)
  By default, the command permission level of anonymous access is supported. Currently, only commands related to lifecycle probes are supported.
- PROTECTED(2)
  command default privilege level
- PRIVATE(3)
  The highest privilege level reserved, currently unsupported
- NONE
  The lowest privilege level, i.e. anonymous access is not supported

> Privilege level `PRIVATE`> `PROTECTED`> `PUBLIC`> `NONE`, high-level permissions can access commands of the same level and low-level permissions.
Currently the permissions of the following commands are `PUBLIC`, and the default permissions of other commands are `PROTECTED`.

| command | privilege level |
|------------------------------------------|-------------------|
| Live | PUBLIC (1) |
| Startup | PUBLIC (1) |
| Ready | PUBLIC (1) |
| Quit | PUBLIC (1)|

By default, dubbo allows anonymous hosts to initiate anonymous access, only commands with `PUBLIC` permission level can be executed, and other commands with higher permissions will be rejected.

**Turn off anonymous access**
Anonymous access can be turned off by setting `qos-anonymous-access-permission-level=NONE`.

**SET PERMISSION LEVEL**
It can be modified through the configuration file `dubbo.properties`:
```
dubbo.application.qos-anonymous-access-permission-level=PROTECTED
```
or  
You can set the JVM parameter:
```
-Ddubbo.application.qos-anonymous-access-permission-level=PROTECTED
```
to allow anonymous access to higher-level privileged commands.

## agreement
### telnet and http protocols

The telnet module now supports both the http protocol and the telnet protocol, which is convenient for use in various situations
Example:
```
➜ ~ telnet localhost 22222
Trying ::1...
telnet: connect to address ::1: Connection refused
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
  ████████▄ ███ █▄ ▀█████████▄ ▀█████████▄ ▄██████▄
  ███ ▀███ ███ ███ ███ ███ ███ ███ ███ ███
  ███ ███ ███ ███ ███ ███ ███ ███ ███ ███
  ███ ███ ███ ███ ▄███▄▄▄██▀ ▄███▄▄▄██▀ ███ ███
  ███ ███ ███ ███ ▀▀███▀▀▀██▄ ▀▀███▀▀▀██▄ ███ ███
  ███ ███ ███ ███ ███ ██▄ ███ ██▄ ███ ███
  ███ ▄███ ███ ███ ███ ███ ███ ███ ███ ███
  ████████▀ ████████▀ ▄█████████▀ ▄█████████▀ ▀██████▀


dubbo>ls
As Provider side:
+----------------------------------+---+
| Provider Service Name |PUB|
+----------------------------------+---+
|org.apache.dubbo.demo.DemoService|N|
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+

dubbo>
```


```
➜ ~ curl "localhost:22222/ls?arg1=xxx&arg2=xxxx"
As Provider side:
+----------------------------------+---+
| Provider Service Name |PUB|
+----------------------------------+---+
|org.apache.dubbo.demo.DemoService|N|
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```
## Use configuration
### Use system properties to configure
```
-Ddubbo.application.qos-enable=true
-Ddubbo.application.qos-port=33333
-Ddubbo.application.qos-accept-foreign-ip=false
-Ddubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13,132.12.10.13/24
-Ddubbo.application.qos-anonymous-access-permission-level=PUBLIC
```

### Use dubbo.properties file configuration
Add the dubbo.properties file in the `src/main/resources` directory of the project, the content is as follows:
```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
dubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13, 132.12.10.13/24
dubbo.application.qos-anonymous-access-permission-level=PUBLIC
```

### Use the XML method to configure
If you want to configure the QoS-related parameters of the response through XML, you can configure them as follows:
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

### Use spring-boot automatic assembly configuration
If it is a spring-boot application, it can be configured on `application.properties` or `application.yml`:

```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
dubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13, 132.12.10.13/24
dubbo.application.qos-anonymous-access-permission-level=NONE
```