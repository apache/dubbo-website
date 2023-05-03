---
aliases:
    - /zh/docsv2.7/user/configuration/properties/
description: 以属性配置的方式来配置你的 Dubbo 应用
linkTitle: 属性配置
title: 属性配置
type: docs
weight: 2
---



如果你的应用足够简单，例如，不需要多注册中心或多协议，并且需要在spring容器中共享配置，那么，我们可以直接使用 `dubbo.properties` 作为默认配置。

Dubbo 可以自动加载 classpath 根目录下的 dubbo.properties，但是你同样可以使用 JVM 参数来指定路径：`-Ddubbo.properties.file=xxx.properties`。

# 映射规则

可以将 xml 的 tag 名和属性名组合起来，用 ‘.’ 分隔。每行一个属性。

* `dubbo.application.name=foo` 相当于 `<dubbo:application name="foo" />` 
* `dubbo.registry.address=10.20.153.10:9090` 相当于 `<dubbo:registry address="10.20.153.10:9090" /> `  

如果在 xml 配置中有超过一个的 tag，那么你可以使用 ‘id’ 进行区分。如果你不指定 id，它将作用于所有 tag。

* `dubbo.protocol.rmi.port=1099` 相当于 `<dubbo:protocol id="rmi" name="rmi" port="1099" /> `
* `dubbo.registry.china.address=10.20.153.10:9090` 相当于 `<dubbo:registry id="china" address="10.20.153.10:9090" />`

如下，是一个典型的 dubbo.properties 配置样例。

```properties
dubbo.application.name=foo
dubbo.application.owner=bar
dubbo.registry.address=10.20.153.10:9090
```

## 重写与优先级

![properties-override](/imgs/user/dubbo-properties-override.jpg)

优先级从高到低：

* JVM -D 参数：当你部署或者启动应用时，它可以轻易地重写配置，比如，改变 dubbo 协议端口；
* XML：XML 中的当前配置会重写 dubbo.properties 中的；
* Properties：默认配置，仅仅作用于以上两者没有配置时。

1. 如果在 classpath 下有超过一个 dubbo.properties 文件，比如，两个 jar 包都各自包含了 dubbo.properties，dubbo 将随机选择一个加载，并且打印错误日志。
2. 如果 `id` 没有在 `protocol` 中配置，将使用 `name` 作为默认属性。