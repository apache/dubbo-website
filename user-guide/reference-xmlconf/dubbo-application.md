应用信息配置：  
配置类：com.alibaba.dubbo.config.ApplicationConfig

|标签 | 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性|
| -------- |---------|---------|---------|---------|---------|---------|---------|---------|
|&lt;dubbo:application> | name | application | string | 必填 |   | 服务治理 | 当前应用名称，用于注册中心计算应用间依赖关系，注意：消费者和提供者应用名不要一样，此参数不是匹配条件，你当前项目叫什么名字就填什么，和提供者消费者角色无关，比如：kylin应用调用了morgan应用的服务，则kylin项目配成kylin，morgan项目配成morgan，可能kylin也提供其它服务给别人使用，但kylin项目永远配成kylin，这样注册中心将显示kylin依赖于morgan | 1.0.16以上版本|
|&lt;dubbo:application> | version | application.version | string | 可选 |   | 服务治理 | 当前应用的版本 | 2.2.0以上版本|
|&lt;dubbo:application> | owner | owner | string | 可选 |   | 服务治理 | 应用负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.0.5以上版本|
|&lt;dubbo:application> | organization | organization | string | 可选 |   | 服务治理 | 组织名称(BU或部门)，用于注册中心区分服务来源，此配置项建议不要使用autoconfig，直接写死在配置中，比如china,intl,itu,crm,asc,dw,aliexpress等 | 2.0.0以上版本|
|&lt;dubbo:application> | architecture | architecture | string | 可选 |   | 服务治理 | 用于服务分层对应的架构。如，intl、china。不同的架构使用不同的分层。 | 2.0.7以上版本|
|&lt;dubbo:application> | environment | environment | string | 可选 |   | 服务治理 | 应用环境，如：develop/test/product，不同环境使用不同的缺省值，以及作为只用于开发测试功能的限制条件 | 2.0.0以上版本|
|&lt;dubbo:application> | compiler | compiler | string | 可选 | javassist | 性能优化 | Java字节码编译器，用于动态类的生成，可选：jdk或javassist | 2.1.0以上版本|
|&lt;dubbo:application> | logger | logger | string | 可选 | slf4j | 性能优化 | 日志输出方式，可选：slf4j,jcl,log4j,jdk | 2.2.0以上版本|