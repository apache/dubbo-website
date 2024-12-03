---
date: 2023-03-22
title: "The First National Government-Enterprise Procurement Cloud Platform: The Mixed Cloud Cross-Network Solution Practice of Zhengcai Cloud"
linkTitle: "Zhengcai Cloud"
tags: ["User Case"]
weight: 10
---


For companies with a cloud-island business structure, the cloud platform is an internal, fully controllable local area network, while the island end is an independent internal network with its own security network policy. When cloud-island communication is required, certain ports need to be opened based on demand and customer requirements, which incurs costs and is not completely controllable. If the demand for cross-network communication increases, it will gradually become a pain point. If a transparent cross-network transmission network can be established, along with good top-level design, a better balance can be sought in business support, security control, and operational costs.

This article will introduce the technical challenges faced during the implementation of the cross-network solution based on Dubbo in Zhengcai Cloud, community cooperation, and some deeper abstract thoughts. Compared to companies that use public cloud and self-built private cloud in the industry, the cross-network data transmission in the government-enterprise business scenario of Zhengcai Cloud has both commonalities and its own characteristics, hoping to provide new ideas or inspirations.

## Introduction

A stable, efficient, and reliable infrastructure is the foundational cornerstone for internet companies to handle peak business traffic. As the foundational technology platform of Zhengcai Cloud, the Basic Platform Department has been committed to ensuring that all online production systems within the company rely on a stable, secure, low-cost, and sustainable operational technology platform through the implementation of industry-leading technologies.

Due to the heavy use of the Dubbo framework by the company, the **cross-network data transmission system** is generally developed based on Dubbo's features, with multiple versions of implementation within Zhengcai Cloud.

As early as a few years ago, Zhengcai Cloud launched a solution based on Dubbo Filter forwarding, which solved issues such as unidirectional data transmission from island to cloud and security authentication. Additionally, business departments have also introduced their own point-to-point network solutions based on their needs, achieving a certain degree of transparent transmission.

Combining the exploration and practice of the past two years, as well as the maturity of relevant technologies in the industry, in the second half of 2022, we integrated and upgraded various cross-island solutions into what is now the **High-Speed Road** solution, ensuring cross-island standardization while solving many business pain points faced in previous solution implementations, including:

- **Unidirectional Transmission**: Due to architectural reasons, a bidirectional requirement would necessitate a parallel redeployment, which is costly.

- **High Cost of Whitelist Access**: The point-to-point mesh architecture requires whitelisting for every pair, and due to the special nature of government and enterprise networks, the access process is complex and slow.

- **High Platform Maintenance Costs**: Each business department has its own data transmission platform, leading to redundant construction and high operational costs.

- **Lack of Common Functions**: Core functions can be developed as needed by businesses, but public features such as data auditing, link tracing, and observability often do not receive sufficient investment.


## 1. Evolution of the Cross-Network Data Transmission System

### 1.1 Historical Architecture

![img](/imgs/v3/users/zcy-1.png)

From left to right, from bottom to top, module introduction:

- **Business Web**: The business Web, as the data sender, carries cross-island information when calling the local cluster Provider (Dubbo context).

- **Island Business Center**: Local virtual Provider intercepts cross-island requests through Filter and transfers them to the cloud platform's Dubbo gateway via http. After returning data, it deserializes and sends it back to the island business web.

- **Dubbo Gateway**: Receives Http requests and performs generalized calls to the cloud Provider, processing the data and returning to the business center.

- **Cloud Business Center**: Ordinary Dubbo Provider.


### 1.2 High-Speed Road Architecture

![img](/imgs/v3/users/zcy-2.png)

**1.2.1 Tunnel Mechanism**

The tunneling technique is a method of transmitting data between networks using **infrastructure** of the **Internet**. The **data** (or payload) transmitted via tunnels can be data frames or packets of different protocols.

