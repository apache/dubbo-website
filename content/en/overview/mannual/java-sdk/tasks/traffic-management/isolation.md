---
aliases:
    - /en/overview/tasks/traffic-management/isolation/
    - /en/overview/tasks/traffic-management/isolation/
description: ""
linkTitle: Environment Isolation
title: Achieving Traffic Isolation Environments Through Tags (Canary Releases, Multiple Development Environments, etc.)
type: docs
weight: 5
---



Whether in daily development and testing environments or in pre-production environments, the need for traffic isolation environments often arises.
* In daily development, to avoid mutual interference during testing, we need to set up multiple independent testing environments, but building physical clusters is very costly and not flexible enough.
* During production releases, to ensure that the new version is fully validated, we need to set up a completely isolated online canary environment to deploy new version services. The online canary environment can fully simulate production runtime conditions, but only a fixed amount of traffic with specific tags will flow to the canary environment, minimizing the risk of online changes while thoroughly validating the new version.

Using Dubbo's tag routing capability allows for very flexible traffic isolation. It can separately isolate a specific application in a cluster or an entire microservice cluster; it can statically mark the isolation environment during deployment or dynamically isolate part of the machine environment through rules during runtime.

> Note: Tag routing is a strictly isolated traffic system. For the same application, once tagged, this subset of addresses is isolated, and only requests with corresponding tags can access this address subset. This subset will not accept traffic without tags or with different tags. For example, if we tag an application and divide it into tag-a, tag-b, and no tag subsets, the traffic accessing this application will either route to tag-a (when request context dubbo.tag=tag-a), or to tag-b (dubbo.tag=tag-b), or to the no tag subset (dubbo.tag not set), without mixing traffic.

## Before You Begin

* Deploy Shop Mall Project
* Deploy and open [Dubbo Admin](../.././../reference/admin/architecture/)

## Task Details

We decided to establish a complete online canary validation environment for the mall system. The canary environment shares a physical cluster with the online environment, and we need to logically isolate an environment using Dubbo's tag routing to ensure that canary traffic and online traffic do not interfere with each other.

![gray1](/imgs/v3/tasks/gray/gray1.png)

### Set Up a Completely Isolated Canary Environment for the Mall
First, we deploy canary environment instances for the User, Detail, Comment, and Order applications, all marked with the environment tag `env=gray`. The deployment can be quickly completed with the following command

```sh
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/10-task/dubbo-samples-shop/deploy/Gray.yml
```

{{% alert title="How to Tag Machines or Instances?" color="info" %}}

**Method 1: Specify key-value pairs to be added to the URL using `dubbo.labels` or `DUBBO_LABELS`.**

```properties
# JVM Arguments
-Ddubbo.labels = "tag1=value1; tag2=value2"

# Environment Variables
DUBBO_LABELS = "tag1=value1; tag2=value2"
```

The resulting URL will include the two keys tag1 and tag2: `dubbo://xxx?tag1=value1&tag2=value2`.

**Method 2: Specify the environment variables to load using `dubbo.env.keys` or `DUBBO_ENV_KEYS`. Dubbo will attempt to load each key from environment variables.**

```properties
# JVM Arguments
-Ddubbo.env.keys = "DUBBO_TAG1, DUBBO_TAG2"

# Environment Variables
DUBBO_ENV_KEYS = "DUBBO_TAG1, DUBBO_TAG2"
```

The resulting URL will include the two keys DUBBO_TAG1 and DUBBO_TAG2: `dubbo://xxx?DUBBO_TAG1=value1&DUBBO_TAG2=value2`.
{{% /alert %}}


Next, we will increase the tag rules for several applications, isolating the newly deployed instances from ordinary traffic instances.

#### Steps

1. Open the Dubbo Admin Console.
2. In the left navigation bar, select 【Service Governance】>【Tag Routing】.
3. Click "Create", enter `shop-detail` and the traffic isolation conditions, and save; repeat the same isolation rules for `shop-comment` and `shop-order`.

![Admin Gray Isolation Environment Setup Screenshot](/imgs/v3/tasks/gray/gray_admin.png)

The above rules isolate an independent canary environment for each application, with all tagged `env=gray` belonging to the canary environment. Wait a moment to ensure the rules are applied, and then you can validate the canary traffic operating in the isolated environment.

To simulate canary traffic, we set up an entry point `Login To Gray` on the mall example homepage to simulate traffic entering the mall from the canary environment. In a real environment, this can be achieved by identifying traffic based on certain rules at the entry gateway and automatically tagging it.

![gray2](/imgs/v3/tasks/gray/gray2.png)

After logging in via `Login To Gray`, all subsequent requests for Detail, Comment, Order, and User services will automatically carry the `dubbo.tag=gray` identifier. The Dubbo tag routing component will recognize this identifier and route the traffic to the previously defined canary environment (i.e., all instances with `env=gray`). The system's operational effect is as follows:

![Admin Gray Isolation Environment Setup Screenshot](/imgs/v3/tasks/gray/gray3.png)

#### Rule Explanation

We need to set tag grouping rules for the four applications `shop-detail`, `shop-comment`, `shop-order`, and `shop-user` via Admin, taking `shop-detail` as an example:

**Rule Key**: `shop-detail`

**Rule Body**

```yaml
configVersion: v3.0
force: true
enabled: true
key: shop-detail
tags:
  - name: gray
    match:
      - key: env
        value:
          exact: gray
```

Here, `name` is the traffic matching condition for the canary environment; only traffic with `dubbo.tag=gray` in the request context will be forwarded to the isolated environment subset. The request context can be passed using `RpcContext.getClientAttachment().setAttachment("dubbo.tag", "gray")`.

```yaml
name: gray
```

`match` specifies the filtering criteria for the address subset. In this example, we are matching all address URLs that contain the `env=gray` tag. (All instances deployed in version v2 of the mall example have already been tagged.)

```yaml
match:
  - key: env
    value:
      exact: gray
```

`force` determines whether to allow traffic to escape the canary isolation environment, which affects the behavior when a service finds that there are no available addresses in the canary isolation environment. The default value is `false`, indicating that it will fallback to the normal address set not belonging to any isolation environment (without tags) (it will not fallback to any IP addresses already belonging to other isolation environments). In this example, setting `force: true` means that if there are no addresses in the canary environment subset, service calls will fail (No provider exception).

```yaml
force: true
```

## Cleanup

To avoid affecting other tasks, delete or disable the recently configured traffic isolation rules via Admin.

## Other Matters

In addition to the dynamic environment division demonstrated in this example, you can also specify the traffic tag of the instance during deployment using a special key `dubbo.provider.tag`. This means that when the instance starts successfully, it has already been automatically classified into a traffic environment. Specific configuration methods can be found in the description of [Tag Routing](/en/overview/core-features/traffic/tag-rule/).

Generally, the transmission of `dubbo.tag` traffic tags relies on the help of full-link tracing tools. Dubbo will only be responsible for point-to-point tag transmission between A and B. In the example, this transmission effect is achieved by repeatedly setting it before each point-to-point RPC call. In practice, full-link gray often automatically starts once the tag is set in the full-link context; we only need to extend the Dubbo Filter to read the tag label from the full-link tool context and set it in the Dubbo context to achieve automatic transmission of the full-link in Dubbo. For concrete details, refer to the [Dubbo Link Tracking Integration Example](../../observability). Additionally, aside from RPC calls, other foundational products in the microservices system also need to rely on the full-link context to ensure the transmission of gray identification, ensuring a complete traffic isolation environment.

