---
title: "Using Apache Skywalking (Incubator) for Distributed Tracing"
linkTitle: "Using Apache Skywalking (Incubator) for Distributed Tracing"
date: 2019-08-11
tags: ["Ecosystem", "Java"]
description: >
   This article introduces how to use Apache Skywalking for distributed tracing of Dubbo applications.
---

## Introduction to Apache Skywalking (Incubator)
[Apache Skywalking (Incubator)](https://github.com/apache/skywalking) is an APM system designed for microservice architecture and cloud-native architecture systems that supports distributed tracing. [Apache Skywalking (Incubator)](https://github.com/apache/skywalking) collects application call chain information by loading probes and analyzes the collected call chain information to generate relationships and service metrics between applications and services. Currently, [Apache Skywalking (Incubating)](https://github.com/apache/skywalking) supports multiple languages, including [Java](https://github.com/apache/skywalking), [.Net Core](https://github.com/OpenSkywalking/skywalking-netcore), [Node.js](https://github.com/OpenSkywalking/skywalking-nodejs), and [Go](https://github.com/SkyAPM/go2sky).

Skywalking currently supports dissecting the operation of distributed systems from six visualization dimensions. The overview view provides a global view of applications and components, including the number of components and applications, alarm fluctuations, slow service lists, and application throughput; the topology map shows the entire application's topology based on application dependencies; the application view shows upstream and downstream relationships, TopN services, JVM-related information, and corresponding host information from the perspective of a single application. The service view focuses on the operating status of a single service entry and its upstream and downstream dependencies, helping users optimize and monitor individual services; the call chain shows all points of interest along with the execution duration of each point for a single request; the alarm view provides real-time alerts for applications, servers, and services based on configured thresholds.

## Dubbo and Apache Skywalking (Incubator)
### Writing Dubbo Sample Program
The Dubbo sample program has been uploaded to the [Github repository](https://github.com/SkywalkingTest/dubbo-trace-example) for your convenience.
#### API Project
Service interface:

```
package org.apache.skywalking.demo.interfaces;

public interface HelloService {
	String sayHello(String name);
}
```

#### Dubbo Service Provider Project

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

#### Consumer Project

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

### Deploying Apache Skywalking (Incubator)
Apache Skywalking (Incubator) provides two deployment modes: single-node mode and cluster mode. Below are the deployment steps for single-node mode; for details on cluster mode, refer to the [documentation](https://skywalking.apache.org/docs/main/next/en/setup/backend/backend-setup/).
#### Dependencies on Third-Party Components
1. JDK8+
2. Elasticsearch 5.x
#### Deployment Steps
1. Download [Apache Skywalking Collector](http://skywalking.apache.org/downloads/)
2. Deploy Elasticsearch
	* Modify the elasticsearch.yml file and set `cluster.name` to `CollectorDBCluster`. This name must match the collector configuration file.
	* Modify the ES configuration `network.host`, changing its value to `0.0.0.0`.
	* Start Elasticsearch.
3. Unzip and start the Skywalking Collector. Run the `bin/startup.sh` command to start the Skywalking Collector.
#### Start Sample Program
Before starting the sample program, execute the compile and package command:

```
./mvnw clean package
```

#### Start Service Provider

```
java -jar -javaagent:$AGENT_PATH/skywalking-agent.jar -Dskywalking.agent.application_code=dubbo-provider -Dskywalking.collector.servers=localhost:10800 dubbo-provider/target/dubbo-provider.jar
```

#### Start Service Consumer

```
java -jar -javaagent:$AGENT_PATH/skywalking-agent.jar -Dskywalking.agent.application_code=dubbo-consumer -Dskywalking.collector.servers=localhost:10800 dubbo-consumer/target/dubbo-consumer.jar 
```

#### Access the Service Provided by Consumer

```
curl http://localhost:8080/sayHello/test
```

## Skywalking Monitoring Screenshots:

### Home

![/admin-guide/images/skywalking-dashboard.png](/imgs/blog/skywalking-dashboard.png)

### Topology Map
![/admin-guide/images/skywalking-topology.png](/imgs/blog/skywalking-topology.png)

### Application View
![/admin-guide/images/skywalking-application.png](/imgs/blog/skywalking-application.png)

JVM Information
![/admin-guide/images/skywalking-application_instance.png](/imgs/blog/skywalking-application_instance.png)

### Service View

Service Consumer:
![/admin-guide/images/skywalking-service-consumer.png](/imgs/blog/skywalking-service-consumer.png)

Service Provider:
![/admin-guide/images/skywalking-service-provider.png](/imgs/blog/skywalking-service-provider.png)

### Trace View
![/admin-guide/images/skywalking-trace.png](/imgs/blog/skywalking-trace.png)

Span Information:
![/admin-guide/images/skywalking-span-Info.png](/imgs/blog/skywalking-span-Info.png)

### Alarm View
![/admin-guide/images/skywalking-alarm.png](/imgs/blog/skywalking-alarm.png)