In the high-speed road architecture, the concept of tunneling is used. At both ends (business layer), it uses the private Dubbo protocol, while during cross-network transmission, the http protocol is used, which can be better identified and forwarded by intermediate devices and gateways. The greatest convenience of this mechanism lies in its low invasiveness to businesses. No modifications are needed for business cluster applications.
![img](/imgs/v3/users/zcy-3.png)


Apart from routing tags, the outbound/inbound Dubbo protocol byte stream contains no business external information, allowing it to route any Dubbo request.

![img](/imgs/v3/users/zcy-4.png)



**1.2.2 Main Nodes**

**Client SDK**: Does not change the way users use Dubbo, providing various forms of routing for Dubbo.

**Dubbo Outbound Gateway**: Proxies Dubbo traffic outbound.

**Dubbo Inbound Gateway**: Proxies Dubbo traffic inbound.

**Unified Gateway**: Based on Apisix, it proxies all traffic across networks and can extend features such as authentication, auditing, and rate limiting.



## 2. Challenges and Responses

As mentioned in the introduction, the existing several solutions have several design problems that limit their usage scenarios after implementation. In terms of architecture, we proposed the high-speed road plan, choosing a full-duplex peer-to-peer network transmission framework. In terms of roles, the cloud platform acts as a special island-end application, adhering to P2P implementation principles. For users, the high-speed road is a tunnel leading to the island end, adhering to the principle of transparency for users. Let’s first look at some challenges faced during the platform construction process and their solutions.

### 2.1 Technical Challenges

Combining the current situation faced by the cross-network data transmission system and researching the industry’s Dubbo cross-network solutions, we established the following three-phase goals for platform construction:

- **Phase One Goal**: Network capability construction, simply establishing a transmission channel based on Dubbo, keeping the upper-layer functions unchanged.
- **Phase Two Goal**: In business, identify pilot projects based on feedback and iterate quickly; technically, seek collaboration from the Dubbo community to strengthen control over Dubbo-related technological risks while extracting common features to provide feedback to the community.
- **Phase Three Goal**: Abstract a more universal network framework to allow independent expansion of the language layer, transport protocol layer, and middleware layer, enabling one-click switching.

After the basic implementation of the above three-phase goals, the high-speed road system can not only operate but also possess powerful scalability, better accommodating business requirements and co-construction. In the process, we must resolve numerous technical problems.

**2.1.1 Client Routing**

As mentioned in the historical proposals, the scenario is limited to unidirectional data transmission from the island to the cloud, characterized by:

- **Client Has No Routing Capability**: The Consumer side can only specify whether to route to the cloud platform, but cannot specify other island ends.

- **Filter-Based Extension**: Dubbo's Filter is not designed for routing, making it difficult to expand on this basis.

- **Local Provider Role Required**: Requests initiated by the Consumer side must be served by a Provider registered under Zookeeper. The Filter then determines whether to forward based on the context, which restricts the business side from accessing cross-network unless a local Provider application (even an empty one) is deployed.

One of the problems we aim to solve is breaking the unidirectional transmission bottleneck, enabling clients to freely route to their desired cloud/island targets. We designed the following routing methods:

- **Annotation Method**: Using the common parameters provided by @DubboReference to set routing targets, achieving method-level routing.

  ```java
  @DubboReference(check = false, parameters = {"ENV_SHANGHAI", "ALL"}) //all means all methods, which can be specified separately
  private DemoService demoService;
  ```

- **Config Center Specification**: Information like parameters = {"ENV_SHANGHAI", "ALL"} is configured in the config center, achieving the same effect, which is code-intrusive.

- **Thread Specification**: This method is the most flexible.

  ```java
  AddressZoneSpecify.setAddress(Environment.SHANGHAI);
  demoService.play();
  ```

No matter the routing method, based on the "User Transparency" principle, users' usage of Dubbo remains unchanged.



**2.1.2 Switching Dubbo Request Addresses**

