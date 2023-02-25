---
title: "dubbo-go源码笔记（二）客户端调用过程"
linkTitle: "dubbo-go源码笔记（二）客户端调用过程"
tags: ["Go", "源码解析"]
date: 2021-01-15
description: 本文将介绍 dubbo-go 框架的基本使用方法，以及从 export 调用链的角度进行 server 端源码导读，希望能引导读者进一步认识这款框架。
---

随着微服务架构的流行，许多高性能 rpc 框架应运而生，由阿里开源的 dubbo 框架 go 语言版本的 dubbo-go 也成为了众多开发者不错的选择。本文将介绍 dubbo-go 框架的基本使用方法，以及从 export 调用链的角度进行 server 端源码导读，希望能引导读者进一步认识这款框架。

## 前言

有了上一篇文章[《dubbo-go 源码笔记（一）Server服务暴露过程详解》]({{<ref "/blog/golang/dubbo-go-codewalk-1.md" >}} "") 的铺垫，可以大致上类比客户端服务类似于服务端启动过程。其中最大的区别是服务端通过zk注册服务，发布自己的ivkURL并订阅事件开启监听；而服务端应该是通过zk注册组件，**拿到需要调用的serviceURL**，**更新invoker**并**重写用户的RPCService**，从而实现对远程过程调用细节的封装。

## 1. 配置文件和客户端源码

#### 1.1 client配置文件

helloworld提供的demo：profiles/client.yaml

```yaml
registries :
  "demoZk":
    protocol: "zookeeper"
    timeout : "3s"
    address: "127.0.0.1:2181"
    username: ""
    password: ""
references:
  "UserProvider":
    # 可以指定多个registry，使用逗号隔开;不指定默认向所有注册中心注册
    registry: "demoZk"
    protocol : "dubbo"
    interface : "com.ikurento.user.UserProvider"
    cluster: "failover"
    methods :
    - name: "GetUser"
      retries: 3
```

可看到配置文件与之前讨论过的server端非常类似，其refrences部分字段就是对当前服务要主调的服务的配置，其中详细说明了调用协议、注册协议、接口id、调用方法、集群策略等，这些配置都会在之后与注册组件交互，重写ivk、调用的过程中使用到。

#### 1.2 客户端使用框架源码

user.go

```go
func init() {
    config.SetConsumerService(userProvider)
    hessian.RegisterPOJO(&User{})
}
```

main.go

```go
func main() {
    hessian.RegisterPOJO(&User{})
    config.Load()
    time.Sleep(3e9)
    println("\n\n\nstart to test dubbo")
    user := &User{}
    err := userProvider.GetUser(context.TODO(), []interface{}{"A001"}, user)
    if err != nil {
      panic(err)
    }
    println("response result: %v\n", user)
    initSignal()
}
```

官网提供的helloworld demo的源码。可看到与服务端类似，在user.go内注册了rpc-service，以及需要rpc传输的结构体user。

在main函数中，同样调用了config.Load()函数，之后就可以直接通过实现好的rpc-service：userProvider 直接调用对应的功能函数，即可实现rpc调用。

可以猜到，从hessian注册结构、SetConsumerService，到调用函数.GetUser()期间，用户定义的rpc-service也就是userProvider对应的函数被重写，重写后的GetUser函数已经包含了实现了远程调用逻辑的invoker。

接下来，就要通过阅读源码，看看dubbo-go是如何做到的。

## 2. 实现远程过程调用

#### 2.1 加载配置文件

config/config_loader.go :Load()

```go
// Load Dubbo Init
func Load() {
    // init router
    initRouter()
    // init the global event dispatcher
    extension.SetAndInitGlobalDispatcher(GetBaseConfig().EventDispatcherType)
    // start the metadata report if config set
    if err := startMetadataReport(GetApplicationConfig().MetadataType, GetBaseConfig().MetadataReportConfig); err != nil {
      logger.Errorf("Provider starts metadata report error, and the error is {%#v}", err)
  return
    }
    // reference config
    loadConsumerConfig()
```

