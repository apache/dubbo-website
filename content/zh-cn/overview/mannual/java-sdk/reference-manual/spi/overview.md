---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/overview/
description: Dubbo 通过 SPI 机制提供了非常灵活的可扩展性
linkTitle: SPI 概述
title: Dubbo SPI 概述
type: docs
weight: 1
---

使用 IoC 容器帮助管理组件的生命周期、依赖关系注入等是很多开发框架的常用设计，Dubbo 中内置了一个轻量版本的 IoC 容器，用来管理框架内部的插件，实现包括插件实例化、生命周期、依赖关系自动注入等能力。

感兴趣的读者可以了解：
* [Dubbo SPI 扩展体系的工作原理](/zh-cn/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/)
* [Dubbo SPI 扩展使用示例](/zh-cn/overview/mannual/java-sdk/tasks/extensibility/spi/)

Dubbo 插件体系与 IoC 容器具有以下特点：
* **[核心组件均被定义为插件](../spi-list/)，用户或二次开发者扩展非常简单。** 在无需改造框架内核的情况下，用户可以基于自身需求扩展如负载均衡、注册中心、通信协议、路由等策略。
* **平等对待第三方扩展实现。** Dubbo 中所有内部实现和第三方实现都是平等的，用户可以基于自身业务需求替换 Dubbo 提供的原生实现。
* **[插件依赖支持自动注入（IoC）](/zh-cn/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/#23-ioc-机制)。** 如果插件实现依赖其他插件属性，则 Dubbo 框架会完成该依赖对象的自动注入，支持属性、构造函数等方式。
* **[插件扩展实现支持 AOP 能力](/zh-cn/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/#24-aop-机制)。** 框架可以自动发现扩展类的包装类，通过包装器模式对插件进行 AOP 增强。
* **[支持插件自动激活](/zh-cn/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/#25-activate激活条件)。** 通过为插件实现指定激活条件（通过注解参数等），框架可在运行时自动根据当前上下文决策是否激活该插件实现。
* **[支持插件扩展排序](/zh-cn/overview/mannual/java-sdk/reference-manual/architecture/dubbo-spi/#26-扩展点排序)。**

