---
title: "Exploration and Practice of Cloud Native Observability in Apache Dubbo"
linkTitle: "Exploration and Practice of Cloud Native Observability in Apache Dubbo"
tags: ["apachecon2023", "observability", "metrics", "tracing"]
date: 2023-10-07
authors: ["Song Xiaosheng"]
description: Exploration and Practice of Cloud Native Observability in Apache Dubbo
---

Abstract: This article is organized from the sharing of Song Xiaosheng, a senior engineer at Ping An Yiqian Wallet and an Apache Dubbo committer, at the Community Over Code 2023 conference. The content is mainly divided into five parts:

- I. Building Observability
- II. Multidimensional Metrics System
- III. Link Tracing Interface
- IV. Log Management and Analysis
- V. Stability Practices

## I. Building Observability

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img.png)

First, let's talk about the challenges of cloud-native upgrades. Most companies currently have CICD and OPS to help improve development efficiency and quality, along with containerization for operational efficiency. However, the frequent changes in large-scale containers during the cloud-native era can lead to numerous stability issues. These issues may include known exceptions that we can avoid in advance as well as unavoidable ones like network failures and machine crashes.

If we can detect these issues early, we can mitigate many risks. Thus, having an observability system that timely senses these problems, analyzes anomalies effectively, and quickly recovers the system is of paramount importance in the cloud-native era.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_1.png)

As a microservices RPG framework, it is unrealistic for Dubbo to build a comprehensive observability system or platform, and its functionality does not fit that either. The observability system emphasizes correlation through single or multidimensional observation for diagnosing system issues.

First, let's look at the metrics that measure the health status of the system. Dubbo exposes internal metrics data to external monitoring systems while also collecting internal Dubbo metrics. These monitoring metrics include a lot of application information, host details, Dubbo service tags, and so on. When issues arise, we can use these tags to trace back to the full link system. Then, the entire link system can perform request-level or application-level performance analysis and abnormal diagnostics.

Dubbo supports exporting data to major link platforms with minimal dependency through adaptations to various vendor interfaces. Regardless of the popular platform enterprises choose, after upgrading Dubbo, they can export the links directly.

Additionally, the link system includes full link Trace IDs or local disk IDs. Through these IDs, we can directly navigate from the link system to the logging platform, which contains detailed log contexts that can provide precise anomaly diagnostics.

Dubbo also provides a detailed error code mechanism and expert advice in the form of logs, allowing users to navigate to help documentation on the official website using error codes. 

## II. Multidimensional Metrics System

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_2.png)

In the practice of the multidimensional metrics system in Dubbo, we mainly look at it from two dimensions.

The first is the vertical dimension. There is an access and export process when collecting Dubbo metrics. Dubbo provides an easy-to-use access interface for users and developers. Once accessed, the service collects metrics during its operation through the metrics collectors. Dubbo offers many metrics collectors, including aggregate and non-aggregate metrics.

The collected metrics are temporarily stored in memory. Some metrics (like QPS with sliding window min/max aggregation metrics) will be aggregated for calculation before export to external systems. We support metrics export in the Dubbo QPS service quality or direct queries via HTTP.

The second is the horizontal dimension. Dubbo metrics collection covers areas where anomalies are likely to occur. For example, Dubbo 3 provides three primary centers: the registry, metadata, and configuration centers, where external network interactions are prone to issues.

Another key aspect is RPC circuit sampling, such as request response time, exceptions, unit network, IO metrics, and other related metrics from Dubbo thread pools.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_3.png)

Earlier, we discussed a broad overview of metrics collection; we also researched various popular methodologies to identify which metrics should be collected in Dubbo.

- The first image represents the four golden metrics summarized in Google's SRE book. These metrics help measure service quality at the request level, mainly including latency, traffic, errors, and saturation.
- The second image shows the RED method, emphasizing requests and viewing service health from an external perspective, including rate, errors, and duration.
- The third image depicts the USE method, focusing on internal resource usage, including utilization, saturation, and errors.

