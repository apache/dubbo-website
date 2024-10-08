---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/user/quickstart/
    - /en/docs3-v2/dubbo-go-pixiu/user/quickstart/
    - /en/overview/reference/pixiu/user/quickstart/
    - /en/overview/mannual/dubbo-go-pixiu/user/quickstart/
description: Quick Start
linkTitle: Quick Start
title: Quick Start
type: docs
weight: 10
---


Let's quickly demonstrate Pixiu's capabilities by converting an HTTP request to a Dubbo2 request.

## Use Case

Pixiu converts the Client's HTTP request into a Dubbo2 request, which is then forwarded to the Dubbo Server. It then converts the Dubbo Server's response back into an HTTP response, finally returning it to the Client.

### Architecture Diagram

![Architecture](/imgs/pixiu/user/quick_start_architecture.png)

### Example

The example path can be found at `/samples/dubbogo/simple/resolve`.

#### Dubbo Server Implementation and Startup

The Dubbo Server provides interfaces for adding, deleting, modifying, and querying users. The specific code implementations can be found in the `server` directory under the example path.

The configuration of the Dubbo Server is as follows, registering the Dubbo2 protocol interface `com.dubbogo.pixiu.UserService`.

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

#### Pixiu Configuration and Startup

For the scenario of the use case, Pixiu needs to start the corresponding HTTP Listener to monitor HTTP requests, which will utilize `httpconnectionmanager`. Then, as it needs to convert HTTP requests into Dubbo requests, it requires `dgp.filter.http.dubboproxy`, where we set `auto_resolve` to true to enable the default HTTP to Dubbo conversion protocol (specific definitions can be found in the [Appendix](../appendix/http-to-dubbo-default-stragety)).

The specific configuration for Pixiu is as follows:

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

#### Client Implementation

The Client is a simple HTTP Client implementation but needs to populate corresponding data in the HTTP request's Path and Header according to the aforementioned HTTP to Dubbo default conversion protocol, as shown below.

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

#### Example Start

The project provides a quick start script, and the Go development environment should be installed locally.

```
# cd to the main example directory
cd samples/dubbogo/simple/

# Prepare the environment, start zk, and prepare the corresponding configuration files
./start.sh prepare resolve

# Start the dubbo server
./start.sh startServer resolve

# Start Pixiu 

./start.sh startPixiu resolve

# Start Client test case

./start.sh startTest resolve

# Or use curl 

curl -X POST 'http://localhost:8883/UserService/com.dubbogo.pixiu.UserService/GetUserByName' -d '{"types":"string","values":"tc"}' -H 'Content-Type: application/json' -H 'x-dubbo-http1.1-dubbo-version: 1.0.0' -H 'x-dubbo-service-protocol: dubbo' -H 'x-dubbo-service-version: 1.0.0' -H 'x-dubbo-service-group: test'

# Response {"age":15,"code":1,"iD":"0001","name":"tc","time":"2021-08-01T18:08:41+08:00"}

```

#### Docker Example

```shell
docker pull phial3/dubbo-go-pixiu:latest

docker run --name pixiuname -p 8883:8883 \
    -v /yourpath/conf.yaml:/etc/pixiu/conf.yaml \
    -v /yourpath/log.yml:/etc/pixiu/log.yml \
    apache/dubbo-go-pixiu:latest

# Start provider that uses zookeeper as the registration center first
cd samples/dubbogo/simple/resolve/server

# Add required environment variables, specifying the location of the provider's configuration file
export DUBBO_GO_CONFIG_PATH="../profiles/dev/server.yml"
export APP_LOG_CONF_FILE="../profiles/dev/log.yml"

# Start provider
go run server.go user.go

# Go to the test directory and start the test example
cd samples/dubbogo/simple/resolve/test

go test  pixiu_test.go
```
