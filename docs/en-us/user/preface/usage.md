# Usage

## Spring configuration of local service

local.xml:

```xml
<bean id=“xxxService” class=“com.xxx.XxxServiceImpl” />
<bean id=“xxxAction” class=“com.xxx.XxxAction”>
    <property name=“xxxService” ref=“xxxService” />
</bean>
```

## Spring configuration of remote service

The remote configuration can be done by very little change based on the local configuration:

* split the `local.xml` into two part, put the service define part into `remote-privider.xml`(exists in the provider node), meanwhile the refrence part into `remote-consumer.xml`(exists in the consumer node).
* add `<dubbo:service>` to the provider's configuration, and `<dubbo:reference>` to the consumer's configuration.

remote-provider.xml:

```xml
<!-- define remote service bean the same way as local service bean -->
<bean id=“xxxService” class=“com.xxx.XxxServiceImpl” /> 
<!-- expose the remote service -->
<dubbo:service interface=“com.xxx.XxxService” ref=“xxxService” /> 
```

remote-consumer.xml:

```xml
<!-- reference the remote service -->
<dubbo:reference id=“xxxService” interface=“com.xxx.XxxService” />
<!-- use remote service the same say as local service -->
<bean id=“xxxAction” class=“com.xxx.XxxAction”> 
    <property name=“xxxService” ref=“xxxService” />
</bean>
```
