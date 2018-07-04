# 暴露监听扩展

## 扩展说明

当有服务暴露时，触发该事件。

## 扩展接口

`com.alibaba.dubbo.rpc.ExporterListener`

## 扩展配置

```xml
<!-- 暴露服务监听 -->
<dubbo:service listener="xxx,yyy" />
<!-- 暴露服务缺省监听器 -->
<dubbo:provider listener="xxx,yyy" />
```

## 已知扩展

`com.alibaba.dubbo.registry.directory.RegistryExporterListener`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExporterListener.java (实现ExporterListener接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.ExporterListener (纯文本文件，内容为：xxx=com.xxx.XxxExporterListener)
```

XxxExporterListener.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.ExporterListener;
import com.alibaba.dubbo.rpc.Exporter;
import com.alibaba.dubbo.rpc.RpcException;
 
 
public class XxxExporterListener implements ExporterListener {
    public void exported(Exporter<?> exporter) throws RpcException {
        // ...
    }
    public void unexported(Exporter<?> exporter) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.ExporterListener：

```properties
xxx=com.xxx.XxxExporterListener
```

