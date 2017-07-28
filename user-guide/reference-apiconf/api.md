> ![check](../sources/images/check.gif) Dubbo的常规功能，都保持零侵入，但有些功能不得不用API侵入才能实现。  

> ![warning](../sources/images/warning-3.gif) Dubbo中除这里声明以外的接口或类，都是内部接口或扩展接口，普通用户请不要直接依赖，否则升级版本可能出现不兼容。

API汇总如下：  

#### 配置API

```
com.alibaba.dubbo.config.ServiceConfig
com.alibaba.dubbo.config.ReferenceConfig
com.alibaba.dubbo.config.ProtocolConfig
com.alibaba.dubbo.config.RegistryConfig
com.alibaba.dubbo.config.MonitorConfig
com.alibaba.dubbo.config.ApplicationConfig
com.alibaba.dubbo.config.ModuleConfig
com.alibaba.dubbo.config.ProviderConfig
com.alibaba.dubbo.config.ConsumerConfig
com.alibaba.dubbo.config.MethodConfig
com.alibaba.dubbo.config.ArgumentConfig
```
详细参见：[API配置](../configuration/api.md)  

#### 注解API

```
com.alibaba.dubbo.config.annotation.Service
com.alibaba.dubbo.config.annotation.Reference
```

详细参见：[注解配置](../configuration/annotation.md)

#### 模型API
```
com.alibaba.dubbo.common.URL
com.alibaba.dubbo.rpc.RpcException
```
#### 上下文API
```
com.alibaba.dubbo.rpc.RpcContext
```

详细参见：[上下文信息](../demos/上下文信息.md) & 对方地址 & [隐式传参](../demos/隐式传参.md) & [异步调用](../demos/异步调用.md)
#### 服务API
```
com.alibaba.dubbo.rpc.service.GenericService
com.alibaba.dubbo.rpc.service.GenericException
```
详细参见：[泛化引用](../demos/泛化引用.md) & [泛化实现](../demos/泛化实现.md)
```
com.alibaba.dubbo.rpc.service.EchoService
```
详细参见：[回声测试](../demos/回声测试.md)