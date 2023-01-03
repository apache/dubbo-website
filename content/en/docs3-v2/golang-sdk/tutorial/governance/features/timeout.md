---
title: timeout for configuration calls
type: docs
weight: 1
---

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Create a new demo application

## 2. Modify RPC call-related parameters through configuration items

### 2.1 Modify the timeout of the call and verify

```yaml
dubbo:
  consumer:
    request-timeout: 15s # Configure client timeout
```

The default RPC timeout of the Dubbo-go application is 3s. After the request times out, the client will return an error with the error context deadline exceeded. In this task, you need to first modify the server function of the demo application to take a long time, and then check the client's timeout error; and then configure the client timeout so that the time-consuming function can be called normally.

1. go-server/cmd/server.go: Modify the function of the demo application server to a function that takes 10s

   ```go
   func (s *GreeterProvider) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
   logger.Infof("Dubbo3 GreeterProvider get user name = %s\n", in.Name)
   time.Sleep(time.Second*10) // sleep 10s
   return &api.User{Name: "Hello " + in.Name, Id: "12345", Age: 21}, nil
   }
   ```

2. The client initiates a call and observes the error log

   ```
   ERROR cmd/client.go:47 context deadline exceeded
   ```

3. go-client/conf/dubbogo.yaml: client modification timeout

   ```yaml
   dubbo:
     consumer:
       request-timeout: 15s # Configure client timeout
       references:
         GreeterClientImpl:
           protocol: tri
           url: "tri://localhost:20000"
           interface: "" # read from pb
   ```

4. Initiate the call through the client again, observe the log, and return normally:

   ```bash
   client response result: name: "Hello laurence" id: "12345" age:21
   ```