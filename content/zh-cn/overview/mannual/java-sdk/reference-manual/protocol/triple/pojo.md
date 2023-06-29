---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/pojo/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/pojo/
description: POJO 方式使用 Triple
linkTitle: POJO 方式使用 Triple
title: POJO 方式使用 Triple
type: docs
weight: 2
---






这篇教程会通过从零构建一个简单的工程来演示如何基于 POJO 方式使用 Dubbo Triple, 在应用不改变已有接口定义的同时升级到 Triple 协议。


### 实现原理

通过上面介绍的升级过程，我们可以很简单的通过修改协议类型来完成升级。框架是怎么帮我们做到这些的呢？

通过对 `Triple` 协议的介绍，我们知道Dubbo3的 `Triple` 的数据类型是 `protobuf` 对象，那为什么非 `protobuf` 的 java 对象也可以被正常传输呢。

这里 Dubbo3 使用了一个巧妙的设计，首先判断参数类型是否为 `protobuf` 对象，如果不是。用一个 `protobuf` 对象将 `request` 和 `response` 进行 wrapper，这样就屏蔽了其他各种序列化带来的复杂度。在 `wrapper` 对象内部声明序列化类型，来支持序列化的扩展。

wrapper 的`protobuf`的 IDL如下:
```proto
syntax = "proto3";

package org.apache.dubbo.triple;

message TripleRequestWrapper {
    // hessian4
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

对于请求，使用`TripleRequestWrapper`进行包装，对于响应使用`TripleResponseWrapper`进行包装。

> 对于请求参数，可以看到 args 被`repeated`修饰，这是因为需要支持 java 方法的多个参数。当然，序列化只能是一种。序列化的实现沿用 Dubbo2 实现的 spi

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
```
{{% alert title="输出结果" color="info" %}}
```shell
Dubbo triple pojo server started
```
{{% /alert %}}

10. 打开新的终端，启动客户端
```
$ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.MyDubboClient"
```
{{% alert title="输出结果" color="info" %}}
```shell
Received reply:message: "Hello,Demo!"
```
{{% /alert %}}
