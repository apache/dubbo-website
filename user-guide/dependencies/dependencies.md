### 必须依赖
JDK1.5+
> 理论上Dubbo可以只依赖JDK，不依赖于任何三方库运行，只需配置使用JDK相关实现策略。

### 缺省依赖
通过`mvn dependency:tree > dep.log`命令分析，Dubbo缺省依赖以下三方库：
```
[INFO] +- com.alibaba:dubbo:jar:2.1.2:compile
[INFO] |  +- log4j:log4j:jar:1.2.16:compile 
[INFO] |  +- org.javassist:javassist:jar:3.15.0-GA:compile
[INFO] |  +- org.springframework:spring:jar:2.5.6.SEC03:compile
[INFO] |  +- commons-logging:commons-logging:jar:1.1.1:compile
[INFO] |  \- org.jboss.netty:netty:jar:3.2.5.Final:compile
```
这里所有依赖都是换照Dubbo缺省配置选的，这些缺省值是基于稳定性和性能考虑的。

* log4j.jar和commons-logging.jar日志输出包。  
    * 可以直接去掉，dubbo本身的日志会自动切换为JDK的java.util.logging输出。
    * 但如果其它三方库比如spring.jar间接依赖commons-logging，则不能去掉。
* javassist.jar 字节码生成。
    * 如果<dubbo:provider proxy="jdk" />或<dubbo:consumer proxy="jdk" />，以及<dubbo:application compiler="jdk" />，则不需要。
* spring.jar 配置解析。
    * 如果用ServiceConfig和ReferenceConfig的API调用，则不需要。
* netty.jar 网络传输。
    * 如果<dubbo:protocol server="mina"/>或<dubbo:protocol server="grizzly"/>，则换成mina.jar或grizzly.jar。
    * 如果<protocol name="rmi"/>，则不需要。
### 可选依赖
以下依赖，在主动配置使用相应实现策略时用到，需自行加入依赖。
* mina: 1.1.7
* grizzly: 2.1.4
* httpclient: 4.1.2
* hessian_lite: 3.2.1-fixed
* xstream: 1.4.1
* fastjson: 1.1.8
* zookeeper: 3.3.3
* jedis: 2.0.0
* xmemcached: 1.3.6
* jfreechart: 1.0.13
* hessian: 4.0.7
* jetty: 6.1.26
* hibernate-validator: 4.2.0.Final
* zkclient: 0.1
* curator: 1.1.10
* cxf: 2.6.1
* thrift: 0.8.0

JEE:
* servlet: 2.5
* bsf: 3.1
* validation-api: 1.0.0.GA
* jcache: 0.4