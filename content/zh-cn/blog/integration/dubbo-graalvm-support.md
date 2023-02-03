---
title: "使用 GraalVM 构建 Native Image"
linkTitle: "Native Image"
date: 2021-01-14
description: >
  本文讲解了如何使用 GraavlVM 构建 Dubbo 的 Native Image
---

# dubbo项目支持native-image

## 概述

​	本文档将介绍将dubbo项目接入GraalVM，进行native-image编译为二进制的方式，以及我们为了达到这个目的做了哪些工作。

​	GraalVM的核心就是Graal编译器，一款优秀的JIT编译器。它即可以当作JIT编译器使用，也可以用作提前编译的静态编译器。它将完成编译的主要工作。

​	关于GraalVm的更多信息可以阅读 https://www.graalvm.org/docs/getting-started/container-images/ 此文档。

## 准备工作

​	在编译我们的dubbo项目之前，需要确保我们正基于graalVm的环境。

​	安装GraalVM的工作这里不做介绍，可以进入https://www.graalvm.org/ 官网选取最新版本安装，安装完成后查看本地jdk可以看到如下：

![](/imgs/blog/dubbo-graalvm-support/graalvm_env.png)

​	这里我们使用的基于jdk1.8版本的GraalVM。

## 快速上手

​	为了便于用户快速上手，我们在 Dubbo 仓库中，提供了如下demo。

​	模块名dubbo-demo-native，该模块中提供了简易版本的dubbo的provider以及consumer:

![](/imgs/blog/dubbo-graalvm-support/demo_path.png)

​	我们在其中使用了native-image的maven插件，并定制了一些native-image的启动参数，用户只需要对应在provider以及consumer模块下执行maven的编译打包命令：

```
mvn -U clean package -Dmaven.test.skip=true
```

​	编译成功可以看到如下输出：

![](/imgs/blog/dubbo-graalvm-support/consumer_compiler.png)![](/imgs/blog/dubbo-graalvm-support/provider_compiler.png)

​	在target目录中可以看到已经生成的二进制文件：

![](/imgs/blog/dubbo-graalvm-support/compile_result.png)

​	查看该二进制文件大小大约在40M左右：

```
MacdeMacBook-pro-3:target mac$ du -m demo-native-provider 
40    demo-native-provider
```

(注：本例子基于zookeeper进行的服务注册和发现，所以用户需要在本地先启动一个zk，再执行二进制启动。)

​	直接运行启动该二进制：

```
MacdeMacBook-pro-3:target mac$ ./demo-native-provider
......
INFO:  [DUBBO] DubboBootstrap is ready., dubbo version: 2.7.12-SNAPSHOT, current host: 10.220.186.228
Jun 15, 2021 2:29:14 PM org.apache.dubbo.common.logger.jdk.JdkLogger info
INFO:  [DUBBO] DubboBootstrap has started., dubbo version: 2.7.12-SNAPSHOT, current host: 10.220.186.228
Jun 15, 2021 2:29:14 PM org.apache.dubbo.common.logger.jdk.JdkLogger info
INFO:  [DUBBO] DubboBootstrap awaiting ..., dubbo version: 2.7.12-SNAPSHOT, current host: 10.220.186.228
```

​	再进入consumer的target目录，执行该二进制：

```
MacdeMacBook-pro-3:target mac$ ./demo-native-consumer 
Hello dubbo, response from provider: 10.220.186.228:20880
```

​	以上启动以及调用均在零点几秒内完成。

## 我们做了哪些工作

### 项目中的准备

#### 类初始化的辅助配置

由于native-image是在runtime之前构建的，它的构建依赖于对哪些代码可访问的静态分析。但是，这种分析不能总是完全预测 Java 本地接口 (JNI)、Java 反射、动态代理对象或类路径资源的所有用法。需要以native-image配置文件的形式向工具提供这些动态功能未被检测到的用法。

这里我们在jvm参数中加入：

```
-agentlib:native-image-agent=config-output-dir=/path/to/config-dir/
```

