# 验证扩展

## 扩展说明

参数验证扩展点。

## 扩展接口

`com.alibaba.dubbo.validation.Validation`

## 扩展配置

```xml
<dubbo:service validation="xxx,yyy" />
<!-- 缺省值设置，当<dubbo:service>没有配置validation属性时，使用此配置 -->
<dubbo:provider validation="xxx,yyy" />
```

## 已知扩展

`com.alibaba.dubbo.validation.support.jvalidation.JValidation`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxValidation.java (实现Validation接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.validation.Validation (纯文本文件，内容为：xxx=com.xxx.XxxValidation)
```

XxxValidation.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.validation.Validation;
 
public class XxxValidation implements Validation {
    public Object getValidator(URL url) {
        // ...
    }
}
```

XxxValidator.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.validation.Validator;
 
public class XxxValidator implements Validator {
    public XxxValidator(URL url) {
        // ...
    }
    public void validate(Invocation invocation) throws Exception {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.validation.Validation：

```properties
xxx=com.xxx.XxxValidation
```