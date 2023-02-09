---
title: "Dubbo 中的 URL 统一模型"
linkTitle: "Dubbo 中的 URL 统一模型"
date: 2019-10-17
tags: ["源码解析", "Java"]
description: >
    URL 是 Dubbo 中一个重要的领域模型，了解它可以更加轻松的理解 Dubbo 的设计理念。
---

### 定义

在不谈及 dubbo 时，我们大多数人对 URL 这个概念并不会感到陌生。统一资源定位器 ([RFC1738](https://www.ietf.org/rfc/rfc1738.txt)――Uniform Resource Locators (URL)）应该是最广为人知的一个 RFC 规范，它的定义也非常简单

> 因特网上的可用资源可以用简单字符串来表示，该文档就是描述了这种字符串的语法和语
> 义。而这些字符串则被称为：“统一资源定位器”（URL）

**一个标准的 URL 格式**至多可以包含如下的几个部分

```
protocol://username:password@host:port/path?key=value&key=value
```

**一些典型 URL**

```
http://www.facebook.com/friends?param1=value1&amp;param2=value2
https://username:password@10.20.130.230:8080/list?version=1.0.0
ftp://username:password@192.168.1.7:21/1/read.txt
```

当然，也有一些**不太符合常规的 URL**，也被归类到了 URL 之中

```
192.168.1.3:20880
url protocol = null, url host = 192.168.1.3, port = 20880, url path = null

file:///home/user1/router.js?type=script
url protocol = file, url host = null, url path = home/user1/router.js

file://home/user1/router.js?type=script<br>
url protocol = file, url host = home, url path = user1/router.js

file:///D:/1/router.js?type=script
url protocol = file, url host = null, url path = D:/1/router.js

file:/D:/1/router.js?type=script
同上 file:///D:/1/router.js?type=script

/home/user1/router.js?type=script
url protocol = null, url host = null, url path = home/user1/router.js

home/user1/router.js?type=script
url protocol = null, url host = home, url path = user1/router.js
```

### Dubbo 中的 URL

在 dubbo 中，也使用了类似的 URL，主要用于在各个扩展点之间传递数据，组成此 URL 对象的具体参数如下:

- protocol：一般是 dubbo 中的各种协议 如：dubbo thrift http zk 
- username/password：用户名/密码
- host/port：主机/端口
- path：接口名称
- parameters：参数键值对

```java
public URL(String protocol, String username, String password, String host, int port, String path, Map<String, String> parameters) {
   if ((username == null || username.length() == 0) 
         && password != null && password.length() > 0) {
      throw new IllegalArgumentException("Invalid url, password without username!");
   }
   this.protocol = protocol;
   this.username = username;
   this.password = password;
   this.host = host;
   this.port = (port < 0 ? 0 : port);
   this.path = path;
   // trim the beginning "/"
   while(path != null && path.startsWith("/")) {
       path = path.substring(1);
   }
   if (parameters == null) {
       parameters = new HashMap<String, String>();
   } else {
       parameters = new HashMap<String, String>(parameters);
   }
   this.parameters = Collections.unmodifiableMap(parameters);
}
```

可以看出，dubbo 认为 protocol，username，passwored，host，port，path 是主要的 URL 参数，其他键值对存放在 parameters 之中。

**一些典型的 Dubbo URL**

```
dubbo://192.168.1.6:20880/moe.cnkirito.sample.HelloService?timeout=3000
描述一个 dubbo 协议的服务

zookeeper://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=demo-consumer&dubbo=2.0.2&interface=org.apache.dubbo.registry.RegistryService&pid=1214&qos.port=33333&timestamp=1545721981946
描述一个 zookeeper 注册中心

consumer://30.5.120.217/org.apache.dubbo.demo.DemoService?application=demo-consumer&category=consumers&check=false&dubbo=2.0.2&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=1209&qos.port=33333&side=consumer&timestamp=1545721827784
描述一个消费者
```

可以说，任意的一个领域中的一个实现都可以认为是一类 URL，dubbo 使用 URL 来统一描述了元数据，配置信息，贯穿在整个框架之中。

### URL 相关的生命周期

#### RPC调用

从地址发现的视角，URL 代表了一条可用的 provider 实例地址，除了地址信息之外还有相关的配置信息，这些配置信息是层次化的，有 provider 侧指定的配置值、consumer 侧指定的配置值、接口级别的配置值、方法级别的配置值等。这些 URL 配置值将直接影响消费端的 RPC 调用行为。

以 timeout 为例，下图显示了配置的查找顺序，其它 retries, loadbalance, actives 等类似：

* 方法级优先，接口级次之，全局配置再次之。
* 如果级别一样，则消费方优先，提供方次之。

其中，服务提供方配置，通过 URL 经由注册中心传递给消费方。

![dubbo-config-override](/imgs/user/dubbo-config-override.jpg)

（建议由服务提供方设置超时，因为一个方法需要执行多长时间，服务提供方更清楚，如果一个消费方同时引用多个服务，就不需要关心每个服务的超时设置）。

理论上 ReferenceConfig 中除了`interface`这一项，其他所有配置项都可以缺省不配置，框架会自动使用ConsumerConfig，ServiceConfig, ProviderConfig等提供的缺省配置。

#### 解析服务

基于 dubbo.jar 内的 `META-INF/spring.handlers` 配置，Spring 在遇到 dubbo 名称空间时，会回调 `DubboNamespaceHandler`。

所有 dubbo 的标签，都统一用 `DubboBeanDefinitionParser` 进行解析，基于一对一属性映射，将 XML 标签解析为 Bean 对象。

在 `ServiceConfig.export()` 或 `ReferenceConfig.get()` 初始化时，将 Bean 对象转换 URL 格式，所有 Bean 属性转成 URL 的参数。

然后将 URL 传给协议扩展点，基于扩展点自适应机制，根据 URL 的协议头，进行不同协议的服务暴露或引用。

#### 暴露服务

**1. 只暴露服务端口：**

在没有注册中心，直接暴露提供者的情况下，`ServiceConfig` 解析出的 URL 的格式为：`dubbo://service-host/com.foo.FooService?version=1.0.0`。

基于扩展点自适应机制，通过 URL 的 `dubbo://` 协议头识别，直接调用 `DubboProtocol`的 `export()` 方法，打开服务端口。

**2. 向注册中心暴露服务：**

在有注册中心，需要注册提供者地址的情况下，`ServiceConfig` 解析出的 URL 的格式为: `registry://registry-host/org.apache.dubbo.registry.RegistryService?export=URL.encode("dubbo://service-host/com.foo.FooService?version=1.0.0")`，

基于扩展点自适应机制，通过 URL 的 `registry://` 协议头识别，就会调用 `RegistryProtocol` 的 `export()` 方法，将 `export` 参数中的提供者 URL，先注册到注册中心。

再重新传给 `Protocol` 扩展点进行暴露： `dubbo://service-host/com.foo.FooService?version=1.0.0`，然后基于扩展点自适应机制，通过提供者 URL 的 `dubbo://` 协议头识别，就会调用 `DubboProtocol` 的 `export()` 方法，打开服务端口。

#### 引用服务

**1. 直连引用服务：**

在没有注册中心，直连提供者的情况下，`ReferenceConfig` 解析出的 URL 的格式为：`dubbo://service-host/com.foo.FooService?version=1.0.0`。

基于扩展点自适应机制，通过 URL 的 `dubbo://` 协议头识别，直接调用 `DubboProtocol` 的 `refer()` 方法，返回提供者引用。

**2. 从注册中心发现引用服务：**

在有注册中心，通过注册中心发现提供者地址的情况下，`ReferenceConfig` 解析出的 URL 的格式为：`registry://registry-host/org.apache.dubbo.registry.RegistryService?refer=URL.encode("consumer://consumer-host/com.foo.FooService?version=1.0.0")`。

基于扩展点自适应机制，通过 URL 的 `registry://` 协议头识别，就会调用 `RegistryProtocol` 的 `refer()` 方法，基于 `refer` 参数中的条件，查询提供者 URL，如： `dubbo://service-host/com.foo.FooService?version=1.0.0`。

基于扩展点自适应机制，通过提供者 URL 的 `dubbo://` 协议头识别，就会调用 `DubboProtocol` 的 `refer()` 方法，得到提供者引用。

然后 `RegistryProtocol` 将多个提供者引用，通过 `Cluster` 扩展点，伪装成单个提供者引用返回。

### URL 统一模型的意义

对于 dubbo 中的 URL，有人理解为配置总线，有人理解为统一配置模型，说法虽然不同，但都是在表达一个意思，这样的 URL 在 dubbo 中被当做是[公共契约](/zh-cn/docsv2.7/dev/contract/)，所有扩展点参数都包含 URL 参数，URL 作为上下文信息贯穿整个扩展点设计体系。

在没有 URL 之前，只能以字符串传递参数，不停的解析和拼装，导致相同类型的接口，参数时而 Map, 时而 Parameters 类包装：

```java
export(String url) 
createExporter(String host, int port, Parameters params)
```

使用 URL 一致性模型：

```java
export(URL url) 
createExporter(URL url)
```

在最新的 dubbo 代码中，我们可以看到大量使用 URL 来进行上下文之间信息的传递，这样的好处是显而易见的：

1. 使得代码编写者和阅读者能够将一系列的参数联系起来，进而形成规范，使得代码易写，易读。
2. 可扩展性强，URL 相当于参数的集合(相当于一个 Map)，他所表达的含义比单个参数更丰富，当我们在扩展代码时，可以将新的参数追加到 URL 之中，而不需要改变入参，返参的结构。
3. 统一模型，它位于 org.apache.dubbo.common 包中，各个扩展模块都可以使用它作为参数的表达形式，简化了概念，降低了代码的理解成本。

如果你能够理解 final 契约和 restful 契约，那我相信你会很好地理解 URL 契约。契约的好处我还是啰嗦一句：大家都这么做，就形成了默契，沟通是一件很麻烦的事，统一 URL 模型可以省去很多沟通成本，这边是 URL 统一模型存在的意义。