在main函数中调用的config.Load()函数，进而调用了loadConsumerConfig，类似于之前讲到的server端配置读入函数。

在loadConsumerConfig函数中，进行了三步操作：

![img](/imgs/blog/dubbo-go/code2/p1.png)

1. 检查配置文件并将配置写入内存
2. **在for循环内部**，依次引用（refer）并且实例化（implement）每个被调reference。
3. 等待三秒钟所有invoker就绪

其中重要的就是for循环里面的引用和实例化，两步操作，会在接下来展开讨论。

至此，配置已经被写入了框架。

#### 2.2 获取远程Service URL，实现可供调用的invoker

上述的ref.Refer完成的就是这部分的操作。

图（一）

![img](/imgs/blog/dubbo-go/code2/p2.png)

##### 2.2.1 构造注册url

和server端类似，存在注册url和服务url，dubbo习惯将服务url作为注册url的sub。

config/reference_config.go: Refer()

```go
/ Refer ...
func (c *ReferenceConfig) Refer(_ interface{}) {
    //（一）配置url参数(serviceUrl)，将会作为sub
    cfgURL := common.NewURLWithOptions(
  common.WithPath(c.id),
  common.WithProtocol(c.Protocol),
  common.WithParams(c.getUrlMap()),
  common.WithParamsValue(constant.BEAN_NAME_KEY, c.id),
    )
    ...
    // （二）注册地址可以通过url格式给定，也可以通过配置格式给定
    // 这一步的意义就是配置->提取信息生成URL
    if c.Url != "" {// 用户给定url信息，可以是点对点的地址，也可以是注册中心的地址
  // 1. user specified URL, could be peer-to-peer address, or register center's address.
  urlStrings := gxstrings.RegSplit(c.Url, "\\s*[;]+\\s*")
  for _, urlStr := range urlStrings {
    serviceUrl, err := common.NewURL(urlStr)
    ...
  }
    } else {// 配置读入注册中心的信息
  //  assemble SubURL from register center's configuration mode
  // 这是注册url，protocol = registry,包含了zk的用户名、密码、ip等等
  c.urls = loadRegistries(c.Registry, consumerConfig.Registries, common.CONSUMER)
  ...
  // set url to regUrls
  for _, regUrl := range c.urls {
    regUrl.SubURL = cfgURL// regUrl的subURl存当前配置url
  }
    }
    //至此，无论通过什么形式，已经拿到了全部的regURL
    // （三）获取registryProtocol实例，调用其Refer方法，传入新构建好的regURL
    if len(c.urls) == 1 {
  // 这一步访问到registry/protocol/protocol.go registryProtocol.Refer
  // 这里是registry
  c.invoker = extension.GetProtocol(c.urls[0].Protocol).Refer(*c.urls[0])
    } else {
  // 如果有多个注册中心，即有多个invoker,则采取集群策略
  invokers := make([]protocol.Invoker, 0, len(c.urls))
  ...
    }
```



这个函数中，已经处理完从Register配置到RegisterURL的转换,即图（一）中部分：

![img](/imgs/blog/dubbo-go/code2/p3.png)

接下来，已经拿到的url将被传递给RegistryProtocol，进一步refer。

##### 2.2.2 registryProtocol获取到zkRegistry实例，进一步Refer

registry/protocol/protocol.go: Refer

