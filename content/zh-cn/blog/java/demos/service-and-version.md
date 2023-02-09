---
title: "Dubbo服务分组和版本聚合"
linkTitle: "Dubbo服务分组和版本聚合"
tags: ["Java"]
date: 2018-10-27
description: >
    本文主要介绍了 Dubbo 中服务分组和版本聚合的概念和用法
---

我们在调用Dubbo服务的时候，一般只需要将Consumer端的`dubbo:reference`指定成服务端中`dubbo:service`暴露的服务，就可以找到服务端，完成调用，也就是说，Dubbo只需要服务接口信息就可以找到服务提供者。
其实除了服务提供者以外，Dubbo也有服务分组和版本的概念，在客户端去寻找“匹配”的服务端的时候，需要服务接口，版本号，组别这三个信息都匹配，才算是一个有效的服务端：

```java
   public static boolean isMatch(URL consumerUrl, URL providerUrl) {
        String consumerInterface = consumerUrl.getServiceInterface();
        String providerInterface = providerUrl.getServiceInterface();
        if (!(Constants.ANY_VALUE.equals(consumerInterface) || StringUtils.isEquals(consumerInterface, providerInterface)))
            return false;

        if (!isMatchCategory(providerUrl.getParameter(Constants.CATEGORY_KEY, Constants.DEFAULT_CATEGORY),
                consumerUrl.getParameter(Constants.CATEGORY_KEY, Constants.DEFAULT_CATEGORY))) {
            return false;
        }
        if (!providerUrl.getParameter(Constants.ENABLED_KEY, true)
                && !Constants.ANY_VALUE.equals(consumerUrl.getParameter(Constants.ENABLED_KEY))) {
            return false;
        }

        String consumerGroup = consumerUrl.getParameter(Constants.GROUP_KEY);
        String consumerVersion = consumerUrl.getParameter(Constants.VERSION_KEY);
        String consumerClassifier = consumerUrl.getParameter(Constants.CLASSIFIER_KEY, Constants.ANY_VALUE);

        String providerGroup = providerUrl.getParameter(Constants.GROUP_KEY);
        String providerVersion = providerUrl.getParameter(Constants.VERSION_KEY);
        String providerClassifier = providerUrl.getParameter(Constants.CLASSIFIER_KEY, Constants.ANY_VALUE);
        return (Constants.ANY_VALUE.equals(consumerGroup) || StringUtils.isEquals(consumerGroup, providerGroup) || StringUtils.isContains(consumerGroup, providerGroup))
                && (Constants.ANY_VALUE.equals(consumerVersion) || StringUtils.isEquals(consumerVersion, providerVersion))
                && (consumerClassifier == null || Constants.ANY_VALUE.equals(consumerClassifier) || StringUtils.isEquals(consumerClassifier, providerClassifier));
    }
```
如果没有配置组别和版本号，默认值为空。服务端和消费端都没有配，只有服务接口，其他两个信息都为空，也是可以“找到”对方的，那服务名和版本号可以如何使用呢？下面我们来看一下具体的场景：
### 服务分组  
当一个接口有多种实现时，可以用 group 区分。

服务

```xml
<dubbo:service group="feedback" interface="com.xxx.IndexService" />
<dubbo:service group="member" interface="com.xxx.IndexService" />
```
引用  

```xml
<dubbo:reference id="feedbackIndexService" group="feedback" interface="com.xxx.IndexService" />
<dubbo:reference id="memberIndexService" group="member" interface="com.xxx.IndexService" />
```

任意组

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" group="*" />
```

### 多版本  
当一个接口实现，出现不兼容升级时，可以用版本号过渡，版本号不同的服务相互间不引用。

可以按照以下的步骤进行版本迁移：

1. 在低压力时间段，先升级一半提供者为新版本
1. 再将所有消费者升级为新版本
1. 然后将剩下的一半提供者升级为新版本

老版本服务提供者配置：  

```xml
<dubbo:service interface="com.foo.BarService" version="1.0.0" />  
```
    
新版本服务提供者配置：

```xml
<dubbo:service interface="com.foo.BarService" version="2.0.0" />
```

老版本服务消费者配置：

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="1.0.0" />
```

新版本服务消费者配置：

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="2.0.0" />
```

如果不需要区分版本，可以按照以下的方式配置：

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="*" /> 
```


### 分组聚合

按组合并返回结果，比如菜单服务，接口一样，但有多种实现，用group区分，现在消费方需从每种group中调用一次返回结果，合并结果返回，这样就可以实现聚合菜单项。

