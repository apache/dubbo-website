---
type: docs
title: "Group Aggregation"
linkTitle: "Group Aggregation"
weight: 1
description: "Aggregate the results by grouping and return the aggregated results"
---

## Feature description
Aggregate the results by grouping and return the aggregated results, such as menu service, use group to distinguish multiple implementations of the same interface, now the consumer needs to call once from each group and return the result, and return the result after merging, so You can implement aggregated menu items.

For relevant codes, please refer to [Samples in the dubbo project](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-merge)

## scenes to be used

Service Grouping and Multiple Versions

## How to use

### Search all groups

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true" />
```

### Merge specified groups

```xml
<dubbo:reference interface="com.xxx.MenuService" group="aaa,bbb" merger="true" />
```
### Specify method merge

Combine the results of the specified method, and other unspecified methods will only call one Group

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="true" />
</dubbo:reference>
```
### A method is not merged

One method does not combine results, others combine results

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true">
    <dubbo:method name="getMenuItems" merger="false" />
</dubbo:reference>
```
### Specify merge strategy

Specify the merge strategy, the default is to automatically match according to the return value type, if there are two combiners of the same type, you need to specify the name of the combiner [Merge result extension](../../../reference-manual/spi/ description/merger)

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="mymerge" />
</dubbo:reference>
```
### Specify merge method

Specify the merge method to merge the specified method that returns the result of the call. The parameter type of the merge method must be the return result type itself

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger=".addAll" />
</dubbo:reference>
```

#### hint:
Supported since `2.1.0` version