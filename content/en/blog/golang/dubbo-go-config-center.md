---
title: "How to Implement Remote Configuration Management in dubbo-go?"
linkTitle: "How to Implement Remote Configuration Management in dubbo-go?"
tags: ["Go"]
date: 2021-01-11
description: This article explains how to use the configuration center for remote configuration management in dubbo-go
---

Previously, some students in the Apache/dubbo-go (hereinafter referred to as dubbo-go) community hoped that configuration files could be placed not only locally but also in a configuration management center. So, what are the differences between local and configuration management center?

Locally, every update requires a restart, making configuration file management difficult and unable to achieve real-time updates. Additionally, local files rely on manual version control, significantly increasing operational costs and complexity in microservices scenarios.

The configuration management center provides unified management of configuration files, supporting file updates, real-time synchronization, unified version control, and permission management features.

## Goals

Based on the above context, the following **goals** can be summarized:

- Compatibility with existing configuration files in Dubbo's configuration center, reducing the learning curve for new language stacks;
- Support for multiple configuration file formats;
- Support for mainstream configuration centers, adapting to different use cases, and achieving highly extensible configuration delivery;

## Configuration Center

The configuration center in dubbo-go mainly assumes the following responsibilities:

1. As an externalized configuration center, i.e., storing the dubbo.properties configuration file, where the key is typically the filename (e.g., dubbo.properties) and the value is the contents of the configuration file.
2. Storing individual configuration items, such as various switches and constant values.
3. Storing service governance rules, usually organized in the format of "service name + rule type", with values being the specific governance rules.

Currently, dubbo-go primarily supports open-source configuration centers supported by Dubbo, including:
1. Apollo: A distributed configuration center developed by Ctrip’s framework department, enabling centralized management of application configurations across different environments and clusters, with real-time push to applications and features like permission and process governance, suitable for microservice configuration management.
2. ZooKeeper: A distributed, open-source coordination service for distributed applications, is an open-source implementation of Google’s Chubby, and is an important component of Hadoop and HBase. It provides consistency services for distributed applications, including configuration maintenance, domain name services, distributed synchronization, group services, etc.
3. Nacos: An Alibaba open-source configuration management component, providing a set of easy-to-use features to help achieve dynamic service discovery, service configuration management, and traffic management.

Considering that some companies have their own developed configuration centers or currently popular configuration centers not yet supported by Dubbo, such as etcd, our core design is to establish a mechanism that allows us, including users, to quickly access different configuration centers through extensible interfaces.

So how do we implement this in dubbo-go? Our answer is: **load different implementations of the configuration center on demand based on a dynamic plugin mechanism at startup.**

The functionality is placed in a separate subproject, see: https://github.com/apache/dubbo-go/tree/master/config_center

### dubbo-go Design

The original logic was to read the local configuration file at startup, loading it into memory, and then reading information from the configuration file to obtain service providers and register service consumers.

Some readers may be confused; didn't we say we'd use the configuration center? Why read the local configuration now? The answer is that the information read is divided into two parts:

- What to use as the configuration center;
- The metadata of the configuration center, for example, using ZooKeeper as the configuration center, so ZooKeeper's connection information is the metadata, because we can only connect to ZooKeeper once we know the connection information;

When making changes, the following issues need to be considered:

**1. How to support multiple configuration centers? How to achieve on-demand loading?**

By abstracting DynamicConfiguration, developers can quickly support multiple configuration centers. Once the required components are imported, they will be loaded into memory during startup to be called as needed by the program, as shown in the green part of the diagram.

**2. When is the configuration loading phase for the configuration center?**

It should happen after reading the configuration file, reading and parsing the configuration center information from the local configuration file. Initialize the configuration center connection, read /dubbo/config/dubbo/dubbo.properties and /dubbo/config/dubbo/applicationName/dubbo.properties, and load them into memory to override the original configuration, listening to changes and updating them in real time, as shown in the blue part of the diagram:
![img](/imgs/blog/dubbo-go/config-center/config-center-class.jpg)

#### ConfigCenterFactory

After loading the corresponding configuration center module, users register their initialization classes for each configuration center module during the initialization phase.

