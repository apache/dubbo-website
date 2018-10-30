# Telnet Command Reference

Since `2.0.5` dubbo starts supporting to use telnet command to govern services.

## How To Use

```sh
telnet localhost 20880
```

Or:

```sh
echo status | nc -i 1 localhost 20880
```

It is possible to extend command `status` to check more resources, pls. refer to [extension references](http://dubbo.apache.org/books/dubbo-dev-book-en/impls/status-checker.html) for more details.

## Supported Commands

The built-in telnet commands are listed below. Furthermore, it is possible to extend telnet commands, pls. refer to 
[extend telnet command](http://dubbo.apache.org/books/dubbo-dev-book/impls/telnet-handler.html) for more details.

### `ls`

0. `ls`: list services
0. `ls -l`: list services in more details
0. `ls XxxService`: list methods for the particular service
0. `ls -l XxxService`: list methods for the particular service in more dtails

### `ps`

0. `ps`: list service ports
0. `ps -l`: list service addresses
0. `ps 20880`: show connection info for the particular port
0. `ps -l 20880`: show connection info for the particular port in more details

### `cd`

0. `cd XxxService`: switch default service. When default service is set, service parameter can be ignored in all commands when it's needed
0. `cd /`: reset default service

### `pwd`

`pwd`: show what current default service is

### `trace`

0. `trace XxxService`: trace method invocation once for the given service
0. `trace XxxService 10`: trace method invocations 10 times for the given service
0. `trace XxxService xxxMethod`: trace particular method invocation once for the given service
0. `trace XxxService xxxMethod 10`: trace particular method invocations 10 times for the given service

### `count`

0. `count XxxService`: count method invocation once for the given service
0. `count XxxService 10`: count method invocations 10 times for the given service
0. `count XxxService xxxMethod`: count particular method invocation once for the given service
0. `count XxxService xxxMethod 10`: count particular method invocation 10 times for the given service

### `invoke`

0. `invoke XxxService.xxxMethod({"prop": "value"})`: invoke particular method for the given service
0. `invoke xxxMethod({"prop": "value"})`: invoke particular method for the default service

### `status`

0. `status`: show summarized status. This status summarizes statuses from all resources, and it shows OK when all resources are OK, shows ERROR when any resource has ERROR, and WARN when any has WARN.
0. `status -l`: show status list

### `log` [^1]

0. `log debug`: modify logger level to debug
0. `log 100`: examine the last 100 characters from the file logger

### `help`

0. `help`: show help for telnet commands
0. `help xxx`: 显示xxx命令的详细帮助信息
0. `help xxx`: show help for particular telnet command

### `clear`

0. `clear`: clear screen
0. `clear 100`: only clear particular lines on the screen

### `exit`

`exit`: exit current telnet session

[^1]: support since `2.0.6`

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