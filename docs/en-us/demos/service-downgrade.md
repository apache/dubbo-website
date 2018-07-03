# Service-Downgrade

You can temporarilly shield a non-critical service through the service downgrade and define the return policy for it.


Publish dynamic configuration rule to the registry:

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("override://0.0.0.0/com.foo.BarService?category=configurators&dynamic=false&application=foo&mock=force:return+null"));
```

* The configuration `mock=force:return+null` means that all calls of this service will return null value directly,without making remote calls.Usually used to reduce the effect of some slow non-critical services.

* Also you can change that configuration to `mock=fail:return+null`.Then you will get null value after a failed call.Consumer will try to make a remote call to get the truely result if succeed,and if the call failed you will get null value.Usually used to tolerate some non-critical services.


[^1]: supported after version `2.2.0` 
