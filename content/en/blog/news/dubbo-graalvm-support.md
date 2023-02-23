---
title: "Native Image using GraalVM"
linkTitle: "Native Image"
date: 2018-08-14
description: > 
    This article introduces you how to make Dubbo native image using GraalVM.
---

## Overview

This document will show you how to access GraalVM with a dubbo project and how to compile the project to a binary executable using native-image. The document also introduces the efforts we made in achieving this.

GraalVM's essential is the Graal compiler, an excellent just-in-time (JIT) compiler. It can be used as both a JIT compiler and a static compiler for ahead-of-time compilation. Graal compiler completes the primary compilation work.

For more information about GraalVM, read https://www.graalvm.org/docs/getting-started/container-images/.

## Preparation

Before compiling the dubbo project, make sure that we are programming based on the GraalVM environment.

GraalVM's installation process won't be introduced in this document. You can visit https://www.graalvm.org/ and select the latest version to install. After installation you will be able to see the following in local jdk:

![graalvm_env.png](/imgs/blog/dubbo-graalvm-support/graalvm_env.png)
GraalVM we use here is based on jdk version 1.8.

## Get Started

For user's convenience, we provide the following demo in the [apache dubbo](https://github.com/apache/dubbo/) branch. In module dubbo-demo-native, dubbo's provider and consumer demos are given:

![demo_path.png](/imgs/blog/dubbo-graalvm-support/demo_path.png)

We used native-image's maven plug-in and customized several native-image starting parameters. Users only need to run maven's compile and package command in consumers' and providers' modules:

```
mvn -U clean package -Dmaven.test.skip=true
```

You can see the following output after compilation:

![provider_compiler.png](/imgs/blog/dubbo-graalvm-support/consumer_compiler.png)![img](/imgs/blog/dubbo-graalvm-support/provider_compiler.png)

Binary executable file generated can be found in the target catalog:

![compile_result.png](/imgs/blog/dubbo-graalvm-support/compile_result.png)

Size of the binary executable file is around 40M:

```
MacdeMacBook-pro-3:target mac$ du -m demo-native-provider 
40    demo-native-provider
```

Note: example above is the service registration and discovery based on zookeeper. Users have to launch a zk locally before executing the binary executable file. 

Launch the binary executable file:

```
MacdeMacBook-pro-3:target mac$ ./demo-native-provider
......
INFO:  [DUBBO] DubboBootstrap is ready., dubbo version: 2.7.12-SNAPSHOT, current host: 10.220.186.228
Jun 15, 2021 2:29:14 PM org.apache.dubbo.common.logger.jdk.JdkLogger info
INFO:  [DUBBO] DubboBootstrap has started., dubbo version: 2.7.12-SNAPSHOT, current host: 10.220.186.228
Jun 15, 2021 2:29:14 PM org.apache.dubbo.common.logger.jdk.JdkLogger info
INFO:  [DUBBO] DubboBootstrap awaiting ..., dubbo version: 2.7.12-SNAPSHOT, current host: 10.220.186.228
```

Enter consumer's target catalog and execute the binary executable file:

```
MacdeMacBook-pro-3:target mac$ ./demo-native-consumer 
Hello dubbo, response from provider: 10.220.186.228:20880
```

All the launches and invokes above finish within one second.

## Our Efforts

### Preparations

#### Class Initialization's Auxiliary Configurations

Since native-image is constructed prior to runtime, its construction is dependent on the static analysis of which code is accessible. However, this analysis cannot always fully predict all usages of Java Native Interface (JNI) , reflection, dynamic proxy object or classpath resource. In the format of `native-image` configuration file, we need to provide the usages whose dynamic functions are not detected.

Here we add the following to the JVM parameter:

```
-agentlib:native-image-agent=config-output-dir=/path/to/config-dir/
```

