---
type: docs
title: "Parameter Validation"
linkTitle: "Parameter verification"
weight: 2
description: "Parameter verification in dubbo3"
---
## Feature description
The parameter verification function is implemented based on [JSR303](https://jcp.org/en/jsr/detail?id=303), users only need to identify the verification annotation of the JSR303 standard, and realize the verification by declaring the filter.

#### Maven dependencies

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

## scenes to be used

When the server provides interface services to the outside, it solves various interface parameter verification problems.

## Reference use case

[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-validation](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-validation)

## How to use

### Parameter annotation example

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
 
    @NotNull // not allowed to be null
    @Size(min = 1, max = 20) // length or size range
    private String name;
 
    @NotNull(groups = ValidationService.Save.class) // It is not allowed to be empty when saving, and it is allowed to be empty when updating, indicating that the field will not be updated
    @Pattern(regexp = "^\\s*\\w+(?:\\.{0,1}[\\w-]+)*@[a-zA-Z0-9]+(?:[- .][a-zA-Z0-9]+)*\\.[a-zA-Z]+\\s*$")
    private String email;
 
    @Min(18) // minimum value
    @Max(100) // maximum value
    private int age;
 
    @Past // must be a past time
    private Date loginDate;
 
    @Future // must be a future time
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
        this. age = age;
    }
 
    public Date getLoginDate() {
        return loginDate;
    }
 
    public void setLoginDate(Date loginDate) {
        this. loginDate = loginDate;
    }
 
    public Date getExpiryDate() {
        return expiryDate;
    }
 
    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }
}
```

### Group verification example

```java
public interface ValidationService { // By default, validation scenarios can be distinguished by service interface, such as: @NotNull(groups = ValidationService.class)
    @interface Save{} // The interface with the same name as the method, the first letter is capitalized, used to distinguish validation scenarios, such as: @NotNull(groups = ValidationService.Save.class), optional
    void save(ValidationParameter parameter);
    void update(ValidationParameter parameter);
}
```

### Association Validation Example

```java
import javax.validation.GroupSequence;
 
public interface ValidationService {
    @GroupSequence(Update.class) // Verify Update group rules at the same time
    @interface Save{}
    void save(ValidationParameter parameter);
 
    @interface Update{}
    void update(ValidationParameter parameter);
}
```

### Parameter validation example

```java
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
 
public interface ValidationService {
    void save(@NotNull ValidationParameter parameter); // validation parameter is not empty
    void delete(@Min(1) int id); // directly verify the basic type parameters
}
```

### Validate parameters on the client side

```xml
<dubbo:reference id="validationService" interface="org.apache.dubbo.examples.validation.api.ValidationService" validation="true" />
```

### Validate parameters on the server side

```xml
<dubbo:service interface="org.apache.dubbo.examples.validation.api.ValidationService" ref="validationService" validation="true" />
```

> **Dubbo supports hibernate-validator version <=6.x by default, if you use hibernate-validator 7.x version, please declare the validation parameter as jvalidatorNew**

### Verify exception information

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
        context. start();
        ValidationService validationService = (ValidationService)context.getBean("validationService");
        // Error
        try {
            parameter = new ValidationParameter();
            validationService. save(parameter);
            System.out.println("Validation ERROR");
        } catch (RpcException e) { // What is thrown is RpcException
            ConstraintViolationException ve = (ConstraintViolationException) e.getCause(); // A ConstraintViolationException is embedded in it
            Set<ConstraintViolation<?>> violations = ve.getConstraintViolations(); // You can get a collection of verification error details
            System.out.println(violations);
        }
    }
}
```

> **The validation method can be extended, see [Validation Extension](../../../reference-manual/spi/description/validation) in the developer manual for the extension method**