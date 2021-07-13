---
title: "Protobuf使用规范"
linkTitle: "Protobuf使用规范"
weight: 100
description: >-
     结合实践经验总结了一份Protobuf使用范围，希望能够帮助大家避免踩坑。
---

# Protobuf使用规范

## 1. 语法层规范

* 采用proto3，不要用proto2。

* 声明 option java_multiple_files = true，以生成多个类文件，避免Stub类过大。

* 枚举类型，第一个字段的序号必须为 0。

* 枚举类型，成员名字必须在当前proto文件中唯一，不能和其它枚举类型的成员重名。

* 枚举类型，成员变量必须采取全大写命名，以避免和语言本地关键字冲突。

## 2. 设计规范

* 避免把服务端（provider）的 Exception/panic 抛到客户端（consumer），建议用错误码枚举表示错误。

* pb文件 发布出去 后，就 不能再修改，只能通过新增来修正问题，否则会破坏兼容性，具体约定：
    * 不能改属性的序号，只能往后加；
    * 不能改属性的类型和名字；
    * 不能删除属性。

* 编写Protobuf文档时，应当预留好默认值，并且在该文档的注释中讲清楚，这是因为proto3要求每个字段必须有默认值。

```java
//正例：
message QueryFollowListReq {
  //【必填】分类id（服务端/客户端自行验证）
  string cid = 1;
  //【可选】每页条数，默认值20
  uint32 limit = 2;
  //【可选】开始位置，基数为0默认值为0
  uint32 offset = 3;
  //其他业务字段
}

// 反例：proto3语法上已经【移除了require】，就算是pb能够校验，它也无法响应有效的错误码，因此不合规
message QueryFollowListReq {
  required string cid = 1;
  singular uint32 limit = 2;
  singular uint32 offset = 3;
  //其他业务字段
}
```
