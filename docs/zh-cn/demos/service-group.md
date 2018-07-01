# 服务分组

当一个接口有多种实现时，可以用 group 区分。

## 服务

```xml
<dubbo:service group="feedback" interface="com.xxx.IndexService" />
<dubbo:service group="member" interface="com.xxx.IndexService" />
```

## 引用

```xml
<dubbo:reference id="feedbackIndexService" group="feedback" interface="com.xxx.IndexService" />
<dubbo:reference id="memberIndexService" group="member" interface="com.xxx.IndexService" />
```

任意组 [^1]：

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" group="*" />
```

[^1]: `2.2.0` 以上版本支持，总是只调一个可用组的实现