It can be seen that all three methodologies include error metrics, which are a significant concern for developers.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_4.png)

We have completed the system refinement of the metrics. In Dubbo 3.2, the multidimensional metrics system is now finished and is undergoing rapid continuous iteration. In this version, a quick integration Spring Boot starter package allows automatic metrics collection. Accessing it can be done via Dubbo's QPS service quality port. If local, it can be accessed through the browser; on the server, it can be accessed using cURL on port 52 with a Metric path, providing detailed default metrics export.

These metrics are prefixed with "Dubbo," with different types reflecting various Dubbo modules, such as consumer-provided request levels across the three registration centers.

The following shows the behavior of current Dubbo metrics; for example, the response time will include some units, referencing the official Prometheus format.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_5.png)

Some may directly reuse the default manager port in Spring Boot; Dubbo has adapted the Spring Boot Actuator extensions. The operation is the same—simply introduce the Spring Boot starter package. There's no need for any additional configuration to view detailed metrics in the Spring port, including built-in JVM metrics and Dubbo metrics.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_6.png)

After integrating the metrics system, if accessed through the command line, one can only see instantaneous data. However, in the monitoring metrics system, we are more concerned with multidimensional vector data. If we treat these data as points, it may be difficult to identify issues, so we need to store this data and view it as applicable vector data.

Dubbo provides default integration for Prometheus metrics collection. Prometheus, as a monitoring system integrating metric storage and monitoring, offers numerous service discovery models. For example, if services are deployed on K8s, metrics can be collected based on K8s label service discovery mechanisms. If a company has a self-built CMDB system, it can extend HTTP interfaces for metrics collection. Besides, files or static service discovery mechanisms can also collect metrics as long as they can discover Dubbo service IPs and service interfaces. Collected metrics will be automatically stored in Prometheus's actual database.

The above image shows the latest response time metrics collected through Prometheus's query interface.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_7.png)

Prometheus metrics emphasize storage and alerts, but for more visual representations, we need to incorporate Grafana. Grafana aims to provide easy-to-access monitoring dashboards for enterprises, as shown in the simple global dashboard image above.

By filtering at the application level / querying by machine IP / and examining service interface dimensions, we can check the service health status. The metrics are generally based on previous methodologies, including QPS, request count, success rate, failure rate, and request delay, among others.

Additionally, some application information metrics are available, such as when upgrading to Dubbo 3, allowing users to see which applications have been updated to the new version, the new application version numbers, instance IP distributions, and resource availability.

## III. Link Tracing Interface

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_8.png)

The metrics previously mentioned are relatively abstract, aiding in problem discovery; next, we will conduct simple problem diagnostics. Microservice systems often have interdependencies, so diagnostics between services rely heavily on a full link system.

For full link systems like Dubbo, the Agent approach was considered, making it convenient for users to integrate, as some metric collection methods could be injected directly at the proxy layer. This makes full link coverage in enterprises quite simple; however, if Dubbo only collects its own metrics, associated risks could arise. After agent integration, issues like bytecode modification incompatibilities could occur, which might be challenging to identify early.

Moreover, Dubbo has researched some open-source link tracing interfaces. Dubbo chose to use a native built-in interface, allowing professionals to handle specialized matters. By adopting various vendor-based full link tracing systems, Dubbo enables rapid adaptation for users with minimal configuration changes for exporting link data.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_9.png)

In the selection of link tracing interfaces, we referred to several popular industry options and selected two for further evaluation: OpenTelemetry and Micrometer.

OpenTelemetry is well-known; it supports multiple languages with a unified API and integrates with most popular third-party full link tracing systems. It is one of the CNCF incubated projects, with many middleware applications already adopting this standard.

