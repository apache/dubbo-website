# Group Merger

According to the group to invoke server and return the merge result [^1], such as the menu service, the same interface, but there are a variety of implementations, using group distinction, consumers call each group and get the results, the merger can merge the resules, so that you can achieve aggregation Menu Item.

Related code can refer to [dubbo project example](https://github.com/apache/incubator-dubbo/tree/master/dubbo-test/dubbo-test-examples/src/main/java/com/alibaba/dubbo/examples/merge)

## Configuration

Merge all groups

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true" />
```

Merge the specified group

```xml
<dubbo:reference interface="com.xxx.MenuService" group="aaa,bbb" merger="true" />
```

The specified method to merge the results, other unspecified methods, will only call one group

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="true" />
</dubbo:service>
```

The Specified a method does not merge the results, others merge the results

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true">
    <dubbo:method name="getMenuItems" merger="false" />
</dubbo:service>
```

Specify the merge strategy, the default according to the type of return value automatically match, if the same type has two mergers, you need to specify the name of the merger[^2]

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="mymerge" />
</dubbo:service>
```

Specify the merge method, it will call the return type's method for merging, the merging method parameter type must be the return type

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger=".addAll" />
</dubbo:service>
```

[^1]: since `2.1.0` began to support
[^2]: See also：[merger extensions](http://dubbo.apache.org/books/dubbo-user-book-en/demos/group-merger.html)
