---
title: View monitoring information of RPC calls
type: docs
weight: 1
---

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Create a new demo application

## 2. Modify the client logic and initiate calls repeatedly

go-client/cmd/client.go

```go
func main() {
config. SetConsumerService(grpcGreeterImpl)
if err := config.Load(); err != nil {
panic(err)
}

logger.Info("start to test dubbo")
req := &api.HelloRequest{
Name: "Laurence",
}
for{ // repeat the call
reply, err := grpcGreeterImpl.SayHello(context.Background(), req)
if err != nil {
logger. Error(err)
}
logger.Infof("client response result: %v\n", reply)
}
}
```

## 3. View request RT information

Start the server and client service applications successively. View localhost:9090/metrics in the browser, search for "dubbo", and you can view the request delay of the exposed interface on the server, in ns.

```
$ curl localhost:9090/metrics | grep dubbo

# HELP dubbo_provider_service_rt
# TYPE dubbo_provider_service_rt gauge
dubbo_provider_service_rt{group="",method="SayHello",service="api.Greeter",timeout="",version="3.0.0"} 41084
```

It can be seen that the latest request rt is 41084 ns.