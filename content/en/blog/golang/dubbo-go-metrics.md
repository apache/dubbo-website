---
title: "Design of Metrics in Dubbo Go"
linkTitle: "Design of Metrics in Dubbo Go"
tags: ["Go", "Proposals"]
date: 2021-01-11
description: eBay's Deng Ming: Design of metrics in dubbo-go
---

Recently, to implement similar metrics functionality in Apache/dubbo-go (hereinafter referred to as dubbo-go), I spent a lot of time understanding how metrics are implemented in Dubbo. This part is actually placed in a separate project, namely metrics, see https://github.com/flycash/dubbo-go/tree/feature/MetricsFilter under the metrics subdirectory.

Overall, Dubbo's metrics are an excellent module from design to implementation. Theoretically, most Java projects can directly use metrics. However, due to the balance of various non-functionality characteristics such as performance and scalability, the code can seem overwhelming at first glance.

This article will discuss the design of the metrics module in dubbo-go from a broader conceptual and abstract perspective, which is essentially the design of metrics in Dubbo since I just replicated the relevant content from Dubbo into dubbo-go.

Currently, the metrics in dubbo-go are just starting out, with the first PR being: https://github.com/apache/dubbo-go/pull/278

## Overall Design

### Metrics

To understand the design of metrics, we first need to understand what data we need to collect. We can easily list various metrics of concern in the RPC domain, such as the number of calls and response time for each service. For more detail, there are various response time distributions, average response time, and the 99.9 percentile...

However, the above examples are categorized based on the nature of the data. The metrics abstractly discard this classification method and combine data features and presentation forms.

This abstraction can be easily found in the source code.

![img](/imgs/blog/dubbo-go/metrics/p1.png)

The metrics design includes a Metric interface as the top-level abstraction for all data:

In Dubbo, its key sub-interfaces are:

![img](/imgs/blog/dubbo-go/metrics/p2.webp)

For clarity, here are the purposes of these interfaces:

- Gauge: A measurement of real-time data that reflects transient data and is not cumulative, e.g., the current number of JVM threads;
- Counter: A counter metric suitable for recording total calls, etc.;
- Histogram: A histogram distribution metric, for example, can be used to record the response time of an interface, showing the request response time falling within the 50%, 70%, and 90% range;
- Meter: A quantifier used to measure throughput over a period. For example, qps metrics for one minute, five minutes, and fifteen minutes;
- Timer: A combination of Meter + Histogram, recording the qps and distribution of execution times for a piece of code or a method.

Currently, dubbo-go has only implemented FastCompass, which is also a subclass of Metric:

![img](/imgs/blog/dubbo-go/metrics/p3.webp)

This interface is straightforward; it's used to collect the number of executions and response times of subCategory within a period. The concept of subCategory is quite broad, typically representing a service in both Dubbo and dubbo-go.

The key design point here is the angle from which these data abstractions are made.

Many people developing data collection-related systems or features often get stuck on abstracting based on data content, such as abstracting an interface where methods are about obtaining the number of service calls or average response time.

Such abstraction is not impossible and works well in simpler systems, but it lacks generality and scalability.

### MetricManager

Once we define a Metric, it's easy to think about needing something to manage these Metrics. That's what MetricManager is for—corresponding to the IMetricManager interface in Dubbo.

The MetricManager interface is currently quite simple in dubbo-go:

![img](/imgs/blog/dubbo-go/metrics/p4.webp)

Essentially, the subclasses of Metric mentioned earlier can be retrieved from this MetricManager. It is the only external entry point.

Thus, whether reporting collected data or needing to utilize it for certain functionalities, the most important thing is to obtain an instance of MetricManager. For instance, in our recent development integrating Prometheus, we get this MetricManager instance and then extract the FastCompass instance from it to collect data:

![img](/imgs/blog/dubbo-go/metrics/p5.webp)

### MetricRegistry

