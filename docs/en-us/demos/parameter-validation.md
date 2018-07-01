# Parameter Validation

The parameter validation [^1] is based on [JSR303] (https://jcp.org/en/jsr/detail?id=303). The user simply add the validation annotation of the JSR303 and declares the filter for validation [^2].

## Maven Dependency

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

## Sample

### Example of Parameter Annotation

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
 
    @NotNull // Required 
    @Size(min = 1, max = 20) // range
    private String name;
 
    @NotNull(groups = ValidationService.Save.class) // It is not allowed to be blank when saving. When it is updated, it is allowed to be blank, indicating that the field is not updated 
    @Pattern(regexp = "^\\s*\\w+(?:\\.{0,1}[\\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\\.[a-zA-Z]+\\s*$")
    private String email;
 
    @Min(18) // min value
    @Max(100) // max value
    private int age;
 
    @Past // Must be a past time
    private Date loginDate;
 
    @Future // Must be a future time
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

### Example of group validation

```java
public interface ValidationService { // By default, service interfaces are used to differentiate authentication scenarios. For example：@NotNull(groups = ValidationService.class)   
    @interface Save{} // The same name as the method interface, the first letter capitalized, used to distinguish between authentication scene. For example：@NotNull(groups = ValidationService.Save.class)，option
    void save(ValidationParameter parameter);
    void update(ValidationParameter parameter);
}
```

### Example of Cascading Validation

```java
import javax.validation.GroupSequence;
 
public interface ValidationService {   
    @GroupSequence(Update.class) // validate the Update group rules at the same time
    @interface Save{}
    void save(ValidationParameter parameter);
 
    @interface Update{} 
    void update(ValidationParameter parameter);
}
```

### Example of parameter validation

```java
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
 
public interface ValidationService {
    void save(@NotNull ValidationParameter parameter); // Param must not be null
    void delete(@Min(1) int id); // validate the range
}
```

## Configuration

### Validate Parameter on the client

```xml
<dubbo:reference id="validationService" interface="com.alibaba.dubbo.examples.validation.api.ValidationService" validation="true" />
```

### Validate Parameter on the server

```xml
<dubbo:service interface="com.alibaba.dubbo.examples.validation.api.ValidationService" ref="validationService" validation="true" />
```

## Validate Exception 

```java
import javax.validation.ConstraintViolationException;
import javax.validation.ConstraintViolationException;
 
import org.springframework.context.support.ClassPathXmlApplicationContext;
 
import com.alibaba.dubbo.examples.validation.api.ValidationParameter;
import com.alibaba.dubbo.examples.validation.api.ValidationService;
import com.alibaba.dubbo.rpc.RpcException;
 
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
        } catch (RpcException e) { // throw RpcException
            ConstraintViolationException ve = (ConstraintViolationException) e.getCause(); // Inside a ConstraintViolationException
            Set<ConstraintViolation<?>> violations = ve.getConstraintViolations(); // You can get the collection of validation error details
            System.out.println(violations);
        }
    } 
}
```

[^1]: Support since `2.1.0` version. If you want to know how to use it, refer to  [Sample code in dubbo project] (https://github.com/apache/incubator-dubbo/tree/master/dubbo-test/dubbo-test-examples/src/main/java/com/alibaba/dubbo/examples/validation)
[^2]: The validation method is extensible, refer to [Developer Extension](https://github.com/apache/incubator-dubbo/tree/master/dubbo-test/dubbo-test-examples/src/main/java/com/alibaba/dubbo/examples/validation) in the developer's manual.
