---
type: docs
title: "1-10 - 读写注册中心服务缓存失败"
linkTitle: "1-10 - 读写注册中心服务缓存失败"
weight: 10
---

## 可能的原因
1. 多个 Dubbo 进程使用了同一个缓存文件。
2. 在多注册中心的情况下，指定了多个注册中心使用同一文件存储。

## 排查和解决步骤
该错误常与 1-9 错误共同出现。检查是否有多个 Dubbo 进程使用了同一个缓存文件或者是否指定多个注册中心使用同一缓存文件。

## 另请参阅
[注册中心的配置项参考手册](https://dubbo.apache.org/zh/docs3-v2/java-sdk/reference-manual/config/properties/#registry)

<p style="margin-top: 3rem;"> </p>
