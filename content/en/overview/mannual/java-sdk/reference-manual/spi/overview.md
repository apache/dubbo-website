---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/overview/
    - /en/docs3-v2/java-sdk/reference-manual/spi/overview/
description: Dubbo provides very flexible extensibility through the SPI mechanism
linkTitle: SPI Overview
title: Dubbo SPI Overview
type: docs
weight: 1
---

Using IoC containers to help manage the lifecycle of components, dependency injection, etc., is a common design in many development frameworks. Dubbo has a lightweight version of an IoC container built in, used to manage plugins within the framework, achieving capabilities such as plugin instantiation, lifecycle management, and automatic dependency injection.

Readers interested may learn about:
* [How the Dubbo SPI Extension System Works](/en/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/)
* [Examples of Using Dubbo SPI Extensions](/en/overview/mannual/java-sdk/tasks/extensibility/spi/)

The Dubbo plugin system and IoC container have the following characteristics:
* **[Core components are defined as plugins](../spi-list/), making it very easy for users or secondary developers to expand.** Users can extend strategies like load balancing, registration centers, communication protocols, routing, etc., based on their needs without modifying the framework kernel.
* **Treating third-party extensions equally.** All internal and third-party implementations in Dubbo are treated the same, allowing users to replace the native implementations provided by Dubbo according to their business needs.
* **[Plugin dependencies support automatic injection (IoC)](/en/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/).** If a plugin implementation depends on other plugin properties, the Dubbo framework will automatically inject that dependent object, supporting methods like properties and constructors.
* **[Plugin extension implementations support AOP capabilities](/en/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/).** The framework can automatically discover wrapper classes for extension classes and enhance the plugin using AOP through the wrapper pattern.
* **[Automatic plugin activation is supported](/en/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/).** By specifying activation conditions for plugin implementations (through annotation parameters, etc.), the framework can automatically decide whether to activate that plugin implementation based on the current context at runtime.
* **[Support for plugin extension sorting](/en/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/).**

