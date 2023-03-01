---
aliases:
    - /zh/docs/references/graalvm/support-graalvm/
description: 使用 GraalVM 打包 Native Image
linkTitle: Native Image
title: 使用 GraalVM 打包 Native Image
type: docs
weight: 1
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/support-graalvm/)。
{{% /pageinfo %}}

dubbo3.0支持native-image文档

## 概述

本文档将介绍将dubbo3.0项目接入GraalVM，进行native-image编译为二进制的流程。

关于GraalVm的更多信息可以阅读 https://www.graalvm.org/docs/getting-started/container-images/ 此文档。

## 使用样例

在编译我们的dubbo项目之前，需要确保我们正基于graalVm的环境。

1. 安装GraalVM

进入https://www.graalvm.org/ 官网根据自己的系统选取最新版本安装：

![img](/imgs/blog/dubbo3.0-graalvm-support/graalvmgw.jpg)

安装完成后，修改配置JAVA_HOME的路径，生效后查看本地jdk可以看到如下：

![img](/imgs/blog/dubbo3.0-graalvm-support/graalvm_env.jpg)
这里我们使用的基于jdk1.8版本的GraalVM。

- 安装native-image，只需执行gu install native-image即可。

1. 拉取dubbo代码，切换到[apache:3.0](https://github.com/apache/dubbo)分支。
2. 手动执行生成SPI代码。

由于目前编译native-image不支持代码动态生成编译，所以有关代码动态生成的部分需要我们手动先生成，这里提供了工具函数：

![img](/imgs/blog/dubbo3.0-graalvm-support/code_generator.jpg)
执行CodeGenerator即可在dubbo-native模块下生成SPI代码。

1. 在根目录下执行install

```
MacdeMacBook-pro-3:incubator-dubbo mac$ pwd

/Users/mac/Documents/Mi/project/incubator-dubbo

MacdeMacBook-pro-3:incubator-dubbo mac$ mvn clean package install -Dmaven.test.skip=true
```

1. 编译demo项目

这里我们提供了可直接进行编译的示例项目，dubbo-demo/dubbo-demo-native。上面步骤install完成后，先到dubbo-demo-native的provider下，执行native-image编译：

```
 mvn clean package -P native -Dmaven.test.skip=true
```

这里由于我们在maven中引入了native-image插件，所以直接-P native即可执行该插件。

![img](/imgs/blog/dubbo3.0-graalvm-support/native_image_build.jpg)
编译成功后可以在target下看到已经生成的二进制文件，本地启动一个zookeeper，直接执行该二进制，可见启动成功如下：

![img](/imgs/blog/dubbo3.0-graalvm-support/run_provider.jpg)
consumer端同样执行编译，在consumer的target下也会生成二进制文件：demo-native-consumer,执行该二进制可以看到调用结果如下：

![img](/imgs/blog/dubbo3.0-graalvm-support/run_consumer.jpg)
### 具体步骤

实际上在这个demo下我们做了一些工作来确保项目可以编译执行，主要有以下几个步骤

- 引入dubbo-native依赖

```
<dependency>

    <groupId>org.apache.dubbo</groupId>

    <artifactId>dubbo-native</artifactId>

    <version>${project.version}</version>

</dependency>
```

该模块下有我们生成的SPI代码。

- 引入native-image插件

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

其中定义了生成的镜像名以及一些构建镜像的参数。

- 挂载native-image-agent

由于我们需要将一些反射、JNI等类先指定出来，我们需要先使用该agent以正常方式运行一遍生成这些类的json形式的信息。

在启动参数中添加：

```
-agentlib:native-image-agent=config-output-dir=/tmp/config/,config-write-period-secs=300,config-write-initial-delay-secs=5
```

以正常方式启动，在项目的resources下建立文件夹META-INF.native-image，把在本地目录中生成的文件粘进去：

![img](/imgs/blog/dubbo3.0-graalvm-support/resources.jpg)
（可能会有缺漏没有生成的类信息，需要根据编译或运行时的报错信息手动添加。）



**完成以上几步后就可以进行项目的编译了。**
