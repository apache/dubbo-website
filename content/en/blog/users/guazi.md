---
title: "Guazi Used Car Dubbo Practice"
linkTitle: "Guazi Used Car"
tags: ["Use Cases"]
date: 2023-01-15
weight: 4
---

## Preface

&emsp;&emsp;With the continuous development of Guazi's business, the system scale is gradually expanding. Currently, there are hundreds of Dubbo applications and thousands of Dubbo instances running on Guazi’s private cloud. Various departments at Guazi are rapidly developing their businesses, and the versions have not had the chance to unify, leading to different usage styles across departments. With the construction of the second data center, the demand for a unified Dubbo version has become increasingly urgent. A production incident related to Dubbo occurred months ago, which became the catalyst for upgrading the Dubbo version in the company.

&emsp;&emsp;Next, I will start from this incident and talk about the upgrade process of the Dubbo version that we have done during this time and the subsequent multi-data center solution for Dubbo.

## 1. Fixing the issue caused by the delayed deletion of ephemeral nodes, leading to providers not being able to recover registration

### Incident Background

&emsp;&emsp;In the production environment, Guazi's internal business lines share a Zookeeper cluster as the Dubbo registration center. In September 2019, a switch in the data center failed, causing a few minutes of network fluctuation in the Zookeeper cluster. After the Zookeeper cluster recovered, under normal circumstances, Dubbo providers should quickly re-register to Zookeeper, but a small portion of providers did not re-register for a long time, only restoring registration after manually restarting the applications.

### Troubleshooting Process

&emsp;&emsp;First, we analyzed the version distribution of the Dubbo services exhibiting this phenomenon, finding that this problem existed in most Dubbo versions, although the proportion of affected services was relatively low. We also did not find related issues on GitHub. Therefore, we deduced that this was an unfixeable and sporadic issue under network fluctuation circumstances.

&emsp;&emsp;Next, we compared the application logs, Zookeeper logs, and Dubbo code logic. In the application logs, after successfully reconnecting to Zookeeper, the provider immediately re-registered, but subsequently, no log was printed. In the Zookeeper logs, after the registration node was deleted, the registration node was not recreated. Correspondingly, in Dubbo’s code, only after `FailbackRegistry.register(url)`’s `doRegister(url)` executed successfully or the thread was suspended could it match the situation in the logs.

```java
    public void register(URL url) {
        super.register(url);
        failedRegistered.remove(url);
        failedUnregistered.remove(url);
        try {
            // Sending a registration request to the server side
            doRegister(url);
        } catch (Exception e) {
            Throwable t = e;

            // If the startup detection is opened, the Exception is thrown directly.
            boolean check = getUrl().getParameter(Constants.CHECK_KEY, true)
                    && url.getParameter(Constants.CHECK_KEY, true)
                    && !Constants.CONSUMER_PROTOCOL.equals(url.getProtocol());
            boolean skipFailback = t instanceof SkipFailbackWrapperException;
            if (check || skipFailback) {
                if (skipFailback) {
                    t = t.getCause();
                }
                throw new IllegalStateException("Failed to register " + url + " to registry " + getUrl().getAddress() + ", cause: " + t.getMessage(), t);
            } else {
                logger.error("Failed to register " + url + ", waiting for retry, cause: " + t.getMessage(), t);
            }

            // Record a failed registration request to a failed list, retry regularly
            failedRegistered.add(url);
        }
    }
```
&emsp;&emsp;Before continuing with the problem investigation, let's clarify these concepts: Dubbo uses Curator as the Zookeeper client by default, and Curator maintains its connection to Zookeeper through sessions. When Curator reconnects to Zookeeper, if the session has not expired, it continues using the original session; if it has expired, a new session is created for reconnection. The ephemeral nodes are bound to the session; when the session expires, the ephemeral nodes under that session will be deleted.

&emsp;&emsp;Continuing to inspect the code of `doRegister(url)`, we found a piece of logic in the `CuratorZookeeperClient.createEphemeral(path)` method: in `createEphemeral(path)`, if a `NodeExistsException` is caught, it considers the ephemeral node creation successful if the node already exists. Initially, this logic appears sound and performs normally in two common scenarios:

1. The session has not expired, and the original node still exists when creating the ephemeral node, so no re-creation is needed.
1. The session has expired, and the original node has been deleted by Zookeeper, leading to successful creation.

```java
    public void createEphemeral(String path) {
        try {
            client.create().withMode(CreateMode.EPHEMERAL).forPath(path);
        } catch (NodeExistsException e) {
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage(), e);
        }
    }
```
&emsp;&emsp;However, there is also an extreme scenario: **The expiration of the Zookeeper session and the deletion of the ephemeral node are not atomic**, which means that when the client receives the session expiration message, the ephemeral node corresponding to that session may not yet have been deleted by Zookeeper. In this case, when Dubbo attempts to create an ephemeral node, it finds the original node still exists, so it does not recreate it. When the ephemeral node is eventually deleted by Zookeeper, Dubbo will believe it has successfully re-registered, but in reality, it has not, leading to the issue we encountered in the production environment.

