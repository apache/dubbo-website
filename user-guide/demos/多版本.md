> ![warning](../sources/images/check.gif)当一个接口实现，出现不兼容升级时，可以用版本号过渡，版本号不同的服务相互间不引用。

* 在低压力时间段，先升级一半提供者为新版本
* 再将所有消费者升级为新版本
* 然后将剩下的一半提供者升级为新版本

**老版本服务**

```xml
<dubbo:service interface="com.foo.BarService" version="1.0.0" />
```

**新版本服务**

```xml
<dubbo:service interface="com.foo.BarService" version="2.0.0" />
```

**引用老版本**

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="1.0.0" />
```

**引用新版本**

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="2.0.0" />
```

不区分版本：(2.2.0以上版本支持)

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="*" />
```