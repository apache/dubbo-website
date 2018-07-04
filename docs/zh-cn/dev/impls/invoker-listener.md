# 引用监听扩展

## 扩展说明

当有服务引用时，触发该事件。

## 扩展接口

`com.alibaba.dubbo.rpc.InvokerListener`

## 扩展配置

```xml
<!-- 引用服务监听 -->
<dubbo:reference listener="xxx,yyy" /> 
<!-- 引用服务缺省监听器 -->
<dubbo:consumer listener="xxx,yyy" /> 
```

## 已知扩展

`com.alibaba.dubbo.rpc.listener.DeprecatedInvokerListener`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxInvokerListener.java (实现InvokerListener接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.InvokerListener (纯文本文件，内容为：xxx=com.xxx.XxxInvokerListener)
```

XxxInvokerListener.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.InvokerListener;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.RpcException;
 
public class XxxInvokerListener implements InvokerListener {
    public void referred(Invoker<?> invoker) throws RpcException {
        // ...
    }
    public void destroyed(Invoker<?> invoker) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.InvokerListener：

```properties
xxx=com.xxx.XxxInvokerListener
```
