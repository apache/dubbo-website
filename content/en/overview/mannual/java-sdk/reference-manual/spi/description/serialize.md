---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/serialize/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/serialize/
description: Serialization Extension
linkTitle: Serialization Extension
title: Serialization Extension
type: docs
weight: 16
---






## Extension Description

Convert objects into byte streams for network transmission, and convert byte streams into objects for restoring the received byte stream data back into objects.

## Extension Interfaces

* `org.apache.dubbo.common.serialize.Serialization`
* `org.apache.dubbo.common.serialize.ObjectInput`
* `org.apache.dubbo.common.serialize.ObjectOutput`

## Extension Configuration

```xml
<!-- Serialization method for the protocol -->
<dubbo:protocol serialization="xxx" />
<!-- Default value setting, when <dubbo:protocol> does not configure serialization, use this configuration -->
<dubbo:provider serialization="xxx" />
```

## Known Extensions

* `org.apache.dubbo.common.serialize.dubbo.DubboSerialization`
* `org.apache.dubbo.common.serialize.hessian.Hessian2Serialization`
* `org.apache.dubbo.common.serialize.java.JavaSerialization`
* `org.apache.dubbo.common.serialize.java.CompactedJavaSerialization`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxSerialization.java (implements Serialization interface)
                |-XxxObjectInput.java (implements ObjectInput interface)
                |-XxxObjectOutput.java (implements ObjectOutput interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.serialize.Serialization (plain text file, content: xxx=com.xxx.XxxSerialization)
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
