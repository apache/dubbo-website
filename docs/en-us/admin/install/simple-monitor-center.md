# install Simple monitor center

## Step

install:

```sh
git clone https://github.com/apache/incubator-dubbo-ops
cd incubator-dubbo-ops && mvn package
cd dubbo-monitor-simple/target && tar xvf dubbo-monitor-simple-2.0.0-assembly.tar.gz
cd dubbo-monitor-simple-2.0.0
```

configuration:

```sh
vi conf/dubbo.properties
```

start:

```sh
./assembly.bin/start.sh
```

stop:

```sh
./assembly.bin/stop.sh
```

restart:

```sh
./assembly.bin/restart.sh
```

debug:

```sh
./assembly.bin/start.sh debug
```

system status:

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

```sh
telnet 127.0.0.1 7070
help
```

Or:

```sh
echo status | nc -i 1 127.0.0.1 7070
```

Visit:

```
http://127.0.0.1:8080
```

![/admin-guide/images/dubbo-monitor-simple.jpg](../sources/images/dubbo-monitor-simple.jpg)

## NOTICE
The failure of Simple Monitor will not effect on consumer and provider's running, therefore there would be no risk in production environment
Simple Monitor use disk to store statistics information, please focus on the limitation of your machine. Mount share disk is recommended if cluster is needed

Charts directory must be in `jetty.directory`, or it can not be accessed by web page.

[^1]: Please refer to [Telnet command reference manual](http://dubbo.apache.org/books/dubbo-user-book-en/references/telnet.html)