Micrometer, on the other hand, is often associated with metrics collection integration. Its major limitation is Java-only support; however, it provides the default metrics collection and link collection support via micrometer-tracing in Spring Boot 3. Additionally, Micrometer can convert to open protocols through bridging packages, indirectly supporting various third-party data collection frameworks. Micrometer itself also adjusts many full link vendor mechanisms through its tuning mechanism.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_10.png)

To unify with the previously used metrics collection, utilizing Micrometer eliminates the need to introduce additional third-party dependencies; simply using the Micrometer Tracing bridge package allows for rapid integration.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_11.png)

The above image illustrates the simple structure of the link tracing system. Dubbo's edge collection primarily gathers RPC request traces. When a consumer triggers a request, if a link ID exists, it will be reused; if not, a new link ID will be generated and reported to the collector. Similarly, consumers will relay link data through RPC context to the provider. The provider will then associate this link data with a parent-child relationship before reporting it to the collector.

The collector initially operates at the memory level, minimizing system performance impact. Asynchronous exports will follow, similar to the aforementioned metrics system, with synchronous collection in memory exporting data asynchronously to third-party link systems.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_12.png)

Integrating link systems is straightforward and primarily involves introducing the Spring Boot Starter dependency package and simple configuration, including details like different vendor export addresses.

Link systems can assist in analyzing performance and anomalies; however, some issues in system diagnostics may require more detailed log contexts. In such cases, the link system appends data to the MDC log system context, extracting link content from the log context to present it in log files.

Log files may also interface with third-party log platforms; if you possess secondary development capabilities, you can embed links allowing the Trace ID to automatically redirect—enabling seamless navigation between the full link system and the logging platform, making issue queries far more efficient.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_13.png)

The above image presents the integration page for Zipkin. It illustrates application-level performance analysis and interface-level performance evaluations. Additionally, we can see some Dubbo metadata; its tags can be associated with metric dashboard metrics.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_14.png)

This depicts Skywalking's format, featuring both list and tabular forms. It utilizes Trace IDs to uncover full link request paths, along with performance and anomaly diagnostics.

## IV. Log Management Analysis

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_15.png)

Dubbo adapts to major logging components through logs. Due to the many systems stemming from our log components' historical development, Dubbo has adapted various logging components via its interfaces.

Areas prone to issues during system operation include service registration and discovery, the registration model for services, service provider registrations, service consumer subscriptions and notifications, and RPC request links.

When these issues arise, the system may experience exceptions. Directly checking exceptions, searching online, or analyzing through source code can be both difficult and time-consuming.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_16.png)

In light of this, Dubbo has created an expert advice document. After upgrading to Dubbo 3, users will find a help document in log entries' SQ links, providing potential reasons for issues and problem-solving approaches.

For those interested in diagnostics, please refer to the official website, which contains numerous problem diagnosis methodologies from seasoned experts, aiming to collaboratively build with community users and developers.

## V. Stability Practices

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_17.png)

Finally, we will introduce stability practices combining metrics, links, and logs—primarily divided into two sections: observing system anomalies and rapid recovery.

Observing system anomalies involves having operations personnel monitoring dashboards, actively discovering alerts, alongside passive notifications via email, SMS, or WeChat. Regardless of the alert format, upon receiving an alert, observable thinking can be applied to investigate common indicators associated with the anomaly.

Through this approach, you might discover certain issues, though these may not necessarily be root causes. In such cases, identify the section of the full link system where the metrics have shown issues, subsequently analyzing the specific problem.

If the issue remains elusive, you can link the full link ID from the link system to the logs to examine detailed reasons. If logs fail to illuminate the issue, root cause analyses using tools may be necessary after isolating the system traffic.

![dubbo-observability-metrics-and-tracing](/imgs/blog/2023/8/apachecon-scripts/observability/img_18.png)

With the earlier cause identification, locating the problem becomes straightforward. Based on these findings, traffic governance can be implemented—such as switching room traffic, limiting traffic, or rolling back the system if anomalies arise.

