---
title: Application-Level Service Discovery
weight: 2
type: docs
---

Reference article [**"Dubbo takes an important step towards cloud native application-level service discovery analysis"**](https://baijiahao.baidu.com/s?id=1669266413887039723&wfr=spider&for=pc)

Reference repository: [dubbo-go-samples/registry/serivcediscovery](https://github.com/apache/dubbo-go-samples/tree/master/registry/servicediscovery)

## Configuration

- Consumer side

```yaml
dubbo:
  registries:
    demoZK:
      protocol: nacos
      address: 127.0.0.1:8848
      registry-type: service # Specify the registry as application-level service discovery, if not filled, it defaults to interface level
  metadata-report: # Define metadata center
    protocol: nacos # The metadata center can choose nacos/zk
    address: 127.0.0.1:8848
  consumer:
    references:
      GreeterClientImpl:
        protocol: tri
        interface: com.apache.dubbo.sample.basic.IGreeter
```



- Provider side

```yaml
dubbo:
  registries:
    demoZK:
      protocol: nacos
      address: 127.0.0.1:8848
      registry-type: service # Specify the registry as application-level service discovery, if not filled, it defaults to interface level
  metadata-report: # Define metadata center
    protocol: nacos # The metadata center can choose nacos/zk
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

Compared with the conventional configuration, after defining registry-type: service and defining the metadata center, application-level service registration/service discovery will be used.