---
aliases:
    - /zh/overview/tasks/extensibility/
description: 演示 Dubbo 扩展能力特性的使用方式。
linkTitle: 自定义扩展
no_list: true
title: 自定义扩展
type: docs
weight: 7
---



## Dubbo 扩展设计理念

* 平等对待第三方的实现。在 Dubbo 中，所有内部实现和第三方实现都是平等的，用户可以基于自身业务需求，替换 Dubbo 提供的原生实现。
* 每个扩展点只封装一个变化因子，最大化复用。每个扩展点的实现者，往往都只是关心一件事。如果用户有需求需要进行扩展，那么只需要对其关注的扩展点进行扩展就好，极大的减少用户的工作量。

## 基于 Java SPI 的扩展能力设计

Dubbo 中的扩展能力是从 JDK 标准的 SPI 扩展点发现机制加强而来，它改进了 JDK 标准的 SPI 以下问题：

* JDK 标准的 SPI 会一次性实例化扩展点所有实现，如果有扩展实现初始化很耗时，但如果没用上也加载，会很浪费资源。
* 如果扩展点加载失败，连扩展点的名称都拿不到了。比如：JDK 标准的 ScriptEngine，通过 getName() 获取脚本类型的名称，但如果 RubyScriptEngine 因为所依赖的 jruby.jar 不存在，导致 RubyScriptEngine 类加载失败，这个失败原因被吃掉了，和 ruby 对应不起来，当用户执行 ruby 脚本时，会报不支持 ruby，而不是真正失败的原因。

用户能够基于 Dubbo 提供的扩展能力，很方便基于自身需求扩展其他协议、过滤器、路由等。下面介绍下 Dubbo 扩展能力的特性。

* 按需加载。Dubbo 的扩展能力不会一次性实例化所有实现，而是用哪个扩展类则实例化哪个扩展类，减少资源浪费。
* 增加扩展类的 IOC 能力。Dubbo 的扩展能力并不仅仅只是发现扩展服务实现类，而是在此基础上更进一步，如果该扩展类的属性依赖其他对象，则 Dubbo 会自动的完成该依赖对象的注入功能。
* 增加扩展类的 AOP 能力。Dubbo 扩展能力会自动的发现扩展类的包装类，完成包装类的构造，增强扩展类的功能。
* 具备动态选择扩展实现的能力。Dubbo 扩展会基于参数，在运行时动态选择对应的扩展类，提高了 Dubbo 的扩展能力。
* 可以对扩展实现进行排序。能够基于用户需求，指定扩展实现的执行顺序。
* 提供扩展点的 Adaptive 能力。该能力可以使的一些扩展类在 consumer 端生效，一些扩展类在 provider 端生效。

从 Dubbo 扩展的设计目标可以看出，Dubbo 实现的一些例如动态选择扩展实现、IOC、AOP 等特性，能够为用户提供非常灵活的扩展能力。

### 扩展点加载流程

Dubbo 加载扩展的整个流程如下：

![//imgs/v3/concepts/extension-load.png](/imgs/v3/concepts/extension-load.png)

主要步骤为 4 个：
* 读取并解析配置文件
* 缓存所有扩展实现
* 基于用户执行的扩展名，实例化对应的扩展实现
* 进行扩展实例属性的 IOC 注入以及实例化扩展的包装类，实现 AOP 特性

## 任务项

接下来，通过如下任务项分别来介绍 Dubbo 的扩展特性。

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./filter/" >}}'>自定义过滤器</a>
                </h4>
                <p>通过SPI机制动态加载自定义过滤器，可以对返回的结果进行统一的处理、验证等，减少对开发人员的打扰。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./router/" >}}'>自定义路由</a>
                </h4>
                <p>在服务调用的过程中根据实际使用场景自定义路由策略，可以有效的改善服务吞吐量和耗时。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./protocol/" >}}'>自定义协议</a>
                </h4>
                <p>针对不同的异构系统可以使用自定义传输协议，为系统之间的整合屏蔽了协议之间的差异。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./registry/" >}}'>自定义注册中心</a>
                </h4>
                <p>将不同注册中心中的服务都纳入到 Dubbo 体系中，自定义注册中心是打通异构服务体系之间的利刃。
                </p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
