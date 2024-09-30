---
title: "Towards Native: Spring & Dubbo AOT Technical Examples and Principles Explanation"
linkTitle: "Towards Native: Dubbo AOT Official Release"
date: 2023-06-28
tags: ["Java", "Native Image", "GraalVM"]
authors: ["Liu Jun", "Hua Zhongming"]
description: >
  This article explains the basic working principles of GraalVM, the way to build Native Images, how to build and package static Dubbo applications using Dubbo AOT, and how to solve issues such as slow “cold start,” high memory usage, and long warm-up times.
---

Java applications face issues such as slow “cold start”, high memory usage, and long warm-up times in the cloud computing era, making it difficult to adapt to cloud deployment models like Serverless. GraalVM addresses these issues significantly through static compilation and packaging techniques, and mainstream frameworks such as Spring and Dubbo provide corresponding AOT solutions to some of the limitations of GraalVM.

In this article, we will analyze the challenges faced by Java applications in the cloud era, how GraalVM Native Image addresses these issues, the basic concepts and working principles of GraalVM, and finally demonstrate how to statically package a typical microservice application with an example using Spring6 and Dubbo3.

The article is divided into four main parts:

1. We first look at the characteristics that cloud applications should possess in the fast-developing cloud computing era and the challenges Java applications face in the cloud.
2. Next, I will introduce GraalVM, what Native Image is, and how to generate a Native Image executable binary program from a Java application using GraalVM.
3. In the third part, we understand that GraalVM has certain limitations, such as not supporting Java's reflection and dynamic features. Thus, we need to provide special metadata configuration to work around these limitations. We will explain how to incorporate AOT Processing to achieve automated metadata configuration, including AOT processing in the Spring6 framework and AOT processing in the Dubbo3 framework.
4. Finally, we will demonstrate how to statically package a Java application with a Spring6 + Dubbo3 example.

## Challenges Faced by Java Applications in the Cloud Era

First, let's look at the characteristics of applications in the cloud computing era and the challenges Java faces in the cloud. According to data from various statistical agencies, Java remains one of the most popular programming languages among developers today, second only to some scripting languages. The use of Java allows for highly efficient business application development, with its rich ecosystem enabling very high development and operational efficiency, resulting in countless applications developed based on Java.

![image.png](/imgs/blog/2023/6/graalvm/language-rank.png)

However, with the advent of cloud computing, the deployment and operation of Java applications are facing numerous issues. Taking Serverless as an example, Serverless is an increasingly mainstream deployment model in the cloud that allows developers to focus more on business logic and helps solve resource issues through rapid elasticity. Recent data shows that the proportion of Java in all cloud computing providers' Serverless runtimes is relatively low, far from matching its proportion in traditional application development.

![image.png](/imgs/blog/2023/6/graalvm/serverless-lang-rank.png)

The emergence of such causes is mainly because Java applications cannot adequately meet several key requirements of Serverless scenarios.

- **First, the startup speed issue; Java's cold start time is relatively long.** This poses a significant challenge for Serverless, which requires quick bursts, as the launch time for Java applications can range from seconds to several tens of seconds.
- **Secondly, Java applications often require a certain amount of warm-up time to achieve optimal performance.** Newly launched applications allocating large traffic is inappropriate and can lead to timeout and high resource usage issues, further elongating the effective launch time of Java applications.
- **Thirdly, Java applications require substantial memory and computing resources for their execution**, but much of this is consumed by the JVM runtime, leaving little for the actual business, which does not align with the goals of cost reduction and efficiency improvements in the cloud.
- **Finally, the packages or images produced by Java applications are also quite large**, impacting storage and retrieval efficiency.

Next, we will specifically look at how a runtime technology like GraalVM addressing these issues faced by Java applications.

## Overview of GraalVM

> GraalVM compiles your Java applications ahead of time into standalone binaries that start instantly, provide peak performance with no warmup, and use fewer resources.

According to the official introduction, GraalVM provides AOT compilation and binary packaging capabilities for Java applications. Binaries produced from GraalVM can achieve rapid startup, ultra-high performance, no warm-up time, and minimal resource consumption. AOT, mentioned here, is a technology that occurs during the compilation phase, referred to as Ahead-of-Time. In summary, GraalVM can be viewed in two parts:

