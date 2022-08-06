---
type: docs
title: "Telnet Command Reference"
linkTitle: "Telnet"
weight: 11
description: "Telnet command reference in dubbo"
---

Since `2.0.5` dubbo starts supporting to use telnet command to govern services.

## How To Use

```sh
telnet localhost 20880
```

Or:

```sh
echo status | nc -i 1 localhost 20880
```

## Supported Commands

The built-in telnet commands are listed below. Furthermore, it is possible to extend telnet commands, pls. refer to 
[extend telnet command](/en/docs/v2.7/user/references/telnet/) for more details.

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

0. `invoke XxxService.xxxMethod(1234, "abcd", {"prop" : "value"})`: invoke particular method for the given service
0. `invoke com.xxx.XxxService.XxxService.xxxMethod(1234, "abcd", {"prop" : "value"})`: invoke particular method for the given service
0. `invoke xxxMethod(1234, "abcd", {"prop" : "value"})`: invoke particular method for the default service
0. `invoke xxxMethod({"name":"zhangsan","age":12,"class":"org.apache.dubbo.qos.legacy.service.Person"})` :When there is parameter overload, or the type conversion fails, you can specify the class to be converted by adding the class attribute
0. When the parameter is Map<Integer, T> and the key type is Integer, it is recommended to specify the type. E.g:`invoke com.xxx.xxxApiService({"3":0.123, "class":"java.util.HashMap"})`

### `select` [^2]

0. `select 1`: used when the invoke command matches multiple methods, select the method to be called according to the prompt list

### `status`

0. `status`: show summarized status. This status summarizes statuses from all resources, and it shows OK when all resources are OK, shows ERROR when any resource has ERROR, and WARN when any has WARN.
0. `status -l`: show status list

### `log` [^1]

0. `log debug`: modify logger level to debug
0. `log 100`: examine the last 100 characters from the file logger

### `help`

0. `help`: show help for telnet commands
0. `help xxx`: show help for particular telnet command

### `clear`

0. `clear`: clear screen
0. `clear 100`: only clear particular lines on the screen

### `exit`

`exit`: exit current telnet session

### `shutdown` [^2]

0. `shutdown`: shutdown dubbo application
0. `shutdown -t 1000`: delay 1000 ms to shutdown dubbo application

[^1]: support since `2.0.6`
[^2]: support since `2.7.1`

