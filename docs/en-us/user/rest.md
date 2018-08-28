Part 1
Part 2
Part 3
##Part 4
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
## REST FAQ

------

### Can Dubbo REST services be integrated with Dubbo Registry and Monitor?

Yes, and it will integrate automatically. That is, all the REST services you develop in Dubbo are automatically registered to the Registry and Monitor, by which you can managed your services.
However, many of the service governance operations in the Registry can only be fully functional when the REST consumer is based on Dubbo. If the consumer side is non-Dubbo, it is naturally not managed by the Registry, so that many of the operations will not work for the consumer.



### How to implement load balancing and failover in Dubbo REST?

If the consumer side of Dubbo REST is based on Dubbo, then Dubbo REST is basically the same as other Dubbo remote call protocols: Dubbo framework transparently performs load balancing, failover, etc. on the consumer side.
If the consumer side of Dubbo REST is non-Dubbo or even non-Java, it is better to configure the soft load balancing mechanism on the service provider. Currently, you can consider LVS, HAProxy, Nginx, and so on to achieve load balancing for HTTP requests.


### Can overloaded method in JAX-RS maps to the same URL address?

http://stackoverflow.com/questions/17196766/can-resteasy-choose-method-based-on-query-params

### Can a POST method in JAX-RS receive multiple parameters?

http://stackoverflow.com/questions/5553218/jax-rs-post-multiple-objects


## The shortcomings of Dubbo's current system (related to REST)
---

I think there are obviously a lot of deficiencies in Dubbo's current system. Here are a few REST-related issues that affect users (not including internal implementation issues) for reference and comments, which can help prepare for the refactoring later.


### Invasiveness of RpcContext

We have already mentioned the intrusiveness of RpcContext(See above). Because it uses a singleton to access context information, which is completely inconsistent with the general style of spring applications as well as not conducive to application extension and unit testing. In the future, we may inject an interface with dependency injection, and then use it to access the context information in ThreadLocal.

### limitations of Protocol configuration

Dubbo supports multiple remote call methods, but all call methods are configured with <Dubbo:protocol/>,  for example:
```xml
<Dubbo:protocol name="Dubbo" port="9090" server="netty" client="netty" codec="Dubbo" serialization="hessian2"
    charset="UTF-8" threadpool="fixed" threads="100" queues="0" iothreads="9" buffer="8192" accepts="1000" payload="8388608"/>
```
Dubbo supports multiple remote call methods, but all call methods are configured with <Dubbo:protocol/>,  for example:
In fact, many of the above properties are uniquely held by the Dubbo RPC remote call method and many other remote call methods in Dubbo do not support server, client, codec, iothreads, accepts, payload, etc. (of course, some are not supported because of limited conditions, some have no need to be supported at all). This adds a lot of confusions to users when they use Dubbo, and they actually do not know that some attributes (such as performance tuning) will not work after adding them.


On the other hand, various remote call methods often have a large number of unique configuration requirements, especially as we gradually add much richer and more advanced functions to each kind of remote call method, which cause the expands in <protocol/> attributes inevitably (for example, we have added keepalive and extension two attributes in REST at the moment) and then lead to bloated <protocol/> and user confusion.

Of course, there is a way to expand <protocol/> in Dubbo by using <Dubbo:parameter/>, but this method is obviously very limited, the usage is complicated and the schema verification is lacking.
So that the best method is to set your own protocol elements for each remote call, such as <protocol-Dubbo/>, <protocol-rest/>, etc. Each element specifies its own attributes using XML Schema. (Of course, it is best to use common attributes between a variety of remote call methods)
In this way, a freer way can be used when doing the extension configuration mentioned above, so that it can be much clearer and more extensible (the following is just an example, of course there may be a better way):

```xml
<Dubbo:protocol-rest port="8080">
    <Dubbo:extension>someInterceptor</Dubbo:extension>
    <Dubbo:extension>someFilter</Dubbo:extension>
    <Dubbo:extension>someDynamicFeature</Dubbo:extension>
    <Dubbo:extension>someEntityProvider</Dubbo:extension>
</Dubbo:protocol-rest>
```

