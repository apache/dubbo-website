---
type: docs
title: "Extensibility"
linkTitle: "Extensibility"
weight: 4
---

## Extended Design Ideas

Scalability is what any system pursues, and it is equally applicable to Dubbo.

### What is scalability

Scalability is a design concept that represents our vision for the future. We hope that based on the existing architecture or design, when some aspects change in the future, we can adapt to this with minimal changes. kind of change.

### Advantages of Scalability

The advantage of scalability is mainly manifested in the decoupling between modules, which conforms to the principle of opening and closing, which is open to expansion and closed to modification. When a new function is added to the system, there is no need to modify the structure and code of the existing system, just add an extension.

### Extended implementation

Generally speaking, the system will use Factory, IoC, OSGI, etc. to manage the extension (plug-in) life cycle. Considering the applicability of Dubbo, I don't want to strongly rely on IoC containers such as Spring.
And building a small IoC container by myself feels a bit over-designed, so choose the simplest Factory way to manage extensions (plug-ins). In Dubbo, all internal and third-party implementations are equal.

### Scalability in Dubbo

* Treat third-party implementations equally. In Dubbo, all internal implementations and third-party implementations are equal, and users can replace the native implementations provided by Dubbo based on their own business needs.
* Each extension point only encapsulates one change factor to maximize reuse. The implementers of each extension point often only care about one thing. If users need to expand, they only need to expand the extension points they care about, which greatly reduces the workload of users.

## Features of Dubbo extension

The extension capability in Dubbo is enhanced from the JDK standard SPI extension point discovery mechanism, which improves the following problems of the JDK standard SPI:

* The JDK standard SPI will instantiate all the implementations of the extension point at one time. If there is an extension implementation, it will take time to initialize, but if it is not used, it will be loaded, which will waste resources.
* If the extension point fails to load, even the name of the extension point cannot be obtained. For example: JDK standard ScriptEngine, get the name of the script type through getName(), but if RubyScriptEngine fails to load the RubyScriptEngine class because the jruby. When the user executes the ruby script, it will report that ruby is not supported, not the real reason for the failure.

Based on the expansion capabilities provided by Dubbo, users can easily expand other protocols, filters, routes, etc. based on their own needs. The following introduces the characteristics of Dubbo's extension capabilities.

* Load on demand. Dubbo's extension capability does not instantiate all implementations at once, but instantiates which extension class is used to reduce resource waste.
* Increase the IOC capability of the extended class. Dubbo's extension capability is not just to discover the extension service implementation class, but to go further on this basis. If the attributes of the extension class depend on other objects, Dubbo will automatically complete the injection function of the dependent object.
* Increase the AOP capability of extended classes. Dubbo's extension capability will automatically discover the wrapper class of the extension class, complete the construction of the wrapper class, and enhance the function of the extension class.
* Possess the ability to dynamically select the extension implementation. The Dubbo extension will dynamically select the corresponding extension class at runtime based on parameters, which improves Dubbo's scalability.
* The extension implementation can be sorted. The execution order of the extension implementation can be specified based on user requirements.
* Provides the Adaptive capability of the extension point. This capability enables some extension classes to take effect on the consumer side, and some extension classes to take effect on the provider side.

From the design goal of Dubbo extension, it can be seen that some features implemented by Dubbo, such as dynamic selection of extension implementation, IOC, AOP, etc., can provide users with very flexible expansion capabilities.

## Dubbo extension loading process

The whole process of Dubbo loading extension is as follows:

![//imgs/v3/concepts/extension-load.png](/imgs/v3/concepts/extension-load.png)

There are 4 main steps:
* Read and parse configuration files
* Cache all extension implementations
* Based on the extension name executed by the user, instantiate the corresponding extension implementation
* Perform IOC injection of extended instance attributes and instantiate extended wrapper classes to realize AOP features

## How to use Dubbo's extension capability to expand

The following takes the extension protocol as an example to illustrate how to use the extension capabilities provided by Dubbo to extend the Triple protocol.

(1) Place a text file in the protocol implementation jar package: META-INF/dubbo/org.apache.dubbo.remoting.api.WireProtocol
```text
tri=org.apache.dubbo.rpc.protocol.tri.TripleHttp2Protocol
```

(2) Implementation class content
```java
@Activate
public class TripleHttp2Protocol extends Http2WireProtocol {
     //...
}
```

Instructions: Http2WireProtocol implements the WireProtocol interface

(3) In the Dubbo configuration module, each extension point has a corresponding configuration attribute or label, and the configuration specifies which extension to use. for example:
```text
<dubbo:protocol name="tri" />
```

As can be seen from the above expansion steps, the user basically completes the expansion under the black box.

## Dubbo extended application

Dubbo's expansion capability is very flexible, and it is ubiquitous in the realization of its own functions.

![//imgs/v3/concepts/extension-use.png](/imgs/v3/concepts/extension-use.png)

Dubbo's extensibility makes it easy to divide the Dubbo project into sub-modules one by one to realize the hot-swappable feature. Users can completely replace Dubbo's native implementation based on their own needs to meet their own business needs.

## scenes to be used

* If you need to customize the load balancing strategy, you can use Dubbo's scalability.
* If you need to implement a custom registry, you can use Dubbo's extension capabilities.
* If you need to implement custom filters, you can use Dubbo's extension capabilities.

Dubbo extensions treat internal implementations and third-party implementations equally. For more usage scenarios, see [SPI extension implementation](/en/docs3-v2/java-sdk/reference-manual/spi/description/)