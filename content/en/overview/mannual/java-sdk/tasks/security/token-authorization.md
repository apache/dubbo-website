---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/security/token-authorization/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/security/token-authorization/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/security/token-authorization/
description: Understand the configuration and usage of Dubbo permission control
linkTitle: Permission Control
title: Permission Control
type: docs
weight: 2
---






## Feature Description

Control permissions in the registry through token verification to decide whether to issue a token to consumers, which can prevent consumers from bypassing the registry to access providers. Moreover, the authorization method can be flexibly changed through the registry without modifying or upgrading the provider.

![/user-guide/images/dubbo-token.jpg](/imgs/user/dubbo-token.jpg)

## Usage Scenarios

To a certain extent, achieve trusted authentication between the client and server, preventing any client from gaining access and reducing the risk of security issues.

## Usage Method

### Global Settings

Enable token verification

```xml
<!-- Random token, generated using UUID -->
<dubbo:provider token="true" />
```

or

```xml
<!-- Fixed token, equivalent to a password -->
<dubbo:provider token="123456" />
```
### Service Level Settings

```xml
<!-- Random token, generated using UUID -->
<dubbo:service interface="com.foo.BarService" token="true" />
```

or

```xml
<!-- Fixed token, equivalent to a password -->
<dubbo:service interface="com.foo.BarService" token="123456" />
```
