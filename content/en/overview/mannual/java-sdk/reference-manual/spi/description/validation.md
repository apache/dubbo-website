---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/validation/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/validation/
description: Validation Extension
linkTitle: Validation Extension
title: Validation Extension
type: docs
weight: 25
---






## Extension Description

Parameter validation extension point.

## Extension Interface

`org.apache.dubbo.validation.Validation`

## Extension Configuration

```xml
<dubbo:service validation="xxx,yyy" />
<!-- Default value setting, when <dubbo:service> does not configure the validation attribute, use this configuration -->
<dubbo:provider validation="xxx,yyy" />
```

## Known Extensions

`org.apache.dubbo.validation.support.jvalidation.JValidation`

## Extension Examples

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxValidation.java (implements Validation interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.validation.Validation (plain text file, content: xxx=com.xxx.XxxValidation)
```

XxxValidation.java：

```java
package com.xxx;
 
import org.apache.dubbo.validation.Validation;
 
public class XxxValidation implements Validation {
    public Object getValidator(URL url) {
        // ...
    }
}
```

XxxValidator.java：

```java
package com.xxx;
 
import org.apache.dubbo.validation.Validator;
 
public class XxxValidator implements Validator {
    public XxxValidator(URL url) {
        // ...
    }
    public void validate(Invocation invocation) throws Exception {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.validation.Validation：

```properties
xxx=com.xxx.XxxValidation
```

