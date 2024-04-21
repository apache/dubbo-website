---
aliases:
    - /en/overview/tasks/extensibility/
description: Demonstrates how to use Dubbo's extensibility features.
linkTitle: Custom Extensions
no_list: true
title: Custom Extensions
type: docs
weight: 7
---

## Dubbo's Extensibility Design Philosophy

* Equality towards third-party implementations: In Dubbo, all internal and external implementations are treated equally. Users can replace Dubbo's native implementations based on their business requirements.
* Each extension point encapsulates only one variable factor for maximum reuse: The implementer of each extension point is often only concerned with one thing. If users need to extend functionality, they only need to extend the relevant extension points, significantly reducing the workload.

## Java SPI-based Extensibility Design

Dubbo's extensibility comes from an enhanced version of the JDK standard SPI (Service Provider Interface). It improves upon the following issues with the JDK's standard SPI:

* The standard SPI instantiates all extension points at once, wasting resources if some are not used.
* If extension point loading fails, even the name of the extension point cannot be retrieved.

Dubbo's extensibility features:

* On-demand loading: Dubbo doesn't instantiate all implementations at once, reducing resource waste.
* IOC (Inversion of Control) capabilities: Dubbo not only discovers extension service implementation classes but also automatically injects dependent objects into the extension class.
* AOP (Aspect-Oriented Programming) capabilities: Dubbo automatically discovers wrapper classes for extensions, constructing them to enhance extension functionality.
* Dynamic extension selection: Dubbo dynamically chooses the corresponding extension class based on parameters at runtime.
* Extension implementation sorting: Users can specify the execution order of extension implementations.
* Adaptive extension points: Extensions can be made effective on either the consumer or provider side.

### Extension Loading Process

Dubbo's extension loading process is as follows:

![//imgs/v3/concepts/extension-load.png](/imgs/v3/concepts/extension-load.png)

The main steps are:

* Read and parse the configuration file
* Cache all extension implementations
* Instantiate the corresponding extension implementation based on the user-executed extension name
* Perform IOC injection for extension instance attributes and instantiate extension wrapper classes for AOP features

## Task Items

Next, let's introduce Dubbo's extensibility features through the following task items.

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./filter/" >}}'>Custom Filters</a>
                </h4>
                <p>Dynamically load custom filters through the SPI mechanism to uniformly handle, validate returned results, and minimize developer interruptions.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./router/" >}}'>Custom Routing</a>
                </h4>
                <p>Customize routing strategies during service invocation based on actual use-cases to effectively improve service throughput and latency.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./protocol/" >}}'>Custom Protocols</a>
                </h4>
                <p>Use custom transport protocols for different heterogeneous systems to eliminate the differences between protocols and facilitate system integration.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./registry/" >}}'>Custom Registry Centers</a>
                </h4>
                <p>Include services from different registry centers into the Dubbo ecosystem. Customizing registry centers is a key to bridging different service ecosystems.</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}

Dubbo's extensibility design aims to provide users with a highly flexible extension mechanism, offering features like dynamic extension selection, IOC, and AOP. This makes it easier to adapt Dubbo to various scenarios and integrate it into different technology stacks.