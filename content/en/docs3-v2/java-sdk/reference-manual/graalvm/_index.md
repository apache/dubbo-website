---
type: docs
title: "Dubbo Integration Graalvm Reference Manual"
linkTitle: "Dubbo Integration Graalvm Reference Manual"
toc_hide: true
hide_summary: true
weight: 9
description: ""
---

dubbo3.0 supports native-image document

## Overview

This document will introduce the process of connecting dubbo3.0 project to GraalVM and compiling native-image into binary.

More information about GraalVm can be read https://www.graalvm.org/docs/getting-started/container-images/ this document.

## Use the example

Before compiling our dubbo project, we need to make sure that we are based on the graalVm environment.

1. Install GraalVM

Go to https://www.graalvm.org/ official website and select the latest version to install according to your own system:

![img](/imgs/blog/dubbo3.0-graalvm-support/graalvmgw.jpg)

After the installation is complete, modify the path to configure JAVA_HOME, and check the local jdk after it takes effect, you can see the following:

![img](/imgs/blog/dubbo3.0-graalvm-support/graalvm_env.jpg)
Here we use GraalVM based on jdk1.8 version.

- To install native-image, just execute gu install native-image.

1. Pull the dubbo code and switch to the [apache:3.0](https://github.com/apache/dubbo) branch.
2. Manually execute the generated SPI code.

Since the current compilation of native-image does not support code dynamic generation and compilation, the part related to code dynamic generation needs to be generated manually. Here is a tool function:

![img](/imgs/blog/dubbo3.0-graalvm-support/code_generator.jpg)
Execute CodeGenerator to generate SPI code under the dubbo-native module.

1. Execute install in the root directory

```
MacdeMacBook-pro-3:incubator-dubbo mac$ pwd

/Users/mac/Documents/Mi/project/incubator-dubbo

MacdeMacBook-pro-3:incubator-dubbo mac$ mvn clean package install -Dmaven.test.skip=true
```

1. Compile the demo project

Here we provide a sample project that can be directly compiled, dubbo-demo/dubbo-demo-native. After the above steps are installed, first go to the provider of dubbo-demo-native and execute native-image compilation:

```
 mvn clean package -P native -Dmaven.test.skip=true
```

Here, since we have introduced the native-image plug-in in maven, the plug-in can be executed directly -P native.

![img](/imgs/blog/dubbo3.0-graalvm-support/native_image_build.jpg)
After the compilation is successful, you can see the generated binary file under the target, start a zookeeper locally, and execute the binary directly. It can be seen that the startup is successful as follows:

![img](/imgs/blog/dubbo3.0-graalvm-support/run_provider.jpg)
The consumer side also executes compilation, and a binary file is also generated under the consumer target: demo-native-consumer. Execute this binary and you can see the result of the call as follows:

![img](/imgs/blog/dubbo3.0-graalvm-support/run_consumer.jpg)
### Specific steps

In fact, we have done some work under this demo to ensure that the project can be compiled and executed. There are mainly the following steps

- Introduce dubbo-native dependency

```
<dependency>

    <groupId>org.apache.dubbo</groupId>

    <artifactId>dubbo-native</artifactId>

    <version>${project.version}</version>

</dependency>
```

Under this module is the SPI code we generated.

- Introduce native-image plugin

```
<plugin>

    <groupId>org.graalvm.nativeimage</groupId>

    <artifactId>native-image-maven-plugin</artifactId>

    <version>21.0.0.2</version>

    <executions>

        <execution>

            <goals>

                <goal>native-image</goal>

            </goals>

            <phase>package</phase>

        </execution>

    </executions>

    <configuration>

        <skip>false</skip>

        <imageName>demo-native-provider</imageName>

        <mainClass>org.apache.dubbo.demo.graalvm.provider.Application</mainClass>

        <buildArgs>

            --no-fallback

            --initialize-at-build-time=org.slf4j.MDC

            --initialize-at-build-time=org.slf4j.LoggerFactory

            --initialize-at-build-time=org.slf4j.impl.StaticLoggerBinder

            --initialize-at-build-time=org.apache.log4j.helpers.Loader

            --initialize-at-build-time=org.apache.log4j.Logger

            --initialize-at-build-time=org.apache.log4j.helpers.LogLog

            --initialize-at-build-time=org.apache.log4j.LogManager

            --initialize-at-build-time=org.apache.log4j.spi.LoggingEvent

            --initialize-at-build-time=org.slf4j.impl.Log4jLoggerFactory

            --initialize-at-build-time=org.slf4j.impl.Log4jLoggerAdapter

            --initialize-at-build-time=org.eclipse.collections.api.factory.Sets

            --initialize-at-run-time=io.netty.channel.epoll.Epoll

            --initialize-at-run-time=io.netty.channel.epoll.Native

            --initialize-at-run-time=io.netty.channel.epoll.EpollEventLoop

            --initialize-at-run-time=io.netty.channel.epoll.EpollEventArray

            --initialize-at-run-time=io.netty.channel.DefaultFileRegion

            --initialize-at-run-time=io.netty.channel.kqueue.KQueueEventArray

            --initialize-at-run-time=io.netty.channel.kqueue.KQueueEventLoop

            --initialize-at-run-time=io.netty.channel.kqueue.Native

            --initialize-at-run-time=io.netty.channel.unix.Errors

            --initialize-at-run-time=io.netty.channel.unix.IovArray

            --initialize-at-run-time=io.netty.channel.unix.Limits

            --initialize-at-run-time=io.netty.util.internal.logging.Log4JLogger

            --initialize-at-run-time=io.netty.channel.unix.Socket

            --initialize-at-run-time=io.netty.channel.ChannelHandlerMask



            --report-unsupported-elements-at-runtime

            --allow-incomplete-classpath

            --enable-url-protocols=http

            -H:+ReportExceptionStackTraces

        </buildArgs>

    </configuration>

</plugin>
```

It defines the name of the generated image and some parameters for building the image.

- mount native-image-agent

Since we need to specify some reflection, JNI and other classes first, we need to use the agent to run it in a normal way to generate information in the form of json for these classes.

In the startup parameters add:

```
-agentlib:native-image-agent=config-output-dir=/tmp/config/,config-write-period-secs=300,config-write-initial-delay-secs=5
```

Start in the normal way, create a folder META-INF.native-image under the resources of the project, and paste the files generated in the local directory:

![img](/imgs/blog/dubbo3.0-graalvm-support/resources.jpg)
(There may be missing class information that is not generated, which needs to be added manually according to the error message when compiling or running.)



** After completing the above steps, the project can be compiled. **