以上参数将引入agent，再将项目已常规方式运行，agent将与JVM交互，拦截所有查找类、方法、字段、资源或请求代理访问的调用。然后，agent将在指定的目录中生成文件一下文件：

jni-config.json，reflect-config.json，proxy-config.json以及resource-config.json......

将以上文件拷入项目的 resource/META-INF/native-image文件夹下，native-image编译时对于jni、反射、动态代理以及资源相关的操作将从这些json文件中找到类的信息进行加载。

（注:实际上由于该agent是在运行时检测以上几类操作，而运行时势必无法走遍所有逻辑分支，所以会有些类的json信息无法生成。然而native-image编译时会对所有类进行编译，所以会导致一些预料不到的错误发生，目前只能是在发生错误时进行判断确实的类信息，手动补充到json文件中。）

#### native-image插件引入

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
  </configuration>
</plugin>
```

​	引入该插件后执行maven的打包等命令时就能自动执行native-image的命令。

#### 引入生成的SPI代码依赖包

​	由于dubbo项目基于SPI的模式开放了极高的可扩展性，而该模式依赖了一些扩展适配的生成代码，在常规模式下运行的项目是没有问题的，但编译为二进制的映像无法支持动态生成编译代码，这里我们是这么解决的：

- 将生成的源码导出：

（注:这里我们一定程度上改动了dubbo-common中compiler的代码，后续会细说）

```
public Class<?> doCompile(String name, String source) throws Throwable {
  System.*out*.println("--->write code:" + name);
  Files.*write*(Paths.*get*("/tmp/sources/" + name), source.getBytes());
  ......
}
```

- 将导出的源码拷入dubbo-graalvm模块中：

![](/imgs/blog/dubbo-graalvm-support/graalvm.png)

- 在新项目中引入该模块：

  pom依赖如下：

```
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo-graalvm</artifactId>
  <version>2.7.12-SNAPSHOT</version>
</dependency>
```

- （注：基于本分支版本的dubbo可以直接依赖该包，后续其他版本若有新增SPI的话需要再导出一遍源码进行更新）

  引入该依赖后，在doCompiler的过程中我们便能够通过类名直接找到该class，无需再动态生成：

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

​	到这里项目关于native-image编译所需的依赖就配置完成了，直接打包即可生成二进制文件。

## 对dubbo源码的改动

​	本分支名为：native_dubbo_0611，基于tag [dubbo-2.7.12](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.12)版本进行修改。这里对我们进行的主要的改动做一些说明。

- 规避动态生成代码

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
}
```

​	这里针对dubbo中的两类代码编译方式都做了修改，需要编译源码时先根据全类名反射查找本地是否已经加载了该类，实际上也就是我们引入的dubbo-graalvm中包含的生成代码，引入该包后这里将直接返回加载好的Class，无需动态进行编译。

- 替换ExtensionLoader中的代码生成

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

​	ExtensionLoader是整个扩展机制的主要逻辑类，在这个类里面实现了配置的加载、扩展类缓存、自适应对象生成等所有工作。

​	在getAdaptiveExtension()方法中，会为扩展点接口自动生成实现类字符串。而这里同第一个变更一样，由于我们直接引入了生成好的SPI代码包，这里边不再需要进行代码生成，直接根据类名获取本地的Class即可，这里注意生成的扩展类名都以 $Adaptive 为后缀，查找类时需要拼接。找到实现类直接返回。

- Reference/ServiceConfig中替换Wrapper的用法

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
}
```

​	这里由于Wrapper的getWrapper需要进行动态的代码生成，所以直接换成反射的getMethods。

- 加入dubbo-graalvm模块

  该模块用处上面已经说明。

- 替换fastjson为gson

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

​	由于fastjson中使用要了cglib进行动态代理，而native-image编译目前还不支持cglib，所以这里换成gson。

- 多接口proxy调用替换set为list

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

​	这里由于该service拥有多个接口获取proxy时需要是有序的，原先使用的set不满足需求，这里用ArrayList替代。

​	以上就是为了支持graalvm对dubbo源码的主要改动点。
