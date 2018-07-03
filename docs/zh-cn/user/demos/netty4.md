dubbo 2.5.6版本新增了对netty4通信模块的支持，启用方式如下

provider端：
```xml
<dubbo:protocol server="netty4" />
```

或

```xml
<dubbo:provider server="netty4" />
```

consumer端：
```xml
<dubbo:consumer client="netty4" />

```

> **注意**  
> 1. provider端如需不同的协议使用不同的通信层框架，请配置多个protocol分别设置
> 2. consumer端请使用如下形式：
> ```xml
> <dubbo:consumer client="netty">
>   <dubbo:reference />
> </dubbo:consumer>
> ```
> ```xml
> <dubbo:consumer client="netty4">
>   <dubbo:reference />
> </dubbo:consumer>
> ```

> 接下来我们会继续完善：
> 1. 性能测试指标及与netty3版本的性能测试对比，我们会提供一份参考数据  