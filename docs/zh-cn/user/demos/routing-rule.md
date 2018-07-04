# 路由规则

路由规则 [^1] 决定一次 dubbo 服务调用的目标服务器，分为条件路由规则和脚本路由规则，并且支持可扩展 [^2]。

## 写入路由规则

向注册中心写入路由规则的操作通常由监控中心或治理中心的页面完成

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("condition://0.0.0.0/com.foo.BarService?category=routers&dynamic=false&rule=" + URL.encode("host = 10.20.153.10 => host = 10.20.153.11") + "));
```

其中：

* `condition://` 表示路由规则的类型，支持条件路由规则和脚本路由规则，可扩展，**必填**。
* `0.0.0.0` 表示对所有 IP 地址生效，如果只想对某个 IP 的生效，请填入具体 IP，**必填**。
* `com.foo.BarService` 表示只对指定服务生效，**必填**。
* `group=foo` 对指定服务的指定group生效，不填表示对未配置group的指定服务生效
* `version=1.0`对指定服务的指定version生效，不填表示对未配置version的指定服务生效
* `category=routers` 表示该数据为动态配置类型，**必填**。
* `dynamic=false` 表示该数据为持久数据，当注册方退出时，数据依然保存在注册中心，**必填**。
* `enabled=true` 覆盖规则是否生效，可不填，缺省生效。
* `force=false` 当路由结果为空时，是否强制执行，如果不强制执行，路由结果为空的路由规则将自动失效，可不填，缺省为 `flase`。
* `runtime=false` 是否在每次调用时执行路由规则，否则只在提供者地址列表变更时预先执行并缓存结果，调用时直接从缓存中获取路由结果。如果用了参数路由，必须设为 `true`，需要注意设置会影响调用的性能，可不填，缺省为 `flase`。
* `priority=1` 路由规则的优先级，用于排序，优先级越大越靠前执行，可不填，缺省为 `0`。
* `rule=URL.encode("host = 10.20.153.10 => host = 10.20.153.11")` 表示路由规则的内容，**必填**。

## 条件路由规则

基于条件表达式的路由规则，如：`host = 10.20.153.10 => host = 10.20.153.11`

### 规则：

* `=>` 之前的为消费者匹配条件，所有参数和消费者的 URL 进行对比，当消费者满足匹配条件时，对该消费者执行后面的过滤规则。
* `=>` 之后为提供者地址列表的过滤条件，所有参数和提供者的 URL 进行对比，消费者最终只拿到过滤后的地址列表。
* 如果匹配条件为空，表示对所有消费方应用，如：`=> host != 10.20.153.11`
* 如果过滤条件为空，表示禁止访问，如：`host = 10.20.153.10 =>`

### 表达式：

参数支持：

* 服务调用信息，如：method, argument 等，暂不支持参数路由
* URL 本身的字段，如：protocol, host, port 等
* 以及 URL 上的所有参数，如：application, organization 等

条件支持：

* 等号 `=` 表示"匹配"，如：`host = 10.20.153.10`
* 不等号 `!=` 表示"不匹配"，如：`host != 10.20.153.10`

值支持：

* 以逗号 `,` 分隔多个值，如：`host != 10.20.153.10,10.20.153.11`
* 以星号 `*` 结尾，表示通配，如：`host != 10.20.*`
* 以美元符 `$` 开头，表示引用消费者参数，如：`host = $host`

### 示例：

0. 排除预发布机：

    ```
    => host != 172.22.3.91
    ```
1. 白名单 [^3]：
    
    ```
    host != 10.20.153.10,10.20.153.11 =>
    ```
2. 黑名单：

    ```
    host = 10.20.153.10,10.20.153.11 =>
    ```
3. 服务寄宿在应用上，只暴露一部分的机器，防止整个集群挂掉：

    ```
    => host = 172.22.3.1*,172.22.3.2*
    ```
4. 为重要应用提供额外的机器：

    ```
    application != kylin => host != 172.22.3.95,172.22.3.96
    ```
5. 读写分离：

    ```
    method = find*,list*,get*,is* => host = 172.22.3.94,172.22.3.95,172.22.3.96
    method != find*,list*,get*,is* => host = 172.22.3.97,172.22.3.98
    ```
    
6. 前后台分离：

    ```
    application = bops => host = 172.22.3.91,172.22.3.92,172.22.3.93
    application != bops => host = 172.22.3.94,172.22.3.95,172.22.3.96
    ```
    
7. 隔离不同机房网段：

    ```
    host != 172.22.3.* => host != 172.22.3.*
    ```
    
8. 提供者与消费者部署在同集群内，本机只访问本机的服务：

    ```
    => host = $host
    ```
    
## 脚本路由规则

脚本路由规则 [^4] 支持 JDK 脚本引擎的所有脚本，比如：javascript, jruby, groovy 等，通过 `type=javascript` 参数设置脚本类型，缺省为 javascript。


```
"script://0.0.0.0/com.foo.BarService?category=routers&dynamic=false&rule=" + URL.encode("（function route(invokers) { ... } (invokers)）")
```

基于脚本引擎的路由规则，如：

```javascript
（function route(invokers) {
    var result = new java.util.ArrayList(invokers.size());
    for (i = 0; i < invokers.size(); i ++) {
        if ("10.20.153.10".equals(invokers.get(i).getUrl().getHost())) {
            result.add(invokers.get(i));
        }
    }
    return result;
} (invokers)）; // 表示立即执行方法
```

[^1]: `2.2.0` 以上版本支持
[^2]: 路由规则扩展点：[路由扩展](http://dubbo.apache.org/books/dubbo-dev-book/impls/router.html)
[^3]: 注意：一个服务只能有一条白名单规则，否则两条规则交叉，就都被筛选掉了
[^4]: 注意：脚本没有沙箱约束，可执行任意代码，存在后门风险