- First, **GraalVM is a complete JDK distribution**, which is equivalent to OpenJDK and can run any application developed in JVM-based languages.
- Secondly, **GraalVM offers Native Image packaging technology**, which can package applications into independently executable binaries that are self-contained and can run without the JVM.

![image.png](/imgs/blog/2023/6/graalvm/graalvm-compilation.png)

As shown in the figure, the GraalVM compiler provides both JIT and AOT modes.

- In terms of JIT, we know that Java classes are compiled into .class format files, which are bytecode recognizable by the JVM. While the Java application is running, the JIT compiler compiles some bytecode from hot paths into machine code for faster execution.
- Regarding AOT mode, it directly converts bytecode into machine code during the compilation phase, thus avoiding the runtime dependency on the JVM. By eliminating the JVM loading and bytecode warm-up time, AOT compiled and packaged programs achieve very high runtime efficiency.

![image.png](/imgs/blog/2023/6/graalvm/graalvm-compilation2.png)

In summary, JIT allows applications to possess higher peak processing capabilities and can reduce the maximum latency of requests; while AOT can further enhance an application's cold start speed, achieve smaller binary package sizes, and demand fewer memory resources at runtime.

## What is Native Image?

We have frequently mentioned the concept of Native Image in GraalVM. Native Image is a technology that compiles and packages Java code into executable binary programs. The package contains only the code necessary for runtime, including the application's own code, standard dependency packages, language runtime, and statically referenced JDK libraries. This package no longer requires a JVM environment for execution; however, it is bound to specific machine environments and needs separate packaging for different machine environments. Native Image has a series of characteristics listed here:

- Contains only a portion of the resources required by the JVM, leading to lower operational costs
- Millisecond-level startup time
- Enters the optimal state immediately after startup, without warm-up
- Can be packaged into lighter binaries, allowing for faster and more efficient deployment
- Higher level of security

![image.png](/imgs/blog/2023/6/graalvm/graalvm-advantages.png)

In summary, the key features include faster startup speed, lower resource usage, reduced risk of security vulnerabilities, and more compact binary size. This resolves the significant issues faced by Java applications in Serverless and other cloud computing scenarios.

## Basic Principles and Usage of GraalVM Native Image

Next, let's look at the basic usage of GraalVM. First, you need to install the relevant dependencies required for native-image, which will vary based on the operating system. Afterward, you can use the GraalVM JDK downloader to download native-image. Once everything is installed, you can use the native-image command to compile and package your Java application. The input can be class files, jar files, Java modules, etc., and ultimately package them into a standalone executable file, such as HelloWorld. Additionally, GraalVM provides corresponding Maven and Gradle build tool plugins to simplify the packaging process.

![image.png](/imgs/blog/2023/6/graalvm/graalvm-principal.png)

GraalVM is based on the concept of a "closed world assumption," meaning all runtime resources and behaviors of the program must be fully determined during compilation. The diagram details the AOT compilation and packaging process, where application code, repositories, and JDK are all input. GraalVM uses main as the entry point, scans all reachable code and execution paths, and may involve some pre-initialization actions during processing. The final AOT-compiled machine code and related initialization resources are packaged into an executable Native package.

Compared to traditional JVM deployment models, the GraalVM Native Image model brings significant differences.

- GraalVM performs static analysis of the application code during the compilation phase, using the main function as the entry point.
- Code that cannot be reached during static analysis will be removed and not included in the final binary package.
- GraalVM cannot recognize certain dynamic behaviors such as reflection, resource loading, serialization, and dynamic proxies, hence these dynamic behaviors will be restricted.
- The classpath is fixed during construction and cannot be modified.
- Delayed class loading is no longer supported; all available classes and code are determined during the program startup stage.
- Additionally, there are other Java application capabilities that are limited (such as early class initialization, etc.).

GraalVM does not support dynamic features like reflection, while many of our applications and frameworks heavily rely on reflection and dynamic proxies. How can we package such applications into Native Image for staticization? GraalVM provides an entry for metadata configuration, allowing for the provision of configuration files for all dynamic features, which maintains the "closed world assumption" mode and allows GraalVM to know all expected behaviors during the compilation phase. Here are two examples:

