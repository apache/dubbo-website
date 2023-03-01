---
aliases:
    - /zh/docsv2.7/dev/source/router/
description: 本文介绍了服务路由的原理和实现细节
linkTitle: 服务路由
title: 服务路由
type: docs
weight: 1
---



## 1. 简介

上一篇文章分析了集群容错的第一部分 — 服务目录 Directory。服务目录在刷新 Invoker 列表的过程中，会通过 Router 进行服务路由，筛选出符合路由规则的服务提供者。在详细分析服务路由的源码之前，先来介绍一下服务路由是什么。服务路由包含一条路由规则，路由规则决定了服务消费者的调用目标，即规定了服务消费者可调用哪些服务提供者。Dubbo 目前提供了三种服务路由实现，分别为条件路由 ConditionRouter、脚本路由 ScriptRouter 和标签路由 TagRouter。其中条件路由是我们最常使用的，标签路由是一个新的实现，暂时还未发布，该实现预计会在 2.7.x 版本中发布。本篇文章将分析条件路由相关源码，脚本路由和标签路由这里就不分析了。

## 2. 源码分析

条件路由规则由两个条件组成，分别用于对服务消费者和提供者进行匹配。比如有这样一条规则：

`host = 10.20.153.10 => host = 10.20.153.11`

该条规则表示 IP 为 10.20.153.10 的服务消费者**只可**调用 IP 为 10.20.153.11 机器上的服务，不可调用其他机器上的服务。条件路由规则的格式如下：

`[服务消费者匹配条件] => [服务提供者匹配条件]`

如果服务消费者匹配条件为空，表示不对服务消费者进行限制。如果服务提供者匹配条件为空，表示对某些服务消费者禁用服务。官方文档中对条件路由进行了比较详细的介绍，大家可以参考下，这里就不过多说明了。

条件路由实现类 ConditionRouter 在进行工作前，需要先对用户配置的路由规则进行解析，得到一系列的条件。然后再根据这些条件对服务进行路由。本章将分两节进行说明，2.1节介绍表达式解析过程。2.2 节介绍服务路由的过程。下面，我们先从表达式解析过程看起。

### 2.1 表达式解析

条件路由规则是一条字符串，对于 Dubbo 来说，它并不能直接理解字符串的意思，需要将其解析成内部格式才行。条件表达式的解析过程始于 ConditionRouter 的构造方法，下面一起看一下：

```java
public ConditionRouter(URL url) {
    this.url = url;
    // 获取 priority 和 force 配置
    this.priority = url.getParameter(Constants.PRIORITY_KEY, 0);
    this.force = url.getParameter(Constants.FORCE_KEY, false);
    try {
        // 获取路由规则
        String rule = url.getParameterAndDecoded(Constants.RULE_KEY);
        if (rule == null || rule.trim().length() == 0) {
            throw new IllegalArgumentException("Illegal route rule!");
        }
        rule = rule.replace("consumer.", "").replace("provider.", "");
        // 定位 => 分隔符
        int i = rule.indexOf("=>");
        // 分别获取服务消费者和提供者匹配规则
        String whenRule = i < 0 ? null : rule.substring(0, i).trim();
        String thenRule = i < 0 ? rule.trim() : rule.substring(i + 2).trim();
        // 解析服务消费者匹配规则
        Map<String, MatchPair> when = 
            StringUtils.isBlank(whenRule) || "true".equals(whenRule) 
                ? new HashMap<String, MatchPair>() : parseRule(whenRule);
        // 解析服务提供者匹配规则
        Map<String, MatchPair> then = 
            StringUtils.isBlank(thenRule) || "false".equals(thenRule) 
                ? null : parseRule(thenRule);
        // 将解析出的匹配规则分别赋值给 whenCondition 和 thenCondition 成员变量
        this.whenCondition = when;
        this.thenCondition = then;
    } catch (ParseException e) {
        throw new IllegalStateException(e.getMessage(), e);
    }
}
```

如上，ConditionRouter 构造方法先是对路由规则做预处理，然后调用 parseRule 方法分别对服务提供者和消费者规则进行解析，最后将解析结果赋值给 whenCondition 和 thenCondition 成员变量。ConditionRouter 构造方法不是很复杂，这里就不多说了。下面我们把重点放在 parseRule 方法上，在详细介绍这个方法之前，我们先来看一个内部类。


```java
private static final class MatchPair {
    final Set<String> matches = new HashSet<String>();
    final Set<String> mismatches = new HashSet<String>();
}
```

