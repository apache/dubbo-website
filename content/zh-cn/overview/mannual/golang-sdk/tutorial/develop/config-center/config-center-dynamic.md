---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/config-center/config-center-dynamic/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/config-center/config-center-dynamic/
description: Dubbogo 3.0 配置中心和配置监听
title: Dubbogo 3.0 配置中心和配置监听
type: docs
weight: 2
---






## 1. 配置中心概念

配置中心即为在分布式场景下，无法将最新的框架配置文件和应用程序绑定在一起，可以指定好配置中心的信息，例如配置中心类型和地址，并在框架启动时从配置中心拉取相应配置进行启动。

## 2. 配置中心的配置

参考仓库：[dubbo-go-samples/configcenter](https://github.com/apache/dubbo-go-samples/tree/master/configcenter)

dubbogo.yml 

```yaml
dubbo:
  config-center:
    protocol: nacos
    address: 127.0.0.1:8848
    data-id: dubbo-go-samples-configcenter-nacos-server
    namespace: myNamespaceID # 可选配置  nacos namespace ID, 默认是 public
    group: mygroup # 可选配置  nacos group, 默认是 DEFAULT_GROUP
```

配置中心 nacos 内

group 默认为 `dubbo`

dataID 为指定的id：`dubbo-go-samples-configcenter-nacos-server`

写入框架配置例如下面，即可正常启动。

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



## 3. Dubbogo 动态配置 API

Config API 为 dubbogo 3.0 用来操作配置结构的 API。可使用框架提供的 Config API 进行配置结构的初始化，获取组件实例并使用。一个例子如下，包含了动态配置实例的初始化、发布配置、读取配置、订阅配置操作。

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
  api.GreeterProviderBase
}

func (s *GreeterProvider) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
  logger.Infof("Dubbo3 GreeterProvider get user name = %s\n", in.Name)
  return &api.User{Name: "Hello " + in.Name, Id: "12345", Age: 21}, nil
}

// There is no need to export DUBBO_GO_CONFIG_PATH, as you are using config api to set config
func main() {
	 // 获取动态配置实例 dynamicConfig
  dynamicConfig, err := config.NewConfigCenterConfigBuilder().
    SetProtocol("nacos").
    SetAddress("127.0.0.1:8848").
    SetGroup("dubbo").
    Build().GetDynamicConfiguration()
  if err != nil {
    panic(err)
  }
  
  // 使用 dynamicConfig 结构来发布配置
  if err := dynamicConfig.PublishConfig("dubbo-go-samples-configcenter-nacos-server", "dubbo", configCenterNacosServerConfig); err != nil {
    panic(err)
  }
  
   // 使用 dynamicConfig 结构来读取配置
  data, err := dynamicConfig.GetRule("dubbo-go-samples-configcenter-nacos-server", 	config_center.WithGroup("dubbo"))
  if err != nil{
    panic(err)
  }
  logger.Infof("get config = %s", data)
  
  
  // 使用 dynamicConfig 结构, 通过自定义listener来订阅配置更新事件
  l := &listener{}
  dynamicConfig.AddListener("dubbo-go-samples-configcenter-nacos-server", l)
  
  time.Sleep(time.Second * 10)
  
  config.SetProviderService(&GreeterProvider{})

  // 以 API 的形式来启动框架
  rootConfig := config.NewRootConfigBuilder().
    SetConfigCenter(config.NewConfigCenterConfigBuilder().
      SetProtocol("nacos").SetAddress("127.0.0.1:8848"). // 根据配置结构，设置配置中心
      SetDataID("dubbo-go-samples-configcenter-nacos-server"). // 设置配置ID
      SetGroup("dubbo").
      Build()).
  Build()

  if err := rootConfig.Init(); err != nil { // 框架启动
    panic(err)
  }
  select {}
}

type listener struct {
	
}

func (l listener) Process(event *config_center.ConfigChangeEvent) {
  logger.Infof("listener get config = %s", event.Value)
}

```

当然，以 API 的形式来启动框架时，可以直接以API的形式来启动框架。

## 4. Dubbogo 配置热更新

// todo 

正在开发中ing