#### 配置  
搜索所有分组

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true" />
```

合并指定分组

```xml
<dubbo:reference interface="com.xxx.MenuService" group="aaa,bbb" merger="true" />
```

指定方法合并结果，其它未指定的方法，将只调用一个 Group

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="true" />
</dubbo:reference>

```

某个方法不合并结果，其它都合并结果

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true">
    <dubbo:method name="getMenuItems" merger="false" />
</dubbo:reference>

```

指定合并策略，缺省根据返回值类型自动匹配，如果同一类型有两个合并器时，需指定合并器的名称

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="mymerge" />
</dubbo:reference>
```
指定合并方法，将调用返回结果的指定方法进行合并，合并方法的参数类型必须是返回结果类型本身

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger=".addAll" />
</dubbo:reference>  
```
    
#### 实现原理  
如果配置了merge，Dubbo会分别调用多个组别的服务提供者，然后把结果聚合，返回给消费端，具体的实现在`MergeableClusterInvoker.java`里：  

```java
 public Result invoke(final Invocation invocation) throws RpcException {
        List<Invoker<T>> invokers = directory.list(invocation);

        String merger = getUrl().getMethodParameter(invocation.getMethodName(), Constants.MERGER_KEY);
        if (ConfigUtils.isEmpty(merger)) { // If a method doesn't have a merger, only invoke one Group
            for (final Invoker<T> invoker : invokers) {
                if (invoker.isAvailable()) {
                    return invoker.invoke(invocation);
                }
            }
            return invokers.iterator().next().invoke(invocation);
        }

        Class<?> returnType;
        try {
            returnType = getInterface().getMethod(
                    invocation.getMethodName(), invocation.getParameterTypes()).getReturnType();
        } catch (NoSuchMethodException e) {
            returnType = null;
        }

        Map<String, Future<Result>> results = new HashMap<String, Future<Result>>();
        for (final Invoker<T> invoker : invokers) {
            Future<Result> future = executor.submit(new Callable<Result>() {
                @Override
                public Result call() throws Exception {
                    return invoker.invoke(new RpcInvocation(invocation, invoker));
                }
            });
            results.put(invoker.getUrl().getServiceKey(), future);
        }

        Object result = null;

        List<Result> resultList = new ArrayList<Result>(results.size());

        int timeout = getUrl().getMethodParameter(invocation.getMethodName(), Constants.TIMEOUT_KEY, Constants.DEFAULT_TIMEOUT);
        for (Map.Entry<String, Future<Result>> entry : results.entrySet()) {
            Future<Result> future = entry.getValue();
            try {
                Result r = future.get(timeout, TimeUnit.MILLISECONDS);
                if (r.hasException()) {
                    log.error("Invoke " + getGroupDescFromServiceKey(entry.getKey()) + 
                                    " failed: " + r.getException().getMessage(), 
                            r.getException());
                } else {
                    resultList.add(r);
                }
            } catch (Exception e) {
                throw new RpcException("Failed to invoke service " + entry.getKey() + ": " + e.getMessage(), e);
            }
        }

        if (resultList.isEmpty()) {
            return new RpcResult((Object) null);
        } else if (resultList.size() == 1) {
            return resultList.iterator().next();
        }

        if (returnType == void.class) {
            return new RpcResult((Object) null);
        }
```
如果配置了merger，会依次调用，结果都放在results里面，其中value都是future类型，等调用完成之后，再遍历results，通过future.get拿到真正的结果，到此为止，所有调用的结果都放在resultList里面了，接下来要做的是把结果进行聚合： 

```java
  Merger resultMerger;
  if (ConfigUtils.isDefault(merger)) {
      resultMerger = MergerFactory.getMerger(returnType);
  } else {
      resultMerger = ExtensionLoader.getExtensionLoader(Merger.class).getExtension(merger);
  }
  if (resultMerger != null) {
      List<Object> rets = new ArrayList<Object>(resultList.size());
      for (Result r : resultList) {
          rets.add(r.getValue());
      }
      result = resultMerger.merge(
                        rets.toArray((Object[]) Array.newInstance(returnType, 0)));
  } else {
      throw new RpcException("There is no merger to merge result.")
  }
  return new RpcResult(result);
```
这里会根据返回值的类型，获取到对应的resultMerger，除了Dubbo默认实现的类型外，也可以自己指定merger类型并且添加相应的扩展，通过实现`merge`方法类进行结果聚合。