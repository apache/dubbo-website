---
aliases:
    - /zh/docs/migration/migration-and-compatibility-guide/
description: 快速了解 Dubbo3 的升级步骤与兼容性
linkTitle: 总结
title: 3.x 升级与兼容性指南
type: docs
weight: 1
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/2.x-to-3.x-compatibility-guide/)。
{{% /pageinfo %}}

**无需改动任何代码，直接升级到 Dubbo 3.0。**

在 3.0 版本的设计与开发之初，我们就定下了兼容老版本 Dubbo 用户（2.5、2.6、2.7）的目标。因此，往 3.0 版本的升级过程将会是完全透明的，用户无需做任何业务改造，升级 3.x 后的框架行为将保持与 2.x 版本完全一致。

```xml
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo</artifactId>
  <version>3.0.0</version>
</dependency>
```


但也要注意，透明升级仅仅是通往 3.0 的第一步，因为 "框架行为保持一致" 也就意味着用户将无法体验到 3.0 的新特性。**如果要启用 3.0 的带来的新特性，用户则需要进行一定的改造，我们称这个过程为迁移，这是一个按需开启的过程。**



因此，对老用户而言，有两条不同的迁移路径：

* **分两步走，先以兼容模式推动业务升级到 3.0 版本（无需改造），之后在某些时机按需启用新特性（按需改造）；**
* **升级与迁移同步完成，在业务升级到 3.0 版本的同时，完成改造并启用新特性；**



Dubbo 3.0 提供的新特性包括：

* **新的地址发现模型（应用级服务发现）。**
   * 查看[应用级服务发现的迁移步骤](../migration-service-discovery)
   * 查看应用级服务发现的使用方式
   * 查看应用级服务发现设计与实现。
* **下一代基于 HTTP/2 的 Triple 协议。**
   * 查看[Triple 协议迁移步骤](../migration-triple)
   * 查看 [Triple 协议使用方式](../../references/protocols/tri)
   * 查看 Triple 协议设计与实现。
* **统一的路由规则。**
   * 查看[统一路由规则的迁移步骤](../migration-routingrule/)
   * 查看[统一路由规则使用方式](../../references/routers/)
   * 查看统一路由规则设计与实现
