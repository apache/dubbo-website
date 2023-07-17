---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/triple/wrap/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/triple/wrap/
description: ""
linkTitle: Pojo 序列化兼容模式
title: Pojo 序列化兼容模式
type: docs
weight: 2
---






这篇教程会通过从零构建一个简单的工程来演示如何基于 POJO 方式使用 Dubbo Triple, 在应用不改变已有接口定义的同时升级到 Triple 协议。**此模式下 Triple 使用方式与 Dubbo 协议一样。**

具体用例可以参考：[dubbo-samples-triple/pojo](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/pojo);

### 前置条件
- [JDK](https://jdk.java.net/) 版本 >= 8
- 已安装 [Maven](https://maven.apache.org/)
- 已安装并启动 [Zookeeper](https://zookeeper.apache.org/)

### 创建工程
1. 首先创建一个空的 maven 工程
    ```
   $ mvn archetype:generate                                \
        -DgroupId=org.apache.dubbo                          \
        -DartifactId=tri-pojo-demo                          \
        -DarchetypeArtifactId=maven-archetype-quickstart    \
        -DarchetypeVersion=1.4                              \
        -DarchetypeGroupId=org.apache.maven.archetypes      \
        -Dversion=1.0-SNAPSHOT
   ```
2. 切换到工程目录
    ```
   $ cd tri-pojo-demo
   ```
3. 在 `pom.xml` 中设置 JDK 版本，添加 Dubbo 依赖和插件
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
4. 添加接口定义`src/main/java/org/apache/dubbo/Greeter.java`
    ```java
   package org.apache.dubbo;

   public interface Greeter {
       String sayHello(String name);
   }
   ```
5. 添加服务端接口实现`src/main/java/org/apache/dubbo/GreeterImpl.java`
   ```java
   package org.apache.dubbo;

   public class GreeterImpl implements Greeter {
      @Override
      public String sayHello(String name) {
         return "Hello," + name + "!";
      }
   }
   ```
6. 添加服务端启动类 `src/main/java/org/apache/dubbo/MyDubboServer.java`
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

           DubboBootstrap bootstrap = DubboBootstrap.getInstance();
           bootstrap.application(new ApplicationConfig("tri-pojo-server"))
                   .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                   .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
                   .service(service)
                   .start();
           System.out.println("Dubbo triple pojo server started");
           System.in.read();
       }
   }
    ```

7. 添加客户端启动类`src/main/java/org/apache/dubbo/MyDubboClient.java`
   ```java
   package org.apache.dubbo;

   import org.apache.dubbo.common.constants.CommonConstants;
   import org.apache.dubbo.config.ApplicationConfig;
   import org.apache.dubbo.config.ReferenceConfig;
   import org.apache.dubbo.config.RegistryConfig;
   import org.apache.dubbo.config.bootstrap.DubboBootstrap;

   public class MyDubboClient {
      public static void main(String[] args) {
         DubboBootstrap bootstrap = DubboBootstrap.getInstance();
         ReferenceConfig<Greeter> ref = new ReferenceConfig<>();
         ref.setInterface(Greeter.class);
         ref.setProtocol(CommonConstants.TRIPLE);
         ref.setTimeout(3000);
         bootstrap.application(new ApplicationConfig("tri-pojo-client"))
          .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
          .reference(ref)
          .start();

         Greeter greeter = ref.get();
         String reply = greeter.sayHello("pojo");
         System.out.println("Received reply:" + reply);
       }
   }
   ```
8. 编译代码
   ```
   $ mvn clean install
   ```
9. 启动服务端
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.MyDubboServer"
   Dubbo triple pojo server started
   ```
10. 打开新的终端，启动客户端
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.MyDubboClient"
   Received reply:message: "Hello,Demo!"
   ```
### 常见问题

1. protobuf 类找不到

由于 Triple 协议底层需要依赖 protobuf 协议进行传输，即使定义的服务接口不使用 protobuf 也需要在环境中引入 protobuf 的依赖。

```xml
        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.19.4</version>
        </dependency>
```