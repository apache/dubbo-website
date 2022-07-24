---
type: docs
title: "快速开始"
linkTitle: "快速开始"
weight: 10
---

让我们从将 HTTP 请求转换为 Dubbo2 请求的案例来快速展示 Pixiu 的能力。

## 用例

Pixiu 将 Client 的 HTTP 请求转换为 Dubbo2 请求，然后转发给背后的 Dubbo Server，然后将 Dubbo Server 的响应转换为 HTTP 响应，最后返回给 Client。

### 架构图

![Architecture](/imgs/pixiu/user/quick_start_architecture.png) 

### 案例

案例路径请查看 `/samples/dubbogo/simple/resolve`

#### Dubbo Server 实现和启动

Dubbo Server 提供用户增删改查的相关接口，其具体的代码实现见案例路径下的 `server`

Dubbo Server 的配置如下所示，注册了 Dubbo2 协议的 interface `com.dubbogo.pixiu.UserService`。

```yaml
dubbo:
  registries:
    zk:
      protocol: zookeeper
      timeout: 3s
      address: 127.0.0.1:2181
  protocols:
    dubbo:
      name: dubbo
      port: 20000
  provider:
    registry-ids: zk
    services:
      UserProvider:
        group: test
        version: 1.0.0
        cluster: test_dubbo
        serialization: hessian2
        interface: com.dubbogo.pixiu.UserService
```

#### Pixiu 配置和启动

为了用例的场景，Pixiu 需要启动对应的 HTTP Listener 进行 HTTP 请求的监听，所以就会使用到 `httpconnectionmanager`。
然后因为要将 HTTP 请求转换为 Dubbo请求，所以需要使用 `dgp.filter.http.dubboproxy`，这里我们将其`auto_resolve` 设置为true，表示开启 HTTP to Dubbo 默认转换协议(具体定义请看[附录](/zh-cn/docs/user/appendix/http-to-dubbo-default-stragety.html))。

Pixiu 的具体配置如下所示

```
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8883
      filter_chains:
          filters:
            - name: dgp.filter.httpconnectionmanager
              config:
                route_config:
                  routes:
                    - match:
                        prefix: "*"
                http_filters:
                  - name: dgp.filter.http.dubboproxy
                    config:
                      dubboProxyConfig:
                        auto_resolve: true
                        registries:
                          "zookeeper":
                            protocol: "zookeeper"
                            timeout: "3s"
                            address: "127.0.0.1:2181"
                            username: ""
                            password: ""
```


#### Client 实现

Client 就是简单的 HTTP Client 实现，但是需要按照前文提及的 HTTP to Dubbo 默认转换协议在 HTTP 请求的 Path 和 Header 中填入对应的数据，具体如下所示。

```
	url := "http://localhost:8883/UserService/com.dubbogo.pixiu.UserService/GetUserByName"
	data := "{\"types\":\"string\",\"values\":\"tc\"}"
	client := &http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest("POST", url, strings.NewReader(data))
	req.Header.Set("x-dubbo-http1.1-dubbo-version", "1.0.0")
	req.Header.Set("x-dubbo-service-protocol", "dubbo")
	req.Header.Set("x-dubbo-service-version", "1.0.0")
	req.Header.Set("x-dubbo-service-group", "test")

	assert.NoError(t, err)
	req.Header.Add("Content-Type", "application/json")
	resp, err := client.Do(req)
```


#### 案例启动

项目提供了快速启动脚本，需要本地先安装有 Go 语言开发环境。


```
# cd 到案例总目录
cd samples/dubbogo/simple/

# 进行环境准备，启动 zk 和准备对应配置文件
./start.sh prepare resolve

# 启动 dubbo server
./start.sh startServer resolve

# 启动 pixiu 

./start.sh startPixiu resolve

# 启动 Client 测试用例

./start.sh startTest resolve

# 或者使用 curl 

curl -X POST 'http://localhost:8883/UserService/com.dubbogo.pixiu.UserService/GetUserByName' -d '{"types":"string","values":"tc"}' -H 'Content-Type: application/json' -H 'x-dubbo-http1.1-dubbo-version':'1.0.0' -H 'x-dubbo-service-protocol':"dubbo" -H 'x-dubbo-service-version':'1.0.0' -H 'x-dubbo-service-group':'test'

# 返回值 {"age":15,"code":1,"iD":"0001","name":"tc","time":"2021-08-01T18:08:41+08:00"}

```

#### docker示例
```shell
docker pull phial3/dubbo-go-pixiu:latest

docker run --name pixiuname -p 8883:8883 \
    -v /yourpath/conf.yaml:/etc/pixiu/conf.yaml \
    -v /yourpath/log.yml:/etc/pixiu/log.yml \
    apache/dubbo-go-pixiu:latest

# http请求调用dubbo服务转换,首先启动provider，这里使用zookeeper作为注册中心
cd samples/dubbogo/simple/resolve/server

# 添加需要的环境变量，指定provider的配置文件位置
export DUBBO_GO_CONFIG_PATH="../profiles/dev/server.yml"
export APP_LOG_CONF_FILE="../profiles/dev/log.yml"

# 启动provider
go run server.go user.go

# 进入到test目录下，启动test示例
cd samples/dubbogo/simple/resolve/test

go test  pixiu_test.go
```
