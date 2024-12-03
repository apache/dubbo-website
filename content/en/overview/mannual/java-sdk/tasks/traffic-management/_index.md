---
aliases: [/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/traffic/]
description: Demonstration of how to use Dubbo's traffic governance features.
linkTitle: Traffic Control
no_list: true
title: Traffic Control
type: docs
weight: 5
---

We demonstrate the basic usage of Dubbo's traffic control rules through a mall microservice project developed with Dubbo, including the following scenarios:

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
                <p>By dynamically adjusting the service timeout at runtime, it can effectively address issues such as unreasonable timeout settings and frequent timeouts caused by system emergencies, improving system stability.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./retry/" >}}'>Increase Retry Count</a>
                </h4>
                <p>Retrying after a failed initial service call can effectively improve the overall success rate of calls.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./accesslog/" >}}'>Access Log</a>
                </h4>
                <p>Access logs can effectively record all service request information processed by a machine over a period, and enabling access logs dynamically at runtime is very helpful for troubleshooting.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./region/" >}}'>Same Data Center/Region Priority</a>
                </h4>
                <p>Same data center/region priority means prioritizing service providers in the same data center/region when the application calls the service, avoiding network latency caused by crossing regions, thereby reducing response time.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./isolation/" >}}'>Environment Isolation</a>
                </h4>
                <p>By dividing one or more applications in the cluster into logically isolated environments, it can be used to build gray environments or multiple testing environments.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./arguments/" >}}'>Parameter Routing</a>
                </h4>
                <p>For example, routing traffic based on user ID, forwarding a small portion of user requests to the newly released product version to verify the stability of the new version and gather user experience feedback.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./weight/" >}}'>Weight Ratio</a>
                </h4>
                <p>By dynamically adjusting the weights of a single or a group of machines, the distribution of request traffic can be changed at runtime, achieving dynamic proportional traffic routing.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./mock/" >}}'>Service Downgrade</a>
                </h4>
                <p>The core goal of service downgrade is to maintain functional integrity as much as possible by returning degraded results when weak dependencies are unavailable or fail.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./host/" >}}'>Fixed Machine Traffic Guidance</a>
                </h4>
                <p>By forwarding requests to a fixed provider machine, it helps quickly reproduce development or online issues.</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}

