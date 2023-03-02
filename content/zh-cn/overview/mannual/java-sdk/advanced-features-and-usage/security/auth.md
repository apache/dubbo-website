---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/security/auth/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/security/auth/
description: 了解 Dubbo 服务鉴权
linkTitle: 服务鉴权
title: 服务鉴权
type: docs
weight: 23
---






## 特性说明

类似支付之类的对安全性敏感的业务可能会有限制匿名调用的需求。在加固安全性方面，2.7.5 引入了基于 AK/SK 机制的认证鉴权机制，并且引入了鉴权服务中心，主要原理是消费端在请求需要鉴权的服务时，会通过 SK、请求元数据、时间戳、参数等信息来生成对应的请求签名，通过 Dubbo 的 Attahcment 机制携带到对端进行验签，验签通过才进行业务逻辑处理。如下图所示：

![img](/imgs/docsv2.7/user/examples/auth/auth.png)


## 使用场景
部署新服务时，使用身份验证来确保只部署正确的服务,如果部署了未经授权的服务，则使用身份验证来拒绝访问并防止使用未经授权服务。

## 使用方式

### 接入方式

1. 使用者需要在微服务站点上填写自己的应用信息，并为该应用生成唯一的证书凭证。

2. 之后在管理站点上提交工单，申请某个敏感业务服务的使用权限，并由对应业务管理者进行审批，审批通过之后，会生成对应的 AK/SK 到鉴权服务中心。

3. 导入该证书到对应的应用下，并且进行配置。配置方式也十分简单，以注解方式为例：

   ### 服务提供端
   只需要设置 `service.auth` 为 true，表示该服务的调用需要鉴权认证通过。`param.sign` 为 `true` 表示需要对参数也进行校验。

   ```java
   @Service(parameters = {"service.auth","true","param.sign","true"})
   public class AuthDemoServiceImpl implements AuthService {
   }

   ```

   ### 服务消费端
   只需要配置好对应的证书等信息即可，之后会自动地在对这些需要认证的接口发起调用前进行签名操作，通过与鉴权服务的交互，用户无需在代码中配置 AK/SK 这些敏感信息，并且在不重启应用的情况下刷新 AK/SK，达到权限动态下发的目的。

> 该方案目前已经提交给 Dubbo 开源社区，并且完成了基本框架的合并，除了 AK/SK 的鉴权方式之外，通过 SPI 机制支持用户可定制化的鉴权认证以及适配公司内部基础设施的密钥存储。