---
type: docs
title: "Comparison of Protobuf and Interface"
linkTitle: "Protobuf vs Interface"
weight: 100
description: >-
  This article compares the differences between the two IDLs, Protobuf and Interface, to help Dubbo protocol developers understand Protobuf, and pave the way for the subsequent transfer to Triple protocol and Grpc protocol.
---

## 1. Data type

### 1.1. Basic types

| ptoto type | java type |
| ---- | ---- |
double | double
float | float
int32 | int
int64 | long
uint32 | int[Note]
uint64 | long[Note]
sint32 | int
sint64 | long
fixed32 | int[Note]
fixed64 | long[Note]
sfixed32 | int
sfixed64 | long
bool | boolean
string | String
bytes | ByteString

> [Note] In Java, unsigned 32-bit and 64-bit integers are represented using their signed logarithms, with the top bit only stored in the sign bit.
## 2. Composite types

### 2.1. Enumeration

* Original pb code

```java.
enum TrafficLightColor {
    TRAFFIC_LIGHT_COLOR_INVALID = 0;
    TRAFFIC_LIGHT_COLOR_UNSET = 1;
    TRAFFIC_LIGHT_COLOR_GREEN = 2;
    TRAFFIC_LIGHT_COLOR_YELLOW = 3;
    TRAFFIC_LIGHT_COLOR_RED = 4;
}
```

* Generated java code

![image](/imgs/docs/advanced/protobufinterface/124234531-b96c2c80-db46-11eb-8155-a77dbe059f07.png)

> Enumerations are constants, so use uppercase
### 2.2. Arrays

* Original pb code

```java
message VipIDToRidReq {
    repeated uint32 vipID = 1;
}
```

* Generated java code

![image](/imgs/docs/advanced/protobufinterface/124234564-c4bf5800-db46-11eb-94fc-a056af6089cb.png)

> The bottom layer is actually an ArrayList
### 2.3. Collections

PB does not support unordered and non-repeating collections, and can only ``borrow arrays to implement``, and needs to ``remove duplicates by itself``.

### 2.4. Dictionaries

* Original pb code

```java
message BatchOnlineRes {
    map<uint32, uint32> onlineMap = 1;//online status
}
```

* Generated java code

![image](/imgs/docs/advanced/protobufinterface/124234654-e4568080-db46-11eb-9700-b30022ebee21.png)

### 2.5. Nesting

* Original pb code

```java
message BatchAnchorInfoRes {
    map<uint32, AnchorInfo> list = 1; //user information map list
}
/*
* The function of the corresponding interface: get user information in batches or individually
*/
message AnchorInfo {
    uint32 ownerUid = 1 [json_name="uid"]; //user id
    string nickName = 2 [json_name="nn"]; //User nickname
    string smallAvatar = 3 [json_name="savt"]; //full path of user avatar - small
    string middleAvatar = 4 [json_name="mavt"]; //Full path of user avatar - middle
    string bigAvatar = 5 [json_name="bavt"]; //Full path of user avatar - big
    string avatar = 6 [json_name="avt"]; //User avatar
}
```

* Generated java code

![image](/imgs/docs/advanced/protobufinterface/124234723-f89a7d80-db46-11eb-82d0-a8aee5322098.png)

## 3. Field default value

* For strings, the default is the empty string.
* For bytes, the default is the null byte.
* For bools, the default is false.
* For numeric types, the default value is zero.
* For enums, the default is the first defined enum value, which must be 0.
* For the message field, the field is not set. Its exact value is language dependent. See the generated code guide for details.

## 4. Overall structure

| Feature | Java Interface | Protobuf | Remarks |
| ---- | ---- | ---- | ---- |
| Method Overloading | √ | × | |
| Generic/templated | √ | × | |
| method inheritance | √ | × | |
| Nested definition | √ | Partial support | PB only supports message and enum nesting |
| import file | √ | √ | |
| field is null | √ | × | |
| Multiple input parameters | √ | × | PB only supports single input parameters |
| 0 input parameters | √ | × | PB must have input parameters |
| 0 output parameters | √ | × | PB must have output parameters |
| The input/output parameters are abstract classes | √ | × | The input/output parameters of PB must be concrete classes |
| The input/output parameters are interfaces | √ | × | The input/output parameters of PB must be concrete |
| The input parameter/output parameter is the basic type | √ | × | The input parameter/output parameter of PB must be a structure |

## 5. Community profile
* Community homepage address: https://developers.google.cn/protocol-buffers/
* Community open source address: https://github.com/google/protobuf
* Maven of related jars: https://search.maven.org/search?q=com.google.protobuf