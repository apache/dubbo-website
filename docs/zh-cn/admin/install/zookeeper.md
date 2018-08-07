# Zookeeper 注册中心安装

建议使用 `dubbo-2.3.3` 以上版本的 zookeeper [^1] 注册中心客户端。

Dubbo 未对 Zookeeper 服务器端做任何侵入修改，只需安装原生的 Zookeeper 服务器即可，所有注册中心逻辑适配都在调用 Zookeeper 客户端时完成。

安装:

```sh
wget http://archive.apache.org/dist/zookeeper/zookeeper-3.3.3/zookeeper-3.3.3.tar.gz
tar zxvf zookeeper-3.3.3.tar.gz
cd zookeeper-3.3.3
cp conf/zoo_sample.cfg conf/zoo.cfg
```

配置:

```sh
vi conf/zoo.cfg
```

如果不需要集群，`zoo.cfg` 的内容如下 [^2]：

```properties
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
```

如果需要集群，`zoo.cfg` 的内容如下 [^3]：

```properties
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
server.1=10.20.153.10:2555:3555
server.2=10.20.153.11:2555:3555
```

并在 data 目录 [^4] 下放置 myid 文件：

```sh
mkdir data
vi myid
```

myid 指明自己的 id，对应上面 `zoo.cfg` 中 `server.` 后的数字，第一台的内容为 1，第二台的内容为 2，内容如下：

```
1
```

启动:

```sh
./bin/zkServer.sh start
```

停止:

```sh
./bin/zkServer.sh stop
```

命令行 [^5]: 

```sh
telnet 127.0.0.1 2181
dump
```

或者:

```shell
echo dump | nc 127.0.0.1 2181
```

用法:

```xml
dubbo.registry.address=zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181
```

或者:

```xml
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181" />
```

[^1]: Zookeeper是 Apache Hadoop 的子项目，强度相对较好，建议生产环境使用该注册中心
[^2]: 其中 data 目录需改成你真实输出目录
[^3]: 其中 data 目录和 server 地址需改成你真实部署机器的信息
[^4]: 上面 `zoo.cfg` 中的 `dataDir`
[^5]: http://zookeeper.apache.org/doc/r3.3.3/zookeeperAdmin.html
