dubbo对于spring的扩展
    在spring中定义了两个接口：
        NameSpaceHandler 注册一堆 BeanDefinitionParser 利用他们进行解析配置文件
        BeanDefinitionParser 解析每一个标签内容
    Spring默认会加载jar下的MATE-INF/spring.handlers 文件寻找对应的 NameSpaceHandler。
    Dubbo-config-spring就含有这个文件。

dubbo的接入实现
    Dubbo 中 Spring 扩展就是使用 Spring 的自定义类型，所以同样也有 NameSpaceHandler BeanDefinitionParser。
    而 NameSpaceHandler 是 DubboNameSpaceHandler

Dubbo启动解析，解析配置文件流程
    在Dubbo的 MATE-INF 目录下，有一个 Spring.handlers 配置文件 。
    容器启动会加载这个文件
    这个文件里面注册了一个bean叫 DubboNameSpaceHandler
    这个bean的init方法里面加载了很多的DubboBeanDefinitionParser 作为配置文件解析器。
    parse方法就是对标签的解析，他会判断这个标签的所属类型，然后根据标签的配置进行属性填充，最终将所有的bean注册到配置中心。

Dubbo的SPI机制
    分类
        默认扩展点
        自适应扩展点
        激活扩展点
    扩展点
        Dubbo作为应用灵活的框架，并不会强制所有用户都一定使用Dubbo提供的某些架构。
        比如：虽然dubbo提供了zk和redis作为注册中心，但是我们依然可以使用其他的注册中心。
        针对这种可被替换的技术实现点称之为扩展点。
    Wrapper
        dubbo在加载某个接口扩展类的时候，如果实现类中有一个拷贝类构造函数，那么该接口实现就是该接口的包装类。
        此时，dubbo会在真正的实现类上层包装上wrapper。
        也就是说，这个时候从ExtensionLoader中返回的实际扩展类是被wrapper包装的接口实现类。
        拷贝类
            如果当前这个类是一个wrapper包装类，也就是这个wrapper中有构造方法，参数是当前被加载的扩展点的类型
    Adaptive
        RegistryProtocol中有一个属性Cluster，Protocol 和 Cluster 都是Dubbo 提供的扩展点，这个时候真正操作 
        Cluster的时候真正操作的是哪一个类呢？
        Dubbo在加载一个扩展点的时候如果发现其成员变量也是一个扩展点并且有相关的set方法，就会在这个时候讲扩展点设置成
        一个自适应扩展点，自适应扩展点会在真正使用的时候从URL获取相关参数，来调用真正的扩展点实现类
    Activate
        自激活扩展点 / 条件激活
        提供一种选择性激活条件，开发者可以通过相关配置来确定激活哪些功能

服务发布
    ServiceBean
        初始化bean的时候会执行afterPropertiesSet
        spring 容器启动后会发一个事件通知 onApplicationEvent
    服务提供者
        接受事件以后执行服务的发布
        加载所有的配置的注册中心地址，组装成URL 作为整个流程的载体
        轮训所有的注册中心地址，针对每一个协议发布一个服务
            获取到一个经过wrapper包装的通过javasissit生成的动态代理对象 Invoker模型作为参数
            通过自适应扩展点机制发布这个被包装的Invoker
                实现服务注册 --TODO
                订阅服务重写
                发布服务
                    经过wrapper对Invoker进行层层过滤，然后作为参数传递给export()
                    启动一个netty服务，开启心跳检测

Invoker
    从前面来看：服务发布经过几个阶段
        1.加载注册中心地址封装成URL
        2.讲URL封装成Invoker，并使用wrapper进行包装
        3.把dubbo协议的URL注册到注册中心
        4.启动本地netty服务
    Invoker到底是什么？
        ServiceConfig#export()
    Invoker本质上是一个动态代理类，经过层层包装进行了发布，当消费者发起请求时，会获得这个Invoker进行调用

