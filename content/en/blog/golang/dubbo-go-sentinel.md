---
title: "Using Sentinel in dubbo-go"
linkTitle: "Using Sentinel in dubbo-go"
tags: ["Go"]
date: 2021-01-11
description: This article introduces how to use the rate limiting component Sentinel in dubbo-go
---


As of today, the Apache/dubbo-go (hereinafter referred to as dubbo-go) project has gradually aligned functionally with the Java version, and its stability has been verified in various production environments. The community has begun to focus on service governance, monitoring, and other areas. With the releases of versions 1.2 and 1.3, dubbo-go has added a large number of these new features.

Today, we will discuss rate limiting. Previously, dubbo-go already supported built-in filters for [tps limit](https://github.com/apache/dubbo-go/pull/237), [execute limit](https://github.com/apache/dubbo-go/pull/246), and [hystrix](https://github.com/apache/dubbo-go/pull/133), which users can easily configure and use immediately. However, we know that within the Java Dubbo ecosystem, one tool has been widely used for rate limiting: Sentinel. Due to its powerful dynamic configuration, excellent dashboard, and good adaptation to Dubbo, Sentinel has become the preferred choice for many enterprises using Dubbo.

Recently, the community was very pleased to learn that the first version of Sentinel Golang, 0.1.0, was officially released, enabling dubbo-go to use Sentinel for service governance and monitoring tasks. As the Sentinel Golang matures, we believe users will soon be able to manage dubbo-go services just like managing Java Dubbo services with Sentinel.

Implementing the Sentinel Golang dubbo-adapter is actually quite simple, thanks to the fact that dubbo-go has already completed the construction of the filter chain, allowing users to customize filters and flexibly arrange their execution order. After the release of 1.3, context passing in the filter was added, making the construction of sentinel/adapter/dubbo even more convenient.

Taking the provider filter adaptation as an example:

![img](/imgs/blog/dubbo-go/sentinel/dubbo-go-sentinel-provider-filter.png)

This filter implements the dubbo-go filter interface. As long as users load this filter into dubbo-go when starting the service, they can use it. 

![img](/imgs/blog/dubbo-go/sentinel/sentinel-golang.png)

The implementation principle of Sentinel is similar to other rate limiting and circuit breaking libraries, using a sliding window algorithm at its core. The difference from frameworks such as Hystrix lies in the design philosophy; Sentinel's design concept allows you the freedom to choose the angle of control and to combine it flexibly to achieve the desired effect.

Below, I have整理了完整的使用流程： (Note: please use dubbo-go version 1.3.0-rc3 and above)

Using Sentinel in dubbo-go mainly consists of the following steps:

1. Initialize Sentinel
2. Inject Sentinel into dubbo-go's filter
3. Initialize dubbo-go
4. Configure planning

## Initialize Sentinel

Example code:

```go
import (
	sentinel "github.com/alibaba/sentinel-golang/api"
)

func initSentinel() {
	err := sentinel.InitWithLogDir(confPath, logDir)
	if err != nil {
		// Failed to initialize Sentinel
	}
}
```

## Inject Sentinel into dubbo-go's filter

You can execute this using the import package form and call init() to inject the filter

```go
import (
	_ "github.com/alibaba/sentinel-golang/adapter/dubbo"
)
```

Alternatively, you can execute it manually and give your filter a name of your choice

```go
import (
  "github.com/apache/dubbo-go/common/extension"
  sd "github.com/alibaba/sentinel-golang/adapter/dubbo"
)

func main(){
  extension.SetFilter("myConsumerFilter",sd.GetConsumerFilter())
  extension.SetFilter("myProviderFilter",sd.GetConsumerFilter())
}
```

After completing the above steps, you can specify the sentinel filterName in the configuration of the necessary dubbo interfaces, thereby constructing the filter chain for the interface. For example, here is a consumer.yml configuration file:

```yml
references:
  "UserProvider":
    registry: "hangzhouzk"
    protocol : "dubbo"
    interface : "com.ikurento.user.UserProvider"
    cluster: "failover"
    filter: "myConsumerFilter"
    methods :
    - name: "GetUser"
      retries: 3
```

## Initialize dubbo-go

At this point, you only need to start the dubbo-go program normally to complete the service startup. Here’s a more complete example code:

```go
import (
	hessian "github.com/apache/dubbo-go-hessian2"
	sd "github.com/alibaba/sentinel-golang/adapter/dubbo"
)

import (
	"github.com/apache/dubbo-go/common/logger"
	_ "github.com/apache/dubbo-go/common/proxy/proxy_factory"
	"github.com/apache/dubbo-go/config"
	_ "github.com/apache/dubbo-go/filter/impl"
	_ "github.com/apache/dubbo-go/protocol/dubbo"
	_ "github.com/apache/dubbo-go/registry/protocol"

	_ "github.com/apache/dubbo-go/cluster/cluster_impl"
	_ "github.com/apache/dubbo-go/cluster/loadbalance"
	_ "github.com/apache/dubbo-go/registry/zookeeper"
	"github.com/apache/dubbo-go/common/extension"
)

func main() {

	hessian.RegisterPOJO(&User{})
  extension.SetFilter("myConsumerFilter",sd.GetConsumerFilter())
  extension.SetFilter("myProviderFilter",sd.GetConsumerFilter())
	config.Load()

	// init finish, do your work
	test()
}
```

## Configure Planning

Sentinel attracts many users with its powerful planning configuration, which provides dynamic data source interfaces for expansion. Users can dynamically configure rules through dynamic files or configuration centers like etcd. However, currently, Sentinel Golang as a beta version is still developing dynamic configuration.

### Dynamic Data Source

(Under development) Sentinel provides dynamic data source interfaces for expansion, allowing users to configure rules dynamically through files or configuration centers like etcd.

### Hard Coding Method

Sentinel also supports loading rules in the primitive hard coding way and can load rules using the `LoadRules(rules)` method of various modules. Below is an example of hard coding a QPS rate limit for a specific method on the consumer side:

```go
_, err := flow.LoadRules([]*flow.FlowRule{
	{
		ID:                666,
		Resource:         "dubbo:consumer:com.ikurento.user.UserProvider:myGroup:1.0.0:hello()",
		MetricType:        flow.QPS,
		Count:             10,
		ControlBehavior:   flow.Reject,
	},
})
if err != nil {
	// Failed to load rules, handle accordingly
}
```

# Summary

For a more detailed implementation, I will not elaborate further. You can refer to the source code for more understanding.

Finally, everyone is welcome to continue following us or contribute code. We look forward to dubbo-go making further breakthroughs in the cloud-native field in 2020.

dubbo-go repository address: https://github.com/apache/dubbo-go

