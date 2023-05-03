---
aliases:
    - /zh/docsv2.7/admin/install/redis/
description: Redis 注册中心安装
linkTitle: Redis 注册中心安装
title: Redis 注册中心安装
type: docs
weight: 4
---



Redis [^1] 使用方式参见: [Redis 注册中心参考手册](/zh-cn/docsv2.7/user/references/registry/redis/)。

只需搭一个原生的 Redis 服务器，并将[快速启动](/zh-cn/docsv2.7/user/quick-start/)中 Provider 和 Consumer 里的 `conf/dubbo.properties` 中的 `dubbo.registry.address` 的值改为 `redis://127.0.0.1:6379` 即可使用。

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