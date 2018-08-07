# install Simple configuration center

Simple Registry has not been well tested, may have bug, cluster is not supported, not recommended to use in production environment

Install:

```sh
git clone https://github.com/apache/incubator-dubbo-ops
cd incubator-dubbo-ops && mvn package
cd dubbo-registry-simple/target && tar xvf dubbo-registry-simple-2.0.0-assembly.tar.gz
cd dubbo-registry-simple-2.0.0
```

Configuration:

```sh
vi conf/dubbo.properties
```

Start:

```sh
./assembly.bin/start.sh
```

Stop:

```sh
./assembly.bin/stop.sh
```

Restart:

```sh
./assembly.bin/restart.sh
```

Debug:

```sh
./assembly.bin/start.sh debug
```

System status:

```sh
./assembly.bin/dump.sh
```

General control entrance: 
```sh
./assembly.bin/server.sh start
./assembly.bin/server.sh stop
./assembly.bin/server.sh restart
./assembly.bin/server.sh debug
./assembly.bin/server.sh dump
```

Stdout:

```sh
tail -f logs/stdout.log
```

Command line [^1]:

```shell
telnet 127.0.0.1 9090
help
```

Or:

```sh
echo status | nc -i 1 127.0.0.1 9090
```

[^1]: Please refer to [Telnet command manual](http://dubbo.apache.org/books/dubbo-user-book-en/references/telnet.html)
