---
type: docs
title: Basic concepts of configuration
keywords: configure basic concepts
---

## 1. Framework configuration

The Dubbo-go framework needs to rely on configuration to start. Configuration contains the various capabilities that a developer wishes to use with the framework.

### Configuration format

yaml

### Configuration path

Load framework configuration from `../conf/dubbogo.yaml` by default

You can modify the configuration file path by specifying the environment variable: DUBBO_GO_CONFIG_PATH=$(your_config_path)/dubbogo.yaml.

### Configure the root structure

Located at [dubbo.apache.org/dubbo-go/v3/config/root_config.go: RootConfig](https://github.com/apache/dubbo-go/blob/e00cf8d6fb2be3cd9c6e42cc3d6efa54e10229d3/config/root_config.go#L50)

When the framework is loaded, any form of configuration will be parsed into RootConfig and loaded in the RootConfig.Init method.

## 2. Configuration API

Developers can start the framework by building configurations in the form of an API. This method is more suitable for the situation where dubbo-go is introduced as a third-party component.


## 3. Configuration Center

Developers can place configurations in the configuration center to facilitate configuration management and modification.
