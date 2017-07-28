> ![warning](../sources/images/check.gif)建议使用dubbo-2.3.3以上版本的zookeeper注册中心客户端

> ![warning](../sources/images/check.gif)Zookeeper是Apache Hadoop的子项目，强度相对较好，建议生产环境使用该注册中心。

> ![warning](../sources/images/check.gif)Dubbo未对Zookeeper服务器端做任何侵入修改，只需安装原生的Zookeeper服务器即可，所有注册中心逻辑适配都在调用Zookeeper客户端时完成。

> ![warning](../sources/images/check.gif)如果需要，可以考虑使用taobao的zookeeper监控：http://rdc.taobao.com/team/jm/archives/1450

* 安装:

```shell
wget http://www.apache.org/dist//zookeeper/zookeeper-3.3.3/zookeeper-3.3.3.tar.gz
tar zxvf zookeeper-3.3.3.tar.gz
cd zookeeper-3.3.3
cp conf/zoo_sample.cfg conf/zoo.cfg
```

* 配置:

```shell
vi conf/zoo.cfg
```

如果不需要集群，zoo.cfg的内容如下：(其中data目录需改成你真实输出目录)
> zoo.cfg

```
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
```

如果需要集群，zoo.cfg的内容如下：(其中data目录和server地址需改成你真实部署机器的信息)
> zoo.cfg

```
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
server.1=10.20.153.10:2555:3555
server.2=10.20.153.11:2555:3555
```

并在data目录下放置myid文件：(上面zoo.cfg中的dataDir)

```shell
mkdir data
vi myid
```

myid指明自己的id，对应上面zoo.cfg中server.后的数字，第一台的内容为1，第二台的内容为2，内容如下：
> myid

```
1
```

* 启动:

```shell
./bin/zkServer.sh start
```

* 停止:

```shell
./bin/zkServer.sh stop
```

* 命令行: (See: http://zookeeper.apache.org/doc/r3.3.3/zookeeperAdmin.html)

```shell
telnet 127.0.0.1 2181
dump
```

Or:

```shell
echo dump | nc 127.0.0.1 2181
```

* 用法:

```
dubbo.registry.address=zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181
```

Or:

```xml
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181" />
```