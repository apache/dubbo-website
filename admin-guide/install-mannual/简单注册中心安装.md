> ![warning](../sources/images/warning-3.gif)Simple Registry没有经过严格测试，可能不健状，并且不支持集群，不建议用于生产环境。

* 安装:

```shell
wget http://code.alibabatech.com/mvn/releases/com/alibaba/dubbo-registry-simple/2.4.1/dubbo-registry-simple-2.4.1-assembly.tar.gz
tar zxvf dubbo-registry-simple-2.4.1-assembly.tar.gz
cd dubbo-registry-simple-2.4.1
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
telnet 127.0.0.1 9090
help
```

Or:

```shell
echo status | nc -i 1 127.0.0.1 9090
```
