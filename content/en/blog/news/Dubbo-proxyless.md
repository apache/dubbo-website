---
title: "Exploration and Improvement of Dubbo in Proxyless Mesh Mode"
linkTitle: "Exploration and Improvement of Dubbo in Proxyless Mesh Mode"
date: 2023-02-02
---

## I. Background
With the emergence of Docker and Kubernetes, a large monolithic application can be split into multiple independently deployed microservices, packaged, and run in corresponding containers. Different applications communicate with each other to jointly complete a function module. The benefits of microservices architecture and containerized deployment are evident as they reduce the coupling between services, facilitate development and maintenance, and make better use of computing resources. However, microservices architecture also has corresponding drawbacks:

- Strong reliance on SDKs, resulting in significant coupling between business modules and governance modules. This often requires embedding SDK code or configuration in business code, in addition to related dependencies.
- Unified governance is challenging. Each framework upgrade requires modifying the SDK version and re-running regression tests, confirming functionality before redeploying on every machine. Different services referencing different SDK versions increase the difficulty of unified governance.
- Lack of a comprehensive solution. Currently, the market does not provide a complete and well-rounded microservices governance and solution. Often, multiple governance components must be introduced to achieve functionalities like grey releases and fault injection in actual production environments.

To address these pain points, Service Mesh emerged. Taking the classic Sidecar mode as an example, it implements governance and control of proxy traffic by injecting a Sidecar container into the business Pod, thereby decoupling the governance capability of the framework from the business system. This makes it easy to achieve unified traffic control, monitoring, and other needs across multiple languages and protocols. By decoupling SDK capabilities and breaking them down into independent processes, it alleviates the dependency on SDKs, allowing developers to focus more on the business itself. The foundational framework capabilities have thus been optimized, as illustrated in the following figure (source: dubbo official website):
![image.png](/imgs/blog/2023/2/2/1.png)

The classic Sidecar Mesh deployment architecture has many advantages, such as reduced SDK coupling and minimal business intrusion, but it also adds a layer of proxy, introducing additional issues, such as:

- Sidecar proxies incur some performance loss, which is particularly noticeable in complex network structures, causing certain difficulties for performance-sensitive businesses.
- Increased architectural complexity and higher demands on operations personnel.
- Certain requirements for the deployment environment, needing to support Sidecar proxy operations.

To solve these pain points, the Proxyless Service Mesh mode was introduced. Traditional service meshes intercept all business network traffic through proxies, which must be aware of the configuration resources issued by the control plane to control the flow of network traffic as required. Taking Istio as an example, the Proxyless mode allows applications to communicate directly with the istiod process responsible for the control plane. The istiod process listens for and obtains Kubernetes resources, such as Service and Endpoint, and distributes these resources uniformly via the xDS protocol to different RPC frameworks, enabling service discovery and governance capabilities. The Dubbo community was one of the first to explore the Proxyless Service Mesh mode in China, as the Proxyless mode has a lower implementation cost compared to Service Mesh, making it a good option for small and medium-sized enterprises. In version 3.1, Dubbo added Proxyless support by parsing the xDS protocol. xDS is a general term for service discovery, where applications can dynamically obtain Listener, Route, Cluster, Endpoint, and Secret configurations through the xDS API.

![image.png](/imgs/blog/2023/2/2/2.jpeg)

Through the Proxyless model, Dubbo establishes direct communication with the Control Plane, thereby achieving unified management over traffic control, service governance, observability, and security, avoiding the performance loss and deployment complexity associated with the Sidecar model.

## II. Detailed Explanation of Dubbo xDS Push Mechanism

Overall, the interaction timing diagram between the Istio control plane and Dubbo is shown above. The main logic of xDS handling in Dubbo resides in the PilotExchanger and the specific implementations of each DS (LDS, RDS, CDS, EDS) protocols. The PilotExchanger is responsible for unifying the linkage logic, primarily encompassing three major logics:

- Obtaining authorization certificates.
- Calling different protocol's getResource to acquire resources.
- Calling observeResource methods of different protocols to listen to resource changes.

For instance, for LDS and RDS, the PilotExchanger invokes the getResource method of LDS to establish communication with Istio, sending data and parsing responses from Istio. Upon completing the parsing, the resource is used as an argument for RDS's getResource method, which sends data to Istio. When changes occur in LDS, the observeResource method of LDS triggers changes in itself and RDS. The existing interaction is as follows, corresponding to the red-line process in the figure above:

![image.png](/imgs/blog/2023/2/2/3.jpeg)

After successfully acquiring resources for the first time, each DS will continuously send requests to Istio via scheduled tasks, parse response results, and maintain interaction with Istio. This process corresponds to the blue line part of the figure above.

## III. Current Shortcomings of Dubbo Proxyless Implementation

Dubbo Proxyless mode has proven its reliability after validation. However, existing Dubbo Proxyless implementation schemes face the following issues:

