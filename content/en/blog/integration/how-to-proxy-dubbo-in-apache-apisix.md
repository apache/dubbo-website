---
title: "Using Apache APISIX to Proxy Dubbo Services (Dubbo Protocol)"
linkTitle: "From Principles to Operations, Making It Easier to Proxy Dubbo Services in Apache APISIX"
date: 2024-04-25
tags: ["Gateway", "Ecosystem", "Java"]
description: >
    This article introduces how to use Apache APISIX to proxy Dubbo services. By introducing the dubbo-proxy plugin, it can build simpler and more efficient traffic links for the backend system of the Dubbo framework.
aliases:
    - /en/overview/what/gateway/apisix/
    - /en/overview/what/gateway/higress/
---

{{% alert title="Note" color="warning" %}}
This article is only applicable to the Dubbo protocol communication scenario. If you are a Dubbo3 user, it is recommended to use the triple protocol. Please refer to [Using Apache APISIX to Proxy Dubbo Services (Triple Protocol)](/en/blog/2024/04/22/using-apache-apisix-to-proxy-dubbo-services-triple-protocol/) for specific examples.
{{% /alert %}}

[Apache APISIX](https://apisix.apache.org/) is a top-level open-source project of the Apache Software Foundation and the most active open-source gateway project currently. As a dynamic, real-time, high-performance open-source API gateway, Apache APISIX provides rich traffic management features such as load balancing, dynamic upstream, gray release, service circuit breaking, authentication, and observability.

Apache APISIX equips Apache Dubbo services with HTTP gateway capabilities based on the open-source project tengine/mod_dubbo module. With the dubbo-proxy plugin, you can easily publish Dubbo services as HTTP services.

![Architecture Diagram](/imgs/blog/apisix-plugin/1.png)

## Getting Started

### Installing APISIX

This document uses Docker to install APISIX. Make sure to install [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) locally first.

First, download the [apisix-docker](https://github.com/apache/apisix-docker) repository.

```shell
$ git clone https://github.com/apache/apisix-docker.git
$ cd apisix-docker/example
```

Since this example will connect to the Nacos registry, add the following content in the `docker-compose.yaml` file located in the `apisix-docker/example` directory:

```yaml
  nacos:
    image: nacos/nacos-server:v2.1.1
    container_name: nacos-standalone
    environment:
    - PREFER_HOST_MODE=hostname
    - MODE=standalone
    ports:
    - "8848:8848"
    - "9848:9848"
    networks:
      apisix:
```

Add Nacos registry configuration in the `config.yaml` file:

```yaml
discovery:
  nacos:
    host:
      - "http://192.168.33.1:8848"
```

Enable the dubbo-proxy plugin in the `config.yaml` file:

```yaml
# Add this in config.yaml
plugins:
  - ... # plugin you need
  - dubbo-proxy
```

> If you use the Apache APISIX version 2.11 image, you can skip the `dubbo-proxy` configuration step since the Dubbo module is already compiled in the APISIX-Base version and can be used directly.

Finally, use `docker-compose` to start APISIX: `docker-compose -p docker-apisix up -d`

### Example Description

In the following operations, we will demonstrate using the [dubbo-samples-gateway-triple-apisix](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-apisix/dubbo-samples-gateway-apisix-dubbo) project.

Before diving into the main operations, let’s briefly look at the definition, configuration, and relevant implementation of the Dubbo interface.

#### Interface Implementation Overview

```java
public interface ApisixService {

    /**
     * standard samples dubbo interface demo
     * @param context pass HTTP info
     * @return Map<String, Object> to pass to HTTP response
     **/
    Map<String, Object> apisixDubbo(Map<String, Object> httpRequestContext);
}
```

As shown above, the definition of the Dubbo interface is fixed. The `Map` in the method parameter represents some information regarding the HTTP request (such as header, body...) passed from APISIX to the Dubbo Provider. The return value `Map` represents some information about how the Dubbo Provider conveys the HTTP response to APISIX.

After the above configuration, the Consumer can access the `apisixDubbo` method through `org.apache.dubbo.samples.gateway.apisix.dubbo.api.ApisixService`. The specific implementation of the interface is as follows:

```java
public class ApisixServiceImpl implements ApisixService {
    @Override
    public Map<String, Object> apisixDubbo(Map<String, Object> httpRequestContext) {
        for (Map.Entry<String, Object> entry : httpRequestContext.entrySet()) {
            System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());
        }

        Map<String, Object> ret = new HashMap<String, Object>();
        ret.put("body", "dubbo success\n"); // HTTP response body
        ret.put("status", "200"); // HTTP response status
        ret.put("test", "123"); // HTTP response header

        return ret;
    }
}
```

In the above code, `ApisixServiceImpl` will print the received `httpRequestContext`, and return a Map object containing the specified Key to describe the HTTP response of the Dubbo request.

In the `dubbo-samples-gateway-apisix-dubbo` directory, run the following command to start the application (or choose to start the application using an IDE):

```shell
$ git clone -b main --depth 1 https://github.com/apache/dubbo-samples
$ cd dubbo-samples/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-apisix/dubbo-samples-gateway-apisix-dubbo

$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.gateway.apisix.dubbo.provider.ProviderApplication"
```

Start the consumer process to verify that the service has started normally and can be called:

```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.gateway.apisix.dubbo.consumer.ConsumerApplication"
```

### Connecting to APISIX

1. Create an upstream pointing to the Dubbo service.

```shell
curl http://127.0.0.1:9180/apisix/admin/upstreams/1  -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
    "service_name": "gateway-apisix-dubbo",
	"type": "roundrobin",
	"discovery_type": "nacos"
}'
```

2. Expose an HTTP route for the DemoService.

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1  -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
    "uris": [
        "/demo"
    ],
    "plugins": {
        "dubbo-proxy": {
            "service_name": "org.apache.dubbo.samples.gateway.apisix.dubbo.api.ApisixService",
            "method": "apisixDubbo"
        }
    },
    "upstream_id": 1
}'
```

3. Use the curl command to request Apache APISIX and check the returned result.

```shell
curl http://127.0.0.1:9080/demo  -H "Host: example.org"  -X POST --data '{"name": "hello"}'

< HTTP/1.1 200 OK
< Date: Sun, 26 Dec 2021 11:33:27 GMT
< Content-Type: text/plain; charset=utf-8
< Content-Length: 14
< Connection: keep-alive
< test: 123
< Server: APISIX/2.11.0
<
dubbo success
```

:::note Explanation
The above response contains the `test: 123` Header, and the string `dubbo success` as the Body. This is consistent with the expected effect we coded in `DemoServiceImpl`.
:::

4. Check the logs of the Dubbo Provider.

```
Key = content-length, Value = 17
Key = host, Value = example.org
Key = content-type, Value = application/x-www-form-urlencoded
Key = body, Value = [B@70754265
Key = accept, Value = */*
Key = user-agent, Value = curl/7.80.0
```

:::note Explanation
You can obtain the HTTP request's Header and Body through `httpRequestContext`. The Header will be a Map element, while the Key in the Body is a fixed string "body", and the Value represents the Byte array.
:::

### Advanced Section: Complex Scenario Example

In the above simple use case, we indeed published the Dubbo Service as an HTTP service through Apache APISIX, but the limitations during use are also very obvious. For example, the parameters and return values of the interface must both be `Map<String, Object>`.

So, what if there is an already defined interface in the project that does not conform to the above constraints? How can we expose an HTTP service through Apache APISIX?

#### Steps

For the above scenario, we can describe the Service and Method to be called and corresponding parameters in the HTTP Request Body, and then utilize Java's reflection mechanism to invoke the target method. Finally, the return value can be serialized as JSON and written into the HTTP Response Body.

This way, we can further enhance Apache APISIX's "HTTP to Dubbo" capability and apply it to all existing Dubbo Services. The specific operations can reference the following:

1. Add a Dubbo Service to the existing project to uniformly handle the transformation from HTTP to Dubbo. The method definitions are as follows:

```java
public class DubboInvocationParameter {
    private String type;
    private String value;
}

public class DubboInvocation {
    private String service;
    private String method;
    private DubboInvocationParameter[] parameters;
}

public interface HTTP2DubboService {
    Map<String, Object> invoke(Map<String, Object> context)  throws Exception;
}
```

2. Provide a service implementation and publish it as a standard Dubbo service. The gateway will forward all traffic to this service, which will complete the invocation forwarding within the backend process.

```java
@DubboService
public class HTTP2DubboServiceImpl implements HTTP2DubboService {

    @Autowired
    private ApplicationContext appContext;

    @Override
    public Map<String, Object> invoke(Map<String, Object> context) throws Exception {
        DubboInvocation invocation = JSONObject.parseObject((byte[]) context.get("body"), DubboInvocation.class);
        Object[] args = new Object[invocation.getParameters().size()];
        for (int i = 0; i < args.length; i++) {
            DubboInvocationParameter parameter = invocation.getParameters().get(i);
            args[i] = JSONObject.parseObject(parameter.getValue(), Class.forName(parameter.getType()));
        }

        Object svc = appContext.getBean(Class.forName(invocation.getService()));
        Object result = svc.getClass().getMethod(invocation.getMethod()).invoke(args);
        Map<String, Object> httpResponse = new HashMap<>();
        httpResponse.put("status", 200);
        httpResponse.put("body", JSONObject.toJSONString(result));
        return httpResponse;
    }

}
```

3. In APISIX, configure routing rules for the `HTTP2DubboService` service (this step is omitted). Next, you can initiate a call to the backend Dubbo service in a manner similar to the following:

```shell
curl http://127.0.0.1:9080/demo  -H "Host: example.org"  -X POST --data '
{
    "service": "org.apache.dubbo.samples.apisix.UserService",
    "method": "createUser",
    "parameters": [
        {
            "type": "org.apache.dubbo.samples.apisix.User",
            "value": "{'name': 'hello'}"
        }
    ]
}'
```

## Conclusion

This article introduced how to proxy Dubbo services using Apache APISIX, allowing for the construction of simpler and more efficient traffic links for the backend system of the Dubbo framework by introducing the `dubbo-proxy` plugin.

We hope that through the above operation steps and use case sharing, you can gain insights for relevant scenarios. For more information about the `dubbo-proxy` plugin, please refer to the [official documentation](https://apisix.apache.org/docs/apisix/plugins/dubbo-proxy/).

For more examples related to this section, you can also refer to https://github.com/chickenlj/APISIX-Dubbo-Nacos

