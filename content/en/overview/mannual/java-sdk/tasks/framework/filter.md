---
aliases:
    - /en/overview/tasks/develop/async/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/async-call/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/async-call/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/async-execute-on-provider/
    - /en/overview/manonical/java-sdk/advanced-features-and-usage/service/async/
description: Use Filter to dynamically intercept requests or responses to transform or utilize the information contained in requests or responses.
linkTitle: Filter Interceptor
title: Use Filter to Dynamically Intercept Requests or Responses
type: docs
weight: 3
---

The Filter dynamically intercepts requests or responses to transform or utilize the information contained within them. Filters themselves do not typically create responses but provide generic functions that can be "attached" to any RPC request. Dubbo Filters are pluggable, allowing us to insert any type and number of Filters into an RPC request.

The operation of a Filter is illustrated as follows:

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/framework/filter.png"/>

Some typical capabilities achievable through Filters include:
* Logging request parameters and response results to log files
* Adding authentication or verification logic for RPC requests
* Formatting request bodies or header parameters before sending or executing requests
* Compressing response results
* Collecting metrics on request data, such as call time, success, and failure counts
* Monitoring the number of concurrently executed requests to implement rate limiting and degradation capabilities

## Usage
As shown in the figure above, the Dubbo proxy automatically loads Filter implementations and assembles them into the call chain. Filter is a standard SPI definition, and the framework automatically loads Filter implementations based on certain activation rules.

```java
@SPI(scope = ExtensionScope.MODULE)
public interface Filter extends BaseFilter {}
```

The default activation status of a Filter can be set in the definition using the `@Activate` annotation, as shown in the following definition, which indicates that this Filter is automatically enabled when executing RPC requests on the provider side (not enabled on the consumer side). The `@Activate` annotation supports various conditional controls, including enabling it when a specific class is present in the classpath, or when certain parameter values are present in the URL, more details can be referenced in [SPI Extension Activate Introduction]().

```java
@Activate(group = PROVIDER)
public class AccessLogFilter implements Filter {}
```

### Disable Automatic Loading
To disable loading for a specific Filter without modifying its definition, you can use the following configurations.

Globally disable filters, so all RPC calls do not enable filters:
```yaml
dubbo:
  consumer:
    filter: "-accesslog,-tps"
```

Skip filter execution for a specific service call:
```java
@DubboReference(filter="-accesslog,-tps")
private DemoService demoService;
```

### Enable Automatic Loading
To enable loading for a specific Filter without modifying its definition, you can use the following configurations.

Globally enable filters, so all RPC calls will enable filters:
```yaml
dubbo:
  consumer:
    filter: "accesslog,tps"
```

Execute the specified filter for a specific service call:
```java
@DubboReference(filter="accesslog,tps")
private DemoService demoService;
```

## Built-in Implementations
The following are some built-in Filter implementations in the Dubbo framework, serving as underlying implementation principles for certain features, which most users typically do not need to be concerned about. They are listed here for reference, to help users understand how to enable certain specific functionalities and the working principles behind them:


## Specific Definitions
The following are details regarding the specific definitions and implementations of Filters, which can serve as references for users extending Filters.

### Filter Definition
The definition of Dubbo Filter is as follows:
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

Based on the above BaseFilter definition, Dubbo defines two SPI interfaces: ClusterFilter and Filter. The effects achievable by these two SPI implementations are essentially the same, but the reason for defining two is mainly for performance optimization. It is recommended that users focus on the Filter SPI and only consider ClusterFilter under strict performance requirements (such as a large number of cluster provider instances).

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/framework/cluster-filter.png"/>

```java
@SPI(scope = ExtensionScope.MODULE)
public interface Filter extends BaseFilter {}
```

```java
@SPI(scope = ExtensionScope.MODULE)
public interface ClusterFilter extends BaseFilter {}
```

### Extend Filter

Refer to [Usage Tutorial - Custom Extensions]() for specific examples.

