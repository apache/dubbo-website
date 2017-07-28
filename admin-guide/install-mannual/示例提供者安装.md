* 安装:

```shell
wget http://code.alibabatech.com/mvn/releases/com/alibaba/dubbo-demo-provider/2.4.1/dubbo-demo-provider-2.4.1-assembly.tar.gz
tar zxvf dubbo-demo-provider-2.4.1-assembly.tar.gz
cd dubbo-demo-provider-2.4.1
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

* 命令行: (See: [Telnet Command Reference](#))

```shell
telnet 127.0.0.1 20880
help
```

Or:

```shell
echo status | nc -i 1 127.0.0.1 20880
```