# Dubbo的泛化调用

以下几种场景可以考虑使用泛化调用：

- 服务测试平台
- API 服务网关

泛化调用主要用于消费端没有 API 接口的情况；不需要引入接口 jar 包，而是直接通过 GenericService 接口来发起服务调用，参数及返回值中的所有 POJO 均用 `Map` 表示。泛化调用对于服务端无需关注，按正常服务进行暴露即可。

下面来看看消费端如何使用泛化调用进行服务调用。

#### 通过 Spring XML 配置进行泛化调用

在 Spring 配置申明 `generic="true"`，如：

```xml
<dubbo:reference id="userService" interface="com.alibaba.dubbo.samples.generic.api.IUserService" generic="true"/>
```

需要使用的地方，通过强制类型转化为 GenericService 进行调用：

```java
GenericService userService = (GenericService) context.getBean("userService");
// primary param and return value
String name = (String) userService.$invoke("delete", new String[]{int.class.getName()}, new Object[]{1});
System.out.println(name);
```

其中：

1. GenericService 这个接口只有一个方法，名为 `$invoke`，它接受三个参数，分别为方法名、方法参数类型数组和参数值数组；
2. 对于方法参数类型数组
   1. 如果是基本类型，如 int 或 long，可以使用 `int.class.getName()`获取其类型；
   2. 如果是基本类型数组，如 int[]，则可以使用 `int[].class.getName()`；
   3. 如果是 POJO，则直接使用全类名，如 `com.alibaba.dubbo.samples.generic.api.Params`。

#### 通过 API 编程进行泛化调用

```
ApplicationConfig application = new ApplicationConfig()ApplicationConfig application = new ApplicationConfig();
application.setName("api-generic-consumer");

RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://127.0.0.1:2181");

application.setRegistry(registry);

ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
// 弱类型接口名
reference.setInterface("com.alibaba.dubbo.samples.generic.api.IUserService");
// 声明为泛化接口
reference.setGeneric(true);

reference.setApplication(application);

// 用com.alibaba.dubbo.rpc.service.GenericService可以替代所有接口引用
GenericService genericService = reference.get();

String name = (String) genericService.$invoke("delete", new String[]{int.class.getName()}, new Object[]{1});
System.out.println(name);
```

通过 API 的方式，不需要像 XML 的方式需要提前将服务配置好，可以动态构建 ReferenceConfig；相对 XML 来说，API 的方式更常见。

#### 参数或返回值是 POJO 的场景

比如方法签名是 `User get(Params params);`其中 User 有 id 和 name 两个属性，Params 有 query 一个属性。

以下是消费端的调用代码：

```java
String[] parameterTypes = new String[]{"com.alibaba.dubbo.samples.generic.api.Params"};
Map<String, Object> params = new HashMap<String, Object>();
param.put("class", "com.alibaba.dubbo.samples.generic.api.Params");
param.put("query", "a=b");
Object user = userService.$invoke("get", parameterTypes, new Object[]{param});
System.out.println("sample one result: " + user);
```

上述代码的输出结果为：

```shell
sample one result: {name=charles, id=1, class=com.alibaba.dubbo.samples.generic.api.User}
```

这里，Dubbo 框架会自动将 POJO 的返回值转换成 Map。可以看到，返回值 `user` 是一个 HashMap，里面分别存放了 name、id、class 三个 k/v。

#### 泛接口实现

泛接口实现方式主要用于服务端没有 API 接口的情况，参数及返回值中的所有 POJO 均用 Map 表示，通常用于框架集成，如实现一个通用的远程服务 Mock 框架，可通过实现 GenericService 接口处理所有服务请求。

##### 服务端实现 GenericService

```java
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

##### 服务端暴露服务

```java
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

同样，也可以使用 XML 配置的方式暴露服务；此时服务端是没有依赖 HiService 和 HelloService 这两个接口的。

##### 消费端进行服务调用

```java
ApplicationConfig application = new ApplicationConfig();
application.setName("api-generic-consumer");

RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://127.0.0.1:2181");

application.setRegistry(registry);

ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
// 弱类型接口名
reference.setInterface(HiService.class);
reference.setApplication(application);

HiService hiService = (HiService) reference.get();
System.out.println(hiService.hi("dubbo"));

ReferenceConfig<GenericService> reference2 = new ReferenceConfig<GenericService>();
// 弱类型接口名
reference2.setInterface(HelloService.class);
reference2.setApplication(application);

HelloService helloService = (HelloService) reference2.get();
System.out.println(helloService.hello("community"));
```

同样，消费端也可以使用 XML 配置的方式引用服务，然后进行调用。这里可以看到调用方式为普通的服务调用，并非泛化调用。当然使用泛化调用也是可以的。

到这里为止，一个简易的服务 Mock 平台就成功上线了！

#### 其他

* 本文介绍的泛化调用和泛接口实现，都是在原生的 `Dubbo` 协议之上的。在 2.6.2 版本之前，其他协议如 http/hessian 等是不支持泛化调用的，2.6.3 版本将会对这两个协议的泛化调用做支持。
* 本文中提到的相关示例代码可以在 dubbo-samples中找到：https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-generic