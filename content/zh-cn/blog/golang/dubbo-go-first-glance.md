---
title: "Dubbo Go 踩坑记"
linkTitle: "Dubbo Go 踩坑记"
tags: ["Go"]
date: 2021-01-11
description: 本文记录了一个用户第一次接入 Dubbo Go 的体验
---

## 扯淡

### 前尘

由于我的一个项目需要做公司用户鉴权，而组内其他小伙伴刚好有一个 *dubbo* 的鉴权 *rpc* ，一开始我是打算直接的读 *redis* 数据然后自己做解密。工作进行到一半，由于考虑到如果以后这个服务有任何变动，我这边要有联动行为，所以改用 *go* 来调用 *dubbo* 的 *rpc* ，于是我在 *github* 上找到了 [雨神](https://github.com/AlexStocks) 的 `https://github.com/apache/dubbo-go-samples/tree/master` (PS: 这个是 *dubbo-go* 前身)。不得不说，雨神是热心的人儿啊，当时还帮着我调试代码。最后也是接入了一个阉割版的吧，主要是当时 *hessian2* 对泛型支持的不怎么好。

### 现在

目前 [dubbo-go](https://github.com/apache/dubbo-go)隶属于 *apache* 社区，相比以前做了部分重构，并且维护也很活跃了。

## 接入

### 问题

目前整个项目在快速的迭代中，很多功能还没有完善，维护人员还没有时间来完善文档，所以在接入的时候要自己看源码或调试。

### 说明

目前我司在使用 *dubbo* 的过程使用的 *zookeeper* 作为注册中心，序列化是 *hessian2* ，所以我们要做如下初始化：

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

### 配置

由于我是接入客户端，所以我这边只配置了 *ConsumerConfig* 。

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

我这里是把 *dubbo-go* 作为第三方库来用，所以我没使用官方 [dubbo-samples](https://github.com/apache/dubbo-go-samples/) 那样在 *init* 函数中读入配置。

配置代码如下：

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

### 接入

好了，配置加载完就说明我们的准备工作已经做好了，接下来就要接入 *rpc* 接口了。

#### 返回值

一般 *rpc* 调用的返回值都是自定义的，所以我们也要告诉 *dubbo-go* 长什么样子。这个结构体要跟 *java* 的类对应起来，这里我们是要实现 *hessian2* 的 *interface* :

```golang
// POJO interface
// !!! Pls attention that Every field name should be upper case.
// Otherwise the app may panic.
type POJO interface {
	JavaClassName() string // got a go struct's Java Class package name which should be a POJO class.
}
```

我的实现如下：

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

这里的 *JavaClassName* 接口的意义就如函数签名一样，返回的就是 *java* 的类名。

#### 接口

要想调用 *dubbo* 的接口就必须实现下面这个 *interface*

```golang
// rpc service interface
type RPCService interface {
	Reference() string // rpc service id or reference id
}
```

所以我需要构造一个 *struct* 来做这个事情，比如：

```golang
type ITokenService struct {
	Validate func(ctx context.Context, req []interface{}, resp *Result) error `dubbo:"validate"`
}

func (i *ITokenService) Reference() string {
	return "ITokenService"
}
```

这个结构体一般是不会有什么数据成员。

这里我们注意到 *Validate* 函数声明后面跟的 *dubbo tag* ，这个是为如果 *rpc* 名称的首字母是小写（比如我要调用的 *dubbo* 接口就是 *validate* )准备的 *MethodMapper* ，类似于 *json* 的映射 *tag* 功效。一开始我就是遇到这个坑，我按官方的例子实现，日志一直说找不到接口，后来我也在官方群里询问大佬才知道有这个功能。

#### 注册

好了，上面的准备全部完成后，我们要做最后一步，那就是告诉 *dubbo-go* 我们想要的是什么。代码如下：

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

#### 调用

接下来我们就可以完成我们的 *DubboCli* 接口了，代码如下：

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

好了，至此我们就完成了 *dubbo-go* 的全部接入工作。 Happy Coding...

## 写在最后

其实代码格式这个问题，我在接入的时候跟官方群里的维护者大佬提过，使用 *go* 官方的代码格式工具 [goimports](https://github.com/golang/tools/tree/master/cmd/goimports) 来统一代码格式，这 样对于维护者以外的人提 *PR* 也是有利。我在接入的过程中遇到一个 *bug* ，我反馈给雨神，他就让我提了个 *PR* ，在整个过程就是这个 代码格式的问题，导致我反复的修改代码。