MatchPair 内部包含了两个 Set 类型的成员变量，分别用于存放匹配和不匹配的条件。这个类两个成员变量会在 parseRule 方法中被用到，下面来看一下。


```java
private static Map<String, MatchPair> parseRule(String rule)
        throws ParseException {
    // 定义条件映射集合
    Map<String, MatchPair> condition = new HashMap<String, MatchPair>();
    if (StringUtils.isBlank(rule)) {
        return condition;
    }
    MatchPair pair = null;
    Set<String> values = null;
    // 通过正则表达式匹配路由规则，ROUTE_PATTERN = ([&!=,]*)\s*([^&!=,\s]+)
    // 这个表达式看起来不是很好理解，第一个括号内的表达式用于匹配"&", "!", "=" 和 "," 等符号。
    // 第二括号内的用于匹配英文字母，数字等字符。举个例子说明一下：
    //    host = 2.2.2.2 & host != 1.1.1.1 & method = hello
    // 匹配结果如下：
    //     括号一      括号二
    // 1.  null       host
    // 2.   =         2.2.2.2
    // 3.   &         host
    // 4.   !=        1.1.1.1 
    // 5.   &         method
    // 6.   =         hello
    final Matcher matcher = ROUTE_PATTERN.matcher(rule);
    while (matcher.find()) {
       	// 获取括号一内的匹配结果
        String separator = matcher.group(1);
        // 获取括号二内的匹配结果
        String content = matcher.group(2);
        // 分隔符为空，表示匹配的是表达式的开始部分
        if (separator == null || separator.length() == 0) {
            // 创建 MatchPair 对象
            pair = new MatchPair();
            // 存储 <匹配项, MatchPair> 键值对，比如 <host, MatchPair>
            condition.put(content, pair); 
        } 
        
        // 如果分隔符为 &，表明接下来也是一个条件
        else if ("&".equals(separator)) {
            // 尝试从 condition 获取 MatchPair
            if (condition.get(content) == null) {
                // 未获取到 MatchPair，重新创建一个，并放入 condition 中
                pair = new MatchPair();
                condition.put(content, pair);
            } else {
                pair = condition.get(content);
            }
        } 
        
        // 分隔符为 =
        else if ("=".equals(separator)) {
            if (pair == null)
                throw new ParseException("Illegal route rule ...");

            values = pair.matches;
            // 将 content 存入到 MatchPair 的 matches 集合中
            values.add(content);
        } 
        
        //  分隔符为 != 
        else if ("!=".equals(separator)) {
            if (pair == null)
                throw new ParseException("Illegal route rule ...");

            values = pair.mismatches;
            // 将 content 存入到 MatchPair 的 mismatches 集合中
            values.add(content);
        }
        
        // 分隔符为 ,
        else if (",".equals(separator)) {
            if (values == null || values.isEmpty())
                throw new ParseException("Illegal route rule ...");
            // 将 content 存入到上一步获取到的 values 中，可能是 matches，也可能是 mismatches
            values.add(content);
        } else {
            throw new ParseException("Illegal route rule ...");
        }
    }
    return condition;
}
```

以上就是路由规则的解析逻辑，该逻辑由正则表达式和一个 while 循环以及数个条件分支组成。下面通过一个示例对解析逻辑进行演绎。示例为 ` host = 2.2.2.2 & host != 1.1.1.1 & method = hello`。正则解析结果如下：

```
    括号一      括号二
1.  null       host
2.   =         2.2.2.2
3.   &         host
4.   !=        1.1.1.1
5.   &         method
6.   =         hello
```

现在线程进入 while 循环：

第一次循环：分隔符 separator = null，content = "host"。此时创建 MatchPair 对象，并存入到 condition 中，condition = {"host": MatchPair@123}

第二次循环：分隔符 separator = "="，content = "2.2.2.2"，pair = MatchPair@123。此时将 2.2.2.2 放入到 MatchPair@123 对象的 matches 集合中。

第三次循环：分隔符 separator = "&"，content = "host"。host 已存在于 condition 中，因此 pair = MatchPair@123。

第四次循环：分隔符 separator = "!="，content = "1.1.1.1"，pair = MatchPair@123。此时将 1.1.1.1 放入到 MatchPair@123 对象的 mismatches 集合中。

第五次循环：分隔符 separator = "&"，content = "method"。condition.get("method") = null，因此新建一个 MatchPair 对象，并放入到 condition 中。此时 condition = {"host": MatchPair@123, "method": MatchPair@ 456}

第六次循环：分隔符 separator = "="，content = "2.2.2.2"，pair = MatchPair@456。此时将 hello 放入到 MatchPair@456 对象的 matches 集合中。

