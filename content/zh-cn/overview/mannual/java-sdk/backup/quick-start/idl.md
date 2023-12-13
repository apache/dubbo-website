---
aliases:
    - /zh/docs3-v2/java-sdk/quick-start/idl/
    - /zh-cn/docs3-v2/java-sdk/quick-start/idl/
description: 从零演示如何基于 IDL 方式来定义 Dubbo 服务并使用 Triple 协议
linkTitle: IDL 定义跨语言服务
title: 5 - IDL 定义跨语言服务
type: docs
weight: 11
---






使用 IDL 定义服务具有更好的跨语言友好性，对于 Dubbo3 新用户而言，我们推荐使用这种方式。
然而 Triple 协议并不是和 IDL 强绑定的，也可以使用 Java Interface + Pojo 的方式定义服务并启用 Triple 协议，具体可参见[示例](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/pojo)。

更多 Triple 和 IDL 使用方式，请参考[官方示例](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple)

### 前置条件
- [JDK](https://jdk.java.net/) 版本 >= 8
- 已安装 [Maven](https://maven.apache.org/)

### 创建工程
1. 首先创建一个空的 maven 工程
    ```
   $ mvn archetype:generate                                \
        -DgroupId=org.apache.dubbo                          \
        -DartifactId=tri-stub-demo                          \
        -DarchetypeArtifactId=maven-archetype-quickstart    \
        -DarchetypeVersion=1.4                              \
        -DarchetypeGroupId=org.apache.maven.archetypes      \
        -Dversion=1.0-SNAPSHOT
   ```
2. 切换到工程目录
    ```
   $ cd tri-stub-demo
   ```
3. 在 `pom.xml` 中设置 JDK 版本，添加 Dubbo 依赖和插件
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
4. 添加接口定义文件`src/main/proto/hello.proto`，Dubbo 使用 [Protobuf](https://developers.google.com/protocol-buffers) 作为 IDL
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
5. 编译 IDL
    ```
    $ mvn clean install
    ```
   编译成功后，可以看到`target/generated-sources/protobuf/java` 目录下生成了代码文件
    ```
   $ ls org/apache/dubbo/hello/
    DubboGreeterTriple.java    HelloReply.java            HelloRequest.java          HelloWorldProto.java
    Greeter.java               HelloReplyOrBuilder.java   HelloRequestOrBuilder.java
   ```

6. 添加服务端接口实现`src/main/java/org/apache/dubbo/GreeterImpl.java`
   ```java
   package org.apache.dubbo;

   import org.apache.dubbo.hello.DubboGreeterTriple;
   import org.apache.dubbo.hello.HelloReply;
   import org.apache.dubbo.hello.HelloRequest;

   public class GreeterImpl extends DubboGreeterTriple.GreeterImplBase {
      @Override
      public HelloReply greet(HelloRequest request) {
         return HelloReply.newBuilder()
         .setMessage("Hello," + request.getName() + "!")
         .build();
      }
   }
   ```
7. 添加服务端启动类 `src/main/java/org/apache/dubbo/MyDubboServer.java`
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

           DubboBootstrap bootstrap = DubboBootstrap.getInstance();
           bootstrap.application(new ApplicationConfig("tri-stub-server"))
                   .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                   .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
                   .service(service)
                   .start();
           System.out.println("Dubbo triple stub server started");
           System.in.read();
       }
   }
    ```

8. 添加客户端启动类`src/main/java/org/apache/dubbo/MyDubboClient.java`
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
         DubboBootstrap bootstrap = DubboBootstrap.getInstance();
         ReferenceConfig<Greeter> ref = new ReferenceConfig<>();
         ref.setInterface(Greeter.class);
         ref.setProtocol(CommonConstants.TRIPLE);
         ref.setProxy(CommonConstants.NATIVE_STUB);
         ref.setTimeout(3000);
         bootstrap.application(new ApplicationConfig("tri-stub-client"))
            .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
            .reference(ref)
            .start();

         Greeter greeter = ref.get();
         HelloRequest request = HelloRequest.newBuilder().setName("Demo").build();
         HelloReply reply = greeter.greet(request);
         System.out.println("Received reply:" + reply);
       }
   }
   ```
9. 编译代码
   ```
   $ mvn clean install
   ```
10. 启动服务端
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.MyDubboServer"
   Dubbo triple stub server started
   ```
11. 打开新的终端，启动客户端
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.MyDubboClient"
   Received reply:message: "Hello,Demo!"
   ```
