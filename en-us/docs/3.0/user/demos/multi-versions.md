# Multi versions

When an interface to achieve an incompatible upgrade, you can use the version number transition. Different versions of the services do not reference each other.

You can follow the steps below for version migration:

0. In the low pressure period, upgrade to half of the provider to the new version
0. Then upgrade all consumers to the new version
0. Then upgrade the remaining half providers to the new version


Old version of the service provider configuration:

```xml
<dubbo:service interface="com.foo.BarService" version="1.0.0" />
```

New version of the service provider configuration:

```xml
<dubbo:service interface="com.foo.BarService" version="2.0.0" />
```

Old version of the service consumer configuration:

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="1.0.0" />
```

New version of the service consumer configuration:

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="2.0.0" />
```

If you do not need to distinguish between versions, can be configured as follows [^1]：

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="*" />
```

[^1]: `2.2.0` or later support
