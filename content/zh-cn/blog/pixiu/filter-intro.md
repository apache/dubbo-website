---
title: 谈谈Pixiu的Filter
keywords: Pixiu 介绍
description: Filter通常是网关最重要的一部分，那Pixiu的过滤器链是如何运行的呢
author: mark4z
date: 2022-02-19
---

## **Filter的生命周期**

Pixiu作为一个面向云原生的gateway，通过简单的配置即可代理Http to Dubbo 2、Tripe甚至是Spring Cloud的请求。那Filter是怎样运行的呢？

首先**Filter Plugin**向**Filter Manager**注册自己**，**然后**Filter Manager**根据配置创建好**Filter Factory**并持有它们，等待请求来临时，**Manager**创建一个一次性的用于此次请求的Filter Chain，然后利用**Factory**创建好**Decode/Encode Filter**并把它们加入链中，然后按照顺序去运行Decode Filter，然后去请求**Upstream**，拿到Response再反向运行Encode Filter，让Filter可以访问到Response。

几个关键的概念：

**Filter Manager**

> Filter的Manger。。。

```go
// FilterManager manage filters
type FilterManager struct {
   filters       map[string]HttpFilterFactory
   filtersArray  []*HttpFilterFactory
}
```

**Filter Plugin**：定义了Filter的（唯一的）名字和描述如何去创建一个Filter Factory。

> 其实结合Filter Factory的定义，可以认为Plugin是Filter Factory的Factory

```go
// HttpFilterPlugin describe plugin
HttpFilterPlugin interface {
   // Kind returns the unique kind name to represent itself.
   Kind() string

   // CreateFilterFactory return the filter factory
   CreateFilterFactory() (HttpFilterFactory, error)
}
```

**Filter Factory**：定义了Filter自身的配置，并且在请求来临时创建真实的Filter并把它添加到FilterChain中

> - Config() 的目的是能让Filter Manager能够有机会把配置交给Factory（此时golang泛型还没有落地）
> - Apply() 在配置被注入到Factory后，有机会对config做一些检查和提前做一些初始化的工作
> - PrepareFilterChain() 创建Filter并加入Filter Chain

```go
// HttpFilterFactory describe http filter
HttpFilterFactory interface {
   // Config Expose the config so that Filter Manger can inject it, so it must be a pointer
   Config() interface{}

   // Apply After the config is injected, check it or make it to default
   Apply() error

   // PrepareFilterChain create filter and append it to FilterChain
   //
   // Be Careful !!! Do not pass the Factory's config pointer to the Filter instance,
   // Factory's config may be updated by FilterManager
   PrepareFilterChain(ctx *http.HttpContext, chain FilterChain) error
}
```

**Decode/Encode Filter：**Filter分为两个部分，**Decode**在实际请求**Upstream**之前，所以可以做一些鉴权、限流，把请求在gateway层拦截掉。**Eecode**则运行在获得**Upstream**的Response之后，所以可以对返回Log甚至修改Response。

> 一个Filter可以即是Decode Filter，又是Encode Filter，没有限制！
>
> 假设有A、B、C三个Filter，都是Decode/Encode Filter，如果配置的顺序是A、B、C，那么运行将会是下面这样
>
> 在Decode阶段 A->B->C，而在Encode阶段，顺序将会反过来！C->B->A



```go
// decode filters will be invoked in the config order: A、B、C, and decode filters will be
// invoked in the reverse order: C、B、A
HttpDecodeFilter interface {
   Decode(ctx *http.HttpContext) FilterStatus
}

// HttpEncodeFilter after invoke upstream,
// decode filters will be invoked in the reverse order
HttpEncodeFilter interface {
   Encode(ctx *http.HttpContext) FilterStatus
}
```

更详细的，每个Decode/Encode Filter可以返回一个FilterStatus来决定继续还是就在这里停下！比如JWT鉴权，token无效时就要及时把401返回给Downstream。当然Decode Filter发出的停止命令只会终止Decode阶段，至于为什么？想想如何做一个Access Log Filter，能在请求失败时也把失败的结果记录下吧来！



## **怎样编写一个自定义Filter**

我们来尝试写一个简单的Filter，这个Filter将会有简单的配置，在Decode阶段把请求的Body Log出来，并翻转后作为Mock的返回值。最后在Encode阶段根据配置把返回值Log出来。

1.首先创建一个Filter

```go
type DemoFilter struct {
   logPrefix string
}

func (f *DemoFilter) Decode(ctx *contexthttp.HttpContext) filter.FilterStatus {
   body, _ := ioutil.ReadAll(ctx.Request.Body)
   logger.Infof("request body: %s", body)

   //reverse res str
   runes := []rune(string(body))
   for i := 0; i < len(runes)/2; i += 1 {
      runes[i], runes[len(runes)-1-i] = runes[len(runes)-1-i], runes[i]
   }
   reverse := string(runes)

   //mock response
   ctx.SendLocalReply(200, []byte(reverse))
   return filter.Stop
}

func (f *DemoFilter) Encode(ctx *contexthttp.HttpContext) filter.FilterStatus {
   res := ctx.SourceResp.(string)
   logger.Infof("%s: %s", f.logPrefix, res)
   return filter.Continue
}
```

2.创建Filter Factory

```go
type (
	DemoFilterFactory struct {
		conf *Config
	}
	// Config describe the config of Filter
	Config struct {
		LogPrefix string `yaml:"logPrefix,omitempty"`
	}
)

func (f *DemoFilterFactory) PrepareFilterChain(ctx *contexthttp.HttpContext, chain filter.FilterChain) error {
   demo := &DemoFilter{logPrefix: f.conf.LogPrefix}

   chain.AppendDecodeFilters(demo)
   chain.AppendEncodeFilters(demo)
   return nil
}

func (f *DemoFilterFactory) Config() interface{} {
   return f.conf
}

func (f *DemoFilterFactory) Apply() error {
   return nil
}
```

3.创建Filter Plugin，并注册自己

```go
//important
func init() {
   filter.RegisterHttpFilter(&Plugin{})
}

type Plugin struct {
}

func (p *Plugin) Kind() string {
   return "dgp.filters.demo"
}

func (p *Plugin) CreateFilterFactory() (filter.HttpFilterFactory, error) {
	return &DemoFilterFactory{conf: &Config{}}, nil
}
```

4.配置文件中配置此Filter，并启动Pixiu

```yaml
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8888
      filter_chains:
          filters:
            - name: dgp.filter.httpconnectionmanager
              config:
                route_config:
                  routes:
                    - match:
                        prefix: "/"
                http_filters:
                  - name: dgp.filters.demo
                    config:
```

5.访问并查看日志与结果

```shell
curl localhost:8888/demo -d "eiv al tse’c"

c’est la vie% 
```

日志

```
2022-02-19T20:20:11.900+0800    INFO    demo/demo.go:62 request body: eiv al tse’c
2022-02-19T20:20:11.900+0800    INFO    demo/demo.go:71 : eiv al tse’c
```

