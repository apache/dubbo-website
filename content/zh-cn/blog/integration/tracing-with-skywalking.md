---
title: "使用Apache Skywalking (Incubator) 做分布式跟踪"
linkTitle: "使用Apache Skywalking (Incubator) 做分布式跟踪"
date: 2019-08-11
tags: ["生态", "Java"]
description: >
   本文介绍如何使用 Apache Skywalking 对 Dubbo 应用做分布式链路追踪。
---

## Apache Skywalking(Incubator)简介
[Apache Skywalking(Incubator)](https://github.com/apache/skywalking) 专门为微服务架构和云原生架构系统而设计并且支持分布式链路追踪的APM系统。[Apache Skywalking(Incubator)](https://github.com/apache/skywalking)通过加载探针的方式收集应用调用链路信息，并对采集的调用链路信息进行分析，生成应用间关系和服务间关系以及服务指标。[Apache Skywalking (Incubating)](https://github.com/apache/skywalking)目前支持多种语言，其中包括[Java](https://github.com/apache/skywalking)，[.Net Core](https://github.com/OpenSkywalking/skywalking-netcore)，[Node.js](https://github.com/OpenSkywalking/skywalking-nodejs)和[Go](https://github.com/SkyAPM/go2sky)语言。

目前Skywalking已经支持从6个可视化维度剖析分布式系统的运行情况。总览视图是应用和组件的全局视图，其中包括组件和应用数量，应用的告警波动，慢服务列表以及应用吞吐量；拓扑图从应用依赖关系出发，展现整个应用的拓扑关系；应用视图则是从单个应用的角度，展现应用的上下游关系，TopN的服务和服务器，JVM的相关信息以及对应的主机信息。服务视图关注单个服务入口的运行情况以及此服务的上下游依赖关系，依赖度，帮助用户针对单个服务的优化和监控；调用链展现了调用的单次请求经过的所有埋点以及每个埋点的执行时长；告警视图根据配置阈值针对应用、服务器、服务进行实时告警。

## Dubbo与Apache Skywalking(Incubator)
### 编写Dubbo示例程序
Dubbo实例程序已上传到[Github仓库](https://github.com/SkywalkingTest/dubbo-trace-example)中。方便大家下载使用。
#### API工程
服务接口：

```
package org.apache.skywalking.demo.interfaces;

public interface HelloService {
	String sayHello(String name);
}
```

#### Dubbo服务提供工程

```
package org.apache.skywalking.demo.provider;

@Service(version = "${demo.service.version}",
	application = "${dubbo.application.id}",
	protocol = "${dubbo.protocol.id}",
	registry = "${dubbo.registry.id}", timeout = 60000)
public class HelloServiceImpl implements HelloService {

	public String sayHello(String name) {
		LockSupport.parkNanos(TimeUnit.SECONDS.toNanos(1));
		return "Hello, " + name;
	}

}
```

#### Consumer工程

```
package org.apache.skywalking.demo.consumer;

@RestController
public class ConsumerController {

	private static int COUNT = 0;

	@Reference(version = "${demo.service.version}",
		application = "${dubbo.application.id}",
		url = "dubbo://localhost:20880", timeout = 60000)
	private HelloService helloService;

	@GetMapping("/sayHello/{name}")
	public String sayHello(@PathVariable(name = "name") String name) {
		if ((COUNT++) % 3 == 0){
			throw new RuntimeException();
		}
		LockSupport.parkNanos(TimeUnit.SECONDS.toNanos(2));
		return helloService.sayHello(name);
	}
}
```

### 部署Apache Skywalking(Incubator)
Apache Skywalking(Incubator）共提供两种部署模式：单节点模式和集群模式，以下为单节点模式部署步骤，集群模式部署详情参考[文档](https://skywalking.apache.org/docs/main/next/en/setup/backend/backend-setup/)。
#### 依赖第三方组件
1. JDK8+
2. Elasticsearch 5.x
#### 部署步骤
1. 下载[ Apache Skywalking Collector](http://skywalking.apache.org/downloads/)
2. 部署ElasticSearch
	* 修改elasticsearch.yml文件，并设置`cluster.name`设置成`CollectorDBCluster`。此名称需要和collector配置文件一致。
	 * 修改ES配置`network.host`值，将`network.host`的值修改成`0.0.0.0`。
	* 启动Elasticsearch
3. 解压并启动Skywalking Collector。运行`bin/startup.sh`命令即可启动Skywalking Collector
#### 启动示例程序
在启动示例程序之前，执行编译打包的命令:

```
./mvnw clean package
```

#### 启动服务提供端

```
java -jar -javaagent:$AGENT_PATH/skywalking-agent.jar -Dskywalking.agent.application_code=dubbo-provider -Dskywalking.collector.servers=localhost:10800 dubbo-provider/target/dubbo-provider.jar
```

#### 启动服务消费端

```
java -jar -javaagent:$AGENT_PATH/skywalking-agent.jar -Dskywalking.agent.application_code=dubbo-consumer -Dskywalking.collector.servers=localhost:10800 dubbo-consumer/target/dubbo-consumer.jar 
```

#### 访问消费端提供的服务

```
curl http://localhost:8080/sayHello/test
```

## Skywalking监控截图：

### 首页

![/admin-guide/images/skywalking-dashboard.png](/imgs/blog/skywalking-dashboard.png)

### 拓扑图
![/admin-guide/images/skywalking-topology.png](/imgs/blog/skywalking-topology.png)

### 应用视图
![/admin-guide/images/skywalking-application.png](/imgs/blog/skywalking-application.png)

JVM信息
![/admin-guide/images/skywalking-application_instance.png](/imgs/blog/skywalking-application_instance.png)

###  服务视图

服务消费端：
![/admin-guide/images/skywalking-service-consumer.png](/imgs/blog/skywalking-service-consumer.png)

服务提供端：
![/admin-guide/images/skywalking-service-provider.png](/imgs/blog/skywalking-service-provider.png)

### Trace视图
![/admin-guide/images/skywalking-trace.png](/imgs/blog/skywalking-trace.png)

Span信息：
![/admin-guide/images/skywalking-span-Info.png](/imgs/blog/skywalking-span-Info.png)

### 告警视图
![/admin-guide/images/skywalking-alarm.png](/imgs/blog/skywalking-alarm.png)

