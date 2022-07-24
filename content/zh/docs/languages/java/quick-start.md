---
type: docs
title: "Java 快速开始"
linkTitle: "Java 快速开始"
weight: 10
description: ""
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/quick-start/)。
{{% /pageinfo %}}

## 下载示例代码
示例代码在 [dubbo-samples](https://github.com/apache/dubbo-samples) 中
1. 下载源码
```shell script
$ git clone -b master https://github.com/apache/dubbo-samples.git
```
2. 进入示例目录
```shell script
$ cd dubbo-samples/dubbo-samples-protobuf
```

## 快速运行示例
在 dubbo-samples-protobuf 目录

1. 编译并打包示例项目
```shell script
$ mvn clean package
```

2. 运行 Provider
```shell script
$ java -jar ./protobuf-provider/target/protobuf-provider-1.0-SNAPSHOT.jar 
```

3. 运行 consumer
```shell script
$ java -jar ./protobuf-consumer/target/protobuf-consumer-1.0-SNAPSHOT.jar 

输出以下结果
result: Hello Hello, response from provider: 30.225.20.43:20880
```


以上就是一个简单的 Dubbo 服务定义、服务调用流程

## 详细讲解
1. 服务定义
```text
syntax = "proto3";

option java_multiple_files = true;
option java_package = "org.apache.dubbo.demo";
option java_outer_classname = "DemoServiceProto";
option objc_class_prefix = "DEMOSRV";

package demoservice;

// The demo service definition.
service DemoService {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}

```

2. Protobuf Compiler 插件配置
```xml
<plugin>
    <groupId>org.xolstice.maven.plugins</groupId>
    <artifactId>protobuf-maven-plugin</artifactId>
    <version>0.5.1</version>
    <configuration>
        <protocArtifact>com.google.protobuf:protoc:3.7.1:exe:${os.detected.classifier}</protocArtifact>
        <outputDirectory>build/generated/source/proto/main/java</outputDirectory>
        <clearOutputDirectory>false</clearOutputDirectory>
        <protocPlugins>
            <protocPlugin>
                <id>dubbo</id>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-compiler</artifactId>
                <version>${dubbo.compiler.version}</version>
                <mainClass>org.apache.dubbo.gen.dubbo.Dubbo3Generator</mainClass>
            </protocPlugin>
        </protocPlugins>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>compile</goal>
                <goal>test-compile</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

3. 编译与stub
运行 mvn clean compile 后

生成代码路径
`dubbo-samples-protobuf/protobuf-provider/build/generated/source/proto/main/java/org/apache/dubbo/demo`

生成文件列表
```text
.
├── DemoService.java
├── DemoServiceDubbo.java
├── DemoServiceProto.java
├── HelloReply.java
├── HelloReplyOrBuilder.java
├── HelloRequest.java
└── HelloRequestOrBuilder.java
```

DemoService.java 定义如下
```java
@javax.annotation.Generated(
value = "by Dubbo generator",
comments = "Source: DemoService.proto")
public interface DemoService {
    static final String JAVA_SERVICE_NAME = "org.apache.dubbo.demo.DemoService";
    static final String SERVICE_NAME = "demoservice.DemoService";

    static final boolean inited = DemoServiceDubbo.init();

    org.apache.dubbo.demo.HelloReply sayHello(org.apache.dubbo.demo.HelloRequest request);

    CompletableFuture<org.apache.dubbo.demo.HelloReply> sayHelloAsync(org.apache.dubbo.demo.HelloRequest request);
}
```

4. 发布服务
```java
public class DemoServiceImpl implements DemoService {
    private static final Logger logger = LoggerFactory.getLogger(DemoServiceImpl.class);

    @Override
    public HelloReply sayHello(HelloRequest request) {
        logger.info("Hello " + request.getName() + ", request from consumer: " + RpcContext.getContext().getRemoteAddress());
        return HelloReply.newBuilder()
                .setMessage("Hello " + request.getName() + ", response from provider: "
                        + RpcContext.getContext().getLocalAddress())
                .build();
    }

    @Override
    public CompletableFuture<HelloReply> sayHelloAsync(HelloRequest request) {
        return CompletableFuture.completedFuture(sayHello(request));
    }
}
```

```xml
<bean id="demoServiceImpl" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>

<dubbo:service serialization="protobuf" interface="org.apache.dubbo.demo.DemoService"
               ref="demoServiceImpl"/>
```

5. 使用服务

```xml
<dubbo:reference scope="remote" id="demoService" check="false" interface="org.apache.dubbo.demo.DemoService"/>
```

```java
public class ConsumerApplication {
    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/dubbo-consumer.xml");
        context.start();
        DemoService demoService = context.getBean("demoService", DemoService.class);
        HelloRequest request = HelloRequest.newBuilder().setName("Hello").build();
        HelloReply reply = demoService.sayHello(request);
        System.out.println("result: " + reply.getMessage());
        System.in.read();
    }
}
```

## 其他
示例运行过程中还用到了服务发现等机制，详情请参见相关章节说明