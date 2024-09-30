---
title: "Using Zookeeper in Dubbo Applications"
linkTitle: "Using Zookeeper in Dubbo Applications"
date: 2018-08-07
tags: ["Ecosystem", "Java"]
description: >
    This article introduces the basic concepts and usage of Zookeeper, as well as how to use Zookeeper as a registry in Dubbo applications.
---

## Introduction to Zookeeper

### Basic Concepts

In modern distributed applications, coordination issues often arise between nodes, including leader election, cluster management, distributed locks, distributed configuration management, unified naming services, and state synchronization. [Apache Zookeeper](https://zookeeper.apache.org), as its name suggests, is a distributed coordination service framework designed to address these concerns.

To ensure high availability, ZooKeeper can be deployed in a cluster mode, known as a *ZooKeeper ensemble*. Within a ZooKeeper cluster, one node always acts as the leader, and through the *ZAB (Zookeeper Atomic Broadcast Protocol) [^1]* protocol, it ensures the consistency of information across all nodes. Clients can access any node in the cluster for read and write operations without worrying about data inconsistency.

![Diagram shows client-server architecture of ZooKeeper](/imgs/blog/zk-emsemble.png)
*Image Credit : ebook -Zookeeper-Distributed Process Coordination from O'Reilly*

Zookeeper stores data in a manner similar to a traditional UNIX file system, organized in a tree structure where nodes are called *znodes (ZooKeeper data nodes)*.

![zk-tree](/imgs/blog/zk-tree.png)
*Image Credit : ebook -Zookeeper-Distributed Process Coordination from O'Reilly*

### Basic Usage

You can install and run Zookeeper by downloading it directly [^2], or on a Mac using Homebrew [^3] with `brew install zookeeper`. This article uses Docker to run Zookeeper for general usability. Please prepare your Docker environment first if it is not installed [^4].

#### 1. Start Zookeeper

Run Zookeeper in a Docker container with the following command:

```shell
docker run --rm --name zookeeper -p 2181:2181 zookeeper
```

#### 2. Access the Zookeeper Container

```shell
docker exec -it zookeeper bash
```

The `bin` directory contains the command to start Zookeeper `zkServer` and the management console `zkCli`.

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

#### 3. Enter the Zookeeper Management Interface via zkCli

Since you started Zookeeper through Docker, the Zookeeper process is already running and is available at port 2181.

```shell
bash-4.4# ps
PID   USER     TIME  COMMAND
    1 zookeepe  0:02 /usr/lib/jvm/java-1.8-openjdk/jre/bin/java -Dzookeeper.log.dir=. -Dzookeeper.root
   32 root      0:00 bash
   42 root      0:00 ps
```

You can directly access the Zookeeper console for management using `zkCli`.

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

#### 4. Basic Operations in zkCli

Create the node `/hello-zone`:

```shell
[zk: 127.0.0.1:2181(CONNECTED) 19] create /hello-zone 'world'
Created /hello-zone
```

List child nodes under `/` to confirm that `hello-zone` was created:

```shell
[zk: 127.0.0.1:2181(CONNECTED) 20] ls /
[zookeeper, hello-zone]
```

List child nodes under `/hello-zone` to confirm it is empty:

```shell
[zk: 127.0.0.1:2181(CONNECTED) 21] ls /hello-zone
[]
```

Get the data stored in the `/hello-zone` node:

```shell
[zk: 127.0.0.1:2181(CONNECTED) 22] get /hello-zone
world
```



## Using Zookeeper in Dubbo

Dubbo uses Zookeeper for service registration, discovery, and configuration management. The organization of data in Zookeeper is illustrated in the following diagram:

![dubbo-in-zk](/imgs/blog/dubbo-in-zk.jpg)

First, all Dubbo-related data is organized under the root node `/dubbo`.

The second-level directory represents the service name, such as `com.foo.BarService`.

The third-level directory has two subnodes, `providers` and `consumers`, indicating the service providers and consumers, respectively.

The fourth-level directory records the URL information of each application instance related to that service. Under `providers`, it shows all providers of the service, and under `consumers`, it shows all consumers. For example, the service provider for `com.foo.BarService` registers its URL information under `/dubbo/com.foo.BarService/providers` when it starts; similarly, the service consumer registers its information under the corresponding `consumers` node, and subscribes to the corresponding `providers` node to be notified of any changes to the service provider address list.

### Preparing Example Code

The code for this article can be found at https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-zookeeper.

#### 1. Interface Definition

Define a simple `GreetingService` interface with a simple method `sayHello` that greets the caller.

```java
public interface GreetingService {
    String sayHello(String name);
}
```

#### 2. Server: Service Implementation

Implement the `GreetingService` interface and annotate it with `@Service` to mark it as a Dubbo service.

```java
@Service
public class AnnotatedGreetingService implements GreetingService {
    public String sayHello(String name) {
        return "hello, " + name;
    }
}
```

#### 3. Server: Assembly

Define `ProviderConfiguration` to assemble Dubbo services.

```java
@Configuration
@EnableDubbo(scanBasePackages = "com.alibaba.dubbo.samples.impl")
@PropertySource("classpath:/spring/dubbo-provider.properties")
static class ProviderConfiguration {}
```

The `dubbo-provider.properties` file is an external configuration method in a Spring application, with the following contents:

```properties
dubbo.application.name=demo-provider
dubbo.registry.address=zookeeper://$DOCKER_HOST:2181
dubbo.protocol.name=dubbo
dubbo.protocol.port=20880
```

Since Zookeeper runs in a Docker container, it is important to note:

* This article assumes that the Dubbo application runs on the host machine, i.e., outside the Docker container, and you need to replace Zookeeper's address with the IP address specified by the environment variable *${DOCKER_HOST}*. Please refer to the Docker official documentation for details.
* If the Dubbo application is also a Dockerized application, you simply use the container name for Zookeeper, which is **zookeeper** in this article.
* Of course, if you start Zookeeper without using a container, you can simply change the *$DOCKER_HOST* here to **localhost**.

#### 4. Server: Start Service

In the `main` method, start a Spring Context to expose the Dubbo service.

```java
public class ProviderBootstrap {
    public static void main(String[] args) throws Exception {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ProviderConfiguration.class);
        context.start();
        System.in.read();
    }
}
```

When you run the server's `main` method, you will see the following output, indicating that the server has started successfully and registered the `GreetingService` at the registry (ZookeeperRegistry):

```sh
[03/08/18 10:50:33:033 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Register: dubbo://192.168.99.1:20880/com.alibaba.dubbo.samples.api.GreetingService?anyhost=true&application=demo-provider&dubbo=2.6.2&generic=false&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=12938&side=provider&timestamp=1533264631849, dubbo version: 2.6.2, current host: 192.168.99.1
```

Use the Zookeeper management terminal to observe the registration information of the service provider:

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

You can see that the just-started Dubbo service registered its URL at the `providers` node: *dubbo://192.168.99.1:20880/com.alibaba.dubbo.samples.api.GreetingService?anyhost=true&application=demo-provider&dubbo=2.6.2&generic=false&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=12938&side=provider&timestamp=1533264631849*.

#### 5. Client: Reference Service

Use `@Reference` to declare a reference to the service in the client. At runtime, this reference will launch a full call, and the service's target address will be queried from the `provider` node in Zookeeper.

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

#### 6. Client: Assembly

Define `ConsumerConfiguration` to assemble Dubbo services.

```java
@Configuration
@EnableDubbo(scanBasePackages = "com.alibaba.dubbo.samples.action")
@PropertySource("classpath:/spring/dubbo-consumer.properties")
@ComponentScan(value = {"com.alibaba.dubbo.samples.action"})
static class ConsumerConfiguration {}
```

The `dubbo-consumer.properties` file is an external configuration method in a Spring application, with the following contents:

```properties
dubbo.application.name=demo-consumer
dubbo.registry.address=zookeeper://$DOCKER_HOST:2181
dubbo.consumer.timeout=3000
```

As with **3. Server: Assembly**, you need to modify the *$DOCKER_HOST* defined in *dubbo.registry.address* according to your running environment. Please refer to the explanation in step 3.

#### 7. Client: Initiate Remote Call

Run the `main` method to make a remote call to the already started service provider. Dubbo will first subscribe to the service address from Zookeeper, then select one from the returned address list to call the remote service:

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

The output is as follows:

```shell
[03/08/18 01:42:31:031 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Register: consumer://192.168.99.1/com.alibaba.dubbo.samples.api.GreetingService?application=demo-consumer&category=consumers&check=false&default.timeout=3000&dubbo=2.6.2&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=82406&side=consumer&timestamp=1533274951195, dubbo version: 2.6.2, current host: 192.168.99.1 #1
[03/08/18 01:42:31:031 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Subscribe: consumer://192.168.99.1/com.alibaba.dubbo.samples.api.GreetingService?application=demo-consumer&category=providers,configurators,routers&default.timeout=3000&dubbo=2.6.2&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=82406&side=consumer&timestamp=1533274951195, dubbo version: 2.6.2, current host: 192.168.99.1 #2
...
result: hello, zookeeper
```

Notes:

1. **Register**: consumer://192.168.99.1/...&**category=consumers**&: The consumer registers its information with Zookeeper under the `consumers` node.
2. **Subscribe**: consumer://192.168.99.1/...&**category=providers,configurators,routers**&: The consumer subscribes to the `providers`, `configurators`, and `routers` nodes, where `configurations` are related to Dubbo configurations and `routers` are related to routing rules. Notably, the subscription to the `providers` node means that when new service providers join, the new address list will be pushed to subscribers, allowing service consumers to dynamically perceive changes to the address list.

Use the Zookeeper management terminal to observe the registration information of the service provider:

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

You can see that the Dubbo service consumer registered its URL at the `consumers` node: *consumer://192.168.99.1/com.alibaba.dubbo.samples.api.GreetingService?application=demo-consumer&category=providers,configurators,routers&default.timeout=3000&dubbo=2.6.2&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=82406&side=consumer&timestamp=1533274951195*.

## Conclusion

This article focuses on how to use Zookeeper as a registry in Dubbo applications. Additionally, it mentions that Zookeeper also serves as a configuration center and service governance role in the context of Dubbo. The Zookeeper discussed in this article is a single-node, standalone mode; in production environments, to meet the requirement of high availability, a Zookeeper cluster is usually assembled, known as *Zookeeper ensemble* mode.

Through this article, readers will grasp:

* The basic concepts and usage of Zookeeper.
* The role of Zookeeper in Dubbo applications.
* Practical understanding of the interaction between Zookeeper and Dubbo.
* How Dubbo stores service registration and consumption information in Zookeeper.

[^1]: https://en.wikipedia.org/wiki/Atomic_broadcast
[^2]: https://www.apache.org/dyn/closer.cgi/zookeeper/
[^3]: https://brew.sh
[^4]: https://www.docker.com/community-edition

