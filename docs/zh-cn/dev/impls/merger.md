# 合并结果扩展

## 扩展说明

合并返回结果，用于分组聚合。

## 扩展接口

`com.alibaba.dubbo.rpc.cluster.Merger`

## 扩展配置

```xml
<dubbo:method merger="xxx" />
```

## 已知扩展

* `com.alibaba.dubbo.rpc.cluster.merger.ArrayMerger`
* `com.alibaba.dubbo.rpc.cluster.merger.ListMerger`
* `com.alibaba.dubbo.rpc.cluster.merger.SetMerger`
* `com.alibaba.dubbo.rpc.cluster.merger.MapMerger`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxMerger.java (实现Merger接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.cluster.Merger (纯文本文件，内容为：xxx=com.xxx.XxxMerger)
```

XxxMerger.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.cluster.Merger;
 
public class XxxMerger<T> implements Merger<T> {
    public T merge(T... results) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.Merger：

```properties
xxx=com.xxx.XxxMerger
```

