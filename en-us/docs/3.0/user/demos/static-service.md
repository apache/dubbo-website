# Static Service

* Sometimes we want to manually manage the registration and deregistration for service provider, we need to set registry to non-dynamoic mode. 

```xml
<dubbo:registry address="10.20.141.150:9090" dynamic="false" />
```

Or 

```xml
<dubbo:registry address="10.20.141.150:9090?dynamic=false" />
```


dynamic mode is disabled when service provider initially registers, then we need to enable it manually. When disconnects, the setting will not be deleted automatically, need to disable it manually.

For a third party service provider like “memcachd”, it can directly write the address information of service provider to registry, which can be used by consumer.

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("memcached://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo"));
```


[^1]: usually called by monitor system