---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/parameter-validation/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/parameter-validation/
    - /en/overview/manual/java-sdk/advanced-features-and-usage/service/parameter-validation/
description: Parameter validation in Dubbo
linkTitle: Parameter Validation
title: Parameter Validation
type: docs
weight: 100
---

## Feature Description
The parameter validation feature is implemented based on [JSR303](https://jcp.org/en/jsr/detail?id=303). Users only need to specify validation annotations from the JSR303 standard and implement validation through a declared filter.

#### Maven Dependency

```xml
<dependency>
    <groupId>javax.validation</groupId>
    <artifactId>validation-api</artifactId>
    <version>1.0.0.GA</version>
</dependency>
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>4.2.0.Final</version>
</dependency>
```

## Usage Scenario

The server addresses various interface parameter validation issues when providing interface services externally.

> Reference Case
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-validation](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-validation)

## Usage Method

### Parameter Annotation Example

```java
import java.io.Serializable;
import java.util.Date;
 
import javax.validation.constraints.Future;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Past;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
 
public class ValidationParameter implements Serializable {
    private static final long serialVersionUID = 7158911668568000392L;
 
    @NotNull // Cannot be null
    @Size(min = 1, max = 20) // Length or size range
    private String name;
 
    @NotNull(groups = ValidationService.Save.class) // Cannot be null when saving, can be null when updating, indicating no update to this field
    @Pattern(regexp = "^\\s*\\w+(?:\\.{0,1}[\\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\\.[a-zA-Z]+\\s*$")
    private String email;
 
    @Min(18) // Minimum value
    @Max(100) // Maximum value
    private int age;
 
    @Past // Must be a past date
    private Date loginDate;
 
    @Future // Must be a future date
    private Date expiryDate;
 
    public String getName() {
        return name;
    }
 
    public void setName(String name) {
        this.name = name;
    }
 
    public String getEmail() {
        return email;
    }
 
    public void setEmail(String email) {
        this.email = email;
    }
 
    public int getAge() {
        return age;
    }
 
    public void setAge(int age) {
        this.age = age;
    }
 
    public Date getLoginDate() {
        return loginDate;
    }
 
    public void setLoginDate(Date loginDate) {
        this.loginDate = loginDate;
    }
 
    public Date getExpiryDate() {
        return expiryDate;
    }
 
    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }
}
```

### Group Validation Example

```java
public interface ValidationService { // Default can differentiate validation scenarios by service interface, e.g., @NotNull(groups = ValidationService.class)   
    @interface Save{} // Interface name same as method, capitalized first letter, used to differentiate validation scenarios, e.g., @NotNull(groups = ValidationService.Save.class), optional
    void save(ValidationParameter parameter);
    void update(ValidationParameter parameter);
}
```

### Related Validation Example

```java
import javax.validation.GroupSequence;
 
public interface ValidationService {   
    @GroupSequence(Update.class) // Validate Update group rules simultaneously
    @interface Save{}
    void save(ValidationParameter parameter);
 
    @interface Update{} 
    void update(ValidationParameter parameter);
}
```

### Parameter Validation Example

```java
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
 
public interface ValidationService {
    void save(@NotNull ValidationParameter parameter); // Validate parameter is not null
    void delete(@Min(1) int id); // Directly validate basic type parameter
}
```

### Validate Parameters on Client

```xml
<dubbo:reference id="validationService" interface="org.apache.dubbo.examples.validation.api.ValidationService" validation="true" />
```

### Validate Parameters on Server

```xml
<dubbo:service interface="org.apache.dubbo.examples.validation.api.ValidationService" ref="validationService" validation="true" />
```

> **Dubbo supports hibernate-validator version <=6.x by default. If using hibernate-validator version 7.x, declare the validation parameter as jvalidationNew.**

### Validation Exception Information

```java
import javax.validation.ConstraintViolationException;
import javax.validation.ConstraintViolationException;
 
import org.springframework.context.support.ClassPathXmlApplicationContext;
 
import org.apache.dubbo.examples.validation.api.ValidationParameter;
import org.apache.dubbo.examples.validation.api.ValidationService;
import org.apache.dubbo.rpc.RpcException;
 
public class ValidationConsumer {   
    public static void main(String[] args) throws Exception {
        String config = ValidationConsumer.class.getPackage().getName().replace('.', '/') + "/validation-consumer.xml";
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(config);
        context.start();
        ValidationService validationService = (ValidationService)context.getBean("validationService");
        // Error
        try {
            parameter = new ValidationParameter();
            validationService.save(parameter);
            System.out.println("Validation ERROR");
        } catch (RpcException e) { // Throws RpcException
            ConstraintViolationException ve = (ConstraintViolationException) e.getCause(); // Inside is a nested ConstraintViolationException
            Set<ConstraintViolation<?>> violations = ve.getConstraintViolations(); // Can get a collection of detailed validation error information
            System.out.println(violations);
        }
    } 
}
```

> **Validation methods are extensible. See the developer manual for [validation extensions](/en/overview/manual/java-sdk/reference-manual/spi/description/validation) for more information.**

