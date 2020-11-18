---
type: docs
title: "Serialization Extension"
linkTitle: "Serialization"
weight: 16
---

## Summary

Extension to serializing java object into byte code stream for transporting on the network, and vise versa.

## Extension Interface

* `org.apache.dubbo.common.serialize.Serialization`
* `org.apache.dubbo.common.serialize.ObjectInput`
* `org.apache.dubbo.common.serialize.ObjectOutput`

## Extension Configuration

```xml
<!-- protocol serialization style -->
<dubbo:protocol serialization="xxx" />
<!-- default configuration, will take effect if serialization is not configured in <dubbo:protocol> -->
<dubbo:provider serialization="xxx" />
```

## Existing Extension

* `org.apache.dubbo.common.serialize.dubbo.DubboSerialization`
* `org.apache.dubbo.common.serialize.hessian.Hessian2Serialization`
* `org.apache.dubbo.common.serialize.java.JavaSerialization`
* `org.apache.dubbo.common.serialize.java.CompactedJavaSerialization`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxSerialization.java (Serialization implementation)
                |-XxxObjectInput.java (ObjectInput implementation)
                |-XxxObjectOutput.java (ObjectOutput implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.serialize.Serialization (plain text file with the content: xxx=com.xxx.XxxSerialization)
```

XxxSerialization.java：

```java
package com.xxx;
 
import org.apache.dubbo.common.serialize.Serialization;
import org.apache.dubbo.common.serialize.ObjectInput;
import org.apache.dubbo.common.serialize.ObjectOutput;
 
 
public class XxxSerialization implements Serialization {
    public ObjectOutput serialize(Parameters parameters, OutputStream output) throws IOException {
        return new XxxObjectOutput(output);
    }
    public ObjectInput deserialize(Parameters parameters, InputStream input) throws IOException {
        return new XxxObjectInput(input);
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.serialize.Serialization：

```properties
xxx=com.xxx.XxxSerialization
```
