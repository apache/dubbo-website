> ![warning](../sources/images/warning-3.gif)2.2.1以上版本支持 

> ![warning](../sources/images/check.gif)扩展点：[日志适配扩展](http://dubbo.io/developer-guide/SPI%E5%8F%82%E8%80%83%E6%89%8B%E5%86%8C/%E6%97%A5%E5%BF%97%E9%80%82%E9%85%8D%E6%89%A9%E5%B1%95.html)

缺省自动查找：

* log4j
* slf4j
* jcl
* jdk

可以通过以下方式配置日志输出策略

```sh
java -Ddubbo.application.logger=log4j
```

**dubbo.properties**

```
dubbo.application.logger=log4j
```

**dubbo.xml**

```xml
<dubbo:application logger="log4j" />
```
