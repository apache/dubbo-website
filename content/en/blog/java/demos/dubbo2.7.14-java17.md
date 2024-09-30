---
title: "使用jdk17编译运行dubbo 2.7.14项目"
linkTitle: "使用jdk17编译运行dubbo 2.7.14项目"
tags: ["Java"]
date: 2018-08-07
description: > 
    本文介绍了如何在jdk17环境下编译运行dubbo 2.7.14项目。
---
## 概述
java 17是java目前最新的长期支持(LTS)版本，但是由于其强封装 JDK 的内部 API的新特性，导致dubbo项目无法直接使用jdk17编译运行。通过参考[openjdk的说明](https://openjdk.java.net/jeps/403)，可以发现只需要添加相应参数即可绕开java 17的限制  
对于普通的dubbo项目，只需要在运行时添加  
```--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED --add-opens java.base/java.math=ALL-UNNAMED```  
如上参数即可。如果项目的其它依赖也有类似问题则可能需要加入更多参数，参数的获得方式和详细示例将在下面给出  
本解决方案只能解决由于java 17强封装 JDK 的内部 API的特性造成的问题，其他的兼容性问题请寻找其它方案
## 参数的获得方法和示例
我们以dubbo官方仓库中的demo为例
首先使用java 17作为我们的开发环境，通过  
```
git clone git@github.com:apache/dubbo.git
git checkout dubbo-2.7.14
cd dubbo-demo/dubbo-demo-annotation
```  
获得dubbo官方仓库的代码中的demo，然后可以尝试直接使用java 17编译dubbo的demo  
确认java版本  
```
➜  ~ java -version
openjdk version "17.0.1" 2021-10-19
OpenJDK Runtime Environment Temurin-17.0.1+12 (build 17.0.1+12)
OpenJDK 64-Bit Server VM Temurin-17.0.1+12 (build 17.0.1+12, mixed mode, sharing)
```
然后运行
```
mvn -U  clean package --no-transfer-progress -D maven.test.skip=true
```  
启动zookeeper `docker run --name some-zookeepep -p 2181:2181 -it --rm zookeeper` 作为注册中心 
尝试运行provider
```
java -jar dubbo-demo-annotation-provider/target/dubbo-demo-annotation-provider-2.7.14.jar
```
可以看到类似的报错:  
```Caused by: java.lang.reflect.InaccessibleObjectException: Unable to make protected final java.lang.Class java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int,java.security.ProtectionDomain) throws java.lang.ClassFormatError accessible: module java.base does not "opens java.lang" to unnamed module @8807e25```  
关键词 `module `**java.base**` does not "opens `**java.lang**`" to unnamed module @8807e25`，根据[openjdk的说明](https://openjdk.java.net/jeps/403)，我们只需要添加`--add-opens `**java.base**`/`**java.lang**`=ALL-UNNAMED`参数即可解决问题  
对应的报错应该都可以用类似得方法去解决，经过测试，demo中的dubbo项目需要  
```
--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED --add-opens java.base/java.math=ALL-UNNAMED
```  
如上参数即可运行  
在两个终端中分别运行provider和consumer:  
```
java --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED --add-opens java.base/java.math=ALL-UNNAMED -jar dubbo-demo-annotation-provider/target/dubbo-demo-annotation-provider-2.7.14.jar
```
```
java --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED --add-opens java.base/java.math=ALL-UNNAMED -jar dubbo-demo-annotation-consumer/target/dubbo-demo-annotation-consumer-2.7.14.jar
```
可以发现报出了zookeeper的错误，不难想到，升级依赖的zookeeper的版本大概率可以解决问题...  
在provider和consumer的 `pom.xml` 的依赖第一项添加最新版本的zookeeper依赖:  
```
        <dependency>
            <groupId>org.apache.zookeeper</groupId>
            <artifactId>zookeeper</artifactId>
            <version>3.7.0</version>
            <exclusions>
                <exclusion>
                    <groupId>io.netty</groupId>
                    <artifactId>netty</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
```
再次运行provider和consumer  
可以看到consumer端成功输出了类似的结果
```
result :Hello world, response from provider: *.*.*.*/<unresolved>:20880
```
provider端也有对应的日志  
```
Hello world, request from consumer: /*.*.*.*:43346
```