循环结束，此时 condition 的内容如下：

```json
{
    "host": {
        "matches": ["2.2.2.2"],
        "mismatches": ["1.1.1.1"]
    },
    "method": {
        "matches": ["hello"],
        "mismatches": []
    }
}
```

路由规则的解析过程稍微有点复杂，大家可通过 ConditionRouter 的测试类对该逻辑进行测试。并且找一个表达式，对照上面的代码走一遍，加深理解。

### 2.2 服务路由

服务路由的入口方法是 ConditionRouter 的 route 方法，该方法定义在 Router 接口中。实现代码如下：

```java
public <T> List<Invoker<T>> route(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException {
    if (invokers == null || invokers.isEmpty()) {
        return invokers;
    }
    try {
        // 先对服务消费者条件进行匹配，如果匹配失败，表明服务消费者 url 不符合匹配规则，
        // 无需进行后续匹配，直接返回 Invoker 列表即可。比如下面的规则：
        //     host = 10.20.153.10 => host = 10.0.0.10
        // 这条路由规则希望 IP 为 10.20.153.10 的服务消费者调用 IP 为 10.0.0.10 机器上的服务。
        // 当消费者 ip 为 10.20.153.11 时，matchWhen 返回 false，表明当前这条路由规则不适用于
        // 当前的服务消费者，此时无需再进行后续匹配，直接返回即可。
        if (!matchWhen(url, invocation)) {
            return invokers;
        }
        List<Invoker<T>> result = new ArrayList<Invoker<T>>();
        // 服务提供者匹配条件未配置，表明对指定的服务消费者禁用服务，也就是服务消费者在黑名单中
        if (thenCondition == null) {
            logger.warn("The current consumer in the service blacklist...");
            return result;
        }
        // 这里可以简单的把 Invoker 理解为服务提供者，现在使用服务提供者匹配规则对 
        // Invoker 列表进行匹配
        for (Invoker<T> invoker : invokers) {
            // 若匹配成功，表明当前 Invoker 符合服务提供者匹配规则。
            // 此时将 Invoker 添加到 result 列表中
            if (matchThen(invoker.getUrl(), url)) {
                result.add(invoker);
            }
        }
        
        // 返回匹配结果，如果 result 为空列表，且 force = true，表示强制返回空列表，
        // 否则路由结果为空的路由规则将自动失效
        if (!result.isEmpty()) {
            return result;
        } else if (force) {
            logger.warn("The route result is empty and force execute ...");
            return result;
        }
    } catch (Throwable t) {
        logger.error("Failed to execute condition router rule: ...");
    }
    
    // 原样返回，此时 force = false，表示该条路由规则失效
    return invokers;
}
```

route 方法先是调用 matchWhen 对服务消费者进行匹配，如果匹配失败，直接返回 Invoker 列表。如果匹配成功，再对服务提供者进行匹配，匹配逻辑封装在了 matchThen 方法中。下面来看一下这两个方法的逻辑：

```java
boolean matchWhen(URL url, Invocation invocation) {
    // 服务消费者条件为 null 或空，均返回 true，比如：
    //     => host != 172.22.3.91
    // 表示所有的服务消费者都不得调用 IP 为 172.22.3.91 的机器上的服务
    return whenCondition == null || whenCondition.isEmpty() 
        || matchCondition(whenCondition, url, null, invocation);  // 进行条件匹配
}

private boolean matchThen(URL url, URL param) {
    // 服务提供者条件为 null 或空，表示禁用服务
    return !(thenCondition == null || thenCondition.isEmpty()) 
        && matchCondition(thenCondition, url, param, null);  // 进行条件匹配
}
```

这两个方法长的有点像，不过逻辑上还是有差别的，大家注意看。这两个方法均调用了 matchCondition 方法，但它们所传入的参数是不同的。这个需要特别注意一下，不然后面的逻辑不好弄懂。下面我们对这几个参数进行溯源。matchWhen 方法向 matchCondition 方法传入的参数为 [whenCondition, url, null, invocation]，第一个参数 whenCondition 为服务消费者匹配条件，这个前面分析过。第二个参数 url 源自 route 方法的参数列表，该参数由外部类调用 route 方法时传入。比如：

```java
private List<Invoker<T>> route(List<Invoker<T>> invokers, String method) {
    Invocation invocation = new RpcInvocation(method, new Class<?>[0], new Object[0]);
    List<Router> routers = getRouters();
    if (routers != null) {
        for (Router router : routers) {
            if (router.getUrl() != null) {
                // 注意第二个参数
                invokers = router.route(invokers, getConsumerUrl(), invocation);
            }
        }
    }
    return invokers;
}
```

