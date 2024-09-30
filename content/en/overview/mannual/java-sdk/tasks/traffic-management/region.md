---
aliases:
    - /en/overview/tasks/traffic-management/region/
    - /en/overview/tasks/traffic-management/region/
description: Prioritize same data center/region in Dubbo-Admin dynamic configuration
linkTitle: Same Region Priority
title: Same Data Center/Region Priority
type: docs
weight: 4
---



To ensure the overall high availability of services, we often adopt a strategy of deploying services across multiple availability zones (data centers). Through this redundancy/disaster recovery deployment model, we can still guarantee the overall availability of services when a region experiences a failure.

When applications are deployed across multiple different data centers/regions, cross-region calls may occur between applications, which can increase response times and impact user experience. Same data center/region priority means that when an application calls a service, it prefers to call service providers in the same data center/region, avoiding network delays caused by cross-region calls and thereby reducing response times.

## Before You Begin

* [Deploy the Shop Marketplace Project](../#Deploy-the-Market-System)
* Deploy and open [Dubbo Admin](../.././../reference/admin/architecture/)

## Task Details

The Detail application and the Comment application are both deployed in dual regions, with Detail v1 and Comment v1 deployed in the Beijing region and Detail v2 and Comment v2 deployed in the Hangzhou region. To ensure the response speed of service calls, we need to add same-region priority calling rules to ensure that Detail v1 in the Beijing region always defaults to calling Comment v1, and Detail v2 in the Hangzhou region always calls Comment v2.

![region1](/imgs/v3/tasks/region/region1.png)

When services in the same region fail or become unavailable, cross-region calls are allowed.

![region2](/imgs/v3/tasks/region/region2.png)


### Configure `Detail` to Access Same Region Deployment of `Comment` Service

After logging into the marketplace system, the homepage defaults to displaying product details. Upon refreshing the page multiple times, different versions of the combination of product details (description) and comments (comment) appear, indicating that service calls do not follow the same-region priority principle.

![region3](/imgs/v3/tasks/region/region3.png)

Therefore, we need to add same-region priority rules to ensure:
* The `hangzhou` region's Detail service calls the same region's Comment service, meaning description v1 and comment v1 are always displayed together.
* The `beijing` region's Detail service calls the same region's Comment service, meaning description v2 and comment v2 are always displayed together.

#### Steps
1. Log into the Dubbo Admin console.
2. In the left navigation bar, select [Service Governance] > [Conditional Routing].
3. Click the "Create" button and fill in the service to enable same-region priority, such as `org.apache.dubbo.samples.CommentService`, and the `Region Identifier`, such as `region`.

![Admin Same Region Priority Settings Screenshot](/imgs/v3/tasks/region/region_admin.png)

After enabling same-region priority, try refreshing the product detail page again, and you will see that the description and comment remain synchronized to v1 or v2.

![region4](/imgs/v3/tasks/region/region4.png)

If you take all Comment v2 versions deployed in the `hangzhou` region offline, Detail v2 will automatically cross-region access Comment v1 in the `beijing` region.

#### Rule Explanation

**Rule key**: `org.apache.dubbo.samples.CommentService`

**Rule Body**
```yaml
configVersion: v3.0
enabled: true
force: false
key: org.apache.dubbo.samples.CommentService
conditions:
  - '=> region = $region'
```

This uses conditional routing, with `region` being the region identifier in our example, which automatically identifies the region value of the party initiating the call. When the request reaches the Detail deployed in the `hangzhou` region, requests from Detail automatically filter Comment URLs with the `region=hangzhou` identifier. If available addresses are found, the request is sent; if no matching addresses are found, it is randomly sent to any available address.

```yaml
conditions:
  - '=> region = $region'
```

`force: false` is also critical as this allows cross-region calls when there are no valid addresses in the same region.

## Cleanup
To avoid affecting other tasks, delete or disable the just-configured same-region traffic rules through Admin.

## Other Matters

The above example does not include the complexity of the registration center between multiple regions. If each region has an independent registration center, then address synchronization between regions becomes a necessary consideration. For such scenarios, Dubbo also provides same-region priority support through its multi-registration & multi-subscription mechanism; see the [Multi-Registry & Multi-Subscription](/en/overview/mannual/java-sdk/advanced-features-and-usage/service/multi-registry/) documentation for details.

