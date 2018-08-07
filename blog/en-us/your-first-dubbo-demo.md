# Your First Dubbo Demo

## Java RMI Introduction

Java RMI (Remote Method Invocation) is a mechanism that allows users to access or invocate an object and a method running on another JVM (Java Virtual Machine). RMI is an implementation of RPC (Remote Procedure Call) in java with support of OOP (Object Oriented Paradigms). Instead of bothering IDL (Interface Define Language), users can build distributed applications by depending on interfaces in an easy and natural way.

### Java RMI Work Flow

Here is how a typical RMI invocation usually works：

1.	The server registers service from RMI and binds its address.
2.	The client registers service from RMI and obtains target address.
3.	The client invokes methods of local stub object in the same way of invoking other local objects.
4.	Local stub object zips invoking information and send it to the server via network.
5.	The Skeleton object of server receives the network request and unzips the information.
6.	Server runs invocation on the target object based on the information and return the zipped results back to client via network.


![RMI Flow](../../img/blog/rmi-flow.png)

(source：https://www.cs.rutgers.edu/~pxk/417/notes/images/rpc-rmi_flow.png)

### Java RMI Concepts

Java RMI is a technique foundation stone of creating distributed applications in Java. The following EJB techniques and current framework of distributed services still inherit the fundamental concepts of Java RMI. In RMI invocation, there are some core concepts：

1.	The invocation is run remotely on **interface**.
2.	2.	Disguise remote invocation as local invocation by **Stub object** on client and **Skeleton object** on server.
3.	The service is registered and looked up by **RMI** registry service.

For 1. users are dependent on interfaces which should be implemented by server.

For 2. In J2SE 1.5 version and before, it needs to pre-compile Stub on client and Skeleton on server by rmic. In the later versions there is no need to do so.

The following is a code example of registry and look-up in RMI.

#### Server service registry

```java
Hello obj = new HelloImpl(); // #1
Hello stub = (Hello) UnicastRemoteObject.exportObject(obj, 0); // #2
Registry registry = LocateRegistry.createRegistry(1099); // #3
registry.rebind("Hello", stub); // #4
```

Notes:

1.	Initiate service object instance.

2.	Create stub object to communicate with the server by UnicastRemoteObject.exportObject.

3.	Create a local RMI registry service on port 1099 which is run on server. It can also be registered as an independent process.

4.	Bind stub object into registry so the client can find the remote object by looking up Hello.


#### Client service look-up

```java
Registry registry = LocateRegistry.getRegistry(); // #1
Hello stub = (Hello) registry.lookup("Hello"); // #2
String response = stub.sayHello(); // #3
```

Notes:

1.	Acquire registry service instances. In this case, there is no input parameters so it is assumed that the acquired instance is located on port 1099.
2.	Look up the remote object named Hello in registry service.
3.	Run a RMI invocation via acquired Stub object and get results.
Understand the work flow and basic concepts of RMI is helpful to handle current framework of distributed service. It is recommended to refer to RMI official documents for further information[^1].

## Basic Concepts of Dubbo

The basic concepts of current framework of distributed service is similar to the one of RMI. They both use Java interface as service contract, register and look up by registry center and use agency to block the details of remote communications. Specifically, Dubbo has following four types of roles to play when running：

1.	Serve the provider – Expose service at assigned ports at initialization and register the service address and ports at registry center
2.	Serve the consumer – Subscribe the service of interests at registry center at initialization to acquire the list of addresses provided by the service provider.
3.	Registry center – Register and look up service. Store the address provided by the service provider and send it to the consumer.
4.	Monitor center – Collect and monitor running status of providers and consumers, e.g., times of invocations, delay of invocations, etc.
5.	Running container – Initialize and load the provider and manage the lifecycle of running.


![dubbo-architecture](../../img/blog/dubbo-architecture.png)



**Deploy stage**

* Service providers expose service at assigned ports and register information of service at registry center.
* Service consumers subscribe the list of service addresses from registry center.

**Run stage**

* Registry center sends the address to service consumers.
* After receiving the list of addresses, service consumers select one of them and invoke an object service.
* During invocation, the running status of service providers and consumers is reported to the monitor center.

## Dubbo Applications Based on API

The applications of Dubbo are usually assembled by Spring. To obtain an available Dubbo application quickly, the example shown here abandons complex configurations but to create service provider and consumer in Dubbo API oriented way. Additionally, the registry center and monitor center do not need installation or configuration in this example.

In production environment, the service of Dubbo usually requires cooperation with a distributed service registry center, such as ZooKeeper. For convenience, Dubbo offers two ways to avoid extra work of building registry center, namely direct connection [2] and assembled podcast [3] respectively. In this example, the latter way is applied to register and look up service.

### Define Service Contract

```java
public interface GreetingsService {
    String sayHi(String name); // #1
}
```

**Notes**：

1. The codes define a simple service contract where there is only one function, sayHi, can be invoked. The type of input parameter and return value are both String.

### Provide Contract Implementation

```java
public class GreetingsServiceImpl implements GreetingsService { // #1
    @Override
    public String sayHi(String name) {
        return "hi, " + name; // #2
    }
}
```

**Notes**：

1. Service providers need to implement the interface of service contract, GreetingsService.
2. This function simply returns a welcome message. For example, if the input value is *dubbo*，it will return *hi, dubbo*.

### Implement Dubbo Service Provider

```java
public class Application {
    public static void main(String[] args) throws IOException {
        ServiceConfig<GreetingsService> service = new ServiceConfig<>(); // #1
        service.setApplication(new ApplicationConfig("first-dubbo-provider")); // #2
        service.setRegistry(new RegistryConfig("multicast://224.5.6.7:1234")); // #3
        service.setInterface(GreetingsService.class); // #4
        service.setRef(new GreetingsServiceImpl()); // #5
        service.export(); // #6
        System.in.read(); // #7
    }
}
```

**Notes**：

1. Create an instance *ServiceConfig* with service interface type as generics parameters, which is *GreetingsService* in this example.
2. Generate an instance of *ApplicationConfig* and assemble it into *ServiceConfig*.
3. Generate an instance *RegistryConfig* and assemble it into *ServiceConfig*. Since the assembled way is applied here, the parameter should be `multicast://224.5.6.7:1234`. The valid range of assembled address is *224.0.0.0 - 239.255.255.255*
4. Assemble the service contract *GreetingsService* into *ServiceConfig*.
5. Assemble the instance with implementation of *GreetingsServicelmpl* provided by service providers into *ServiceConfig*.
6. *ServiceConfig* starts to expose itself at default ports *20880*. after being equipped with enough information.
7. Press any key or *ctrl-C* to exit to avoid server halt.


### Implement Dubbo Service Consumer

```java
public class Application {
    public static void main(String[] args) {
        ReferenceConfig<GreetingsService> reference = new ReferenceConfig<>(); // #1
        reference.setApplication(new ApplicationConfig("first-dubbo-client")); // #2
        reference.setRegistry(new RegistryConfig("multicast://224.5.6.7:1234")); // #3
        reference.setInterface(GreetingsService.class); // #4
        GreetingsService greetingsService = reference.get(); // #5
        String message = greetingsService.sayHi("dubbo"); // #6
        System.out.println(message); // #7
    }
}
```

**Notes**：

1. Create an instance of *ReferenceConfig* with service interface type as generics parameters, which is *GreetingsService* in this example.
2. Create an instance of *AplicatonConfig*, and assemble it into *ReferenceConfig*.
3. Generate an instance *RegistryConfig*, and assemble it into *ReferenceConfig*. Note that the address information here should be the same as the one of the service provider.
4. Assemble the service contract *GreetingsService* into *ReferenceConfig*.
5. Obtain the agency of *GreetingsService* from *ReferenceConfig*.
6. Invoke a remote call through *GreetingsSerive*’s agency and pass in `dubbo` as input parameter.
7. Return and print results `hi, dubbo`.


### Run

The complete example can be found at https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-api. In the complete version, it is convenient to execute by maven in command line with the configuration of *exec-maven-plugin*. Of course, it can also be executed directly in IDE. However, there is one noteworthy thing that because of using assembled way to look up service, it needs to assign *-Djava.net.preferIPv4Stack=true* when running.

#### Build Example

Synchronize the example codes and build by the following command lines:

1. Synchronize the example codes: git clone https://github.com/dubbo/dubbo-samples.git
2. Build：mvn clean package

```bash
$ git clone https://github.com/dubbo/dubbo-samples.git
$ cd dubbo-samples/dubbo-samples-api/
$ mvn clean package
INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building dubbo-samples-api 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- maven-clean-plugin:2.5:clean (default-clean) @ dubbo-samples-api ---
...
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 2.182 s
[INFO] Finished at: 2018-05-28T14:56:08+08:00
[INFO] Final Memory: 20M/353M
[INFO] ------------------------------------------------------------------------
```

The build is finished when it shows `BUILD SUCCESS`. Then comes the running stage.

#### Run the server

Run the service provider by the following maven command lines:

```bash
$ mvn -Djava.net.preferIPv4Stack=true -Dexec.mainClass=com.alibaba.dubbo.samples.server.Application exec:java
[INFO] Scanning for projects...
[INFO]                                                                         
[INFO] ------------------------------------------------------------------------
[INFO] Building dubbo-samples-api 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- exec-maven-plugin:1.6.0:java (default-cli) @ dubbo-samples-api ---
log4j:WARN No appenders could be found for logger (com.alibaba.dubbo.common.logger.LoggerFactory).
log4j:WARN Please initialize the log4j system properly.
log4j:WARN See http://logging.apache.org/log4j/1.2/faq.html#noconfig for more info.
first-dubbo-provider is running.
```

When *first-dubbo-provider is running* appears, the service provider is ready to be called by the client.

#### Run the client

Run the service consumer by the following maven command lines:

```bash
$ mvn -Djava.net.preferIPv4Stack=true -Dexec.mainClass=com.alibaba.dubbo.samples.client.Application exec:java
[INFO] Scanning for projects...
[INFO]                                                                         
[INFO] ------------------------------------------------------------------------
[INFO] Building dubbo-samples-api 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- exec-maven-plugin:1.6.0:java (default-cli) @ dubbo-samples-api ---
log4j:WARN No appenders could be found for logger (com.alibaba.dubbo.common.logger.LoggerFactory).
log4j:WARN Please initialize the log4j system properly.
log4j:WARN See http://logging.apache.org/log4j/1.2/faq.html#noconfig for more info.
hi, dubbo
```

`hi, dubbo` is the execution results from service provider.

## Quick Creation of A Dubbo Application

Dubbo also provides a public platform that can create a Dubbo application quickly based on Spring Boot. Visit  http://start.dubbo.io and follow the figure below to create an example project:

![dubbo initializr](../../img/blog/dubbo-initializr.png)

**Notes**：

1. Provide maven groupId in *Group* with default value `com.example`.
2. Provide maven artifactId in *Artifact* with default value `demo`.
3. Provide the name of service in *DubboServiceName* with default value `com.example.HelloService`.
4. Provide the version of service in *DubboServiceVersion* with default value `1.0.0`.
5. Choose server or client in *Client/Server* with default value `server`.
6. *embeddedZookeeper* is selected by default as service registry look up.
7. qos ports activation is not selected by default but if it is, it can be accessed by port *22222*.
8. Click *Generate Project* to download the generated project.

This example shows how to generate a server. Similarly, it can generate a *client* by selecting client on the generation interface.

### Run

Open the generated project with an IDE and to see the application is a typical Spring Boot application with the following program entry:

```java
@SpringBootApplication
public class DemoApplication {
	public static void main(String[] args) {
		new EmbeddedZooKeeper(2181, false).start();  // #1
		SpringApplication.run(DemoApplication.class, args); // #2
	}
}
```

**Notes**：

1. Launch embedded *ZooKeeper* on port *2181*.
2. Launch the context of *Spring Boot*.


Run it directly in IDE and here are the results:

```bash
2018-05-28 16:59:38.072  INFO 59943 --- [           main] a.b.d.c.e.WelcomeLogoApplicationListener :

  ████████▄  ███    █▄  ▀█████████▄  ▀█████████▄   ▄██████▄  
  ███   ▀███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███  ▄███▄▄▄██▀   ▄███▄▄▄██▀  ███    ███
  ███    ███ ███    ███ ▀▀███▀▀▀██▄  ▀▀███▀▀▀██▄  ███    ███
  ███    ███ ███    ███   ███    ██▄   ███    ██▄ ███    ███
  ███   ▄███ ███    ███   ███    ███   ███    ███ ███    ███
  ████████▀  ████████▀  ▄█████████▀  ▄█████████▀   ▀██████▀  


 :: Dubbo Spring Boot (v0.1.0) : https://github.com/dubbo/dubbo-spring-boot-project
 :: Dubbo (v2.0.1) : https://github.com/alibaba/dubbo
 :: Google group : http://groups.google.com/group/dubbo

2018-05-28 16:59:38.079  INFO 59943 --- [           main] e.OverrideDubboConfigApplicationListener : Dubbo Config was overridden by externalized configuration {dubbo.application.name=dubbo-demo-server, dubbo.application.qosAcceptForeignIp=false, dubbo.application.qosEnable=true, dubbo.application.qosPort=22222, dubbo.registry.address=zookeeper://localhost:2181?client=curator, dubbo.registry.id=my-registry, dubbo.scan.basePackages=com.example} #1

...

2018-05-28 16:59:39.624  INFO 59943 --- [           main] com.example.demo.DemoApplication         : Started DemoApplication in 1.746 seconds (JVM running for 2.963)
```

**Notes**：

1. In the printouts, the configuration starting with `dubbo.` Is defined in *main/resources/application.properties*.

### Manage service by Telnet

If *qos* is actived during generation, the service can be watched and managed by *telnet* or *nc*.

```bash
$ telnet localhost 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
  ████████▄  ███    █▄  ▀█████████▄  ▀█████████▄   ▄██████▄  
  ███   ▀███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███  ▄███▄▄▄██▀   ▄███▄▄▄██▀  ███    ███
  ███    ███ ███    ███ ▀▀███▀▀▀██▄  ▀▀███▀▀▀██▄  ███    ███
  ███    ███ ███    ███   ███    ██▄   ███    ██▄ ███    ███
  ███   ▄███ ███    ███   ███    ███   ███    ███ ███    ███
  ████████▀  ████████▀  ▄█████████▀  ▄█████████▀   ▀██████▀  


dubbo>
dubbo>ls
As Provider side:
+------------------------------+---+
|     Provider Service Name    |PUB|
+------------------------------+---+
|com.example.HelloService:1.0.0| Y |
+------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```

Currently, *qos* supports following command lines. For more information please refer to the official document. [^4]:

* *ls*：List the information of client and server.
* *online*：Bring the service online.
* *offline*：Bring the service offline.
* *help*：View online help.

## Summary

In this tutorial, we start with RMI and introduce the basic concepts in Java distributed invocations. Based on interface programming, it disguises remote calls as local by agency and run the service registry and looking up by registry center.

Then for simplicity, we introduce how to develop a complete Dubbo demo in an easy way of assembled registry and direct Dubbo API oriented programming. Additionally, we look into the usage of *ServiceConfig* and *RefenceConfig*, which is of great help for further using Spring XML configuration and the programming pattern of Spring Boot.

Eventually, we give an outline of how to create a Dubbo application quickly based on Spring Boot using the public resources, start.dubbo.io, provided by the Dubbo development team and operate and maintain the Dubbo service by *qos*.

---

1. [Getting Started Using JavaTM RMI](https://docs.oracle.com/javase/6/docs/technotes/guides/rmi/hello/hello-world.html)
2. [直连提供者](http://dubbo.apache.org/books/dubbo-user-book/demos/explicit-target.html)
3. [Multicast 注册中心](http://dubbo.apache.org/books/dubbo-user-book/references/registry/multicast.html)
4. [在线运维命令](http://dubbo.apache.org/books/dubbo-user-book/references/qos.html)   
