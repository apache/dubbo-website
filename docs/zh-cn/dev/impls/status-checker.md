# 状态检查扩展

## 扩展说明

检查服务依赖各种资源的状态，此状态检查可同时用于 telnet 的 status 命令和 hosting 的 status 页面。

## 扩展接口

`com.alibaba.dubbo.common.status.StatusChecker`

## 扩展配置

```xml
<dubbo:protocol status="xxx,yyy" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置status属性时，使用此配置 -->
<dubbo:provider status="xxx,yyy" />
```

## 已知扩展

* `com.alibaba.dubbo.common.status.support.MemoryStatusChecker`
* `com.alibaba.dubbo.common.status.support.LoadStatusChecker`
* `com.alibaba.dubbo.rpc.dubbo.status.ServerStatusChecker`
* `com.alibaba.dubbo.rpc.dubbo.status.ThreadPoolStatusChecker`
* `com.alibaba.dubbo.registry.directory.RegistryStatusChecker`
* `com.alibaba.dubbo.rpc.config.spring.status.SpringStatusChecker`
* `com.alibaba.dubbo.rpc.config.spring.status.DataSourceStatusChecker`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxStatusChecker.java (实现StatusChecker接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.common.status.StatusChecker (纯文本文件，内容为：xxx=com.xxx.XxxStatusChecker)
```

XxxStatusChecker.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.common.status.StatusChecker;
 
public class XxxStatusChecker implements StatusChecker {
    public Status check() {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.common.status.StatusChecker：

```properties
xxx=com.xxx.XxxStatusChecker
```
