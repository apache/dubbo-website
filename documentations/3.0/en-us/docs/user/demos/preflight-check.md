# Check on start up

By default dubbo will check if the dependent service is available at startup . It will throw an exception to prevent Spring complete initialization when it is not available, so that you can find the problems early before publishing you application, the default setting: `check=true`.

You can turn off checking by `check=false`. For example, some services do not care it when you run testing, or you must have one started firstly because of circular dependency.

In addition, if your Spring bean is lazy-loaded or you delay reference service with API programming, turn off the check, 
otherwise the service will throw an exception when the service is temporarily unavailable ,then get a null reference.  If you configure `check=false` ,you can get a reference . When the service is restored, the service can automatically reconnect.

## Example

### Use the spring configuration file

Disable the startup check of a service (throw some exception/error when no provider is provided):

```xml
<dubbo:reference interface = "com.foo.BarService" check = "false" />
```

Disable startup checking for all services (throw some exception/error when not provided):

```xml
<dubbo:consumer check = "false" />
```

Disable the registration center startup check (registration subscription failed error):

```xml
<dubbo:registry check="false" />
```

### Use dubbo.properties

```properties
dubbo.reference.com.foo.BarService.check = false
dubbo.reference.check = false
dubbo.consumer.check = false
dubbo.registry.check = false
```

### Use the -D parameter

```sh
java -Ddubbo.reference.com.foo.BarService.check = false
java -Ddubbo.reference.check = false
java -Ddubbo.consumer.check = false
java -Ddubbo.registry.check = false
```

## Configuration Meaning

`dubbo.reference.check=false`,  Change the check value of all references forcibly, even if the configuration has a declaration, it also will be overwritten.

`dubbo.consumer.check=false`  The default value of `check`.  It will not be affected if there is an explicit declaration in the configuration such as` `<dubbo: reference check =" true "/>`.

`dubbo.registry.check=false`, The two configuration above is to express success of the subscription. If the subscription is also allowed to start when the registration fails for the provider list is empty, you need to use this configuration. The system will try again in the background regularly.