1. In terms of encoding, for reflection, the encoding method can allow GraalVM to analyze the code and calculate Metadata.

![image.png](/imgs/blog/2023/6/graalvm/metadata-1.png)

![image.png](/imgs/blog/2023/6/graalvm/metadata-2.png)

2. Another example is providing additional JSON configuration files placed in the designated directory META-INF/native-image/<group.id>/<artifact.id>.

![image.png](/imgs/blog/2023/6/graalvm/metadata-3.png)

## AOT Processing

The use of reflection and other dynamic features in Java applications or frameworks poses obstacles to the use of GraalVM. Many frameworks have this limitation, and requiring applications or developers to provide metadata configurations would be a significant challenge. Therefore, frameworks like Spring and Dubbo have introduced AOT Processing before AOT Compilation, which is used to automatically collect metadata and provide it to the AOT compiler.

![image.png](/imgs/blog/2023/6/graalvm/aot.png)

The AOT compilation mechanism is universal for all Java applications, but the process of collecting Metadata via AOT Processing varies for each framework because each framework has its unique usage of reflection, dynamic proxies, and more. Taking a typical Spring + Dubbo microservice application as an example, implementing static packaging for this application involves the metadata processing process for Spring, Dubbo, and various third-party dependencies.

- Spring - Spring AOT processing
- Dubbo - Dubbo AOT processing
- Third-party libraries - Reachability Metadata

