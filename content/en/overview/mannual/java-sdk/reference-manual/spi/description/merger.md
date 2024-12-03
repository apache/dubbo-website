---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/merger/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/merger/
description: Merger Result Extension
linkTitle: Merger Result Extension
title: Merger Result Extension
type: docs
weight: 8
---






## Extension Description

Merging return results, used for grouping aggregation.

## Extension Interface

`org.apache.dubbo.rpc.cluster.Merger`

## Extension Configuration

```xml
<dubbo:method merger="xxx" />
```

## Known Extensions

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

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxMerger.java (implements Merger interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.Merger (plain text file, content: xxx=com.xxx.XxxMerger)
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
