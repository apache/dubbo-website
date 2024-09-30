---
aliases:
    - /en/overview/tasks/extensibility/
    - /en/overview/tasks/extensibility/
description: Demonstrates the usage of Dubbo's extensibility capabilities.
linkTitle: Custom Extensions
no_list: true
title: Custom Extensions
type: docs
weight: 6
---

This section introduces Dubbo's extensibility features through the following tasks.

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./filter/" >}}'>Custom Filter</a>
                </h4>
                <p>Custom filters can be dynamically loaded using the SPI mechanism, allowing for unified processing and validation of returned results, reducing interruptions for developers.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./router/" >}}'>Custom Router</a>
                </h4>
                <p>Custom routing strategies can be implemented based on actual usage scenarios during service calls, effectively improving service throughput and latency.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./protocol/" >}}'>Custom Protocol</a>
                </h4>
                <p>Custom transport protocols can be used for different heterogeneous systems, masking the differences between protocols for better system integration.
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./registry/" >}}'>Custom Registry Center</a>
                </h4>
                <p>Integrating services from different registry centers into the Dubbo framework, custom registry centers serve as a cutting edge for bridging heterogeneous service systems.
                </p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}

