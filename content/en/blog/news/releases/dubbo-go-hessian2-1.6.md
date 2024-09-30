---
title: "Dubbo Go Hessian2 v1.6.0"
linkTitle: "dubbo-go-hessian2 v1.6.0"
date: 2021-01-14
description: >
    What's new in Dubbo-go-hessian2 v1.6.0
---

## 1. Cache Optimization

dubbo-go-hessian2 extensively uses struct type information for data parsing, and this information can be cached and reused, resulting in a twofold performance improvement. For detailed optimization process records, refer to [“Performance Optimization of dubbo-go-hessian2”](https://mp.weixin.qq.com/s/ouVxldQAt0_4BET7srjJ6Q).

Corresponding PR [#179](https://github.com/apache/dubbo-go-hessian2/pull/179), author [micln](https://github.com/micln).

## 2. String Parsing Performance Optimization

Due to the definition of string in Hessian (Dubbo serialization protocol referred to as Hessian), which represents it as a 16-bit Unicode UTF-8 format, the character length is represented as a 16-bit character count. This specification was established only for Java, where a character is 16 bits corresponding to UTF-16. The Hessian library also serializes each character. However, in Go, characters correspond to UTF-8, and the rune in dubbo-go-hessian2 is 32 bits, mapping one-to-one with Unicode. For character ranges U+10000 to U+10FFFF, they need to be converted to two-byte surrogate pairs to align with Java's serialization method.

Originally, both encoding and parsing processes handled characters one by one, especially during parsing, where each byte was read from the stream and constructed into a rune before being converted to a string, leading to inefficiencies. Our optimization strategy is to batch read byte streams into a buffer, parse the buffer into a UTF-8 array, and count the characters, converting surrogate pairs into standard UTF-8 byte arrays. If the character count is insufficient, more data is read from the stream for parsing. This method enhances parsing efficiency twofold.

Corresponding PR [#188](https://github.com/apache/dubbo-go-hessian2/pull/188), author [zonghaishang](https://github.com/zonghaishang).

## 3. Ignore Non-Existent Fields During Parsing

The Hessian library ignores class fields that do not exist when parsing data. However, prior to version 1.6.0, dubbo-go-hessian2 would return an error when encountering non-existent fields. Starting with version 1.6.0, it will ignore these fields just like Hessian. **Due to this being a feature change, users upgrading should be aware.**

Corresponding PR [#201](https://github.com/apache/dubbo-go-hessian2/pull/201), authors [micln](https://github.com/micln) & [fangyincheng](https://github.com/fangyincheng).

## 4. Resolve Floating Point Precision Loss Issues

When serializing `float32`, we forcibly convert to `float64` before serialization. Due to floating-point precision issues, excess decimal points may occur in this conversion, e.g., `(float32)99.8--> (float64)99.80000305175781`.

Version 1.6.0 optimized `float32` serialization:

- If the decimal tail is less than 3 digits, serialize to double 32-bit format according to Hessian2 protocol.
- Otherwise, convert to string and then to float64 to avoid excess decimal points, and finally serialize the float64.

Although optimizations have been made for `float32`, it is still recommended to prefer `float64` for floating-point numbers.

Corresponding PR [#196](https://github.com/apache/dubbo-go-hessian2/pull/196), author [willson-chen](https://github.com/willson-chen).

## 5. Resolve Attachment Null Value Loss Issue

The Dubbo request includes attachment information. Previously, if the attachment contained a case like `"key1":""`, this property would be lost upon parsing. Version 1.6.0 fixed this, and now the parsed attachment correctly acknowledges empty value properties.

Corresponding PR [#191](https://github.com/apache/dubbo-go-hessian2/pull/191), author [champly](https://github.com/champly).

## 6. Support 'Inheritance' and Ignore Redundant Fields

Since Go does not have an inheritance concept, in previous versions, fields from Java parent classes were not supported by dubbo-go-hessian2. In the new version, dubbo-go-hessian2 maps Java fields from parent classes using anonymous structs, like:

```go
type Dog struct {
    Animal
    Gender  string
    DogName string `hessian:"-"`
}
```

Also, similar to how JSON encoding can ignore a field using "immediately", in Hessian, users can also exclude redundant fields from serialization by using `hessian:"-"`.

Corresponding PR [#154](https://github.com/apache/dubbo-go-hessian2/pull/154), author [micln](https://github.com/micln)
