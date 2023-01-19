---
title: "Makes it More Convenient for You to Proxy Dubbo Services in Apache APISIX"
linkTitle: "Makes it More Convenient for You to Proxy Dubbo Services in Apache APISIX"
date: 2022-01-18
description: In this article, we introduced how to use Apache APISIX to implement a proxy for Dubbo Service. By introducing the dubbo-proxy plugin, you can build a simpler and more efficient traffic link for the back-end system of Dubbo framework.
---

## Background

[Apache Dubbo](/en/) is a MicroService development framework open sourced by Alibaba and donated to Apache, which provides two key capabilities of RPC communication and microservice governance. It has not only been validated by Ali's massive traffic in e-commerce scenario, but also been widely implemented in domestic technology companies.

In practical application scenarios, Apache Dubbo is generally used as the implementation framework for RPC calls between back-end systems, and when HTTP interfaces need to be provided to the front-end, the Dubbo Service is packaged as an HTTP interface through a "glue layer" and then delivered to the front-end system.

[Apache APISIX](https://apisix.apache.org/) is the top open source project of Apache Software Foundation and the most active open source gateway project today. As a dynamic, real-time, high-performance open source API gateway, Apache APISIX provides rich traffic management features such as load balancing, dynamic upstream, grayscale publishing, service meltdown, authentication, observability, and more.

Benefiting from the advantages of Apache Dubbo application scenarios, Apache APISIX is based on the open source project tengine/mod_dubbo module to equip Apache Dubbo services with HTTP gateway capabilities. Dubbo Service can be easily published as an HTTP service via the dubbo-proxy plugin.

![Architecture Diagram](/imgs/blog/apisix-plugin/1.png)

## How to use

### Getting Started: Installation and Use

> Here we recommend using the Apache APISIX version 2.11 image for installation. This version of APISIX-Base has the Dubbo module compiled by default, so you can use the `dubbo-proxy` plugin directly.

In the next steps, we will use the [`dubbo-samples`](https://github.com/apache/dubbo-samples) project for a partial demonstration. This project is a demo application implemented using Apache Dubbo, and in this article we use one of the sub-modules as the Dubbo Provider.

Before we get into the action, let's take a brief look at the definition, configuration, and implementation of the Dubbo interface.

#### Interface implementation

```java
public interface DemoService {

    /**
     * standard samples dubbo infterace demo
     * @param context pass http infos
     * @return Map<String, Object></> pass to response http
     **/
    Map<String, Object> apisixDubbo(Map<String, Object> httpRequestContext);
}
```

As shown above, the Dubbo interface is defined in a fixed way. The `Map` of method parameters represents the information passed by APISIX to the Dubbo Provider about the HTTP request (e.g. header, body, ...). The `Map` of the method return value indicates how the Dubbo Provider passes some information to APISIX about the HTTP response to be returned.

After the interface information, the DemoService can be published via XML configuration.

```xml
<!-- service implementation, as same as regular local bean -->
<bean id="demoService" class="org.apache.dubbo.samples.provider.DemoServiceImpl"/>

<!-- declare the service interface to be exported -->
<dubbo:service interface="org.apache.dubbo.samples.apisix.DemoService" ref="demoService"/>
```

After the above configuration, the Consumer can access the `apisixDubbo` method through `org.apache.dubbo.samples.apisix.DemoService` The specific interface implementation is as follows.

```java
public class DemoServiceImpl implements DemoService {
    @Override
    public Map<String, Object> apisixDubbo(Map<String, Object> httpRequestContext) {
        for (Map.Entry<String, Object> entry : httpRequestContext.entrySet()) {
            System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());
        }

        Map<String, Object> ret = new HashMap<String, Object>();
        ret.put("body", "dubbo success\n"); // http response body
        ret.put("status", "200"); // http response status
        ret.put("test", "123"); // http response header

        return ret;
    }
}
```

:::note
In the above code, `DemoServiceImpl` prints the received `httpRequestContext` and describes the HTTP response to the Dubbo request by returning a Map object with the specified Key.
:::

#### Operation steps

1. Start [`dubbo-samples`](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-tengine#install-dubbo).
2. Enable the `dubbo-proxy` plugin in the `config.yaml` file.

```yaml
# Add this in config.yaml
plugins:
  - ... # plugin you need
  - dubbo-proxy
```

3. Create an Upstream that points to the Dubbo Provider.

```shell
curl http://127.0.0.1:9180/apisix/admin/upstreams/1  -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
    "nodes": {
        "127.0.0.1:20880": 1
    },
    "type": "roundrobin"
}'
```

4. Expose an HTTP route for the DemoService.

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1  -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
    "host": "example.org"
    "uris": [
        "/demo"
    ],
    "plugins": {
        "dubbo-proxy": {
            "service_name": "org.apache.dubbo.samples.apisix.DemoService",
            "service_version": "0.0.0",
            "method": "apisixDubbo"
        }
    },
    "upstream_id": 1
}'
```

5. Use the curl command to request Apache APISIX and view the returned results.

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

:::note
The above code returns the `test: 123` Header, and the `dubbo success` string as the body. This is the same as what we expected in the `DemoServiceImpl` code.
:::

6. You can view the logs of the Dubbo Provider.

```
Key = content-length, Value = 17
Key = host, Value = example.org
Key = content-type, Value = application/x-www-form-urlencoded
Key = body, Value = [B@70754265
Key = accept, Value = */*
Key = user-agent, Value = curl/7.80.0
```

:::note
The Header and Body of the HTTP request are available through the `httpRequestContext`, where the Header is used as a Map element, while the Body has a fixed string "body" as the Key value and a Byte array as the Value.
:::

### Advanced: Complex Scenario Example

As you can see in the simple use case above, we do publish Dubbo Service as an HTTP service via Apache APISIX, but there are obvious limitations in its use. For example, the parameters and return values of the interface must be `Map<String, Object>`.

So, how do you expose the HTTP service through Apache APISIX if there is an interface in your project that is already defined, but does not meet the above restrictions?

#### Operation steps

For the above scenario, we can use the HTTP Request Body to describe the Service and Method to be invoked and the corresponding parameters, and then use the reflection mechanism of Java to realize the invocation of the target method. Finally, the return value is serialized to JSON and written to the HTTP Response Body.

This will further enhance the "HTTP to Dubbo" capability of Apache APISIX and apply it to all existing Dubbo services. For details, see the following.

1. Add a Dubbo Service for existing projects to handle HTTP to Dubbo conversions in a unified way.

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


@Component
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

2. Initiate the relevant call with the following command request.

```shell
curl http://127.0.0.1:9080/demo  -H "Host: example.org"  -X POST --data '
{
    "service": "org.apache.dubbo.samples.apisix.DemoService",
    "method": "createUser",
    "parameters": [
        {
            "type": "org.apache.dubbo.samples.apisix.User",
            "value": "{'name': 'hello'}"
        }
    ]
}'
```

## Summary

In this article, we introduced how to use Apache APISIX to implement a proxy for Dubbo Service. By introducing the `dubbo-proxy` plugin, you can build a simpler and more efficient traffic link for the back-end system of Dubbo framework.

We hope that the above steps and use cases will provide you with ideas for using it in relevant scenarios. For more information about the `dubbo-proxy` plugin, please refer to the [official documentation](https://apisix.apache.org/docs/apisix/plugins/dubbo-proxy/).
