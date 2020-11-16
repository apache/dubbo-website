---
type: docs
title: "合并结果扩展"
linkTitle: "合并结果扩展"
weight: 8
---

## 扩展说明

合并返回结果，用于分组聚合。

## 扩展接口

`org.apache.dubbo.rpc.cluster.Merger`

## 扩展配置

```xml
<dubbo:method merger="xxx" />
```

## 已知扩展

* `org.apache.dubbo.rpc.cluster.merger.ArrayMerger`
* `org.apache.dubbo.rpc.cluster.merger.ListMerger`
* `org.apache.dubbo.rpc.cluster.merger.SetMerger`
* `org.apache.dubbo.rpc.cluster.merger.MapMerger`

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
                |-org.apache.dubbo.rpc.cluster.Merger (纯文本文件，内容为：xxx=com.xxx.XxxMerger)
```

XxxMerger.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.cluster.Merger;
 
public class XxxMerger<T> implements Merger<T> {
    public T merge(T... results) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.Merger：

```properties
xxx=com.xxx.XxxMerger
```

