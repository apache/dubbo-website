# Merger Extension

## Summary

Merge strategy for return result aggregation in group.

## Extension Interface

`com.alibaba.dubbo.rpc.cluster.Merger`

## Extension Configuration

```xml
<dubbo:method merger="xxx" />
```

## Existing Extension

* `com.alibaba.dubbo.rpc.cluster.merger.ArrayMerger`
* `com.alibaba.dubbo.rpc.cluster.merger.ListMerger`
* `com.alibaba.dubbo.rpc.cluster.merger.SetMerger`
* `com.alibaba.dubbo.rpc.cluster.merger.MapMerger`

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
                |-com.alibaba.dubbo.rpc.cluster.Merger (plain text file with the content: xxx=com.xxx.XxxMerger)
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

