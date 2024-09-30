---
title: "Local Invocation"
linkTitle: "Local Invocation"
tags: ["Java"]
date: 2019-08-11
description: >
    When an application serves as both a service provider and a consumer of that service, it can directly initiate local calls to the services provided locally.
---

### Introduction to Local Invocation

When an application serves as both a service provider and a consumer of that service, it can directly initiate local calls to the services provided locally. Starting from version `2.2.0`, Dubbo exposes services locally using the *injvm* method by default, allowing calls to the service within the same process to prioritize local invocation.

Unlike method calls on local objects, Dubbo's local invocation goes through a Filter chain that includes both the Consumer and Provider side Filter chains. This mechanism treats local consumers and other consumers uniformly, ensuring unified monitoring and service governance.

![filter-chain](/imgs/blog/dubbo-local-call-filter.png)

Moreover, compared to remote calls, Dubbo's local invocation offers better performance by eliminating the request, response encoding/decoding, and network transmission processes.

To use Dubbo's local invocation, no special configuration is needed—just expose the service normally in Dubbo. Any service that exposes a remote service will also expose a local service via the *injvm* protocol. *injvm* is a pseudo-protocol that doesn't open external ports, intended solely for local invocation.

For example, with the following XML configuration:

```xml
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
<dubbo:protocol name="dubbo" port="20800"/>

<bean id="demoServiceTarget" class="org.apache.dubbo.samples.local.impl.DemoServiceImpl"/>

<dubbo:service interface="org.apache.dubbo.samples.local.api.DemoService" ref="demoServiceTarget"/>
<dubbo:reference id="demoService" interface="org.apache.dubbo.samples.local.api.DemoService"/>
```

The provider and consumer for the same service *DemoService* are configured simultaneously. In this case, the consumer of *DemoService* in the application will prioritize local invocation using the *injvm* protocol. The above example can be found in the dubbo-samples project source: https://github.com/apache/dubbo-samples/blob/master/dubbo-samples-local

### Fine-grained Control of Local Invocation

Local invocation can be explicitly disabled, allowing service providers to treat remote service consumers and local consumers equally. This is done by closing the exposure of the *injvm* protocol with *scope="remote"*. Thus, even local callers need to retrieve the service address list from the registry before initiating a call, aligning the process with that of remote service consumers.

```xml
<bean id="target" class="org.apache.dubbo.samples.local.impl.DemoServiceImpl"/>
<!-- Service provider specifies scope="remote" -->
<dubbo:service interface="org.apache.dubbo.samples.local.api.DemoService" ref="target" scope="remote"/>
<dubbo:reference id="demoService" interface="org.apache.dubbo.samples.local.api.DemoService"/>
```

Similarly, service consumers can also limit their invocation to prefer local or only remote calls using *scope*. For instance, the following method forces the consumer side to invoke Dubbo remotely:

```xml
<!-- Service consumer specifies scope="remote" -->
<dubbo:reference id="demoService" interface="org.apache.dubbo.samples.local.api.DemoService" scope="remote"/>
```

If both the service provider limits *scope="local"* and the consumer limits *scope="remote"*,

```xml
<!-- Service provider specifies scope="remote" -->
<dubbo:service interface="org.apache.dubbo.samples.local.api.DemoService" ref="target" scope="remote"/>
<!-- Service consumer specifies scope="local" -->
<dubbo:reference id="demoService" interface="org.apache.dubbo.samples.local.api.DemoService" scope="local"/>
```

the Dubbo invocation in the program will fail because the provider only exposes remote services to the registry without exposing the *injvm* protocol service. Local consumers, being in the same process, won't find the *injvm* service and won't subscribe to the service addresses from the remote registry either. Likewise, if the service provider specifies *scope="local"* and the consumer specifies *scope="remote"*, the invocation will fail for the same reason. The error message is as follows:

```sh
[20/03/19 05:03:18:018 CST] main  INFO config.AbstractConfig:  [DUBBO] Using injvm service org.apache.dubbo.samples.local.api.DemoService, dubbo version: 2.7.1, current host: 169.254.146.168
Exception in thread "main" org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'demoService': FactoryBean threw exception on object creation; nested exception is java.lang.IllegalStateException: Failed to check the status of the service org.apache.dubbo.samples.local.api.DemoService. No provider available for the service org.apache.dubbo.samples.local.api.DemoService from the url injvm://127.0.0.1/org.apache.dubbo.samples.local.api.DemoService?application=demo-provider&default.lazy=false&default.sticky=false&dubbo=2.0.2&interface=org.apache.dubbo.samples.local.api.DemoService&lazy=false&methods=sayHello&pid=76198&register.ip=169.254.146.168&release=2.7.1-SNAPSHOT&scope=local&side=consumer&sticky=false&timestamp=1553072598838 to the consumer 169.254.146.168 use dubbo version 2.7.1
```

### When Local Invocation Cannot Be Used

By default, local invocation is automatically enabled, and no additional configuration is necessary. It only needs to be explicitly closed when required through *scope* configuration.

However, it is specifically important to note that local invocation cannot be used in the following situations:

First, local invocation cannot be used during a generalized call.

Second, the consumer explicitly specifies the URL for direct connection calls. Of course, if the consumer specifies the *injvm* URL, the final invocation will also be local, for example:

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.samples.local.api.DemoService" url="injvm://127.0.0.1/org.apache.dubbo.samples.local.api.DemoService"/>
```

### Forcing Local Invocation

In addition to controlling local invocation behavior through *scope*, it can also be forced open or disabled with the *injvm* configuration.

```xml
<dubbo:consumer injvm="false" .../>
<dubbo:provider injvm="true" .../>
```

However, the method of configuring local invocation through *injvm* has been deprecated. Controlling through *scope* is the recommended approach.

### Summary

This article introduces the concept of local invocation and its benefits, further revealing that Dubbo's local invocation is essentially the exposure of the *injvm* protocol within the current process, which does not expose ports externally. It discusses how to control local invocation behavior in a fine-grained way through *scope* and emphasizes that the *invjm* configuration method has been deprecated and may be removed in future versions. 