&emsp;&emsp;At this point, the root cause of the problem has been identified. After locating the issue, we communicated with the Dubbo community and found that colleagues from Kaola also encountered the same problem, further confirming this cause.

### Issue Recreation and Fix

&emsp;&emsp;After pinpointing the problem, we started attempting to reproduce it locally. Since directly simulating the scenario of Zookeeper session expiration but ephemeral nodes not being deleted is quite difficult, we modified the Zookeeper source code to introduce a delay between the session expiration and the deletion logic of ephemeral nodes, indirectly simulating this extreme scenario. We successfully reproduced the issue locally.

&emsp;&emsp;During the investigation, we discovered that an older version of Kafka also encountered a similar issue when using Zookeeper. Based on Kafka's fix for this issue, we determined Dubbo's fix. When capturing a `NodeExistsException` during ephemeral node creation, we would check if the ephemeral node's SessionId differs from the current client’s SessionId; if it does, we would delete and recreate the ephemeral node. After internal fixes and validations, we submitted issues and PRs to the community.

&emsp;&emsp;Kafka similar issue: https://issues.apache.org/jira/browse/KAFKA-1387

&emsp;&emsp;Dubbo registration recovery issue: https://github.com/apache/dubbo/issues/5125

## 2. Guazi's Dubbo Upgrade Journey

&emsp;&emsp;The fix for the issue discussed above has been established, but we clearly cannot apply fixes to every Dubbo version. After consulting the community’s recommended Dubbo versions, we decided to develop an internal version based on Dubbo 2.7.3 to address this problem and take this opportunity to start promoting the company-wide Dubbo version upgrade initiative.

### Why Unify Dubbo Versions
1. After unifying the Dubbo version, we can perform internal emergency fixes for some Dubbo issues (like the registration failure recovery issue mentioned above) on this version.
2. Guazi is currently carrying out the construction of the second data center, and some Dubbo services are gradually migrating to the second data center. Unifying the Dubbo version also lays the groundwork for multi-data center deployment.
3. It is beneficial for us to subsequently unify the management and control of Dubbo services.
4. The current direction of development in the Dubbo community aligns well with some of our company's current demands for Dubbo, such as support for gRPC and cloud-native solutions.

### Why Choose Dubbo 2.7.3
1. Prior to us, Ctrip collaborated with the Dubbo community on upgrading to an internal version of Dubbo, and many compatibility issues were fixed on the community version 2.7.3. Thanks to colleagues at Ctrip for helping us avoid pitfalls~
2. Although Dubbo 2.7.3 was the latest version at the time, it had been released for 2 months, and feedback from community issues indicated that Dubbo 2.7.3 was significantly more compatible than several previous versions.
3. We also consulted the Dubbo community colleagues, who recommended upgrading to version 2.7.3.

### Internal Version Positioning

&emsp;&emsp;The internal Dubbo version developed based on the community version 2.7.3 is considered a transitional version aimed at fixing issues regarding online providers failing to recover registration and some compatibility problems with community Dubbo 2.7.3. Ultimately, Guazi's Dubbo will still follow the community version rather than developing its internal features. Therefore, all issues fixed in the internal version of Dubbo are kept in sync with the community to ensure compatibility for future upgrades to higher versions of community Dubbo.

### Compatibility Validation and Upgrade Process

&emsp;&emsp;After consulting community colleagues about version upgrade experiences, we began the Dubbo version upgrade in late September.
1. **Preliminary Compatibility Validation**
First, we organized some compatibility cases to validate the compatibility of the Dubbo versions used internally by the company with Dubbo 2.7.3. After verification, except for DubboX, Dubbo 2.7.3 is compatible with other Dubbo versions. DubboX is not compatible due to changes made to the Dubbo protocol.
2. **Production Environment Compatibility Verification**
After preliminary validation of compatibility, we collaborated with business lines to select some projects of lower priority and further verified the compatibility of Dubbo 2.7.3 with other versions in the production environment. We also fixed some compatibility issues in the internal version.
3. **Promoting Company-wide Dubbo Version Upgrade**
In early October, after completing the compatibility validation of Dubbo, we began promoting the upgrade across various business lines. By early December, 30% of Dubbo services had completed the version upgrade. According to the schedule, the company plans to complete the unified upgrade of Dubbo versions by the end of March 2020.

### Summary of Compatibility Issues

