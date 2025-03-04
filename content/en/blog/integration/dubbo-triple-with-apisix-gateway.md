---
description: |
    This article introduces how to implement triple protocol proxy using Apache APISIX, with Nacos as the registry.
linkTitle: Use Apache APISIX to Proxy Dubbo Services (Triple Protocol)
title: Use Apache APISIX to Proxy Dubbo Services (Triple Protocol)
type: docs
date: 2024-04-22
weight: 2
---

For a description of how to proxy triple protocol services with a gateway, please refer to the section on [HTTP Gateway Access](/en/overview/mannual/java-sdk/tasks/gateway/triple/).

This article demonstrates how to use the combination of `Apache APISIX + triple protocol + Nacos registry` to proxy Dubbo services.

## Sample Application Description

The complete source code and deployment resource files for this example can be found at [dubbo-samples-gateway-triple-apisix](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-apisix/dubbo-samples-gateway-apisix-triple), with the architecture diagram as follows:

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/apisix-nacos-dubbo.png"/>

In this example, a triple service `org.apache.dubbo.samples.gateway.apisix.DemoService` has been defined and published, with the interface defined as:

```java
public interface DemoService {
	String sayHello(String name);
}
```

The interface implementation is as follows:

```java
@DubboService
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

Dubbo service-related configuration:

```yaml
dubbo:
    application:
        name: gateway-apisix-triple
    registry:
        address: nacos://${nacos.address:127.0.0.1}:8848
        username: nacos
        password: nacos
    protocol:
        name: tri
        port: 50052
```

## Deploy Application

1. Download and start Nacos [locally](/en/overview/reference/integrations/nacos/#本地下载).

2. Run the following command to start the Dubbo application.

Download the source code:

```shell
$ git clone -b master --depth 1 https://github.com/apache/dubbo-samples
$ cd dubbo-samples/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-apisix/dubbo-samples-gateway-apisix-triple
```

In the `dubbo-samples-gateway-apisix-triple` directory, run the following command to start the application:

```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.gateway.apisix.ProviderApplication"
```

Run the following command to test if the service has started normally:

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["dubbo"]' \
    http://localhost:50052/org.apache.dubbo.samples.gateway.apisix.DemoService/sayHello/
```

## Access APISIX Gateway

This document uses Docker to install APISIX. Ensure that [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) are installed locally.

First, download the [apisix-docker](https://github.com/apache/apisix-docker) repository.

```shell
$ git clone https://github.com/apache/apisix-docker.git
$ cd apisix-docker/example
```

Since this example needs to connect to the Nacos registry, the `docker-compose.yaml` in the `apisix-docker/example` directory needs to be modified to add the following Docker Compose configuration:

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

Before starting APISIX, add the following configuration to the `conf/config.yaml` file to [connect APISIX to the Nacos registry](https://apisix.apache.org/docs/apisix/discovery/nacos/#service-discovery-via-nacos):

```yaml
discovery:
  nacos:
    host:
      - "http://192.168.33.1:8848"
```

Finally, enable APISIX using `docker-compose`: `docker-compose -p docker-apisix up -d`.

### Configure Service Source and Route

Configure Nacos upstream and routes in APISIX to achieve automatic discovery of backend instance addresses (assuming the APISIX port is 9080):

```shell
curl http://127.0.0.1:9080/apisix/admin/routes/1 -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -i -d '
{
    "uri": "/org.apache.dubbo.samples.gateway.apisix.DemoService/sayHello/",
    "upstream": {
        "service_name": "gateway-apisix-triple",
        "type": "roundrobin",
        "discovery_type": "nacos"
    }
}'
```

> In the above command, the request header X-API-KEY is the access token for the Admin API, which can be found in the apisix.admin_key.key in the conf/config.yaml file.

### Verify Service Call

Use the following command to send a request to the route that needs to be configured:

```shell
curl -i http://127.0.0.1:9080/org.apache.dubbo.samples.gateway.apisix.DemoService/sayHello/
```

### REST Mode

If you find the HTTP port `/org.apache.dubbo.samples.gateway.apisix.DemoService/sayHello/` not friendly enough for gateway access, refer to [Publishing REST Style HTTP Interfaces for Triple Protocol](/en/overview/mannual/java-sdk/tasks/gateway/triple/#rest-风格接口).

