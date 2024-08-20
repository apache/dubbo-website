---
title: "Dubbo Admin Security"
linkTitle: "Dubbo Admin Security"
weight: 4
type: docs
description: "Use Dubbo Admin more securely"
---

In order to facilitate the use of Dubbo, Dubbo officially provides the Dubbo Admin console to facilitate the management of Dubbo applications.

## Risk

Dubbo Admin has query and call permissions for the entire cluster by default, so it needs to be used with more caution in the online environment.
In addition, in order to reduce the risk of arbitrary access to Dubbo Admin, Dubbo Admin also provides a simple authentication mechanism.
To make Dubbo Admin more secure, please refer to the documentation below.

## Authentication scheme

Dubbo Admin provides a login mechanism based on username and password by default, and authenticates based on JWT Token during the request process.
From the perspective of convenience for beginners, Dubbo Admin includes a default username, password, and JWT Secret Token.

> **Since Dubbo Admin is publicly released, the default username, password, and JWT Secret Token are all public.
In your production environment, be sure to change the default username, password, and JWT Secret Token.**

## How to change the default username, password, and JWT Secret Token

For users who package and deploy directly based on Java code, they can directly modify the following configuration in `dubbo-admin-server/src/main/resources/application.properties`:

```properties
admin.root.user.name=root
admin.root.user.password=root
admin.check.signSecret=86295dd0c4ef69a1036b0b0c15158d77
```

For users deployed through Docker, you can modify the following configuration in `/dubbo/dubbo-admin/properties`:

```properties
admin.root.user.name=root
admin.root.user.password=root
admin.check.signSecret=86295dd0c4ef69a1036b0b0c15158d77
```

For users deployed via Kubernetes, the following configurations in ConfigMap can be modified:

```properties
admin.root.user.name=root
admin.root.user.password=root
admin.check.signSecret=86295dd0c4ef69a1036b0b0c15158d77
```

For users deploying via Helm, you can specify the following configuration:

```yaml
properties:
  admin.root.user.name: root
  admin.root.user.password: root
  admin.check.signSecret: 86295dd0c4ef69a1036b0b0c15158d77
```

## Best Practices

1. Please update the default username, password, and JWT Secret Token during privatized deployment. It is recommended to modify the authentication logic of Dubbo Admin and connect it to your organization's personnel management system.
2. Do not directly expose the Dubbo Admin port to the Internet.