### XML naming does not conform to the spring specification

A lot of naming in XML configuration of Dubbo dose not conform to the spring specification, such as:
```xml
<Dubbo:protocol name="Dubbo" port="9090" server="netty" client="netty"

codec="Dubbo" serialization="hessian2"
    charset="UTF-8" threadpool="fixed" threads="100" queues="0" iothreads="9" buffer="8192" accepts="1000" payload="8388608"/>
```
The above threadpool should be changed to thread-pool, iothreads should be changed to io-threads, and words should be separated by "-". While this may seem like a minor issue, it also involves readability, especially scalability, because sometimes we will inevitably use more words to describe XML elements and attributes.

In fact, Dubbo itself also recommended to follow the naming convention of spring to XML.


## Best practices of REST
---
TODO



## Performance benchmark
---

### Test Environment

Roughly as follows:

 - 4-core Intel(R) Xeon(R) CPU E5-2603 0 @ 1.80GHz
 - 8G memory
 - The network between servers passes through a 100 Mbps switch
 - CentOS 5
 - JDK 7
 - Tomcat 7
 - JVM parameter -server -Xms1g -Xmx1g -XX:PermSize=64M -XX:+UseConcMarkSweepGC


### Test Script

Similar to Dubbo's own benchmarks:
10 concurrent clients send requests continuously:
• Pass in nested complex objects (single data is small), do nothing and return
• Pass in a 50K string, do nothing and return (TODO: the result is not listed yet)
Excute a five-minute performance test. (Reference to Dubbo's own test considerations: "Mainly consider the serialization and performance of network IO, so that the server side does not have any business logic. Take 10 to run simultaneously because of the consideration that the bottleneck can be hit first when the high CPU usage rate is reached by HTTP protocol under the high concurrency situation.")




### Test Result
The following results are mainly from the comparison between to the two remote call methods, REST and Dubbo RPC which are configured differently, for example:

 - “REST: Jetty + XML + GZIP” means: Test REST, use jetty server and XML data format, and enable GZIP compression.
 - “Dubbo: hessian2” means: test Dubbo RPC and use hessian2 serialization.

The results for complex objects are as follows (the smaller Response Time and the larger TPS, the better results):

|Remote Call Mode |Average Response Time |Average TPS（Num of transactions per second）|
| ------ | ------ | ------ |
|REST: Jetty + JSON | 7.806	| 1280|
|REST: Jetty + JSON + GZIP	| TODO|	TODO|
|REST: Jetty + XML |	TODO|	TODO|
|REST: Jetty + XML + GZIP|	TODO|	TODO|
|REST: Tomcat + JSON|	2.082|	4796|
|REST: Netty + JSON|	2.182|	4576|
|Dubbo: FST|	1.211|	8244|
|Dubbo: kyro|	1.182|	8444|
|Dubbo: Dubbo serialization|	1.43|	6982|
|Dubbo: hessian2|	1.49|	6701|
|Dubbo: fastjson|	1.572|	6352



Just a brief summary of the current results:

 - Dubbo RPC (especially when based on efficient java serialization methods such as kryo and fst) has a significant advantage response time and throughput over REST. Dubbo RPC is preferred in the intranet Dubbo systems.
 - When choosinf REST implementation, tomcat7 and netty are optimal (of course, the current versions of jetty and netty are lower) currently only considering performance. Tjws and sun http server performed extremely poorly in performance tests, with an average response time of more than 200ms and an average tps of only about 50 (to avoid affecting the picture effect, the results are not listed above).
 - Performance of JSON data format is better than XML in REST (data is not listed above).
 - Enabling GZIP in REST has little to do with complex objects with small data volume in the intranet, but performance has declined (data is not listed above).


## Performance Optimization Recommendations

If you deploy Dubbo REST to an external Tomcat and configure server="servlet", that is, enable external tomcat as the underlying implementation of rest server, it is best to add the following configuration to tomcat:
```xml
<Connector port="8080"

protocol="org.apache.coyote.http11.Http11NioProtocol"
               connectionTimeout="20000"
               redirectPort="8443"
               minSpareThreads="20"
               enableLookups="false"
               maxThreads="100"
               maxKeepAliveRequests="-1"
               keepAliveTimeout="60000"/>
```

Especially the configuration maxKeepAliveRequests="-1" ,which is mainly to ensure that tomcat always enables http long connection, in order to improve the performance of REST call. Note, however, that if the REST consumer side is not continuously call REST services, it is not always best to enable long connections all time. In addition, the way to always enable long connections is generally not suitable for ordinary webapps, but more suitable for such rpc-like scenarios. So that in order to get high performance, Dubbo REST applications and ordinary web applications are best not to be mixed deployment, but should use a separate instance in tomcat.


##Extended discussion
---

### Comparison among Rest, Thrift, Protobuf and so on

TODO

### Comparison between REST and traditional Webservers

TODO


### Comparison of JAX-RS Between Spring MVC

A preliminary view from http://www.infoq.com/cn/news/2014/10/Dubbox-open-source?utm_source=infoq&utm_medium=popular_links_homepage#theCommentsSection
> Thank you, in fact, for jax-rs and Spring MVC, I do not have a deep look at the rest support of Spring MVC. I would like to give you some preliminary ideas. Please correct me:

> Spring MVC also supports configuration using annotation, which actually looks very similar to jax-rs.

> Personally, I think Spring MVC is better suited to restful services of web applications, such as being invoked by AJAX, or possibly outputting HTML or something like page jump processes in applications. Spring MVC can handle both normal web page requests and rest requests at the same time. But in general, the restful service is implemented in the presentation layer or the web layer.

> But Jax-rs is more suitable for pure service-oriented applications, that is, the middle-tier services in traditional Java EE, for example, it can publish traditional EJB as restful services. In a Spring application, the bean that acts as a service in the Spring is directly published as a restful service. In general, the restful service is at the business layer, application layer, or facade layer. And MVC hierarchies and concepts are often of little value in such (back-end) applications.

> Of course, some implementations of jax-rs, such as jersey, also try to include MVC to better accommodate the web applications described above, but not as well as Spring MVC.

> In Dubbo applications, I think a lot of people prefer to publish a local Spring service bean (or manager) as a remote service directly and transparently, so that it is more straightforward to use JAX-RS here, and there is no need to introduce the MVC concept. Of course, we do not discuss whether transparent publishing of remote services is a best practice or whether to add facade things here first.

> Of course, I know that many people use Spring MVC restful to call Dubbo (spring) service to publish restful services under the situation that Dubbo does not support rest now. It’s a good method also in my opinion, but if you do not modify Spring MVC and integrate it deeply with Dubbo, restful services cannot enjoy many advanced services such as registering to the Dubbo Registry, monitoring the number of calls, TPS, response time through the Dubbo Monitor, controlling the size of the thread pool and the maximum number of connections through the unified configuration of Dubbo, and controlling the service flow, authority and frequency through Dubbo unified mode like other remote call protocol such as webservices, Dubbo rpc, hessian and so on in Dubbo system. In addition, Spring MVC only works in server side and Spring restTemplate are usually used on consumer side. If restTemplate is not integrated with Dubbo, the service can be downgraded by Dubbo client automatically or manually. If the server and consumer are all Dubbo system, you cannot use unified routing and other functions in Dubbo if the Spring rest is not deeply integrated into Dubbo through interaction of Spring and rest.

> Of course, I personally think that these things are not necessarily to be one or the other. I heard that Rod Johnson, the founder of spring usually says ‘the customer is always right,’ In fact, it is better to support both ways at the same time rather than discuss which way is better, so that originally I wrote in the document that we plan to support Spring rest annotation, but the feasibility is unknown.

##Future
---
Functions may be supported later:

 - Rest annotation for Spring MVC
 - Safety System
 - OAuth
 - Asynchronous calls
 - Gzip
 - Payload maxsize

