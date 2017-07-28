> ![warning](../sources/images/check.gif)Simple Monitor挂掉不会影响到Consumer和Provider之间的调用，所以用于生产环境不会有风险。

> ![warning](../sources/images/warning-3.gif)Simple Monitor采用磁盘存储统计信息，请注意安装机器的磁盘限制，如果要集群，建议用mount共享磁盘。

> ![warning](../sources/images/warning-3.gif)charts目录必须放在jetty.directory下，否则页面上访问不了。

* 安装:

```shell
wget http://code.alibabatech.com/mvn/releases/com/alibaba/dubbo-monitor-simple/2.4.1/dubbo-monitor-simple-2.4.1-assembly.tar.gz
tar zxvf dubbo-monitor-simple-2.4.1-assembly.tar.gz
cd dubbo-monitor-simple-2.4.1
```

* 配置:

```shell
vi conf/dubbo.properties
```

* 启动:

```shell
./bin/start.sh
```

* 停止:

```shell
./bin/stop.sh
```

* 重启:

```shell
./bin/restart.sh
```

* 调试:

```shell
./bin/start.sh debug
```

* 系统状态:

```shell
./bin/dump.sh
```

* 总控入口:

```shell
./bin/server.sh start
./bin/server.sh stop
./bin/server.sh restart
./bin/server.sh debug
./bin/server.sh dump
```

* 标准输出:

```shell
tail -f logs/stdout.log
```

* 命令行: (See: [Telnet Command Reference](user-guide-telnet-cmd-ref))

```shell
telnet 127.0.0.1 7070
help
```

Or:

```shell
echo status | nc -i 1 127.0.0.1 7070
```

访问:

```
http://127.0.0.1:8080
```

![/admin-guide/images/dubbo-monitor-simple.jpg](../sources/images/dubbo-monitor-simple.jpg)

