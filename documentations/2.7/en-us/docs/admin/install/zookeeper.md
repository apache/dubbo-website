# install Zookeeper configuration center

zookeeper register center client version: `dubbo-2.3.3` and above[^1]

Dubbo changes nothing of Zookeeper's server side, an original Zookeeper server is fine. All change happens while calling Zookeeper's client side

install:

```sh
wget http://archive.apache.org/dist/zookeeper/zookeeper-3.3.3/zookeeper-3.3.3.tar.gz
tar zxvf zookeeper-3.3.3.tar.gz
cd zookeeper-3.3.3
cp conf/zoo_sample.cfg conf/zoo.cfg
```

configuration:

```sh
vi conf/zoo.cfg
```

If cluster is not needed, the content of `zoo.cfg` is as below [^2]: 

```properties
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
```

If cluster is needed, the content of `zoo.cfg` is as below [^3]: 

```properties
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
server.1=10.20.153.10:2555:3555
server.2=10.20.153.11:2555:3555
```

Put myid file in data directory [^4]:

```sh
mkdir data
vi myid
```

Myid is the number after `server` in `zoo.cfg`. The first one's content is 1, the second one's content is 2:

```
1
```

Start:

```sh
./bin/zkServer.sh start
```

Stop:

```sh
./bin/zkServer.sh stop
```

Command line [^5]: 

```sh
telnet 127.0.0.1 2181
dump
```

Or:

```shell
echo dump | nc 127.0.0.1 2181
```

Usage:

```xml
dubbo.registry.address=zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181
```

Or:

```xml
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181" />
```

[^1]: Zookeeper is a sub project of Apache Hadoop.As it is robust, we recommend to use in production environment.
[^2]: Data directory should be changed into your real output directory
[^3]: Data directory and server address should be changed into your real machine information
[^4]: `dataDir` in `zoo.cfg`
[^5]: http://zookeeper.apache.org/doc/r3.3.3/zookeeperAdmin.html
