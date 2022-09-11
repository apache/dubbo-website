---
type: docs
title: "Tracing Dubbo service with Apache Skywalking"
linkTitle: "Skywalking"
weight: 5
---

## Introduction to Apache Skywalking

[Apache Skywalking(Incubator)](https://github.com/apache/skywalking)  is the APM system that it designed for micro-services architectures and cloud native architecture systems and supports distribute tracking. [Apache skywalking (incubator)](https://github.com/apache/skywalking) collects and analyzes the trace data and generates the relationship between the application and the service metric, Apache skywalking  supports multiple languages agent, for example [Java](https://github.com/apache/skywalking),[.net core](https://github.com/OpenSkywalking/skywalking-netcore),[Node.js](https://github.com/OpenSkywalking/skywalking-nodejs) and [Go](https://github.com/SkyAPM/go2sky).

Currently, Skywalking has supported analysis the operation of distributed systems from 6 visual dimensions. The overview view is a global view of your applications and components, including the number of components and applications, application alarm fluctuations, slow service lists, and application throughput; The topology shows the topological relationship of the whole application; The application view represents the upstream and downstream relationship of the application from single application, TOP N services and servers, JVM, host and process info. The service view focuses on the operation of a single service portal and the upstream and downstream dependencies of this service and it helps the user to optimize and monitor a single service; the trace graph shows all the buried points of the invocation and the execution time of each burial point, and the alarm view is based on the configuration threshold for the application, server, service for real-time alarms

## Dubbo and Apache Skywalking

### Build the Dubbo demo  project

The Dubbo demo has been uploaded to the [GitHub repository](https://github.com/SkywalkingTest/dubbo-trace-example). 

#### API project

Service interface definition:

```java
package org.apache.skywalking.demo.interfaces;

public interface HelloService {
	String sayHello(String name);
}
```

#### Service provider project

```java
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

#### Service consumer project

```java
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

### Deploy Apache Skywalking

[Apache skywalking (Incubator)](https://github.com/apache/skywalking) offers  two deployment modes: single-node mode and cluster mode,Here is  the single-node mode deployment step, and more about how to deploy skywalking with cluster mode, please reference [document](https://skywalking.apache.org/docs/main/next/en/setup/backend/backend-setup/).

#### Third-party components

1. JDK 8+
2. Elasticsearch 5.x

#### Deployment step

1. Download [Apache Skywalking Collector](http://skywalking.apache.org/downloads/)
2. Deploy Elasticsearch service
   * Set `cluster.name` to `CollectorDBCluster`
   * Set `network.host` to `0.0.0.0`
   * Start elasticsearch service
3. Unzip and start the Skywalking Collector. Run the ' bin/startup.sh ' command to start skywalking Collector 

#### Deploy the demo

Before you deploy the demo service, please run the following command:

```bash
./mvnw clean package
```

#### Deploy the provider service

```bash
java -jar -javaagent:$AGENT_PATH/skywalking-agent.jar -Dskywalking.agent.application_code=dubbo-provider -Dskywalking.collector.servers=localhost:10800 dubbo-provider/target/dubbo-provider.jar
```

#### Deploy the consumer service

```
java -jar -javaagent:$AGENT_PATH/skywalking-agent.jar -Dskywalking.agent.application_code=dubbo-consumer -Dskywalking.collector.servers=localhost:10800 dubbo-consumer/target/dubbo-consumer.jar 
```

#### visit demo service

```bash
curl http://localhost:8080/sayHello/test
```

## Skywalking scren snapshot

### Dashboard
![/admin-guide/images/skywalking-dashboard.png](/imgs/admin/skywalking-dashboard.png)

### Topology
![/admin-guide/images/skywalking-topology.png](/imgs/admin/skywalking-topology.png)

### Application view
![/admin-guide/images/skywalking-application.png](/imgs/admin/skywalking-application.png)

JVM Information
![/admin-guide/images/skywalking-application_instance.png](/imgs/admin/skywalking-application_instance.png)

### Service view

Consumer side
![/admin-guide/images/skywalking-service-consumer.png](/imgs/admin/skywalking-service-consumer.png)

provider side
![/admin-guide/images/skywalking-service-provider.png](/imgs/admin/skywalking-service-provider.png)

### Trace
![/admin-guide/images/skywalking-trace.png](/imgs/admin/skywalking-trace.png)

Span info
![/admin-guide/images/skywalking-span-Info.png](/imgs/admin/skywalking-span-Info.png)

### Alarm view
![/admin-guide/images/skywalking-alarm.png](/imgs/admin/skywalking-alarm.png)
