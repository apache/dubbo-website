---
aliases:
    - /en/overview/tasks/traffic-management/
    - /en/overview/tasks/traffic-management/
description: Demonstrates how to use Dubbo's traffic management features.
linkTitle: Sample Application Architecture
title: Sample Application Architecture
type: docs
weight: 1
---

This task demonstrates the traffic control capabilities of Dubbo based on a simple online shopping mall microservice system.

{{% alert title="Note" color="warning" %}}
All capabilities demonstrated in this example are implemented based on [Dubbo Routing Rules](/en/overview/what/core-features/traffic/introduction/). For detailed information on how they work, please check the specifics.
{{% /alert %}}


The architecture diagram of the online mall is as follows:

![shop-arc](/imgs/v3/traffic/shop-arc.png)

The system consists of 5 microservice applications:
* `Frontend Shopping Mall Home`, which serves as the web interface interacting with users, calling `User`, `Detail`, `Order`, etc., to provide user login, product display, and order management services.
* `User Service`, responsible for user data management and identity verification.
* `Order Service`, providing order creation and query services, relying on the `Detail` service to validate product stock information.
* `Detail Service`, displaying detailed product information and calling the `Comment` service to show user comments on products.
* `Comment Service`, managing user comments on products.

## Deploying the Mall System

For convenience, we will deploy the entire system on a Kubernetes cluster. Execute the following command to complete the mall project deployment. The source code example is in [dubbo-samples/task](https://github.com/apache/dubbo-samples/tree/master/10-task/dubbo-samples-shop).

```sh
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/10-task/dubbo-samples-shop/deploy/All.yml
```

The complete deployment architecture diagram is as follows:

![shop-arc](/imgs/v3/traffic/shop-arc-deploy2.png)

The `Order Service` has two versions, `v1` and `v2`, with `v2` being the newly released optimized version of the order service.
* Version v1 simply creates orders without displaying order details.
* Version v2 displays the delivery address details after the order is created successfully.

Both the `Detail` and `Comment` services also have two versions, `v1` and `v2`, demonstrating the effect of traffic diversion across multiple versions.
* Version `v1` provides services for all requests by default.
* Version `v2` simulates services deployed in specific regions, so the `v2` instances carry specific labels.

Execute the following commands to ensure all services and Pods are running normally:
```sh
$ kubectl get services -n dubbo-demo

```

```sh
$ kubectl get pods -n dubbo-demo

```

To ensure the integrity of the system, in addition to the several microservice applications related to the mall, examples also start up Nacos registration configuration center, Dubbo Admin Console, and Skywalking full-link tracing system in the background.

```sh
$ kubectl get services -n dubbo-system

```

```sh
$ kubectl get pods -n dubbo-system

```

## Obtaining Access Address
Execute the following commands to map the cluster ports to local ports:

```sh
kubectl port-forward -n dubbo-demo deployment/shop-frontend 8080:8080
```

```sh
kubectl port-forward -n dubbo-system service/dubbo-admin 38080:38080
```

```sh
kubectl port-forward -n dubbo-system service/skywalking-oap-dashboard 8082:8082
```

At this point, open your browser to access the following addresses:
* Mall Home Page `http://localhost:8080`
* Dubbo Admin Console `http://localhost:38080`
* Skywalking Console `http://localhost:8082`

## Task Items
Next, try to add some traffic control rules to the mall through the following task items.

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./timeout/" >}}'>Adjust Timeout</a>
                </h4>
                <p>By dynamically adjusting the service timeout during runtime, it can effectively address issues such as unreasonable timeout settings and frequent timeouts due to system anomalies, improving system stability.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./retry/" >}}'>Increase Retry Count</a>
                </h4>
                <p>Retries after the initial service call failure can effectively increase the overall call success rate.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./accesslog/" >}}'>Access Log</a>
                </h4>
                <p>Access logs can effectively record all service request information processed by a machine within a certain period. Dynamically enabling access logs in runtime is very helpful for troubleshooting.
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./region/" >}}'>Same Data Center/Region Priority</a>
                </h4>
                <p>Same data center/region priority means prioritizing calls to service providers in the same data center/region when invoking services, avoiding network delays caused by cross-region calls, thereby reducing response time for calls.
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./isolation/" >}}'>Environment Isolation</a>
                </h4>
                <p>By logically isolating one or more applications in a cluster, this can be used for gray environments or building multiple testing environments.
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./arguments/" >}}'>Parameter Routing</a>
                </h4>
                <p>For example, route traffic based on user ID, forwarding a small portion of user requests to the newly released product version to validate the stability of the new version and gather user feedback on product experience.
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./weight/" >}}'>Weight Ratio</a>
                </h4>
                <p>By dynamically adjusting the weight of a single or a set of machines through rules, the distribution of request traffic can be altered in runtime to achieve dynamic, proportional traffic routing.
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./mock/" >}}'>Service Downgrade</a>
                </h4>
                <p>The core goal of service downgrade is to maintain functional integrity by returning downgraded results when weak dependencies are unavailable or calls fail.
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./host/" >}}'>Fixed Machine Traffic Diversion</a>
                </h4>
                <p>By forwarding requests to a specific provider machine, this helps quickly reproduce development or online issues.
                </p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}

