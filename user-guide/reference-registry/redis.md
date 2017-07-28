> ![warning](../sources/images/check.gif)[Redis](http://redis.io) 是一个高效的KV存储服务器。安装方式参见: [Redis安装手册](admin-guide-install-manual#redis注册中心安装)，只需搭一个原生的Redis服务器，并将 [Quick Start](user-guide-quick-start#快速启动) 中Provider和Consumer里的conf/dubbo.properties中的dubbo.registry.addrss的值改为redis://127.0.0.1:6379即可使用。

##### Redis过期数据

通过心跳的方式检测脏数据，服务器时间必须相同，并且对服务器有一定压力。

##### 可靠性声明

阿里内部并没有采用Redis做为注册中心，而是使用自己实现的基于数据库的注册中心，即：Redis注册中心并没有在阿里内部长时间运行的可靠性保障，此Redis桥接实现只为开源版本提供，其可靠性依赖于Redis本身的可靠性。

从2.1.0版本开始支持

![/user-guide/images/dubbo-redis-registry.jpg](../sources/images/dubbo-redis-registry.jpg)

##### 数据结构：

使用Redis的Key/Map结构存储数据

* 主Key为服务名和类型。
* Map中的Key为URL地址。
* Map中的Value为过期时间，用于判断脏数据，脏数据由监控中心删除。(**注意：服务器时间必需同步，否则过期检测会不准确**)

使用Redis的Publish/Subscribe事件通知数据变更

* 通过事件的值区分事件类型：register, unregister, subscribe, unsubscribe。
* 普通消费者直接订阅指定服务提供者的Key，只会收到指定服务的register, unregister事件。
* 监控中心通过psubscribe功能订阅/dubbo/*，会收到所有服务的所有变更事件。

##### 调用过程：

0. 服务提供方启动时，向Key:/dubbo/com.foo.BarService/providers下，添加当前提供者的地址。
1. 并向Channel:/dubbo/com.foo.BarService/providers发送register事件。
2. 服务消费方启动时，从Channel:/dubbo/com.foo.BarService/providers订阅register和unregister事件。
3. 并向Key:/dubbo/com.foo.BarService/providers下，添加当前消费者的地址。
4. 服务消费方收到register和unregister事件后，从Key:/dubbo/com.foo.BarService/providers下获取提供者地址列表。
5. 服务监控中心启动时，从Channel:/dubbo/*订阅register和unregister，以及subscribe和unsubsribe事件。
6. 服务监控中心收到register和unregister事件后，从Key:/dubbo/com.foo.BarService/providers下获取提供者地址列表。
7. 服务监控中心收到subscribe和unsubsribe事件后，从Key:/dubbo/com.foo.BarService/consumers下获取消费者地址列表。

##### 选项：

* 可通过 `<dubbo:registry group="dubbo" />` 设置redis中key的前缀，缺省为dubbo。
* 可通过 `<dubbo:registry cluster="replicate" />` 设置redis集群策略，缺省为failover。
    * failover: 只写入和读取任意一台，失败时重试另一台，需要服务器端自行配置数据同步。
    * replicate: 在客户端同时写入所有服务器，只读取单台，服务器端不需要同步，注册中心集群增大，性能压力也会更大。

##### 配置 redis registry

```xml
<dubbo:registry address="redis://10.20.153.10:6379" />
```

或

```xml
<dubbo:registry address="redis://10.20.153.10:6379?backup=10.20.153.11:6379,10.20.153.12:6379" />
```

或

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379" />
```

或

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379,10.20.153.11:6379,10.20.153.12:6379" />
```