Client routing minimally invades business code, achieving the goal of transparently invoking remote services. However, users still need to deploy a set of virtual Provider applications to receive requests and route them according to rules.

To avoid deploying unnecessary applications, we need a mechanism to switch Dubbo traffic directly to remote.

![img](/imgs/v3/users/zcy-5.png)

After resolving the switching issue, the local APP2 is no longer necessary, and even zk can be removed. Of course, if the business requires both local and remote calls simultaneously, they can continue to exist.

![img](/imgs/v3/users/zcy-6.png)

Originally, we planned to implement the capability of dynamically switching addresses through Dubbo's Route custom extension. After reviewing materials, we found that Dubbo has already provided similar capabilities.

https://cn.dubbo.apache.org/zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/specify-ip/

This feature is implemented in Dubbo's sub-project dubbo-spi-extensions, also in the form of Route extension.

However, during actual use, we encountered the following issues:

- **Does Not Support Dubbo2**: When using Dubbo2, it directly reminds with an exception that it is not supported yet.
- **NPE Exception**: NPE exceptions occurred in certain scenarios when making calls.
- **Loss of Incomplete Information**: When constructing the new Invocation under Router, information such as version and group was lost.
- **Retry Exception**: If the remote Provider encounters an exception, when the client retries, it may choose local cluster Provider calls, causing errors.

As a feature in its early stage, we understand there can be instability. But as a technical highlight of our cross-network solution, it must be resolved. Therefore, we submitted patches to the Dubbo community via PR. In this process, we contacted Dubbo PMC’s Yuan Yundao to discuss and improve the PR, until all known issues were fixed.



**2.1.3 Implementation of the Outbound Gateway**

In the diagram, by switching addresses, we seem to be able to directly access remote applications with a very simple architecture. Unfortunately, several difficult problems remain:

- **Limitations of Gateway Components**: Between cloud-island and island-island, a series of gateway components exist to provide forwarding and load balancing functions, such as SLB, NGINX, and WAF. These components cannot identify and forward private Dubbo traffic.
- **High Cost of IP Whitelist Access**: Similar to P2P schemes, point-to-point IP whitelists must be opened, which is very costly.
- **Complex Upgrade Maintenance**: Clients forward by integrating the SDK. If traffic needs to be hijacked for expansion later, all accessing applications must be upgraded simultaneously.

![img](/imgs/v3/users/zcy-7.png)


To address these issues, we must introduce the role of the Dubbo gateway in our design to achieve the following objectives.

①  **IP Convergence at Both Ends**

- Significantly reduces the number of long connections at the gateway.
- Weakens the service registration discovery process (each environment only needs one Dubbo gateway, which can be configured for mutual discovery).
- Simplifies authentication and verification processes. A single link can use a whitelist, while a group can only configure complex authentication.

②  **Functional Convergence at Both Ends**

- The client SDK focuses on routing functions, requiring minimal upgrades.
- Extended functions are placed in Dubbo-Proxy, allowing for unified upgrades without business-side awareness.

Dubbo-Proxy, as a business gateway, can reduce the invasion to the business side and serve the role similar to a distributed runtime (Dapr). However, some real-world technical problems need to be resolved before introducing it. The most important one is how to receive unfamiliar Dubbo traffic and then forward it. After conducting some relevant research, two available schemes were identified:

-  **General Provider**: Directly register an ordinary general service in Dubbo-Proxy, allowing the client SDK to utilize the Filter to hijack traffic before calling the general service for post-processing data returns.

-  **Register Virtual Nodes**: This scheme comes from Yuanyun. When the client subscribes to remote nodes in local zk, it informs the Proxy, which, after acquiring the subscription information (pre-subscribing to all zk changes), actively registers the corresponding virtual service (parameters for registering a node in zk are just strings) on zk. This way, the client’s remote traffic is “fooled” into the Proxy, which then uses service-side generalization to receive requests and forward them.

