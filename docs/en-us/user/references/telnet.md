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