Parameter above will introduce agent and run the project in the conventional way. Agent will interact with JVM and intercept all invokes that look up classes, methods, fields, resources or request proxy access.  Later agent will produce the following files in the specified catalog: `jni-config.json`, `reflect-config.json`, `proxy-config.json` and `resource-config.json`, etc.

Copy the files above into project's resource/META-INF/native-image folder. When native-image compiles, operations regarding JNI, reflection, dynamic proxy and resources will be loaded after finding class information from these json files.

Note: in reality, since agent detects operations while running and not all logic branches can be covered, some classes' json info won't be generated. However, native-image compiles all classes. This will lead to unexpected errors. Currently there's no way for users to distinguish which classes' information are lacking until the errors are reported. Lacked info has to be added to json files manually.

#### Import Native-Image Plug-In 

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
```

After importing the plug-in, native-image command can be automatically executed when executing maven commands such as packaging. 

#### Import Generated SPI Dependency Package

SPI mode of dubbo grants huge expandability. It depends on some generated code that are adaptive to extensions. These generated code are not supported by binary images. To deal with this problem, we did the following:

- Export generated code

(Note: here we modified compiler's code in dubbo-common. Detailed explanations will be presented later on.)

```
public Class<?> doCompile(String name, String source) throws Throwable {
  System.*out*.println("--->write code:" + name);
  Files.*write*(Paths.*get*("/tmp/sources/" + name), source.getBytes());
  ......
}
```

- Copy the exported code into dubbo-graalvm module
![graalvm.png](/imgs/blog/dubbo-graalvm-support/graalvm.png)

- Import module in new project

pom dependency:

```
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo-graalvm</artifactId>
  <version>2.7.12-SNAPSHOT</version>
