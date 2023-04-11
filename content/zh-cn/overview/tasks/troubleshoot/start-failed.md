---
aliases:
    - /zh/overview/tasks/troubleshoot/start-failed/
description: 在 Dubbo 应用启动失败时的排查思路
linkTitle: 应用启动失败
title: 应用启动失败
type: docs
weight: 1
---



在开发与生产部署过程中，由于各种非预期的变更，可能会出现应用无法启动的情况。对于 Dubbo 来说，通常启动失败时都会有类似以下的报错信息。

```bash
Caused by: java.lang.IllegalStateException: Dubbo Module[1.1.1] is stopping or stopped, can not start again
```

```bash
[DUBBO] Dubbo Application[1.1](first-dubbo-consumer) start failure
```

## 一句话总结
正确配置日志输出，往前翻到第一个报错的位置并进行处理。

## 排查方式
### 1 配置日志输出
目前 Dubbo 支持多种日志框架，如果环境中存在多种日志框架的支持（如 log4j 和 logback），Dubbo 会按照 （log4j > slf4j > log4j2 > jcl）的顺序输出日志框架。

如果与预期的日志框架不同时，会出现日志无法输出的问题。此时可以通过以下的配置进行调整：

```properties
dubbo.application.logger=slf4j
```

注：3.2.0 及以上的版本中将自动分析日志框架是否存在配置，优选日志框架输出。

### 2 找到真正的报错信息
在正确配置日志输出之后，可以在日志中搜索 `[DUBBO] Model start failed` 或者 `start failure` 关键字，查看真正导致 Dubbo 启动失败的原因。

如下所示，启动失败的原因为有服务订阅找不到提供者。
```
[27/02/23 12:49:18:018 CST] main ERROR deploy.DefaultModuleDeployer:  [DUBBO] Model start failed: Dubbo Module[1.1.1] start failed: java.lang.IllegalStateException: Failed to check the status of the service org.apache.dubbo.samples.api.GreetingsService. No provider available for the service org.apache.dubbo.samples.api.GreetingsService from the url consumer://30.221.144.195/org.apache.dubbo.samples.api.GreetingsService?application=first-dubbo-consumer&background=false&dubbo=2.0.2&environment=product&executor-management-mode=default&file-cache=true&interface=org.apache.dubbo.samples.api.GreetingsService&methods=sayHi&pid=54580&register.ip=30.221.144.195&release=3.2.0-beta.6-SNAPSHOT&side=consumer&sticky=false&timestamp=1677473358611&unloadClusterRelated=false to the consumer 30.221.144.195 use dubbo version 3.2.0-beta.6-SNAPSHOT, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195, error code: 5-14. This may be caused by , go to https://dubbo.apache.org/faq/5/14 to find instructions. 
java.lang.IllegalStateException: Failed to check the status of the service org.apache.dubbo.samples.api.GreetingsService. No provider available for the service org.apache.dubbo.samples.api.GreetingsService from the url consumer://30.221.144.195/org.apache.dubbo.samples.api.GreetingsService?application=first-dubbo-consumer&background=false&dubbo=2.0.2&environment=product&executor-management-mode=default&file-cache=true&interface=org.apache.dubbo.samples.api.GreetingsService&methods=sayHi&pid=54580&register.ip=30.221.144.195&release=3.2.0-beta.6-SNAPSHOT&side=consumer&sticky=false&timestamp=1677473358611&unloadClusterRelated=false to the consumer 30.221.144.195 use dubbo version 3.2.0-beta.6-SNAPSHOT
```

## 常见的原因
本章将介绍 Dubbo 中常见的启动失败原因。
### 1 消费端地址找不到
消费端地址找不到的日志特征如下：

```
Failed to check the status of the service ***. No provider available for the service *** from the url
```

解决方案：服务找不到时先自查服务是否已经开发完部署了，然后在注册中心中确认是否已经注册，如果注册检查服务端发布情况、如果未注册检查消费端订阅情况，中间任何一步出问题都会导致异常。

更多关于地址找不到的排查思路可以参考[地址找不到异常](../no-provider)一文。

### 2 配置异常
#### 2.1 应用名未配置
应用名未配置的日志特征如下：

