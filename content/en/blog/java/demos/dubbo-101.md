---
title: "First Dubbo Application"
linkTitle: "First Dubbo Application"
tags: ["Java"]
slug: dubbo-101
date: 2018-08-07
description: >
    The basic concepts of modern distributed service frameworks are similar to RMI, using Java's Interface as the service contract, registering and discovering services through a registration center, and shielding the details of remote communication through proxy classes.
---

## Introduction to Java RMI

Java RMI (Remote Method Invocation) allows clients to invoke methods on objects in the server's Java Virtual Machine as if they were local calls. RMI is an enhancement of RPC (Remote Procedure Call) in the object-oriented language domain, enabling distributed calls without relying on IDL, using interfaces instead.

### Working Principle of Java RMI

A typical RMI call proceeds as follows:

1. The server binds its service to an address in RMI.
2. Clients obtain the target address via the RMI registry.
3. The client invokes methods on the local Stub object as if invoking methods on a local object.
4. The local Stub object packages the call information and sends it over the network to the server.
5. The server's Skeleton receives the network request and unpacks the call information.
6. The actual service object is called, and the result is sent back to the client.

![RMI Flow](/imgs/blog/rmi-flow.png)

(Source: https://www.cs.rutgers.edu/~pxk/417/notes/images/rpc-rmi_flow.png)

### Basic Concepts of Java RMI

Java RMI is the technical foundation for creating distributed applications in Java. Subsequent EJB technology and modern distributed service frameworks continue the fundamental concepts of Java RMI. There are several core concepts in RMI calls:

1. Remote calls are made through **interfaces**.
2. Client **Stub objects** and server **Skeleton objects** disguise remote calls as local calls.
3. **RMI registry service** facilitates service registration and discovery.

For the first point, clients depend on interfaces, while servers must provide implementations. Prior to J2SE 1.5, rmic was required to compile the client Stub and server Skeleton objects beforehand; later versions no longer require this.

The following code snippets illustrate service registration and discovery in RMI.

#### Service Registration on the Server

```java
Hello obj = new HelloImpl(); // #1
Hello stub = (Hello) UnicastRemoteObject.exportObject(obj, 0); // #2
Registry registry = LocateRegistry.createRegistry(1099); // #3
registry.rebind("Hello", stub); // #4
```

Instructions:

1. Initialize the service object instance.
2. Generate a Stub object that can communicate with the server.
3. Create a local RMI registry service listening on port 1099.
4. Bind the Stub object to the registry service, enabling clients to find the remote object by the name *Hello*.

#### Service Discovery by the Client

```java
Registry registry = LocateRegistry.getRegistry(); // #1
Hello stub = (Hello) registry.lookup("Hello"); // #2
String response = stub.sayHello(); // #3
```

Instructions:

1. Obtain an instance of the registry service, assuming it's deployed locally and listening on port 1099.
2. Look up the remote object named *Hello*.
3. Make an RMI call through the Stub object.

Understanding RMI's principles and concepts aids in mastering modern distributed service frameworks. Further reading on the official RMI tutorial is recommended [^1].

## Basic Concepts of Dubbo

The basic concepts of modern distributed service frameworks are similar to RMI. They use Java's Interface as a service contract and utilize a registration center for service registration and discovery while shielding remote communication details through proxy classes. Specifically, four roles participate when Dubbo is working:

1. Service Provider - Exposes services on a specified port and registers the service address with the registry center.
2. Service Consumer - Subscribes to services of interest from the registry center to obtain addresses of service providers.
3. Registry Center - Manages service registration and discovery, storing service provider addresses and pushing them to service consumers.
4. Monitoring Center - Collects the operational status of service providers and consumers, such as service call counts and delays, for monitoring.
5. Running Container - Manages the initialization, loading, and lifecycle of service providers.

![dubbo-architecture](/imgs/blog/dubbo-architecture.png)

**Deployment Phase**

* The service provider exposes services on a specified port and registers the service information with the registry center.
* The service consumer subscribes to the list of service addresses from the registry center.

**Runtime Phase**

* The registry center pushes address list information to the service consumer.
* The service consumer selects one from the address list to invoke the target service.
* The service consumer and provider report their operational statuses to the monitoring center.

## Dubbo Application Based on API

Dubbo applications are generally assembled using Spring. To quickly obtain a working Dubbo application, this example skips complex configurations and instead constructs service providers and consumers using the Dubbo API approach, and does not require installation and configuration of the registry center and monitoring center.

In a production environment, Dubbo services require a distributed service registration center like ZooKeeper. For development convenience, Dubbo provides direct connection[^2] and multicast[^3] options to avoid additional setup for the registry center. This example will use multicast for service registration and discovery.

### Define Service Contract

```java
public interface GreetingsService {
    String sayHi(String name); // #1
}
```

**Explanation**:

1. A simple service contract *GreetingsService* is defined, containing a method *sayHi* that takes a *String* parameter and returns a *String*.

### Provide Contract Implementation

```java
public class GreetingsServiceImpl implements GreetingsService { // #1
    @Override
    public String sayHi(String name) {
        return "hi, " + name; // #2
    }
}
```

**Explanation**:

1. The service provider must implement the *GreetingsService* interface.
2. The implementation simply returns a welcome message; if the parameter is *dubbo*, it returns *hi, dubbo*.

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

**Explanation**:

1. Create an instance of *ServiceConfig*, using the service interface type *GreetingsService*.
2. Generate an instance of *ApplicationConfig* and inject it into *ServiceConfig*.
3. Generate an instance of *RegistryConfig* and inject it into *ServiceConfig*, using multicast with `multicast://224.5.6.7:1234`. Valid multicast addresses range from *224.0.0.0 - 239.255.255.255*.
4. Inject the service contract *GreetingsService* into *ServiceConfig*.
5. Inject an instance of the implementation *GreetingsServiceImpl* into *ServiceConfig*.
6. *ServiceConfig* is now ready to expose the service, which listens on port *20880* by default.
7. Press any key or *ctrl-c* to prevent the server from exiting. 

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

**Explanation**:

1. Create an instance of *ReferenceConfig*, using the service interface type *GreetingService*.
2. Generate an instance of *ApplicationConfig* and inject it into *ReferenceConfig*.
3. Generate an instance of *RegistryConfig* and inject it into *ReferenceConfig*; note that the multicast address must match the service provider's.
4. Inject the service contract *GreetingsService* into *ReferenceConfig*.
5. Obtain a proxy for *GreetingService* from *ReferenceConfig*.
6. Initiate a remote call through the proxy, passing in *dubbo* as an argument.
7. Print the returned result *hi, dubbo*.

### Running

The complete example is provided at https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api. In this example, *exec-maven-plugin* is configured for convenient command-line execution via Maven. You can also run it directly in IDE, but remember to specify *-Djava.net.preferIPv4Stack=true* because multicast is used for service discovery.

#### Build the Example

Synchronize the example code and build with the following commands:

1. Sync code: git clone https://github.com/apache/dubbo-samples.git
2. Build: mvn clean package

```bash
$ git clone https://github.com/apache/dubbo-samples.git
$ cd dubbo-samples/java/dubbo-samples-api/
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

When you see *BUILD SUCCESS*, construction is complete, and we can proceed to the runtime phase.

#### Run the Server

Start the service provider with the following Maven command:

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

When *first-dubbo-provider is running.* appears, the service provider is ready and awaiting client calls.

#### Run the Client

Run the following Maven command to invoke the service:

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

The output shows that *hi, dubbo* is the result returned from the service provider.

## Quickly Generate a Dubbo Application

Dubbo also offers a public service to quickly set up a Spring Boot-based Dubbo application. Visit http://start.dubbo.io and follow the instructions in the image to generate an example project:

![dubbo initializr](/imgs/blog/dubbo-initializr.png)

**Explanation**:

1. Provide the Maven groupId in *Group*, default is *com.example*.
2. Provide the Maven artifactId in *Artifact*, default is *demo*.
3. Provide the service name in *DubboServiceName*, default is *com.example.HelloService*.
4. Provide the service version in *DubboServiceVersion*, default is *1.0.0*.
5. Select whether this build will be a service provider (Server) or consumer (Client) in *Client/Server*, default is *server*.
6. Use *embeddedZookeeper* for service registration and discovery, which is checked by default.
7. Choose whether to activate the qos port, unchecked by default; if checked, it can be accessed via port *22222*.
8. Click *Generate Project* to download the generated project.

This example demonstrates a service provider; similarly, select *client* in the generation interface to create the corresponding service consumer.

### Running

Open the generated project in an IDE; the application is a typical Spring Boot application. The program entry point is shown below:

```java
@SpringBootApplication
public class DemoApplication {
	public static void main(String[] args) {
		new EmbeddedZooKeeper(2181, false).start();  // #1
		SpringApplication.run(DemoApplication.class, args); // #2
	}
}
```

**Explanation**:

1. Start an embedded *ZooKeeper* on port *2181*.
2. Start the *Spring Boot* context.

You can run it directly in the IDE, and the output will be as follows:

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

**Explanation**:

1. The printed configuration info starting with *dubbo.* is defined in *main/resources/application.properties*.

### Manage Services via Telnet

If you selected to activate *qos* when generating the project, you can manage services and view their status through *telnet* or *nc*.

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

Currently, *qos* supports the following commands; for more detailed information, please refer to the official documentation [^4]:

* *ls*: List consumer and provider info.
* *online*: Bring service online.
* *offline*: Take service offline.
* *help*: Online help.

## Summary

This article introduced the basic concepts of distributed calls in the Java domain, starting with RMI, specifically interface-based programming and using proxies to disguise remote calls as local, with registration centers facilitating service registration and discovery.

For simplicity, it showed how to develop a complete Dubbo application using multicast registration and a direct API-based approach. A deeper understanding of *ServiceConfig* and *ReferenceConfig* significantly aids in further use of Spring XML configurations or even Spring Boot programming.

Finally, it briefly introduced how to quickly set up a Spring Boot-based Dubbo application using the public service provided by the Dubbo team at start.dubbo.io and perform basic operations via *qos*.

[^1]: [Getting Started Using JavaTM RMI](https://docs.oracle.com/javase/6/docs/technotes/guides/rmi/hello/hello-world.html)
[^2]: [Direct Connection to Provider](/en/docsv2.7/user/examples/explicit-target/)
[^3]: [Multicast Registry](/en/docsv2.7/user/references/registry/multicast/)
[^4]: [Online Operations Commands](/en/docsv2.7/user/references/qos/)

