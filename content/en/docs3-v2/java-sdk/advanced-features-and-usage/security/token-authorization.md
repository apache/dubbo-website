---
type: docs
title: "Access Control"
linkTitle: "Access Control"
weight: 2
description: "Understand the configuration and use of dubbo3 permission control"
---

## Feature description
Control authority in the registration center through token verification to decide whether to issue tokens to consumers,
can prevent consumers from bypassing the registry to access the provider,
In addition, the authorization method can be flexibly changed through the registration center without modifying or upgrading the provider.

![/user-guide/images/dubbo-token.jpg](/imgs/user/dubbo-token.jpg)

## scenes to be used

To a certain extent, the trusted authentication of the client and the server is realized, preventing any client from being able to access, and reducing the risk of security problems.

## How to use
### Global Settings

Enable token verification

```xml
<!--Random token token, generated using UUID -->
<dubbo:provider token="true" />
```

or

```xml
<!--Fixed token token, equivalent to password-->
<dubbo:provider token="123456" />
```
### Service Level Settings

```xml
<!--Random token token, generated using UUID -->
<dubbo:service interface="com.foo.BarService" token="true" />
```

or

```xml
<!--Fixed token token, equivalent to password-->
<dubbo:service interface="com.foo.BarService" token="123456" />
```