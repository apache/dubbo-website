# 依赖

## 必须依赖
JDK 1.6+ [^1]

## 缺省依赖
通过 `mvn dependency:tree > dep.log` 命令分析，Dubbo 缺省依赖以下三方库：

```
[INFO] +- com.alibaba:dubbo:jar:2.5.9-SNAPSHOT:compile
[INFO] |  +- org.springframework:spring-context:jar:4.3.10.RELEASE:compile
[INFO] |  +- org.javassist:javassist:jar:3.21.0-GA:compile
[INFO] |  \- org.jboss.netty:netty:jar:3.2.5.Final:compile
```

这里所有依赖都是换照 Dubbo 缺省配置选的，这些缺省值是基于稳定性和性能考虑的。
  
* javassist.jar [^3]: 如果 `<dubbo:provider proxy="jdk" />` 或 `<dubbo:consumer proxy="jdk" />`，以及 `<dubbo:application compiler="jdk" />`，则不需要。
* spring-context.jar [^4]: 如果用 `ServiceConfig` 和 `ReferenceConfig` 的 API 调用，则不需要。
* netty.jar [^5]: 如果 `<dubbo:protocol server="mina"/>` 或 `<dubbo:protocol server="grizzly"/>`，则换成 mina.jar 或 grizzly.jar。如果 `<protocol name="rmi"/>`，则不需要。
    
## 可选依赖
以下依赖，在主动配置使用相应实现策略时用到，需自行加入依赖。

* netty-all 4.0.35.Final 
* mina: 1.1.7
* grizzly: 2.1.4
* httpclient: 4.5.3
* hessian_lite: 3.2.1-fixed
* fastjson: 1.2.31
* zookeeper: 3.4.9
* jedis: 2.9.0
* xmemcached: 1.3.6
* hessian: 4.0.38
* jetty: 6.1.26
* hibernate-validator: 5.4.1.Final
* zkclient: 0.2
* curator: 2.12.0
* cxf: 3.0.14
* thrift: 0.8.0
* servlet: 3.0 [^6]
* validation-api: 1.1.0.GA [^6]
* jcache: 1.0.0 [^6]
* javax.el: 3.0.1-b08 [^6]
* kryo: 4.0.1
* kryo-serializers: 0.42
* fst: 2.48-jdk-6
* resteasy: 3.0.19.Final
* tomcat-embed-core: 8.0.11
* slf4j: 1.7.25
* log4j: 1.2.16

[^1]: 理论上 Dubbo 可以只依赖 JDK，不依赖于任何三方库运行，只需配置使用 JDK 相关实现策略  
[^2]: 日志输出包  
[^3]: 字节码生成  
[^4]: 配置解析  
[^5]: 网络传输  
[^6]: JEE  