MetricRegistry is an abstraction of the collection of Metrics. The default implementation of MetricManager uses MetricRegistry to manage Metrics:

![img](/imgs/blog/dubbo-go/metrics/p6.webp)

Thus, it essentially provides methods for registering Metrics and retrieving them.

This raises a question: why do I need a MetricRegistry when I already have a MetricManager? Isn't there some overlap in functionality?

The answer lies in two aspects:

1. Besides managing all Metrics, it also performs additional functions, typically IsEnabled. In the future, we will assign it lifecycle management responsibilities; for example, in Dubbo, this interface also has a clear method;
   
2. There is also a concept of groups in metrics, which should only be managed by MetricManager as it would be inappropriate to leave it to MetricRegistry.

Metrics groups are straightforward. For data collected within the Dubbo framework, they all belong to the Dubbo group. This means if I want to separate non-framework level data—like pure business data—I can borrow a business group. Alternatively, any data collected from the machine itself can be classified under the system group.

Thus, the relationship between MetricManger and MetricRegistry is:

![img](/imgs/blog/dubbo-go/metrics/p7.webp)

### Clock

The Clock abstraction seems useless at first but becomes clearer upon further examination. The Clock has two methods:

![img](/imgs/blog/dubbo-go/metrics/p8.webp)

One retrieves the timestamp, while the other gets the time period (Tick). For instance, data collection might occur every minute, so knowing the current time period is essential. The Clock provides this abstraction.

Many people implementing their metrics frameworks often use the system clock, i.e., the system timestamp. Therefore, all Metrics need to handle clock synchronization issues when collecting or reporting data.

This synchronization challenge can lead to difficulties. For example, if one Metric1 collects data for the current minute while Metric2 collects data from the thirtieth second to the next minute's thirtieth second, although both may collect once a minute, this mismatch occurs.

Another interesting point is that the abstraction provided by Clock allows us not to necessarily handle real-world timestamps. For instance, one might consider designing the Clock implementation based on CPU runtime.

## Example

Let’s showcase this design using the contents of this PR.

In dubbo-go, metricsFilter has been implemented to primarily collect the number of calls and response times, with the core being:

![img](/imgs/blog/dubbo-go/metrics/p9.webp)

Reporting essentially submits the metrics reports to MetricManager:

![img](/imgs/blog/dubbo-go/metrics/p10.webp)

So, it becomes evident that if we want to collect data, we need to obtain an instance of MetricManager first.

The FastCompass implementation saves the service and its response time for this call, which can later be retrieved as needed.

The so-called "as needed" generally refers to when reporting to the monitoring system, such as reporting to Prometheus mentioned earlier. 

Thus, this workflow can be abstractly expressed as:

![img](/imgs/blog/dubbo-go/metrics/p11.webp)

This represents a broader abstraction, indicating we can collect data from this metricFilter as well as from our business. For example, recording the execution time of a segment of code can likewise use FastCompass.

Apart from Prometheus, if a user’s company has its own monitoring framework, they can implement their reporting logic. The data reported only needs to obtain an instance of MetricManager.

## Conclusion

In essence, the entire metrics system can be viewed as a massive provider-consumer model.

Different pieces of data will be collected at different places and times. Some people may feel confused when reading the source code, questioning when data is collected.

Data will only be collected at two types of time points:

1. Real-time collection, as in the metricsFilter example I mentioned;
   
2. The other resembles Prometheus. Each time Prometheus triggers the collect method, it collects data from all types (e.g., Meter, Gauge) and reports it, which can be termed scheduled collection;

Dubbo collects a lot of data:

![img](/imgs/blog/dubbo-go/metrics/p12.webp)

I won't discuss the specific implementations one by one; those interested can check the source code. This data is what we will implement gradually in dubbo-go, and we welcome everyone to keep an eye out or contribute code.

## Author Information

Deng Ming, graduated from Nanjing University, employed in eBay's Payment department, responsible for refund business development.

