---
title: "dubbo-go 白话文"
linkTitle: "dubbo-go 白话文"
tags: ["Go"]
date: 2021-02-20
description: >
    本文手把手教你使用 dubbogo 调用 dubbogo 或 dubbo 提供的服务提供方
---



## 一、前言


> 本文基于 dubbogo [1.5.4](https://github.com/apache/dubbo-go/releases/tag/v1.5.4) 版本



最近开始参与 dubbogo 的一些开发测试，之前都是直接拿 [samples](https://github.com/apache/dubbo-go-samples) 的例子验证功能，而这次为了复现一个功能问题，打算从零开始搭建一个 dubbo-go 和 dubbo 调用的工程，踩到了一些新人使用 dubbogo 的坑，把这个过程记录下供大家参考。


通过本文你可以了解到：

- 如何常规配置 dubbogo 消费方去调用 dubbo 和 dubbogo 服务提供方
- 通过一个实际的 BUG 介绍解决问题的思路



## 二、解决问题


### 2.1 准备 dubbo 服务提供者


#### 2.1.1 基本定义


定义 `DemoService` 接口：


```java
public interface DemoService {

    String sayHello(String name);

    String sayHello(User user);

    String sayHello(User user, String name);

}
```


定义 `User` 对象：


```java
public class User implements Serializable {

    private String name;

    private int age;

    ......
}
```


#### 2.1.2 启动 dubbo 服务提供者


用的 [dubbo 官方示例代码](/zh-cn/docsv2.7/user/configuration/api/):


```java
public static void main(String[] args) throws IOException {
    // 服务实现
    DemoService demoService = new DemoServiceImpl();

    // 当前应用配置
    ApplicationConfig application = new ApplicationConfig();
    application.setName("demoProvider");

    // 连接注册中心配置
    RegistryConfig registry = new RegistryConfig();
    registry.setAddress("127.0.0.1:2181");
    registry.setProtocol("zookeeper");
    registry.setUsername("");
    registry.setPassword("");

    // 服务提供者协议配置
    ProtocolConfig protocol = new ProtocolConfig();
    protocol.setName("dubbo");
    protocol.setPort(12345);
    protocol.setThreads(200);

    // 注意：ServiceConfig为重对象，内部封装了与注册中心的连接，以及开启服务端口

    // 服务提供者暴露服务配置
    ServiceConfig<DemoService> service = new ServiceConfig<>(); // 此实例很重，封装了与注册中心的连接，请自行缓存，否则可能造成内存和连接泄漏
    service.setApplication(application);
    service.setRegistry(registry); // 多个注册中心可以用setRegistries()
    service.setProtocol(protocol); // 多个协议可以用setProtocols()
    service.setInterface(DemoService.class);
    service.setRef(demoService);
    service.setVersion("1.0.0");
    service.setGroup("tc");
    service.setTimeout(60 * 1000);

    // 暴露及注册服务
    service.export();

    System.in.read();
}
```


查看 zookeeper 看是否注册成功：


```bash
$ls /dubbo/com.funnycode.DemoService/providers
[dubbo%3A%2F%2F127.0.0.1%3A12345%2Fcom.funnycode.DemoService%3Fanyhost%3Dtrue%26application%3DdemoProvider%26deprecated%3Dfalse%26dubbo%3D2.0.2%26dynamic%3Dtrue%26generic%3Dfalse%26group%3Dtc%26interface%3Dcom.funnycode.DemoService%26methods%3DsayHello%26pid%3D18167%26release%3D2.7.7%26revision%3D1.0.0%26side%3Dprovider%26threads%3D200%26timestamp%3D1606896020691%26version%3D1.0.0]
```


如上的输出表示服务提供方已经启动。


### 2.2 准备 dubbogo 服务消费者


#### 2.2.1 基本定义


定义 `User` 对象：


```go
type User struct {
	Name string
	Age  int
}

func (User) JavaClassName() string {
	return "com.funnycode.User"
}
```


定义 `DemoProvider` 接口：


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


#### 2.2.2 启动 dubbogo 消费者


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


### 2.3 请求结果分析


#### 2.3.1 直接调用


> 确认问题的存在



第一个接口的参数是字符串，可以正常返回 `[2020-12-03/18:59:12 main.main: client.go: 29] response result: Hello tc`
第二、三两个接口存在 `User` 对象，无法调用成功。错误信息如下：


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


错误正如 [issue](https://github.com/apache/dubbo-go/issues/900) 中描述的一模一样，因为错误信息返回到了消费端，可以看到 Java 那边的错误堆栈信息，所以直接去看 `DecodeableRpcInvocation.decode#134`。


#### 2.3.2 断点查看


代码如下：


```java
// 反序列化
public class DecodeableRpcInvocation extends RpcInvocation implements Codec, Decodeable {
    public Object decode(Channel channel, InputStream input) throws IOException {
      ......
      if (serviceDescriptor != null) {
          // 方法描述里面根据方法名查找
          MethodDescriptor methodDescriptor = serviceDescriptor.getMethod(getMethodName(), desc);
          if (methodDescriptor != null) {
              pts = methodDescriptor.getParameterClasses();
              this.setReturnTypes(methodDescriptor.getReturnTypes());
          }
      }
      // 表示没有找到方法        
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


- 查看 `MethodDescriptor`，即找方法是否存在，存在的话就会设置好 `ParameterClasses`
- 如果上面没找到，`pts == DubboCodec.EMPTY_CLASS_ARRAY` 就会满足条件，进而判断是否是泛化调用或者是 echo 调用，如果都不是则报服务找不到方法错误
- desc 是 `Ljava/lang/Object` ，很明显并没有参数是 Object 的方法，所以必然是会报错的



补充说明：


**方法查询**


代码如下：


```java
public MethodDescriptor getMethod(String methodName, String params) {
    Map<String, MethodDescriptor> methods = descToMethods.get(methodName);
    if (CollectionUtils.isNotEmptyMap(methods)) {
        return methods.get(params);
    }
    return null;
}
```


优点：


比之前的版本加了方法的元信息缓存起来，不使用反射可以提高效率，可以理解用空间换时间。


![dfsa01.jpg](/imgs/blog/dubbo-go/from-scratch/dfsa01.jpg)


### 2.4 解决问题


> 因为直接撸代码并 hold 不住，所以通过比较来查看问题所在。



#### 2.4.1 启动 dubbo 服务消费者


通过 api 模式启动，参考官方例子。启动这个是为了查看 Java 版本的传输内容。


```java
public static void main(String[] args) throws InterruptedException {
    // 当前应用配置
    ApplicationConfig application = new ApplicationConfig();
    application.setName("demoProvider2");

    // 连接注册中心配置
    RegistryConfig registry = new RegistryConfig();
    registry.setAddress("127.0.0.1:2181");
    registry.setProtocol("zookeeper");
    registry.setUsername("");
    registry.setPassword("");
    // 注意：ReferenceConfig为重对象，内部封装了与注册中心的连接，以及与服务提供方的连接

    // 引用远程服务
    ReferenceConfig<DemoService> reference
        = new ReferenceConfig<>(); // 此实例很重，封装了与注册中心的连接以及与提供者的连接，请自行缓存，否则可能造成内存和连接泄漏
    reference.setApplication(application);
    reference.setRegistry(registry); // 多个注册中心可以用setRegistries()
    reference.setInterface(DemoService.class);
    reference.setVersion("1.0.0");
    reference.setGroup("tc");
    reference.setCheck(true);
    reference.setTimeout(1000 * 60);

    // 和本地bean一样使用xxxService
    DemoService demoService = reference.get(); // 注意：此代理对象内部封装了所有通讯细节，对象较重，请缓存复用
    System.out.println(demoService.sayHello(new User("tc", 18)));

    TimeUnit.MINUTES.sleep(10);
}
```


![dfsa02.png](/imgs/blog/dubbo-go/from-scratch/dfsa02.png)


desc 肉眼可见的是 `Lcom/funnycode/User`，这个就是正确的对象了。


#### 2.4.2 查找 dubbogo 为什么不对


代码位置：


`protocol/dubbo/impl/hessian.go:120#marshalRequest`


代码实现：


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


断点可以发现，types 返回的时候就已经是 `Object` 了，没有返回 `User`，那么继续跟进去查看代码。


- `protocol/dubbo/impl/hessian.go:394#getArgsTypeList`
- `protocol/dubbo/impl/hessian.go:418#getArgType`



```go
func getArgType(v interface{}) string {
  // 常见的类型处理

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


很明显当发现是 `reflect.Struct` 的时候就返回了 `java.lang.Object`，所以参数就变成了 `Object`，那么因为 Java 代码那边依赖这个类型所以就调用失败了。


#### 2.4.3 其它版本验证


因为反馈是 2.7.7 出错，所以先考虑到在之前的版本是否功能正常，于是把服务提供者切换到 dubbo 2.7.3，发现调用仍然有错误，如下：


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


虽然和 2.7.7 的代码是不一样的，但是通过错误也能看出来是在代理增强类里面方法找不到，大概率是反射找不到方法，所以归根结底也是参数的问题。


#### 2.4.4 修复问题


修复相对简单，就是拿到 `struct` 定义的 `JavaClassName`。


```go
case reflect.Struct:
  v, ok := v.(hessian.POJO)
  if ok {
    return v.JavaClassName()
  }
  return "java.lang.Object"
```


#### 2.4.3 验证结果


再次执行消费者，运行（提供方 2.7.7 和 2.7.3）正常，输出如下：


```bash
[2020-12-03/20:04:06 main.main: client.go: 29] response result: Hello tc
...
[2020-12-03/20:04:09 main.main: client.go: 41] response result: Hello tc You are 18
...
[2020-12-03/20:04:09 main.main: client.go: 48] response result: Hello tc You are 18
```


## 三、细节叨叨


### 3.1 如何配置 dubbgo 消费者


细心的你是否已经发现，在我 dubbogo 的消费端接口叫 `DemoProvider`，然后发现提供者叫 `DemoService`，这个又是如何正常运行的？


实际上和 `client.yml` 中配置项 `references` 有关，在配置文件详细说明了 `interface`，`version`，`group` 等，你还可以通过 methods 配置方法的超时时间等信息。


```yaml
references:
  "DemoProvider":
    # 可以指定多个registry，使用逗号隔开;不指定默认向所有注册中心注册
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


### 3.2 全局的 group 和 version 怎么配置


配置文件如下：


```yaml
# application config
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
    # 可以指定多个registry，使用逗号隔开;不指定默认向所有注册中心注册
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


从使用的习惯来讲，肯定是 `application` 表示了全局的配置，但是我发现启动的时候在 `application` 配置的 `version` 和 `group` 并不会赋值给接口，启动会报服务提供方找不到，如下：


```bash
2020-12-03T20:15:42.208+0800    DEBUG   zookeeper/registry.go:237       Create a zookeeper node:/dubbo/com.funnycode.DemoService/consumers/consumer%3A%2F%2F30.11.176.107%2FDemoProvider%3Fapp.version%3D1.0.0%26application%3DDemo+Micro+Service%26async%3Dfalse%26bean.name%3DDemoProvider%26cluster%3Dfailover%26environment%3Ddev%26generic%3Dfalse%26group%3D%26interface%3Dcom.funnycode.DemoService%26ip%3D30.11.176.107%26loadbalance%3D%26methods.SayHello.loadbalance%3D%26methods.SayHello.retries%3D3%26methods.SayHello.sticky%3Dfalse%26module%3Ddubbogoproxy+tc+client%26name%3DDemo+Micro+Service%26organization%3Ddubbogoproxy.com%26owner%3DZX%26pid%3D38692%26protocol%3Ddubbo%26provided-by%3D%26reference.filter%3Dcshutdown%26registry.role%3D0%26release%3Ddubbo-golang-1.3.0%26retries%3D%26side%3Dconsumer%26sticky%3Dfalse%26timestamp%3D1606997742%26version%3D
```


`version` 和 `group` 都是空。必须把 `DemoProvider` 下的 `version` 和 `group` 注释打开。


### 3.3 怎么指定调用的方法名


#### 3.3.1 go 调用 java


dubbogo 调用 dubbo，因为 go 是大写的方法名，java 里面是小写的方法名，所以会出现如下错误：


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


细心的读者可能已经注意到了，我在消费端的接口声明是有个 `dubbo:"sayHello"` 的，表示方法名是 sayHello，这样在服务提供方就可以得到 sayHello 这个方法名。


还有我声明的三个方法都指明它们的方法名叫 `dubbo:"sayHello"`，这是因为 Java 可以方法名字一样进行重载，而 go 是不能方法名重复的。


#### 3.3.2 go 调用 go


> 直接贴能跑通的代码



我的提供者接口：


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


我的消费者接口：


```go
type DemoProvider struct {
  // 调用 java 和 go
	SayHello  func(ctx context.Context, name string) (string, error)             `dubbo:"sayHello"`
  // 只调用 java
	SayHello2 func(ctx context.Context, user *User) (string, error)              `dubbo:"sayHello"`
	SayHello3 func(ctx context.Context, user *User, name string) (string, error) `dubbo:"sayHello"`
  // 只调用 go
	SayHello4 func(ctx context.Context, user *User) (string, error)
	SayHello5 func(ctx context.Context, user *User, name string) (string, error)
}
```


启动服务消费者：


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


这里需要注意 `MethodMapper` 方法，有时候需要在这个方法中配置方法名的映射关系，否则还是会出现找不到方法的错误。


比如因为配置 `dubbo:"sayHello"` ，所以在 go 里面请求 `SayHello` 变成了 `sayHello`，那么服务提供方通过 `MethodMapper` 方法配置后使得提供方也是 `sayHello`，这样 go 和 java 下暴露的都是小写的 `sayHello`。


### 3.4 为什么会用 hessian2


老司机都懂，在 dubbo 中 SPI 机制的默认值就是 hessian2


```java
@SPI("hessian2")
public interface Serialization {
}
```


而在 dubbo-go 中：


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


### 3.5 hessian序列化源码


> 可以自行断点查看，两边基本上一样，我也是通过两边比出来的，RpcInvocation.getParameterTypesDesc() 就是方法的参数



- go 代码 `protocol/dubbo/impl/hessian.go:120#marshalRequest`
- java 代码 `org.apache.dubbo.rpc.protocol.dubbo.DubboCodec#encodeRequestData(org.apache.dubbo.remoting.Channel, org.apache.dubbo.common.serialize.ObjectOutput, java.lang.Object, java.lang.String)`



### 3.6 dubbogo 服务提供者的方法对象需要是指针对象


之前的例子都是 copy 的，这次是纯手打的，才发现了这个问题。


如果你的提供类似：`func (p *DemoProvider) SayHello4(ctx context.Context, user User) (string, error)`，那么会出现如下错误：


```bash
2020-12-03T12:42:32.834+0800    ERROR   getty/listener.go:280   OnMessage panic: reflect: Call using *main.User as type main.User
github.com/apache/dubbo-go/remoting/getty.(*RpcServerHandler).OnMessage.func1
```


参数里面的 `User` 需要改成 `*User`。


### 3.7 dubbogo 服务消费者的方法对象可以是非指针对象


```go
SayHello4 func(ctx context.Context, user *User) (string, error)
// or
SayHello4 func(ctx context.Context, user User) (string, error)
```


因为在参数序列化的时候会对指针做操作：


```go
t := reflect.TypeOf(v)
if reflect.Ptr == t.Kind() {
  t = reflect.TypeOf(reflect.ValueOf(v).Elem())
}
```


[完整代码](https://github.com/apache/dubbo-go/blob/v1.5.4/protocol/dubbo/impl/hessian.go#L486)


### 3.8 配置文件说明


dubbogo 主要有三个配置文件：


- server.yaml 服务提供方的配置文件
- client.yaml 服务消费方的配置文件
- log.yaml 日志文件



如果你什么都不配置，会出现：


```bash
2021/01/11 15:31:41 [InitLog] warn: log configure file name is nil
2021/01/11 15:31:41 [consumerInit] application configure(consumer) file name is nil
2021/01/11 15:31:41 [providerInit] application configure(provider) file name is nil
```


这样是没法正常使用的。如果你是服务提供方，必须要配置 server.yaml 文件，如果你是服务消费方，必须要配置 client.yaml，实际我们的应用应该既是消费者又是提供者，所以往往两个文件都是需要配置的。


服务提供方正常启动是会有如下输出的：


```bash
2021-01-11T15:36:55.003+0800    INFO    protocol/protocol.go:205        The cached exporter keys is dubbo://:20000/DemoProvider?accesslog=&app.version=1.0.0&application=Demo+Micro+Service&auth=&bean.name=DemoProvider&cluster=failover&environment=dev&execute.limit=&execute.limit.rejected.handler=&group=tc&interface=com.funnycode.DemoService&loadbalance=random&methods.SayHello.loadbalance=random&methods.SayHello.retries=3&methods.SayHello.tps.limit.interval=&methods.SayHello.tps.limit.rate=&methods.SayHello.tps.limit.strategy=&methods.SayHello.weight=0&methods.SayHello4.loadbalance=random&methods.SayHello4.retries=3&methods.SayHello4.tps.limit.interval=&methods.SayHello4.tps.limit.rate=&methods.SayHello4.tps.limit.strategy=&methods.SayHello4.weight=0&methods.SayHello5.loadbalance=random&methods.SayHello5.retries=3&methods.SayHello5.tps.limit.interval=&methods.SayHello5.tps.limit.rate=&methods.SayHello5.tps.limit.strategy=&methods.SayHello5.weight=0&module=dubbogoproxy+tc+client&name=Demo+Micro+Service&organization=dubbogoproxy.com&owner=ZX&param.sign=&registry.role=3&release=dubbo-golang-1.3.0&retries=&serialization=&service.filter=echo%2Ctoken%2Caccesslog%2Ctps%2Cgeneric_service%2Cexecute%2Cpshutdown&side=provider&ssl-enabled=false&timestamp=1610350614&tps.limit.interval=&tps.limit.rate=&tps.limit.rejected.handler=&tps.limit.strategy=&tps.limiter=&version=1.0.0&warmup=100!
2021-01-11T15:36:55.003+0800    INFO    dubbo/dubbo_protocol.go:86      Export service: dubbo://:20000/DemoProvider?accesslog=&app.version=1.0.0&application=Demo+Micro+Service&auth=&bean.name=DemoProvider&cluster=failover&environment=dev&execute.limit=&execute.limit.rejected.handler=&group=tc&interface=com.funnycode.DemoService&loadbalance=random&methods.SayHello.loadbalance=random&methods.SayHello.retries=3&methods.SayHello.tps.limit.interval=&methods.SayHello.tps.limit.rate=&methods.SayHello.tps.limit.strategy=&methods.SayHello.weight=0&methods.SayHello4.loadbalance=random&methods.SayHello4.retries=3&methods.SayHello4.tps.limit.interval=&methods.SayHello4.tps.limit.rate=&methods.SayHello4.tps.limit.strategy=&methods.SayHello4.weight=0&methods.SayHello5.loadbalance=random&methods.SayHello5.retries=3&methods.SayHello5.tps.limit.interval=&methods.SayHello5.tps.limit.rate=&methods.SayHello5.tps.limit.strategy=&methods.SayHello5.weight=0&module=dubbogoproxy+tc+client&name=Demo+Micro+Service&organization=dubbogoproxy.com&owner=ZX&param.sign=&registry.role=3&release=dubbo-golang-1.3.0&retries=&serialization=&service.filter=echo%2Ctoken%2Caccesslog%2Ctps%2Cgeneric_service%2Cexecute%2Cpshutdown&side=provider&ssl-enabled=false&timestamp=1610350614&tps.limit.interval=&tps.limit.rate=&tps.limit.rejected.handler=&tps.limit.strategy=&tps.limiter=&version=1.0.0&warmup=100
```


### 3.9 复现代码


- [https://github.com/cityiron/java_study/tree/master/dubbo2.7.7/dg-issue900](https://github.com/cityiron/java_study/tree/master/dubbo2.7.7/dg-issue900)
- [https://github.com/cityiron/golang_study/tree/master/dubbogo/1.5.4/arg-bug](https://github.com/cityiron/golang_study/tree/master/dubbogo/1.5.4/arg-bug)



## 四、参考

- [https://dubbo.apache.org/zh-cn/docsv2.7/user/configuration/api/](/zh-cn/docsv2.7/user/configuration/api/)
- [https://github.com/apache/dubbo-go/issues/257](https://github.com/apache/dubbo-go/issues/257)

---



篇幅有限，就介绍到这里。欢迎有兴趣的同学来参与 [dubbogo3.0](https://github.com/apache/dubbo-go/tree/release-3.0) 的建设，感谢阅读。



