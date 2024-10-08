---
title: "The Practice of Dubbo at Guazi Used Car"
linkTitle: "The Practice of Dubbo at Guazi Used Car"
date: 2019-01-05
description: >
    Currently, hundreds of Dubbo applications and thousands of Dubbo instances are running on Guazi's private cloud.
---

## Preface

&emsp;&emsp;With the continuous development of Guazi's business, the system scale is gradually expanding. Currently, hundreds of Dubbo applications and thousands of Dubbo instances are running on Guazi's private cloud. Each department of Guazi has rapidly developed its own versions without timely alignment. With the construction of the second data center, the need for a unified Dubbo version has become increasingly urgent. A few months ago, a production incident related to Dubbo occurred, which became a catalyst for the company's Dubbo version upgrade.

&emsp;&emsp;Next, I will start from this incident to discuss the journey we took to upgrade the Dubbo version and the subsequent multi-data center solutions for Dubbo.

## 1. Fixing the Problem of Providers Not Recovering Registration Due to Untimely Deletion of Ephermal Nodes

### Incident Background

&emsp;&emsp;In the production environment, various business lines within Guazi share a Zookeeper cluster as the registration center for Dubbo. In September 2019, a switch in the data center failed, causing a few minutes of network fluctuation in the Zookeeper cluster. After the Zookeeper cluster recovered, Dubbo providers should have quickly re-registered with Zookeeper under normal circumstances, but a small number of providers did not re-register for a long time, only recovering registration after manually restarting the application.

### Investigation Process

&emsp;&emsp;First, we analyzed the version distribution of the Dubbo services experiencing this phenomenon and found that the issue existed across most versions, with a relatively low occurrence rate. There were no related issues found in GitHub. Therefore, we deduced that this was an unaddressed problem that sporadically occurred under network fluctuation scenarios.

&emsp;&emsp;Next, we compared the application logs of the problematic apps, Zookeeper logs, and Dubbo code logic. In the application logs, after successfully reconnecting to Zookeeper, the provider immediately attempted to re-register, after which there were no log prints. In the Zookeeper logs, after the registration node was deleted, the node was not recreated. In the Dubbo code, this scenario only aligns with cases where the execution of `FailbackRegistry.register(url)`’s `doRegister(url)` was successful or the thread was suspended.

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
&emsp;&emsp;Before we continued investigating the issue, let's clarify these concepts: Dubbo uses Curator as the Zookeeper client by default, and Curator maintains a connection with Zookeeper through sessions. When Curator reconnects to Zookeeper, if the session has not expired, it continues using the original session; if the session has expired, it creates a new session to reconnect. The ephemeral node is bound to the session, and when the session expires, the ephemeral nodes under that session are deleted.

&emsp;&emsp;Continuing to investigate the `doRegister(url)` code, we found the logic in the `CuratorZookeeperClient.createEphemeral(path)` method: it captures `NodeExistsException` during `createEphemeral(path)`. When attempting to create an ephemeral node, if the node already exists, it considers the creation successful. This logic seems initially correct and performs normally in two common scenarios:

1. Session has not expired, and the original node still exists when creating the Ephemeral node, so there is no need to recreate it.
2. Session has expired, and when creating the Ephemeral node, the original node has been deleted by Zookeeper, so it creates successfully.

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
&emsp;&emsp;However, there is also an extreme scenario where **the expiration of Zookeeper's session and the deletion of ephemeral nodes are not atomic**, meaning that when the client receives the session expiration message, the ephemeral nodes corresponding to the session may not have been deleted by Zookeeper yet. At this point, when Dubbo attempts to create ephemeral nodes, it finds that the original nodes still exist, hence it does not recreate them. Once the ephemeral nodes are deleted by Zookeeper, it will lead to a situation where Dubbo assumes a successful re-registration occurred, while in reality, it did not, which is the problem we encountered in production.

&emsp;&emsp;At this point, the root cause of the issue has been identified. After locating the problem, we communicated with the Dubbo community and discovered that colleagues from Koala had also encountered the same issue, which further confirmed this cause.

### Reproduction and Fix of the Problem

