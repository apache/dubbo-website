# 序列化扩展

## 扩展说明

将对象转成字节流，用于网络传输，以及将字节流转为对象，用于在收到字节流数据后还原成对象。

## 扩展接口

* `com.alibaba.dubbo.common.serialize.Serialization`
* `com.alibaba.dubbo.common.serialize.ObjectInput`
* `com.alibaba.dubbo.common.serialize.ObjectOutput`

## 扩展配置

```xml
<!-- 协议的序列化方式 -->
<dubbo:protocol serialization="xxx" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置serialization时，使用此配置 -->
<dubbo:provider serialization="xxx" />
```

## 已知扩展

* `com.alibaba.dubbo.common.serialize.dubbo.DubboSerialization`
* `com.alibaba.dubbo.common.serialize.hessian.Hessian2Serialization`
* `com.alibaba.dubbo.common.serialize.java.JavaSerialization`
* `com.alibaba.dubbo.common.serialize.java.CompactedJavaSerialization`

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
                |-com.alibaba.dubbo.common.serialize.Serialization (纯文本文件，内容为：xxx=com.xxx.XxxSerialization)
```

XxxSerialization.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.common.serialize.Serialization;
import com.alibaba.dubbo.common.serialize.ObjectInput;
import com.alibaba.dubbo.common.serialize.ObjectOutput;
 
 
public class XxxSerialization implements Serialization {
    public ObjectOutput serialize(Parameters parameters, OutputStream output) throws IOException {
        return new XxxObjectOutput(output);
    }
    public ObjectInput deserialize(Parameters parameters, InputStream input) throws IOException {
        return new XxxObjectInput(input);
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.common.serialize.Serialization：

```properties
xxx=com.xxx.XxxSerialization
```