上面这段代码来自 RegistryDirectory，第二个参数表示的是服务消费者 url。matchCondition 的 invocation 参数也是从这里传入的。

接下来再来看看 matchThen 向 matchCondition 方法传入的参数 [thenCondition, url, param, null]。第一个参数不用解释了。第二个和第三个参数来自 matchThen 方法的参数列表，这两个参数分别为服务提供者 url 和服务消费者 url。搞清楚这些参数来源后，接下来就可以分析 matchCondition 方法了。

```java
private boolean matchCondition(Map<String, MatchPair> condition, URL url, URL param, Invocation invocation) {
    // 将服务提供者或消费者 url 转成 Map
    Map<String, String> sample = url.toMap();
    boolean result = false;
    // 遍历 condition 列表
    for (Map.Entry<String, MatchPair> matchPair : condition.entrySet()) {
        // 获取匹配项名称，比如 host、method 等
        String key = matchPair.getKey();
        String sampleValue;
        // 如果 invocation 不为空，且 key 为 method(s)，表示进行方法匹配
        if (invocation != null && (Constants.METHOD_KEY.equals(key) || Constants.METHODS_KEY.equals(key))) {
            // 从 invocation 获取被调用方法的名称
            sampleValue = invocation.getMethodName();
        } else {
            // 从服务提供者或消费者 url 中获取指定字段值，比如 host、application 等
            sampleValue = sample.get(key);
            if (sampleValue == null) {
                // 尝试通过 default.xxx 获取相应的值
                sampleValue = sample.get(Constants.DEFAULT_KEY_PREFIX + key);
            }
        }
        
        // --------------------✨ 分割线 ✨-------------------- //
        
        if (sampleValue != null) {
            // 调用 MatchPair 的 isMatch 方法进行匹配
            if (!matchPair.getValue().isMatch(sampleValue, param)) {
                // 只要有一个规则匹配失败，立即返回 false 结束方法逻辑
                return false;
            } else {
                result = true;
            }
        } else {
            // sampleValue 为空，表明服务提供者或消费者 url 中不包含相关字段。此时如果 
            // MatchPair 的 matches 不为空，表示匹配失败，返回 false。比如我们有这样
            // 一条匹配条件 loadbalance = random，假设 url 中并不包含 loadbalance 参数，
            // 此时 sampleValue = null。既然路由规则里限制了 loadbalance 必须为 random，
            // 但 sampleValue = null，明显不符合规则，因此返回 false
            if (!matchPair.getValue().matches.isEmpty()) {
                return false;
            } else {
                result = true;
            }
        }
    }
    return result;
}
```

如上，matchCondition 方法看起来有点复杂，这里简单说明一下。分割线以上的代码实际上用于获取 sampleValue 的值，分割线以下才是进行条件匹配。条件匹配调用的逻辑封装在 isMatch 中，代码如下：

```java
private boolean isMatch(String value, URL param) {
    // 情况一：matches 非空，mismatches 为空
    if (!matches.isEmpty() && mismatches.isEmpty()) {
        // 遍历 matches 集合，检测入参 value 是否能被 matches 集合元素匹配到。
        // 举个例子，如果 value = 10.20.153.11，matches = [10.20.153.*],
        // 此时 isMatchGlobPattern 方法返回 true
        for (String match : matches) {
            if (UrlUtils.isMatchGlobPattern(match, value, param)) {
                return true;
            }
        }
        
        // 如果所有匹配项都无法匹配到入参，则返回 false
        return false;
    }

    // 情况二：matches 为空，mismatches 非空
    if (!mismatches.isEmpty() && matches.isEmpty()) {
        for (String mismatch : mismatches) {
            // 只要入参被 mismatches 集合中的任意一个元素匹配到，就返回 false
            if (UrlUtils.isMatchGlobPattern(mismatch, value, param)) {
                return false;
            }
        }
        // mismatches 集合中所有元素都无法匹配到入参，此时返回 true
        return true;
    }

    // 情况三：matches 非空，mismatches 非空
    if (!matches.isEmpty() && !mismatches.isEmpty()) {
        // matches 和 mismatches 均为非空，此时优先使用 mismatches 集合元素对入参进行匹配。
        // 只要 mismatches 集合中任意一个元素与入参匹配成功，就立即返回 false，结束方法逻辑
        for (String mismatch : mismatches) {
            if (UrlUtils.isMatchGlobPattern(mismatch, value, param)) {
                return false;
            }
        }
        // mismatches 集合元素无法匹配到入参，此时再使用 matches 继续匹配
        for (String match : matches) {
            // 只要 matches 集合中任意一个元素与入参匹配成功，就立即返回 true
            if (UrlUtils.isMatchGlobPattern(match, value, param)) {
                return true;
            }
        }
        
        // 全部失配，则返回 false
        return false;
    }
    
    // 情况四：matches 和 mismatches 均为空，此时返回 false
    return false;
}
```

