# Dependencies

## Necessary dependencies
JDK 1.6+ [^1]

## Default dependencies
use `mvn dependency:tree > dep.log`  command to analysis，Dubbo default depends on the following 3rd party libraries：

```
[INFO] +- com.alibaba:dubbo:jar:2.5.9-SNAPSHOT:compile
[INFO] |  +- org.springframework:spring-context:jar:4.3.10.RELEASE:compile
[INFO] |  +- org.javassist:javassist:jar:3.21.0-GA:compile
[INFO] |  \- org.jboss.netty:netty:jar:3.2.5.Final:compile
```

All dependencies here are selected for the default configuration of the Dubbo, which are based on stability and performance considerations.
 
* javassist.jar [^3]: if `<dubbo:provider proxy="jdk" />` or `<dubbo:consumer proxy="jdk" />`，or `<dubbo:application compiler="jdk" />`， is not required.
* spring-context.jar [^4]: If you are using `ServiceConfig` and `ReferenceConfig` API calls, is not required.
* netty.jar [^5]: if `<dubbo:protocol server="mina"/>` or `<dubbo:protocol server="grizzly"/>`，Then change to mina.jar or grizzly.jar. If `<protocol name="rmi"/>`， is not required.    

## Optinal dependencies
These dependencies  needs to be added to project manually，when you need them.

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

[^1]: In theory, Dubbo only depend on JDK, not depend on any 3rd party libs, you can finish logic by useing  JDK.
[^2]: Log output jar
[^3]: Bytecode generation
[^4]: Configuration parsing
[^5]: Network transmission
[^6]: JAVAEE