服务注册
    RegistryProtocol#export()
        获取注册中心实例
            将URL转化为对应配置的注册中心的具体协议
            根据具体协议，从registryFactory获得指定的注册中心实现
                使用curator来创建一个zk连接，并添加监听器监听zk节点状态变化事件
        获取想要注册的URL dubbo://
        使用curator的客户端将URL注册到注册中心

服务调用
    ReferenceFactoryBean
    
    服务调用的本质其实就是通过动态代理创建代理对象并返回。当我们调用接口方法时，则调用到InvocationHandler相关方法，处理相关请求。
    
    Dubbo中 可以通过rpccontext 上的setAttachment 和getAttachment 在服务消费方和提供方之间进行参数的隐式传递

    当前类实现的接口
        FactoryBean 工厂bean getObject()，当我们的服务注入到其他服务，就会调用此方法。
        ApplicationContextAware  setApplicationContext() 给当前类设置spring上下文容器。
        InitializingBean afterPropertiesSet() bean的初始化方法 当bean完成实例化之后被调用。

    创建代理对象
        判断是JVM内部调用还是远程调用根据判断结果使用不同的协议构建URL创建Invoker
            组装注册中心协议的URL，构建Directory
                Directory会订阅zk中节点的变化，监听路径 ： providers configurators routers
                    监控中心发起的所有的service层的订阅
                    指定的service发起的订阅
                        针对每一个category,调用listener.notify进行通知,然后更新本地的缓存文件
                        触发RegistryDirectory.notify
                            逐个调用注册中心里面的配置,覆盖原来的url,组成最新的url并存储
                            根据 provider urls,重新刷新Invoker
                                protocol.refer 构建了一个invoker
                                    根据URL构建了一个 exchangeClient 通过getClients 建立通信
                                        建立通信实际上就是启动了一个netty的客户端
                                    通过 exchangeClient 构建 Invoker
            通过Directory构建Cluster
                cluster又是一个自适应扩展点，默认是failover 但是实际上，这里通过 MockClusterWrapper 进行了包装
                实际上 Invoker 应该是一个经过 MockClusterWrapper 包装的 FailoverCluster
            通过Cluster构建Invoker
        如果有多个Invoker会通过Cluster进行合并，成为一个Invoker
        根据Invoker创建服务的代理对象
            PROXY_FACTORY是一个自适应扩展点
            通过 javassist 生成一个代理类 并且用 InvokerInvocationHandler 进行了处理。
            意味着后续服务调用的时候，会由 InvokerInvocationHandler 进行处理。
            @Reference 注解实际上注入的就是一个经过 InvokerInvocationHandler 处理的动态代理类，
            当我们进行方法调用的时候，实际上就是调用了 InvokerInvocationHandler 的 invoke()。
    代理对象调用方法
        从前面可以知道，invoker实际上是InvokerInvocationHandler(MockClusterWrapper(FailoverCluster(directory)))
        所以invoker.invoke()实际上是MockClusterInvoker的invoke()在执行
            首先处理配置的或者默认的降级逻辑
            传递给下一个invoker进行方法调用
                通过RpcContext进行参数设置
                在invoker列表通过路有规则获取到符合条件的invoker
                初始化负载均衡机制
                委派模式交给子类进行方法调用
                    通过配置的负载均衡策略获取目标服务，记录调用过的服务，防止请求重发
                    执行成功返回结果
                        处理attachments(目标服务的接口信息和版本信息)中的信息
                            判断当前方法是否有返回值，如果有返回值就采用异步通信
                            把构建好的RpcInvocation 组装到一个request对象中进行传递
                                通过 NioSocketChannel 把消息发送出去
                    出现异常，判断是业务异常则抛出，否则重试

提供者接收到请求的处理逻辑
    客户端把消息发送出去之后,服务端会收到消息,然后把执行的结果返回到客户端
    处理过程实际上就是经过netty的handler调用链后根据请求参数调用invoker的代理对象执行方法的过程


    


    