- The current interaction logic with Istio is push-mode. getResource and observeResource are two different stream flows, requiring a new connection each time a new request is sent. However, the stream flow we establish should be bidirectional; Istio can actively push after detecting resource changes, and LDS, RDS, and EDS need to maintain just one stream flow each.
- After changing to a persistent connection for the stream flow model, a local cache pool must be designed to store already existing resources. When Istio actively pushes updates, the cached data needs to be refreshed.
- The current observeResource logic polls Istio via scheduled tasks. observeResource no longer needs to poll regularly; it only needs to add the resources to be observed to the cache pool and wait for Istio to automatically push. The data returned from Istio needs to be split according to the app for multi-point listening. Subsequently, Dubbo support for other DS modes can also reuse the corresponding logic.
- Currently, Dubbo applications managed by Istio will throw exceptions when Istio goes offline, and after disconnections, they cannot reconnect, requiring redeployment of applications, thus increasing operational and management complexity. We need to add disconnection reconnection functionality, allowing reconnection when Istio recovers normally without redeployment.

The interaction logic after the transformation:

![image.png](/imgs/blog/2023/2/2/4.jpeg)

## IV. Implementation Plan for Xds Listening Mode

### 4.1 Resource Cache Pool

Currently, Dubbo's resource types include LDS, RDS, EDS. For the same process, all resources being listened to for the three resource types correspond one-to-one with the cached resource listening list for that process in Istio. Therefore, we should design separate local resource cache pools for these three resource types. When Dubbo attempts to access resources, it first checks the cache pool; if results are found, it returns directly; otherwise, it aggregates the resource list in the local cache pool with the resources to be sent to Istio for updating its listening list. The cache pool is as follows, where key represents a single resource, and T is the return result of different DS:

```java
    protected Map<String, T> resourcesMap = new ConcurrentHashMap<>();
```

With a cache pool, we must have a structure or container for listening to the cache pool. Here we design it as a Map, as follows:

```java
protected Map<Set<String>, List<Consumer<Map<String, T>>>> consumerObserveMap = new ConcurrentHashMap<>();
```

Where the key represents the resources to be observed, and the value is a List. The List is designed to support repeated subscriptions. Items stored in the List are of Consumer type in jdk8, which can convey a function or behavior, with the parameter being Map<String, T>, allowing retrieval from the cache pool. As mentioned, the PilotExchanger is responsible for linking the complete process, where the update relationships between different DS can be conveyed using Consumer. Taking observing LDS as an example, the code is roughly as follows:

```java
// Listen
void observeResource(Set<String> resourceNames, Consumer<Map<String, T>> consumer, boolean isReConnect);

// Observe LDS updated
ldsProtocol.observeResource(ldsResourcesName, (newListener) -> {
    // Inconsistent LDS data
    if (!newListener.equals(listenerResult)) {
        // Update LDS data
        this.listenerResult = newListener;
        // Trigger RDS listening
        if (isRdsObserve.get()) {
            createRouteObserve();
        }
    }
}, false);
```

Once the stream flow model transforms to establish a persistent connection, we also need to store the behavior of this Consumer in the local cache pool. Once Istio receives the push request from Dubbo, it refreshes its cached resource list and returns a response. At this time, the response content returned by Istio is an aggregated result. Upon receiving the response, Dubbo splits the response resources into smaller granular resources and pushes them to the corresponding Dubbo application to notify it of any changes.

Pitfalls:

- The data pushed by Istio may be an empty string; in this case, the cache pool does not need to store it and can be skipped. Otherwise, Dubbo will bypass the cache pool and continuously send requests to Istio.
- Consider the following scenario—Dubbo applications simultaneously subscribe to two interfaces provided by app1 and app2. To avoid mutual overwriting between listeners, it is necessary to aggregate all observed resource names and initiate requests to Istio at once.

### 4.2 Multi-Point Independent Listening

When the first request is sent to Istio, it calls the getResource method to query the cache. If absent, it aggregates the data to send a request to Istio, which then returns the corresponding results to Dubbo. There are two implementation plans for processing Istio's responses: 
1. The user creates a completeFuture in the getResource plan, with the cache analyzing whether the data is needed, and if confirmed as new data, the future callback transmits the result.
2. The getResource creates resource listeners in consumerObserveMap, defining a consumer that synchronizes the obtained data to the original thread, where the cache sends data to all listeners and to the listener of that resource when it receives a push from Istio.
Both plans can be implemented, but the key difference is whether the user's call to onNext must recognize the existence of getResource. Thus, plan 2 is ultimately chosen for implementation. The specific implementation logic ensures that Dubbo establishes a connection with Istio, which then pushes its monitored resource list to Dubbo. Dubbo parses the response, splits the data based on different apps, refreshes the local cache pool data, and sends an ACK response to Istio, as illustrated in the following process:

![image.png](/imgs/blog/2023/2/2/5.svg)

