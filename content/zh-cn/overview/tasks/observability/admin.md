---
type: docs
title: "使用 Admin 可视化查看集群状态"
linkTitle: "Admin"
description: ""
weight: 10
no_list: true
---

## 安装 Admin
前面章节我们提到 Dubbo 框架提供了极其丰富的服务治理的功能如流量控制、动态配置、服务 Mock、服务测试等功能，而 Dubbo Admin 的一部分重要作用在于将 dubbo 框架提供的服务治理能力提供一个开箱即用的可视化平台。本文将介绍 Dubbo Admin 所提供的功能，让大家快速了解和使用  Dubbo Admin 并对 Dubbo 所提供的服务治理能力有个更直观的了解。

## 功能介绍
### 服务查询
####

### 集群监控

### 测试开发

### 流量管控


## 服务详情
服务详情将以接口为维度展示 dubbo 服务所提供的服务信息，包含服务提供者、消费者信息和服务的元数据信息比如提供的方法名和参数列表。在最新版本支持了 dubbo 3.0 所提供的应用级发现模型，在注册来源用 应用级/接口级 进行区分。

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/54037/1676040566549-a86d770f-f68b-4eff-985f-a9f9dfb3b1e7.png#clientId=ua0e52c5a-90ba-4&from=paste&height=313&id=ufa5071bc&name=image.png&originHeight=625&originWidth=1366&originalType=binary&ratio=2&rotation=0&showTitle=false&size=89668&status=done&style=none&taskId=u57e7acb1-eacd-47f3-8832-7568a276e8b&title=&width=683)

## 动态路由
Dubbo Admin 提供了四种路由规则的支持，分别是条件路由规则、标签路由规则、动态配置规则、脚本路由规则，所提供的功能可以轻松实现黑白名单、灰度环境隔离、多套测试环境、金丝雀发布等服务治理诉求。接下来以条件路由为例，可以可视化的创建条件路由规则。
### 条件路由
条件路由可以编写一些自定义路由规则实现服务治理的需求比如黑白名单、读写分离等。路由规则在发起一次RPC调用前起到过滤目标服务器地址的作用，过滤后的地址列表，将作为消费端最终发起RPC调用的备选地址。
下图为一个简单的黑名单功能的实现，该路由规则的含义为禁止 IP 为 172.22.3.91 消费者调用服务 HelloService，条件路由规则的格式为：[服务消费者匹配条件] => [服务提供者匹配条件]。

![](https://cdn.nlark.com/yuque/0/2021/png/322496/1633616189318-eedce79c-9ca6-4482-afdf-bc7e6f148b2d.png?x-oss-process=image%2Fresize%2Cw_1500#from=url&id=AByCb&originHeight=1217&originWidth=1500&originalType=binary&ratio=2&rotation=0&showTitle=false&status=done&style=none&title=)

除此之外，前面【流量治理】一章中提到的所有路由规则及治理场景，都可以通过 Dubbo Admin 进行配置，包括标签路由规则、动态配置规则、脚本路由规则等。

## 接口文档管理
Dubbo Admin 提供的接口文档，相当于 swagger 对于 RESTful 风格的 Web 服务的作用。使用该功能可以有效的管理 Dubbo 接口文档。

![](https://cdn.nlark.com/yuque/0/2021/png/322496/1633620728988-59ecacd0-4171-43ca-bde8-435faadee920.png?x-oss-process=image%2Fresize%2Cw_1500#from=url&id=EOyuo&originHeight=1232&originWidth=1500&originalType=binary&ratio=2&rotation=0&showTitle=false&status=done&style=none&title=)
###


## 服务测试
服务测试相，主要用于模拟服务消费方，验证 Dubbo 服务的使用方式与正确性。

![](https://cdn.nlark.com/yuque/0/2021/png/322496/1633621211816-dfb051b5-6615-40ed-9eba-237799a495d6.png?x-oss-process=image%2Fresize%2Cw_1500#from=url&id=cnDoC&originHeight=884&originWidth=1500&originalType=binary&ratio=2&rotation=0&showTitle=false&status=done&style=none&title=)

## 服务Mock
服务Mock通过无代码嵌入的方式将Consumer对Provider的请求进行拦截，动态的对Consumer的请求进行放行或返回用户自定义的Mock数据。从而解决在前期开发过程中，Consumer所依赖的Provider未准备就绪时，造成Consumer开发方的阻塞问题。
只需要以下两步，即可享受服务Mock功能带来的便捷：

第一步：
Consumer应用引入服务Mock依赖，添加JVM启动参数-Denable.dubbo.admin.mock=true开启服务Mock功能。
```xml
<denpendency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>dubbo-mock-admin</artifactId>
  <version>${version}</version>
</denpendency>
```

第二步：在Dubbo Admin中配置对应的Mock数据。

![](https://cdn.nlark.com/yuque/0/2021/png/110282/1632723420774-ed8a4728-f082-4bea-9e78-92893a888700.png?x-oss-process=image%2Fresize%2Cw_1500#from=url&id=fCE5n&originHeight=669&originWidth=1500&originalType=binary&ratio=2&rotation=0&showTitle=false&status=done&style=none&title=)

## 服务统计
在这里可以可视化的查看 Dubbo 服务调用数据、单机指标、链路追踪以及集群总体运行情况等。
![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/54037/1676041705811-1b66af83-61f6-4fd0-8591-b838882ebd92.png#clientId=ua0e52c5a-90ba-4&from=paste&height=855&id=u5d1971ca&name=image.png&originHeight=1710&originWidth=2870&originalType=binary&ratio=2&rotation=0&showTitle=false&size=314603&status=done&style=none&taskId=u3b4937fc-89c4-4b53-8c24-063f51c217b&title=&width=1435)
## Kubernetes 与服务网格
在本书写作之际，Dubbo Admin 已经规划了对 Kubernetes 及服务网格体系的完善支持，可以到 Dubbo 官方网站了解当前进展情况。
