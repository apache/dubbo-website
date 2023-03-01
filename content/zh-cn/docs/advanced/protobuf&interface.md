---
aliases:
    - /zh/docs/advanced/protobuf&interface/
description: 本文对比了Protobuf和Interface这2种IDL的差异，帮助Dubbo协议开发者了解Protobuf，为后续转到Triple协议和Grpc协议做铺垫。
linkTitle: Protobuf vs Interface
title: Protobuf与Interface对比
type: docs
weight: 100
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/protobufinterface/)。
{{% /pageinfo %}}

# Protobuf与Interface这2种IDL的差异

## 1. 数据类型

### 1.1. 基本类型

| ptoto类型  | java类型 | 
| ---- | ---- |
double | double
float | float 
int32 | int
int64 | long
uint32 | int[注]
uint64 | long[注]
sint32 | int
sint64 | long
fixed32 | int[注]
fixed64 | long[注]
sfixed32 |  int
sfixed64 | long
bool | boolean
string | String
bytes | ByteString

> [注]在Java中，无符号的32位和64位整数使用它们的有符号对数来表示，顶部位只存储在符号位中。
### 1.2. 复合类型

#### 1.2.1. 枚举

* 原始pb代码

```java.
enum TrafficLightColor {
    TRAFFIC_LIGHT_COLOR_INVALID = 0;
    TRAFFIC_LIGHT_COLOR_UNSET = 1;
    TRAFFIC_LIGHT_COLOR_GREEN = 2;
    TRAFFIC_LIGHT_COLOR_YELLOW = 3;
    TRAFFIC_LIGHT_COLOR_RED = 4;
}
```

* 生成的java代码

![image](/imgs/docs/advanced/protobufinterface/124234531-b96c2c80-db46-11eb-8155-a77dbe059f07.png)

> 枚举是常量，因此采用大写
### 1.2.2. 数组

* 原始pb代码

```java
message VipIDToRidReq {
    repeated uint32 vipID = 1;
}
```

* 生成的java代码

![image](/imgs/docs/advanced/protobufinterface/124234564-c4bf5800-db46-11eb-94fc-a056af6089cb.png)

> 底层实际上是1个ArrayList
### 2.2.3. 集合

PB不支持无序、不重复的集合，只能 ``借用数组实现``，需要 ``自行去重``。

### 2.2.4. 字典

* 原始pb代码

```java
message BatchOnlineRes {
    map<uint32, uint32> onlineMap = 1;//在线状态
}
```

* 生成的java代码

![image](/imgs/docs/advanced/protobufinterface/124234654-e4568080-db46-11eb-9700-b30022ebee21.png)

### 2.2.5. 嵌套

* 原始pb代码

```java
message BatchAnchorInfoRes {
    map<uint32, AnchorInfo> list = 1; //用户信息map列表
}
/*
* 对应接口的功能: 批量或单个获取用户信息
*/
message AnchorInfo {
    uint32 ownerUid = 1 [json_name="uid"]; //用户id
    string nickName = 2 [json_name="nn"]; //用户昵称
    string smallAvatar = 3 [json_name="savt"]; //用户头像全路径-小
    string middleAvatar = 4 [json_name="mavt"]; //用户头像全路径-中
    string bigAvatar = 5 [json_name="bavt"]; //用户头像全路径-大
    string avatar = 6 [json_name="avt"]; //用户头像
}
```

* 生成的java代码

![image](/imgs/docs/advanced/protobufinterface/124234723-f89a7d80-db46-11eb-82d0-a8aee5322098.png)

## 3. 字段默认值

* 对于字符串，默认值为空字符串。
* 对于字节，默认值为空字节。
* 对于bools，默认值为false。
* 对于数字类型，默认值为零。
* 对于枚举，默认值为第一个定义的枚举值，它必须为0。
* 对于消息字段，未设置字段。 它的确切值是语言相关的。 有关详细信息，请参阅生成的代码指南。

## 4. 整体结构

|  Feature  |  Java Interface   | Protobuf  | 备注  |
|  ----  | ----  | ----  | ----  |
| 方法重载  | √ | × |  |
| 泛型/模板化  | √ | × |  |
| 方法继承  | √ | × |  |
| 嵌套定义  | √ | 部分支持 | PB仅支持message和enum嵌套 |
| import文件  | √ | √  |  |
| 字段为null  | √ | × |  |
| 多个入参  | √ | × | PB仅支持单入参 |
| 0个入参  | √ | × | PB必须有入参 |
| 0个出参  | √ | × | PB必须有出参 |
| 入参/出参为抽象类  | √ | × | PB的入参/出参必须为具象类 |
| 入参/出参为接口  | √ | × | PB的入参/出参必须为具象类 |
| 入参/出参为基础类型  | √ | × | PB的入参/出参必须为结构体 |

## 5. 社区资料
* 社区主页地址：https://developers.google.cn/protocol-buffers/
* 社区开源地址：https://github.com/google/protobuf
* 相关jar的maven：https://search.maven.org/search?q=com.google.protobuf
