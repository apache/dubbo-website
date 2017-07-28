> ![warning](../sources/images/warning-3.gif)2.3.0以上版本支持。

> ![check](../sources/images/check.gif)[Thrift](http://thrift.apache.org) 是Facebook捐给Apache的一个RPC框架

> ![check](../sources/images/check.gif)当前 dubbo 支持的 thrift 协议是对 thrift 原生协议的扩展，在原生协议的基础上添加了一些额外的头信息，比如service name，magic number等。使用dubbo thrift协议同样需要使用thrift的idl compiler编译生成相应的java代码，后续版本中会在这方面做一些增强。

示例：https://github.com/alibaba/dubbo/tree/master/dubbo-rpc/dubbo-rpc-thrift/src/test/java/com/alibaba/dubbo/rpc/protocol/thrift/examples

依赖：

```xml
<dependency>
    <groupId>org.apache.thrift</groupId>
    <artifactId>libthrift</artifactId>
    <version>0.8.0</version>
</dependency>
```

所有服务共用一个端口：(与原生Thrift不兼容)

```xml
<dubbo:protocol name="thrift" port="3030" />
```

Thrift*不支持*数据类型：null值 (不能在协议中传递null值)