&emsp;&emsp;After pinpointing the issue, we began to attempt to reproduce it locally. Directly simulating the scenario of Zookeeper's session expiring while ephemeral nodes are not deleted is relatively difficult, so we modified the Zookeeper source code to add a sleep period in the logic for session expiration and deletion of ephemeral nodes, indirectly simulating this extreme scenario and reproducing the issue locally.

&emsp;&emsp;During the investigation, we found that older versions of Kafka also encountered similar issues when using Zookeeper. We referred to Kafka's fix for this problem to determine Dubbo’s repair plan. When capturing a `NodeExistsException` during the creation of ephemeral nodes, we decided to check whether the SessionId of the ephemeral node was different from the current client's SessionId. If they differed, we would delete and recreate the ephemeral node. After internal fixes and verifications, we submitted issues and PRs to the community.

&emsp;&emsp;Similar Kafka issue: https://issues.apache.org/jira/browse/KAFKA-1387

&emsp;&emsp;Dubbo registration recovery issue: https://github.com/apache/dubbo/issues/5125

## 2. The Journey of Dubbo Upgrade at Guazi

&emsp;&emsp;The fix plan mentioned above has been determined, but obviously, we cannot fix every version of Dubbo. After consulting the community's recommended versions, we decided to develop an internal version based on Dubbo 2.7.3 to fix this issue and took this opportunity to start promoting a unified upgrade of Dubbo versions across the company.

### Why Unify Dubbo Versions
1. By unifying the Dubbo version, we can internally fix some urgent Dubbo issues (like the Dubbo registration recovery failure issue mentioned above).
2. Guazi is currently building a second data center, and some Dubbo services are gradually migrating to the second data center. Unifying the Dubbo version also lays the groundwork for multi-data center support.
3. It is beneficial for us to manage Dubbo services uniformly in the future.
4. The current development direction of the Dubbo community aligns with some of our company's current demands for Dubbo, such as support for gRPC and cloud-native technologies.

### Why Choose Dubbo 2.7.3
1. Before us, Ctrip collaborated with the Dubbo community to upgrade its internal Dubbo version and resolved many compatibility issues in the community version 2.7.3. We are grateful to Ctrip's team for helping us navigate these pitfalls.
2. Although Dubbo 2.7.3 was the latest version at the time, it had already been released for two months. Based on community issues feedback, Dubbo 2.7.3 substantially improved compatibility compared to several previous versions.
3. We also consulted with colleagues from the Dubbo community, who recommended upgrading to version 2.7.3.

### Internal Version Positioning

&emsp;&emsp;The internally developed version of Dubbo based on community Dubbo 2.7.3 is a transitional version aimed at fixing the online provider failure to recover registration, as well as some compatibility issues of community Dubbo 2.7.3. Ultimately, Guazi's Dubbo will need to follow the community versions, not develop its internal functions. Therefore, all issues fixed in the internal version of Dubbo are kept synchronized with the community to ensure later compatibility for upgrades to higher community versions.

### Compatibility Validation and Upgrade Process

&emsp;&emsp;After consulting community colleagues about version upgrade experiences, we began the upgrade work for the Dubbo version in late September.
1. **Preliminary Compatibility Validation**
First, we outlined several compatibility cases that needed validation, verifying compatibility one by one for internally used Dubbo versions against Dubbo 2.7.3. After validation, Dubbo 2.7.3 was found compatible with all versions except Dubbo X, which is incompatible due to changes in the Dubbo protocol.
2. **Production Environment Compatibility Verification**
After preliminary compatibility validation, we collaborated with business lines to select some projects with lower urgency for further compatibility validation in the production environment between Dubbo 2.7.3 and other versions. Internally, we fixed some compatibility issues in the internal version.
3. **Promoting Company-wide Dubbo Version Upgrade**
In early October, having completed compatibility validation for Dubbo, we began promoting the upgrade of Dubbo across various business lines. By early December, 30% of Dubbo services had completed the version upgrade. According to the timeline, we expect to complete the unified upgrade of the company's Dubbo version by the end of March 2020.

### Summary of Compatibility Issues

