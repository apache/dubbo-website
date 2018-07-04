# 动态代理扩展

## 扩展说明

将 `Invoker` 接口转换成业务接口。

## 扩展接口

`com.alibaba.dubbo.rpc.ProxyFactory`

## 扩展配置

```xml
<dubbo:protocol proxy="xxx" />
<!-- 缺省值配置，当<dubbo:protocol>没有配置proxy属性时，使用此配置 -->
<dubbo:provider proxy="xxx" />
```

## 已知扩展

* `com.alibaba.dubbo.rpc.proxy.JdkProxyFactory`
* `com.alibaba.dubbo.rpc.proxy.JavassistProxyFactory`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxProxyFactory.java (实现ProxyFactory接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.ProxyFactory (纯文本文件，内容为：xxx=com.xxx.XxxProxyFactory)
```

XxxProxyFactory.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.ProxyFactory;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.RpcException;
 
 
public class XxxProxyFactory implements ProxyFactory {
    public <T> T getProxy(Invoker<T> invoker) throws RpcException {
        // ...
    }
    public <T> Invoker<T> getInvoker(T proxy, Class<T> type, URL url) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.ProxyFactory：

```properties
xxx=com.xxx.XxxProxyFactory
```
