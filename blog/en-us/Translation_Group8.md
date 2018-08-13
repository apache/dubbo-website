# Generic Calls of Dubbo
The Generic call could be considered to be used in the following cases:
- Service test platform
- API service gateway

The generic call is mainly used when the consumer does not have an API interface; 
instead of introducing the interface jar package, the service call is initiated directly through the GenericService interface, and all POJOs in the parameters and return values are represented by a `Map`. 
Generic calls do not require attention on the server, and can be exposed as normal services.

Next, let's take a look at how the consumer uses generic calls for service calls.

### Generic calls through Spring XML configuration

Declare `generic="true"` in Spring configuration, such as

```
"userService" interface="com.alibaba.dubbo.samples.generic.api.IUserService" generic="true"/>
```

Where you need to use it, you can call it by forcing a type conversion to GenericService.

```
GenericService userService = (GenericService) context.getBean("userService");
// primary param and return value
String name = (String) userService.$invoke("delete", new String[]{int.class.getName()}, new Object[]{1});
System.out.println(name);
```

Among them,

1. The interface GenericService has only one method, named $invoke, which takes three arguments, a method name, an array of method parameter types, and an array of parameter values.

2. For array of method parameter types

   i.	If it is a basic type, such as int or long, use `int.class.getName()` to get its type;
   
   ii. If it is a basic type array, such as int[], use `int[].class.getName()`;
   
   iii.	If it is a POJO, use the full class name directly, such as `com.alibaba.dubbo.samples.generic.api.Params`.

### Generic calls through API programming

```
ApplicationConfig application = new ApplicationConfig()ApplicationConfig application = new ApplicationConfig();
application.setName("api-generic-consumer");

RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://127.0.0.1:2181");

application.setRegistry(registry);

ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
// weak type interface name
reference.setInterface("com.alibaba.dubbo.samples.generic.api.IUserService");
// declared as a generalized interface
reference.setGeneric(true);

reference.setApplication(application);

// replace all interface references with com.alibaba.dubbo.rpc.service.GenericService
GenericService genericService = reference.get();

String name = (String) genericService.$invoke("delete", new String[]{int.class.getName()}, new Object[]{1});
System.out.println(name);
```

Through the API, you don't need to configure the service in advance like XML. You can dynamically construct ReferenceConfig; the API is more common than XML.

### The scence where parameters or return values are POJOs

For example, the method signature is `User get(Params params)`, where `User` has two attributes, id and name, and `Params` has one attribute, query.

The following is the calling code of the consumer:

```
String[] parameterTypes = new String[]{"com.alibaba.dubbo.samples.generic.api.Params"};
Map<String, Object> params = new HashMap<String, Object>();
param.put("class", "com.alibaba.dubbo.samples.generic.api.Params");
param.put("query", "a=b");
Object user = userService.$invoke("get", parameterTypes, new Object[]{param});
System.out.println("sample one result: " + user);
```

The output of the above code is:

```
sample one result: {name=charles, id=1, class=com.alibaba.dubbo.samples.generic.api.User}
```

Here, the Dubbo framework will automatically convert the return value from POJO to Map.
It can be seen that the return value `user` is a HashMap, which stores three k/vs, name, id, and class.

### Generic interface implementation

The implementation of the generic interface is mainly used when the server does not have an API interface. All POJOs in the parameters and return values are represented by Map, which is usually used for framework integration. For example, to implement a generic remote service Mock framework, all service requests can be handled by implementing the GenericService interface.

#### Implementation GenericService on the server

```
public class GenericServiceImpl implements GenericService {
    @Override
    public Object $invoke(String method, String[] parameterTypes, Object[] args) throws GenericException {
        if (method.equals("hi")) {
            return "hi, " + args[0];
        } else if (method.equals("hello")) {
            return "hello, " + args[0];
        }

        return "welcome";
    }
}
```

#### Server exposed service

```
ApplicationConfig application = new ApplicationConfig();
application.setName("api-generic-provider");

RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://127.0.0.1:2181");

application.setRegistry(registry);

GenericService genericService = new GenericServiceImpl();

ServiceConfig<GenericService> service = new ServiceConfig<GenericService>();
service.setApplication(application);
service.setInterface("com.alibaba.dubbo.samples.generic.api.HelloService");
service.setRef(genericService);
service.export();

ServiceConfig<GenericService> service2 = new ServiceConfig<GenericService>();
service2.setApplication(application);
service2.setInterface("com.alibaba.dubbo.samples.generic.api.HiService");
service2.setRef(genericService);
service2.export();
```

Similarly, you can expose the service using XML configuration; in this case, the server does not depend on the two interfaces HiService and HelloService.

#### Service call on the consumer

```
ApplicationConfig application = new ApplicationConfig();
application.setName("api-generic-consumer");

RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://127.0.0.1:2181");

application.setRegistry(registry);

ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
// weak type interface name
reference.setInterface(HiService.class);
reference.setApplication(application);

HiService hiService = (HiService) reference.get();
System.out.println(hiService.hi("dubbo"));

ReferenceConfig<GenericService> reference2 = new ReferenceConfig<GenericService>();
// weak type interface name
reference2.setInterface(HelloService.class);
reference2.setApplication(application);

HelloService helloService = (HelloService) reference2.get();
System.out.println(helloService.hello("community"));
```

Similarly, the consumer can also reference the service using an XML configuration and then make the call. Here you can see that the calling method is a normal service call, not a generic call. Of course, it is also possible to use generic calls.

So far, a simple service Mock platform has been successfully launched!


### Others
-	The generic calls and generic interface implementations introduced in this article are all based on the native Dubbo protocol. Prior to version 2.6.2, other protocols such as http/hessian don't support generic calls. Version 2.6.3 will support the generic call of these two protocols.
-	The relevant sample codes mentioned in this article can be found in dubbo-samples: https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-generic

