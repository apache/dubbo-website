---
type: docs
title: "dubbo:monitor"
linkTitle: "dubbo:monitor"
weight: 1 
description: "dubbo:monitor element"
---


Monitor center configuration. The corresponding class: `org.apache.dubbo.config.MonitorConfig`

| Property | The corresponding class | Type | Requisite | Default | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| protocol | protocol | string | N | dubbo | service governance | Monitor center protocol. "registry" means looking up monitor center from registry. Others mean communicating to monitor center directly | above 2.0.9 |
| address | &lt;url&gt; | string | N | N/A | service governance | Communicating to monitor center directly. address="10.20.130.230:12080" | above 1.0.16 |
