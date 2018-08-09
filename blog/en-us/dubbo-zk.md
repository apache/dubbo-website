# Using Zookeeper in Dubbo

## Introduction of Zookeeper

### The basic concept

In the mordern distrbuted applications, there are multiple coordination problems between nodes and nodes, including: leader election, group service, locking, configuration management, naming and synchronization. Apache Zookeeper, as its name implied, is a distributed, open-source coordination service framwork to address these demand. 

In order to ensure the high performance, highly available and strictly ordered access, the performance aspects of ZooKeeper means it can be used in large, distributed systems and can also be deployed in cluster mode, which called 'ZooKeeper ensemble'. In ZooKeeper ensemble, all write requests from clients are forwarded to a single server, called the leader, through the ZAB(Zookeeper Atomic Broadcast Protocol) to make sure the message in each nodes are same. Clients can access any one of the clusters to read and write data without worrying about inconsistencies in the data.


![Diagram shows client-server architecture of ZooKeeper](https://github.com/apache/incubator-dubbo-website/blob/asf-site/img/blog/zk-emsemble.png)
*Image Credit : ebook -Zookeeper-Distributed Process Coordination from O'Reilly*

The method to store the data in Zookeeper is similar as the standard UNIX file system, as a data model styled after the familiar directory tree structure of file systems. When we talking about ZooKeeper data nodes, we call it Znodes to clarify it.

![zk-tree](https://github.com/apache/incubator-dubbo-website/blob/asf-site/img/blog/zk-tree.png)
*Image Credit : ebook -Zookeeper-Distributed Process Coordination from O'Reilly*

### Basic Implementation

You could donwload and install Zookeeper directly[^2].
Or you could use Homebrew [^3] `brew install zookeeper` to install Zookeeper in Mac OS. 
Considering the versatility, we run the Zookeeper by using docker in this blog. If you have not installed the docker yet, please prepare the docker environment first. [^4]

#### 1. Running the Zookeeper

Execute the command to run zookeeper in a docker container

```shell
docker run --rm --name zookeeper -p 2181:2181 zookeeper
```
 
#### 2. Entering the zookeeper container

```shell
docker exec -it zookeeper bash
```

In the `bin` directory, there is a command to start zookeeper `zkServer` and the Management Console `zkCli`

```shell
bash-4.4# ls -l bin
total 36
-rwxr-xr-x    1 zookeepe zookeepe       232 Mar 27 04:32 README.txt
-rwxr-xr-x    1 zookeepe zookeepe      1937 Mar 27 04:32 zkCleanup.sh
-rwxr-xr-x    1 zookeepe zookeepe      1056 Mar 27 04:32 zkCli.cmd
-rwxr-xr-x    1 zookeepe zookeepe      1534 Mar 27 04:32 zkCli.sh
-rwxr-xr-x    1 zookeepe zookeepe      1759 Mar 27 04:32 zkEnv.cmd
-rwxr-xr-x    1 zookeepe zookeepe      2696 Mar 27 04:32 zkEnv.sh
-rwxr-xr-x    1 zookeepe zookeepe      1089 Mar 27 04:32 zkServer.cmd
-rwxr-xr-x    1 zookeepe zookeepe      6773 Mar 27 04:32 zkServer.sh
```

#### 3. Entering the zookeeper management interface via zkCli

Since it was started through docker, the process of Zookeeper has been started and will provide the services to the public via port 2181.

```shell
bash-4.4# ps
PID   USER     TIME  COMMAND
    1 zookeepe  0:02 /usr/lib/jvm/java-1.8-openjdk/jre/bin/java -Dzookeeper.log.dir=. -Dzookeeper.root
   32 root      0:00 bash
   42 root      0:00 ps
```

So, it allows you to access Zookeeper's console directly through `zkCli ` for management.

```shell
bash-4.4# bin/zkCli.sh -server 127.0.0.1:2181
Connecting to 127.0.0.1:2181
...
WATCHER::

WatchedEvent state:SyncConnected type:None path:null

[zk: 127.0.0.1:2181(CONNECTED) 0] help
ZooKeeper -server host:port cmd args
	stat path [watch]
	set path data [version]
	ls path [watch]
	delquota [-n|-b] path
	ls2 path [watch]
	setAcl path acl
	setquota -n|-b val path
	history
	redo cmdno
	printwatches on|off
	delete path [version]
	sync path
	listquota path
	rmr path
	get path [watch]
	create [-s] [-e] path data acl
	addauth scheme auth
	quit
	getAcl path
	close
	connect host:port
```

#### 4. Basic Examples on zkCli

Create `/hello-zone` node:
```shell
[zk: 127.0.0.1:2181(CONNECTED) 19] create /hello-zone 'world'
Created /hello-zone
```

List the child nodes under `/` and confirm that `hello-zone` is created:

```shell
[zk: 127.0.0.1:2181(CONNECTED) 20] ls /
[zookeeper, hello-zone]
```

List the child nodes for `/hello-zone` and verify that it is empty:

```shell
[zk: 127.0.0.1:2181(CONNECTED) 21] ls /hello-zone
[]
```

Get the data stored on the `/hello-zone` node:

```shell
[zk: 127.0.0.1:2181(CONNECTED) 22] get /hello-zone
world
```

## Using Zookeeper in Dubbo
Zookeeper is used for service registration discovery and configuration management in Dubbo, and the structure of data in Zookeeper is shown in the following figure:

![dubbo-in-zk](https://github.com/apache/incubator-dubbo-website/blob/asf-site/img/blog/dubbo-in-zk.jpg)

First, all data related to Dubbo is organized under the root node of `/duboo`.

The secondary directory is the service name like `com.foo.BarService`.

The three-level directory has two child nodes, `providers` and `consumers`, representing the supplier and customers of the service.

The URL information for each application instance associated with the service will be recorded by the Level 4 directory. The `providers` and `consumer` will stored the providers information and the consumers information of the services seperately.  
For example, the service provider of `com.foo.BarService`  will register its URL Information to `/dubbo/com.foo.BarService/providers`; Similarly, service consumers will register their information under the corresponding `consumer` node. At the same time, consumers will subscribe to the corresponding `providers` node to be able to detect the changes of the service provider address list.

### Prepare the sample code

The code in this document can be found in https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-zookeeper.

#### 1. Interface definition

Define a simple `greetingservice` interface with only one simple method named `sayHello` to greet to the caller.

```java
public interface GreetingService {
    String sayHello(String name);
}
```

#### 2. Server: Implementation

Implement the `GreetingService`  interface and mark it as a service for Dubbo via `@Service`.

```java
@Service
public class AnnotatedGreetingService implements GreetingService {
    public String sayHello(String name) {
        return "hello, " + name;
    }
}
```

#### 3. Server: Assembly

Define ProviderConfiguration to assemble Dubbo services.

```java
@Configuration
@EnableDubbo(scanBasePackages = "com.alibaba.dubbo.samples.impl")
@PropertySource("classpath:/spring/dubbo-provider.properties")
static class ProviderConfiguration {}
```

Dubbo-provider.properties is an external configuration in a spring application, as follows:

```properties
dubbo.application.name=demo-provider
dubbo.registry.address=zookeeper://$DOCKER_HOST:2181
dubbo.protocol.name=dubbo
dubbo.protocol.port=20880
```

Since zookeeper runs in a docker container, please be noted that:

* We assumes that Dubbo applications is running on the host machine (outside the docker container) in this document, and  needs to replace the PATH of Zookeeper with the IP address of the Environment Variable *${DOCKER_HOST}*. Please find more detail in the official Docker documentation.
* When the Dubbo application is a docker application, the container's name is equivalent to Zookeeper's. The container's name is ** zookeeper ** in this document.
* Of course, if you don't want to run the Zookeeper in a container mode, just simply replace *$DOCKER_HOST* with **localhost**.

#### 4. Server: Starting Service

In the `main` method, you could provide the Dubbo service by running a Spring Context.


```java
public class ProviderBootstrap {
    public static void main(String[] args) throws Exception {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ProviderConfiguration.class);
        context.start();
        System.in.read();
    }
}
```

Start the `main` method of server,  you will get the following output, which represents the success of the server's startup, and  the `GreetingService` service is registered on the ZookeeperRegistry:

```sh
[03/08/18 10:50:33:033 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Register: dubbo://192.168.99.1:20880/com.alibaba.dubbo.samples.api.GreetingService?anyhost=true&application=demo-provider&dubbo=2.6.2&generic=false&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=12938&side=provider&timestamp=1533264631849, dubbo version: 2.6.2, current host: 192.168.99.1
```

You could find the registration information of the service provider through the Zookeeper management terminal:

```sh
$ docker exec -it zookeeper bash
bash-4.4# bin/zkCli.sh -server localhost:218
Connecting to localhost:2181
...
Welcome to ZooKeeper!
JLine support is enabled
...
[zk: localhost:2181(CONNECTED) 0] ls /dubbo/com.alibaba.dubbo.samples.api.GreetingService/providers
[dubbo%3A%2F%2F192.168.99.1%3A20880%2Fcom.alibaba.dubbo.samples.api.GreetingService%3Fanyhost%3Dtrue%26application%3Ddemo-provider%26dubbo%3D2.6.2%26generic%3Dfalse%26interface%3Dcom.alibaba.dubbo.samples.api.GreetingService%26methods%3DsayHello%26pid%3D12938%26side%3Dprovider%26timestamp%3D1533264631849]
```
You could find that the Dubbo services just registered its URL address at the `providers` node as follows:
*dubbo://192.168.99.1:20880/com.alibaba.dubbo.samples.api.GreetingService?anyhost=true&application=demo-provider&dubbo=2.6.2&generic=false&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=12938&side=provider&timestamp=1533264631849*


#### 5. Client: Reference Service
You could declare the reference service by @Reference, while it will generate a full call. The target address of the service could be queried by the Zookeeper's `provider` node.

```java
@Component("annotatedConsumer")
public class GreetingServiceConsumer {
    @Reference
    private GreetingService greetingService;

    public String doSayHello(String name) {
        return greetingService.sayHello(name);
    }
}
```

#### 6. Client: Assembling
Define the ConsumerConfiguration to assemble Dubbo service.

```java
@Configuration
@EnableDubbo(scanBasePackages = "com.alibaba.dubbo.samples.action")
@PropertySource("classpath:/spring/dubbo-consumer.properties")
@ComponentScan(value = {"com.alibaba.dubbo.samples.action"})
static class ConsumerConfiguration {}
```
"dubbo-consumer.properties" is a method of external configuration in a Spring application, as follows:

```properties
dubbo.application.name=demo-consumer
dubbo.registry.address=zookeeper://$DOCKER_HOST:2181
dubbo.consumer.timeout=3000
```

Same as **3. Server: Assembling**, You need to modify *$DOCKER_HOST* defined in *dubbo.registry.address* according to your own  environment. You could find more instructions in step 3.


#### 7. Client: Initiating A Remote Call
Run `main` to initiate a remote call from a existed service provider. Dubbo first subscribes to the zookeeper service address and then selects one from the list of returned addresses to invoke the client:

```java
public class ConsumerBootstrap {
    public static void main(String[] args) {
public class ConsumerBootstrap {

    public static void main(String[] args) throws IOException {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ConsumerConfiguration.class);
        context.start();
        GreetingServiceConsumer greetingServiceConsumer = context.getBean(GreetingServiceConsumer.class);
        String hello = greetingServiceConsumer.doSayHello("zookeeper");
        System.out.println("result: " + hello);
        System.in.read();
    }
}
```

The output are as follows:

```shell
[03/08/18 01:42:31:031 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Register: consumer://192.168.99.1/com.alibaba.dubbo.samples.api.GreetingService?application=demo-consumer&category=consumers&check=false&default.timeout=3000&dubbo=2.6.2&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=82406&side=consumer&timestamp=1533274951195, dubbo version: 2.6.2, current host: 192.168.99.1 #1
[03/08/18 01:42:31:031 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Subscribe: consumer://192.168.99.1/com.alibaba.dubbo.samples.api.GreetingService?application=demo-consumer&category=providers,configurators,routers&default.timeout=3000&dubbo=2.6.2&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=82406&side=consumer&timestamp=1533274951195, dubbo version: 2.6.2, current host: 192.168.99.1 #2
...
result: hello, zookeeper
```

Description:

1. **Register**: consumer://192.168.99.1/...&**category=consumers**&： In Zookeeper, consumers could register their information and store it at the `consumers` node
2. **Subscribe**: consumer://192.168.99.1/...&**category=providers,configurators,routers**&：Consumers subscribe `providers`, `configurators`, `routers` from Zookeepers. The `configurations` is related to the Dubbo configuration, and `routers` is related to routing rules. The providers node subscription should be noted. When a new service provider to join, due to the relationship between the subscription, the new address list will be pushed to the subscriber. So service consumers also dynamically perceive changes in address lists.

You could find the registration information of the service provider through the Zookeeper management terminal:
```sh
$ docker exec -it zookeeper bash
bash-4.4# bin/zkCli.sh -server localhost:218
Connecting to localhost:2181
...
Welcome to ZooKeeper!
JLine support is enabled
...
[zk: localhost:2181(CONNECTED) 4] ls /dubbo/com.alibaba.dubbo.samples.api.GreetingService/consumers
[consumer%3A%2F%2F192.168.99.1%2Fcom.alibaba.dubbo.samples.api.GreetingService%3Fapplication%3Ddemo-consumer%26category%3Dconsumers%26check%3Dfalse%26default.timeout%3D3000%26dubbo%3D2.6.2%26interface%3Dcom.alibaba.dubbo.samples.api.GreetingService%26methods%3DsayHello%26pid%3D82406%26side%3Dconsumer%26timestamp%3D1533274951195]
```

You could see that  consumers of Dubbo's servicehas registered its URL address at the `consumers` node:

*consumer://192.168.99.1/com.alibaba.dubbo.samples.api.GreetingService?application=demo-consumer&category=providers,configurators,routers&default.timeout=3000&dubbo=2.6.2&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=82406&side=consumer&timestamp=1533274951195*


## Summary
This document focuses on how to use ZooKeeper as a registry in Dubbo. This document also mentioned that the Zookeeper could be a configuration center and a service management in Dubbo. Zookeeper is a single-node, standalone mode. However, developers always bulid a Zookeeper server cluster called * Zookeeper ensemble * in the real world.

Through this document, readers can learn:
* Basic concepts and applications of ZooKeeper
* The function of Zookeeper in Dubbo application
* Learn about Zookeeper's interaction through practical sample codes
* The storage of service registration and consumption information of Dubbo with ZooKeeper

[^1]: https://www.ixiacom.com/company/blog/apache-zab—zookeeper-atomic-broadcast-protocol
[^2]: https://www.apache.org/dyn/closer.cgi/zookeeper/
[^3]: https://brew.sh
[^4]: https://www.docker.com/community-edition
