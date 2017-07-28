> ![warning](../sources/images/check.gif)泛接口调用方式主要用于客户端没有API接口及模型类元的情况，参数及返回值中的所有POJO均用Map表示，通常用于框架集成，比如：实现一个通用的服务测试框架，可通过GenericService调用所有服务实现。

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" generic="true" />
```

```java
GenericService barService = (GenericService) applicationContext.getBean("barService");
Object result = barService.$invoke("sayHello", new String[] { "java.lang.String" }, new Object[] { "World" });
```

```java
import com.alibaba.dubbo.rpc.service.GenericService; 
... 
 
// 引用远程服务 
ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>(); // 该实例很重量，里面封装了所有与注册中心及服务提供方连接，请缓存
reference.setInterface("com.xxx.XxxService"); // 弱类型接口名 
reference.setVersion("1.0.0"); 
reference.setGeneric(true); // 声明为泛化接口 
 
GenericService genericService = reference.get(); // 用com.alibaba.dubbo.rpc.service.GenericService可以替代所有接口引用 
 
// 基本类型以及Date,List,Map等不需要转换，直接调用 
Object result = genericService.$invoke("sayHello", new String[] {"java.lang.String"}, new Object[] {"world"}); 
 
// 用Map表示POJO参数，如果返回值为POJO也将自动转成Map 
Map<String, Object> person = new HashMap<String, Object>(); 
person.put("name", "xxx"); 
person.put("password", "yyy"); 
Object result = genericService.$invoke("findPerson", new String[]{"com.xxx.Person"}, new Object[]{person}); // 如果返回POJO将自动转成Map 
 
...
```

假设存在POJO如：

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

则POJO数据：

```java
Person person = new PersonImpl(); 
person.setName("xxx"); 
person.setPassword("yyy");
```

可用下面Map表示：

```java
Map<String, Object> map = new HashMap<String, Object>(); 
map.put("class", "com.xxx.PersonImpl"); // 注意：如果参数类型是接口，或者List等丢失泛型，可通过class属性指定类型。
map.put("name", "xxx"); 
map.put("password", "yyy");
```
