---
description: |
    本文为大家介绍了如何借助 Apache APISIX 实现 triple 协议代理，使用 nacos 作为注册中心。
linkTitle: 使用 Apache APISIX 代理 Dubbo 服务（triple协议）
title: 使用 Apache APISIX 代理 Dubbo 服务（triple协议）
type: docs
date: 2024-04-22
weight: 2
---

关于如何用网关代理 triple 协议服务的原理介绍，请参见 [HTTP 网关接入](/zh-cn/overview/mannual/java-sdk/tasks/gateway/triple/) 一节文档。

本文我们使用 `Apache APISIX + triple 协议 + Nacos 注册中心` 的组合，演示如何使用 Apache APISIX 代理 Dubbo 服务。

## 示例应用说明

本示例完整源码与部署资源文件可查看 [dubbo-samples-gateway-triple-apisix](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-apisix/dubbo-samples-gateway-apisix-triple)，示例架构图如下：

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/apisix-nacos-dubbo.png"/>

在该示例中定义并发布了一个 `org.apache.dubbo.samples.gateway.apisix.DemoService` 的 triple 服务，接口定义为：

```java
public interface DemoService {
	String sayHello(String name);
}
```

接口实现如下：

```java
@DubboService
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

Dubbo服务相关配置：

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

## 部署应用

1. 在 [本地下载并启动 Nacos](/zh-cn/overview/reference/integrations/nacos/#本地下载)

2. 运行以下命令，启动 Dubbo 应用。

下载源码：

```shell
$ git clone -b main --depth 1 https://github.com/apache/dubbo-samples
$ cd dubbo-samples/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-apisix/dubbo-samples-gateway-apisix-triple
```

在 `dubbo-samples-gateway-apisix-triple` 目录，运行以下命令启动应用：

```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.gateway.apisix.ProviderApplication"
```

运行以下命令，测试服务已经正常启动：

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["dubbo"]' \
    http://localhost:50052/org.apache.dubbo.samples.gateway.apisix.DemoService/sayHello/
```

## 接入 APISIX 网关

本文档使用 Docker 安装 APISIX。确保本地先安装 [Docker](https://www.docker.com/) 和 [Docker Compose](https://docs.docker.com/compose/)。

首先，下载 [apisix-docker](https://github.com/apache/apisix-docker) 仓库。

```shell
$ git clone https://github.com/apache/apisix-docker.git
$ cd apisix-docker/example
```

由于本示例要接入到 Nacos 注册中心，因此需要修改 `apisix-docker/example` 目录下安装用的 `docker-compose.yaml`，添加如下 docker compose 配置内容：

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

启动 APISIX 前，在 `conf/config.yaml` 文件中增加如下配置，[让 APISIX 连接到 Nacos 注册中心](https://apisix.apache.org/docs/apisix/discovery/nacos/#service-discovery-via-nacos)：

```yaml
discovery:
  nacos:
    host:
      - "http://192.168.33.1:8848"
```

最后使用 `docker-compose` 启用 APISIX：`docker-compose -p docker-apisix up -d`。

### 配置服务源与路由

在 APISIX 中配置 Nacos upstream 及路由，即可实现后端实例地址自动发现（假设 APISIX 端口是 9080）：

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

> 在上述命令中，请求头 X-API-KEY 是 Admin API 的访问 token，可以在 conf/config.yaml 文件中的 apisix.admin_key.key 查看。

### 验证服务调用

使用以下命令发送请求至需要配置的路由：

```shell
curl -i http://127.0.0.1:9080/org.apache.dubbo.samples.gateway.apisix.DemoService/sayHello/
```

### REST 模式

如果您觉得 `/org.apache.dubbo.samples.gateway.apisix.DemoService/sayHello/` 这样的 http 端口对于网关访问不够友好，可参考 [为 triple 协议发布 rest 风格 http 接口](/zh-cn/overview/mannual/java-sdk/tasks/gateway/triple/#rest-风格接口)。




