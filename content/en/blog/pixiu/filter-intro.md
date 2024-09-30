---
title: Talk About Pixiu's Filter
keywords: Introduction to Pixiu
description: The Filter is usually the most important part of the gateway. So how does Pixiu's filter chain work?
tags: ["Go", "Pixiu"]
author: mark4z
date: 2022-02-19
---

## **Lifecycle of the Filter**

As a cloud-native gateway, Pixiu can proxy Http to Dubbo 2, Tripe, or even Spring Cloud requests through simple configuration. So how does the Filter operate?

First, the **Filter Plugin** registers itself with the **Filter Manager**. Then, the **Filter Manager** creates **Filter Factory** based on configuration and holds them. When a request comes in, the **Manager** creates a one-time Filter Chain for this request, then uses the **Factory** to create **Decode/Encode Filters** and adds them to the chain. Then it runs the Decode Filters in order, goes to the **Upstream** to get the Response, and runs the Encode Filters in reverse order, allowing the Filter to access the Response.

Key concepts:

**Filter Manager**

> Filter Manger...

```go
// FilterManager manage filters
type FilterManager struct {
   filters       map[string]HttpFilterFactory
   filtersArray  []*HttpFilterFactory
}
```

**Filter Plugin**: Defines the (unique) name of the Filter and describes how to create a Filter Factory.

> The Plugin can be considered a Factory for Filter Factory in conjunction with the definition of Filter Factory.

```go
// HttpFilterPlugin describe plugin
HttpFilterPlugin interface {
   // Kind returns the unique kind name to represent itself.
   Kind() string

   // CreateFilterFactory return the filter factory
   CreateFilterFactory() (HttpFilterFactory, error)
}
```

**Filter Factory**: Defines the configurations of the Filter itself, creates the real Filter when a request comes in, and adds it to the FilterChain.

> - The purpose of Config() is to give the Filter Manager a chance to pass configurations to the Factory (at this point, Golang generics have not landed yet).
> - Apply() allows for some checks and initializes work after the config is injected into the Factory.
> - PrepareFilterChain() creates the Filter and appends it to the Filter Chain.

```go
// HttpFilterFactory describe http filter
HttpFilterFactory interface {
   // Config Expose the config so that Filter Manager can inject it, so it must be a pointer
   Config() interface{}

   // Apply After the config is injected, check it or make it default
   Apply() error

   // PrepareFilterChain create filter and append it to FilterChain
   PrepareFilterChain(ctx *http.HttpContext, chain FilterChain) error
}
```

**Decode/Encode Filter**: The Filter is divided into two parts; **Decode** occurs before actual requests to **Upstream**, allowing for authorization, rate limiting, and intercepting requests at the gateway level. **Encode** runs after receiving the **Upstream** response, allowing for logging and even modifying the Response.

> A Filter can be both a Decode Filter and an Encode Filter without restrictions!
>
> Assume there are three Filters A, B, C, all Decode/Encode Filters; if the configured order is A, B, C, the execution will proceed as follows:
>
> In the Decode phase A->B->C, while in the Encode phase the order will be reversed! C->B->A.

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

In more detail, each Decode/Encode Filter can return a FilterStatus to decide whether to continue or stop here! For example, for JWT authorization, return 401 to Downstream if the token is invalid. Note that the stop command issued by Decode Filter will only terminate the Decode phase. Why? Consider how to implement an Access Log Filter to record failure results even when requests fail!

## **How to Write a Custom Filter**

Let’s try to create a simple Filter. This Filter will have basic configurations, logging the request body in the Decode phase and returning it as a mock response after reversing it. Finally, it will log the return value based on the configurations in the Encode phase.

1. First, create a Filter.

```go
type DemoFilter struct {
   logPrefix string
}

func (f *DemoFilter) Decode(ctx *contexthttp.HttpContext) filter.FilterStatus {
   body, _ := ioutil.ReadAll(ctx.Request.Body)
   logger.Infof("request body: %s", body)

   // Reverse res str
   runes := []rune(string(body))
   for i := 0; i < len(runes)/2; i += 1 {
      runes[i], runes[len(runes)-1-i] = runes[len(runes)-1-i], runes[i]
   }
   reverse := string(runes)

   // Mock response
   ctx.SendLocalReply(200, []byte(reverse))
   return filter.Stop
}

func (f *DemoFilter) Encode(ctx *contexthttp.HttpContext) filter.FilterStatus {
   res := ctx.SourceResp.(string)
   logger.Infof("%s: %s", f.logPrefix, res)
   return filter.Continue
}
```

2. Create Filter Factory.

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

3. Create Filter Plugin and register it.

```go
// Important
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

4. Configure this Filter in the configuration file and start Pixiu.

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

5. Access and check the logs and results.

```shell
curl localhost:8888/demo -d "eiv al tse’c"

c’est la vie%
```

Logs

```
2022-02-19T20:20:11.900+0800    INFO    demo/demo.go:62 request body: eiv al tse’c
2022-02-19T20:20:11.900+0800    INFO    demo/demo.go:71 : eiv al tse’c
```