```go
// Refer provider service from registry center
// 拿到的是配置文件registries的url，他能够生成一个invoker = 指向目的addr，以供客户端直接调用。
func (proto *registryProtocol) Refer(url common.URL) protocol.Invoker {
    var registryUrl = url
    // 这里拿到的是referenceConfig，serviceUrl里面包含了Reference的所有信息，包含interfaceName、method等等
    var serviceUrl = registryUrl.SubURL
    if registryUrl.Protocol == constant.REGISTRY_PROTOCOL {// registryUrl.Proto = "registry"
  protocol := registryUrl.GetParam(constant.REGISTRY_KEY, "")
  registryUrl.Protocol = protocol//替换成了具体的值，比如"zookeeper"
    }
    // 接口对象
    var reg registry.Registry
    // （一）实例化接口对象，缓存策略
    if regI, loaded := proto.registries.Load(registryUrl.Key()); !loaded {
  // 缓存中不存在当前registry，新建一个reg
  reg = getRegistry(&registryUrl)
  // 缓存起来
  proto.registries.Store(registryUrl.Key(), reg)
    } else {
  reg = regI.(registry.Registry)
    }
    // 到这里，获取到了reg实例 zookeeper的registry
    //（二）根据Register的实例zkRegistry和传入的regURL新建一个directory
    // 这一步存在复杂的异步逻辑，从注册中心拿到了目的service的真实addr，获取了invoker并放入directory，
    // 这一步将在下面详细给出步骤
    // new registry directory for store service url from registry
    directory, err := extension.GetDefaultRegistryDirectory(&registryUrl, reg)
    if err != nil {
  logger.Errorf("consumer service %v  create registry directory  error, error message is %s, and will return nil invoker!",
    serviceUrl.String(), err.Error())
  return nil
    }
    // （三）DoRegister 在zk上注册当前client service
    err = reg.Register(*serviceUrl)
    if err != nil {
  logger.Errorf("consumer service %v register registry %v error, error message is %s",
    serviceUrl.String(), registryUrl.String(), err.Error())
    }
    // （四）new cluster invoker，将directory写入集群，获得具有集群策略的invoker
    cluster := extension.GetCluster(serviceUrl.GetParam(constant.CLUSTER_KEY, constant.DEFAULT_CLUSTER))
    invoker := cluster.Join(directory)
    // invoker保存
    proto.invokers = append(proto.invokers, invoker)
    return invoker
}
```

可详细阅读上述注释，这个函数完成了从url到invoker的全部过程

（一）首先获得Registry对象，默认是之前实例化的zkRegistry，和之前server获取Registry的处理很类似。
（二）通过构造一个新的directory，异步拿到之前在zk上注册的server端信息，生成invoker
（三）在zk上注册当前service
（四）集群策略，获得最终invoker

这一步完成了图（一）中所有余下的绝大多数操作，接下来就需要详细的查看directory的构造过程：

##### 2.2.3 构造directory（包含较复杂的异步操作）

![img](/imgs/blog/dubbo-go/code2/p4.png)

图（二）

上述的 `extension.GetDefaultRegistryDirectory(&registryUrl, reg)`函数，本质上调用了已经注册好的`NewRegistryDirectory`函数:

registry/directory/directory.go: NewRegistryDirectory()

```go
// NewRegistryDirectory will create a new RegistryDirectory
// 这个函数作为default注册在extension上面
// url为注册url，reg为zookeeper registry
func NewRegistryDirectory(url *common.URL, registry registry.Registry) (cluster.Directory, error) {
    if url.SubURL == nil {
  return nil, perrors.Errorf("url is invalid, suburl can not be nil")
    }
    dir := &RegistryDirectory{
  BaseDirectory:    directory.NewBaseDirectory(url),
  cacheInvokers:    []protocol.Invoker{},
  cacheInvokersMap: &sync.Map{},
  serviceType:      url.SubURL.Service(),
  registry:         registry,
    }
    dir.consumerConfigurationListener = newConsumerConfigurationListener(dir)
    go dir.subscribe(url.SubURL)
    return dir, nil
}
```

首先构造了一个注册directory，开启携程调用其subscribe函数，传入serviceURL。

这个directory目前包含了对应的zkRegistry，以及传入的URL，他cacheInvokers的部分是空的。

进入dir.subscribe(url.SubURL)这个异步函数：

registry/directory/directory.go: subscribe()

```go
// subscribe from registry
func (dir *RegistryDirectory) subscribe(url *common.URL) {
    // 增加两个监听，
    dir.consumerConfigurationListener.addNotifyListener(dir)
    dir.referenceConfigurationListener = newReferenceConfigurationListener(dir, url)
    // subscribe调用
    dir.registry.Subscribe(url, dir)
}
```