&emsp;&emsp;The process of promoting the upgrade to Dubbo 2.7.3 was overall quite smooth, but we did encounter some compatibility issues:
* **Permission Denied when Creating Zookeeper Node**
    The Zookeeper username and password are configured in the Dubbo configuration file, but creating a Zookeeper node threw the `KeeperErrorCode = NoAuth` exception, corresponding to two compatibility issues:
    * issues: https://github.com/apache/dubbo/issues/5076
        When Dubbo uses the registry as the configuration center without a configured configuration center, it initializes the configuration center's configuration from the registry's configuration information, resulting in missed username and password leading to this issue.
    * issues: https://github.com/apache/dubbo/issues/4991
        When establishing the connection with Zookeeper, Dubbo reuses a previously established connection based on Zookeeper's address. When multiple registries use the same address but have different permissions, the `NoAuth` problem arises.
    Referencing community PRs, we fixed this in the internal version.

* **Curator Version Compatibility Issue**
    * Dubbo 2.7.3 is not compatible with older versions of Curator, so we upgraded the default Curator version to 4.2.0
    ```xml
    <dependency>
        <groupId>org.apache.curator</groupId>
        <artifactId>curator-framework</artifactId>
        <version>4.2.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.curator</groupId>
        <artifactId>curator-recipes</artifactId>
        <version>4.2.0</version>
    </dependency>
    ```
    * The distributed scheduling framework Elastic-Job-Lite strongly depends on lower versions of Curator, which are not compatible with the Curator version used in Dubbo 2.7.3, causing some blockage in Dubbo's version upgrade work. Considering that Elastic-Job-Lite has not been maintained for a long time, some business lines plan to replace it with other scheduling frameworks.
* **OpenFeign and Dubbo Compatibility Issue**
    issues: https://github.com/apache/dubbo/issues/3990
    Dubbo's `ServiceBean` listens to the Spring `ContextRefreshedEvent` to expose services. OpenFeign triggers the `ContextRefreshedEvent` early, leading to application startup exceptions because the `ServiceBean` had not completed initialization at that time.
    Referencing community PRs, we fixed this issue in the internal version.
* **RpcException Compatibility Issue**
    Older version consumers of Dubbo cannot recognize the `org.apache.dubbo.rpc.RpcException` thrown by Dubbo 2.7 version providers. Therefore, until all consumers are upgraded to 2.7, it is not recommended to change the provider's `com.alibaba.dubbo.rpc.RpcException` to `org.apache.dubbo.rpc.RpcException`.
* **Qos Port Occupation**
    Dubbo 2.7.3 has QoS functionality enabled by default, causing QoS port occupation issues during the upgrade of Dubbo services on physical machines. Disabling the QoS function resolved this.
* **Custom Extension Compatibility Issue**
    There are currently few custom extensions for Dubbo within the business lines, so we have not encountered significant issues with the compatibility of custom extensions, as they mostly stem from package changes, which the business lines will resolve on their own.
* **Skywalking Agent Compatibility Issue**
    We generally use Skywalking for link tracing in our projects, and since the Skywalking agent 6.0 plugins do not support Dubbo 2.7, we uniformly upgraded the Skywalking agent to 6.1.

## 3. Dubbo Multi-data Center Solution

&emsp;&emsp;Guazi is currently constructing the second data center, and Dubbo's multi-data center is a critical topic within this construction. Under the premise of unifying the Dubbo version, we can more smoothly carry out research and development related to the multi-data center for Dubbo.

### Preliminary Plan

&emsp;&emsp;We consulted the Dubbo community for advice and, considering Guazi's cloud platform status, preliminarily determined the Dubbo multi-data center plan.
1. Deploy an independent Zookeeper cluster in each data center. Information will not be synchronized across clusters. This eliminates the issues of cross-data center delays and data inconsistencies in the Zookeeper cluster.
1. When registering Dubbo services, only register with the Zookeeper cluster in the local data center; when subscribing, subscribe to the Zookeeper clusters in both data centers.
1. Implement routing logic prioritizing same data center calls to reduce unnecessary network latency caused by cross-data center calls.

### Prioritizing Same Data Center Calls

&emsp;&emsp;The implementation of prioritizing same data center calls in Dubbo is relatively straightforward, with the relevant logic as follows:
1. Guazi's cloud platform defaults to injecting the data center’s marking information into the container’s environment variables.
1. When providers expose services, they read the data center marking information from the environment variables and append it to the URL of the services to be exposed.
1. When consumers call providers, they read the data center marking information from the environment variables and prioritize calling providers with the same marking information according to the routing strategy.

&emsp;&emsp;Based on the above logic, we implemented the routing functionality through environment variables in Dubbo and submitted PRs to the community.
&emsp;&emsp;Dubbo routing via environment variables PR: https://github.com/apache/dubbo/pull/5348

