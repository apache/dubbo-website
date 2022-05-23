
---
type: docs
title: "快速入门"
linkTitle: "快速入门"
weight: 2
---

这篇教程会通过一个简单的示例工程来演示如何使用 Dubbo Java

## 前置条件
- [JDK](https://jdk.java.net/) 版本 >= 8
- 已安装 [Maven](https://maven.apache.org/)
- 已安装并启动 [Zookeeper](https://zookeeper.apache.org/)

## 获取示例工程的代码
示例工程是 [Dubbo-Samples](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src) 的一部分。
1. [下载源码 zip 包](https://github.com/apache/dubbo-samples/archive/refs/heads/master.zip)或 clone 示例工程
    ```
   $ git clone --depth 1 https://github.com/apache/dubbo-samples.git
   ```
2. 切换到示例工程
   ```
   $ cd dubbo-samples-triple
   ```
   
## 运行示例工程
在 `dubbo-samples-triple` 目录下，
1. 编译工程
    ```
   $ mvn clean install -Dmaven.test.skip=true
   ```
2. 启动 Server
   ```
   $  mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.sample.tri.stub.TriStubServer"
   Dubbo triple stub server started, port=50052
   ```
3. 在另一个终端启动 Client
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.sample.tri.stub.TriStubClient"
   INFO stub.TriStubClient: tri-stub Start unary
   INFO stub.TriStubClient: tri-stub Unary reply <-message: "hello,name"
   ```
恭喜，一个简单的客户端-服务端 Dubbo 应用运行成功了