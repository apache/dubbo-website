---
aliases:
    - /zh/docs/languages/golang/dubbo-go-1.5/configuration/client/
description: 快速上手dubbo-go，编写一个简单的hellowworld应用
keywords: 消费端，client provider
linkTitle: client
title: client
type: docs
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/golang-sdk/quickstart/)。
{{% /pageinfo %}}

# client

## 第一步：编写消费端的服务

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



2. 与服务端不同的是，提供服务的方法作为结构体的参数，不需要编写具体业务逻辑。另外，`Provider` 不对应dubbo中的实现，而是对应一个接口。

   ```go
   type UserProvider struct {
   	GetUser func(ctx context.Context, req []interface{}, rsp *User) error
   }
   
   func (u *UserProvider) Reference() string {
   	return "UserProvider"
   }
   ```



3. 注册服务和对象

   ```go
   func init() {
   	config.SetConsumerService(userProvider)
   	hessian.RegisterPOJO(&User{})
   }
   ```

## 第二步：编写消费端主程序

1. 引入必需的dubbo-go包

   ```go
   import (
   	hessian "github.com/apache/dubbo-go-hessian2"
   	_ "github.com/apache/dubbo-go/cluster/cluster_impl"
   	_ "github.com/apache/dubbo-go/cluster/loadbalance"
   	_ "github.com/apache/dubbo-go/common/proxy/proxy_factory"
   	"github.com/apache/dubbo-go/config"
   	_ "github.com/apache/dubbo-go/filter/filter_impl"
   	_ "github.com/apache/dubbo-go/protocol/dubbo"
   	_ "github.com/apache/dubbo-go/registry/protocol"
   	_ "github.com/apache/dubbo-go/registry/zookeeper"
   
   	gxlog "github.com/dubbogo/gost/log"
   )
   ```



2. main 函数

   ```go
   func main() {
   	config.Load()
   	time.Sleep(3 * time.Second)
   
   	gxlog.CInfo("\n\n\nstart to test dubbo")
   	user := &pkg.User{}
   	err := userProvider.GetUser(context.TODO(), []interface{}{"A001"}, user)
   	if err != nil {
   		gxlog.CError("error: %v\n", err)
   		os.Exit(1)
   		return
   	}
   	gxlog.CInfo("response result: %v\n", user)
   }
   ```

## 第三步：编写配置文件并配置环境变量

1. 编辑配置文件 log.yml, client.yml

   - log.yml

   ~~~yml
   level: "debug"
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
   ~~~

   - log.yml

   ~~~yml
   # dubbo client yaml configure file
   
   check: true
   # client
   request_timeout: "3s"
   # connect timeout
   connect_timeout: "3s"
   
   # application config
   application:
     organization: "dubbo.io"
     name: "UserInfoClient"
     module: "dubbo-go user-info client"
     version: "0.0.1"
     environment: "dev"
   
   # registry config
   registries:
     "demoZk":
       protocol: "zookeeper"
       timeout: "3s"
       address: "127.0.0.1:2181"
       username: ""
       password: ""
   
   # reference config
   references:
     "UserProvider":
       registry: "demoZk"
       protocol: "dubbo"
       interface: "org.apache.dubbo.UserProvider"
       cluster: "failover"
       methods:
         - name: "GetUser"
           retries: 3
   
   # protocol config
   protocol_conf:
     dubbo:
       reconnect_interval: 0
       connection_number: 1
       heartbeat_period: "5s"
       session_timeout: "180s"
       pool_size: 64
       pool_ttl: 600
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
         session_name: "client"
   ~~~



2. 把上面的两个配置文件分别配置为环境变量，为防止log的环境变量和服务端的log环境变量冲突，建议所有的环境变量不要做全局配置，在当前起效即可。

   ```shell
   export CONF_CONSUMER_FILE_PATH="xxx"
   export APP_LOG_CONF_FILE="xxx"
   ```


本文章源码详情见git：https://github.com/apache/dubbo-go-samples/tree/1.5/helloworld/go-client
