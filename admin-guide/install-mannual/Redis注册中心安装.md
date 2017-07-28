> ![warning](../sources/images/check.gif)Redis说明  
Redis是一个高效的KV存储服务器，参见：http://redis.io

> ![warning](../sources/images/check.gif)Redis使用  
使用方式参见: [Redis使用手册](http://dubbo.io/User+Guide-zh.htm#UserGuide-zh-RedisRegistry)，只需搭一个原生的Redis服务器，并将[Quick Start](user-guide-quick-start)中Provider和Consumer里的conf/dubbo.properties中的dubbo.registry.addrss的值改为`redis://127.0.0.1:6379`即可使用

> ![warning](../sources/images/check.gif)Redis集群  
Redis注册中心集群采用在客户端同时写入多个服务器，读取单个服务器的策略实现。

> ![warning](../sources/images/warning-3.gif)2.1.0以上版本支持

参见：http://redis.io/topics/quickstart

* 安装:

```shell
wget http://redis.googlecode.com/files/redis-2.4.8.tar.gz
tar xzf redis-2.4.8.tar.gz
cd redis-2.4.8
make
```

* 配置:

```shell
vi redis.conf
```

* 启动:

```shell
nohup ./src/redis-server redis.conf &
```

* 停止:

```shell
killall redis-server
```

* 命令行: (参见: http://redis.io/commands)

```shell
./src/redis-cli
hgetall /dubbo/com.foo.BarService/providers
```

或者：

```shell
telnet 127.0.0.1 6379
hgetall /dubbo/com.foo.BarService/providers
```