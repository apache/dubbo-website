---
aliases:
  - /zh/docs3-v2/dubbo-go-pixiu/user/samples/dubbo/dubbo-incomplete
  - /zh-cn/docs3-v2/dubbo-go-pixiu/user/samples/dubbo/dubbo-incomplete
  - /zh-cn/overview/reference/pixiu/user/samples/dubbo/dubbo-incomplete
  - /zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/dubbo/dubbo-incomplete
description: Dubbo 数据不完整
linkTitle: Dubbo 数据不完整
title: Dubbo 数据不完整
type: docs
weight: 10
---

# Dubbo 响应数据不完整


## 参数为空场景（Args will nil）

> 已在 dubbogo 1.5.4 版本中修复

当接口响应数据类型为 User 时，其结构体定义如下：

```go
type User struct {
	ID   string
	Name string
	Age  int32
	Time time.Time
}
```
尽管 User 结构体中包含 Time 字段，但通过通用调用（generic invoke）返回的该字段值会为空（nil）。[简单响应](dubbo-query.md#简单示例simple)中 ，time 字段会直接缺失。

因此建议你短期内可将 time 类型改为 string 类型，以规避该问题。
