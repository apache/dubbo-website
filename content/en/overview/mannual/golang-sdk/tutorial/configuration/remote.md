---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/config-center/remote_config/
    - /en/docs3-v2/golang-sdk/tutorial/develop/config-center/remote_config/
description: Load the dubbogo.yaml configuration file remotely
title: Remote Configuration File
type: docs
weight: 3
---

The Dubbo framework supports preloading the contents of the configuration file 'dubbogo.yaml' into the configuration center, and then merging it with local configurations through remote loading, thus achieving some dynamic and centralized management of configurations.

{{% alert title="Notice" color="primary" %}}
Applications that have correctly configured the config-center address will prioritize loading the entire configuration file from the configuration center.
{{% /alert %}}

You can view the <a href="https://github.com/apache/dubbo-go-samples/tree/main/config_center" target="_blank">full example source code here</a>. This article demonstrates using Zookeeper, and the usage of Nacos is similar, with specific source code examples available at the above address.

### Enable Configuration Center
In the dubbo-go application, enable the configuration center with `dubbo.WithConfigCenter()`:

```go
ins, err := dubbo.NewInstance(
    dubbo.WithConfigCenter(
    	config_center.WithZookeeper(),
    	config_center.WithDataID("dubbo-go-samples-configcenter-zookeeper-server"),
    	config_center.WithAddress("127.0.0.1:2181"),
    	config_center.WithGroup("dubbogo"),
	),
)
if err != nil {
    panic(err)
}
```

Before running the application, pre-write the following configuration into the Zookeeper cluster at the path `/dubbo/config/dubbogo/dubbo-go-samples-configcenter-zookeeper-server`:

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      timeout: 3s
      address: '127.0.0.1:2181'
  protocols:
    triple:
      name: tri
      port: 20000
```

### Start the Server and Register the Service

```go
srv, err := ins.NewServer()
if err != nil {
    panic(err)
}

if err := greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}); err != nil {
    panic(err)
}

if err := srv.Serve(); err != nil {
    logger.Error(err)
}
```

You will find that the application has read the remote dubbogo.yml file and connected to the registered center address, protocol, and port configured in the file.

### Start the Client

```shell
$ go run ./go-client/cmd/main.go
```

### Expected Output

```
Greet response: greeting:"hello world"
```
