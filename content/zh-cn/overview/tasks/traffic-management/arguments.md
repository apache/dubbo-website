---
aliases:
    - /zh/overview/tasks/traffic-management/arguments/
description: ""
linkTitle: 参数路由
title: 根据请求参数引导流量分布
type: docs
weight: 6
---



根据请求参数值转发流量，是一种非常灵活且实用的流量管控策略。比如微服务实践中，根据参数（如用户 ID）路由流量，将一小部分用户请求转发到最新发布的产品版本，以验证新版本的稳定性、获取用户的产品体验反馈等，是生产实践中常用的一种有效的灰度机制。

或者，有些产品提供差异化的付费服务，需要根据请求参数中的用户 ID 将请求路由到具有不同服务等级保障的集群，就像接下来我们在示例任务中所做的那样。

## 开始之前

* [部署 Shop 商城项目](../#部署商场系统)
* 部署并打开 [Dubbo Admin](../.././../reference/admin/architecture/)

## 任务详情

为了增加用户粘性，我们为商城示例系统新增了 VIP 用户服务，现在商城有两类用户：普通用户和 VIP 用户，其中 VIP 用户可以看到比普通用户更低的商品价格。

回到商城登录页面，我们以 VIP 用户 `dubbo` 登录系统，是否看到如下图所示的 VIP 专属商品价格，多刷新几次商品页面那？

![arguments1](/imgs/v3/tasks/arguments/arguments1.png)

哦，是不是价格忽高忽低？！这是因为在当前部署的示例系统中，只有 detail v2 版本才能识别 VIP 用户并提供特价服务，因此，我们要确保 `dubbo` 用户始终访问 detail v2 实例，以便享受稳定的 VIP 服务。

![arguments2](/imgs/v3/tasks/arguments/arguments2.png)

### 为 VIP 用户提供稳定的特价商品服务

Detail v2 版本能够识别 VIP 用户并在商品详情中展示特价。商品详情服务由 Detail 应用中的 `org.apache.dubbo.samples.DetailService` 服务提供，`DetailService` 显示商品详情的 `getItem` 方法定义如下，第二个参数为用户名。

```java
public interface DetailService {
    Item getItem(long sku, String username);
}
```

因此，接下来我们就为 `DetailService` 服务的 `getItem` 方法增加参数路由规则，如果用户参数是 `dubbo` 就转发到 v2 版本的服务。

#### 操作步骤
1. 打开 Dubbo Admin 控制台
2. 在左侧导航栏选择【服务治理】 > 【参数路由】
3. 点击 "创建" 按钮，输入。

![Admin 参数路由设置截图](/imgs/v3/tasks/arguments/arguments_admin.png)

方法参数的索引从 `0` 开始，我们上面填入 `1` 表示根据第二个参数进行流量转发。

#### 规则详解

**规则 key** ：`org.apache.dubbo.samples.DetailService`

**规则体**
```yaml
configVersion: v3.0
key: org.apache.dubbo.samples.DetailService
scope: service
force: false
enabled: true
priority: 1
conditions:
  - method=getItem & arguments[1]=dubbo => detailVersion=v2
```

* `method=getItem & arguments[1]=dubbo` 表示流量规则匹配 `getItem` 方法调用的第二个参数，当参数值为 `dubbo` 时做进一步的地址子集筛选。
* `detailVersion=v2` 将过滤出所有带有 `detailVersion=v2` 标识的 URL 地址子集（在示例部署中，我们所有 detail v2 的实例都已经打上了 `detailVersion=v2` 标签）。

```yaml
conditions:
  - method=getItem & arguments[1]=dubbo => detailVersion=v2
```

`force: false` 表示如果没有 `detailVersion=v2` 的地址，则随机访问所有可用地址。

## 其他事项
本示例只是 Dubbo 条件路由的一种使用场景，除了根据方法名、参数匹配进行流量转发，条件路由还可以根据附加参数 Attachments、URL 中的数据等进行流量转发，同时匹配条件也支持范围、通配符等，比如：
* attachments[key]=hello*
* arguments[0]=1~100
* url_key=value

更为灵活的是，条件路由的匹配条件支持扩展，用户可以自定义匹配条件的来源和格式，具体可参见 [条件路由规则说明](/zh-cn/overview/core-features/traffic/condition-rule/)。