```
[27/02/23 02:23:14:014 CST] main ERROR deploy.DefaultApplicationDeployer:  [DUBBO] Dubbo Application[1.1](unknown) start failure, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195, error code: 5-14. This may be caused by , go to https://dubbo.apache.org/faq/5/14 to find instructions. 
java.lang.IllegalStateException: There's no ApplicationConfig specified.
	at org.apache.dubbo.config.context.ConfigManager.lambda$getApplicationOrElseThrow$0(ConfigManager.java:85)
```

典型的日志内容为 `There's no ApplicationConfig specified`。

解决方案：

1. Spring Boot 项目配置 `dubbo.application.name` 应用名并重新启动
2. Spring 项目配置 `<dubbo:application name="xxx">` 属性并重新启动
3. 直接使用 Dubbo API 的项目需要注入 `ApplicationConfig applicationConfig = new ApplicationConfig("xxx");` 属性并重新启动

#### 2.2 重复配置覆盖
重复配置覆盖的日志特征如下：
```
Exception in thread "main" java.lang.IllegalStateException: Duplicate Configs found for ApplicationConfig, only one unique ApplicationConfig is allowed for one application. previous: <dubbo:application environment="product" name="first-dubbo-consumer" />, later: <dubbo:application environment="product" name="second-dubbo-consumer" />. According to config mode [STRICT], please remove redundant configs and keep only one.
```

典型的日志内容为 `Duplicate Configs found for`。

解决方案：

1. Spring 项目中通常为注入了多个 Config 导致的，请按照日志提示删除到仅剩下一个并重新启动
2. Spring XML 项目中通常引入了多个互斥的属性导致的，请按照日志提示删除到仅剩下一个并重新启动
3. 直接使用 Dubbo API 的项目通常是注入了多个相同维度的配置导致的，请按照日志提示删除到仅剩下一个并重新启动
4. 对于无法修改重复属性的用户，可以在启动参数中指定 `dubbo.config.mode` 为 `OVERRIDE` 或 `IGNORE` 分别代表着覆盖原配置或忽略新配置。

注：此异常为 3.x 中新检查行为，2.7.x 及以前版本中存在任意覆盖的问题。

### 3 类找不到
类找不到的日志特征如下：
```
[27/02/23 02:44:50:050 CST] main ERROR deploy.DefaultApplicationDeployer:  [DUBBO] Dubbo Application[1.1](first-dubbo-consumer) start failure, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195, error code: 5-14. This may be caused by , go to https://dubbo.apache.org/faq/5/14 to find instructions. 
java.lang.IllegalStateException: org.apache.dubbo.samples.api.Greetings
	at org.apache.dubbo.config.ReferenceConfig.checkAndUpdateSubConfigs(ReferenceConfig.java:706)
	at org.apache.dubbo.config.ReferenceConfig.postProcessRefresh(ReferenceConfig.java:721)
	at org.apache.dubbo.config.AbstractConfig.refresh(AbstractConfig.java:693)
	at java.util.concurrent.ConcurrentHashMap$ValuesView.forEach(ConcurrentHashMap.java:4707)
	at org.apache.dubbo.config.context.ModuleConfigManager.refreshAll(ModuleConfigManager.java:180)
	at org.apache.dubbo.config.deploy.DefaultModuleDeployer.loadConfigs(DefaultModuleDeployer.java:317)
	at org.apache.dubbo.config.deploy.DefaultModuleDeployer.initialize(DefaultModuleDeployer.java:113)
	at org.apache.dubbo.config.deploy.DefaultApplicationDeployer.initModuleDeployers(DefaultApplicationDeployer.java:238)
	at org.apache.dubbo.config.deploy.DefaultApplicationDeployer.initialize(DefaultApplicationDeployer.java:211)
	at org.apache.dubbo.config.deploy.DefaultApplicationDeployer.start(DefaultApplicationDeployer.java:616)
	at org.apache.dubbo.config.bootstrap.DubboBootstrap.start(DubboBootstrap.java:226)
	at org.apache.dubbo.config.bootstrap.DubboBootstrap.start(DubboBootstrap.java:215)
	at org.apache.dubbo.samples.client.Application.main(Application.java:50)
Caused by: java.lang.ClassNotFoundException: org.apache.dubbo.samples.api.Greetings
	at java.net.URLClassLoader.findClass(URLClassLoader.java:382)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:418)
	at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:355)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:351)
	at java.lang.Class.forName0(Native Method)
	at java.lang.Class.forName(Class.java:348)
	at org.apache.dubbo.config.ReferenceConfig.checkAndUpdateSubConfigs(ReferenceConfig.java:702)
	... 12 more

```

