#### 整体设计

![/dev-guide/images/dubbo-framework.jpg](sources/images/dubbo-framework.jpg)

**图例说明**

* 图中左边淡蓝背景的为服务消费方使用的接口，右边淡绿色背景的为服务提供方使用的接口，位于中轴线上的为双方都用到的接口。
* 图中从下至上分为十层，各层均为单向依赖，右边的黑色箭头代表层之间的依赖关系，每一层都可以剥离上层被复用，其中，Service和Config层为API，其它各层均为SPI。
* 图中绿色小块的为扩展接口，蓝色小块为实现类，图中只显示用于关联各层的实现类。
* 图中蓝色虚线为初始化过程，即启动时组装链，红色实线为方法调用过程，即运行时调时链，紫色三角箭头为继承，可以把子类看作父类的同一个节点，线上的文字为调用的方法。

**各层说明**

* `config` 配置层，对外配置接口，以 `ServiceConfig`, `ReferenceConfig` 为中心，可以直接new配置类，也可以通过spring解析配置生成配置类
* `proxy` 服务代理层，服务接口透明代理，生成服务的客户端Stub和服务器端Skeleton, 以 `ServiceProxy` 为中心，扩展接口为 `ProxyFactory`
* `registry` 注册中心层，封装服务地址的注册与发现，以服务URL为中心，扩展接口为 `RegistryFactory`, `Registry`, `RegistryService`
* `cluster` 路由层，封装多个提供者的路由及负载均衡，并桥接注册中心，以 `Invoker` 为中心，扩展接口为 `Cluster`, `Directory`, `Router`, `LoadBalance`
* `monitor` 监控层，RPC调用次数和调用时间监控，以Statistics为中心，扩展接口为 `MonitorFactory`, `Monitor`, `MonitorService`
* `protocol` 远程调用层，封将RPC调用，以 `Invocation`, `Result` 为中心，扩展接口为 `Protocol`, `Invoker`, `Exporter`
* `exchange` 信息交换层，封装请求响应模式，同步转异步，以 `Request`, `Response` 为中心，扩展接口为 `Exchanger`, `ExchangeChannel`, `ExchangeClient`, `ExchangeServer`
* `transport` 网络传输层，抽象mina和netty为统一接口，以Message为中心，扩展接口为 `Channel`, `Transporter`, `Client`, `Server`, `Codec`
* `serialize` 数据序列化层，可复用的一些工具，扩展接口为`Serialization`, `ObjectInput`, `ObjectOutput`, `ThreadPool`

**关系说明**

* 在RPC中，Protocol是核心层，也就是只要有Protocol + Invoker + Exporter就可以完成非透明的RPC调用，然后在Invoker的主过程上Filter拦截点。
* 图中的Consumer和Provider是抽象概念，只是想让看图者更直观的了解哪些类分属于客户端与服务器端，不用Client和Server的原因是Dubbo在很多场景下都使用Provider, Consumer, Registry, Monitor划分逻辑拓普节点，保持统一概念。
* 而Cluster是外围概念，所以Cluster的目的是将多个Invoker伪装成一个Invoker，这样其它人只要关注Protocol层Invoker即可，加上Cluster或者去掉Cluster对其它层都不会造成影响，因为只有一个提供者时，是不需要Cluster的。
* Proxy层封装了所有接口的透明化代理，而在其它层都以Invoker为中心，只有到了暴露给用户使用时，才用Proxy将Invoker转成接口，或将接口实现转成Invoker，也就是去掉Proxy层RPC是可以Run的，只是不那么透明，不那么看起来像调本地服务一样调远程服务。
* 而Remoting实现是Dubbo协议的实现，如果你选择RMI协议，整个Remoting都不会用上，Remoting内部再划为Transport传输层和Exchange信息交换层，Transport层只负责单向消息传输，是对Mina,Netty,Grizzly的抽象，它也可以扩展UDP传输，而Exchange层是在传输层之上封装了Request-Response语义。
* Registry和Monitor实际上不算一层，而是一个独立的节点，只是为了全局概览，用层的方式画在一起。

