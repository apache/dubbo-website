---
title: 与 Dubbo Admin 配合使用路由规则
description: 通过 Dubbo Admin 下发条件路由和标签路由时，Dubbo-go 的版本选择与配置中心对齐方式
type: docs
weight: 2
---

通过 Dubbo Admin 下发条件路由或标签路由时，规则能否在 Dubbo-go 中生效，取决于两件事：SDK 版本是否包含相关修复，以及 Dubbo-go 是否从 Admin 写入的位置读取规则。

## 版本选择

| Dubbo-go 版本 | `configVersion` 低于 v3.1 的条件路由 | 标签路由 |
|---|---|---|
| v3.3.0、v3.3.1 | `enabled` 与 `force` 被互换解析；省略 `enabled` 时 panic | 首次未命中缓存时找不到规则 |
| v3.3.2 | 同上 | 已修复 |

- 标签路由：使用 v3.3.2 及以上版本。
- 条件路由：`configVersion: v3.1` 的规则不受上述问题影响。旧格式（v3.0）规则的上述问题已在 `develop` 分支修正（字段互换见 [dubbo-go #3773](https://github.com/apache/dubbo-go/pull/3773)），尚未包含在正式发布版本中。在此之前，建议使用 v3.1 格式的规则。

## 配置中心对齐

Dubbo Admin 和 Dubbo-go 需要读写同一个位置，仅连接同一个配置中心是不够的。

**Nacos**：Admin 以规则名作为 data ID，写入 group `dubbo`。Dubbo-go 需要将 `config-center.group` 设为 `dubbo`，而不是默认的 `DEFAULT_GROUP`。

**ZooKeeper**：Admin 将规则写入 `/dubbo/config/<规则名>`，而 Dubbo-go 默认读取 `/dubbo/config/dubbo/<规则名>`，两者不一致（见 [dubbo-admin #1625](https://github.com/apache/dubbo-admin/issues/1625)）。需要显式配置：

```yaml
dubbo:
  config-center:
    protocol: zookeeper
    address: 127.0.0.1:2181
    namespace: config
    params:
      dubbo.config-center.root-path: /dubbo
```

规则名的格式：

- 应用级条件路由：`<应用名>.condition-router`
- 服务级条件路由：`<接口名>:<版本>:<分组>.condition-router`
- 标签路由：`<provider 应用名>.tag-router`

## 规则的更新与删除

规则的更新、禁用和删除依赖配置中心的监听事件。请使用以下版本或更高版本：

- `nacos-sdk-go/v2` v2.3.5
- `dubbogo/gost` v1.15.0

更早的组合（如 `nacos-sdk-go/v2` v2.2.5 与 `gost` v1.14.5）可能收不到删除或更新事件。相关修复见 [dubbo-go #3771](https://github.com/apache/dubbo-go/pull/3771) 和 [gost #155](https://github.com/dubbogo/gost/pull/155)。

## 禁用标签路由

较早版本的 Admin 在禁用标签规则时不写 `enabled: false` 字段，而 Dubbo-go 会把缺省的 `enabled` 当作 `true`，导致规则无法禁用。[dubbo-admin #1595](https://github.com/apache/dubbo-admin/pull/1595) 已改为显式写出该字段，请确认所用的 Admin 包含此修复。

## 参考

相关回归测试与验证记录见 [dubbo-go #3799](https://github.com/apache/dubbo-go/pull/3799)。
