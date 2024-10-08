---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/user/samples/http_proxy/
    - /en/docs3-v2/dubbo-go-pixiu/user/samples/http_proxy/
    - /en/overview/reference/pixiu/user/samples/http_proxy/
    - /en/overview/mannual/dubbo-go-pixiu/user/samples/http_proxy/
description: Introduction to Http Proxy Case
linkTitle: Introduction to Http Proxy Case
title: Introduction to Http Proxy Case
type: docs
weight: 10
---






### HTTP Proxy

The HTTP Proxy case demonstrates Pixiu's ability to receive external HTTP requests and forward them to the underlying HTTP Server.

![img](/imgs/pixiu/user/samples/http_proxy.png)

For the case code, please refer to `/samples/http/simple`. The directory structure and purpose in the case are as follows:

```
- pixiu # Pixiu configuration file
- server # http server
- test # client or unit test
```


Let's take a closer look at the specific configuration file for pixiu.

```
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP" # Use HTTP Listener
      address:
        socket_address:
          address: "0.0.0.0" # Set the listening address to 0.0.0.0
          port: 8888  # Set port to 8888
      filter_chains:
          filters:
            - name: dgp.filter.httpconnectionmanager  # Set NetworkFilter to httpconnectionmanager
              config:
                route_config:
                  routes:
                    - match:
                        prefix: "/user"    # Set routing rules to forward requests with /user prefix to the cluster named user
                      route:
                        cluster: "user"
                        cluster_not_found_response_code: 505
                http_filters:
                  - name: dgp.filter.http.httpproxy  # Use dgp.filter.http.httpproxy for forwarding
                    config:

  clusters:
    - name: "user"  # Configure a cluster named user with one instance at address 127.0.0.1:1314
      lb_policy: "random" 
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 1314
```


First, start the Http Server in the `Server` folder and then use the following command to start `Pixiu`. Finally, execute the unit tests in the test folder. Note that -c should be followed by the absolute path of the local configuration file.

```
pixiu gateway start -c /pixiu/conf.yaml
```

