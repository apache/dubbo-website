# Redis 注册中心安装



Redis [^1] 使用方式参见: [Redis 注册中心参考手册](http://dubbo.apache.org/books/dubbo-user-book/references/registry/redis.html)。

只需搭一个原生的 Redis 服务器，并将[快速启动](http://dubbo.apache.org/books/dubbo-user-book/quick-start.html)中 Provider 和 Consumer 里的 `conf/dubbo.properties` 中的 `dubbo.registry.addrss` 的值改为 `redis://127.0.0.1:6379` 即可使用。

Redis 注册中心集群 [^2] 采用在客户端同时写入多个服务器，读取单个服务器的策略实现。

安装:

```sh
wget http://redis.googlecode.com/files/redis-2.4.8.tar.gz
tar xzf redis-2.4.8.tar.gz
cd redis-2.4.8
make
```

配置:

```sh
vi redis.conf
```

启动:

```sh
nohup ./src/redis-server redis.conf &
```

停止:

```sh
killall redis-server
```

* 命令行 [^3]:

```sh
./src/redis-cli
hgetall /dubbo/com.foo.BarService/providers
```

或者：

```sh
telnet 127.0.0.1 6379
hgetall /dubbo/com.foo.BarService/providers
```

[^1]: Redis 是一个高效的 KV 存储服务器，参见：http://redis.io/topics/quickstart
[^2]: `2.1.0` 以上版本支持
[^3]: 参见: http://redis.io/commands
