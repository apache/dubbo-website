---
aliases:
    - /zh/overview/tasks/develop/async/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/async-call/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/async-call/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/async-execute-on-provider/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/async/
description: 使用 Filter 过滤器动态拦截请求（request）或响应（response）以转换或使用请求或响应中包含的信息。
linkTitle: Filter拦截器
title: 使用 Filter 过滤器动态拦截请求（request）或响应（response）
type: docs
weight: 3
---

Filter 过滤器动态拦截请求（request）或响应（response）以转换或使用请求或响应中包含的信息。过滤器本身通常不会创建响应，而是提供可以“附加”到任何一次 RPC 请求的通用函数。Dubbo Filter 是可插拔的，我们可以在一次 RPC 请求中插入任意类型的、任意多个 Filter。

Filter 工作原理如下图所示：

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/framework/filter.png"/>

可以通过 Filter 实现的一些典型能力如下：
* 记录请求参数、响应结果等到日志文件
* 为 RPC 请求添加认证或校验逻辑
* 在发送或执行请求之前，格式化请求体或 header 参数
* 压缩响应结果
* 对请求数据进行埋点，统计调用耗时、成功、失败次数等
* 监测并发执行的请求数量，实现限流降级能力

## 使用方式
如上图所示，Dubbo 代理会自动加载 Filter 实现并将它们组装到调用链路。Filter 是一个标准的 SPI 定义，框架按照一定的激活规则自动加载 Filter 实现。

```java
@SPI(scope = ExtensionScope.MODULE)
public interface Filter extends BaseFilter {}
```

Filter 的默认激活状态可在定义中通过 `@Activate` 注解设置，如以下定义表示该 Filter 在提供者端执行 RPC 请求时自动开启（在消费端不开启）。`@Activate` 支持多种条件控制，包括 classpath 下有某个类的定义时开启，URL 中有哪个参数值时开启等，具体可参见 [SPI 扩展 Activate 介绍]()。

```java
@Activate(group = PROVIDER)
public class AccessLogFilter implements Filter {}
```

### 关闭自动加载
如想关闭某个 filter 加载，在不修改 Filter 定义的情况下，可通过以下几种配置关闭。

全局关闭 filter，所有 rpc 调用均不启用 filter
```yaml
dubbo:
  consumer:
    filter: "-accesslog,-tps"
```

某个服务调用过程不执行 filter
```java
@DubboReference(filter="-accesslog,-tps")
private DemoService demoService;
```

### 开启自动加载
如想开启某个 filter 加载，在不修改 Filter 定义的情况下，可通过以下几种配置开启。

全局开启 filter，所有 rpc 调用均启用 filter
```yaml
dubbo:
  consumer:
    filter: "accesslog,tps"
```

某个服务调用过程执行该 filter
```java
@DubboReference(filter="accesslog,tps")
private DemoService demoService;
```

## 内置实现
以下是 Dubbo 框架中内置的一些 Filter 实现，作为某些功能的底层实现原理，大部分情况下用户不需要关心这些 Filter 实现。这里列出来作为参考，方便用户了解如何开启某个特定功能，以及他们背后的工作原理：



## 具体定义
以下是关于 Filter 过滤器具体定义与实现的一些细节，对于扩展 Filter 的用户可作为参考。

### Filter定义
Dubbo Filter 的定义如下：
```java
public interface BaseFilter {
    /**
     * Always call invoker.invoke() in the implementation to hand over the request to the next filter node.
     */
    Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException;

    /**
     * This callback listener applies to both synchronous and asynchronous calls, please put logics that need to be executed
     * on return of rpc result in onResponse or onError respectively based on it is normal return or exception return.
     * <p>
     * There's something that needs to pay attention on legacy synchronous style filer refactor, the thing is, try to move logics
     * previously defined in the 'finally block' to both onResponse and onError.
     */
    interface Listener {

        /**
         * This method will only be called on successful remote rpc execution, that means, the service in on remote received
         * the request and the result (normal or exceptional) returned successfully.
         */
        void onResponse(Result appResponse, Invoker<?> invoker, Invocation invocation);

        /**
         * This method will be called on detection of framework exceptions, for example, TimeoutException, NetworkException
         * Exception raised in Filters, etc.
         */
        void onError(Throwable t, Invoker<?> invoker, Invocation invocation);
    }
}
```

基于以上 BaseFilter 定义，Dubbo 定义了两个 SPI 接口：ClusterFilter 与 Filter。这两个 SPI 实现能实现的效果基本是一致的，之所以定义两个主要是出于性能优化考虑，建议用户关注 Filter SPI 即可，仅在有严苛性能需求的情况下（如集群 provider 提供者实例数量庞大）才关注 ClusterFilter。

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/framework/cluster-filter.png"/>

```java
@SPI(scope = ExtensionScope.MODULE)
public interface Filter extends BaseFilter {}
```

```java
@SPI(scope = ExtensionScope.MODULE)
public interface ClusterFilter extends BaseFilter {}
```

### 扩展Filter

可参考 [使用教程 - 自定义扩展]() 学习具体示例。



