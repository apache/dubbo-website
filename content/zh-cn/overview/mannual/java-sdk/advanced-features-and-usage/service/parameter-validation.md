---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/parameter-validation/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/parameter-validation/
description: 在 Dubbo 中进行参数校验
linkTitle: 参数校验
title: 参数校验
type: docs
weight: 2
---





## 特性说明
参数验证功能是基于 [JSR303](https://jcp.org/en/jsr/detail?id=303) 实现的，用户只需标识 JSR303 标准的验证 annotation，并通过声明 filter 来实现验证。

####  Maven 依赖

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

## 使用场景

服务端在向外提供接口服务时，解决各种接口参数校验问题。

> 参考用例
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-validation](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-validation)

## 使用方式

### 参数标注示例

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
 
    @NotNull // 不允许为空
    @Size(min = 1, max = 20) // 长度或大小范围
    private String name;
 
    @NotNull(groups = ValidationService.Save.class) // 保存时不允许为空，更新时允许为空 ，表示不更新该字段
    @Pattern(regexp = "^\\s*\\w+(?:\\.{0,1}[\\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\\.[a-zA-Z]+\\s*$")
    private String email;
 
    @Min(18) // 最小值
    @Max(100) // 最大值
    private int age;
 
    @Past // 必须为一个过去的时间
    private Date loginDate;
 
    @Future // 必须为一个未来的时间
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

### 分组验证示例

```java
public interface ValidationService { // 缺省可按服务接口区分验证场景，如：@NotNull(groups = ValidationService.class)   
    @interface Save{} // 与方法同名接口，首字母大写，用于区分验证场景，如：@NotNull(groups = ValidationService.Save.class)，可选
    void save(ValidationParameter parameter);
    void update(ValidationParameter parameter);
}
```

### 关联验证示例

```java
import javax.validation.GroupSequence;
 
public interface ValidationService {   
    @GroupSequence(Update.class) // 同时验证Update组规则
    @interface Save{}
    void save(ValidationParameter parameter);
 
    @interface Update{} 
    void update(ValidationParameter parameter);
}
```

### 参数验证示例

```java
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
 
public interface ValidationService {
    void save(@NotNull ValidationParameter parameter); // 验证参数不为空
    void delete(@Min(1) int id); // 直接对基本类型参数验证
}
```

### 在客户端验证参数

```xml
<dubbo:reference id="validationService" interface="org.apache.dubbo.examples.validation.api.ValidationService" validation="true" />
```

### 在服务器端验证参数

```xml
<dubbo:service interface="org.apache.dubbo.examples.validation.api.ValidationService" ref="validationService" validation="true" />
```

> **Dubbo 默认支持 hibernate-validator 版本 <=6.x，若使用 hibernate-validator 7.x 版本，请将 validation 参数声明为 jvalidationNew**

> 如果需要启动客户端验证,并且使用jdk17,择需添加jvm启动参数`--add-opens java.base/java.lang=ALL-UNNAMED`做兼容处理.

### 验证异常信息

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
        } catch (RpcException e) { // 抛出的是RpcException
            ConstraintViolationException ve = (ConstraintViolationException) e.getCause(); // 里面嵌了一个ConstraintViolationException
            Set<ConstraintViolation<?>> violations = ve.getConstraintViolations(); // 可以拿到一个验证错误详细信息的集合
            System.out.println(violations);
        }
    } 
}
```

> **验证方式可扩展，扩展方式参见开发者手册中的 [验证扩展](../../../reference-manual/spi/description/validation)**
