---
title: Set current limit for the server
type: docs
weight: 3
---

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Create a new demo application

## 2. Modify the current limiting logic and verify

Dubbo-go provides users with built-in flow-limiting rejection logic, and supports users to define the required flow-limiting mechanism and rejection logic according to their own business scenarios.

Under normal circumstances, no flow limit is set. When the user configures the flow limit logic and parameters on the server side, it will

### 2.1 Configure current limiting parameters

go-server/conf/dubbogo.yaml: Configure current limiting parameters

```yaml
dubbo:
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: "" # read from pb
        tps.limiter: "method-service"
        tps.limit.strategy: "slidingWindow"
        tps.limit.rejected.handler: "default"
        tps.limit.interval: 1000
        tps.limit.rate: 3

```

Parameter Description:

- tps.limiter: current limiter selection. method-service is a current limiter built into the framework, which can configure service and method-level current limit logic, which can be customized.
- tps.limit.strategy: selection of current limiting strategy, slidingWindow is a built-in current limiting strategy of the framework, which can reject requests exceeding the traffic limit in the window in the form of a sliding window.
- tps.limit.rejected.handler: rejection strategy, default is the default rejection method, returns an empty object, can be customized
- tps.limit.interval: current limit window interval, the unit is ms.
- tps.limit.rate: The traffic limit in the window, the unit is the number of requests.

According to the above configuration, the server only allows the current interface to be called three times within one second.

### 2.2 Initiate a super-flow request to verify the current-limiting capability

Set the client's request logic to request five times per second, and calculate the success rate.

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

for {
goodCount := 0
badCount := 0
for {
time.Sleep(time.Millisecond*200)
reply, _ := grpcGreeterImpl.SayHello(context.Background(), req)
if reply.Name == "" {
badCount++
} else {
goodCount++
}
if badCount + goodCount == 5{
break
}
}
logger.Infof("Success rate = %v\n", float64(goodCount)/float64(goodCount + badCount))
}
}
```

It can be seen in the log that the request success rate is 0.6, and only three requests are allowed to be executed per second.

```bash
INFO cmd/client.go:62 Success rate = 0.6

INFO cmd/client.go:62 Success rate = 0.6

INFO cmd/client.go:62 Success rate = 0.6
```

You can see the rejection information in the server log:

```bash
ERROR tps/filter.go:84 The invocation was rejected due to over the limiter limitation...
```