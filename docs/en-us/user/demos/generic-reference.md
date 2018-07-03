# Generic Reference

Generic invocation is mainly used when the client does not have API interface or model class,  all POJOs in parameters and return values are represented by `Map`.Commonly used for framework integration such as: implementing a common service testing framework, all service implementations can be invoked via `GenericService`.

## Use generic invocation via Spring

Declared in the Spring configuration file `generic =" true "`：

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" generic="true" />
```

In Java code, get `barService` and start generic invocation:

```java
GenericService barService = (GenericService) applicationContext.getBean("barService");
Object result = barService.$invoke("sayHello", new String[] { "java.lang.String" }, new Object[] { "World" });
```

## Use generic invocation via API

```java
import com.alibaba.dubbo.rpc.service.GenericService;
...

// reference remote service
// The instance is very heavy, which encapsulates all the registration center and service provider connection, please cache
ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
// weak type service interface name
reference.setInterface("com.xxx.XxxService");  
reference.setVersion("1.0.0");
// declared as generic service
reference.setGeneric(true);  

// service stub type is also the com.alibaba.dubbo.rpc.service.GenericService
GenericService genericService = reference.get();

// basic types and Date, List, Map, etc. do not need conversion, direct use them
Object result = genericService.$invoke("sayHello", new String[] {"java.lang.String"}, new Object[] {"world"});

// map POJO parameters, if the return value is POJO will automatically turn into map
Map<String, Object> person = new HashMap<String, Object>();
person.put("name", "xxx");
person.put("password", "yyy");
// if the return value is POJO will automatically turn into map
Object result = genericService.$invoke("findPerson", new String[]
{"com.xxx.Person"}, new Object[]{person});

...
```

## Further explanation of generalized types

Consider POJO like this：

```java
package com.xxx;

public class PersonImpl implements Person {
    private String name;
    private String password;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

The POJO data：

```java
Person person = new PersonImpl();
person.setName("xxx");
person.setPassword("yyy");
```

Data represented by `Map`：

```java
Map<String, Object> map = new HashMap<String, Object>();
// Note: If the parameter type is an interface, or List lost the generic class, you can specify the type of the class attribute
map.put("class", "com.xxx.PersonImpl");
map.put("name", "xxx");
map.put("password", "yyy");
```
