> ![check](../sources/images/check.gif)如果公共配置很简单，没有多注册中心，多协议等情况，或者想多个Spring容器想共享配置，可以使用dubbo.properties作为缺省配置。

> ![check](../sources/images/check.gif)Dubbo将自动加载classpath根目录下的dubbo.properties，可以通过JVM启动参数：-Ddubbo.properties.file=xxx.properties 改变缺省配置位置。

> ![warning](../sources/images/warning-3.gif)如果classpath根目录下存在多个dubbo.properties，比如多个jar包中有dubbo.properties，Dubbo会任意加载，并打印Error日志，后续可能改为抛异常。

**映射规则：**
* 将XML配置的标签名，加属性名，用点分隔，多个属性拆成多行：  
    * 比如：`dubbo.application.name=foo`等价于`<dubbo:application name="foo" />` 
    * 比如：`dubbo.registry.address=10.20.153.10:9090`等价于`<dubbo:registry address="10.20.153.10:9090" /> `  
* 如果XML有多行同名标签配置，可用id号区分，如果没有id号将对所有同名标签生效:  
    * 比如：`dubbo.protocol.rmi.port=1234`等价于`<dubbo:protocol id="rmi" name="rmi" port="1099" /> `(协议的id没配时，缺省使用协议名作为id)
    * 比如：`dubbo.registry.china.address=10.20.153.10:9090`等价于`<dubbo:registry id="china" address="10.20.153.10:9090" />`

**典型配置如：**
``` properties
dubbo.properties
dubbo.application.name=foo
dubbo.application.owner=bar
dubbo.registry.address=10.20.153.10:9090
```
![properties-override](../sources/images/dubbo-properties-override.jpg)

**覆盖策略：**
* JVM启动-D参数优先，这样可以使用户在部署和启动时进行参数重写，比如在启动时需改变协议的端口。
* XML次之，如果在XML中有配置，则dubbo.properties中的相应配置项无效。
* Properties最后，相当于缺省值，只有XML没有配置时，dubbo.properties的相应配置项才会生效，通常用于共享公共配置，比如应用名。