重点来了，他调用了zkRegistry的Subscribe方法,与此同时将自己作为ConfigListener传入

> 我认为这种传入listener的设计模式非常值得学习，而且很有java的味道。
>
> 针对等待zk返回订阅信息这样的异步操作，需要传入一个Listener，这个Listener需要实现Notify方法，进而在作为参数传入内部之后，可以被异步地调用Notify，将内部触发的异步事件“传递出来”，再进一步处理加工。
>
> 层层的Listener事件链，能将传入的原始serviceURL通过zkConn发送给zk服务，获取到服务端注册好的url对应的二进制信息。
>
> 而Notify回调链，则将这串byte[]一步一步解析、加工；以事件的形式向外传递，最终落到directory上的时候，已经是成型的newInvokers了。
>
> 具体细节不再以源码形式展示，可参照上图查阅源码。

至此已经拿到了server端注册好的真实invoker。

完成了图（一）中的部分：

![img](/imgs/blog/dubbo-go/code2/p5.png)

##### 2.2.4 构造带有集群策略的clusterinvoker

经过上述操作，已经拿到了server端Invokers，放入了directory的cacheinvokers数组里面缓存。

后续的操作对应本文2.2.2的第四步，由directory生成带有特性集群策略的invoker

```go
// （四）new cluster invoker，将directory写入集群，获得具有集群策略的invoker
    cluster := extension.GetCluster(serviceUrl.GetParam(constant.CLUSTER_KEY, constant.DEFAULT_CLUSTER))
    invoker := cluster.Join(directory)
123
```

Join函数的实现就是如下函数：

cluster/cluster_impl/failover_cluster_invokers.go: newFailoverClusterInvoker()

```go
func newFailoverClusterInvoker(directory cluster.Directory) protocol.Invoker {
    return &failoverClusterInvoker{
  baseClusterInvoker: newBaseClusterInvoker(directory),
    }
}
12345
```

dubbo-go框架默认选择failover策略，既然返回了一个invoker，我们查看一下failoverClusterInvoker的Invoker方法，看他是如何将集群策略封装到Invoker函数内部的：

cluster/cluster_impl/failover_cluster_invokers.go: Invoker()

```go
// Invoker 函数
func (invoker *failoverClusterInvoker) Invoke(ctx context.Context, invocation protocol.Invocation) protocol.Result {
    ...
    //调用List方法拿到directory缓存的所有invokers
    invokers := invoker.directory.List(invocation)
    if err := invoker.checkInvokers(invokers, invocation); err != nil {// 检查是否可以实现调用
  return &protocol.RPCResult{Err: err}
    }
    // 获取来自用户方向传入的
    methodName := invocation.MethodName()
    retries := getRetries(invokers, methodName)
    loadBalance := getLoadBalance(invokers[0], invocation)
    for i := 0; i <= retries; i++ {
  // 重要！这里是集群策略的体现，失败后重试！
  //Reselect before retry to avoid a change of candidate `invokers`.
  //NOTE: if `invokers` changed, then `invoked` also lose accuracy.
  if i > 0 {
    if err := invoker.checkWhetherDestroyed(); err != nil {
    return &protocol.RPCResult{Err: err}
    }
    invokers = invoker.directory.List(invocation)
    if err := invoker.checkInvokers(invokers, invocation); err != nil {
    return &protocol.RPCResult{Err: err}
    }
  }
  // 这里是负载均衡策略的体现！选择特定ivk进行调用。
  ivk := invoker.doSelect(loadBalance, invocation, invokers, invoked)
  if ivk == nil {
    continue
  }
  invoked = append(invoked, ivk)
  //DO INVOKE
  result = ivk.Invoke(ctx, invocation)
  if result.Error() != nil {
    providers = append(providers, ivk.GetUrl().Key())
    continue
  }
  return result
    }
    ...
}
```

