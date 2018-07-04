# 扩展点加载扩展

## 扩展说明

扩展点本身的加载容器，可从不同容器加载扩展点。

## 扩展接口

`com.alibaba.dubbo.common.extension.ExtensionFactory`

## 扩展配置

```xml
<dubbo:application compiler="jdk" />
```

## 已知扩展

* `com.alibaba.dubbo.common.extension.factory.SpiExtensionFactory`
* `com.alibaba.dubbo.config.spring.extension.SpringExtensionFactory`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExtensionFactory.java (实现ExtensionFactory接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.common.extension.ExtensionFactory (纯文本文件，内容为：xxx=com.xxx.XxxExtensionFactory)
```

XxxExtensionFactory.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.common.extension.ExtensionFactory;
 
public class XxxExtensionFactory implements ExtensionFactory {
    public Object getExtension(Class<?> type, String name) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.common.extension.ExtensionFactory：

```properties
xxx=com.xxx.XxxExtensionFactory
```
