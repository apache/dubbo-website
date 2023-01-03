---
type: docs
title: "POJO way to use Triple"
linkTitle: "POJO way to use Triple"
weight: 2
---

This tutorial will demonstrate how to use Dubbo Triple based on POJO by building a simple project from scratch, and upgrade to the Triple protocol while the application does not change the existing interface definition.


### Implementation principle

Through the upgrade process described above, we can easily complete the upgrade by modifying the protocol type. How does the framework help us do this?

Through the introduction of the `Triple` protocol, we know that the data type of `Triple` in Dubbo3 is a `protobuf` object, so why non-`protobuf` java objects can also be transmitted normally.

Here Dubbo3 uses an ingenious design, first judge whether the parameter type is a `protobuf` object, if not. Use a `protobuf` object to wrap `request` and `response`, which shields the complexity brought by other serialization. Declare the serialization type inside the `wrapper` object to support serialization extensions.

The IDL of `protobuf` of wrapper is as follows:
```proto
syntax = "proto3";

package org.apache.dubbo.triple;

message TripleRequestWrapper {
    //hessian4
    // json
    string serializeType = 1;
    repeated bytes args = 2;
    repeated string argTypes = 3;
}

message TripleResponseWrapper {
    string serializeType = 1;
    bytes data = 2;
    string type = 3;
}
```

For requests, use `TripleRequestWrapper` for wrapping, and for responses, use `TripleResponseWrapper` for wrapping.

> For request parameters, you can see that args is modified by `repeated`, this is because multiple parameters of the java method need to be supported. Of course, serialization can only be one. The implementation of serialization follows the spi implemented by Dubbo2

### precondition
- [JDK](https://jdk.java.net/) version >= 8
- Installed [Maven](https://maven.apache.org/)
- Installed and started [Zookeeper](https://zookeeper.apache.org/)

### Create project
1. First create an empty maven project
    ```
   $ mvn archetype:generate \
        -DgroupId=org.apache.dubbo\
        -DartifactId=tri-pojo-demo\
        -DarchetypeArtifactId=maven-archetype-quickstart \
        -DarchetypeVersion=1.4 \
        -DarchetypeGroupId=org.apache.maven.archetypes \
        -Dversion=1.0-SNAPSHOT
   ```
2. Switch to the project directory
    ```
   $ cd tri-pojo-demo
   ```
3. Set JDK version in `pom.xml`, add Dubbo dependencies and plugins
    ```xml
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
    </properties>
   
    <dependencies>
       <dependency>
           <groupId>junit</groupId>
           <artifactId>junit</artifactId>
           <version>4.13</version>
           <scope>test</scope>
       </dependency>
       <dependency>
           <groupId>org.apache.dubbo</groupId>
           <artifactId>dubbo</artifactId>
           <version>3.0.8</version>
       </dependency>
       <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-dependencies-zookeeper-curator5</artifactId>
        <type>pom</type>
        <version>3.0.8</version>
       </dependency>
        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.19.4</version>
        </dependency>
    </dependencies>
   ```
4. Add interface definition `src/main/java/org/apache/dubbo/Greeter.java`
    ```java
   package org.apache.dubbo;

   public interface Greeter {
       String sayHello(String name);
   }
   ```
5. Add server-side interface implementation `src/main/java/org/apache/dubbo/GreeterImpl.java`
   ```java
   package org.apache.dubbo;

   public class GreeterImpl implements Greeter {
      @Override
      public String sayHello(String name) {
         return "Hello," + name + "!";
      }
   }
   ```
6. Add server startup class `src/main/java/org/apache/dubbo/MyDubboServer.java`
    ```java
   package org.apache.dubbo;

   import org.apache.dubbo.common.constants.CommonConstants;
   import org.apache.dubbo.config.ApplicationConfig;
   import org.apache.dubbo.config.ProtocolConfig;
   import org.apache.dubbo.config.RegistryConfig;
   import org.apache.dubbo.config.ServiceConfig;
   import org.apache.dubbo.config.bootstrap.DubboBootstrap;

   import java.io.IOException;

   public class MyDubboServer {

       public static void main(String[] args) throws IOException {
           ServiceConfig<Greeter> service = new ServiceConfig<>();
           service.setInterface(Greeter.class);
           service.setRef(new GreeterImpl());

           DubboBootstrap bootstrap = DubboBootstrap. getInstance();
           bootstrap. application(new ApplicationConfig("tri-pojo-server"))
                   .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                   .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
                   .service(service)
                   .start();
           System.out.println("Dubbo triple pojo server started");
           System.in.read();
       }
   }
    ```

7. Add the client startup class `src/main/java/org/apache/dubbo/MyDubboClient.java`
   ```java
   package org.apache.dubbo;

   import org.apache.dubbo.common.constants.CommonConstants;
   import org.apache.dubbo.config.ApplicationConfig;
   import org.apache.dubbo.config.ReferenceConfig;
   import org.apache.dubbo.config.RegistryConfig;
   import org.apache.dubbo.config.bootstrap.DubboBootstrap;

   public class MyDubboClient {
      public static void main(String[] args) {
         DubboBootstrap bootstrap = DubboBootstrap. getInstance();
         ReferenceConfig<Greeter> ref = new ReferenceConfig<>();
         ref. setInterface(Greeter. class);
         ref.setProtocol(CommonConstants.TRIPLE);
         ref. setTimeout(3000);
         bootstrap. application(new ApplicationConfig("tri-pojo-client"))
          .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
          .reference(ref)
          .start();

         Greeter greeter = ref. get();
         String reply = greeter. sayHello("pojo");
         System.out.println("Received reply:" + reply);
       }
   }
   ```
8. Compile the code
   ```
   $ mvn clean install
   ```
9. Start the server
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.MyDubboServer"
   Dubbo triple pojo server started
   ```
10. Open a new terminal and start the client
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.MyDubboClient"
   Received reply: message: "Hello, Demo!"
   ```