> 看了很多Invoke函数的实现，所有类似的Invoker函数都包含两个方向，一个是用户方向的invcation，一个是函数方向的底层invokers。
>
> 而集群策略的invoke函数本身作为接线员，把invocation一步步解析，根据调用需求和集群策略，选择特定的invoker来执行
>
> proxy函数也是这样，一个是用户方向的ins[] reflect.Type, 一个是函数方向的invoker。
>
> proxy函数负责将ins转换为invocation，调用对应invoker的invoker函数，实现连通。
>
> 而出于这样的设计，可以在一步步Invoker封装的过程中，每个Invoker只关心自己负责操作的部分，从而使整个调用栈解耦。
>
> 妙啊！！！

至此，我们理解了failoverClusterInvoker 的Invoke函数实现，也正是和这个集群策略Invoker被返回，接受来自上方的调用。

已完成图（一）中的：

![img](/imgs/blog/dubbo-go/code2/p6.png)

##### 2.2.5 在zookeeper上注册当前client

拿到invokers后，可以回到：

config/refrence_config.go: Refer()函数了。

```go
    if len(c.urls) == 1 {
  // 这一步访问到registry/protocol/protocol.go registryProtocol.Refer
  c.invoker = extension.GetProtocol(c.urls[0].Protocol).Refer(*c.urls[0])
  // （一）拿到了真实的invokers
    } else {
  // 如果有多个注册中心，即有多个invoker,则采取集群策略
  invokers := make([]protocol.Invoker, 0, len(c.urls))
  ...
  cluster := extension.GetCluster(hitClu)
  // If 'zone-aware' policy select, the invoker wrap sequence would be:
  // ZoneAwareClusterInvoker(StaticDirectory) ->
  // FailoverClusterInvoker(RegistryDirectory, routing happens here) -> Invoker
  c.invoker = cluster.Join(directory.NewStaticDirectory(invokers))
    }
    // （二）create proxy，为函数配置代理
    if c.Async {
  callback := GetCallback(c.id)
  c.pxy = extension.GetProxyFactory(consumerConfig.ProxyFactory).GetAsyncProxy(c.invoker, callback, cfgURL)
    } else {
  // 这里c.invoker已经是目的addr了
  c.pxy = extension.GetProxyFactory(consumerConfig.ProxyFactory).GetProxy(c.invoker, cfgURL)
    }
```

我们有了可以打通的invokers，但还不能直接调用，因为invoker的入参是invocation，而调用函数使用的是具体的参数列表。需要通过一层proxy来规范入参和出参。

接下来新建一个默认proxy，放置在c.proxy内，以供后续使用

至此，完成了图（一）中最后的操作

![img](/imgs/blog/dubbo-go/code2/p7.png)

### 2.3 将调用逻辑以代理函数的形式写入rpc-service

上面完成了config.Refer操作

回到config/config_loader.go: loadConsumerConfig()

![img](/imgs/blog/dubbo-go/code2/p8.png)

下一个重要的函数是Implement，他完的操作较为简单：旨在使用上面生成的c.proxy代理，链接用户自己定义的rpcService到clusterInvoker的信息传输。

函数较长，只选取了重要的部分:

common/proxy/proxy.go: Implement()

