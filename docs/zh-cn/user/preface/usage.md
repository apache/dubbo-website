# 用法

## 本地服务 Spring 配置

local.xml:

```xml
<bean id=“xxxService” class=“com.xxx.XxxServiceImpl” />
<bean id=“xxxAction” class=“com.xxx.XxxAction”>
    <property name=“xxxService” ref=“xxxService” />
</bean>
```

## 远程服务 Spring 配置

在本地服务的基础上，只需做简单配置，即可完成远程化：

* 将上面的 `local.xml` 配置拆分成两份，将服务定义部分放在服务提供方 `remote-provider.xml`，将服务引用部分放在服务消费方 `remote-consumer.xml`。
* 并在提供方增加暴露服务配置 `<dubbo:service>`，在消费方增加引用服务配置 `<dubbo:reference>`。

remote-provider.xml:

```xml
<!-- 和本地服务一样实现远程服务 -->
<bean id=“xxxService” class=“com.xxx.XxxServiceImpl” /> 
<!-- 增加暴露远程服务配置 -->
<dubbo:service interface=“com.xxx.XxxService” ref=“xxxService” /> 
```

remote-consumer.xml:

```xml
<!-- 增加引用远程服务配置 -->
<dubbo:reference id=“xxxService” interface=“com.xxx.XxxService” />
<!-- 和本地服务一样使用远程服务 -->
<bean id=“xxxAction” class=“com.xxx.XxxAction”> 
    <property name=“xxxService” ref=“xxxService” />
</bean>
```