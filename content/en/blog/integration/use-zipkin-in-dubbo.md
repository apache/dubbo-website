---
title: "Using Zipkin in Dubbo"
linkTitle: "Using Zipkin in Dubbo"
date: 2018-06-17
tags: ["Ecosystem", "Java"]
description: >
   This article introduces how to use Zipkin for end-to-end tracing in Dubbo
---

As business grows, the scale of applications continues to expand, and traditional application architectures cannot meet demands. The transformation to a service-oriented architecture is imperative, with distributed service frameworks like Dubbo becoming essential. As the microservices concept becomes widely accepted, applications are further segmented into finer granularity, and different applications are independently managed by various development teams, resulting in a very complex distributed system. No one can clearly and timely know the overall dependency relationships within the system. When problems occur, it's also not possible to quickly identify which link in the chain fails.

Against this backdrop, Google published the paper on [Dapper](https://ai.google/research/pubs/pub36356), detailing how a distributed tracing system can address the above issues. Based on this paper, major internet companies have implemented and deployed their distributed tracing systems, notable among them being Alibaba's EagleEye. The Zipkin mentioned in this article is an open-source distributed tracing system by Twitter. The following sections will explain how to use Zipkin in Dubbo for distributed tracing.

## Introduction to Zipkin

Zipkin is based on the implementation described in the [Dapper](https://ai.google/research/pubs/pub36356) paper and is an open-source distributed tracing system developed by Twitter. It achieves tracing of service call chains and analysis of service execution delays by collecting information about the execution times of distributed services.

### Zipkin Architecture

![Zipkin architecture](/imgs/blog/zipkin-architecture.png)

The Zipkin Server section consists of several parts, including Collector, Storage, API, and UI, corresponding to the [openzipkin/zipkin](https://github.com/openzipkin/zipkin) project on GitHub. The components for collecting execution time information of calls in applications and reporting them reside with the applications and have implementations in various languages, among which the Java implementation is available in [openzipkin/brave](https://github.com/openzipkin/brave). In addition to the Java client implementation, OpenZipkin also provides many implementations in other languages, including Go, PHP, JavaScript, .NET, Ruby, etc., and a specific list can be referred to in Zipkin's [Existing instrumentations](https://zipkin.io/pages/tracers_instrumentation.html).

### The Working Process of Zipkin

When a user initiates a call, Zipkin's client generates a globally unique trace ID for the entire call chain at the entry point and generates a span ID for each distributed call in this chain. Spans can have parent-child nested relationships, representing the upstream and downstream relationships in distributed calls. Spans can also be siblings, indicating two sub-calls under the current call. One trace is composed of a group of spans, resembling a tree with the trace as the root node and several spans as child nodes.

![Related image](/imgs/blog/trace-sample.png)

Span boundaries are separated by invocation edges, which are represented in Zipkin using the following four annotations:

* cs - Client Sent
* sr - Server Receive
* ss - Server Send
* cr - Client Receive

Clearly, by examining the timestamps of these four annotations, it's easy to identify the time taken in different phases of a complete invocation, such as:

* sr - cs represents the time taken in the network for the request
* ss - sr represents the time taken by the server to process the request
* cr - ss represents the time taken in the network for the response
* cr - cs represents the overall time taken for an invocation

Zipkin passes trace-related information along the call chain and asynchronously reports the current call's execution time information to the Zipkin Server at the end of each invocation boundary. Upon receiving the trace information, Zipkin Server stores it. Zipkin supports storage options such as inMemory, MySQL, Cassandra, and Elasticsearch. Subsequently, Zipkin's Web UI extracts, analyzes, and displays the trace information from the storage via API access, as shown below:

![Web interface screenshot](/imgs/blog/zipkin-web-screenshot.png)

## Using Zipkin in Dubbo

Since [Brave](https://github.com/openzipkin/brave) has actively provided support for Dubbo, integrating Zipkin-based tracing in Dubbo becomes quite simple. Below, I will demonstrate how to use Zipkin in Dubbo according to the guidance on [Dubbo RPC support in Brave](https://github.com/openzipkin/brave/blob/master/instrumentation/dubbo/README.md).

### Install Zipkin Server

Follow the quick start in [Zipkin's official documentation](https://github.com/openzipkin/zipkin/tree/master/zipkin-server#quick-start) to install Zipkin, as follows:

```bash
$ curl -sSL https://zipkin.io/quickstart.sh | bash -s
$ java -jar zipkin.jar
```

The Zipkin Server installed this way uses inMemory as the storage type. When the server goes down, all collected trace information will be lost, making it unsuitable for production systems. If you intend to use it in a production environment, additional storage types need to be configured. Zipkin supports MySQL, Cassandra, and Elasticsearch. It is recommended to use Cassandra and Elasticsearch; please refer to the [official documentation](https://github.com/openzipkin/zipkin/tree/master/zipkin-server) for relevant configurations.

For demonstration purposes, this article uses inMemory storage type. After a successful startup, you should see the following message in the terminal:

```bash
$ java -jar zipkin.jar
Picked up JAVA_TOOL_OPTIONS: -Djava.awt.headless=true
                                    ********
                                  **        **
                                 *            *
                                **            **
                                **            **
                                 **          **
                                  **        **
                                    ********
                                      ****
                                      ****
        ****                          ****
     ******                           ****                                 ***
  ****************************************************************************
    *******                           ****                                 ***
        ****                          ****
                                       **
                                       **


             *****      **     *****     ** **       **     **   **
               **       **     **  *     ***         **     **** **
              **        **     *****     ****        **     **  ***
             ******     **     **        **  **      **     **   **

:: Powered by Spring Boot ::         (v2.0.5.RELEASE)

...

o.s.b.w.e.u.UndertowServletWebServer     : Undertow started on port(s) 9411 (http) with context path ''
2018-10-10 18:40:31.605  INFO 21072 --- [           main] z.s.ZipkinServer                         : Started ZipkinServer in 6.835 seconds (JVM running for 8.35)
```

Then visit http://localhost:9411 in your browser to verify the WEB interface.

### Configure Maven Dependencies

#### Import Brave Dependencies

Create a new Java project and add the Brave dependencies in your pom.xml as follows:

```xml
    <properties>
        <brave.version>5.4.2</brave.version>
        <zipkin-reporter.version>2.7.9</zipkin-reporter.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Import zipkin brave BOM file -->
            <dependency>
                <groupId>io.zipkin.brave</groupId>
                <artifactId>brave-bom</artifactId>
                <version>${brave.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            
            <!-- Import zipkin reporter BOM file -->
            <dependency>
                <groupId>io.zipkin.reporter2</groupId>
                <artifactId>zipkin-reporter-bom</artifactId>
                <version>${zipkin-reporter.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <!-- 1. brave integration for dubbo -->
        <dependency>
            <groupId>io.zipkin.brave</groupId>
            <artifactId>brave-instrumentation-dubbo-rpc</artifactId>
        </dependency>

        <!-- 2. brave spring bean support -->
        <dependency>
            <groupId>io.zipkin.brave</groupId>
            <artifactId>brave-spring-beans</artifactId>
        </dependency>

        <!-- 3. support for traceId and spanId in SLF4J's MDC (Mapped Diagnostic Context) -->
        <dependency>
            <groupId>io.zipkin.brave</groupId>
            <artifactId>brave-context-slf4j</artifactId>
        </dependency>

        <!-- 4. use okhttp3 as reporter -->
        <dependency>
            <groupId>io.zipkin.reporter2</groupId>
            <artifactId>zipkin-sender-okhttp3</artifactId>
        </dependency>
    </dependencies>
```

Among them:

1. Import brave-instrumentation-dubbo-rpc, Brave’s support for Dubbo: https://github.com/openzipkin/brave/blob/master/instrumentation/dubbo/README.md
2. Import brave-spring-beans, Brave’s support for Spring beans: https://github.com/openzipkin/brave/blob/master/spring-beans/README.md
3. Import brave-context-slf4j, Brave’s support for SLF4J, allowing traceId and spanId to be used in MDC: https://github.com/openzipkin/brave/blob/master/context/slf4j/README.md
4. Import zipkin-sender-okhttp3, using okhttp3 to report data: https://github.com/openzipkin/zipkin-reporter-java

#### Import Dubbo Related Dependencies

The relevant dependencies for Dubbo include Dubbo itself and the Zookeeper client. In the example below, we will use an independent Zookeeper Server for service discovery.

```xml
    <dependencies>
        <!-- 1. Zookeeper client dependency -->
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-framework</artifactId>
            <version>2.12.0</version>
            <exclusions>
                <exclusion>
                    <groupId>io.netty</groupId>
                    <artifactId>netty</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <!-- 2. Dubbo dependency -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>dubbo</artifactId>
            <version>2.6.2</version>
        </dependency>
    </dependencies>
```

Where:

1. Dubbo here depends on an independent Zookeeper Server for service discovery, with Curator as the client used.
2. Introduces the dependency for the Dubbo framework, which should generally work with any version of 2.6; we are using version 2.6.2 here.

### Implementation

The scenario we are constructing is a service dependency chain with two nodes: when a Dubbo client calls Service A, Service A will continue to call Service B. In this example, Service A is the greeting service, and its downstream service, Service B, is the hello service.

#### Define Service Interfaces

First, two service interfaces, GreetingService and HelloService, need to be defined.

1. com.alibaba.dubbo.samples.api.GreetingService

    ```java
    package com.alibaba.dubbo.samples.api;

    public interface GreetingService {
        String greeting(String message);
    }
    ```

2. com.alibaba.dubbo.samples.api.HelloService

   ```java
   package com.alibaba.dubbo.samples.api;
   
   public interface HelloService {
       String hello(String message);
   }
   ```

#### Implement Service Interfaces

To differentiate, all implementation code related to HelloService is placed under the hello subpackage, and similarly for GreetingService, it is placed under the greeting subpackage.

1. Implement com.alibaba.dubbo.samples.api.HelloService

    ```java
    package com.alibaba.dubbo.samples.service.hello;

    import com.alibaba.dubbo.samples.api.HelloService;

    import java.util.Random;

    public class HelloServiceImpl implements HelloService {
        @Override
        public String hello(String message) {
            try {
                // Simulate business logic processing time with sleep
                Thread.sleep(new Random(System.currentTimeMillis()).nextInt(1000));
            } catch (InterruptedException e) {
                // no op
            }
            return "hello, " + message;
        }
    }
    ```

2. Implement com.alibaba.dubbo.samples.api.GreetingService

   ```java
   package com.alibaba.dubbo.samples.service.greeting;
   
   import com.alibaba.dubbo.samples.api.GreetingService;
   import com.alibaba.dubbo.samples.api.HelloService;
   
   import java.util.Random;
   
   public class GreetingServiceImpl implements GreetingService {
   	// Downstream dependency service, which gets the HelloService proxy from spring container at runtime
       private HelloService helloService;
   
       public void setHelloService(HelloService helloService) {
           this.helloService = helloService;
       }
   
       @Override
       public String greeting(String message) {
           try {
               // Simulate business logic processing time with sleep
               Thread.sleep(new Random(System.currentTimeMillis()).nextInt(1000));
           } catch (InterruptedException e) {
               // no op
           }
           return "greeting, " + helloService.hello(message);
       }
   }
   ```

   It is important to note that the implementation of GreetingServiceImpl declares a member variable of type HelloService, and in the greeting method, after executing its own logic, it calls the hello method of HelloService. The implementation of helloService will be injected by an external source at runtime; the injected instance is not HelloServiceImpl but a remote call proxy of HelloService. This way, it achieves invoking another remote Dubbo service within a Dubbo service. From a tracing perspective, the client call to GreetingService is one span, the call from GreetingService to HelloService is another span, and the two have a parent-child relationship, belonging to the same trace and the same call chain.

   Additionally, in the implementations of GreetingServiceImpl and HelloServiceImpl, we use Thread.sleep to simulate processing time to better display in the Zipkin UI.

#### Configuration

To focus on demonstrating how to use Zipkin, this article does not adopt more advanced technologies in configuration and programming models but instead uses the most traditional Spring XML configuration method to help readers understand. Readers can refer to the relevant documentation for Dubbo and Zipkin for more advanced annotations or Spring Boot configurations.

1. Expose the HelloService

   Add the following configuration in resources/spring/hello-service.xml to expose HelloServiceImpl as a Dubbo service:

   * Uses the locally launched Zookeeper Server as the registration center, with the address as the default zookeeper://127.0.0.1:2181.
   * Exposes the service using Dubbo's native service on port 20880.
   * Registers HelloServiceImpl as a Spring Bean with id `helloService`, allowing it to be referenced later in `<dubbo:service>`.
   * Exposes HelloServiceImpl as a Dubbo service through `<dubbo:service>`.

   ```xml
       <!-- Define the application name for HelloService -->
       <dubbo:application name="hello-service-provider"/>
   
       <!-- Specify the registry address -->
       <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
   
       <!-- Use Dubbo's native protocol to expose service on port 20880 -->
       <dubbo:protocol name="dubbo" port="20880"/>
   
       <!-- Declare the implementation of HelloServiceImpl as a spring bean -->
       <bean id="helloService" class="com.alibaba.dubbo.samples.service.hello.HelloServiceImpl"/>
   
       <!-- Declare HelloServiceImpl as a Dubbo service -->
       <dubbo:service interface="com.alibaba.dubbo.samples.api.HelloService" ref="helloService"/>
   ```

2. Add Zipkin related configuration

   Add Zipkin related configurations in resources/spring/hello-service.xml:

   * Modify the configuration for service exposure to add Zipkin's tracing filter to Dubbo's filter chain.
   * Configure Zipkin's sender and tracing Spring beans according to the documentation at https://github.com/openzipkin/brave/blob/master/spring-beans/README.md.

   ```xml
       <!-- 1. Modify Dubbo service exposure configuration to add the zipkin tracing filter in the filter chain -->
       <dubbo:service interface="com.alibaba.dubbo.samples.api.HelloService" ref="helloService" filter="tracing"/>
   
       <!-- 2. Zipkin related configurations -->
       <!-- Use OKHttp to send trace information to Zipkin Server. Here, the Zipkin Server runs locally -->
       <bean id="sender" class="zipkin2.reporter.beans.OkHttpSenderFactoryBean">
           <property name="endpoint" value="http://localhost:9411/api/v2/spans"/>
       </bean>
   
       <bean id="tracing" class="brave.spring.beans.TracingFactoryBean">
           <property name="localServiceName" value="hello-service"/>
           <property name="spanReporter">
               <bean class="zipkin2.reporter.beans.AsyncReporterFactoryBean">
                   <property name="sender" ref="sender"/>
                   <!-- wait up to half a second for any in-flight spans on close -->
                   <property name="closeTimeout" value="500"/>
               </bean>
           </property>
           <property name="currentTraceContext">
               <bean class="brave.spring.beans.CurrentTraceContextFactoryBean">
                   <property name="scopeDecorators">
                       <bean class="brave.context.slf4j.MDCScopeDecorator" factory-method="create"/>
                   </property>
               </bean>
           </property>
       </bean>
   ```

3. Add the startup class for HelloService

   In com.alibaba.dubbo.samples.service.hello.Application, use ClassPathXmlApplicationContext to read spring/hello-service.xml configuration to initialize a Spring context and start it.

   ```java
   package com.alibaba.dubbo.samples.service.hello;
   
   import org.springframework.context.support.ClassPathXmlApplicationContext;
   
   import java.io.IOException;
   
   public class Application {
       public static void main(String[] args) throws IOException {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/hello-service.xml");
           context.start();
   
           System.out.println("Hello service started");
           // press any key to exit
           System.in.read();
       }
   }
   ```

4. Expose the GreetingService and use Zipkin

   Configure GreetingService in resources/spring/greeting-service.xml. The relevant steps are similar to HelloService and will not be repeated, focusing on how to configure the dependency for the downstream service in GreetingService. The complete XML configuration is as follows:

   ```xml
   <beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
          xmlns="http://www.springframework.org/schema/beans"
          xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
          http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
   
       <!-- 1. Define the application name for GreetingService -->
       <dubbo:application name="greeting-service-provider"/>
   
       <!-- 2. Specify the registry address -->
       <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
   
        <!-- 3. Use Dubbo's native protocol to expose service on port 20881 -->
       <dubbo:protocol name="dubbo" port="20881"/>
       
       <!-- 4. Declare the remote proxy for HelloService and add the tracing filter in Dubbo's filter chain -->
       <dubbo:reference id="helloService" check="false" interface="com.alibaba.dubbo.samples.api.HelloService" filter="tracing"/>
       
       <!-- 5. Declare GreetingServiceImpl as a Spring bean and wire the HelloService remote proxy into it -->
       <bean id="greetingService" class="com.alibaba.dubbo.samples.service.greeting.GreetingServiceImpl">
           <property name="helloService" ref="helloService"/>
       </bean>
   
       <!-- 6. Declare GreetingServiceImpl as a Dubbo service and add the tracing filter in Dubbo's filter chain -->
       <dubbo:service interface="com.alibaba.dubbo.samples.api.GreetingService" ref="greetingService" filter="tracing"/>
   
       <!-- 7. Zipkin related configuration -->
       <bean id="sender" class="zipkin2.reporter.beans.OkHttpSenderFactoryBean">
           <property name="endpoint" value="http://localhost:9411/api/v2/spans"/>
       </bean>
   
       <bean id="tracing" class="brave.spring.beans.TracingFactoryBean">
           <property name="localServiceName" value="greeting-service"/>
           <property name="spanReporter">
               <bean class="zipkin2.reporter.beans.AsyncReporterFactoryBean">
                   <property name="sender" ref="sender"/>
                   <!-- wait up to half a second for any in-flight spans on close -->
                   <property name="closeTimeout" value="500"/>
               </bean>
           </property>
           <property name="currentTraceContext">
               <bean class="brave.spring.beans.CurrentTraceContextFactoryBean">
                   <property name="scopeDecorators">
                       <bean class="brave.context.slf4j.MDCScopeDecorator" factory-method="create"/>
                   </property>
               </bean>
           </property>
       </bean>
   </beans>
   ```

   This configuration is similar to the above HelloService. Notable points to pay attention to include:

   * In step 3, the service needs to be exposed on a different port to avoid conflicts with HelloService; in this example, port 20881 is chosen.

   * In step 4, first declare the remote proxy for HelloService, then in step 5, wire it into GreetingService to complete the declaration of the upstream and downstream service dependencies.

   Add the startup class for GreetingService, similar to HelloService, initializing a new Spring context based on spring/greeting-service.xml configuration.

   ```java
   package com.alibaba.dubbo.samples.service.greeting;
   
   import org.springframework.context.support.ClassPathXmlApplicationContext;
   
   import java.io.IOException;
   
   public class Application {
       public static void main(String[] args) throws IOException {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/greeting-service.xml");
           context.start();
   
           System.out.println("Greeting service started");
           // press any key to exit
           System.in.read();
       }
   }
   ```

5. Implement the Client

   Initialize a Spring context through resources/spring/client.xml, from which to get the remote proxy of GreetingService and initiate a remote call.

   ```java
   package com.alibaba.dubbo.samples.client;
   
   import com.alibaba.dubbo.samples.api.GreetingService;
   import org.springframework.context.support.ClassPathXmlApplicationContext;
   
   public class Application {
   
       public static void main(String[] args) {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/client.xml");
           context.start();
           // Obtain the remote proxy and initiate the call
           GreetingService greetingService = (GreetingService) context.getBean("greetingService");
           System.out.println(greetingService.greeting("world"));
       }
   }
   ```

   The configuration in resource/spring/client.xml is similar to the Dubbo service configuration, primarily focusing on the configuration of the remote proxy and Zipkin.

```xml
   <beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
          xmlns="http://www.springframework.org/schema/beans"
          xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
          http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
   
      <!-- 1. Define the application name for Dubbo client -->
       <dubbo:application name="dubbo-client"/>
   
       <!-- 2. Specify the registry address -->
       <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
   
       <!-- 3. Declare the remote proxy for GreetingService and add the tracing filter in Dubbo's filter chain -->
       <dubbo:reference id="greetingService" check="false" interface="com.alibaba.dubbo.samples.api.GreetingService" filter="tracing"/>
   
       <!-- 4. Zipkin related configuration -->
       <bean id="sender" class="zipkin2.reporter.beans.OkHttpSenderFactoryBean">
           <property name="endpoint" value="http://localhost:9411/api/v2/spans"/>
       </bean>
   
       <bean id="tracing" class="brave.spring.beans.TracingFactoryBean">
           <property name="localServiceName" value="client"/>
           <property name="spanReporter">
               <bean class="zipkin2.reporter.beans.AsyncReporterFactoryBean">
                   <property name="sender" ref="sender"/>
                   <!-- wait up to half a second for any in-flight spans on close -->
                   <property name="closeTimeout" value="500"/>
               </bean>
           </property>
           <property name="currentTraceContext">
               <bean class="brave.spring.beans.CurrentTraceContextFactoryBean">
                   <property name="scopeDecorators">
                       <bean class="brave.context.slf4j.MDCScopeDecorator" factory-method="create"/>
                   </property>
               </bean>
           </property>
       </bean>
   </beans>
```

The final project directory structure is as follows:

![zipkin dubbo project structure](/imgs/blog/zipkin-dubbo-project.png)

### Running

Now let’s run the entire chain and see the effect of Zipkin's tracing.

#### Start Zookeeper Server

Execute the following command to start a Zookeeper Server locally. If you haven't installed it, please download from the [ZooKeeper website](https://zookeeper.apache.org):

```bash
$ zkServer start
```

#### Start Zipkin Server

Execute the following command to start a Zipkin Server locally:

```bash
$ curl -sSL https://zipkin.io/quickstart.sh | bash -s
$ java -jar zipkin.jar
```

#### Start HelloService

Use the following command to start HelloService, or you can also start it directly in the IDE:

```bash
$ mvn exec:java -Dexec.mainClass=com.alibaba.dubbo.samples.service.hello.Application
```

After a successful startup, you should be able to see "Hello service started" in the terminal.

#### Start GreetingService

Use the following command to start GreetingService, or run it directly in the IDE:

```bash
$ mvn exec:java -Dexec.mainClass=com.alibaba.dubbo.samples.service.greeting.Application
```

You should see "Greeting service started" in the terminal after successful startup.

#### Run the Dubbo Client

Use the following command to run the Dubbo client, which will make a remote call to GreetingService, or run it directly in the IDE:

```bash
$ mvn exec:java -Dexec.mainClass=com.alibaba.dubbo.samples.client.Application
```

Upon successful execution, the client will output "greeting, hello, world" in the terminal.

#### Trace the chain

Open the browser and visit "http://localhost:9411" and click the "Find Traces" button to search; you can find the trace of the call just initiated, shown as below:

![zipkin trace](/imgs/blog/zipkin-trace.png)

You can further select each span to view the details within the invocation boundaries. For example, the details of the hello-service span are as follows:

![zipkin span](/imgs/blog/zipkin-span.png)

## Conclusion

This article introduced the basic concept of tracing and the fundamental usage of Zipkin, then built the simplest call chain using Dubbo and incorporated Zipkin for end-to-end tracing. Since Zipkin has good support for Dubbo, the entire integration process is quite simple and clear.

Zipkin's support for Dubbo is built on Dubbo's filter extension mechanism. Interested readers can learn about its implementation details through https://github.com/openzipkin/brave/blob/master/instrumentation/dubbo/src/main/java/brave/dubbo/TracingFilter.java.

The examples mentioned in this article can be found in the "dubbo-samples-zipkin" submodule from https://github.com/dubbo/dubbo-samples. Additionally, starting from version 2.0 of spring-cloud-sleuth, Dubbo is officially supported, and related articles and examples are planned to be provided later.