典型的日志内容为 `java.lang.ClassNotFoundException`。

解决方案：

1. 检查是否正确打包，是否存在依赖包丢失的情况。（可以结合 arthas 进行诊断）
2. 对于确实不需要使用类对象的（如网关场景），可以配置 `generic` 属性开启泛化调用，会自动忽略类检查

### 4 方法找不到
方法找不到的日志特征如下：
```
[27/02/23 02:49:31:031 CST] main ERROR deploy.DefaultApplicationDeployer:  [DUBBO] Dubbo Application[1.1](first-dubbo-consumer) start failure, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195, error code: 5-14. This may be caused by , go to https://dubbo.apache.org/faq/5/14 to find instructions. 
java.lang.IllegalStateException: Failed to override field value of config bean: <dubbo:reference sticky="false" interface="org.apache.dubbo.samples.api.GreetingsService" />
	at org.apache.dubbo.config.AbstractConfig.refresh(AbstractConfig.java:690)
	at java.util.concurrent.ConcurrentHashMap$ValuesView.forEach(ConcurrentHashMap.java:4707)
	at org.apache.dubbo.config.context.ModuleConfigManager.refreshAll(ModuleConfigManager.java:180)
	at org.apache.dubbo.config.deploy.DefaultModuleDeployer.loadConfigs(DefaultModuleDeployer.java:317)
	at org.apache.dubbo.config.deploy.DefaultModuleDeployer.initialize(DefaultModuleDeployer.java:113)
	at org.apache.dubbo.config.deploy.DefaultApplicationDeployer.initModuleDeployers(DefaultApplicationDeployer.java:238)
	at org.apache.dubbo.config.deploy.DefaultApplicationDeployer.initialize(DefaultApplicationDeployer.java:211)
	at org.apache.dubbo.config.deploy.DefaultApplicationDeployer.start(DefaultApplicationDeployer.java:616)
	at org.apache.dubbo.config.bootstrap.DubboBootstrap.start(DubboBootstrap.java:226)
	at org.apache.dubbo.config.bootstrap.DubboBootstrap.start(DubboBootstrap.java:215)
	at org.apache.dubbo.samples.client.Application.main(Application.java:56)
Caused by: java.lang.IllegalStateException: Found invalid method config, the interface org.apache.dubbo.samples.api.GreetingsService not found method "sayHi123" : [<dubbo:method return="true" name="sayHi123" sent="true" timeout="1000" />]
	at org.apache.dubbo.config.AbstractInterfaceConfig.verifyMethodConfig(AbstractInterfaceConfig.java:399)
	at org.apache.dubbo.config.AbstractInterfaceConfig.lambda$processExtraRefresh$2(AbstractInterfaceConfig.java:369)
	at java.util.stream.ReferencePipeline$2$1.accept(ReferencePipeline.java:174)
	at java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1384)
	at java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:482)
	at java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:472)
	at java.util.stream.ReduceOps$ReduceOp.evaluateSequential(ReduceOps.java:708)
	at java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:234)
	at java.util.stream.ReferencePipeline.collect(ReferencePipeline.java:499)
	at org.apache.dubbo.config.AbstractInterfaceConfig.processExtraRefresh(AbstractInterfaceConfig.java:370)
	at org.apache.dubbo.config.AbstractConfig.refreshWithPrefixes(AbstractConfig.java:735)
	at org.apache.dubbo.config.ReferenceConfigBase.preProcessRefresh(ReferenceConfigBase.java:140)
	at org.apache.dubbo.config.AbstractConfig.refresh(AbstractConfig.java:686)

```

典型的日志内容为 `Found invalid method config`。

解决方案：

1. 检查是否正确打包，是否存在依赖包丢失的情况。（可以结合 arthas 进行诊断）
2. 如果确定该方法已经删除，请删除对应的 `MethodConfig` 并重新启动
3. 对于确实不需要使用类对象的（如网关场景），可以配置 `generic` 属性开启泛化调用，会自动忽略类检查

