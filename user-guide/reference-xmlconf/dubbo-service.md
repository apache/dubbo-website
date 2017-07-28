服务提供者暴露服务配置：  
配置类：com.alibaba.dubbo.config.ServiceConfig

|标签 | 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性|
| -------- |---------|---------|---------|---------|---------|---------|---------|---------|
|&lt;dubbo:service&gt;  | interface  |    | class  | 必填  |    | 服务发现  | 服务接口名  | 1.0.0以上版本|
|&lt;dubbo:service&gt;  | ref  |    | object  | 必填  |    | 服务发现  | 服务对象实现引用  | 1.0.0以上版本|
|&lt;dubbo:service&gt;  | version  | version  | string  | 可选  | 0.0.0  | 服务发现  | 服务版本，建议使用两位数字版本，如：1.0，通常在接口不兼容时版本号才需要升级  | 1.0.0以上版本|
|&lt;dubbo:service&gt;  | group  | group  | string  | 可选  |    | 服务发现  | 服务分组，当一个接口有多个实现，可以用分组区分  | 1.0.7以上版本|
|&lt;dubbo:service&gt;  | path  | &lt;path&gt;  | string  | 可选  | 缺省为接口名  | 服务发现  | 服务路径 (注意：1.0不支持自定义路径，总是使用接口名，如果有1.0调2.0，配置服务路径可能不兼容)  | 1.0.12以上版本|
|&lt;dubbo:service&gt;  | delay  | delay  | int  | 可选  | 0  | 性能调优  | 延迟注册服务时间(毫秒) ，设为-1时，表示延迟到Spring容器初始化完成时暴露服务  | 1.0.14以上版本|
|&lt;dubbo:service&gt;  | timeout  | timeout  | int  | 可选  | 1000  | 性能调优  | 远程服务调用超时时间(毫秒)  | 2.0.0以上版本|
|&lt;dubbo:service&gt;  | retries  | retries  | int  | 可选  | 2  | 性能调优  | 远程服务调用重试次数，不包括第一次调用，不需要重试请设为0  | 2.0.0以上版本|
|&lt;dubbo:service&gt;  | connections  | connections  | int  | 可选  | 100  | 性能调优  | 对每个提供者的最大连接数，rmi、http、hessian等短连接协议表示限制连接数，dubbo等长连接协表示建立的长连接个数  | 2.0.0以上版本|
|&lt;dubbo:service&gt;  | loadbalance  | loadbalance  | string  | 可选  | random  | 性能调优  | 负载均衡策略，可选值：random,roundrobin,leastactive，分别表示：随机，轮循，最少活跃调用  | 2.0.0以上版本|
|&lt;dubbo:service&gt;  | async  | async  | boolean  | 可选  | false  | 性能调优  | 是否缺省异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程  | 2.0.0以上版本|
|&lt;dubbo:service&gt;  | stub  | stub  | class/boolean  | 可选  | false  | 服务治理  | 设为true，表示使用缺省代理类名，即：接口名 + Local后缀，服务接口客户端本地代理类名，用于在客户端执行本地逻辑，如本地缓存等，该本地代理类的构造函数必须允许传入远程代理对象，构造函数如：public XxxServiceLocal(XxxService xxxService)  | 2.0.0以上版本|
|&lt;dubbo:service&gt;  | mock  | mock  | class/boolean  | 可选  | false  | 服务治理  | 设为true，表示使用缺省Mock类名，即：接口名 + Mock后缀，服务接口调用失败Mock实现类，该Mock类必须有一个无参构造函数，与Local的区别在于，Local总是被执行，而Mock只在出现非业务异常(比如超时，网络异常等)时执行，Local在远程调用之前执行，Mock在远程调用后执行。| 2.0.0以上版本|
|&lt;dubbo:service&gt;  | token  | token  | string/boolean  | 可选  | false  | 服务治理  | 令牌验证，为空表示不开启，如果为true，表示随机生成动态令牌，否则使用静态令牌，令牌的作用是防止消费者绕过注册中心直接访问，保证注册中心的授权功能有效，如果使用点对点调用，需关闭令牌功能  | 2.0.0以上版本|
|&lt;dubbo:service&gt;  | registry  |    | string  | 可选  | 缺省向所有registry注册  | 配置关联  | 向指定注册中心注册，在多个注册中心时使用，值为&lt;dubbo:registry&gt;的id属性，多个注册中心ID用逗号分隔，如果不想将该服务注册到任何registry，可将值设为N/A  | 2.0.0以上版本|
|&lt;dubbo:service&gt;  | provider  |    | string  | 可选  | 缺使用第一个provider配置  | 配置关联  | 指定provider，值为&lt;dubbo:provider&gt;的id属性  | 2.0.0以上版本|
|&lt;dubbo:service&gt;  | deprecated  | deprecated  | boolean  | 可选  | false  | 服务治理  | 服务是否过时，如果设为true，消费方引用时将打印服务过时警告error日志  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | dynamic  | dynamic  | boolean  | 可选  | true  | 服务治理  | 服务是否动态注册，如果设为false，注册后将显示后disable状态，需人工启用，并且服务提供者停止时，也不会自动取消册，需人工禁用。  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | accesslog  | accesslog  | string/boolean  | 可选  | false  | 服务治理  | 设为true，将向logger中输出访问日志，也可填写访问日志文件路径，直接把访问日志输出到指定文件  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | owner  | owner  | string  | 可选  |    | 服务治理  | 服务负责人，用于服务治理，请填写负责人公司邮箱前缀  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | document  | document  | string  | 可选  |    | 服务治理  | 服务文档URL  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | weight  | weight  | int  | 可选  |    | 性能调优  | 服务权重  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | executes  | executes  | int  | 可选  | 0  | 性能调优  | 服务提供者每服务每方法最大可并行执行请求数  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | actives  | actives  | int  | 可选  | 0  | 性能调优  | 每服务消费者每服务每方法最大并发调用数  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | proxy  | proxy  | string  | 可选  | javassist  | 性能调优  | 生成动态代理方式，可选：jdk/javassist  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | cluster  | cluster  | string  | 可选  | failover  | 性能调优  | 集群方式，可选：failover/failfast/failsafe/failback/forking  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | filter  | service.filter  | string  | 可选  | default  | 性能调优  | 服务提供方远程调用过程拦截器名称，多个名称用逗号分隔  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | listener  | exporter.listener  | string  | 可选  | default  | 性能调优  | 服务提供方导出服务监听器名称，多个名称用逗号分隔  |  |
|&lt;dubbo:service&gt;  | protocol  |    | string  | 可选  |    | 配置关联  | 使用指定的协议暴露服务，在多协议时使用，值为&lt;dubbo:protocol&gt;的id属性，多个协议ID用逗号分隔  | 2.0.5以上版本|
|&lt;dubbo:service&gt;  | layer  | layer  | string  | 可选  |    | 服务治理  | 服务提供者所在的分层。如：biz、dao、intl:web、china:acton。  | 2.0.7以上版本|
|&lt;dubbo:service&gt;  | register  | register  | boolean  | 可选  | true  | 服务治理  | 该协议的服务是否注册到注册中心  | 2.0.8以上版本|