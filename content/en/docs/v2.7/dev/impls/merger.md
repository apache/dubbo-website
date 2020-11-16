---
type: docs
title: "Merger Extension"
linkTitle: "Merger"
weight: 8
---

## Summary

Merge strategy for return result aggregation in group.

## Extension Interface

`org.apache.dubbo.rpc.cluster.Merger`

## Extension Configuration

```xml
<dubbo:method merger="xxx" />
```

## Existing Extension

* `org.apache.dubbo.rpc.cluster.merger.ArrayMerger`
* `org.apache.dubbo.rpc.cluster.merger.ListMerger`
* `org.apache.dubbo.rpc.cluster.merger.SetMerger`
* `org.apache.dubbo.rpc.cluster.merger.MapMerger`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxMerger.java (Merger implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.Merger (plain text file with the content: xxx=com.xxx.XxxMerger)
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