```go
// Implement
// proxy implement
// In consumer, RPCService like:
//      type XxxProvider struct {
//    Yyy func(ctx context.Context, args []interface{}, rsp *Zzz) error
//      }
// Implement 实现的过程，就是proxy根据函数名和返回值，通过调用invoker 构造出拥有远程调用逻辑的代理函数
// 将当前rpc所有可供调用的函数注册到proxy.rpc内
func (p *Proxy) Implement(v common.RPCService) {
    // makeDubboCallProxy 这是一个构造代理函数，这个函数的返回值是func(in []reflect.Value) []reflect.Value 这样一个函数
    // 这个被返回的函数是请求实现的载体，由他来发起调用获取结果
    makeDubboCallProxy := func(methodName string, outs []reflect.Type) func(in []reflect.Value) []reflect.Value {
  return func(in []reflect.Value) []reflect.Value {
    // 根据methodName和outs的类型，构造这样一个函数，这个函数能将in 输入的value转换为输出的value
    // 这个函数具体的实现如下：
    ...
    // 目前拿到了 methodName、所有入参的interface和value，出参数reply
    // （一）根据这些生成一个 rpcinvocation
    inv = invocation_impl.NewRPCInvocationWithOptions(
    invocation_impl.WithMethodName(methodName),
    invocation_impl.WithArguments(inIArr),
    invocation_impl.WithReply(reply.Interface()),
    invocation_impl.WithCallBack(p.callBack),
    invocation_impl.WithParameterValues(inVArr))
    for k, value := range p.attachments {
    inv.SetAttachments(k, value)
    }
    // add user setAttachment
    atm := invCtx.Value(constant.AttachmentKey) // 如果传入的ctx里面有attachment，也要写入inv
    if m, ok := atm.(map[string]string); ok {
    for k, value := range m {
        inv.SetAttachments(k, value)
    }
    }
    // 至此构造inv完毕
    // (二）触发Invoker 之前已经将cluster_invoker放入proxy，使用Invoke方法，通过getty远程过程调用
    result := p.invoke.Invoke(invCtx, inv)
    // 如果有attachment，则加入
    if len(result.Attachments()) > 0 {
    invCtx = context.WithValue(invCtx, constant.AttachmentKey, result.Attachments())
    }
    ...
  }
    }
    numField := valueOfElem.NumField()
    for i := 0; i < numField; i++ {
  t := typeOf.Field(i)
  methodName := t.Tag.Get("dubbo")
  if methodName == "" {
    methodName = t.Name
  }
  f := valueOfElem.Field(i)
  if f.Kind() == reflect.Func && f.IsValid() && f.CanSet() { // 针对于每个函数
    outNum := t.Type.NumOut()
    // 规定函数输出只能有1/2个
    if outNum != 1 && outNum != 2 {
    logger.Warnf("method %s of mtype %v has wrong number of in out parameters %d; needs exactly 1/2",
        t.Name, t.Type.String(), outNum)
    continue
    }
    // The latest return type of the method must be error.
    // 规定最后一个返回值一定是error
    if returnType := t.Type.Out(outNum - 1); returnType != typError {
    logger.Warnf("the latest return type %s of method %q is not error", returnType, t.Name)
    continue
    }
    // 获取到所有的出参类型，放到数组里
    var funcOuts = make([]reflect.Type, outNum)
    for i := 0; i < outNum; i++ {
    funcOuts[i] = t.Type.Out(i)
    }
    // do method proxy here:
    // （三）调用make函数，传入函数名和返回值，获得能调用远程的proxy，将这个proxy替换掉原来的函数位置
    f.Set(reflect.MakeFunc(f.Type(), makeDubboCallProxy(methodName, funcOuts)))
    logger.Debugf("set method [%s]", methodName)
  }
    }
    ...
}
```

正如之前所说，proxy的作用是将用户定义的函数参数列表，转化为抽象的invocation传入Invoker，进行调用。

其中已标明有三处较为重要的地方：

1. 在代理函数中实现由参数列表生成Invocation的逻辑
2. 在代理函数实现调用Invoker的逻辑
3. 将代理函数替换为原始rpc-service对应函数
   至此，也就解决了一开始的问题：
   client.go: main()

```go
    config.Load()
    user := &User{}
    err := userProvider.GetUser(context.TODO(), []interface{}{"A001"}, user)
```

这里直接调用用户定义的rpcService的函数GetUser，这里实际调用的是经过重写入的函数代理，所以就能实现远程调用了。

### 3. 从client到server的invoker嵌套链- 小结

在阅读dubbo-go源码的过程中，我能发现一条清晰的invoker-proxy嵌套链，我希望通过图的形式来展现：

![img](/imgs/blog/dubbo-go/code2/p9.png)

> 作者简介 李志信 (GitHubID LaurenceLiZhixin)，中山大学软件工程专业在校学生，擅长使用 Java/Go 语言，专注于云原生和微服务等技术方向。
