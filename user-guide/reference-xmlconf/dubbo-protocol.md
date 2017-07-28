服务提供者协议配置：  
配置类：com.alibaba.dubbo.config.ProtocolConfig  
说明：如果需要支持多协议，可以声明多个|&lt;dubbo:protocol&gt;标签，并在|&lt;dubbo:service&gt;中通过protocol属性指定使用的协议。

|标签 | 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性|
| -------- |---------|---------|---------|---------|---------|---------|---------|---------|
|&lt;dubbo:protocol&gt; | id |   | string | 可选 | dubbo | 配置关联 | 协议BeanId，可以在|&lt;dubbo:service protocol=""&gt;中引用此ID，如果ID不填，缺省和name属性值一样，重复则在name后加序号。 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | name | |&lt;protocol&gt; | string | 必填 | dubbo | 性能调优 | 协议名称 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | port | |&lt;port&gt; | int | 可选 | dubbo协议缺省端口为20880，rmi协议缺省端口为1099，http和hessian协议缺省端口为80 如果配置为-1 或者 没有配置port，则会分配一个没有被占用的端口。Dubbo 2.4.0+，分配的端口在协议缺省端口的基础上增长，确保端口段可控。 | 服务发现 | 服务端口 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | host | |&lt;host&gt; | string | 可选 | 自动查找本机IP | 服务发现 | -服务主机名，多网卡选择或指定VIP及域名时使用，为空则自动查找本机IP，-建议不要配置，让Dubbo自动获取本机IP | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | threadpool | threadpool | string | 可选 | fixed | 性能调优 | 线程池类型，可选：fixed/cached | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | threads | threads | int | 可选 | 100 | 性能调优 | 服务线程池大小(固定大小) | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | iothreads | threads | int | 可选 | cpu个数+1 | 性能调优 | io线程池大小(固定大小) | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | accepts | accepts | int | 可选 | 0 | 性能调优 | 服务提供方最大可接受连接数 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | payload | payload | int | 可选 | 88388608(=8M) | 性能调优 | 请求及响应数据包大小限制，单位：字节 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | codec | codec | string | 可选 | dubbo | 性能调优 | 协议编码方式 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | serialization | serialization | string | 可选 | dubbo协议缺省为hessian2，rmi协议缺省为java，http协议缺省为json | 性能调优 | 协议序列化方式，当协议支持多种序列化方式时使用，比如：dubbo协议的dubbo,hessian2,java,compactedjava，以及http协议的json等 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | accesslog | accesslog | string/boolean | 可选 |   | 服务治理 | 设为true，将向logger中输出访问日志，也可填写访问日志文件路径，直接把访问日志输出到指定文件 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | path | |&lt;path&gt; | string | 可选 |   | 服务发现 | 提供者上下文路径，为服务path的前缀 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | transporter | transporter | string | 可选 | dubbo协议缺省为netty | 性能调优 | 协议的服务端和客户端实现类型，比如：dubbo协议的mina,netty等，可以分拆为server和client配置 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | server | server | string | 可选 | dubbo协议缺省为netty，http协议缺省为servlet | 性能调优 | 协议的服务器端实现类型，比如：dubbo协议的mina,netty等，http协议的jetty,servlet等 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | client | client | string | 可选 | dubbo协议缺省为netty | 性能调优 | 协议的客户端实现类型，比如：dubbo协议的mina,netty等 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | dispatcher | dispatcher | string | 可选 | dubbo协议缺省为all | 性能调优 | 协议的消息派发方式，用于指定线程模型，比如：dubbo协议的all, direct, message, execution, connection等 | 2.1.0以上版本|
|&lt;dubbo:protocol&gt; | queues | queues | int | 可选 | 0 | 性能调优 | 线程池队列大小，当线程池满时，排队等待执行的队列大小，建议不要设置，当线程程池时应立即失败，重试其它服务提供机器，而不是排队，除非有特殊需求。 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | charset | charset | string | 可选 | UTF-8 | 性能调优 | 序列化编码 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | buffer | buffer | int | 可选 | 8192 | 性能调优 | 网络读写缓冲区大小 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | heartbeat | heartbeat | int | 可选 | 0 | 性能调优 | 心跳间隔，对于长连接，当物理层断开时，比如拔网线，TCP的FIN消息来不及发送，对方收不到断开事件，此时需要心跳来帮助检查连接是否已断开 | 2.0.10以上版本|
|&lt;dubbo:protocol&gt; | telnet | telnet | string | 可选 |   | 服务治理 | 所支持的telnet命令，多个命令用逗号分隔 | 2.0.5以上版本|
|&lt;dubbo:protocol&gt; | register | register | boolean | 可选 | true | 服务治理 | 该协议的服务是否注册到注册中心 | 2.0.8以上版本|
|&lt;dubbo:protocol&gt; | contextpath | contextpath | String | 可选 | 缺省为空串 | 服务治理 |   | 2.0.6以上版本|