---
type: docs
title: "合并结果扩展"
linkTitle: "合并结果扩展"
weight: 8
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/spi/description/merger/)。
{{% /pageinfo %}}

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
* `org.apache.dubbo.rpc.cluster.merger.ByteArrayMerger`
* `org.apache.dubbo.rpc.cluster.merger.CharArrayMerger`
* `org.apache.dubbo.rpc.cluster.merger.ShortArrayMerger`
* `org.apache.dubbo.rpc.cluster.merger.IntArrayMerger`
* `org.apache.dubbo.rpc.cluster.merger.LongArrayMerger`
* `org.apache.dubbo.rpc.cluster.merger.FloatArrayMerger`
* `org.apache.dubbo.rpc.cluster.merger.DoubleArrayMerger`
* `org.apache.dubbo.rpc.cluster.merger.BooleanArrayMerger`

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

