---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/dev/filter-extension/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/dev/filter-extension/
description: Pixiu Filter体系介绍
linkTitle: Pixiu Filter体系介绍
title: Pixiu Filter体系介绍
type: docs
weight: 1
---






## **怎样编写一个Filter**
`更详细的信息，请移步Blog《谈谈Pixiu的Filter》`

我们来尝试写一个简单的Filter，这个Filter将会有简单的配置，在Decode阶段把请求的Body Log出来，并翻转后作为Mock的返回值。最后在Encode阶段根据配置把返回值Log出来。

1.首先创建一个Filter

```go
type DemoFilter struct {
   logPrefix string
}

// Decode阶段，发生在调用Upstream之前
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

// Encode阶段，此时可以获取到Upstream的Response
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