```golang
package extension

import (
	"github.com/apache/dubbo-go/config_center"
)

var (
	configCenterFactories = make(map[string]func() config_center.DynamicConfigurationFactory)
)

// SetConfigCenterFactory sets the DynamicConfigurationFactory with @name
func SetConfigCenterFactory(name string, v func() config_center.DynamicConfigurationFactory) {
	configCenterFactories[name] = v
}

// GetConfigCenterFactory finds the DynamicConfigurationFactory with @name
func GetConfigCenterFactory(name string) config_center.DynamicConfigurationFactory {
	if configCenterFactories[name] == nil {
		panic("config center for " + name + " is not existing, make sure you have import the package.")
	}
	return configCenterFactories[name]()
}
```

#### DynamicConfigurationFactory

The key point of the dynamic configuration center lies in DynamicConfigurationFactory, where the internal custom URL is parsed to obtain its protocol type and reflect its parameters for creating configuration center links.

```golang
package config_center

import (
	"github.com/apache/dubbo-go/common"
)

// DynamicConfigurationFactory gets the DynamicConfiguration
type DynamicConfigurationFactory interface {
	GetDynamicConfiguration(*common.URL) (DynamicConfiguration, error)
}
```

For example:

Configuration file settings:

```yaml
config_center:
  protocol: zookeeper
  address: 127.0.0.1:2181
  namespace: test
```

In dubbo-go, this will be parsed as:

```
zookeeper://127.0.0.1:2181?namespace=test
```

Internally passed for initializing the configuration center connection.

**PS:** This internal protocol is commonly seen in dubbo-go, and understanding it thoroughly aids in reading dubbo-go code.

#### DynamicConfiguration

This interface stipulates the functions that each configuration center needs to implement:

- Configuration data deserialization method: currently only the Properties converter, see: DefaultConfigurationParser.
- Add listener: for adding specific logic upon data changes (limited by the configuration center client implementation).
- Remove listener: for deleting existing listeners (limited by the configuration center client implementation; currently known, the Nacos client does not provide this method).
- Get routing configuration: to obtain routing table configuration.
- Get application-level configuration: to retrieve application-level settings, such as protocol type configuration, etc.

```golang
// DynamicConfiguration for modifying listener and getting properties file
type DynamicConfiguration interface {
	Parser() parser.ConfigurationParser
	SetParser(parser.ConfigurationParser)
	AddListener(string, ConfigurationListener, ...Option)
	RemoveListener(string, ConfigurationListener, ...Option)
	// GetProperties get properties file
	GetProperties(string, ...Option) (string, error)

	// GetRule get Router rule properties file
	GetRule(string, ...Option) (string, error)

	// GetInternalProperty get value by key in Default properties file(dubbo.properties)
	GetInternalProperty(string, ...Option) (string, error)

	// PublishConfig will publish the config with the (key, group, value) pair
	PublishConfig(string, string, string) error

	// RemoveConfig will remove the config white the (key, group) pair
	RemoveConfig(string, string) error

	// GetConfigKeysByGroup will return all keys with the group
	GetConfigKeysByGroup(group string) (*gxset.HashSet, error)
}
```

### Implementation

![img](/imgs/blog/dubbo-go/config-center/design.png)

Priority is given to compatibility with existing Dubbo design to reduce users' learning costs. dubbo-admin implements application-level configuration management as a service provider, while dubbo-go implements configuration delivery management as a consumer. Below, we analyze the overall process for both service providers and consumers using ZooKeeper as an example.

#### How to Store Configuration Management

In dubbo-admin's configuration management, add a global configuration, and ZooKeeper will automatically generate the corresponding configuration node, with contents set in dubbo-admin.

1. /dubbo/config/dubbo/dubbo.properties corresponds to the global configuration file.
2. /dubbo/config/dubbo/applicationName/dubbo.properties corresponds to the specified application configuration file.

##### Node Paths

![img](/imgs/blog/dubbo-go/config-center/key-struct.png)

The above illustrates the storage structure of the dubbo.properties file in ZooKeeper and Apollo:

**ZooKeeper**

- Namespace namespace is: Dubbo
- Group group: global level is dubbo, shared by all applications; application level is application name demo-provider, only effective for that application
- Key: dubbo.properties

**Apollo**

- app_id: freely specified, default: dubbo, preferably consistent with zookeeper namespace
- Cluster: freely specified, preferably consistent with zookeeper group
- Namespace: dubbo.properties

