---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/graalvm/
    - /en/docs3-v2/java-sdk/reference-manual/graalvm/
description: ""
hide_summary: true
linkTitle: GraalVM
title: Dubbo Integration GraalVM Reference Manual
type: docs
weight: 9
---






Dubbo 3.0 supports native-image documentation

## Overview

This document will introduce the process of integrating Dubbo 3.0 with GraalVM for native-image compilation into a binary.

For more information about GraalVM, you can read [this document](https://www.graalvm.org/docs/getting-started/container-images/).

## Usage Example

Before compiling our Dubbo project, we need to ensure that we are working in a GraalVM environment.

1. Install GraalVM

Visit [https://www.graalvm.org/](https://www.graalvm.org/) to select and install the latest version for your system:

![img](/imgs/blog/dubbo3.0-graalvm-support/graalvmgw.jpg)

After installation, modify the configuration of JAVA_HOME path. After it takes effect, you can see the local JDK as follows:

![img](/imgs/blog/dubbo3.0-graalvm-support/graalvm_env.jpg)
Here we use the GraalVM based on JDK 1.8.

- Install native-image by executing `gu install native-image`.

1. Pull the Dubbo code and switch to the [apache:3.0](https://github.com/apache/dubbo) branch.
2. Manually generate SPI code.

Since native-image compilation does not currently support dynamic code generation, the parts that require dynamic code generation need to be generated manually first. Here is a tool function provided:

![img](/imgs/blog/dubbo3.0-graalvm-support/code_generator.jpg)
Run CodeGenerator to generate SPI code under the dubbo-native module.

1. Execute install in the root directory

```
MacdeMacBook-pro-3:incubator-dubbo mac$ pwd

/Users/mac/Documents/Mi/project/incubator-dubbo

MacdeMacBook-pro-3:incubator-dubbo mac$ mvn clean package install -Dmaven.test.skip=true
```

1. Compile the demo project

We provide an example project that can be compiled directly, namely dubbo-demo/dubbo-demo-native. After completing the above install steps, go to the provider under dubbo-demo-native and execute the native-image compilation:

```
 mvn clean package -P native -Dmaven.test.skip=true
```

Since we have included the native-image plugin in Maven, executing `-P native` will directly use this plugin.

![img](/imgs/blog/dubbo3.0-graalvm-support/native_image_build.jpg)
After successful compilation, you can see the generated binary in the target directory; start a Zookeeper locally and run this binary to see that it starts successfully as shown below:

![img](/imgs/blog/dubbo3.0-graalvm-support/run_provider.jpg)
The consumer side also compiles similarly, and a binary file will be generated at the consumer's target: demo-native-consumer. Running this binary will show the calling results as below:

![img](/imgs/blog/dubbo3.0-graalvm-support/run_consumer.jpg)
### Specific Steps

In fact, we have done some work in this demo to ensure that the project can compile and run, mainly consisting of the following steps:

- Introduce the dubbo-native dependency

```
<dependency>

    <groupId>org.apache.dubbo</groupId>

    <artifactId>dubbo-native</artifactId>

    <version>${project.version}</version>

</dependency>
```

This module contains the SPI code we generated.

- Introduce the native-image plugin

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

Here we define the name of the generated image and some parameters for building the image.

- Mount the native-image agent

Since we need to specify some classes such as reflection, JNI, etc., we need to use this agent to run the application normally and generate the JSON information for these classes.

Add to the startup parameters:

```
-agentlib:native-image-agent=config-output-dir=/tmp/config/,config-write-period-secs=300,config-write-initial-delay-secs=5
```

Start normally, and create a folder META-INF.native-image under resources in the project, then paste the files generated in the local directory:

![img](/imgs/blog/dubbo3.0-graalvm-support/resources.jpg)
(There may be some missing class information that was not generated, which needs to be added manually based on the compilation or runtime error messages.)

**After completing the above steps, you can compile the project.**

