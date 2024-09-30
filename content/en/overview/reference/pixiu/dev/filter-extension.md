---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/dev/filter-extension/
    - /en/docs3-v2/dubbo-go-pixiu/dev/filter-extension/
    - /en/overview/reference/pixiu/dev/filter-extension/
    - /en/overview/mannual/dubbo-go-pixiu/dev/filter-extension/
description: Introduction to the Pixiu Filter System
linkTitle: Introduction to the Pixiu Filter System
title: Introduction to the Pixiu Filter System
type: docs
weight: 1
---






## **How to Write a Filter**
`For more detailed information, please refer to the Blog "Talking About Pixiu's Filter"`

Let's try writing a simple Filter that will have a basic configuration, log the request Body during the Decode phase, and return the reversed string as a Mock response. Finally, in the Encode phase, it will log the return value based on the configuration.

1. First, create a Filter

```go
type DemoFilter struct {
   logPrefix string
}

// Decode phase, occurs before calling Upstream
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

// Encode phase, at this point the Upstream Response can be accessed
func (f *DemoFilter) Encode(ctx *contexthttp.HttpContext) filter.FilterStatus {
   res := ctx.SourceResp.(string)
   logger.Infof("%s: %s", f.logPrefix, res)
   return filter.Continue
}
```

2. Create a Filter Factory

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

3. Create a Filter Plugin and register it

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

4. Configure this Filter in the configuration file and start Pixiu

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

5. Access and check the logs and results

```shell
curl localhost:8888/demo -d "eiv al tse’c"

c’est la vie% 
```

Logs

```
2022-02-19T20:20:11.900+0800    INFO    demo/demo.go:62 request body: eiv al tse’c
2022-02-19T20:20:11.900+0800    INFO    demo/demo.go:71 : eiv al tse’c
```

