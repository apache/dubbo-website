---
title: "Dubbo Admin 安全"
linkTitle: "Dubbo Admin 安全"
weight: 4
type: docs
description: "更安全地使用 Dubbo Admin"
---

为了便于使用 Dubbo，Dubbo 官方提供了 Dubbo Admin 控制台，以便于管理 Dubbo 应用。

## 风险

Dubbo Admin 默认拥有整个集群的查询、调用权限，因此对于线上环境，需要更加谨慎地使用。
此外，为了减低任意访问 Dubbo Admin 的风险，Dubbo Admin 还提供了简易的鉴权机制。
为了使 Dubbo Admin 更安全，请参考下面的文档。

## 鉴权方案

Dubbo Admin 默认提供基于用户名密码的登陆机制，在请求过程中基于 JWT Token 进行鉴权。
从便于初学者的角度出发，Dubbo Admin 包含了一个默认的用户名密码、JWT Secret Token。

> **由于 Dubbo Admin 是公开发行的，因此默认的用户名密码、JWT Secret Token 都是公开的。
在您的生产环境中，请务必更换默认的用户名密码、JWT Secret Token。**

## 如何更换默认的用户名密码、JWT Secret Token

对于直接基于 Java 代码打包部署的用户，可以直接修改 `dubbo-admin-server/src/main/resources/application.properties` 中以下配置：

```properties
admin.root.user.name=root
admin.root.user.password=root
admin.check.signSecret=86295dd0c4ef69a1036b0b0c15158d77
```

对于通过 Docker 部署的用户，可以修改 `/dubbo/dubbo-admin/properties` 中以下配置：

```properties
admin.root.user.name=root
admin.root.user.password=root
admin.check.signSecret=86295dd0c4ef69a1036b0b0c15158d77
```

对于通过 Kubernetes 部署的用户，可以修改 ConfigMap 中以下配置：

```properties
admin.root.user.name=root
admin.root.user.password=root
admin.check.signSecret=86295dd0c4ef69a1036b0b0c15158d77
```

对于通过 Helm 部署的用户，可以指定以下配置：

```yaml
properties:
  admin.root.user.name: root
  admin.root.user.password: root
  admin.check.signSecret: 86295dd0c4ef69a1036b0b0c15158d77
```

## 最佳实践

1. 请在私有化部署时更新默认的用户名密码、JWT Secret Token。建议修改 Dubbo Admin 的鉴权逻辑接入您所在组织的人员管理系统。
2. 请勿直接把 Dubbo Admin 的端口暴露到互联网上。
