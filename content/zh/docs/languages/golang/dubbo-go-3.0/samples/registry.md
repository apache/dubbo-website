---
type: docs
title: Dubbo-go 3.0 注册中心
keywords: Dubbo-go 3.0 注册中心
linkTitle: 注册中心
description: Dubbo-go 3.0 注册中心
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/golang-sdk/samples/registry/)。
{{% /pageinfo %}}

# Dubbo-go 3.0 注册中心配置

参考samples [dubbo-go-samples/registry](https://github.com/apache/dubbo-go-samples/tree/master/registry)

## Registry 注册中心配置

- **Nacos 注册中心**

```yaml
dubbo:
  application: # 应用信息，服务启动后会将相关信息注册到注册中心，可被客户端从 url 中识别
    name: myApp # application=myApp; name=myApp
    module: opensource # module=opensource
    organization: dubbo # organization=dubbo
    owner: laurence # owner=laurence
    version: myversion # app.version=myversion
    environment: pro # environment=pro
  registries:
    nacosWithCustomGroup:
      protocol: nacos # 注册中心选择 nacos 
      address: 127.0.0.1:8848 # nacos ip
      group: myGroup # nacos group, 默认 DEFAULT_GROUP
      namespace: 9fb00abb-278d-42fc-96bf-e0151601e4a1 # nacos namespaceID, should be created before. 默认public
      username: abc
      password: abc
  protocols:
    dubbo:
      name: dubbo
      port: 20000
  provider:
    services:
      UserProviderWithCustomGroupAndVersion: # 接口三元组：接口名、版本号、分组。client 和 server 需要保持一致。
        interface: org.apache.dubbo.UserProvider.Test # 接口名必填
        version: myInterfaceVersion # 默认为空
        group: myInterfaceGroup # 默认为空
```

Dubbo-go 的注册中心配置的 group、namespace、username、password，均与 nacos 相关概念对应。

- **Zookeeper 注册中心**

```yaml
dubbo:
  # application: 与nacos 一致，不再赘述
  registries:
    demoZK:
      protocol: zookeeper # 注册中心选择 nacos 
      address: 127.0.0.1:2181 # zookeeper ip
      group: myGroup # nacos group, 默认 dubbo
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      UserProviderWithCustomGroupAndVersion: # 接口三元组：接口名、版本号、分组。client 和 server 需要保持一致。
        interface: com.apache.dubbo.sample.basic.IGreeter # 接口名必填
        version: myInterfaceVersion # 默认为空
        group: myInterfaceGroup # 默认为空
```

zookeeper 注册时，provider 端将接口信息注册在` /$(group)/$(interface)/providers` 节点，以上面配置为例，注册的 zk  path 为 `/myGroup/com.apache.dubbo.sample.basic.IGreeter/providers/`

consumer 端注册在 /$(group)/$(interface)/consumers 作统计用。

- **ETCD 注册中心**

```yaml
dubbo:
  registries:
    etcd:
      protocol: etcdv3
      timeout: 3s
      address: 127.0.0.1:2379
  protocols:
    dubbo:
      name: dubbo
      port: 20000
  provider:
    services:
      UserProvider:
        interface: org.apache.dubbo.UserProvider
```

- **应用级服务注册发现**

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper # nacos/zookeeper
      address: 127.0.0.1:2181
      registry-type: service # 使用应用级服务发现
  metadata-report: # 配置元数据中心
    protocol: zookeeper
    address: 127.0.0.1:2181
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: com.apache.dubbo.sample.basic.IGreeter
```

下一章: [【Triple 协议异常回传】](./exception_response.html)

