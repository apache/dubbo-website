---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/group-merger/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/group-merger/
description: 通过分组对结果进行聚合并返回聚合后的结果
linkTitle: 分组聚合
title: 分组聚合
type: docs
weight: 1
---






## 特性说明
通过分组对结果进行聚合并返回聚合后的结果，比如菜单服务，用 group 区分同一接口的多种实现，现在消费方需从每种 group 中调用一次并返回结果，对结果进行合并之后返回，这样就可以实现聚合菜单项。

相关代码可以参考 [dubbo 项目中的示例](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-merge)

## 使用场景

将多个服务提供者分组作为一个提供者进行访问。应用程序能够像访问一个服务一样访问多个服务，并允许更有效地使用资源。

## 使用方式

### 搜索所有分组

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true" />
```

### 合并指定分组

```xml
<dubbo:reference interface="com.xxx.MenuService" group="aaa,bbb" merger="true" />
```
### 指定方法合并

指定方法合并结果，其它未指定的方法，将只调用一个 Group

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="true" />
</dubbo:reference>
```
### 某个方法不合并

某个方法不合并结果，其它都合并结果

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true">
    <dubbo:method name="getMenuItems" merger="false" />
</dubbo:reference>
```
### 指定合并策略

指定合并策略，缺省根据返回值类型自动匹配，如果同一类型有两个合并器时，需指定合并器的名称 [合并结果扩展](../../../reference-manual/spi/description/merger)

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="mymerge" />
</dubbo:reference>
```
### 指定合并方法

指定合并方法，将调用返回结果的指定方法进行合并，合并方法的参数类型必须是返回结果类型本身

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger=".addAll" />
</dubbo:reference>
```

{{% alert title="提示" color="primary" %}}
`2.1.0` 开始支持
{{% /alert %}}
