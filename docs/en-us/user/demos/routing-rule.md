# Routing Rules

The routing rules [^1] determine the target server of one service call. It has two kinds of routing rules: conditional routing rules and script routing rules. It also support extension[^2].

## Write Routing Rules

Writing routing rules to the registry is usually done by the monitoring center or the console page.

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("condition://0.0.0.0/com.foo.BarService?category=routers&dynamic=false&rule=" + URL.encode("host = 10.20.153.10 => host = 10.20.153.11") + "));
```

其中：

* `condition://` It indicates the type of routing rules, supports routing rules and script routing rules, and can be extended. **Required**。
* `0.0.0.0` It indicates that all IP addresses are valid. If you want to take effect for only one IP address, fill in the IP address. **Required**。
* `com.foo.BarService` It indicates that the specified service is effective. **Required**。
* `group=foo` It indicates that the specified service in specified group is effective. When absent, the specified service which dosen't configure group is effective.
* `version=1.0`It indicates that the specified service in specified version is effective. When absent, the specified service which dosen't configure version is effective.
* `category=routers` It indicates that the data is a dynamic configuration type. **Required**。
* `dynamic=false` It indicates that it is persistent data. When the registrant exits, the data is still stored in the registry. **Required**。
* `enabled=true` It indicates whether this routing rules is effective. Option, and default effective.
* `force=false` It indicates whether it is forced to be executed when the routing result is null. If it is not enforced, the route will be automatically invalidated. Option, and default `false`.
* `runtime=false` It indicates whether to execute routing rules at every call. If not, the result is only pre-executed and cached when the provider's address list changes.  It will get routing result from cache when the service is invoked. If you use parameter routing, you must to configure it as `true`. Be careful that the configuration will affect the performance. Option, and default `false`.
* `priority=1` The priority of the routing rules. it is used for sorting, the greater the priority, the more front execution. Option, and default `0`。
* `rule=URL.encode("host = 10.20.153.10 => host = 10.20.153.11")` It indicates the content of routing rule，**Required**。

## Conditional routing rules

Routing rules based on conditional expressions, such as：`host = 10.20.153.10 => host = 10.20.153.11`

### Rules：

* The previous of `=>` is matched condition for consumer. All parameters compare with URL of consumers. When the consumer meet the condition, it will continue to execute the behind filter rules for consumer.
* After the `=>` aims to filter the provider address list.  All the parameters are compared against the provider's URL, and consumer get only the filtered address list at finally.
* If the previous condition for consumer is empty, it means all consumers can matched. such as : `=> host != 10.20.153.11`
* If the filter condition for provider is empty, it means it is forbidden to visit. such as :`host = 10.20.153.10 =>`

### Expressions：

Parameter Support：

* Service call information, such as: method, argument etc. Parameter routing is currently not supported
* URL field (On URL own), such as: protocol, host, port etc.
* All parameters on the URL. such as: application, organization etc.

Condition Support：

* Equal sign `=` indicates match. such as: `host = 10.20.153.10`
* Not equal sign `!=` indicates "does not match". such as: `host != 10.20.153.10`.

Value Support：

* Separate multiple values with a comma `,` .  Such as：`host != 10.20.153.10,10.20.153.11`
* End with  `*` to indicate wildcard.  Such as： `host != 10.20.*`
* Start with `$` to indicate reference to consumer parameters. Such as: `host = $host`

### Samples

0. Exclude pre-release machine：

    ```
    => host != 172.22.3.91
    ```
1. Whitelist [^3]：
    
    ```
    host != 10.20.153.10,10.20.153.11 =>
    ```
2. Blacklist：

    ```
    host = 10.20.153.10,10.20.153.11 =>
    ```
3. Service boarding application only expose part of the machine to prevent the entire cluster hanging up:

    ```
    => host = 172.22.3.1*,172.22.3.2*
    ```
4. Additional machines for important applications：

    ```
    application != kylin => host != 172.22.3.95,172.22.3.96
    ```
5. Read and write separation：

    ```
    method = find*,list*,get*,is* => host = 172.22.3.94,172.22.3.95,172.22.3.96
    method != find*,list*,get*,is* => host = 172.22.3.97,172.22.3.98
    ```
    
6. Separation of Front and Background Application：

    ```
    application = bops => host = 172.22.3.91,172.22.3.92,172.22.3.93
    application != bops => host = 172.22.3.94,172.22.3.95,172.22.3.96
    ```
    
7. Isolate different network segments：

    ```
    host != 172.22.3.* => host != 172.22.3.*
    ```
    
8. Providers and consumers deployed in the same cluster, the machine only visit the local service：

    ```
    => host = $host
    ```
    
## Script routing rules

Script routing rules [^4] support all scripts of JDK script engine. such as: javascript, jruby, groovy, etc. Configure the script type by `type=javascript`, the default is javascript.


```
"script://0.0.0.0/com.foo.BarService?category=routers&dynamic=false&rule=" + URL.encode("(function route(invokers) { ... } (invokers))")
```

Routing rules that base on script engine is as follow：

```javascript
(function route(invokers) {
    var result = new java.util.ArrayList(invokers.size());
    for (i = 0; i < invokers.size(); i ++) {
        if ("10.20.153.10".equals(invokers.get(i).getUrl().getHost())) {
            result.add(invokers.get(i));
        }
    }
    return result;
} (invokers)); // Indicates that the method is executed immediately
```

[^1]: Support since `2.2.0`   
[^2]: Routing Rules Extension Point: [Route Extension](http://dubbo.apache.org/books/dubbo-dev-book-en/impls/router.html)   
[^3]: Note: A service can only have one whitelist rule, otherwise the two rules will be filtered out.  
[^4]: Note: Scripts have no sandbox constraints, can execute arbitrary code, and poses a backdoor risk.  