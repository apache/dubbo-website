---
aliases:
    - /en/overview/tasks/traffic-management/timeout/
    - /en/overview/tasks/traffic-management/timeout/
description: Dynamically adjust service timeout in Dubbo-Admin
linkTitle: Adjust Timeout
title: Dynamically Adjust Service Timeout
type: docs
weight: 2
---

Dubbo provides the ability to dynamically adjust service timeout, allowing adjustments without restarting the application, which is very effective for temporarily resolving issues of invocation failure due to unstable upstream and downstream service dependencies.

## Before You Start
* Deploy the Shop mall project
* Deploy and open [Dubbo Admin](../.././../reference/admin/architecture/)

## Task Details

The mall project provides user information management services through `org.apache.dubbo.samples.UserService`. Access `http://localhost:8080/`, enter any username and password, and click `Login` to log into the system.

![timeout1.png](/imgs/v3/tasks/timeout/timeout1.png)

In some scenarios, the speed of the User service may slow down, such as when the database storing user data is overloaded, resulting in slow queries, which can cause `UserService` access timeouts and login failures.

![timeout2.png](/imgs/v3/tasks/timeout/timeout2.png)

In the demo system, you can simulate a sudden `UserService` access timeout exception through the `Timeout Login` in the image below.

![timeout4.png](/imgs/v3/tasks/timeout/timeout4.png)

### Dynamically Adjust Timeout Through Rules

To address sudden login timeout issues, we can simply increase the waiting time for `UserService` service calls.

![timeout3.png](/imgs/v3/tasks/timeout/timeout3.png)

#### Steps
1. Open the Dubbo Admin console.
2. In the left navigation bar, select 【Service Governance】 > 【Dynamic Configuration】.
3. Click "Create", enter the service `org.apache.dubbo.samples.UserService`, and the new timeout such as `2000`.

![Admin Timeout Setting Screenshot](/imgs/v3/tasks/timeout/timeout_admin.png)

After saving, click `Timeout Login` again, and after a brief wait, the system can log in normally.

#### Rule Details

**Rule key**: `org.apache.dubbo.samples.UserService`

**Rule body**

```yaml
configVersion: v3.0
enabled: true
configs:
  - side: provider
    parameters:
      timeout: 2000
```

From the perspective of the `UserService` provider, the overall timeout is adjusted to 2s.

```yaml
parameters:
  timeout: 2000
```

The `side: provider` configuration will send the rule to the service provider instance, and all `UserService` instances will re-publish based on the new timeout value, notifying all consumers via the registry.

## Cleanup
To avoid affecting other tasks, delete or disable the timeout rule just configured through Admin.

