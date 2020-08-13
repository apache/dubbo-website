# Configure rule

Write then dynamic configuration to the registry center,This feature is usually done by the monitoring center or the center's page.

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("override://0.0.0.0/com.foo.BarService?category=configurators&dynamic=false&application=foo&timeout=1000"));
```

In the config override url：
* `override://` Indicates that the data is overwritten,support `override` and  `absent`，can extends，**Required**.
* `0.0.0.0` Indicates that the configurations is valid for all IP addresses，If only want to overwritten specified ip data,you can replace that specified ip address.**Required**.
* `com.foo.BarService` Indicates that is valid for specified service,**Required**.
* `category=configurators` Indicates that the data is dynamic configuration,**Required**。
* `dynamic=false` Indicates that the data is persistent,When the registered party withdraws,the data is still stored in the registry **Required**。
* `enabled=true` override strategy is enable,can absent,if absent,then enable.
* `application=foo` Indicates that is valid for specified application,can absent,if absent,then valid for all application.
* `timeout=1000` Indicates that the value of the `timeout` parameter that satisfies the above conditions is overwritten by 1000,if want to override another parameters, add directly to the `override` URL parameter.

Example：

1. Disable service provider.(Usually used to temporarily kick off a provider machine, similar to the prohibition of consumer access, please use the routing rules)

    ```
    override://10.20.153.10/com.foo.BarService?category=configurators&dynamic=false&disbaled=true
    ```

2. Adjustment weight:(Usually used to capacity assessment,default is 100)

    ```
    override://10.20.153.10/com.foo.BarService?category=configurators&dynamic=false&weight=200
    ```

3. Adjustment load balance strategy.(default random)

    ```
    override://10.20.153.10/com.foo.BarService?category=configurators&dynamic=false&loadbalance=leastactive
    ```

4. Service downgrade:(Usually used to temporarily mask an error of non-critical services)

    ```
    override://0.0.0.0/com.foo.BarService?category=configurators&dynamic=false&application=foo&mock=force:return+null
    ```

**NOTE**: `2.2.0+` version supported.
