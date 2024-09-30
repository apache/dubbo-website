---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/user/configurations/
    - /en/docs3-v2/dubbo-go-pixiu/user/configurations/
    - /en/overview/reference/pixiu/user/configurations/
    - /en/overview/mannual/dubbo-go-pixiu/user/configurations/
description: Start and configuration
linkTitle: Start and configuration
title: Start and configuration
type: docs
weight: 20
---






### Pixiu Startup Command

Pixiu has two forms: Gateway and Sidecar. The command for the Pixiu executable is as follows, where pixiu is the name of the executable file. Note that the path after -c is the absolute path of the local configuration file.

```
pixiu gateway start -c /config/conf.yaml
```

### Configuration Detailed Explanation 

Pixiu accepts YAML formatted files as its main configuration file for configuring various components of Pixiu. Taking the configuration file from Quick Start as an example, we will explain its components in detail and list possible extensions.

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

First, similar to the `envoy` configuration, `static_resources` indicates that all the following configurations are static. This includes components such as Listener, NetworkFilter, Route, and HttpFilter, which are not completely independent of each other.

#### Listener

For example, the above configuration declares an HTTP type Listener listening on port 8883. More Listener configurations can be found in [Listener](../listener/http/).

```
  listeners:
    - name: "net/http"
      protocol_type: "HTTP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8883
      filter_chains:
```
The configuration of listeners has `protocol_type`, indicating that it is an HTTP type Listener, and `address`, which configures the listening address and port, while `filter_chains` specifies which NetworkFilters should handle requests received by this Listener.

#### NetworkFilter

NetworkFilter is one of Pixiu's key components, composed of Route and HttpFilter, responsible for receiving requests passed from Listener and processing them.

```
filters:
            - name: dgp.filter.httpconnectionmanager
              config:
                route_config:
                http_filters:
```

The above configuration specifies using the `dgp.filter.httpconnectionmanager` NetworkFilter, which can process HTTP `Request` and `Response` and configure route information and use HttpFilters for chained processing of requests. More NetworkFilters can be found in the [NetworkFilter documentation](../networkfilter/http/).

#### Route and Cluster

Route can be used for routing requests, as exemplified by the following configuration. For detailed configuration files, please see the configuration files in `/samples/http/simple`.

```
            - name: dgp.filter.httpconnectionmanager
              config:
                route_config:
                  routes:
                    - match:
                        prefix: "/user"
                      route:
                        cluster: "user"
```

The above configuration specifies that for HTTP requests with a path prefix of `/user`, they will be forwarded to a cluster service group named user.

The specific definition of the cluster is shown below:

```
  clusters:
    - name: "user"
      lb_policy: "RoundRobin"
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 1314
```

The above configuration defines a cluster named user with a load balancing policy of RoundRobin, which includes one endpoint instance with the address 127.0.0.1.

Currently, forwarding HTTP or gRPC requests requires using Route and Cluster. However, there is no need for both in scenarios involving forwarding Dubbo-related requests.

#### HttpFilter

When a NetworkFilter receives a request from a Listener, it needs to perform a series of operations, such as rate limiting and authorization, and finally forward the request to specific upstream services. These tasks are handled by the HttpFilter chain associated with the NetworkFilter.

```
            - name: dgp.filter.httpconnectionmanager
              config:
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

As shown in the configuration above, the `httpconnectionmanager` NetworkFilter has an HttpFilter chain, which includes the `dgp.filter.http.dubboproxy` HttpFilter. It is responsible for converting HTTP requests into Dubbo requests and forwarding them. It requires configuration of the address of a Dubbo cluster registration center, specified as middleware in Zookeeper. The `auto_resolve` specifies using the default HTTP to Dubbo conversion protocol for related data conversions, which can be referenced in [Default Conversion Protocol](../appendix/http-to-dubbo-default-stragety/).

More HttpFilters can be found in the [HttpFilter documentation](../httpfilter/dubbo/).

#### Adapter

Adapter represents the capability of Pixiu to interact with external metadata centers. Currently, there are two: `dgp.adapter.dubboregistrycenter` and `dgp.adapter.springcloud`, representing retrieval of service instance information from Dubbo cluster registration centers and Spring Cloud cluster registration centers respectively to build Pixiu forwarding HTTP request routing rules.

More Adapters can be found in the [Adapter documentation](../adapter/dubbo/)。