Both of these plans can implement an outbound gateway. However, the design requires multiple interactions between roles to achieve the objectives. So, is there a simpler way to directly support receiving and forwarding?

First, we researched Dubbo's source code to see how the Provider handles unfamiliar traffic (without the corresponding service) and if there are extension points that can be intercepted. It was found that at the stage of Byte stream parsing, Dubbo checks for the Service, and does not throw exceptions if it does not exist.

![img](/imgs/v3/users/zcy-8.png)

In the lifecycle of Provider handling, Decode occurs at an early stage, leaving almost no extension points to intercept and process it. Due to the philosophy of fast failure, early detection can avoid unnecessary code execution costs later. However, compared to Spring, Dubbo has shortcomings in extensibility, lacking a corresponding extension mechanism for a general exception.

We decided to build upon the decode to add an extension for this exception. The main idea is to catch that exception at the point where decode is called, retrieve the implementation through SPI, allowing customization of exception messages and control of the decode process for retries. This modification is not very difficult and passed testing on a private version, and a PR was submitted to the community. During this process, Yuan Yundao helped find a concurrency safety bug and provided many suggestions to reduce risk.

```java
// After decoding, whether an exception occurs or not, this method will be entered
    void handleRequest(final ExchangeChannel channel, Request req) throws RemotingException {
        if (req.error != null) {
            // Give ExceptionProcessors a chance to retry request handle or custom exception information.
            String exPs = System.getProperty(EXCEPTION_PROCESSOR_KEY);
            if (StringUtils.isNotBlank(exPs)) {
                ExtensionLoader<ExceptionProcessor> extensionLoader = channel.getUrl().getOrDefaultFrameworkModel().getExtensionLoader(ExceptionProcessor.class);
                ExceptionProcessor expProcessor = extensionLoader.getOrDefaultExtension(exPs);
                boolean handleError = expProcessor.shouldHandleError(error);
                if (handleError) {
                    // Retrieve exception extension and execute wrapAndHandleException operation. Scenarios requiring retry can throw retry exception
                    msg = Optional.ofNullable(expProcessor.wrapAndHandleException(channel, req)).orElse(msg);
                }
            }
        }

        res.setErrorMessage("Fail to decode request due to: " + msg);
        res.setStatus(Response.BAD_REQUEST);

        channel.send(res);
    }


    // Retry control during handleRequest process
    public void received(Channel channel, Object message) throws RemotingException {
        // Decode
        decode(message);
        try {
            handler.handleRequest(channel, message);
        } catch (RetryHandleException e) {
            if (message instanceof Request) {
                ErrorData errorData = (ErrorData) ((Request) message).getData();
                // If customized, perform retry
                retry(errorData.getData());
            } else {
                // Retry only once, and only Request will throw a RetryHandleException
                throw new RemotingException(channel, "Unknown error encountered when retry handle: " + e.getMessage());
            }
            handler.received(channel, message);
        }
    }
```

Regarding the ExceptionProcessor extension, we provided a default implementation in the official extension package Dubbo-Spi-Extensions, allowing control of retry decoding and custom exception handling.



**2.1.4 Central Gateway**

The latest architecture is already very close to the final implementation, but it lacks a central gateway role. The reason for introducing this gateway (based on Apisix) is:

- Whitelist Issues: Although the Dubbo gateway converges terminal IPs, to achieve inter-island communication, whitelists still need to be opened point-by-point. Once the central gateway (cloud platform) is introduced, each island can simply open a connection with the cloud platform. The complexity of whitelist opening changes from O(n*n) to O(n).
- Benefits of a Unified Gateway: As a company-level gateway, it can unify functions such as rate limiting, authentication, auditing, and observability for all applications.

## 3. More Thoughts

Whether inside or outside the company, there are numerous cross-network solutions to choose from. We will select one that addresses pain points rather than aiming for perfection. Implementation solutions are often conservative, but architectural thinking must be more forward-looking.