&emsp;&emsp;Overall, the process of promoting the upgrade to Dubbo 2.7.3 went relatively smoothly, although we encountered some compatibility issues:
* **Permission Denied When Creating Zookeeper Node**
    The Dubbo configuration file already has the Zookeeper username and password configured, but an exception `KeeperErrorCode = NoAuth` is thrown when creating Zookeeper nodes. This situation corresponds to two compatibility issues:
    * issues: https://github.com/apache/dubbo/issues/5076
        When Dubbo is not configured with a configuration center, it defaults to using the registration center as the configuration center. During the initialization of the configuration center's configuration through the registration center's info, the lack of username and password causes this issue.
    * issues: https://github.com/apache/dubbo/issues/4991
        When establishing a connection with Zookeeper, Dubbo reuses previously established connections based on the Zookeeper address. If multiple registration centers use the same address but have different permissions, the `NoAuth` problem will occur.
        We fixed this in the internal version by referencing the community PR.

* **Curator Version Compatibility Issue**
    * Dubbo 2.7.3 is incompatible with lower versions of Curator, so we decided to upgrade the Curator version to 4.2.0.
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
    * The distributed scheduling framework Elastic-Job-Lite strongly relies on lower versions of Curator, which is incompatible with the Curator version used by Dubbo 2.7.3. This created some blockages in the Dubbo version upgrade work. Considering that Elastic-Job-Lite has not been maintained for some time, some business lines plan to replace it with other scheduling frameworks.
* **OpenFeign and Dubbo Compatibility Issues**
    issues: https://github.com/apache/dubbo/issues/3990
    The Dubbo ServiceBean listens to the Spring ContextRefreshedEvent to expose services. OpenFeign prematurely triggers the ContextRefreshedEvent, causing an application startup exception when ServiceBean has not finished initialization.
    We fixed this issue in the internal version based on community PR.
* **RpcException Compatibility Issue**
    Lower version Dubbo consumers cannot recognize `org.apache.dubbo.rpc.RpcException` thrown by Dubbo 2.7 version providers. Therefore, until all consumers are upgraded to 2.7, it is advised not to change the provider's `com.alibaba.dubbo.rpc.RpcException` to `org.apache.dubbo.rpc.RpcException`.
* **Qos Port Occupation**
    By default, Dubbo 2.7.3 enables the QoS functionality, leading to port occupation issues when upgrading Dubbo services on physical machines. Disabling QoS resolves this.
* **Custom Extension Compatibility Issues**
    Since there are relatively few custom extensions for Dubbo among business lines, there haven't been many difficult compatibility issues, mostly related to package changes that business lines can fix themselves.
* **Skywalking Agent Compatibility Issues**
    We typically use Skywalking for tracing, but Skywalking agent 6.0 does not support Dubbo 2.7. Hence, we standardized the upgrade of Skywalking agent to 6.1.

## 3. Dubbo Multi-Data Center Plan

&emsp;&emsp;Guazi is currently working on constructing a second data center, and multi-data center support for Dubbo is a significant topic during this building process. With the unification of Dubbo versions, we can more smoothly carry out research and development related to multi-data centers.

### Preliminary Plan

&emsp;&emsp;We consulted the Dubbo community for recommendations and, considering Guazi's cloud platform status, initially determined a multi-data center plan for Dubbo:
1. Deploy an independent Zookeeper cluster within each data center. The clusters will not synchronize information. This eliminates issues of cross-data-center delays and data inconsistency in the Zookeeper clusters.
2. When registering Dubbo services, they will only register on the local data center's Zookeeper cluster; for subscriptions, they will subscribe to both data center's Zookeeper clusters.
3. Implement routing logic that prioritizes calls within the same data center, reducing unnecessary network delays caused by cross-data-center calls.

### Same Data Center Call Priority

&emsp;&emsp;The implementation of Dubbo's same data center call priority is relatively simple, as follows:
1. Guazi's cloud platform automatically injects data center identifier information into the container's environment variables.
2. When providers expose services, they read the data center flag from environment variables and append it to the URL of the services to be exposed.
3. When consumers call providers, they read the data center flag from environment variables and prioritize calling providers with the same flag information per routing strategy.

&emsp;&emsp;Based on the logic above, we implemented a basic routing feature in Dubbo through environment variables and submitted a PR to the community.
&emsp;&emsp;Dubbo routing via environment variables PR: https://github.com/apache/dubbo/pull/5348

