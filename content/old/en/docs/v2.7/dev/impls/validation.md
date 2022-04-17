---
type: docs
title: "Validation Extension"
linkTitle: "Validation"
weight: 25
---

## Summary

Extension for parameter validation.

## Extension Interface

`org.apache.dubbo.validation.Validation`

## Extension Configuration

```xml
<dubbo:service validation="xxx,yyy" />
<!-- default configuration, it will take effect when there's no validation attribute specified in <dubbo:service> -->
<dubbo:provider validation="xxx,yyy" />
```

## Existing Extension

`org.apache.dubbo.validation.support.jvalidation.JValidation`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxValidation.java (Validation implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.validation.Validation (plain text file with the content: xxx=com.xxx.XxxValidation)
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