```java
public class ResponseObserver implements XXX {
        ...
        public void onNext(DiscoveryResponse value) {
            // Accept data from Istio and split
            Map<String, T> newResult = decodeDiscoveryResponse(value);
            // Local cache pool data
            Map<String, T> oldResource = resourcesMap;
            // Refresh cache pool data
            discoveryResponseListener(oldResource, newResult);
            resourcesMap = newResult;
            // for ACK
            requestObserver.onNext(buildDiscoveryRequest(Collections.emptySet(), value));
        }
        ...
        public void discoveryResponseListener(Map<String, T> oldResult, 
                                              Map<String, T> newResult) {
            ....
        }	
}
// Specific implementation left to LDS, RDS, EDS
protected abstract Map<String, T> decodeDiscoveryResponse(DiscoveryResponse response){
	// Compare new data with cache pool resources to extract resources absent in either pool
    ...
    for (Map.Entry<Set<String>, List<Consumer<Map<String, T>>>> entry : consumerObserveMap.entrySet()) {
    // Skip if not present in the local cache pool
    ...
	// Aggregate resources
    Map<String, T> dsResultMap = entry.getKey()
        .stream()
        .collect(Collectors.toMap(k -> k, v -> newResult.get(v)));
    // Refresh cache pool data
    entry.getValue().forEach(o -> o.accept(dsResultMap));
    }
}    

```
Pitfalls:

- In the case of multiple stream flows, incremental requestId was used to reuse stream flows. After changing to persistent connections, one resource has multiple requestIds that may overwrite each other, thus this mechanism must be removed.
- The initial implementation plan did not split resources but treated them as a whole. Considering future support for other DS, splitting the data returned from Istio led to some oddities in consumerObserveMap.
- While all three DS can share the same channel when sending data, the channels used for listening must be the same; otherwise, Istio will not push updates when data changes.
- After establishing a bidirectional stream, the initial plan used a globally shared future. However, there may be a scenario where the onNext events for the same ds occur in quick succession, referred to as event A and event B, with event A possibly being sent first. Yet event B's result may return first. The timing of Istio's push being uncertain means futures must be local variables instead of globally shared.

### 4.3 Using Read-Write Locks to Avoid Concurrency Conflicts

Listeners in consumerObserveMap and resourcesMap caching pools are likely to result in concurrent conflicts. For resourceMap, as put operations are concentrated in the getResource method, pessimistic locking can secure the corresponding resources and avoid concurrent listening. For consumerObserveMap, with simultaneous put, remove, and traversal operations, using read-write locks can mitigate conflicts. Read locks can be applied for traversals while write locks can be utilized for put and remove operations to prevent concurrency conflicts. Thus, a pessimistic lock on resourcesMap suffices whereas the operations involving consumerObserveMap are as follows:

- Adding data to consumerObserveMap during remote requests to Istio, applying a write lock.
- Removing the listening future when completeFuture returns data across threads, applying a write lock.
- Adding listeners to consumerObserveMap when observing the cache pool, applying a write lock.
- Adding listeners to consumerObserveMap during disconnection reconnections, applying a write lock.
- Parsing data returned from Istio, traversing the cache pool, and refreshing data, applying a read lock.

Pitfalls:

- Because Dubbo and Istio establish a bidirectional stream, the onNext events for the same ds may occur in quick succession, requiring event A and event B to be sent in order; however, the result of B could return first. Therefore, locking is necessary.

### 4.4 Disconnection Reconnection

Disconnection reconnection only requires a scheduled task to interact with Istio regularly, trying to obtain authorization certificates. Successfully obtaining the certificate signifies that Istio has come back online. Dubbo will aggregate local resources to request data from Istio, parse the response and refresh local cache pool data, and finally close the scheduled task when completed.
Pitfalls:

- Using a globally shared scheduled task pool cannot be closed; otherwise, it will affect other services.
- 
## V. Reflections and Summary
During this functionality transformation, I genuinely lost a bit of hair, as encountering bugs that couldn't be found was not uncommon. Besides the pitfalls mentioned above, other issues include but are not limited to:

- Dubbo altered the method for obtaining k8s certificates in one iteration, resulting in authorization failures.
- The original functionality was problem-free, but merging the master code rendered incompatibility between grpc and envoy versions, causing various errors. Ultimately, the issue was resolved by reducing the version.
- The original functionality was still intact, but merging the master code caused the latest branch code to send metadataservice in triple; however, Proxyless mode only supports the Dubbo protocol. After debugging for three or four days, it became apparent that additional configuration was needed.

......
However, it must be acknowledged that Proxyless Service Mesh indeed has its own advantages and broad market prospects. Since the release of Dubbo 3.1.0, Dubbo has already implemented Proxyless Service Mesh capabilities. In the future, the Dubbo community will closely align with businesses to address more real-world production pain points, further refining service mesh capabilities.