The biggest difference between ZooKeeper and Apollo lies in the node where dubbo.properties is located.

#### Implementing Support for Configuration Management Center

Taking Apollo as an example, here’s a simple introduction on how to support a new configuration management center.

##### Choose Configuration Management Center Client / SDK

The Apollo Go Client used in this example is: https://github.com/zouyx/agollo.

**PS:** If not found, implementing your own is also acceptable.

##### Node Paths

Due to the unique storage structure of each configuration management center, when using an external configuration management center, the structure of the stored configuration nodes in Dubbo differs. Find the desired configuration management center support in dubbo-configcenter; in this example, Apollo can be found in ApolloDynamicConfiguration.java.

Comments indicate that Apollo's namespace = governance (governance.properties) is for governance rules, and namespace = dubbo (dubbo.properties) is for configuration files.

##### Implement DynamicConfiguration

Create a new client method, keeping it as a singleton.

```golang
func newApolloConfiguration(url *common.URL) (*apolloConfiguration, error) {
	c := &apolloConfiguration{
		url: url,
	}
	configAddr := c.getAddressWithProtocolPrefix(url)
	configCluster := url.GetParam(constant.CONFIG_CLUSTER_KEY, "")

	appId := url.GetParam(constant.CONFIG_APP_ID_KEY, "")
	namespaces := getProperties(url.GetParam(constant.CONFIG_NAMESPACE_KEY, cc.DEFAULT_GROUP))
	c.appConf = &config.AppConfig{
		AppID:         appId,
		Cluster:       configCluster,
		NamespaceName: namespaces,
		IP:            configAddr,
	}

	agollo.InitCustomConfig(func() (*config.AppConfig, error) {
		return c.appConf, nil
	})

	return c, agollo.Start()
}
```

The following methods must implement methods to obtain the configuration from the configuration center.

- GetInternalProperty: get the corresponding value according to the key in the configuration file (Apollo as namespace);
- GetRule: get the governance configuration file (Apollo as namespace);
- GetProperties: get the entire configuration file (Apollo as namespace);

Optionally implementable methods, if not implemented, cannot dynamically update configuration information in dubbo-go.

- RemoveListener
- AddListener

Parser & SetParser can use default implementations, defaulting to Properties converters.

For more information, refer to: dubbo-go-apollo, detailed reference: https://github.com/apache/dubbo-go/tree/release-1.5/config_center/apollo

### Usage

From the above design, one can roughly guess how to use it:

![img](/imgs/blog/dubbo-go/config-center/zookeeper-usercase.png)

Clearly, using a configuration center is not complicated; just import the corresponding dependencies. During package initialization, the corresponding implementation of the configuration center will be created. For example, loading ZooKeeper or Apollo as the configuration center:

**ZooKeeper**

```golang
_ "github.com/apache/dubbo-go/config_center/zookeeper"
```

**Apollo**

```golang
_ "github.com/apache/dubbo-go/config_center/apollo"
```

Of course, simply loading is not enough; for example, even if I load ZooKeeper, I still need to know how to connect to this configuration center, i.e., the aforementioned metadata of the configuration center has to be configured locally. For example:

**ZooKeeper**

```yaml
config_center:
  protocol: "zookeeper"
  address: "127.0.0.1:2181"
```

**Apollo**

If you need to use Apollo as the configuration center, please create the namespace: dubbo.properties in advance for configuration management.

```yaml
config_center:
  protocol: "apollo"
  address: "127.0.0.1:8070"
  app_id: test_app
  cluster: dev
```

## Conclusion

I will not elaborate on the more specific implementations; you can check the source code. Feel free to continue following or contribute code.

The entire functionality of the configuration center, while small, is comprehensive. It is not yet fully refined, but from a framework perspective, it is moving in the right direction. From an extensibility standpoint, it is quite convenient. Currently, the supported configuration centers are not abundant, only ZooKeeper and Apollo, and the supported configuration file formats are limited to properties, which, while sufficient for basic use cases, have a long way to go for completeness.

**Future Plans:**

- Nacos (waiting for release)
- etcd (under development)
- consul (not supported)
- Richer file configuration formats, such as: yml, xml, etc.

**Author:** Zou Yixian, GitHub ID @zouyx, an open-source enthusiast working in SheIn’s supply chain department, responsible for the open platform in the supply chain.

