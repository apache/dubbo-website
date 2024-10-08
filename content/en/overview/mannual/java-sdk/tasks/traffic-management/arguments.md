---
aliases:
    - /en/overview/tasks/traffic-management/arguments/
    - /en/overview/tasks/traffic-management/arguments/
description: ""
linkTitle: Parameter Routing
title: Guiding Traffic Distribution Based on Request Parameters
type: docs
weight: 6
---



Forwarding traffic based on request parameter values is a very flexible and practical traffic control strategy. For instance, in microservice practices, routing traffic based on parameters (such as user ID) allows a portion of user requests to be directed to the latest product version to validate the stability of the new version and gather user feedback on the product experience, which is a commonly used effective gray mechanism in production practices.

Alternatively, some products offer differentiated paid services that require routing requests to clusters with different service level guarantees based on user IDs in the request parameters, just as we will do in the example tasks below.

## Before You Begin

* [Deploy Shop Mall Project](../#Deploy-Mall-System)
* Deploy and open [Dubbo Admin](../.././../reference/admin/architecture/)

## Task Details

To increase user engagement, we have added a VIP user service to the mall example system. Now the mall has two types of users: regular users and VIP users, where VIP users can see lower product prices than regular users.

Returning to the mall login page, we log in to the system as VIP user `dubbo`. Do we see the VIP exclusive product prices as shown in the following image? Refresh the product page a few times.

![arguments1](/imgs/v3/tasks/arguments/arguments1.png)

Oh, is the price fluctuating?! This is because in the currently deployed example system, only the detail v2 version can recognize VIP users and provide special pricing services. Therefore, we need to ensure that the `dubbo` user always accesses the detail v2 instance to enjoy stable VIP services.

![arguments2](/imgs/v3/tasks/arguments/arguments2.png)

### Providing Stable Special Price Product Services for VIP Users

The detail v2 version can identify VIP users and display special prices in the product details. The product detail service is provided by the `org.apache.dubbo.samples.DetailService` service in the Detail application, and the `getItem` method of `DetailService` is defined as follows, with the second parameter being the username.

```java
public interface DetailService {
    Item getItem(long sku, String username);
}
```

Thus, we will add parameter routing rules to the `getItem` method of `DetailService` so that if the user parameter is `dubbo`, requests will be forwarded to the v2 version of the service.

#### Operation Steps
1. Open the Dubbo Admin console.
2. In the left navigation bar, select 【Service Governance】 > 【Parameter Routing】.
3. Click the "Create" button and enter.

![Admin Parameter Routing Setup Screenshot](/imgs/v3/tasks/arguments/arguments_admin.png)

The index of the method parameters starts from `0`. Filling in `1` indicates that traffic forwarding is based on the second parameter.

#### Rule Details

**Rule Key**: `org.apache.dubbo.samples.DetailService`

**Rule Body**
```yaml
configVersion: v3.0
key: org.apache.dubbo.samples.DetailService
scope: service
force: false
enabled: true
priority: 1
conditions:
  - method=getItem & arguments[1]=dubbo => detailVersion=v2
```

* `method=getItem & arguments[1]=dubbo` indicates that the traffic rule matches the second parameter of the `getItem` method call, performing further address subset filtering when the parameter value is `dubbo`.
* `detailVersion=v2` filters out all URL address subsets marked with `detailVersion=v2` (in the example deployment, all our detail v2 instances have been labeled with `detailVersion=v2`).

```yaml
conditions:
  - method=getItem & arguments[1]=dubbo => detailVersion=v2
```

`force: false` means that if there are no addresses with `detailVersion=v2`, it will randomly access all available addresses.

## Other Considerations
This example is just one use case of Dubbo conditional routing. In addition to forwarding traffic based on method names and parameter matches, conditional routing can also route traffic based on additional parameters Attachments, data in the URL, etc., and the matching conditions support ranges and wildcards, such as:
* attachments[key]=hello*
* arguments[0]=1~100
* url_key=value

More flexibly, the matching conditions for conditional routing support extension, allowing users to customize the source and format of matching conditions. For details, refer to [Conditional Routing Rule Description](/en/overview/core-features/traffic/condition-rule/)。

