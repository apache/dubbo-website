---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/dev/filter/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/dev/filter/
    - /zh-cn/overview/reference/pixiu/other/dev/filter/
    - /zh-cn/overview/mannual/dubbo-go-pixiu/dev/filter/
description: filter概述
linkTitle: filter概述
title: filter概述
type: docs
weight: 1
---


# Filter


Filter 提供请求处理抽象。用户可以将多个过滤器组合成过滤器链。
当从监听器接收到请求时，过滤器将在其预处理或后处理阶段逐一处理它。
因为 pixiu 想要提供网络协议转换功能，所以过滤器包含网络过滤器以及网络过滤器之下的过滤器，例如 http 过滤器。
请求处理顺序如下。

```
client -> listner -> network filter such as httpconnectionmanager -> http filter chain

```

### Http Filter List

您可以在 pkg/filter 中找到所有过滤器。以下仅列出一些过滤器。


- ratelimit 该过滤器使用 sentinel-go 提供速率限制功能；
- timeout 该过滤器提供超时功能；
- tracing 该过滤器使用 jaeger 提供追踪功能；
- grpcproxy 该过滤器提供 http 到 grpc 代理功能；
- httpproxy 该过滤器提供 http 到 http 代理功能；
- proxywrite 该过滤器提供 http 请求路径或头部修改功能；
- apiconfig 该过滤器提供 http 到 dubbo 转换映射功能，并与 remote 过滤器配合使用；
- remote 该过滤器提供 http 到 dubbo 代理功能，并与 apiconfig 过滤器配合使用。


### How to define custom http filter
#### step one

有两个抽象接口：plugin 和 filter。

```go
// HttpFilter 描述 http 过滤器
type HttpFilter interface {
    // PrepareFilterChain 将过滤器添加到链中
    PrepareFilterChain(ctx *http.HttpContext) error

    // Handle 过滤器钩子函数
    Handle(ctx *http.HttpContext)

    Apply() error

    // Config 获取过滤器的配置
    Config() interface{}
}

// HttpFilter 描述 http 过滤器
type HttpFilter interface {
    // PrepareFilterChain 将过滤器添加到链中
    PrepareFilterChain(ctx *http.HttpContext) error

    // Handle 过滤器钩子函数
    Handle(ctx *http.HttpContext)

    Apply() error

    // Config 获取过滤器的配置
    Config() interface{}
}
```

您应该定义自己的 plugin 和 filter，然后实现其函数。

此外，您可能需要定义过滤器专有的配置，如下所示。

```go
// Config 描述 Filter 的配置
type Config struct {		
	AllowOrigin []string `yaml:"allow_origin" json:"allow_origin" mapstructure:"allow_origin"`
	// AllowMethods access-control-allow-methods
	AllowMethods string `yaml:"allow_methods" json:"allow_methods" mapstructure:"allow_methods"`
	// AllowHeaders access-control-allow-headers
	AllowHeaders string `yaml:"allow_headers" json:"allow_headers" mapstructure:"allow_headers"`
	// ExposeHeaders access-control-expose-headers
	ExposeHeaders string `yaml:"expose_headers" json:"expose_headers" mapstructure:"expose_headers"`
	// MaxAge access-control-max-age
	MaxAge           string `yaml:"max_age" json:"max_age" mapstructure:"max_age"`
	AllowCredentials bool   `yaml:"allow_credentials" json:"allow_credentials" mapstructure:"allow_credentials"`
}
```

您可以在 plugin 的 CreateFilter 函数中初始化过滤器专有的配置实例，并在 config 函数中返回它。

```go

func (p *Plugin) CreateFilter() (filter.HttpFilter, error) {
     return &Filter{cfg: &Config{}}, nil
}

func (f *Filter) Config() interface{} {
	return f.cfg
}
```

然后 pixiu 将通过 pixiu 配置 yaml 文件填充其值。
在填充配置值后，pixiu 将调用 Apply 函数，您应该准备过滤器，例如获取远程信息等。
当请求到来时，pixiu 将调用 PrepareFilterChain 函数，以允许过滤器将自身添加到请求过滤器链中。

```go
func (f *Filter) PrepareFilterChain(ctx *http.HttpContext) error {
	ctx.AppendFilterFunc(f.Handle)
	return nil
}
```

如果不使用 AppendFilterFunc 将自身添加到过滤器链中，则过滤器将不会处理本次请求。
最终 pixiu 将调用 Handle 函数。

```go
func (f *Filter) Handle(ctx *http.HttpContext) {
	f.handleCors(ctx)
	ctx.Next()
}

```

在处理请求期间有两个阶段，预处理和后处理。在调用 ctx.Next 函数之前，阶段为预处理。而在调用它之后，阶段为后处理。



#### step two

在 init 函数中将 plugin 注册到管理中。

```go
const (
	// Kind is the kind of Fallback.
	Kind = constant.HTTPCorsFilter
)

func init() {
	filter.RegisterHttpFilter(&Plugin{})
}
```

#### step three

在 pkg/pluginregistry/registry.go 文件中添加未命名导入，以使 init 函数被调用。

```go
	_ "github.com/apache/dubbo-go-pixiu/pkg/filter/cors"
```


#### step four

在 yaml 文件中添加过滤器配置。

```go
http_filters:
  - name: dgp.filter.http.httpproxy
    config:
  - name: dgp.filter.http.cors
    config:
      allow_origin:
        - api.dubbo.com
      allow_methods: ""
      allow_headers: ""
      expose_headers: ""
      max_age: ""
      allow_credentials: false
```


#### example

有一个简单的过滤器位于 pkg/filter/cors，它提供 http cors 功能。

```go
type (
	// Plugin 是 http 过滤器插件。
	Plugin struct {
	}

	// Filter 是 http 过滤器实例
	Filter struct {
		cfg *Config
	}

	// Config 描述 Filter 的配置
	Config struct {
		AllowOrigin []string `yaml:"allow_origin" json:"allow_origin" mapstructure:"allow_origin"`
		// AllowMethods access-control-allow-methods
		AllowMethods string `yaml:"allow_methods" json:"allow_methods" mapstructure:"allow_methods"`
		// AllowHeaders access-control-allow-headers
		AllowHeaders string `yaml:"allow_headers" json:"allow_headers" mapstructure:"allow_headers"`
		// ExposeHeaders access-control-expose-headers
		ExposeHeaders string `yaml:"expose_headers" json:"expose_headers" mapstructure:"expose_headers"`
		// MaxAge access-control-max-age
		MaxAge           string `yaml:"max_age" json:"max_age" mapstructure:"max_age"`
		AllowCredentials bool   `yaml:"allow_credentials" json:"allow_credentials" mapstructure:"allow_credentials"`
	}
)

```
 
