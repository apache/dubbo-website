---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/qos/overview/
    - /en/docs3-v2/java-sdk/reference-manual/qos/overview/
description: "The design purpose and usage instructions of the QoS command, including how to enable and disable the qos command, supporting HTTP/Telnet access methods."
linkTitle: QOS Overview
title: QOS Overview
type: docs
weight: 1
---


## How to Use
QoS provides some startup parameters for configuration, mainly including:

| Parameter                              | Description             | Default Value       |
|---------------------------------|----------------|-----------|
| qos-enable                      | Whether to enable QoS        | true      |
| qos-port                        | The port that QoS binds to     | 22222     |
| qos-accept-foreign-ip           | Whether to allow remote access       | false     |
| qos-accept-foreign-ip-whitelist | Supported remote host IP addresses (segments) | (none)       |
| qos-anonymous-access-permission-level | Supported permission level for anonymous access   | PUBLIC(1) |

> Note: Starting from 2.6.4/2.7.0, the default configuration of qos-accept-foreign-ip is changed to false. If qos-accept-foreign-ip is set to true, it may pose security risks; please evaluate carefully before enabling.

### telnet and HTTP Protocol

The telnet module now simultaneously supports HTTP protocol and telnet protocol for ease of use in various situations.
Example:
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

### Port
The new version of the telnet port is different from the dubbo protocol port, defaulting to `22222`.

It can be modified in the configuration file `dubbo.properties`:
```
dubbo.application.qos-port=33333
```
or

It can be set via JVM parameters:
```
-Ddubbo.application.qos-port=33333
```

### Security
By default, dubbo accepts commands initiated from any host.

It can be modified in the configuration file `dubbo.properties`:
```
dubbo.application.qos-accept-foreign-ip=false
```

or

It can be set via JVM parameters:
```
-Ddubbo.application.qos-accept-foreign-ip=false
```
to reject commands from remote hosts, allowing only local execution.

You can also specify supported remote host IP addresses (segments) using `qos-accept-foreign-ip-whitelist`, separating multiple IP addresses (segments) with **commas**, like:

In the `dubbo.properties` file:
```
dubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13, 132.12.10.13/24
```
Set JVM parameters:
```
-Ddubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13,132.12.10.13/24
```

### Permission
To support the lifecycle probe by default, QoS offers anonymous access and permission level settings. The currently supported permission levels are:
- PUBLIC(1)   
  The default permission level for anonymous access commands, currently only supports lifecycle probe related commands.
- PROTECTED(2)  
  The default permission level for commands.
- PRIVATE(3)  
  The highest reserved permission level, currently unsupported.
- NONE(4)
  The lowest permission level, which does not support anonymous access.

> Permission levels are `PRIVATE` > `PROTECTED` > `PUBLIC` > `NONE`, higher-level permissions can access commands of equal or lower level.
Currently, the following commands have a permission of `PUBLIC`, while other commands have a default permission of `PROTECTED`.

| Command                                    | Permission Level      |
|---------------------------------------|-------------------|
| Live                                  | PUBLIC (1)    |
| Startup                               | PUBLIC (1)     |
| Ready                                 | PUBLIC (1)     |
| Quit                                  | PUBLIC (1)|

By default, dubbo allows anonymous hosts to initiate anonymous access, and only commands with `PUBLIC` permission level can be executed; commands with higher permissions will be rejected.

**Disable Anonymous Access**  
You can disable anonymous access by setting `qos-anonymous-access-permission-level=NONE`.

**Set Permission Level**  
You can modify it in the `dubbo.properties` file:
```
dubbo.application.qos-anonymous-access-permission-level=PROTECTED
```
or

Set JVM parameters:
```
-Ddubbo.application.qos-anonymous-access-permission-level=PROTECTED
```
to allow anonymous access to higher-level permission commands.

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
## Configuration Methods
> Priority Order: **System Properties > dubbo.properties > XML/Spring-boot Autowiring**

### System Properties
```
-Ddubbo.application.qos-enable=true
-Ddubbo.application.qos-port=33333
-Ddubbo.application.qos-accept-foreign-ip=false
-Ddubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13,132.12.10.13/24
-Ddubbo.application.qos-anonymous-access-permission-level=PUBLIC
```

### dubbo.properties
Add the dubbo.properties file in the project’s `src/main/resources` directory, with the following content:
```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
dubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13, 132.12.10.13/24
dubbo.application.qos-anonymous-access-permission-level=PUBLIC
```

### XML
If you want to configure QoS related parameters through XML, you can configure as follows:
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

### Spring Boot Autowiring
For Spring Boot applications, you can configure in `application.properties` or `application.yml`:

```
dubbo.application.qos-enable=true
dubbo.application.qos-port=33333
dubbo.application.qos-accept-foreign-ip=false
dubbo.application.qos-accept-foreign-ip-whitelist=123.12.10.13, 132.12.10.13/24
dubbo.application.qos-anonymous-access-permission-level=NONE
```
