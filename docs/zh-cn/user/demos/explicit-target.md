# 直连提供者

在开发及测试环境下，经常需要绕过注册中心，只测试指定服务提供者，这时候可能需要点对点直连，点对点直联方式，将以服务接口为单位，忽略注册中心的提供者列表，A 接口配置点对点，不影响 B 接口从注册中心获取列表。

![/user-guide/images/dubbo-directly.jpg](../sources/images/dubbo-directly.jpg)

## 通过 XML 配置

如果是线上需求需要点对点，可在 `<dubbo:reference>` 中配置 url 指向提供者，将绕过注册中心，多个地址用分号隔开，配置如下  [^1]：

```xml
<dubbo:reference id="xxxService" interface="com.alibaba.xxx.XxxService" url="dubbo://localhost:20890" />
```

## 通过 -D 参数指定

在 JVM 启动参数中加入-D参数映射服务地址 [^2]，如：

```sh
java -Dcom.alibaba.xxx.XxxService=dubbo://localhost:20890
```

## 通过文件映射

如果服务比较多，也可以用文件映射，用 `-Ddubbo.resolve.file` 指定映射文件路径，此配置优先级高于 `<dubbo:reference>` 中的配置 [^3]，如：

```sh
java -Ddubbo.resolve.file=xxx.properties
```
    
然后在映射文件 `xxx.properties` 中加入配置，其中 key 为服务名，value 为服务提供者 URL：
    
```properties
com.alibaba.xxx.XxxService=dubbo://localhost:20890
```
    
**注意**  为了避免复杂化线上环境，不要在线上使用这个功能，只应在测试阶段使用。

[^1]: `1.0.6` 及以上版本支持
[^2]: key 为服务名，value 为服务提供者 url，此配置优先级最高，`1.0.15` 及以上版本支持
[^3]: `1.0.15` 及以上版本支持，`2.0` 以上版本自动加载 ${user.home}/dubbo-resolve.properties文件，不需要配置
