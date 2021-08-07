---
type: docs
title: "快速开始"
linkTitle: "快速开始"
weight: 3
description: ""
---

## 定义服务
Dubbo3 推荐使用 IDL 定义跨语言服务，如期望使用特定语言的服务定义方式请移步[多语言](../languages)模块。

服务是 Dubbo 中的核心概念，一个服务代表一组 RPC 方法的集合，服务是面向用户编程、服务发现机制等的基本单位。基本流程是，用户定义 RPC 服务，通过约定的配置
方式将 RPC 声明为 Dubbo 服务，然后就可以基于服务进行编程了，对服务提供者来说，是提供 RPC 服务的具体实现，对服务消费者来说，则是使用特定数据发起服务调用。

```text
syntax = "proto3";

option java_multiple_files = true;
option java_package = "org.apache.dubbo.demo";
option java_outer_classname = "DemoServiceProto";
option objc_class_prefix = "DEMOSRV";

package demoservice;

// The demo service definition.
service DemoService {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}

```

以下是使用 IDL 定义服务的一个简单示例，我们可以把它命名为 `DemoService.proto`，proto 文件中定义了 RPC 服务名称 `DemoService` 与方法签名
 `SayHello (HelloRequest) returns (HelloReply) {}`，同时还定义了方法的入参结构体、出参结构体 `HelloRequest` 与 `HelloResponse`。
 IDL 格式的服务依赖 Protobuf 编译器，用来生成可以被用户调用的客户端与服务端编程 API，Dubbo 在原生 Protobuf Compiler 的基础上提供了适配多种语言的特有插件，用于适配 Dubbo 框架特有的 API 与编程模型。
 
> 使用 Dubbo3 IDL 定义的服务只允许一个入参与出参，这更有利于多语言实现与向后兼容性，支持依赖 Protobuf 序列化的向后兼容性透明的增删字段。

## 编译服务
根据当前采用的语言，配置配套的 Protobuf 插件，编译后将生产语言相关的服务定义 stub。

### Java
Java 语言生成的 stub 如下，核心是一个接口定义
```java
@javax.annotation.Generated(
value = "by Dubbo generator",
comments = "Source: DemoService.proto")
public interface DemoService {
    static final String JAVA_SERVICE_NAME = "org.apache.dubbo.demo.DemoService";
    static final String SERVICE_NAME = "demoservice.DemoService";

    org.apache.dubbo.demo.HelloReply sayHello(org.apache.dubbo.demo.HelloRequest request);

    CompletableFuture<org.apache.dubbo.demo.HelloReply> sayHelloAsync(org.apache.dubbo.demo.HelloRequest request);
}
```

### Golang

Go 语言生成的 stub 如下，这个 stub 里存了用户定义的接口和数据的类型。

```go
func _DUBBO_Greeter_SayHello_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(HelloRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	base := srv.(dgrpc.Dubbo3GrpcService)
	args := []interface{}{}
	args = append(args, in)
	invo := invocation.NewRPCInvocation("SayHello", args, nil)
	if interceptor == nil {
		result := base.GetProxyImpl().Invoke(ctx, invo)
		return result.Result(), result.Error()
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/main.Greeter/SayHello",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		result := base.GetProxyImpl().Invoke(context.Background(), invo)
		return result.Result(), result.Error()
	}
	return interceptor(ctx, in, info, handler)
}
```


## 配置并加载服务
提供端负责提供具体的 Dubbo 服务实现，也就是遵循 RPC 签名所约束的格式，去实现具体的业务逻辑代码。在实现服务之后，要将服务实现注册为标准的 Dubbo 服务，
之后 Dubbo 框架就能根据接收到的请求转发给服务实现，执行方法，并将结果返回。

消费端的配置会更简单一些，只需要声明 IDL 定义的服务为标准的 Dubbo 服务，框架就可以帮助开发者生成相应的 proxy，开发者将完全面向 proxy 编程，
基本上 Dubbo 所有语言的实现都保证了 proxy 依据 IDL 服务定义暴露标准化的接口。

### Java
提供端，实现服务
```java
public class DemoServiceImpl implements DemoService {
    private static final Logger logger = LoggerFactory.getLogger(DemoServiceImpl.class);

    @Override
    public HelloReply sayHello(HelloRequest request) {
        logger.info("Hello " + request.getName() + ", request from consumer: " + RpcContext.getContext().getRemoteAddress());
        return HelloReply.newBuilder()
                .setMessage("Hello " + request.getName() + ", response from provider: "
                        + RpcContext.getContext().getLocalAddress())
                .build();
    }

    @Override
    public CompletableFuture<HelloReply> sayHelloAsync(HelloRequest request) {
        return CompletableFuture.completedFuture(sayHello(request));
    }
}
```

提供端，注册服务(以 Spring XML 为例)
```xml
<bean id="demoServiceImpl" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
<dubbo:service serialization="protobuf" interface="org.apache.dubbo.demo.DemoService" ref="demoServiceImpl"/>
```

消费端，引用服务
```xml
<dubbo:reference scope="remote" id="demoService" check="false" interface="org.apache.dubbo.demo.DemoService"/>
```

消费端，使用服务 proxy
```java
public void callService() throws Exception {
    ...
    DemoService demoService = context.getBean("demoService", DemoService.class);
    HelloRequest request = HelloRequest.newBuilder().setName("Hello").build();
    HelloReply reply = demoService.sayHello(request);
    System.out.println("result: " + reply.getMessage());
}
```

### Golang

提供端，实现服务

```go
type User struct {
	ID   string
	Name string
	Age  int32
	Time time.Time
}

type UserProvider struct {
}

func (u *UserProvider) GetUser(ctx context.Context, req []interface{}) (*User, error) {
	gxlog.CInfo("req:%#v", req)
	rsp := User{"A001", "Alex Stocks", 18, time.Now()}
	gxlog.CInfo("rsp:%#v", rsp)
	return &rsp, nil
}

func (u *UserProvider) Reference() string {
	return "UserProvider"
}

func (u User) JavaClassName() string {
	return "org.apache.dubbo.User"
}

func main() {
    hessian.RegisterPOJO(&User{})
	config.SetProviderService(new(UserProvider))
}
```

消费端，使用服务 proxy

```go
func main() {
	config.Load()
	user := &pkg.User{}
	err := userProvider.GetUser(context.TODO(), []interface{}{"A001"}, user)
	if err != nil {
		os.Exit(1)
		return
	}
	gxlog.CInfo("response result: %v\n", user)
}
```


## 查看完整示例
* [Java IDL Quick Start](../languages/java/quick-start)
* [Golang IDL Quick Start](../languages/golang/quick-start)
* [Java 语言特定用法](../languages/java/java-specific)
* [Golang 语言特定用法](../languages/golang/go-specific)
