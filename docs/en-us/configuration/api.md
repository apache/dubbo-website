# API Configuration

All API properties have counterparts in XML, see [XML References](../references/xml/introduction.md) for details. For example `ApplicationConfig.setName("xxx")` equals to  `<dubbo:application name="xxx" />` [^1]

## Provider Side

```java
import com.alibaba.dubbo.rpc.config.ApplicationConfig;
import com.alibaba.dubbo.rpc.config.RegistryConfig;
import com.alibaba.dubbo.rpc.config.ProviderConfig;
import com.alibaba.dubbo.rpc.config.ServiceConfig;
import com.xxx.XxxService;
import com.xxx.XxxServiceImpl;
 
// Implementation
XxxService xxxService = new XxxServiceImpl();
 
// Application Info
ApplicationConfig application = new ApplicationConfig();
application.setName("xxx");
 
// Registry Info
RegistryConfig registry = new RegistryConfig();
registry.setAddress("10.20.130.230:9090");
registry.setUsername("aaa");
registry.setPassword("bbb");
 
// Protocol
ProtocolConfig protocol = new ProtocolConfig();
protocol.setName("dubbo");
protocol.setPort(12345);
protocol.setThreads(200);
 
// NOTES: ServiceConfig holds the serversocket instance and keeps connections to registry, please cache it for performance.
 
// Exporting
ServiceConfig<XxxService> service = new ServiceConfig<XxxService>(); // In case of memory leak, please cache.
service.setApplication(application);
service.setRegistry(registry); // Use setRegistries() for multi-registry case
service.setProtocol(protocol); // Use setProtocols() for multi-protocol case
service.setInterface(XxxService.class);
service.setRef(xxxService);
service.setVersion("1.0.0");
 
// Local export and register
service.export();
```

## Consumer Side

```java
import com.alibaba.dubbo.rpc.config.ApplicationConfig;
import com.alibaba.dubbo.rpc.config.RegistryConfig;
import com.alibaba.dubbo.rpc.config.ConsumerConfig;
import com.alibaba.dubbo.rpc.config.ReferenceConfig;
import com.xxx.XxxService;
 
// Application Info
ApplicationConfig application = new ApplicationConfig();
application.setName("yyy");
 
// Registry Info
RegistryConfig registry = new RegistryConfig();
registry.setAddress("10.20.130.230:9090");
registry.setUsername("aaa");
registry.setPassword("bbb");
 
// NOTES: ReferenceConfig holds the connections to registry and providers, please cache it for performance.
 
// Refer remote service
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>(); // In case of memory leak, please cache.
reference.setApplication(application);
reference.setRegistry(registry); 
reference.setInterface(XxxService.class);
reference.setVersion("1.0.0");
 
// Use xxxService just like a local bean
XxxService xxxService = reference.get(); // NOTES: Please cache this proxy instance.
```

## Specials

Only care about the differences:

### Configuration of Method level

```java
...
 
// Method level config
List<MethodConfig> methods = new ArrayList<MethodConfig>();
MethodConfig method = new MethodConfig();
method.setName("createXxx");
method.setTimeout(10000);
method.setRetries(0);
methods.add(method);
 
// Referring
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>();
...
reference.setMethods(methods); 
 
...
```

### Peer to Peer

```java

...
 
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>(); 
// If you know the address of the provider and want to bypass the registry, use `reference.setUrl()` to specify the provider directly. Refer [How to Invoke a specific provider](../demos/explicit-target.md) for details.
reference.setUrl("dubbo://10.20.130.230:20880/com.xxx.XxxService"); 
 
...
```

[^1]: When should we usd API: API is very useful for integrating with systems like OpenAPI, ESB, Test, Mock, etc. General Providers and Consumers, we still recommend use [XML Configuration](../configuration/xml.md).
