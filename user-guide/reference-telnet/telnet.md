> ![warning](../sources/images/warning-3.gif) Dubbo2.0.5以上版本服务提供端口支持telnet命令，

使用如：

```sh
telnet localhost 20880
```

或者：

```sh
echo status | nc -i 1 localhost 20880
```

telnet命令可以扩展，参见：[扩展参考手册](dev-guide-spi-reference-manual#telnet命令扩展)。
status命令所检查的资源也可以扩展，参见：[扩展参考手册](dev-guide-spi-reference-manual#状态检查扩展)。

#### ls

(list services and methods)

* ls: 显示服务列表。
* ls -l: 显示服务详细信息列表。
* ls XxxService: 显示服务的方法列表。
* ls -l XxxService: 显示服务的方法详细信息列表。

#### ps

(print server ports and connections)

* ps: 显示服务端口列表。
* ps -l: 显示服务地址列表。
* ps 20880: 显示端口上的连接信息。
* ps -l 20880: 显示端口上的连接详细信息。

#### cd

(change default service)

* cd XxxService: 改变缺省服务，当设置了缺省服务，凡是需要输入服务名作为参数的命令，都可以省略服务参数。
* cd /: 取消缺省服务。

#### pwd

(print working default service)

* pwd: 显示当前缺省服务。

#### trace

* trace XxxService: 跟踪1次服务任意方法的调用情况。
* trace XxxService 10: 跟踪10次服务任意方法的调用情况。
* trace XxxService xxxMethod: 跟踪1次服务方法的调用情况
* trace XxxService xxxMethod 10: 跟踪10次服务方法的调用情况。

#### count

* count XxxService: 统计1次服务任意方法的调用情况。
* count XxxService 10: 统计10次服务任意方法的调用情况。
* count XxxService xxxMethod: 统计1次服务方法的调用情况。
* count XxxService xxxMethod 10: 统计10次服务方法的调用情况。

#### invoke

* invoke XxxService.xxxMethod({"prop": "value"}): 调用服务的方法。
* invoke xxxMethod({"prop": "value"}): 调用服务的方法(自动查找包含此方法的服务)。

#### status

* status: 显示汇总状态，该状态将汇总所有资源的状态，当全部OK时则显示OK，只要有一个ERROR则显示ERROR，只要有一个WARN则显示WARN。
* status -l: 显示状态列表。

#### log

2.0.6以上版本支持

* log debug: 修改dubbo logger的日志级别
* log 100: 查看file logger的最后100字符的日志

#### help

* help: 显示telnet命帮助信息。
* help xxx: 显示xxx命令的详细帮助信息。

#### clear

* clear: 清除屏幕上的内容。
* clear 100: 清除屏幕上的指定行数的内容。

#### exit

* exit: 退出当前telnet命令行。