### 5 端口冲突
端口冲突的日志特征如下：
```
[27/02/23 02:52:00:000 CST] main ERROR deploy.DefaultApplicationDeployer:  [DUBBO] Dubbo Application[1.1](first-dubbo-provider) start failure, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195, error code: 5-14. This may be caused by , go to https://dubbo.apache.org/faq/5/14 to find instructions. 
org.apache.dubbo.rpc.RpcException: Fail to start server(url: dubbo://30.221.144.195:20880/org.apache.dubbo.samples.api.GreetingsService?anyhost=true&application=first-dubbo-provider&background=false&bind.ip=30.221.144.195&bind.port=20880&channel.readonly.sent=true&codec=dubbo&deprecated=false&dubbo=2.0.2&dubbo.tag=dev&dynamic=true&executor-management-mode=default&file-cache=true&generic=false&heartbeat=60000&interface=org.apache.dubbo.samples.api.GreetingsService&methods=sayHi&pid=63841&prefer.serialization=fastjson2,hessian2&qos.port=22223&release=3.2.0-beta.6-SNAPSHOT&service-name-mapping=true&side=provider&timestamp=1677480719543) Failed to bind NettyServer on /0.0.0.0:20880, cause: Address already in use
at org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol.createServer(DubboProtocol.java:385)
at org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol.openServer(DubboProtocol.java:350)
at org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol.export(DubboProtocol.java:331)
at org.apache.dubbo.qos.protocol.QosProtocolWrapper.export(QosProtocolWrapper.java:79)
at org.apache.dubbo.rpc.protocol.ProtocolSecurityWrapper.export(ProtocolSecurityWrapper.java:80)
at org.apache.dubbo.rpc.protocol.ProtocolListenerWrapper.export(ProtocolListenerWrapper.java:66)
at org.apache.dubbo.rpc.cluster.filter.ProtocolFilterWrapper.export(ProtocolFilterWrapper.java:61)
at org.apache.dubbo.rpc.protocol.ProtocolSerializationWrapper.export(ProtocolSerializationWrapper.java:47)
at org.apache.dubbo.rpc.Protocol$Adaptive.export(Protocol$Adaptive.java)
at org.apache.dubbo.registry.integration.RegistryProtocol.lambda$doLocalExport$3(RegistryProtocol.java:305)
at java.util.concurrent.ConcurrentHashMap.computeIfAbsent(ConcurrentHashMap.java:1660)
at org.apache.dubbo.registry.integration.RegistryProtocol.doLocalExport(RegistryProtocol.java:303)
at org.apache.dubbo.registry.integration.RegistryProtocol.export(RegistryProtocol.java:249)
at org.apache.dubbo.qos.protocol.QosProtocolWrapper.export(QosProtocolWrapper.java:79)
at org.apache.dubbo.rpc.protocol.ProtocolSecurityWrapper.export(ProtocolSecurityWrapper.java:80)
at org.apache.dubbo.rpc.protocol.ProtocolListenerWrapper.export(ProtocolListenerWrapper.java:64)
at org.apache.dubbo.rpc.cluster.filter.ProtocolFilterWrapper.export(ProtocolFilterWrapper.java:58)
at org.apache.dubbo.rpc.protocol.ProtocolSerializationWrapper.export(ProtocolSerializationWrapper.java:47)
at org.apache.dubbo.rpc.Protocol$Adaptive.export(Protocol$Adaptive.java)
at org.apache.dubbo.config.ServiceConfig.doExportUrl(ServiceConfig.java:739)
at org.apache.dubbo.config.ServiceConfig.exportRemote(ServiceConfig.java:717)
at org.apache.dubbo.config.ServiceConfig.exportUrl(ServiceConfig.java:658)
at org.apache.dubbo.config.ServiceConfig.doExportUrlsFor1Protocol(ServiceConfig.java:451)
at org.apache.dubbo.config.ServiceConfig.doExportUrls(ServiceConfig.java:433)
at org.apache.dubbo.config.ServiceConfig.doExport(ServiceConfig.java:395)
at org.apache.dubbo.config.ServiceConfig.export(ServiceConfig.java:247)
at org.apache.dubbo.config.deploy.DefaultModuleDeployer.exportServiceInternal(DefaultModuleDeployer.java:350)
at org.apache.dubbo.config.deploy.DefaultModuleDeployer.exportServices(DefaultModuleDeployer.java:322)
at org.apache.dubbo.config.deploy.DefaultModuleDeployer.startSync(DefaultModuleDeployer.java:158)
at org.apache.dubbo.config.deploy.DefaultModuleDeployer.start(DefaultModuleDeployer.java:139)
at org.apache.dubbo.config.deploy.DefaultApplicationDeployer.startModules(DefaultApplicationDeployer.java:681)
at org.apache.dubbo.config.deploy.DefaultApplicationDeployer.doStart(DefaultApplicationDeployer.java:645)
at org.apache.dubbo.config.deploy.DefaultApplicationDeployer.start(DefaultApplicationDeployer.java:618)
at org.apache.dubbo.config.bootstrap.DubboBootstrap.start(DubboBootstrap.java:226)
at org.apache.dubbo.config.bootstrap.DubboBootstrap.start(DubboBootstrap.java:215)
at org.apache.dubbo.samples.provider.Application.main(Application.java:52)
Caused by: org.apache.dubbo.remoting.RemotingException: Failed to bind NettyServer on /0.0.0.0:20880, cause: Address already in use
at org.apache.dubbo.remoting.transport.AbstractServer.<init>(AbstractServer.java:75)
at org.apache.dubbo.remoting.transport.netty4.NettyServer.<init>(NettyServer.java:85)
at org.apache.dubbo.remoting.transport.netty4.NettyTransporter.bind(NettyTransporter.java:35)
at org.apache.dubbo.remoting.Transporter$Adaptive.bind(Transporter$Adaptive.java)
at org.apache.dubbo.remoting.Transporters.bind(Transporters.java:55)
at org.apache.dubbo.remoting.exchange.support.header.HeaderExchanger.bind(HeaderExchanger.java:52)
at org.apache.dubbo.remoting.exchange.Exchangers.bind(Exchangers.java:69)
at org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol.createServer(DubboProtocol.java:383)
... 35 more
Caused by: java.net.BindException: Address already in use
at sun.nio.ch.Net.bind0(Native Method)
at sun.nio.ch.Net.bind(Net.java:444)
at sun.nio.ch.Net.bind(Net.java:436)
at sun.nio.ch.ServerSocketChannelImpl.bind(ServerSocketChannelImpl.java:225)
at io.netty.channel.socket.nio.NioServerSocketChannel.doBind(NioServerSocketChannel.java:141)
at io.netty.channel.AbstractChannel$AbstractUnsafe.bind(AbstractChannel.java:562)
at io.netty.channel.DefaultChannelPipeline$HeadContext.bind(DefaultChannelPipeline.java:1334)
at io.netty.channel.AbstractChannelHandlerContext.invokeBind(AbstractChannelHandlerContext.java:600)
at io.netty.channel.AbstractChannelHandlerContext.bind(AbstractChannelHandlerContext.java:579)
at io.netty.channel.DefaultChannelPipeline.bind(DefaultChannelPipeline.java:973)
at io.netty.channel.AbstractChannel.bind(AbstractChannel.java:260)
at io.netty.bootstrap.AbstractBootstrap$2.run(AbstractBootstrap.java:356)
at io.netty.util.concurrent.AbstractEventExecutor.runTask(AbstractEventExecutor.java:174)
at io.netty.util.concurrent.AbstractEventExecutor.safeExecute(AbstractEventExecutor.java:167)
at io.netty.util.concurrent.SingleThreadEventExecutor.runAllTasks(SingleThreadEventExecutor.java:470)
at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:569)
at io.netty.util.concurrent.SingleThreadEventExecutor$4.run(SingleThreadEventExecutor.java:997)
at io.netty.util.internal.ThreadExecutorMap$2.run(ThreadExecutorMap.java:74)
at io.netty.util.concurrent.FastThreadLocalRunnable.run(FastThreadLocalRunnable.java:30)
at java.lang.Thread.run(Thread.java:748)
```

典型的日志内容为 `Address already in use`。

解决方案：

1. 检查本地是否有其他进程已经占用了端口（可以基于 `lsof -i:20880` 、`netstat -ano | grep 20880` 等命令排查）
2. 如果本地启动多个 Dubbo 进程，请给不同的进程指定不同的 `dubbo.protocol.port` 。或者指定为 `-1`，Dubbo 将自动寻找一个可以使用的端口进行绑定。
