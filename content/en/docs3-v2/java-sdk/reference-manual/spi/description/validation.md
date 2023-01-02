---
type: docs
title: "Authentication Extension"
linkTitle: "Authentication Extension"
weight: 25
---

## Expansion Description

Parameter validation extension point.

## Extension ports

`org.apache.dubbo.validation.Validation`

## Extended configuration

```xml
<dubbo:service validation="xxx,yyy" />
<!-- The default value setting, when <dubbo:service> does not configure the authentication attribute, use this configuration -->
<dubbo:provider validation="xxx,yyy" />
```

## Known extensions

`org.apache.dubbo.validation.support.jvalidation.JValidation`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxValidation.java (implement Validation interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.validation.Validation (plain text file, content: xxx=com.xxx.XxxValidation)
```

XxxValidation.java:

```java
package com.xxx;
 
import org.apache.dubbo.validation.Validation;
 
public class XxxValidation implements Validation {
    public Object getValidator(URL url) {
        //...
    }
}
```

XxxValidator.java:

```java
package com.xxx;
 
import org.apache.dubbo.validation.Validator;
 
public class XxxValidator implements Validator {
    public XxxValidator(URL url) {
        //...
    }
    public void validate(Invocation invocation) throws Exception {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.validation.Validation:

```properties
xxx=com.xxx.XxxValidation
```