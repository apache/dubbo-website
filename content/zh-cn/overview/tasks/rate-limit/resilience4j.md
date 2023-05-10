---
description: "使用 Resilience4j 断路器、限流器、重试、隔离机制保护 Dubbo 应用"
linkTitle: Resilience4j
title: Resilience4j
type: docs
weight: 3
---

Resilience4j 提供了一组高阶函数（装饰器），包括断路器，限流器，重试，隔离，可以对任何的函数式接口，lambda表达式，或方法的引用进行增强，并且这些装饰器可以进行叠加。这样做的好处是，你可以根据需要选择特定的装饰器进行组合。

关于 Resilience4j 与 Dubbo 集成的使用示例请参见 [dubbo-samples-resilience4j](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-resilience4j)