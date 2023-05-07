---
aliases:
    - /zh/overview/tasks/traffic-management/isolation/
description: ""
linkTitle: 环境隔离
title: 通过标签实现流量隔离环境（灰度、多套开发环境等）
type: docs
weight: 5
---



无论是在日常开发测试环境，还是在预发生产环境，我们经常都会遇到流量隔离环境的需求。
* 在日常开发中，为了避免开发测试过程中互相干扰，我们有搭建多套独立测试环境的需求，但通过搭建物理集群的方式成本非常高且不够灵活
* 在生产发布过程中，为了保障新版本得到充分的验证，我们需要搭建一套完全隔离的线上灰度环境用来部署新版本服务，线上灰度环境能完全模拟生产运行情况，但只有固定的带有特定标记的线上流量会被导流到灰度环境，充分验证新版本的同时将线上变更风险降到最低。

利用 Dubbo 提供的标签路由能力，可以非常灵活的实现流量隔离能力。可以单独为集群中的某一个或多个应用划分隔离环境，也可以为整个微服务集群划分隔离环境；可以在部署态静态的标记隔离环境，也可以在运行态通过规则动态的隔离出一部分机器环境。

> 注意：标签路由是一套严格隔离的流量体系，对于同一个应用而言，一旦打了标签则这部分地址子集就被隔离出来，只有带有对应标签的请求流量可以访问这个地址子集，这部分地址不再接收没有标签或者具有不同标签的流量。举个例子，如果我们将一个应用进行打标，打标后划分为 tag-a、tag-b、无 tag 三个地址子集，则访问这个应用的流量，要么路由到 tag-a (当请求上下文 dubbo.tag=tag-a)，要么路由到 tag-b (dubbo.tag=tag-b)，或者路由到无 tag 的地址子集 (dubbo.tag 未设置)，不会出现混调的情况。

## 开始之前

* [部署 Shop 商城项目](../#部署商场系统)
* 部署并打开 [Dubbo Admin](../.././../reference/admin/architecture/)

## 任务详情

我们决定为商城系统建立一套完整的线上灰度验证环境，灰度环境和线上环境共享一套物理集群，需要我们通过 Dubbo 标签路由从逻辑上完全隔离出一套环境，做到灰度流量和线上流量互不干扰。

![gray1](/imgs/v3/tasks/gray/gray1.png)

### 为商城搭建一套完全隔离的灰度环境
首先，为 User、Detail、Comment、Order 几个应用都部署灰度环境实例，我们为这部分实例都带有 `env=gray` 的环境标。部署可以通过以下命令快速完成

```sh
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/10-task/dubbo-samples-shop/deploy/Gray.yml
```

接下来，我们开始为几个应用分别增加标签规则，将刚刚部署的实例从普通流量实例隔离出来。

#### 操作步骤

1. 打开 Dubbo Admin 控制台
2. 在左侧导航栏选择【服务治理】>【标签路由】
3. 点击 "创建"，输入 `shop-detail` 和流量隔离条件保存即可；重复为 `shop-comment`、`shop-order` 创建相同的隔离规则。

![Admin 灰度隔离环境设置截图](/imgs/v3/tasks/gray/gray_admin.png)

以上规则为每个应用隔离出了一套独立的灰度环境，所有带有 `env=gray` 的标签都属于灰度环境。等待一小会确保规则下发完成，接下来就可以验证灰度流量在隔离环境中运行。

为了模拟灰度流量，我们为商城示例首页设置了一个 `Login To Gray` 的入口来模拟从灰度环境进入商城的流量，在真实环境中这可以通过在入口网关根据某些规则识别流量并自动打标实现。

![gray2](/imgs/v3/tasks/gray/gray2.png)

通过 `Login To Gray` 登录后，之后所有请求 Detail、Comment、Order、User 服务的流量都会自动带有 `dubbo.tag=gray` 的标识，Dubbo 标签路由组件会识别这个标识，并将流量路由到刚才圈定的灰度环境（即所有 `env=gray` 的实例）。系统运行效果如下：

![Admin 灰度隔离环境设置截图](/imgs/v3/tasks/gray/gray3.png)

#### 规则详解

我们需要通过 Admin 为 `shop-detail`、`shop-comment`、`shop-order`、`shop-user` 四个应用分别设置标签归组规则，以 `shop-detail` 为例：

**规则 key** ：`shop-detail`

**规则体**

```yaml
configVersion: v3.0
force: true
enabled: true
key: shop-detail
tags:
  - name: gray
    match:
      - key: env
        value:
          exact: gray
```

其中，`name` 为灰度环境的流量匹配条件，只有请求上下文中带有 `dubbo.tag=gray` 的流量才会被转发到隔离环境地址子集。请求上下文可通过 `RpcContext.getClientAttachment().setAttachment("dubbo.tag", "gray")` 传递。

```yaml
name: gray
```

`match` 指定了地址子集筛选条件，示例中我们匹配了所有地址 URL 中带有 `env=gray` 标签的地址列表（商城示例中 v2 版本部署的实例都带已经被打上这个标签）。

```yaml
match:
  - key: env
    value:
      exact: gray
```

`force` 指定了是否允许流量跳出灰度隔离环境，这决定了某个服务发现灰度隔离环境没有可用地址时的行为，默认值为 `false` 表示会 fallback 到不属于任何隔离环境 (不带标签) 的普通地址集（不会 fallback 到任何已经归属其他隔离环境的 ip 地址）。示例中设置 `froce: true` 表示当灰度环境地址子集为空时，服务调用失败（No provider exception）。

```yaml
force: true
```

## 清理

为了不影响其他任务效果，通过 Admin 删除或者禁用刚刚配置的流量隔离规则。

## 其他事项

除了示例中演示的动态环境划分，也可以在部署态指定实例所属流量标签（通过一个特殊的 key `dubbo.provider.tag` 实现），这样当实例启动成功后就已经被自动圈定在某个流量环境，具体配置方式可参见 [标签路由](/zh-cn/overview/core-features/traffic/tag-rule/) 说明。

通常，`dubbo.tag` 流量标的传递需要依赖全链路追踪工具的帮助，Dubbo 只会负责 A-B 的点对点标签传递，示例中也是通过在每次点对点 RPC 调用前重复设置达成的传递效果，在实践中，全链路灰度往往从 tag 设置进全链路上下文后自动启动，我们只需要扩展 Dubbo Filter 将全链路工具上下文中的 tag 标签读取并设置进 Dubbo 上下文即可实现全链路在 Dubbo 中的自动传递，具体可参见 [Dubbo 链路追踪集成示例](../../observability)。另外，除了 RPC 调用，在微服务体系的其他基础产品中也需要依赖全链路上下文保证灰度标识的传递，以保证完整的流量隔离环境。
