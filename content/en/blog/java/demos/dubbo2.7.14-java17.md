---
title: "Compile and Run Dubbo 2.7.14 Project Using JDK17"
linkTitle: "Compile and Run Dubbo 2.7.14 Project Using JDK17"
tags: ["Java"]
date: 2018-08-07
description: > 
    This article introduces how to compile and run the Dubbo 2.7.14 project in a JDK17 environment.
---
## Overview
Java 17 is the latest long-term support (LTS) version of Java. However, due to the new features that strongly encapsulate the JDK's internal APIs, the Dubbo project cannot be directly compiled and run with JDK17. By referring to the [OpenJDK documentation](https://openjdk.java.net/jeps/403), we find that we only need to add the corresponding parameters to bypass the constraints of Java 17.  
For a standard Dubbo project, just add at runtime:  
```--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED --add-opens java.base/java.math=ALL-UNNAMED```  
If other dependencies in the project have similar issues, more parameters may need to be added, which will be detailed below.  
This solution only addresses issues caused by the strong encapsulation of the JDK's internal APIs in Java 17. For other compatibility issues, please seek additional solutions.  

## Obtaining Parameters and Examples
Taking the demo from the Dubbo official repository as an example, first, use Java 17 as our development environment by executing:  
```
git clone git@github.com:apache/dubbo.git
git checkout dubbo-2.7.14
cd dubbo-demo/dubbo-demo-annotation
```  
Obtain the demo from the Dubbo official repository code, then you can try compiling Dubbo's demo directly with Java 17.  
Check the Java version:  
```
➜  ~ java -version
openjdk version "17.0.1" 2021-10-19
OpenJDK Runtime Environment Temurin-17.0.1+12 (build 17.0.1+12)
OpenJDK 64-Bit Server VM Temurin-17.0.1+12 (build 17.0.1+12, mixed mode, sharing)
```
Then run:  
```
mvn -U clean package --no-transfer-progress -D maven.test.skip=true
```  
Start Zookeeper `docker run --name some-zookeepep -p 2181:2181 -it --rm zookeeper` as the registry, then try running the provider:  
```
java -jar dubbo-demo-annotation-provider/target/dubbo-demo-annotation-provider-2.7.14.jar
```
You may see an error like:  
```Caused by: java.lang.reflect.InaccessibleObjectException: Unable to make protected final java.lang.Class java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int,java.security.ProtectionDomain) throws java.lang.ClassFormatError accessible: module java.base does not "opens java.lang" to unnamed module @8807e25```  
The key phrase `module `**java.base**` does not "opens `**java.lang**`" to unnamed module @8807e25`. According to the [OpenJDK documentation](https://openjdk.java.net/jeps/403), we only need to add the `--add-opens `**java.base**`/`**java.lang**`=ALL-UNNAMED` parameter to resolve the issue.  
Corresponding errors should be solvable in a similar manner. After testing, the Dubbo project in the demo requires:  
```
--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED --add-opens java.base/java.math=ALL-UNNAMED
```  
With these parameters, it can run.  
Run the provider and consumer in two terminals respectively:  
```
java --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED --add-opens java.base/java.math=ALL-UNNAMED -jar dubbo-demo-annotation-provider/target/dubbo-demo-annotation-provider-2.7.14.jar
```
```
java --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED --add-opens java.base/java.math=ALL-UNNAMED -jar dubbo-demo-annotation-consumer/target/dubbo-demo-annotation-consumer-2.7.14.jar
```
You may notice Zookeeper errors; upgrading the Zookeeper version can likely resolve the issue...  
Add the latest version of the Zookeeper dependency to the first item in the `pom.xml` of both the provider and consumer:  
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
Run the provider and consumer again.  
You will see the consumer successfully outputs a similar result:  
```
result :Hello world, response from provider: *.*.*.*/<unresolved>:20880
```
The provider also logs the corresponding information:  
```
Hello world, request from consumer: /*.*.*.*:43346
```
