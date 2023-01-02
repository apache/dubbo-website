---
type: docs
title: Remote loading configuration start
weight: 3
---

# Remote loading configuration start

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Create a new demo application
- Start a Nacos instance locally/remotely, and log in to the console

## 2. Create a configuration in the configuration center

The Dubbogo service framework supports pre-putting the content of the configuration file 'dubbogo.yaml' into the configuration center, and then configuring the address of the registration center. In the local dubbogo.yaml configuration file, you only need to write the information of the configuration center. The middleware currently supported as the configuration center are: apollo, nacos, zookeeper

You can refer to [Configuration Center samples](https://github.com/apache/dubbo-go-samples/tree/master/configcenter), any service that is correctly configured with config-center configuration will first load the entire configuration from the configuration center document.

```yaml
dubbo:
  config-center:
    protocol: nacos
    address: 127.0.0.1:8848
    data-id: dubbo-go-samples-configcenter-nacos-server
    group: myGroup # nacos group, default is DEFAULT_GROUP
# namespace: 9fb00abb-278d-42fc-96bf-e0151601e4a1 # nacos namespaceID, default is public namespace

## set in config center, group is 'dubbo', dataid is 'dubbo-go-samples-configcenter-nacos-server', namespace is default
#dubbo:
# registries:
# demoZK:
# protocol: nacos
# timeout: 3s
# address: 127.0.0.1:8848
# protocols:
# triple:
# name: tri
# port: 20000
# provider:
# services:
# GreeterProvider:
# interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java
```