---
aliases:
    - /en/overview/tasks/traffic-management/retry/
    - /en/overview/tasks/traffic-management/retry/
description: ""
linkTitle: Service Retry
title: Improve Service Call Success Rate Through Retry
type: docs
weight: 2
---



Retrying after an initial service call failure can effectively increase the overall call success rate. However, it is important to note that retries may lead to increased response times and higher system load. Additionally, retries are generally suitable for read-only services or write services that guarantee idempotency.

## Before You Begin
* [Deploy the Shop Mall Project](../#deploy-the-mall-system)
* Deploy and open [Dubbo Admin](../.././../reference/admin/architecture/)

## Task Details

After successfully logging into the mall project, the mall will automatically display the details of the currently logged-in user on the homepage.

![retry1.png](/imgs/v3/tasks/retry/retry1.png)

However, sometimes the Dubbo service that provides user details may become unstable due to various reasons such as network instability. For example, our User service, which provides user details, is likely to fail in its calls, resulting in the user being unable to see their account details.

![retry2.png](/imgs/v3/tasks/retry/retry2.png)

The system interface after the user account detail query fails is shown below:

![retry2.png](/imgs/v3/tasks/retry/retry4.png)

In order to improve user experience, the loading process of user information is asynchronous, so a failure in loading user information does not affect the normal access to the entire mall page. However, consistently displaying complete user information will always leave a better impression on users.
### Increase Retries to Improve Success Rate

Considering that the process of accessing user details is asynchronous (hidden behind the page loading), as long as the final data can be loaded, increasing the wait time appropriately is not a major issue. Therefore, we can consider increasing the retry count for each user access to enhance the overall success rate of the service details service.

![retry3.png](/imgs/v3/tasks/retry/retry3.png)

#### Steps
1. Open the Dubbo Admin console
2. Select 【Service Governance】>【Dynamic Configuration】 in the left navigation bar
3. Click "Create", input the service `org.apache.dubbo.samples.UserService` and the failure retry count, such as `4`.

![Admin Retry Count Setting Screenshot](/imgs/v3/tasks/retry/retry_admin.png)

After saving, try refreshing the page multiple times and find that the user detail data always displays properly, although the loading time may significantly increase due to retries.

#### Rule Details

**Rule Key** : `org.apache.dubbo.samples.UserService`

**Rule Body**

```yaml
configVersion: v3.0
enabled: true
configs:
  - side: consumer
    parameters:
      retries: 5
```

The retry count after a failure is increased from the perspective of the `UserService` service consumer (i.e., the Frontend application).

```yaml
parameters:
  retries: 5
```

The `side: consumer` configuration sends the rule to the service consumer instance, and all `UserService` service instances will be republished based on the new timeout value, notifying all consumers through the registry.

## Cleanup
To avoid affecting other task results, delete or disable the retry rule just configured through Admin.

