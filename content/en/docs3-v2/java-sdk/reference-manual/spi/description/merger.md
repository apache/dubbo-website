---
type: docs
title: "Merge result extension"
linkTitle: "Merge result extension"
weight: 8
---

## Expansion Description

Merge returns results for grouping and aggregation.

## Extension ports

`org.apache.dubbo.rpc.cluster.Merger`

## Extended configuration

```xml
<dubbo:method merger="xxx" />
```

## Known extensions

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

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxMerger.java (implement Merger interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.Merger (plain text file, content: xxx=com.xxx.XxxMerger)
```

XxxMerger.java:

```java
package com.xxx;
 
import org.apache.dubbo.rpc.cluster.Merger;
 
public class XxxMerger<T> implements Merger<T> {
    public T merge(T... results) {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.Merger:

```properties
xxx=com.xxx.XxxMerger
```