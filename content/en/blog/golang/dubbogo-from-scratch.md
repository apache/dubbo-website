---
title: "dubbo-go in Plain Language"
linkTitle: "dubbo-go in Plain Language"
tags: ["Go"]
date: 2021-02-20
description: >
    This article teaches you step by step how to use dubbogo to call service providers offered by dubbogo or dubbo.
---



## I. Introduction


> This article is based on dubbogo [1.5.4](https://github.com/apache/dubbo-go/releases/tag/v1.5.4) version



Recently, I started participating in some development and testing of dubbogo. Previously, I would directly verify functions using examples from [samples](https://github.com/apache/dubbo-go-samples), but this time, to reproduce a functional issue, I plan to build a dubbogo and dubbo calling project from scratch. I encountered some pitfalls that new users might face when using dubbogo, and I documented this process for reference.


Through this article, you can learn about:

- How to configure dubbogo consumers to call dubbo and dubbogo service providers.
- An introduction to the problem-solving ideas through an actual BUG.



## II. Solving the Problem


### 2.1 Preparing the Dubbo Service Provider


#### 2.1.1 Basic Definition


Define the `DemoService` interface:


```java
public interface DemoService {

    String sayHello(String name);

    String sayHello(User user);

    String sayHello(User user, String name);

}
```


Define the `User` object:


```java
public class User implements Serializable {

    private String name;

    private int age;

    ......
}
```


#### 2.1.2 Starting the Dubbo Service Provider


Using the [official dubbo sample code](/en/docsv2.7/user/configuration/api/):


```java
public static void main(String[] args) throws IOException {
    // Service implementation
    DemoService demoService = new DemoServiceImpl();

    // Current application configuration
    ApplicationConfig application = new ApplicationConfig();
    application.setName("demoProvider");

    // Connect to registry configuration
    RegistryConfig registry = new RegistryConfig();
    registry.setAddress("127.0.0.1:2181");
    registry.setProtocol("zookeeper");
    registry.setUsername("");
    registry.setPassword("");

    // Service provider protocol configuration
    ProtocolConfig protocol = new ProtocolConfig();
    protocol.setName("dubbo");
    protocol.setPort(12345);
    protocol.setThreads(200);

    // Note: ServiceConfig is a heavy object that internally encapsulates the connection to the registry and opens the service port.

    // Service provider exposes service configuration
    ServiceConfig<DemoService> service = new ServiceConfig<>(); // This instance is heavy and encapsulates the connection to the registry. Please cache it as it may cause memory and connection leaks.
    service.setApplication(application);
    service.setRegistry(registry); // Multiple registries can be set using setRegistries()
    service.setProtocol(protocol); // Multiple protocols can be set using setProtocols()
    service.setInterface(DemoService.class);
    service.setRef(demoService);
    service.setVersion("1.0.0");
    service.setGroup("tc");
    service.setTimeout(60 * 1000);

    // Expose and register service
    service.export();

    System.in.read();
}
```


Check Zookeeper to see if registration was successful:


```bash
$ls /dubbo/com.funnycode.DemoService/providers
[dubbo%3A%2F%2F127.0.0.1%3A12345%2Fcom.funnycode.DemoService%3Fanyhost%3Dtrue%26application%3DdemoProvider%26deprecated%3Dfalse%26dubbo%3D2.0.2%26dynamic%3Dtrue%26generic%3Dfalse%26group%3Dtc%26interface%3Dcom.funnycode.DemoService%26methods%3DsayHello%26pid%3D18167%26release%3D2.7.7%26revision%3D1.0.0%26side%3Dprovider%26threads%3D200%26timestamp%3D1606896020691%26version%3D1.0.0]
```


The output above indicates that the service provider has started.


### 2.2 Preparing the Dubbogo Service Consumer


#### 2.2.1 Basic Definition


Define the `User` object:


```go
type User struct {
	Name string
	Age  int
}

func (User) JavaClassName() string {
	return "com.funnycode.User"
}
```


Define the `DemoProvider` interface:


```go
type DemoProvider struct {
	SayHello  func(ctx context.Context, name string) (string, error)            `dubbo:"sayHello"`
	SayHello2 func(ctx context.Context, user User) (string, error)              `dubbo:"sayHello"`
	SayHello3 func(ctx context.Context, user User, name string) (string, error) `dubbo:"sayHello"`
}

func (p *DemoProvider) Reference() string {
	return "DemoProvider"
}
```


#### 2.2.2 Starting the Dubbogo Consumer


```go
func main() {
	config.Load()
	gxlog.CInfo("\n\n\nstart to test dubbo")

	res, err := demoProvider.SayHello(context.TODO(), "tc")
	if err != nil {
		panic(err)
	}

	gxlog.CInfo("response result: %v\n", res)

	user := User{
		Name: "tc",
		Age:  18,
	}

	res, err = demoProvider.SayHello2(context.TODO(), user)
	if err != nil {
		panic(err)
	}

	gxlog.CInfo("response result: %v\n", res)

	res, err = demoProvider.SayHello3(context.TODO(), user, "tc")
	if err != nil {
		panic(err)
	}

	gxlog.CInfo("response result: %v\n", res)

	initSignal()
}
```


### 2.3 Request Result Analysis


#### 2.3.1 Direct Invocation


> Confirming the existence of the issue



The first interface's parameter is a string, which returns normally with `[2020-12-03/18:59:12 main.main: client.go: 29] response result: Hello tc`
The second and third interfaces have `User` objects and cannot be successfully called. The error message is as follows:


```bash
2020-12-02T17:10:47.739+0800    INFO    getty/listener.go:87    session{session session-closed, Read Bytes: 924, Write Bytes: 199, Read Pkgs: 0, Write Pkgs: 1} got error{java exception:Fail to decode request due to: java.lang.IllegalArgumentException: Service not found:com.funnycode.DemoService, sayHello
        at org.apache.dubbo.rpc.protocol.dubbo.DecodeableRpcInvocation.decode(DecodeableRpcInvocation.java:134)
        at org.apache.dubbo.rpc.protocol.dubbo.DecodeableRpcInvocation.decode(DecodeableRpcInvocation.java:80)
        at org.apache.dubbo.remoting.transport.DecodeHandler.decode(DecodeHandler.java:57)
        at org.apache.dubbo.remoting.transport.DecodeHandler.received(DecodeHandler.java:44)
        at org.apache.dubbo.remoting.transport.dispatcher.ChannelEventRunnable.run(ChannelEventRunnable.java:57)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
        at java.lang.Thread.run(Thread.java:748)
}, will be closed.
```


The error is as described in [issue](https://github.com/apache/dubbo-go/issues/900), as the error message returned to the consumer reveals Java's error stack trace, allowing us to see `DecodeableRpcInvocation.decode#134` directly.


#### 2.3.2 Breaking Point Viewing


The code is as follows:


```java
// Deserialization
public class DecodeableRpcInvocation extends RpcInvocation implements Codec, Decodeable {
    public Object decode(Channel channel, InputStream input) throws IOException {
      ......
      if (serviceDescriptor != null) {
          // Find method in the method descriptor
          MethodDescriptor methodDescriptor = serviceDescriptor.getMethod(getMethodName(), desc);
          if (methodDescriptor != null) {
              pts = methodDescriptor.getParameterClasses();
              this.setReturnTypes(methodDescriptor.getReturnTypes());
          }
      }
      // Indicates that the method was not found        
      if (pts == DubboCodec.EMPTY_CLASS_ARRAY) {
          if (!RpcUtils.isGenericCall(path, getMethodName()) && !RpcUtils.isEcho(path, getMethodName())) {
              throw new IllegalArgumentException("Service not found:" + path + ", " + getMethodName());
          }
          pts = ReflectUtils.desc2classArray(desc);
      }
      ......
    }
}
```


- Check `MethodDescriptor` to see if the method exists, if it exists, `ParameterClasses` is set accordingly
- If not found, and `pts == DubboCodec.EMPTY_CLASS_ARRAY` satisfies the condition, it verifies if it is a generic call or an echo call, if neither, an error thrown for a method not found
- `desc` is `Ljava/lang/Object`, which clearly does not have a method with Object as a parameter, leading to the error.



Additional Explanation:


**Method Query**


The code is as follows:


```java
public MethodDescriptor getMethod(String methodName, String params) {
    Map<String, MethodDescriptor> methods = descToMethods.get(methodName);
    if (CollectionUtils.isNotEmptyMap(methods)) {
        return methods.get(params);
    }
    return null;
}
```


Advantages:


Compared to previous versions, it caches the method metadata to avoid using reflection, which improves efficiency and can be understood as trading space for time.


![dfsa01.jpg](/imgs/blog/dubbo-go/from-scratch/dfsa01.jpg)


### 2.4 Solving the Issue


> As I directly coded and could not hold up, I compared to find the problem.



#### 2.4.1 Starting the Dubbo Service Consumer


Start using API mode, referring to the official example. The purpose is to check the Java version of the transport content.


```java
public static void main(String[] args) throws InterruptedException {
    // Current application configuration
    ApplicationConfig application = new ApplicationConfig();
    application.setName("demoProvider2");

    // Connect to registry configuration
    RegistryConfig registry = new RegistryConfig();
    registry.setAddress("127.0.0.1:2181");
    registry.setProtocol("zookeeper");
    registry.setUsername("");
    registry.setPassword("");
    // Note: ReferenceConfig is a heavy object that internally encapsulates the connection to the registry and the connection to the service provider.

    // Reference remote service
    ReferenceConfig<DemoService> reference
        = new ReferenceConfig<>(); // This instance is heavy, encapsulating connections. Please cache it as it may cause memory and connection leaks.
    reference.setApplication(application);
    reference.setRegistry(registry); // Multiple registries can be set using setRegistries()
    reference.setInterface(DemoService.class);
    reference.setVersion("1.0.0");
    reference.setGroup("tc");
    reference.setCheck(true);
    reference.setTimeout(1000 * 60);

    // Use xxxService locally
    DemoService demoService = reference.get(); // Note: This proxy object encapsulates all communication details and is heavy, so cache it for reuse.
    System.out.println(demoService.sayHello(new User("tc", 18)));

    TimeUnit.MINUTES.sleep(10);
}
```


![dfsa02.png](/imgs/blog/dubbo-go/from-scratch/dfsa02.png)


The `desc` is visibly `Lcom/funnycode/User`, which is the correct object.


#### 2.4.2 Finding Out Why Dubbogo is Not Correct


Code location:


`protocol/dubbo/impl/hessian.go:120#marshalRequest`


Code implementation:


```go
func marshalRequest(encoder *hessian.Encoder, p DubboPackage) ([]byte, error) {
	service := p.Service
	request := EnsureRequestPayload(p.Body)
	encoder.Encode(DEFAULT_DUBBO_PROTOCOL_VERSION)
	encoder.Encode(service.Path)
	encoder.Encode(service.Version)
	encoder.Encode(service.Method)

	args, ok := request.Params.([]interface{})

	if !ok {
		logger.Infof("request args are: %+v", request.Params)
		return nil, perrors.Errorf("@params is not of type: []interface{}")
	}
	types, err := getArgsTypeList(args)
	if err != nil {
		return nil, perrors.Wrapf(err, " PackRequest(args:%+v)", args)
	}
	encoder.Encode(types)
	for _, v := range args {
		encoder.Encode(v)
	}

	......
}
```


By the breakpoint, `types` is already being returned as `Object`, which means to follow up to see the code.


- `protocol/dubbo/impl/hessian.go:394#getArgsTypeList`
- `protocol/dubbo/impl/hessian.go:418#getArgType`



```go
func getArgType(v interface{}) string {
  // Handle common types

  ......

  default:
    t := reflect.TypeOf(v)
    if reflect.Ptr == t.Kind() {
      t = reflect.TypeOf(reflect.ValueOf(v).Elem())
    }
    switch t.Kind() {
    case reflect.Struct:
      return "java.lang.Object"
    }
    ......
}
```


It is clear that when discovering `reflect.Struct`, it returns `java.lang.Object`, hence the parameter turns into `Object`, causing a failure due to Java code dependency on this type.


#### 2.4.3 Other Version Validation


Since the feedback indicated that 2.7.7 was erroneous, I first considered whether it functioned correctly in earlier versions, thus switching the service provider to dubbo 2.7.3, finding that there were still errors as follows:


```bash
2020-12-02T21:52:25.945+0800    INFO    getty/listener.go:85    session{session session-closed, Read Bytes: 4586, Write Bytes: 232, Read Pkgs: 0, Write Pkgs: 1} got error{java exception:org.apache.dubbo.rpc.RpcException: Failed to invoke remote proxy method sayHello to registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=demoProvider&dubbo=2.0.2&export=dubbo%3A%2F%2F192.168.0.113%3A12345%2Fcom.funnycode.DemoService%3Fanyhost%3Dtrue%26application%3DdemoProvider%26bind.ip%3D192.168.0.113%26bind.port%3D12345%26deprecated%3Dfalse%26dubbo%3D2.0.2%26dynamic%3Dtrue%26generic%3Dfalse%26group%3Dtc%26interface%3Dcom.funnycode.DemoService%26methods%3DsayHello%26pid%3D23889%26register%3Dtrue%26release%3D2.7.3%26revision%3D1.0.0%26side%3Dprovider%26threads%3D200%26timeout%3D60000%26timestamp%3D1606916702204%26version%3D1.0.0&pid=23889&registry=zookeeper&release=2.7.3&timestamp=1606916702193, cause: Not found method "sayHello" in class com.funnycode.DemoServiceImpl.
org.apache.dubbo.rpc.RpcException: Failed to invoke remote proxy method sayHello to registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=demoProvider&dubbo=2.0.2&export=dubbo%3A%2F%2F192.168.0.113%3A12345%2Fcom.funnycode.DemoService%3Fanyhost%3Dtrue%26application%3DdemoProvider%26bind.ip%3D192.168.0.113%26bind.port%3D12345%26deprecated%3Dfalse%26dubbo%3D2.0.2%26dynamic%3Dtrue%26generic%3Dfalse%26group%3Dtc%26interface%3Dcom.funnycode.DemoService%26methods%3DsayHello%26pid%3D23889%26register%3Dtrue%26release%3D2.7.3%26revision%3D1.0.0%26side%3Dprovider%26threads%3D200%26timeout%3D60000%26timestamp%3D1606916702204%26version%3D1.0.0&pid=23889&registry=zookeeper&release=2.7.3&timestamp=1606916702193, cause: Not found method "sayHello" in class com.funnycode.DemoServiceImpl.
        at org.apache.dubbo.rpc.proxy.AbstractProxyInvoker.invoke(AbstractProxyInvoker.java:107)
        at org.apache.dubbo.config.invoker.DelegateProviderMetaDataInvoker.invoke(DelegateProviderMetaDataInvoker.java:56)
        at org.apache.dubbo.rpc.protocol.InvokerWrapper.invoke(InvokerWrapper.java:56)
        at org.apache.dubbo.rpc.filter.ExceptionFilter.invoke(ExceptionFilter.java:55)
        at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:82)
        at org.apache.dubbo.monitor.support.MonitorFilter.invoke(MonitorFilter.java:92)
        at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:82)
        at org.apache.dubbo.rpc.filter.TimeoutFilter.invoke(TimeoutFilter.java:48)
        at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:82)
        at org.apache.dubbo.rpc.protocol.dubbo.filter.TraceFilter.invoke(TraceFilter.java:81)
        at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:82)
        at org.apache.dubbo.rpc.filter.ContextFilter.invoke(ContextFilter.java:96)
        at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:82)
        at org.apache.dubbo.rpc.filter.GenericFilter.invoke(GenericFilter.java:148)
        at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:82)
        at org.apache.dubbo.rpc.filter.ClassLoaderFilter.invoke(ClassLoaderFilter.java:38)
        at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:82)
        at org.apache.dubbo.rpc.filter.EchoFilter.invoke(EchoFilter.java:41)
        at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:82)
        at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$CallbackRegistrationInvoker.invoke(ProtocolFilterWrapper.java:157)
        at org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol$1.reply(DubboProtocol.java:152)
        at org.apache.dubbo.remoting.exchange.support.header.HeaderExchangeHandler.handleRequest(HeaderExchangeHandler.java:102)
        at org.apache.dubbo.remoting.exchange.support.header.HeaderExchangeHandler.received(HeaderExchangeHandler.java:193)
        at org.apache.dubbo.remoting.transport.DecodeHandler.received(DecodeHandler.java:51)
        at org.apache.dubbo.remoting.transport.dispatcher.ChannelEventRunnable.run(ChannelEventRunnable.java:57)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
        at java.lang.Thread.run(Thread.java:748)
Caused by: org.apache.dubbo.common.bytecode.NoSuchMethodException: Not found method "sayHello" in class com.funnycode.DemoServiceImpl.
        at org.apache.dubbo.common.bytecode.Wrapper1.invokeMethod(Wrapper1.java)
        at org.apache.dubbo.rpc.proxy.javassist.JavassistProxyFactory$1.doInvoke(JavassistProxyFactory.java:47)
        at org.apache.dubbo.rpc.proxy.AbstractProxyInvoker.invoke(AbstractProxyInvoker.java:84)
        ... 27 more
}, will be closed.
```


Although the code is different from 2.7.7, the error indicates that the method cannot be found in the proxy enhanced class, most likely due to reflection failing to find the method, thus ultimately also relating to parameter issues.


#### 2.4.4 Fixing the Problem


The fix is straightforward: obtain the `JavaClassName` defined in `struct`.


```go
case reflect.Struct:
  v, ok := v.(hessian.POJO)
  if ok {
    return v.JavaClassName()
  }
  return "java.lang.Object"
```


#### 2.4.5 Validation Results


Re-executing the consumer with both the provider at versions 2.7.7 and 2.7.3 successfully outputs as follows:


```bash
[2020-12-03/20:04:06 main.main: client.go: 29] response result: Hello tc
...
[2020-12-03/20:04:09 main.main: client.go: 41] response result: Hello tc You are 18
...
[2020-12-03/20:04:09 main.main: client.go: 48] response result: Hello tc You are 18
```


## III. Detail Notes


### 3.1 How to Configure Dubbgo Consumer


Have you noticed that in my dubbogo consumer side, the interface is called `DemoProvider`, while the provider is called `DemoService`? How does this run correctly?


This is related to the `references` option in the `client.yml` configuration, which details `interface`, `version`, `group`, etc. You can also configure method timeout information through methods.


```yaml
references:
  "DemoProvider":
    # You can specify multiple registries separated by commas; omitting it defaults to registering with all registries.
    registry: "zk1"
    protocol: "dubbo"
    interface: "com.funnycode.DemoService"
    cluster: "failover"
    version: "1.0.0"
    group: "tc"
    methods:
      - name: "SayHello"
        retries: 3
    ......
```


### 3.2 How to Configure Global Group and Version


The configuration file is as follows:


```yaml
# Application config
application:
  organization: "dubbogoproxy.com"
  name: "Demo Micro Service"
  module: "dubbogoproxy tc client"
  version: "1.0.0"
  group: "tc"
  owner: "ZX"
  environment: "dev"

references:
  "DemoProvider":
    # You can specify multiple registries separated by commas; omitting defaults to registering with all registries.
    registry: "zk1"
    protocol: "dubbo"
    interface: "com.funnycode.DemoService"
    cluster: "failover"
#    version: "1.0.0"
#    group: "tc"
    methods:
      - name: "SayHello"
        retries: 3
```


From a usage perspective, `application` represents the global configuration, but I discovered that during startup, the `version` and `group` in `application` do not get assigned to the interface, leading to errors stating that the service provider cannot be found, as shown below:


```bash
2020-12-03T20:15:42.208+0800    DEBUG   zookeeper/registry.go:237       Create a zookeeper node:/dubbo/com.funnycode.DemoService/consumers/consumer%3A%2F%2F30.11.176.107%2FDemoProvider%3Fapp.version%3D1.0.0%26application%3DDemo+Micro+Service%26async%3Dfalse%26bean.name%3DDemoProvider%26cluster%3Dfailover%26environment%3Ddev%26generic%3Dfalse%26group%3D%26interface%3Dcom.funnycode.DemoService%26ip%3D30.11.176.107%26loadbalance%3D%26methods.SayHello.loadbalance%3D%26methods.SayHello.retries%3D3%26methods.SayHello.sticky%3Dfalse%26module%3Ddubbogoproxy+tc+client%26name%3DDemo+Micro+Service%26organization%3Ddubbogoproxy.com%26owner%3DZX%26pid%3D38692%26protocol%3Ddubbo%26provided-by%3D%26reference.filter%3Dcshutdown%26registry.role%3D0%26release%3Ddubbo-golang-1.3.0%26retries%3D%26side%3Dconsumer%26sticky%3Dfalse%26timestamp%3D1606997742%26version%3D
```


Both `version` and `group` are empty. You must uncomment the `version` and `group` under `DemoProvider`.


### 3.3 How to Specify Method Names for Invocation


#### 3.3.1 Go Calling Java


Dubbogo calls dubbo, as Go uses CamelCase for method names while Java uses lowercase, leading to the following error:


```bash
2020-12-02T17:10:47.739+0800    INFO    getty/listener.go:87    session{session session-closed, Read Bytes: 924, Write Bytes: 199, Read Pkgs: 0, Write Pkgs: 1} got error{java exception:Fail to decode request due to: java.lang.IllegalArgumentException: Service not found:com.funnycode.DemoService, SayHello
java.lang.IllegalArgumentException: Service not found:com.funnycode.DemoService, SayHello
        at org.apache.dubbo.rpc.protocol.dubbo.DecodeableRpcInvocation.decode(DecodeableRpcInvocation.java:134)
        at org.apache.dubbo.rpc.protocol.dubbo.DecodeableRpcInvocation.decode(DecodeableRpcInvocation.java:80)
        at org.apache.dubbo.remoting.transport.DecodeHandler.decode(DecodeHandler.java:57)
        at org.apache.dubbo.remoting.transport.DecodeHandler.received(DecodeHandler.java:44)
        at org.apache.dubbo.remoting.transport.dispatcher.ChannelEventRunnable.run(ChannelEventRunnable.java:57)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
        at java.lang.Thread.run(Thread.java:748)
}, will be closed.
```


Attentive readers may have noticed that I declare the interface on the consumer side with `dubbo:"sayHello"`, meaning that the method name is sayHello, allowing the service provider to get the method name sayHello.


Moreover, I've indicated that all three declared methods are named `dubbo:"sayHello"` because Java allows method name overloading, while Go does not permit duplicate method names.


#### 3.3.2 Go Calling Go


> Here is code that runs correctly:



My provider interface:


```go
type DemoProvider struct{}

func (p *DemoProvider) SayHello(ctx context.Context, name string) (string, error) {
	return "Hello " + name, nil
}

func (p *DemoProvider) SayHello4(ctx context.Context, user *User) (string, error) {
	return "Hello " + user.Name + " You are " + strconv.Itoa(user.Age), nil
}

func (p *DemoProvider) SayHello5(ctx context.Context, user *User, name string) (string, error) {
	return "Hello " + name + " You are " + strconv.Itoa(user.Age), nil
}

func (p *DemoProvider) Reference() string {
	return "DemoProvider"
}

func (p *DemoProvider) MethodMapper() map[string]string {
	return map[string]string{
		"SayHello": "sayHello",
	}
}
```


My consumer interface:


```go
type DemoProvider struct {
  // Call to Java and Go
	SayHello  func(ctx context.Context, name string) (string, error)             `dubbo:"sayHello"`
  // Only call to Java
	SayHello2 func(ctx context.Context, user *User) (string, error)              `dubbo:"sayHello"`
	SayHello3 func(ctx context.Context, user *User, name string) (string, error) `dubbo:"sayHello"`
  // Only call to Go
	SayHello4 func(ctx context.Context, user *User) (string, error)
	SayHello5 func(ctx context.Context, user *User, name string) (string, error)
}
```


Start the service consumer:


```go
func main() {
	config.Load()
	gxlog.CInfo("\n\n\nstart to test dubbo")

	res, err := demoProvider.SayHello(context.TODO(), "tc")
	if err != nil {
		panic(err)
	}

	gxlog.CInfo("response result: %v\n", res)

	user := &User{
		Name: "tc",
		Age:  18,
	}

	res, err = demoProvider.SayHello4(context.TODO(), user)
	if err != nil {
		panic(err)
	}

	gxlog.CInfo("response result: %v\n", res)

	res, err = demoProvider.SayHello5(context.TODO(), user, "tc")
	if err != nil {
		panic(err)
	}

	gxlog.CInfo("response result: %v\n", res)

	initSignal()
}
```


It is important to note the `MethodMapper` method; at times, you need to configure method name mapping in this method, otherwise, you will still encounter difficulties finding the method.


For instance, due to the `dubbo:"sayHello"` configuration, calling `SayHello` in Go becomes `sayHello`, so the service provider also needs to configure `MethodMapper` to enable both Go and Java to expose the same lowercase `sayHello`.


### 3.4 Why Use Hessian2


Experienced users understand that in dubbo, the default value of the SPI mechanism is hessian2.


```java
@SPI("hessian2")
public interface Serialization {
}
```


In dubbo-go:


```go
func NewDubboCodec(reader *bufio.Reader) *ProtocolCodec {
	s, _ := GetSerializerById(constant.S_Hessian2)
	return &ProtocolCodec{
		reader:     reader,
		pkgType:    0,
		bodyLen:    0,
		headerRead: false,
		serializer: s.(Serializer),
	}
}
```


### 3.5 Hessian Serialization Source Code


> You can view breakpoints yourself; both sides are basically the same. I also deduced this by comparing both sides; `RpcInvocation.getParameterTypesDesc()` is the method's parameters.



- Go code `protocol/dubbo/impl/hessian.go:120#marshalRequest`
- Java code `org.apache.dubbo.rpc.protocol.dubbo.DubboCodec#encodeRequestData(org.apache.dubbo.remoting.Channel, org.apache.dubbo.common.serialize.ObjectOutput, java.lang.Object, java.lang.String)`



### 3.6 Dubbogo Service Provider's Method Object Needs to Be a Pointer Object


In earlier examples, due to copying, this issue was overlooked until I hand-typed it.


If your provider is similar to: `func (p *DemoProvider) SayHello4(ctx context.Context, user User) (string, error)`, it may lead to errors like:


```bash
2020-12-03T12:42:32.834+0800    ERROR   getty/listener.go:280   OnMessage panic: reflect: Call using *main.User as type main.User
github.com/apache/dubbo-go/remoting/getty.(*RpcServerHandler).OnMessage.func1
```


In the parameter, `User` needs to be changed to `*User`.


### 3.7 Dubbogo Service Consumer's Method Object Can Be Non-Pointer Objects


```go
SayHello4 func(ctx context.Context, user *User) (string, error)
// or
SayHello4 func(ctx context.Context, user User) (string, error)
```


As during parameter serialization, pointers are manipulated:


```go
t := reflect.TypeOf(v)
if reflect.Ptr == t.Kind() {
  t = reflect.TypeOf(reflect.ValueOf(v).Elem())
}
```


[Complete Code](https://github.com/apache/dubbo-go/blob/v1.5.4/protocol/dubbo/impl/hessian.go#L486)


### 3.8 Configuration File Description


Dubbogo mainly has three configuration files:


- server.yaml for service provider configuration
- client.yaml for service consumer configuration
- log.yaml for log configuration



If you don’t configure anything, you will encounter:


```bash
2021/01/11 15:31:41 [InitLog] warn: log configure file name is nil
2021/01/11 15:31:41 [consumerInit] application configure(consumer) file name is nil
2021/01/11 15:31:41 [providerInit] application configure(provider) file name is nil
```


This will prevent normal usage. If you are a service provider, you must configure the server.yaml file, and if you are a service consumer, you must configure the client.yaml. In reality, our applications should act as both consumers and providers, so usually, both files need configuration.


When the service provider starts normally, you will see outputs like:


```bash
2021-01-11T15:36:55.003+0800    INFO    protocol/protocol.go:205        The cached exporter keys is dubbo://:20000/DemoProvider?accesslog=&app.version=1.0.0&application=Demo+Micro+Service&auth=&bean.name=DemoProvider&cluster=failover&environment=dev&execute.limit=&execute.limit.rejected.handler=&group=tc&interface=com.funnycode.DemoService&loadbalance=random&methods.SayHello.loadbalance=random&methods.SayHello.retries=3&methods.SayHello.tps.limit.interval=&methods.SayHello.tps.limit.rate=&methods.SayHello.tps.limit.strategy=&methods.SayHello.weight=0&methods.SayHello4.loadbalance=random&methods.SayHello4.retries=3&methods.SayHello4.tps.limit.interval=&methods.SayHello4.tps.limit.rate=&methods.SayHello4.tps.limit.strategy=&methods.SayHello4.weight=0&methods.SayHello5.loadbalance=random&methods.SayHello5.retries=3&methods.SayHello5.tps.limit.interval=&methods.SayHello5.tps.limit.rate=&methods.SayHello5.tps.limit.strategy=&methods.SayHello5.weight=0&module=dubbogoproxy+tc+client&name=Demo+Micro+Service&organization=dubbogoproxy.com&owner=ZX&param.sign=&registry.role=3&release=dubbo-golang-1.3.0&retries=&serialization=&service.filter=echo%2Ctoken%2Caccesslog%2Ctps%2Cgeneric_service%2Cexecute%2Cpshutdown&side=provider&ssl-enabled=false&timestamp=1610350614&tps.limit.interval=&tps.limit.rate=&tps.limit.rejected.handler=&tps.limit.strategy=&tps.limiter=&version=1.0.0&warmup=100!
2021-01-11T15:36:55.003+0800    INFO    dubbo/dubbo_protocol.go:86      Export service: dubbo://:20000/DemoProvider?accesslog=&app.version=1.0.0&application=Demo+Micro+Service&auth=&bean.name=DemoProvider&cluster=failover&environment=dev&execute.limit=&execute.limit.rejected.handler=&group=tc&interface=com.funnycode.DemoService&loadbalance=random&methods.SayHello.loadbalance=random&methods.SayHello.retries=3&methods.SayHello.tps.limit.interval=&methods.SayHello.tps.limit.rate=&methods.SayHello.tps.limit.strategy=&methods.SayHello.weight=0&methods.SayHello4.loadbalance=random&methods.SayHello4.retries=3&methods.SayHello4.tps.limit.interval=&methods.SayHello4.tps.limit.rate=&methods.SayHello4.tps.limit.strategy=&methods.SayHello4.weight=0&methods.SayHello5.loadbalance=random&methods.SayHello5.retries=3&methods.SayHello5.tps.limit.interval=&methods.SayHello5.tps.limit.rate=&methods.SayHello5.tps.limit.strategy=&methods.SayHello5.weight=0&module=dubbogoproxy+tc+client&name=Demo+Micro+Service&organization=dubbogoproxy.com&owner=ZX&param.sign=&registry.role=3&release=dubbo-golang-1.3.0&retries=&serialization=&service.filter=echo%2Ctoken%2Caccesslog%2Ctps%2Cgeneric_service%2Cexecute%2Cpshutdown&side=provider&ssl-enabled=false&timestamp=1610350614&tps.limit.interval=&tps.limit.rate=&tps.limit.rejected.handler=&tps.limit.strategy=&tps.limiter=&version=1.0.0&warmup=100
```


### 3.9 Reproduction Code


- [https://github.com/cityiron/java_study/tree/master/dubbo2.7.7/dg-issue900](https://github.com/cityiron/java_study/tree/master/dubbo2.7.7/dg-issue900)
- [https://github.com/cityiron/golang_study/tree/master/dubbogo/1.5.4/arg-bug](https://github.com/cityiron/golang_study/tree/master/dubbogo/1.5.4/arg-bug)



## IV. References

- [https://dubbo.apache.org/zh-cn/docsv2.7/user/configuration/api/](/en/docsv2.7/user/configuration/api/)
- [https://github.com/apache/dubbo-go/issues/257](https://github.com/apache/dubbo-go/issues/257)

---



Due to space constraints, I will stop here. Interested students are welcome to participate in the development of [dubbogo3.0](https://github.com/apache/dubbo-go/tree/release-3.0). Thank you for reading.