#### 模块分包

![/dev-guide/images/dubbo-modules.jpg](sources/images/dubbo-modules.jpg)

**模块说明**

* dubbo-common 公共逻辑模块，包括Util类和通用模型。
* dubbo-remoting 远程通讯模块，相当于Dubbo协议的实现，如果RPC用RMI协议则不需要使用此包。
* dubbo-rpc 远程调用模块，抽象各种协议，以及动态代理，只包含一对一的调用，不关心集群的管理。
* dubbo-cluster 集群模块，将多个服务提供方伪装为一个提供方，包括：负载均衡, 容错，路由等，集群的地址列表可以是静态配置的，也可以是由注册中心下发。
* dubbo-registry 注册中心模块，基于注册中心下发地址的集群方式，以及对各种注册中心的抽象。
* dubbo-monitor 监控模块，统计服务调用次数，调用时间的，调用链跟踪的服务。
* dubbo-config 配置模块，是Dubbo对外的API，用户通过Config使用Dubbo，隐藏Dubbo所有细节。
* dubbo-container 容器模块，是一个Standlone的容器，以简单的Main加载Spring启动，因为服务通常不需要Tomcat/JBoss等Web容器的特性，没必要用Web容器去加载服务。

整体上按照分层结构进行分包，与分层的不同点在于：

* container为服务容器，用于部署运行服务，没有在层中画出。
* protocol层和proxy层都放在rpc模块中，这两层是rpc的核心，在不需要集群时(只有一个提供者)，可以只使用这两层完成rpc调用。
* transport层和exchange层都放在remoting模块中，为rpc调用的通讯基础。
* serialize层放在common模块中，以便更大程度复用。

#### 依赖关系

![/dev-guide/images/dubbo-relation.jpg](sources/images/dubbo-relation.jpg)

**图例说明**

* 图中小方块Protocol, Cluster, Proxy, Service, Container, Registry, Monitor代表层或模块，蓝色的表示与业务有交互，绿色的表示只对Dubbo内部交互。
* 图中背景方块Consumer, Provider, Registry, Monitor代表部署逻辑拓普节点。
* 图中蓝色虚线为初始化时调用，红色虚线为运行时异步调用，红色实线为运行时同步调用。
* 图中只包含RPC的层，不包含Remoting的层，Remoting整体都隐含在Protocol中。

#### 调用链

展开总设计图的红色调用链，如下：

![/dev-guide/images/dubbo-extension.jpg](sources/images/dubbo-extension.jpg)

#### 暴露服务时序

展开总设计图左边服务提供方暴露服务的蓝色初始化链，时序图如下：

![/dev-guide/images/dubbo-export.jpg](sources/images/dubbo-export.jpg)

#### 引用服务时序

展开总设计图右边服务消费方引用服务的蓝色初始化链，时序图如下：

![/dev-guide/images/dubbo-refer.jpg](sources/images/dubbo-refer.jpg)

#### 领域模型

在Dubbo的核心领域模型中：

* Protocol是服务域，它是Invoker暴露和引用的主功能入口，它负责Invoker的生命周期管理。
* Invoker是实体域，它是Dubbo的核心模型，其它模型都向它靠扰，或转换成它，它代表一个可执行体，可向它发起invoke调用，它有可能是一个本地的实现，也可能是一个远程的实现，也可能一个集群实现。
* Invocation是会话域，它持有调用过程中的变量，比如方法名，参数等。

#### 基本原则

* 采用Microkernel + Plugin模式，Microkernel只负责组装Plugin，Dubbo自身的功能也是通过扩展点实现的，也就是Dubbo的所有功能点都可被用户自定义扩展所替换。
* 采用URL作为配置信息的统一格式，所有扩展点都通过传递URL携带配置信息。

更多设计原则参见：[框架设计原则](http://dubbo.io/Training-zh.htm#Training-zh-《框架设计原则》)