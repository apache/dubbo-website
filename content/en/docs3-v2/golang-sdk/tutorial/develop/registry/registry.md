---
title: Registry Configuration
weight: 4
type: docs
---

Refer to samples [dubbo-go-samples/registry](https://github.com/apache/dubbo-go-samples/tree/master/registry)

## Registry registration center configuration

- **Nacos Registration Center**

```yaml
dubbo:
  application: # Application information, after the service is started, the relevant information will be registered in the registration center, which can be identified by the client from the url
    name: myApp # application=myApp; name=myApp
    module: opensource # module=opensource
    organization: dubbo # organization=dubbo
    owner: laurence # owner=laurence
    version: myversion # app.version=myversion
    environment: pro # environment=pro
  registries:
    nacosWithCustomGroup:
      protocol: nacos # The registration center chooses nacos
      address: 127.0.0.1:8848 # nacos ip
      group: myGroup # nacos group, default DEFAULT_GROUP
      namespace: 9fb00abb-278d-42fc-96bf-e0151601e4a1 # nacos namespaceID, should be created before. Default public
      username: abc
      password: abc
  protocols:
    dubbo:
      name: dubbo
      port: 20000
  provider:
    services:
      UserProviderWithCustomGroupAndVersion: # Interface triplet: interface name, version number, group. client and server need to be consistent.
        interface: org.apache.dubbo.UserProvider.Test # interface name is required
        version: myInterfaceVersion # Default is empty
        group: myInterfaceGroup # Default is empty
```

The group, namespace, username, and password configured in the registration center of dubbogo correspond to nacos-related concepts.

- **Zookeeper Registry**

```yaml
dubbo:
  # application: Consistent with nacos, no more details
  registries:
    demoZK:
      protocol: zookeeper # The registration center chooses nacos
      address: 127.0.0.1:2181 # zookeeper ip
      group: myGroup # nacos group, default dubbo
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      UserProviderWithCustomGroupAndVersion: # Interface triplet: interface name, version number, group. client and server need to be consistent.
        interface: com.apache.dubbo.sample.basic.IGreeter # interface name is required
        version: myInterfaceVersion # Default is empty
        group: myInterfaceGroup # Default is empty
```

When zookeeper is registered, the provider side registers the interface information in `/$(group)/$(interface)/providers` node, taking the above configuration as an example, the registered zk path is `/myGroup/com.apache.dubbo.sample. basic.IGreeter/providers/`

The consumer side is registered in /$(group)/$(interface)/consumers for statistics.

- **ETCD Registration Center**

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

- **Application-level service registration discovery**

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper # nacos/zookeeper
      address: 127.0.0.1:2181
      registry-type: service # Use application-level service discovery
  metadata-report: # configure metadata center
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