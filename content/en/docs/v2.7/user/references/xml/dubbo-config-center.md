---
type: docs
title: "dubbo:config-center"
linkTitle: "dubbo:config-center"
weight: 1
description: "dubbo:config-center element"
---



Configuration center. Corresponding configuration class: `org.apache.dubbo.config.ConfigCenterConfig`

| property | Corresponding URL parameter | type | required | default value | description | compatibility |
| ---------------- | ---------------------- | ------------------- | -------- | ---------------- | ------------------------------------------------------------ | ------ |
| protocol         | config.protocol        | string              | optional | zookeeper        | Which configuration center to use: apollo, zookeeper, nacos, etc.<br />take zookeeper for example<br />1. If protocol is specified, address can be simplified to `127.0.0.1:2181`;<br />2. If protocol is not specified, address is set to `zookeeper://127.0.0.1:2181` | 2.7.0+ |
| address          | config.address         | string              | required     |                  | Configuration center address.<br />See protocol description for values                     | 2.7.0+ |
| highest-priority  | config.highestPriority | boolean             | optional     | true             | Configuration items from the configuration center have the highest priority, it means that the local configuration items will be overwritten. | 2.7.0+ |
| namespace        | config.namespace       | string              | optional     | dubbo            | Using for multi-tenant isolation generally, the actual meaning varies depending on the configuration center. <br />For example:<br />zookeeper - Environment isolation, default `dubbo`；<br />apollo - Distinguish between sets of configurations for different domains and use them by default `dubbo` and `application` | 2.7.0+ |
| cluster          | config.cluster         | string              | optional     |                  | The meaning varies according to the configuration center selected.<br />For example,  it's used to distinguish between different configuration clusters in apollo | 2.7.0+ |
| group            | config.group           | string              | optional     | dubbo            | The meaning varies according to the configuration center selected.<br />nacos - Isolate different configuration sets<br />zookeeper - Isolate different configuration sets | 2.7.0+ |
| check            | config.check           | boolean             | optional     | true             | Whether to terminate application startup when the configuration hub connection fails.                     | 2.7.0+ |
| config-file       | config.configFile      | string              | optional     | dubbo.properties | The key mapped to the global level profile<br />zookeeper - $DEFAULT_PATH/dubbo/config/dubbo/dubbo.properties<br />apollo - The dubbo.properties key in dubbo namespace | 2.7.0+ |
| timeout          | config.timeout         | integer             |          | 3000ms           | Gets the configured timeout | 2.7.0+ |
| username         |                        | string              |          |                  | the username if the configuration center requires validation<br />Apollo is not yet enabled           | 2.7.0+ |
| password         |                        | string              |          |                  | password if configuration center needs to do check<br />Apollo is not yet enabled             | 2.7.0+ |
| parameters       |                        | Map<string, string> |          |                  | Extended parameters to support customized configuration parameters for different configuration centers | 2.7.0+ |
| include-spring-env |                        | boolean             | optional     | false            | With the Spring framework support, when the value is `true`, it will automatically reads the configuration from the Spring Environment<br />Read by default<br />Configuration with key `dubbo.properties`<br />PropertySource with key `dubbo.properties` | 2.7.0+ |
