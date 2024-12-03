---
aliases:
    - /en/overview/tasks/troubleshoot/start-failed/
    - /en/overview/tasks/troubleshoot/start-failed/
description: Troubleshooting ideas when a Dubbo application fails to start
linkTitle: Application Start Failure
title: Application Start Failure
type: docs
weight: 1
---



During the development and production deployment stages, applications may fail to start due to various unexpected changes. For Dubbo, startup failures usually present error messages similar to the following.

```bash
Caused by: java.lang.IllegalStateException: Dubbo Module[1.1.1] is stopping or stopped, can not start again
```

```bash
[DUBBO] Dubbo Application[1.1](first-dubbo-consumer) start failure
```

## Summary
Correctly configure log output, go back to the first error location and handle it.

## Troubleshooting Methods
### 1 Configure Log Output
Dubbo currently supports multiple log frameworks. If multiple log frameworks (such as log4j and logback) are supported in the environment, Dubbo will output log frameworks in the order of (log4j > slf4j > log4j2 > jcl).

If the expected log framework differs, logs may not output. Adjust the following configuration:

```properties
dubbo.application.logger=slf4j
```

Note: Versions 3.2.0 and above will automatically analyze log framework configurations to optimize log framework output.

### 2 Find the Real Error Message
After correctly configuring log output, search the logs for `[DUBBO] Model start failed` or `start failure` keywords to find the actual reason for Dubbo startup failure.

For example, the failure reason could be that a service subscription cannot find a provider.
```
[27/02/23 12:49:18:018 CST] main ERROR deploy.DefaultModuleDeployer:  [DUBBO] Model start failed: Dubbo Module[1.1.1] start failed: java.lang.IllegalStateException: Failed to check the status of the service org.apache.dubbo.samples.api.GreetingsService. No provider available for the service org.apache.dubbo.samples.api.GreetingsService from the url consumer://30.221.144.195/org.apache.dubbo.samples.api.GreetingsService?application=first-dubbo-consumer&background=false&dubbo=2.0.2&environment=product&executor-management-mode=default&file-cache=true&interface=org.apache.dubbo.samples.api.GreetingsService&methods=sayHi&pid=54580&register.ip=30.221.144.195&release=3.2.0-beta.6-SNAPSHOT&side=consumer&sticky=false&timestamp=1677473358611&unloadClusterRelated=false to the consumer 30.221.144.195 use dubbo version 3.2.0-beta.6-SNAPSHOT, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195, error code: 5-14. This may be caused by , go to https://dubbo.apache.org/faq/5/14 to find instructions. 
java.lang.IllegalStateException: Failed to check the status of the service org.apache.dubbo.samples.api.GreetingsService. No provider available for the service org.apache.dubbo.samples.api.GreetingsService from the url consumer://30.221.144.195/org.apache.dubbo.samples.api.GreetingsService?application=first-dubbo-consumer&background=false&dubbo=2.0.2&environment=product&executor-management-mode=default&file-cache=true&interface=org.apache.dubbo.samples.api.GreetingsService&methods=sayHi&pid=54580&register.ip=30.221.144.195&release=3.2.0-beta.6-SNAPSHOT&side=consumer&sticky=false&timestamp=1677473358611&unloadClusterRelated=false to the consumer 30.221.144.195 use dubbo version 3.2.0-beta.6-SNAPSHOT
```

## Common Reasons
This section will cover common startup failure reasons in Dubbo.
### 1 Consumer Side Address Not Found
The log signature for the consumer side address not found is as follows:

```
Failed to check the status of the service ***. No provider available for the service *** from the url
```

Solution: If the service is not found, first self-check whether the service has been completed and deployed, then confirm whether it has been registered in the registry, check the server release status if registered, and check consumer subscription status if not registered. Any step failing will lead to an exception.

For more troubleshooting ideas on address not found, refer to [Address Not Found Exception](../no-provider).

### 2 Configuration Exception
#### 2.1 Application Name Not Configured
The log signature for the application name not configured is as follows:

```
[27/02/23 02:23:14:014 CST] main ERROR deploy.DefaultApplicationDeployer:  [DUBBO] Dubbo Application[1.1](unknown) start failure, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195, error code: 5-14. This may be caused by , go to https://dubbo.apache.org/faq/5/14 to find instructions. 
java.lang.IllegalStateException: There's no ApplicationConfig specified.
```

Typical log content is `There's no ApplicationConfig specified`.

Solution:

1. Spring Boot project sets `dubbo.application.name` and restarts.
2. Spring project sets `<dubbo:application name="xxx">` attribute and restarts.
3. Directly using Dubbo API project needs to inject `ApplicationConfig applicationConfig = new ApplicationConfig("xxx");` attribute and restart.

#### 2.2 Duplicate Configuration Overlap
The log signature for duplicate configuration overlap is as follows:
```
Exception in thread "main" java.lang.IllegalStateException: Duplicate Configs found for ApplicationConfig, only one unique ApplicationConfig is allowed for one application. previous: <dubbo:application environment="product" name="first-dubbo-consumer" />, later: <dubbo:application environment="product" name="second-dubbo-consumer" />. According to config mode [STRICT], please remove redundant configs and keep only one.
```

Typical log content is `Duplicate Configs found for`.

Solution:

1. Spring projects usually result from injecting multiple configs, delete duplicates as indicated in the logs and restart.
2. Spring XML projects may import multiple mutually exclusive properties, delete down to one as indicated in the logs and restart.
3. Projects using Dubbo API may result from injecting multiple identical dimensions; delete down to one as indicated in the logs and restart.
4. For users unable to modify duplicate attributes, specify `dubbo.config.mode` in startup parameters as `OVERRIDE` or `IGNORE`, which represent overriding original configurations or ignoring new configurations.

Note: This exception is a new check behavior in 3.x; older versions may have arbitrary overlap issues.

### 3 Class Not Found
The log signature for class not found is as follows:
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

Typical log content is `java.lang.ClassNotFoundException`.

Solution:

1. Check for correct packaging and missing dependency packages. (Can use arthas for diagnosis)
2. For cases that genuinely don't need class objects (such as gateway scenarios), configure the `generic` attribute to enable generalized calls, which will automatically ignore class checks.

### 4 Method Not Found
The log signature for method not found is as follows:
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

Typical log content is `Found invalid method config`.

Solution:

1. Check for correct packaging and missing dependency packages. (Can use arthas for diagnosis)
2. If the method has indeed been deleted, remove the corresponding `MethodConfig` and restart.
3. For cases that genuinely don't need class objects (such as gateway scenarios), configure the `generic` attribute to enable generalized calls, which will automatically ignore class checks.

### 5 Port Conflict
The log signature for port conflict is as follows:
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

Typical log content is `Address already in use`.

Solution:

1. Check if other processes have occupied the port locally (you can use commands like `lsof -i:20880`, `netstat -ano | grep 20880`, etc. to troubleshoot).
2. If multiple Dubbo processes are started locally, assign different `dubbo.protocol.port` to different processes. Or set it to `-1`, so Dubbo will automatically find an available port for binding.

