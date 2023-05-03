---
aliases:
    - /zh/docs/references/spis/serialize/
description: 序列化扩展
linkTitle: 序列化扩展
title: 序列化扩展
type: docs
weight: 16
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/serialize/)。
{{% /pageinfo %}}

## 扩展说明

将对象转成字节流，用于网络传输，以及将字节流转为对象，用于在收到字节流数据后还原成对象。

## 扩展接口

* `org.apache.dubbo.common.serialize.Serialization`
* `org.apache.dubbo.common.serialize.ObjectInput`
* `org.apache.dubbo.common.serialize.ObjectOutput`

## 扩展配置

```xml
<!-- 协议的序列化方式 -->
<dubbo:protocol serialization="xxx" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置serialization时，使用此配置 -->
<dubbo:provider serialization="xxx" />
```

## 已知扩展

* `org.apache.dubbo.common.serialize.dubbo.DubboSerialization`
* `org.apache.dubbo.common.serialize.hessian.Hessian2Serialization`
* `org.apache.dubbo.common.serialize.java.JavaSerialization`
* `org.apache.dubbo.common.serialize.java.CompactedJavaSerialization`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxSerialization.java (实现Serialization接口)
                |-XxxObjectInput.java (实现ObjectInput接口)
                |-XxxObjectOutput.java (实现ObjectOutput接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.serialize.Serialization (纯文本文件，内容为：xxx=com.xxx.XxxSerialization)
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
