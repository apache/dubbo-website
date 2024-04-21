---
description: ""
linkTitle: 服务Mock
no_list: true
title: Admin 服务 Mock 功能简介
type: docs
weight: 4
working_in_progress: true
---

Mock 功能是设计用来提升微服务研发与测试效率的，它可以短路 Consumer 侧发起的远程调用，提前返回预先设定好的 Mock 值，这样即使在没有 Provider 可用的情况下，消费端也能正常的推进开发、测试进程。除此之外，mock 也可用于快速模拟负责返回值的测试数据、模拟服务端异常等场景

需要注意的是，Mock 能力仅限用于测试环境，应避免将其用于生产环境。

# 设计背景
在跨团队或是多应用开发时，在前期开发中往往会出现依赖的服务还未开发完成的情况，这样就会导致流程的阻塞，影响研发效率。基于这种情况，Dubbo Admin 提供了 mock 能力来解耦 Consumer 与 Provider 之间的依赖，以确保在 Provider 未就绪的情况下 Consumer 仍能正常开展测试，提高研发效率。

Dubbo 框架本身设计有服务降级（有时也称为 mock）能力，通过配置 `org.apache.dubbo.config.ReferenceConfig` 的 mock 字段（可设置为true或是对应接口的Mock实现）或动态配置规则，此时就可以启动服务降级能力。这种服务降级能力是为生产环境的限流降级准备的，虽然也可以用于本地开发测试场景，但灵活度并不高，基于提升开发效率的根本诉求，我们设计了基于 Admin 的服务降级能力。

Dubbo Admin 服务 mock 是一种更为轻量和便捷实现方式，主要用于开发测试阶段的，目标是提升微服务场景下的整体研发效率。需求详见：[Dubbo Admin Mock需求](https://github.com/apache/dubbo-admin/issues/757)。

## 架构设计

![admin-mock-architecture.png](/imgs/v3/reference/admin/console/mock-architecture.png)

**实现 Mock 能力，Dubbo 框架与 Admin 侧要支持的能力**

* Dubbo Admin
    * 规则管理
        * 规则新增
        * 规则查询
        * 规则修改
        * 规则删除
    * 请求历史记录
    * Mock 请求数据查询
    * MockService Provider
        * 根据规则生成 Mock 数据
        * 响应 Consumer Mock 请求
        * 保存请求和返回数据
* Dubbo
    * 根据 mock 开关配置，转发请求到 Admin 注册的 MockService
    * 处理 mock 返回值并转换为匹配方法签名的强类型数据

**Mock 请求原理时序图**

![admin-mock-workflow.png](/imgs/v3/reference/admin/console/mock-workflow.png)

## 使用方式

1. 在 Consumer 应用中添加依赖

    开启 Mock 前，请确保在消费端应用中引入以下依赖：

    ```xml
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-mock-admin</artifactId>
      <version>${version}</version>
    </dependency>
    ```

    > 查看 [dubbo-mock-admin 的可用版本](/zh-cn/download/spi-extensions/)

2. 配置 `-Denable.dubbo.admin.mock=true` 参数开启 Mock 并重启进程
3. 打开 Admin 配置 Mock 规则

    用户可以通过在控制台上指定需要被 mock 的消费端IP、服务名和方法和具体的 mock 行为，实现对调用结果的 mock。

    ![admin-mock](/imgs/v3/reference/admin/console/mock-rule-screenshot.png)

    一些支持的规则类型与示例

    ```
    数字类型：123

    字符串："hello, world!"

    数组、列表：[1, 2, 3]

    枚举："ENUM_TYPE"

    Map、对象：
      {
        "prop1": "value1",
        "prop2": ["a", "b", "c"]
      }

    null: null
    ```

4. 此时，消费端再次发起远程调用，就会得到预期 Mock 返回值。

    > 注意事项
    > 1. Mock 仅限用于测试开发环境，因此为了确保核心依赖的稳定性，社区没有将 mock 组件打包在核心框架包中，用户可以自行决策是否将其作为应用的默认依赖在公司内推广
    > 2. 即使添加了 mock 二进制依赖，mock 功能也不会默认开启，需要设置 `-Denable.dubbo.admin.mock=true` 后才能开启。

## 实现原理

Consumer 调用发起的调用会被本地的 MockServiceFilter 拦截，如果 mock 开关开启，则 MockServiceFilter 将请求转发到 MockService (由 Dubbo Admin 发布的服务)，MockService 根据请求的服务、方法等查询用户预先配置的 mock 规则，如果查询到则返回规则中的 mock 值，Consumer 收到 mock 值后调用成功返回。

### Mock 返回值如何定义？

当前 Admin 支持录入 JSON 或者基本类型数据，如：

* 返回数字值 (当方法签名返回值是数字类型)

```
123
```

* 返回字符串 (当方法签名返回值是字符串类型)
```
"hello, world!"
```

* 返回 JSON (当方法签名返回值是 Map 或对象类型)
```
{
    "prop1": "value1",
    "prop2": ["a", "b", "c"]
}
```

* 返回数组 (当方法签名返回值是数组或列表)
```
[1, 2, 3]
```

### 消费端如何发起 MockService 调用？

`dubbo-mock-admin` 将为消费端引入 MockServiceFilter 请求拦截器，如果用户打开 mock 开关，那么 Filter 会将请求转发到 Admin MockService 服务。

### Mock 值如何转换为原始类型值？

MockService 支持返回标准 JSON 格式或者基本类型数据，消费端会基于 Dubbo 内置类型转换器将 JSON 等值转为原始对象类型。

### 未来优化点
* 保存 Mock 开关到配置中心，用户可以通过 Admin 动态控制开关。
* 开启 Mysql 数据库链接池

### 表结构设计
Admin 依赖 Mysql 数据库存储用户配置的 mock 规则，具体的表结构设计如下。

#### Mock Rule

```sql
CREATE TABLE `mock_rule` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `service_name` varchar(255) DEFAULT NULL COMMENT '服务名',
  `method_name` varchar(255) DEFAULT NULL COMMENT '方法名',
  `rule` text NULL DEFAULT COMMENT '规则',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='服务mock方法表';
```
#### Mock Log

```sql
CREATE TABLE `mock_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `method_id` int(11) DEFAULT NULL COMMENT '规则id',
  `request` text COMMENT '请求数据',
  `response` text COMMENT '返回值',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='mock请求记录表';
```




