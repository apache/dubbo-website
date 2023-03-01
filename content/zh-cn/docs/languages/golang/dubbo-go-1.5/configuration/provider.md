---
aliases:
    - /zh/docs/languages/golang/dubbo-go-1.5/configuration/provider/
description: 提示用户配置服务提供
keywords: 提供端，server provider
linkTitle: service providers
title: service providers
type: docs
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/golang-sdk/quickstart/)。
{{% /pageinfo %}}

# service providers

## 第一步：编写提供端的服务

1. 编写需要被编码的结构体，由于使用 `Hessian2` 作为编码协议，`User` 需要实现 `JavaClassName` 方法，它的返回值在dubbo中对应User类的类名。

   ```go
   type User struct {
   	Id   string
   	Name string
   	Age  int32
   	Time time.Time
   }
   
   func (u User) JavaClassName() string {
   	return "org.apache.dubbo.User"
   }
   ```



2. 编写业务逻辑，`UserProvider` 相当于dubbo中的一个服务实现。需要实现 `Reference` 方法，返回值是这个服务的唯一标识，对应dubbo的 `beans` 和 `path` 字段。

   ```go
   type UserProvider struct {
   }
   
   func (u *UserProvider) GetUser(ctx context.Context, req []interface{}) (*User, error) {
   	println("req:%#v", req)
   	rsp := User{"A001", "hellowworld", 18, time.Now()}
   	println("rsp:%#v", rsp)
   	return &rsp, nil
   }
   
   func (u *UserProvider) Reference() string {
   	return "UserProvider"
   }
   ```



3. 注册服务和对象

   ```go
   func init() {
   	config.SetProviderService(new(UserProvider))
   	// ------for hessian2------
   	hessian.RegisterPOJO(&User{})
   }
   ```



## 第二步：编写主程序

1. 引入必需的dubbo-go包

   ```go
   import (
   	hessian "github.com/apache/dubbo-go-hessian2"
   	_ "github.com/apache/dubbo-go/cluster/cluster_impl"
   	_ "github.com/apache/dubbo-go/cluster/loadbalance"
   	"github.com/apache/dubbo-go/common/logger"
   	_ "github.com/apache/dubbo-go/common/proxy/proxy_factory"
   	"github.com/apache/dubbo-go/config"
   	_ "github.com/apache/dubbo-go/filter/filter_impl"
   	_ "github.com/apache/dubbo-go/protocol/dubbo"
   	_ "github.com/apache/dubbo-go/registry/protocol"
   	_ "github.com/apache/dubbo-go/registry/zookeeper"
   )
   ```



2. main 函数

   ```go
   func main() {
     config.Load()
   }
   ```



## 第三步：编写配置文件并配置环境变量

1. 设置配置文件 log.yml, server.yml

    -  **log.yml**

   ```yml
   level: "error"
   development: true
   disableCaller: false
   disableStacktrace: false
   sampling:
   encoding: "console"
   
   # encoder
   encoderConfig:
     messageKey: "message"
     levelKey: "level"
     timeKey: "time"
     nameKey: "logger"
     callerKey: "caller"
     stacktraceKey: "stacktrace"
     lineEnding: ""
     levelEncoder: "capital"
     timeEncoder: "iso8601"
     durationEncoder: "seconds"
     callerEncoder: "short"
     nameEncoder: ""
   
   outputPaths:
     - "stderr"
   errorOutputPaths:
     - "stderr"
   initialFields:
   ```

    - server.yml

   ```yml
   # dubbo server yaml configure file
   
   # application config
   application:
     organization: "dubbo.io"
     name: "UserInfoServer"
     module: "dubbo-go user-info server"
     version: "0.0.1"
     environment: "dev"
   
   # registry config
   registries:
     "demoZk":
       protocol: "zookeeper"
       timeout: "3s"
       address: "127.0.0.1:2181"
   
   # service config
   services:
     "UserProvider":
       registry: "demoZk"
       protocol: "dubbo"
       interface: "org.apache.dubbo.UserProvider"
       loadbalance: "random"
       warmup: "100"
       cluster: "failover"
       methods:
         - name: "GetUser"
           retries: 1
           loadbalance: "random"
   
   # protocol config
   protocols:
     "dubbo":
       name: "dubbo"
       port: 20000
   
   protocol_conf:
     dubbo:
       session_number: 700
       session_timeout: "180s"
       getty_session_param:
         compress_encoding: false
         tcp_no_delay: true
         tcp_keep_alive: true
         keep_alive_period: "120s"
         tcp_r_buf_size: 262144
         tcp_w_buf_size: 65536
         pkg_rq_size: 1024
         pkg_wq_size: 512
         tcp_read_timeout: "1s"
         tcp_write_timeout: "5s"
         wait_timeout: "1s"
         max_msg_len: 1024000
         session_name: "server"
   ```

   主要编辑以下部分：

    - `registries` 结点下需要配置zk的数量和地址
    - `services` 结点下配置服务的具体信息，需要配置 `interface` 配置，修改为对应服务的接口名，服务的key对应第一步中 `Provider` 的 `Reference` 返回值

2. 把上面的两个配置文件分别配置为环境变量

   ```shell
   export CONF_PROVIDER_FILE_PATH="xxx"
   export APP_LOG_CONF_FILE="xxx"
   ```


本文章源码详情见git：https://github.com/apache/dubbo-go-samples/tree/1.5/helloworld/go-server