**Performance Loss Due to HTTP Protocol**

As mentioned earlier, we use the HTTP protocol between the Dubbo gateway and the central gateway. Compared to streamlined protocols like Dubbo, the HTTP protocol is clearly more bloated. However, it may be the most suitable solution at this stage. In addition to avoiding the "difficult journey" of private protocols in network devices, the development cost of the HTTP protocol is lower, and the corresponding implementation risk is also smaller. Some new technologies may be the direction for our future development. For example, Higress supports the Triple protocol (based on HTTP2) for exchanging information, achieving higher performance while also addressing device recognition issues. However, choosing Higress requires facing challenges such as learning and recognition costs and numerous new open source bugs, and it may be more suited to internal networks (which can set up VPNs even across public networks) rather than our various private island networks (where customers define security policies) for network interoperability.

**Insufficient Scalability**

The high-speed road is a cross-network solution based on Dubbo, with deep bindings to the protocol and framework layers. However, it should be able to do more. It may soon need to accommodate traffic from application protocols like HTTP and MQ, or clients in languages like Python and Go, and even data interoperability with MySQL. At this point, we either have to significantly redesign the architecture or face various compatibilities, both of which are undesirable. Referring to the layered network protocol, we roughly made a layered abstract planning.

![img](/imgs/v3/users/zcy-9.png)

- **Physical Layer Connectivity**: Mainly addresses network heterogeneity, i.e., how to communicate between subdomains with different security policies.
- **Communication Protocol Layer Acceleration**: Application layer protocols previously mentioned need to be designed for independent extension and switching.
- **Language Layer Compilation Acceleration**: The business gateway may be more suitable to use Golang, and can the Java node optimize performance with Native?
- **Framework Layer Function Upgrades**: For example, the current customized development for Dubbo, can the Apisix central gateway be extended to convert dubbo to dubbo?
- **Task Orchestration**: Cross-network scheduling of business does not necessarily follow A->B->C->D sequence; could it be that A and B must complete before proceeding to C->D?
- **Higher-Level Control Plane/Governance Plane/Operations Plane**




## 4. Future Plans

As the high-speed road solution gradually lands in Zhengcai Cloud, we will work to deepen and broaden our efforts in terms of stability, functional enhancements, and exploration of new technologies:

(1) **Stability**: The stability of basic services is the cornerstone of everything, yet this is often overlooked by many developers; developers need to "repair the roof on a sunny day."

- **Robustness of the System Itself**: Resource pooling isolation, QoS assurance capabilities.
- **Stability of Node Instances**: Strengthen discovery capabilities, continuously improve anomaly detection tools (beyond routine health checks to make comprehensive decisions across various observational metrics), and automatically replace anomalous instances; strengthen data operations to enhance feedback capabilities.

(2) **Functional Enhancements**

- **Protocol Enhancements**: Currently, we can only forward Dubbo traffic and plan to add support for protocols like HTTP and Grpc to accommodate more scenarios (existing businesses have raised such demands).
- **Security Enhancements**: Develop authentication and auditing plugins in the central gateway Apisix to better control cross-network calls and being called.
- **Usability Enhancements**: Develop an automated work order system for necessary configurations; businesses will submit work orders, which will be automatically configured after review by relevant personnel, freeing up labor while reducing error risks.

(3) **Exploration of New Technologies**

In gateway scenarios, there are generally two obvious characteristics:

- **High Concurrency**: Multiple applications reuse the same gateway.

- **Lightweight Behavior**: Generally only lightweight operations such as forwarding and permission verification.

Given these two characteristics, the performance overhead at the language layer often accounts for a larger share of the total performance overhead in business applications, making languages like Golang more advantageous than Java. We are currently researching Dubbo-Go, planning to replace Java-based Dubbo gateway applications in the future.

Additionally, the Higress solution seems promising, and there are many aspects worth learning from it.
