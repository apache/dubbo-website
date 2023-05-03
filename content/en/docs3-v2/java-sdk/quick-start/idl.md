---
type: docs
title: "IDL defines cross-language services"
linkTitle: "IDL Defines"
weight: 11
description: "Demo from zero how to define Dubbo service based on IDL and use Triple protocol"
---

Using IDL to define services has better cross-language friendliness. For new users of Dubbo3, we recommend this method.
However, the Triple protocol is not strongly bound to IDL. You can also use Java Interface + Pojo to define services and enable the Triple protocol. For details, see [Example](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/pojo).

For more usage of Triple and IDL, please refer to [official samples](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple)

### precondition
- [JDK](https://jdk.java.net/) version >= 8
- Installed [Maven](https://maven.apache.org/)

### Create project
1. First create an empty maven project
    ```
   $ mvn archetype:generate \
        -DgroupId=org.apache.dubbo \
        -DartifactId=tri-stub-demo \
        -DarchetypeArtifactId=maven-archetype-quickstart \
        -DarchetypeVersion=1.4 \
        -DarchetypeGroupId=org.apache.maven.archetypes \
        -Dversion=1.0-SNAPSHOT
   ```
2. Switch to the project directory
    ```
   $ cd tri-stub-demo
   ```
3. Set JDK version in `pom.xml`, add Dubbo dependencies and plugins
    ```xml
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <dubbo.version>3.1.7</dubbo.version>
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
           <version>${dubbo.version}</version>
       </dependency>
       <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-dependencies-zookeeper-curator5</artifactId>
        <type>pom</type>
        <version>${dubbo.version}</version>
       </dependency>
        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.19.4</version>
        </dependency>
    </dependencies>
   
    <build>
        <extensions>
            <extension>
                <groupId>kr.motd.maven</groupId>
                <artifactId>os-maven-plugin</artifactId>
                <version>1.6.1</version>
            </extension>
        </extensions>
        <plugins>
            <plugin>
                <groupId>org.xolstice.maven.plugins</groupId>
                <artifactId>protobuf-maven-plugin</artifactId>
                <version>0.6.1</version>
                <configuration>
                    <protocArtifact>com.google.protobuf:protoc:3.19.4:exe:${os.detected.classifier}</protocArtifact>
                    <protocPlugins>
                        <protocPlugin>
                            <id>dubbo</id>
                            <groupId>org.apache.dubbo</groupId>
                            <artifactId>dubbo-compiler</artifactId>
                            <version>${dubbo.version}</version>
                            <mainClass>org.apache.dubbo.gen.tri.Dubbo3TripleGenerator</mainClass>
                        </protocPlugin>
                    </protocPlugins>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
   ```
4. Add the interface definition file `src/main/proto/hello.proto`, Dubbo uses [Protobuf](https://developers.google.com/protocol-buffers) as IDL
    ```protobuf
    syntax = "proto3";
   
    option java_multiple_files = true;
    option java_package = "org.apache.dubbo.hello";
    option java_outer_classname = "HelloWorldProto";
    option objc_class_prefix = "HLW";

    package helloworld;

    message HelloRequest {
        string name = 1;
    }

    message HelloReply {
        string message = 1;
    }
    service Greeter{
        rpc greet(HelloRequest) returns (HelloReply);
    }

    ```
5. Compile the IDL
    ```
    $ mvn clean install
    ```
   After the compilation is successful, you can see that the code file is generated in the `target/generated-sources/protobuf/java` directory
    ```
   $ ls org/apache/dubbo/hello/
    DubboGreeterTriple.java HelloReply.java HelloRequest.java HelloWorldProto.java
    Greeter.java HelloReplyOrBuilder.java HelloRequestOrBuilder.java
   ```

6. Add server interface implementation `src/main/java/org/apache/dubbo/GreeterImpl.java`
   ```java
   package org.apache.dubbo;

   import org.apache.dubbo.hello.DubboGreeterTriple;
   import org.apache.dubbo.hello.HelloReply;
   import org.apache.dubbo.hello.HelloRequest;

   public class GreeterImpl extends DubboGreeterTriple. GreeterImplBase {
      @Override
      public HelloReply greet(HelloRequest request) {
         return HelloReply. newBuilder()
         .setMessage("Hello," + request.getName() + "!")
         .build();
      }
   }
   ```
7. Add server startup class `src/main/java/org/apache/dubbo/MyDubboServer.java`
    ```java
   package org.apache.dubbo;

   import org.apache.dubbo.common.constants.CommonConstants;
   import org.apache.dubbo.config.ApplicationConfig;
   import org.apache.dubbo.config.ProtocolConfig;
   import org.apache.dubbo.config.RegistryConfig;
   import org.apache.dubbo.config.ServiceConfig;
   import org.apache.dubbo.config.bootstrap.DubboBootstrap;
   import org.apache.dubbo.hello.Greeter;

   import java.io.IOException;

   public class MyDubboServer {

       public static void main(String[] args) throws IOException {
           ServiceConfig<Greeter> service = new ServiceConfig<>();
           service.setInterface(Greeter.class);
           service.setRef(new GreeterImpl());

           DubboBootstrap bootstrap = DubboBootstrap. getInstance();
           bootstrap. application(new ApplicationConfig("tri-stub-server"))
                   .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                   .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
                   .service(service)
                   .start();
           System.out.println("Dubbo triple stub server started");
           System.in.read();
       }
   }
    ```

8. Add the client startup class `src/main/java/org/apache/dubbo/MyDubboClient.java`
   ```java
   package org.apache.dubbo;

   import org.apache.dubbo.common.constants.CommonConstants;
   import org.apache.dubbo.config.ApplicationConfig;
   import org.apache.dubbo.config.ReferenceConfig;
   import org.apache.dubbo.config.RegistryConfig;
   import org.apache.dubbo.config.bootstrap.DubboBootstrap;
   import org.apache.dubbo.hello.Greeter;
   import org.apache.dubbo.hello.HelloReply;
   import org.apache.dubbo.hello.HelloRequest;

   public class MyDubboClient {
      public static void main(String[] args) {
         DubboBootstrap bootstrap = DubboBootstrap. getInstance();
         ReferenceConfig<Greeter> ref = new ReferenceConfig<>();
         ref. setInterface(Greeter. class);
         ref.setProtocol(CommonConstants.TRIPLE);
         ref.setProxy(CommonConstants.NATIVE_STUB);
         ref. setTimeout(3000);
         bootstrap. application(new ApplicationConfig("tri-stub-client"))
            .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
            .reference(ref)
            .start();

         Greeter greeter = ref. get();
         HelloRequest request = HelloRequest.newBuilder().setName("Demo").build();
         HelloReply reply = greeter. greet(request);
         System.out.println("Received reply:" + reply);
       }
   }
   ```
9. Compile the code
   ```
   $ mvn clean install
   ```
10. Start the server
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.MyDubboServer"
   Dubbo triple stub server started
   ```
11. Open a new terminal and start the client
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.MyDubboClient"
   Received reply: message: "Hello, Demo!"
   ```
