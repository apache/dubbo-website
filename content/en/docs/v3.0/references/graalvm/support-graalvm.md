## Overview

This document will show you how to access GraalVM with a dubbo project and how to compile the project to a binary executable using native-image. 

For more information about GraalVM, read https://www.graalvm.org/docs/getting-started/container-images/.

## Demo

Before compiling the dubbo project, make sure that we are programming based on the GraalVM environment.

1. Install GraalVM

   Visite the official website (https://www.graalvm.org/ ) and install the latest version based on your system:

![img](/imgs/blog/dubbo3.0-graalvm-support/graalvmgw.jpg)

   After installation, configure the path of JAVA_HOME. You should see thr following in your local jdk after this step:

![img](/imgs/blog/dubbo3.0-graalvm-support/graalvm_env.jpg)

   GraalVM we use here is based on jdk version 1.8.
   To install native-image, run 'gu install native-image'.

2. Pull dubbo code and switch to branch [apache:3.0](https://github.com/apache/dubbo).

3. Manually generate SPI code

   Currently native-image compiling does not support dynamic code generation. Therefore we need to first manually generate the part of the code that is generated dynamically. The tool function is provided here:

![img](/imgs/blog/dubbo3.0-graalvm-support/code_generator.jpg)

   Execute CodeGenerator can generate SPI code under the dubbo-native module. 

4. Execute 'install' under the root directory

   ```ruby
   MacdeMacBook-pro-3:incubator-dubbo mac$ pwd
   /Users/mac/Documents/Mi/project/incubator-dubbo
   MacdeMacBook-pro-3:incubator-dubbo mac$ mvn clean package install -Dmaven.test.skip=true
   ```

5. Compile the project demo

   Here we provide a demo project that can be directly compiled: dubbo-demo / dubbo-demo-native. After installation, first go to the provider in dubbo-demo-native and execute native-image compilation:

   ```java
    mvn clean package -P native -Dmaven.test.skip=true
   ```

   Since we have imported native-image plugin in maven, here we can use '-P native' to execute the plugin.

![img](/imgs/blog/dubbo3.0-graalvm-support/native_image_build.jpg)

   After a success compilation, we can find the generated binary file under target. Succefully iniate a zookeeper locally and execute the binary executable file should show us this:

![img](/imgs/blog/dubbo3.0-graalvm-support/run_provider.jpg)

   Compile on consumer' side will generate a binary executable file 'demo-native-consumer' under consumer's target. Execute the file will give us the following output:

![img](/imgs/blog/dubbo3.0-graalvm-support/run_consumer.jpg)

### Additional Steps

In this demo, we did extra work to make sure the project can be compiled. Here are the additional steps:

- Import dependency dubbo-native

  ```html
  <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-native</artifactId>
      <version>${project.version}</version>
  </dependency>
  ```

  Our generated SPI code is in this module. 

- Import native-image plug-in

  ```Lua
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

  Generated image names and parameters used for generating image are defined. 

- Mount native-image-agent

  Since some classes, including reflection and JNI, need to be assigned, we have to use the agent to run the json information that generate these classes. 

  Add the following to startup parameters:

  ```xml
  -agentlib:native-image-agent=config-output-dir=/tmp/config/,config-write-period-secs=300,config-write-initial-delay-secs=5
  ```

  Launch in conventional way, create folder 'META-INF.native-image' under the resources folder and paste the generated files in the local directory into the folder.

![img](/imgs/blog/dubbo3.0-graalvm-support/resources.jpg)

  (Missing classes' information may exist. These information need to be manually added according to the error message reported while compiling or running.)

  **Finished the steps above, now you can compile your project.**
