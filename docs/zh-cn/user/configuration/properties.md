# 属性配置

如果你的应用足够简单，例如，不需要多注册中心或多协议，并且需要在spring容器中共享配置，那么，我们可以直接使用 `dubbo.properties`作为默认配置。

Dubbo可以自动加载classpath根目录下的dubbo.properties，但是你同样可以使用JVM参数来指定路径：`-Ddubbo.properties.file=xxx.properties`。

# 映射规则
可以将xml的tag名和属性名组合起来，用‘.’分隔。每行一个属性。

* `dubbo.application.name=foo` 相当于 `<dubbo:application name="foo" />` 
* `dubbo.registry.address=10.20.153.10:9090` 相当于 `<dubbo:registry address="10.20.153.10:9090" /> `  

如果在xml配置中有超过一个的tag，那么你可以使用‘id’进行区分。如果你不指定id，它将作用于所有tag。

* `dubbo.protocol.rmi.port=1099` 相当于 `<dubbo:protocol id="rmi" name="rmi" port="1099" /> `
* `dubbo.registry.china.address=10.20.153.10:9090` 相当于 `<dubbo:registry id="china" address="10.20.153.10:9090" />`

如下，是一个典型的dubbo.properties配置样例。

```properties
dubbo.application.name=foo
dubbo.application.owner=bar
dubbo.registry.address=10.20.153.10:9090
```

## 重写与优先级
![properties-override](https://github.com/apache/dubbo-website/blob/master/docs/en-us/user/sources/images/dubbo-properties-override.jpg)

优先级从高到低：

* JVM -D参数，当你部署或者启动应用时，它可以轻易地重写配置，比如，改变dubbo协议端口；
* XML, XML中的当前配置会重写dubbo.properties中的；
* Properties，默认配置，仅仅作用于以上两者没有配置时。

1：如果在classpath下有超过一个dubbo.properties文件，比如，两个jar包都各自包含了dubbo.properties，dubbo将随机选择一个加载，并且打印错误日志。

2：如果 `id`没有在`protocol`中配置，将使用`name`作为默认属性。
