---
title: Dubbogo 3.0 configuration center and configuration monitoring
weight: 2
type: docs
---

## 1. Configuration center concept

The configuration center means that in a distributed scenario, the latest framework configuration files and applications cannot be bound together. You can specify the information of the configuration center, such as the type and address of the configuration center, and pull it from the configuration center when the framework starts Start the corresponding configuration.

## 2. Configuration of the configuration center

Reference repository: [dubbo-go-samples/configcenter](https://github.com/apache/dubbo-go-samples/tree/master/configcenter)

dubbogo.yml

```yaml
dubbo:
  config-center:
    protocol: nacos
    address: 127.0.0.1:8848
    data-id: dubbo-go-samples-configcenter-nacos-server
    namespace: myNamespaceID # optional configuration nacos namespace ID, the default is public
    group: mygroup # Optional configuration nacos group, default is DEFAULT_GROUP
```

In the configuration center nacos

group defaults to `dubbo`

dataID is the specified id: `dubbo-go-samples-configcenter-nacos-server`

Write the framework configuration such as the following to start normally.

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      timeout: 3s
      address: 127.0.0.1:2181
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: com.apache.dubbo.sample.basic.IGreeter
```



## 3. Dubbogo dynamic configuration API

Config API is the API used by dubbogo 3.0 to manipulate the configuration structure. You can use the Config API provided by the framework to initialize the configuration structure, obtain component instances and use them. An example is as follows, including initialization of dynamic configuration instance, publish configuration, read configuration, and subscribe configuration operations.

```go
const configCenterNacosServerConfig = `# set in config center, group is 'dubbo', dataid is 'dubbo-go-samples-configcenter-nacos-server', namespace is default 'public'
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      address: 127.0.0.1:2181
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java`

type GreeterProvider struct {
  api. GreeterProviderBase
}

func (s *GreeterProvider) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
  logger.Infof("Dubbo3 GreeterProvider get user name = %s\n", in.Name)
  return &api.User{Name: "Hello " + in.Name, Id: "12345", Age: 21}, nil
}

// There is no need to export DUBBO_GO_CONFIG_PATH, as you are using config api to set config
func main() {
// Get dynamic configuration instance dynamicConfig
  dynamicConfig, err := config.NewConfigCenterConfigBuilder().
    SetProtocol("nacos").
    SetAddress("127.0.0.1:8848").
    SetGroup("dubbo").
    Build(). GetDynamicConfiguration()
  if err != nil {
    panic(err)
  }
  
  // Use the dynamicConfig structure to publish the configuration
  if err := dynamicConfig.PublishConfig("dubbo-go-samples-configcenter-nacos-server", "dubbo", configCenterNacosServerConfig); err != nil {
    panic(err)
  }
  
   // use dynamicConfig structure to read configuration
  data, err := dynamicConfig.GetRule("dubbo-go-samples-configcenter-nacos-server", config_center.WithGroup("dubbo"))
  if err != nil{
    panic(err)
  }
  logger.Infof("get config = %s", data)
  
  
  // Use the dynamicConfig structure to subscribe to configuration update events through a custom listener
  l := &listener{}
  dynamicConfig.AddListener("dubbo-go-samples-configcenter-nacos-server", l)
  
  time. Sleep(time. Second * 10)
  
  config. SetProviderService(&GreeterProvider{})

  // Start the framework in the form of API
  rootConfig := config. NewRootConfigBuilder().
    SetConfigCenter(config. NewConfigCenterConfigBuilder().
      SetProtocol("nacos").SetAddress("127.0.0.1:8848"). // Set the configuration center according to the configuration structure
      SetDataID("dubbo-go-samples-configcenter-nacos-server"). // Set configuration ID
      SetGroup("dubbo").
      Build()).
  build()

  if err := rootConfig.Init(); err != nil { // framework starts
    panic(err)
  }
  select {}
}

type listener struct {

}

func (l listener) Process(event *config_center. ConfigChangeEvent) {
  logger.Infof("listener get config = %s", event.Value)
}

```

Of course, when starting the framework in the form of API, you can start the framework directly in the form of API. 

## 4. Dubbogo configuration hot update

//todo

under development

