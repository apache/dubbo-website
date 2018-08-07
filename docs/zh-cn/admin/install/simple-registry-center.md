# Simple 注册中心安装

Simple Registry 没有经过严格测试，可能不健状，并且不支持集群，不建议用于生产环境。

安装:

```sh
git clone https://github.com/apache/incubator-dubbo-ops
cd incubator-dubbo-ops && mvn package
cd dubbo-registry-simple/target && tar xvf dubbo-registry-simple-2.0.0-assembly.tar.gz
cd dubbo-registry-simple-2.0.0
```

配置:

```sh
vi conf/dubbo.properties
```

启动:

```sh
./assembly.bin/start.sh
```

停止:

```sh
./assembly.bin/stop.sh
```

重启:

```sh
./assembly.bin/restart.sh
```

调试:

```sh
./assembly.bin/start.sh debug
```

系统状态:

```sh
./assembly.bin/dump.sh
```

总控入口:

```sh
./assembly.bin/server.sh start
./assembly.bin/server.sh stop
./assembly.bin/server.sh restart
./assembly.bin/server.sh debug
./assembly.bin/server.sh dump
```

标准输出:

```sh
tail -f logs/stdout.log
```

命令行 [^1]:

```shell
telnet 127.0.0.1 9090
help
```

或者:

```sh
echo status | nc -i 1 127.0.0.1 9090
```

[^1]: 请参考 [Telnet 命令参考手册](http://dubbo.apache.org/books/dubbo-user-book/references/telnet.html)
