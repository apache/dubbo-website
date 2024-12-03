---
title: "Dubbo Admin Security"
linkTitle: "Dubbo Admin Security"
weight: 4
type: docs
description: "Using Dubbo Admin more securely"
---

To facilitate the use of Dubbo, the official Dubbo team provides the Dubbo Admin console to manage Dubbo applications.

## Risks

Dubbo Admin by default has the permission to query and invoke the entire cluster, so it must be used more cautiously in a production environment. Additionally, to reduce the risk of arbitrary access to Dubbo Admin, a simple authentication mechanism is provided. To make Dubbo Admin more secure, please refer to the following documentation.

## Authentication Scheme

Dubbo Admin by default provides a login mechanism based on username and password, and uses JWT Token for authentication during requests. To make it beginner-friendly, Dubbo Admin includes a default username, password, and JWT Secret Token.

> **Because Dubbo Admin is publicly distributed, the default username, password, and JWT Secret Token are also public.
In your production environment, please be sure to replace the default username, password, and JWT Secret Token.**

## How to Replace the Default Username, Password, and JWT Secret Token

For users who package and deploy directly based on Java code, you can modify the following configurations in `dubbo-admin-server/src/main/resources/application.properties`:

```properties
admin.root.user.name=root
admin.root.user.password=root
admin.check.signSecret=86295dd0c4ef69a1036b0b0c15158d77
```

For users deploying via Docker, you can modify the following configurations in `/dubbo/dubbo-admin/properties`:

```properties
admin.root.user.name=root
admin.root.user.password=root
admin.check.signSecret=86295dd0c4ef69a1036b0b0c15158d77
```

For users deploying via Kubernetes, you can modify the following configurations in the ConfigMap:

```properties
admin.root.user.name=root
admin.root.user.password=root
admin.check.signSecret=86295dd0c4ef69a1036b0b0c15158d77
```

For users deploying via Helm, you can specify the following configurations:

```yaml
properties:
  admin.root.user.name: root
  admin.root.user.password: root
  admin.check.signSecret: 86295dd0c4ef69a1036b0b0c15158d77
```

## Best Practices

1. Update the default username, password, and JWT Secret Token during private deployment. It is recommended to modify Dubbo Admin's authentication logic to integrate with your organization's personnel management system.
2. Do not expose Dubbo Admin's port directly to the Internet.

