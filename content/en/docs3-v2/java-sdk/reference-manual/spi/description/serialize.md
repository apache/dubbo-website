---
type: docs
title: "Serialization Extension"
linkTitle: "Serialization Extension"
weight: 16
---

## Expansion Description

Convert the object into a byte stream for network transmission, and convert the byte stream into an object for restoring the byte stream data into an object.

## Extension ports

* `org.apache.dubbo.common.serialize.Serialization`
* `org.apache.dubbo.common.serialize.ObjectInput`
* `org.apache.dubbo.common.serialize.ObjectOutput`

## Extended configuration

```xml
<!-- Protocol serialization method -->
<dubbo:protocol serialization="xxx" />
<!-- Default value setting, when <dubbo:protocol> does not configure serialization, use this configuration -->
<dubbo:provider serialization="xxx" />
```

## Known extensions

* `org.apache.dubbo.common.serialize.dubbo.DubboSerialization`
* `org.apache.dubbo.common.serialize.hessian.Hessian2Serialization`
* `org.apache.dubbo.common.serialize.java.JavaSerialization`
* `org.apache.dubbo.common.serialize.java.CompactedJavaSerialization`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxSerialization.java (implements the Serialization interface)
                |-XxxObjectInput.java (implement ObjectInput interface)
                |-XxxObjectOutput.java (implement ObjectOutput interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.serialize.Serialization (plain text file, content: xxx=com.xxx.XxxSerialization)
```

XxxSerialization.java:

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

META-INF/dubbo/org.apache.dubbo.common.serialize.Serialization:

```properties
xxx=com.xxx.XxxSerialization
```