For Spring, Spring6 introduces the Spring AOT mechanism for supporting static pre-processing of Spring applications. Dubbo has also released the Dubbo AOT mechanism in version 3.2, allowing Dubbo-related components to automate Native pre-processing. In addition to these two frameworks closely related to business development, an application typically contains numerous third-party dependencies. The metadata of these dependencies is also crucial for staticization. If there are reflections, class loading, etc., configuration will need to be provided for them. Currently, there are two channels for these third-party applications: One is the shared space provided by GraalVM, where a significant portion of dependency metadata configurations are available (https://github.com/oracle/graalvm-reachability-metadata), and the other way is to require the official release of components to include metadata configuration. In both cases, GraalVM can automatically read metadata.

### Spring AOT

Next, let's examine what preprocessing Spring AOT does before compilation. The Spring framework has many dynamic features, such as auto-configuration and conditional Beans. Spring AOT conducts pre-processing during the build phase, generating a series of metadata inputs available for GraalVM. The generated content includes:

- Pre-generated code related to Spring Bean definitions, as displayed in the code snippet below.
- Generating dynamic proxy-related code during the build phase
- JSON metadata files regarding the use of reflection, etc.

![image.png](/imgs/blog/2023/6/graalvm/spring-aot.png)

### Dubbo AOT

Dubbo AOT does things very similar to Spring AOT, but it is specifically aimed at the unique usage patterns of the Dubbo framework for pre-processing, which includes:

- Source code generation related to SPI extensions
- JSON configuration file generation for some reflection usage
- RPC proxy class code generation

![image.png](/imgs/blog/2023/6/graalvm/dubbo-aot-1.png)

![image.png](/imgs/blog/2023/6/graalvm/dubbo-aot-2.png)

## Spring6 + Dubbo3 Demo

Next, we will demonstrate how to use Spring AOT, Dubbo AOT, etc., to implement Native Image packaging for an example microservice application using Spring6 + Dubbo3.

The complete code example can be downloaded here: [dubbo-samples-native-image](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-native-image-registry)

### Step 1: Install GraalVM

1. Select the corresponding GraalVM version on the GraalVM official website based on your system: [https://www.graalvm.org/downloads/](https://www.graalvm.org/downloads/)
2. Install native-image according to the official documentation: [Getting Started with Native Image](https://www.graalvm.org/latest/reference-manual/native-image/#install-native-image)

### Step 2: Create the Project

This example application is a typical microservice application. We use SpringBoot3 for application configuration development and Dubbo3 to define and publish RPC services. The build tool used for this application is Maven.

![image.png](/imgs/blog/2023/6/graalvm/demo-1.png)

![image.png](/imgs/blog/2023/6/graalvm/demo-2.png)

### Step 3: Configure Maven Plugins

The key is to add configurations for the three plugins: spring-boot-maven-plugin, native-maven-plugin, and dubbo-maven-plugin to enable the AOT processing, modifying the mainClass in dubbo-maven-plugin to the full path of the desired startup class. (Note that the API usage does not require adding the spring-boot-maven-plugin dependency.)

```xml
    <profiles>
        <profile>
            <id>native</id>
            <build>
                <plugins>
                    <plugin>
                        <artifactId>maven-compiler-plugin</artifactId>
                        <configuration>
                            <release>17</release>
                            <fork>true</fork>
                            <verbose>true</verbose>
                        </configuration>
                    </plugin>
                    <plugin>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-maven-plugin</artifactId>
                        <executions>
                            <execution>
                                <id>process-aot</id>
                                <goals>
                                    <goal>process-aot</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <plugin>
                        <groupId>org.graalvm.buildtools</groupId>
                        <artifactId>native-maven-plugin</artifactId>
                        <version>0.9.20</version>
                        <configuration>
                            <classesDirectory>${project.build.outputDirectory}</classesDirectory>
                            <metadataRepository>
                                <enabled>true</enabled>
                            </metadataRepository>
                            <requiredVersion>22.3</requiredVersion>
                        </configuration>
                        <executions>
                            <execution>
                                <id>add-reachability-metadata</id>
                                <goals>
                                    <goal>add-reachability-metadata</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <plugin>
                        <groupId>org.apache.dubbo</groupId>
                        <artifactId>dubbo-maven-plugin</artifactId>
                        <version>${dubbo.version}</version>
                        <configuration>
                            <mainClass>com.example.nativedemo.NativeDemoApplication</mainClass>
                        </configuration>
                        <executions>
                            <execution>
                                <phase>process-sources</phase>
                                <goals>
                                    <goal>dubbo-process-aot</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </build>
        </profile>
    </profiles>
```

### Step 4: Add Native Dependencies in the Pom

Furthermore, for Dubbo, since some Native mechanisms currently depend on JDK17 and other versions, Dubbo has not included certain packages in the distribution by default. Therefore, it is necessary to add two additional dependencies: dubbo-spring6 compatibility and dubbo-native components.
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-config-spring6</artifactId>
    <version>${dubbo.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-native</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

### Step 5: Adjust Compiler, Proxy, Serialization, and Logger

Meanwhile, this example's support for third-party components is currently limited, primarily on third-party components' Reachability Metadata. For instance, currently supported networking or encoding components include Netty and Fastjson2; among logging components, Logback is also supported; microservice components include Nacos, Zookeeper, etc.

- The serialization method supported well is Fastjson2.
- Compiler and proxy can currently only choose JDK.
- The logger needs to be configured for slf4j, currently only supporting Logback.

Example configuration is as follows:
```yaml
dubbo:
  application:
    name: ${spring.application.name}
    logger: slf4j
  protocol:
    name: dubbo
    port: -1
    serialization: fastjson2
  registry:
    id: zk-registry
    address: zookeeper://127.0.0.1:2181
  config-center:
    address: zookeeper://127.0.0.1:2181
  metadata-report:
    address: zookeeper://127.0.0.1:2181
  provider:
    serialization: fastjson2
  consumer:
    serialization: fastjson2
```

### Step 6: Compile

Run the following compile command at the project's root path:

- For API way directly execute

```
 mvn clean install -P native -Dmaven.test.skip=true
```

- For annotation and XML way (Springboot3 integrated way)

```shell
 mvn clean install -P native native:compile -Dmaven.test.skip=true
```

### Step 7: Execute the Binary File

The binary file is in the target/ directory and is typically named after the project, such as target/native-demo.

## Summary

GraalVM technology has brought new changes to Java applications in the cloud computing era, helping solve the slow startup and resource usage issues of Java applications. At the same time, we also see that there are some restrictions in using GraalVM, which is why Spring6, SpringBoot3, and Dubbo3 have provided corresponding Native solutions. The Apache Dubbo community will continue to promote comprehensive Native staticization in surrounding ecosystem components. 

