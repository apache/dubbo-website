---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/service-discovery/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/service-discovery/
description: 应用级服务发现
title: 应用级服务发现
type: docs
weight: 2
---






参考文章[**《Dubbo 迈出云原生重要一步 应用级服务发现解析》**](https://baijiahao.baidu.com/s?id=1669266413887039723&wfr=spider&for=pc)

参考仓库：[dubbo-go-samples/registry/serivcediscovery](https://github.com/apache/dubbo-go-samples/tree/master/registry/servicediscovery)

## 配置方案

- Consumer 端

```yaml
dubbo:
  registries:
    demoZK:
      protocol: nacos
      address: 127.0.0.1:8848
      registry-type: service # 指定该注册中心为应用级服务发现，不填默认为接口级
  metadata-report: # 定义元数据中心
    protocol: nacos # 元数据中心可选nacos/zk
    address: 127.0.0.1:8848
  consumer:
    references:
      GreeterClientImpl:
        protocol: tri
        interface: com.apache.dubbo.sample.basic.IGreeter 
```



- Provider 端

```yaml
dubbo:
  registries:
    demoZK:
      protocol: nacos
      address: 127.0.0.1:8848
      registry-type: service # 指定该注册中心为应用级服务发现，不填默认为接口级
  metadata-report: # 定义元数据中心
    protocol: nacos # 元数据中心可选nacos/zk
    address: 127.0.0.1:8848 
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: com.apache.dubbo.sample.basic.IGreeter 
```

相比于常规配置，定义好registry-type: service, 并且定义好元数据中心后，将会使用应用级服务注册/服务发现。