</dependency>
```

(Note: dubbo that depends on this branch can directly add dependency. Other versions with new SPI added needs to update by exporting the source code.) 

After importing dependencies, we can directly find classes using class names during the process of doCompiler without dynamically generating code:

```
@Override
public Class<?> doCompile(String name, String sourceCode) throws Throwable {
  try {
    Class<?> res = Class.*forName*(name);
    return res;
  } catch (Throwable ex) {
    //ignore
  }
  //......
}
```

At this point, all dependencies required for native-image compilation are completed. Packaging can generate binary executable file. 

#### Modifications to Dubbo Source Code

Branch is named native_dubbo_0611 and modified based on tag version [dubbo-2.7.12](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.12). Here we will explain the major modifications.

- Avoid dynamically generated code

```
//dubbo-common/src/main/java/org/apache/dubbo/common/compiler/support/JavassistCompiler.java
@Override
public Class<?> doCompile(String name, String source) throws Throwable {
  try {
    Class<?> res = Class.*forName*(name);
    return res;
  } catch (Throwable ex) {
    //ignore
  }
    CtClassBuilder builder = new CtClassBuilder();
    builder.setClassName(name)
    //......
}
//dubbo-common/src/main/java/org/apache/dubbo/common/compiler/support/JdkCompiler.java
@Override
public Class<?> doCompile(String name, String sourceCode) throws Throwable {
  try {
    Class<?> res = Class.*forName*(name);
    return res;
  } catch (Throwable ex) {
    //ignore
  }
  int i = name.lastIndexOf('.');
  String packageName = i < 0 ? "" : name.substring(0, i);
  //......
```

Here we modified dubbo's both compilation methods. When compiling source code, first determine if the class, which is, in fact, the generated code in dubbo-graalvm that we imported, is loaded locally based on all class name reflection. The loaded class will be returned after importing the package. No compilation required. 

- Substitute code generation in ExtensionLoader

```
//dubbo-common/src/main/java/org/apache/dubbo/common/extension/ExtensionLoader.java
private Class<?> createAdaptiveExtensionClass() {
  try {
    Class c = Class.*forName*(generatePackageInfo() + "." + type.getSimpleName() + "$Adaptive");
    return c;
  } catch (Throwable e) {
    //ignore
  }
  String code = new AdaptiveClassCodeGenerator(type,cachedDefaultName).generate();
    //......
}
private static final String *CODE_PACKAGE* = "%s";
private String generatePackageInfo() {
  return String.*format*(*CODE_PACKAGE*, type.getPackage().getName());
}
```

ExtensionLoader is the main logic class of the whole extension mechanism. Works such as loading configuration, extension class cache and generating self-adopting objects, are all done in the class.

getAdaptiveExtension() method automatically creates implementation class String for extension points interface. 

Similar to the first modification mentioned above, since we imported the SPI package, code generation is no longer needed. Requesting local class based on class name will work. Return when the implementation class is found. Notice here that the generated extension class names all end with $Adaptive. When looking for classes, remember to add the suffix.

- Substitute Wrapper's usage in Reference/ServiceConfig

```
//dubbo-config/dubbo-config-api/src/main/java/org/apache/dubbo/config/ReferenceConfig.java
// String[] methods = Wrapper.getWrapper(interfaceClass).getMethodNames();
  String[] methods = Arrays.*stream*(interfaceClass.getMethods()).map(it->it.getName()).toArray(String[]::new);
  if (methods.length == 0) {
   l*ogger*.warn("No method found in service interface " + interfaceClass.getName());
    map.put(*METHODS_KEY*, *ANY_VALUE*);
  //......
}
//dubbo-config/dubbo-config-api/src/main/java/org/apache/dubbo/config/ServiceConfig.java
// String[] methods = Wrapper.getWrapper(interfaceClass).getMethodNames();
  String[] methods = Arrays.*stream*(interfaceClass.getMethods()).map(it->it.getName()).toArray(String[]::new);
  if (methods.length == 0) {
   l*ogger*.warn("No method found in service interface " + interfaceClass.getName());
    map.put(*METHODS_KEY*, *ANY_VALUE*);
  //......
```

Since Wrapper's getWrapper needs to be dynamically generated, here we substitute it by reflected  getMethods.

- Add dubbo-graalvm module

dubbo-graalvm's uses have been explained previously.

- Substitute fastjson by gson

```
//dubbo-registry/dubbo-registry-api/src/main/java/org/apache/dubbo/registry/client/metadata/store/InMemoryWritableMetadataService.java
@Override
public void publishServiceDefinition(URL providerUrl) {
  try {
    if (!ProtocolUtils.*isGeneric*(providerUrl.getParameter(*GENERIC_KEY*))) {
      String interfaceName = providerUrl.getParameter(*INTERFACE_KEY*);
      if (StringUtils.*isNotEmpty*(interfaceName)) {
        Class interfaceClass = Class.*forName*(interfaceName);
        ServiceDefinition serviceDefinition = ServiceDefinitionBuilder.*build*(interfaceClass);
        String data = new Gson().toJson(serviceDefinition);
        serviceDefinitions.put(providerUrl.getServiceKey(), data);
        return;
      }
  //......
}
```

cglib is used in fastjson for dynamic proxy, but native-image does not support cglib. So here we use gson instead.

- Substitute set by list for multiple interface proxy invoke

```
//dubbo-rpc/dubbo-rpc-api/src/main/java/org/apache/dubbo/rpc/proxy/AbstractProxyFactory.java
@Override
public <T> T getProxy(Invoker<T> invoker, boolean generic) throws RpcException {
  List<Class<?>> interfaces = new ArrayList<>();
  String config = invoker.getUrl().getParameter(*INTERFACES*);
  if (config != null && config.length() > 0) {
    String[] types = *COMMA_SPLIT_PATTERN*.split(config);
    for (String type : types) {
      // *TODO can we load successfully for a different classloader?.*
      interfaces.add(ReflectUtils.*forName*(type));
    }
  }
  //......
}
```

The service here has multiple interfaces which have to be in order when requesting proxy. Set does not fulfill the requirement so we use ArrayList instead.

Major modifications to dubbo source code are listed above.
