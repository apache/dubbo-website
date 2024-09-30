---
title: "Dubbo Go Pitfalls"
linkTitle: "Dubbo Go Pitfalls"
tags: ["Go"]
date: 2021-01-11
description: This article records a user's experience of integrating Dubbo Go for the first time.
---

## Nonsense

### Past

Due to a project requiring user authentication for the company, and since some colleagues in the group had a *dubbo* authentication *rpc*, I initially planned to directly read *redis* data and decrypt it myself. Halfway through the work, considering potential future changes to this service that would require some reactive behavior, I decided to call *dubbo*'s *rpc* using *go*, and thus I found [Yushen](https://github.com/AlexStocks)'s `https://github.com/apache/dubbo-go-samples/tree/master` (PS: this is the predecessor of *dubbo-go*). I have to say, Yushen is a warm-hearted person; he helped me debug the code at that time. Ultimately, I integrated a trimmed version primarily because *hessian2* had poor support for generics at that time.

### Now

Currently, [dubbo-go](https://github.com/apache/dubbo-go) belongs to the *apache* community, which has undergone some refactoring compared to before and is now maintained much more actively.

## Integration

### Issues

The entire project is currently undergoing rapid iteration, and many features are not fully developed; maintenance personnel haven't had time to improve the documentation, so you'll need to refer to the source code or debug during integration.

### Description

Currently, our company uses *zookeeper* as the registry when using *dubbo*, and serialization is *hessian2*, so we need to initialize as follows:

```golang
  import (
      _ "github.com/apache/dubbo-go/common/proxy/proxy_factory"
      _ "github.com/apache/dubbo-go/registry/protocol"

      _ "github.com/apache/dubbo-go/filter/impl"

      _ "github.com/apache/dubbo-go/cluster/cluster_impl"
      _ "github.com/apache/dubbo-go/cluster/loadbalance"
      _ "github.com/apache/dubbo-go/registry/zookeeper"
  )
```

### Configuration

Since I am integrating the client, I have only configured *ConsumerConfig*.

```yaml
dubbo:
    # client
    request_timeout: "3s"
    # connect timeout
    connect_timeout: "3s"
    check: true
    application:
        organization: "dfire.com"
        name: "soa.sso.ITokenService"
        module: "dubbogo token service client"
        version: "1.0.0"
        owner: "congbai"
    registries:
        "hangzhouzk":
            protocol: "zookeeper"
            timeout: "3s"
            address: "zk1.2dfire-daily.com:2181"
            username: ""
            password: ""
    references:
        "ITokenService":
            registry: "hangzhouzk"
            protocol: "dubbo"
            interface: "com.dfire.soa.sso.ITokenService"
            version: "1.0.0"
            methods:
                - name: "validate"
            retries: "3"
```

I am using *dubbo-go* as a third-party library, so I did not read the configuration in the *init* function like in the official [dubbo-samples](https://github.com/apache/dubbo-go-samples/).

The configuration code is as follows:

```golang
  import (
      "github.com/apache/dubbo-go/config"
      "github.com/apache/dubbo-go/protocol/dubbo"
  )

  type DubboCli struct {
  }

  func NewCli(cconf config.ConsumerConfig) *DubboCli {
      config.SetConsumerConfig(cconf)

      dubbo.SetClientConf(dubbo.GetDefaultClientConfig())

      config.Load()

      return &DubboCli{}
  }
```

### Integration

Alright, with the configuration loaded, it indicates our preparatory work is ready, and we can now integrate the *rpc* interface.

#### Return Value

Generally, the return value of an *rpc* call is custom, so we also need to specify how it should look to *dubbo-go*. This struct should correspond to the *java* class; here we need to implement the *hessian2* *interface*:

```golang
// POJO interface
// !!! Pls attention that Every field name should be upper case.
// Otherwise the app may panic.
type POJO interface {
	JavaClassName() string // got a go struct's Java Class package name which should be a POJO class.
}
```

My implementation is as follows:

```golang
type Result struct {
	Model       interface{}   `json:"model,omitempty"`
	Models      []interface{} `json:"models,omitempty"`
	ResultCode  string        `json:"resultCode"`
	Success     bool          `json:"success"`
	Message     string        `json:"message"`
	TotalRecord int           `json:"totalRecord"`
}

func (r Result) JavaClassName() string {
	return "com.twodfire.share.result.ResultSupport"
}
```

The purpose of the *JavaClassName* interface is similar to a function signature, returning the name of the *java* class.

#### Interface

To call a *dubbo* interface, the following *interface* must be implemented:

```golang
// rpc service interface
type RPCService interface {
	Reference() string // rpc service id or reference id
}
```

So I need to construct a *struct* for this purpose, for example:

```golang
type ITokenService struct {
	Validate func(ctx context.Context, req []interface{}, resp *Result) error `dubbo:"validate"`
}

func (i *ITokenService) Reference() string {
	return "ITokenService"
}
```

This struct generally won't have any data members.

Here we note that the *Validate* function declaration is followed by the *dubbo tag*, which is for when the *rpc* name's first letter is lowercase (for example, the *dubbo* interface I want to call is *validate*), serving as a *MethodMapper*, similar to the mapping effect of a *json* tag. Initially, I encountered this pit; I implemented according to the official example, and the logs kept saying the interface could not be found. Later, I inquired in the official group and was informed of this feature.

#### Registration

Alright, after completing the preparations above, we need to do the last step, which is to inform *dubbo-go* what we want. The code is as follows:

```golang
  import (
      hessian "github.com/apache/dubbo-go-hessian2"
      "github.com/apache/dubbo-go/config"
  )

  var tokenProvider = new(ITokenService)

  func init() {
      config.SetConsumerService(tokenProvider)
      hessian.RegisterPOJO(&Result{})
  }
```

#### Call

Next, we can complete our *DubboCli* interface. The code is as follows:

```golang
func (d *DubboCli) CheckUser(token, app string) (bool, error) {
	args := []interface{}{token, app}
	resp := &Result{}

	if err := tokenProvider.Validate(context.Background(), args, resp); err != nil {
		return false, err
	}
	if resp.Success {
		return resp.Success, nil
	}
	return resp.Success, errors.New(resp.Message)
}
```

That’s it; we have completed the entire integration work of *dubbo-go*. Happy Coding...

## Final Words

Actually, regarding the code formatting issue, I had previously mentioned it to a maintainer in the official group. Using the official *go* code formatting tool [goimports](https://github.com/golang/tools/tree/master/cmd/goimports) to unify the code format is beneficial for people other than maintainers submitting *PR* as well. I encountered a *bug* during integration, and when I reported it to Yushen, he asked me to submit a *PR*. The entire process highlighted the code formatting issue, which caused me to repeatedly modify the code.
