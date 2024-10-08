---
aliases:
    - /en/overview/tasks/traffic-management/mock/
    - /en/overview/tasks/traffic-management/mock/
description: ""
linkTitle: Service Downgrading
title: Service Downgrading for Weak Dependencies Before Major Promotions
type: docs
weight: 8
---



Due to the distributed nature of microservice systems, a service often needs to rely on many external services to implement a certain function. Therefore, the stability of a service depends not only on itself but also on the stability of all external dependencies. We can categorize these dependencies based on their importance into strong and weak dependencies: strong dependencies are those that must ensure stability at all costs, as the current service will also be unavailable if they are not; weak dependencies refer to those dependencies that allow the current service to function normally even when they are unavailable, as their unavailability only affects part of the functionality.

The core objective of service downgrading is to address these weak dependencies. When weak dependencies are unavailable or calls fail, we maintain functional integrity by returning degraded results whenever possible. Additionally, we may also proactively mask the calls to some non-critical weak dependencies, such as pre-setting effective downgrade strategies to short-circuit some dependency calls before the peak traffic during promotions, thus effectively improving the overall efficiency and stability of the system during traffic peaks.

## Before You Start

* [Deploy Shop Mall Project](../#deploy-the-mall-system)
* Deploy and open [Dubbo Admin](../.././../reference/admin/architecture/)

## Task Details

Under normal circumstances, the product detail page displays product review information from customers.

![mock1.png](/imgs/v3/tasks/mock/mock1.png)

The absence of review information often does not affect users browsing and purchasing products; therefore, we define review information as a weak dependency of the product detail page. Next, we will simulate a common strategy used before major promotions by proactively closing the product detail page's call to the review service (returning some locally prepared historical review data) to reduce the overall load on the cluster and improve response speed.

![mock0.png](/imgs/v3/tasks/mock/mock0.png)

### Short-circuit Comment Service Calls by Downgrade Rules

Review data is provided by the `org.apache.dubbo.samples.CommentService` service of the Comment application; next, we will configure downgrade rules for `CommentService`.

#### Steps
1. Open the Dubbo Admin console
2. In the left sidebar, select 【Traffic Control】>【Service Downgrade】
3. Click "Create," enter the service `org.apache.dubbo.samples.CommentService` and the downgrade rules.

![Admin Service Downgrade Rule Configuration Screenshot](/imgs/v3/tasks/mock/mock_admin.png)

After waiting for the downgrade rules to be pushed, refresh the product detail page to find that the product review information has changed to our preset "Mock Comment," as the Comment service call for the product detail page has been short-circuited locally and was not actually sent to the backend service provider machine.

![mock2.png](/imgs/v3/tasks/mock/mock2.png)

Refresh the page again.

#### Rule Explanation

**Rule Key**: `org.apache.dubbo.samples.CommentService`

**Rule Body**

```yaml
configVersion: v3.0
enabled: true
configs:
  - side: consumer
    parameters:
      mock: force:return Mock Comment
```

## Cleanup
To avoid affecting other tasks, delete or disable the downgrade rules just configured through Admin.

## Other Matters

The service downgrading feature can also be utilized in development and testing environments. Due to the distributed characteristics of microservices, there are interdependencies among different services or applications. Thus, it is challenging for a service or application to be deployed independently without relying on other services. However, not all services in the testing environment are always ready, presenting a significant obstacle to the independent evolution of services emphasized in microservices. By using the service downgrading feature, we can simulate or short-circuit an application’s dependency on other services, allowing the application to mock the return results of external service calls as expected. For details, refer to the usage of [Dubbo Admin Service Mock](../.././../reference/admin/mock/).

Dubbo's downgrade rules are used to set behaviors and return values upon downgrading. However, the judgment of when to execute flow limiting downgrade actions has not been extensively covered. Dubbo has completed this by integrating more specialized flow limiting downgrade products such as Sentinel, which can be used in conjunction with Dubbo downgrade rules, as detailed in the [flow limiting downgrade](/en/overview/core-features/traffic/circuit-breaking/) documentation.

