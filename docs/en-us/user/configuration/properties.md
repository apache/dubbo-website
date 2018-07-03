# Properties Configuration

If your application is simple enough, say, you do not need multi-registries or multi-protocols, and you want to share configuration among Spring containers. You can use `dubbo.properties` as default configuration.

Dubbo will load dubbo.properties under the root of classpath automatically, you can also specify the path for loading this file by using JVM parameter: `-Ddubbo.properties.file=xxx.properties`.



## Mapping Rules

Combine the tag name and attribute name of the XML tag, use `.` to split. One property per line.
  
* `dubbo.application.name=foo` equals to `<dubbo:application name="foo" />` 
* `dubbo.registry.address=10.20.153.10:9090` equals to `<dubbo:registry address="10.20.153.10:9090" /> `  

If you have more than one tags in a XML configuration, you can use the `id` value to distinguish. If you don't specify a id, ti will applied to all tags.

* `dubbo.protocol.rmi.port=1234` equals to `<dubbo:protocol id="rmi" name="rmi" port="1099" /> `
* `dubbo.registry.china.address=10.20.153.10:9090` equals to `<dubbo:registry id="china" address="10.20.153.10:9090" />`

Here is a typical dubbo.properties demo configuration：

```properties
dubbo.application.name=foo
dubbo.application.owner=bar
dubbo.registry.address=10.20.153.10:9090
```

## Overrides and Priorities

![properties-override](../sources/images/dubbo-properties-override.jpg)

Priorities from high to low:

* JVM -D parameters, you can easily override configuration when deploying or starting applications, e.g., change the port of dubbo protocol.

* XML, the properties present in XML will override that in dubbo.properties.

* Properties, the default value, only works when it is not configured with XML or JVM.


1: If more than one dubbo.properties under classpath, say, two jars contains dubbo.properties separately, Dubbo will arbitarily choose one to to load, and log Error info.  
2: If `id` not configured on `protocol`, will use `name` property as default