isMatch 方法逻辑比较清晰，由三个条件分支组成，用于处理四种情况。这里对四种情况下的匹配逻辑进行简单的总结，如下：

|        | 条件                          | 过程                                                         |
| ------ | ----------------------------- | ------------------------------------------------------------ |
| 情况一 | matches 非空，mismatches 为空 | 遍历 matches 集合元素，并与入参进行匹配。只要有一个元素成功匹配入参，即可返回 true。若全部失配，则返回 false。 |
| 情况二 | matches 为空，mismatches 非空 | 遍历 mismatches 集合元素，并与入参进行匹配。只要有一个元素成功匹配入参，立即 false。若全部失配，则返回 true。 |
| 情况三 | matches 非空，mismatches 非空 | 优先使用 mismatches 集合元素对入参进行匹配，只要任一元素与入参匹配成功，就立即返回 false，结束方法逻辑。否则再使用 matches 中的集合元素进行匹配，只要有任意一个元素匹配成功，即可返回 true。若全部失配，则返回 false |
| 情况四 | matches 为空，mismatches 为空 | 直接返回 false                                               |

isMatch 方法是通过 UrlUtils 的 isMatchGlobPattern 方法进行匹配，因此下面我们再来看看 isMatchGlobPattern 方法的逻辑。

```java
public static boolean isMatchGlobPattern(String pattern, String value, URL param) {
    if (param != null && pattern.startsWith("$")) {
        // 引用服务消费者参数，param 参数为服务消费者 url
        pattern = param.getRawParameter(pattern.substring(1));
    }
    // 调用重载方法继续比较
    return isMatchGlobPattern(pattern, value);
}

public static boolean isMatchGlobPattern(String pattern, String value) {
    // 对 * 通配符提供支持
    if ("*".equals(pattern))
        // 匹配规则为通配符 *，直接返回 true 即可
        return true;
    if ((pattern == null || pattern.length() == 0)
            && (value == null || value.length() == 0))
        // pattern 和 value 均为空，此时可认为两者相等，返回 true
        return true;
    if ((pattern == null || pattern.length() == 0)
            || (value == null || value.length() == 0))
        // pattern 和 value 其中有一个为空，表明两者不相等，返回 false
        return false;

    // 定位 * 通配符位置
    int i = pattern.lastIndexOf('*');
    if (i == -1) {
        // 匹配规则中不包含通配符，此时直接比较 value 和 pattern 是否相等即可，并返回比较结果
        return value.equals(pattern);
    }
    // 通配符 "*" 在匹配规则尾部，比如 10.0.21.*
    else if (i == pattern.length() - 1) {
        // 检测 value 是否以“不含通配符的匹配规则”开头，并返回结果。比如:
        // pattern = 10.0.21.*，value = 10.0.21.12，此时返回 true
        return value.startsWith(pattern.substring(0, i));
    }
    // 通配符 "*" 在匹配规则头部
    else if (i == 0) {
        // 检测 value 是否以“不含通配符的匹配规则”结尾，并返回结果
        return value.endsWith(pattern.substring(i + 1));
    }
    // 通配符 "*" 在匹配规则中间位置
    else {
        // 通过通配符将 pattern 分成两半，得到 prefix 和 suffix
        String prefix = pattern.substring(0, i);
        String suffix = pattern.substring(i + 1);
        // 检测 value 是否以 prefix 开头，且以 suffix 结尾，并返回结果
        return value.startsWith(prefix) && value.endsWith(suffix);
    }
}
```

以上就是 isMatchGlobPattern 两个重载方法的全部逻辑，这两个方法分别对普通的匹配过程，以及”引用消费者参数“和通配符匹配等特性提供了支持。这两个方法的逻辑不是很复杂，且代码中也进行了比较详细的注释，因此就不多说了。

## 3. 总结

本篇文章对条件路由的表达式解析和服务路由过程进行了较为细致的分析。总的来说，条件路由的代码还是有一些复杂的，需要静下心来看。在阅读条件路由代码的过程中，要多调试。一般的框架都会有单元测试，Dubbo 也不例外，因此大家可以直接通过 ConditionRouterTest 对条件路由进行调试，无需重头构建测试用例。