---
description: "Dubbo Multi-Instance Related Domain Models and Concepts"
linkTitle: Models and Concepts
title: Definitions of Models and Concepts Related to Multi-Instances
type: docs
weight: 3
---

## Dubbo Architecture

JVM — Virtual Machine Layer  
Purpose: Complete isolation between Dubbo frameworks (ports cannot be reused)

Dubbo Framework — Framework Layer  
Purpose: Reuse resources that need global caching (ports, serialization, etc.)

Application — Application Layer  
Purpose: Isolate information between applications, including registration center, configuration center, and metadata center

Services — Module Layer  
Purpose: Provide hot loading capability, allowing isolation contexts per ClassLoader or Spring Context

## Dubbo Concept Alignment

1. DubboBootstrap
   1. Needs to separate export/refer services, ServiceInstance, Metadata/Config, etc. Client
2. ConfigManager
   1. Needs to separate application-level configuration information from module-level configuration information
3. ApplicationModel
   1. Actually stores application layer information, holding a reference to ConfigManager’s application-level configuration information
4. ConsumerModel
   1. Actually stores interface information, held by ModuleModel
5. ProviderModel
   1. Actually stores interface information, held by ModuleModel
6. ExtensionLoader
   1. Needs to load different instance objects based on different levels
7. Registry
   1. Application level sharing, needs to ensure that multi-instance subscriptions work properly (considering unit scenarios)
8. Router / Filter
   1. Module level sharing
9. Protocol / Remoting
   1. Framework level sharing, reusing IO, contributing across multiple applications
10. Metadata
   1. Application level sharing, considering application-level service discovery
11. QoS
   1. Framework level sharing, related to IO
12. Serialization
   1. Framework level sharing, related to IO
13. ConfigCenter
   1. Application level contribution
14. ModuleModel (new)
   1. Actually stores module layer information, holding interface-level information
15. FrameworkModel (new)
   1. Actually stores framework layer information

## Configuration Storage Organization

### FrameworkModel  
Qos, Protocol, Remoting, Serialization, ExtensionLoader

### ApplicationModel  
ConfigManager (Application-level), DubboBootstrap (Fluent API style), Registry, Metadata, ServiceInstance, ConfigCenter, ExtensionLoader

### ModuleModel  
ConsumerModel, ProviderModel, Router, Filter, ExtensionLoader


![](https://intranetproxy.alipay.com/skylark/lark/0/2021/jpeg/15256464/1628824598406-95556f0d-7817-4010-97a7-0f8e84a175cb.jpeg)  
## Dubbo Process Organization

### Model Creation

DefaultModel - FrameworkModel, ApplicationModel, ModuleModel

1. Default Model creation timing
2. User-defined Model creation methods

### Consumer Side Initialization

1. The consumer side initializes configuration information through ReferenceConfig as an entry, where the ClassLoader property needs to be added, and ReferenceConfig generates ConsumerModel injected into ModuleModel
2. The assembled URL needs to include the current ConsumerModel, ModuleModel, ApplicationModel, FrameworkModel (need to organize the entire link’s URL conversion logic to ensure it is not discarded in between)
3. The Registry in the assembly chain is within the ApplicationModel domain (subscription needs to consider mutual independence between subscriptions and multi-registration center scenarios); Filter, Cluster, LoadBalance are within the ModuleModel domain
4. Directory needs to hold the ConsumerURL with detailed information, and the serialization layer needs to pass configuration information
5. The triplet within ModuleModel is unique, always creating the same proxy; redundancies are allowed between ModuleModels, with proxies and invokers being mutually independent

### Server Side Initialization

1. The server side initializes configuration information through ServiceConfig as an entry, where the ClassLoader property needs to be added, and ServiceConfig generates ProviderModel injected into ModuleModel
2. The assembled URL needs to include the current ProviderModel, ModuleModel, ApplicationModel, FrameworkModel (need to organize the entire link’s URL conversion logic to ensure it is not discarded in between)
3. The Registry in the assembly chain is within the ApplicationModel domain (subscription needs to consider mutual independence among services and multi-registration center scenarios); Filter is within the ModuleModel domain
4. The triplet held by the Protocol layer guarantees uniqueness, allowing direct access to the ProviderModel (within the FrameworkModel domain)

### Address Push Process

1. The registration center listens to ensure that subscriptions with duplicate triplets can independently receive notifications, while the subscription links for the same triplet to the registration center can be reused
2. The registration center operates in the ApplicationModel domain, connecting to the ModuleModel layer through the held listening list. Address processing is carried out within the ModuleModel domain. If address notice reuse is needed, it needs to ensure that the notification content is not modified by a specific subscription
3. Each address notification independently creates an Invoker for different ModuleModels, with the Invoker directly holding the ConsumerModel
4. The underlying Protocol layer of the Invoker reuses TCP connections

### Consumer Side Call Chain

1. When the consumer side creates an invocation, it needs to carry the current ConsumerModel, ModuleModel, ApplicationModel, FrameworkModel (through consumerURL), ensuring that the entire call link’s consumerURL is not lost

### Server Side Call Chain

1. Upon receiving a request, the server locates the ProviderModel and invoker based on the triplet, considering the ClassLoader switch during deserialization

### Other Processes

1. Destruction Process
2. QoS Aggregation Method

## Code Changes

1. ExtensionLoader Dependency Injection  
```java
ModuleModel.getExtensionFactory().getAdaptiveExtension(Protocol.class)  
ApplicationModel.getExtensionFactory().getAdaptiveExtension(Protocol.class)  
FrameworkModel.getExtensionFactory().getAdaptiveExtension(Protocol.class)  

@SPI(scope = FRAMEWORK)  
public interface Protocol {  
}  
```
- SPI Dependency Injection  
2. DubboBootstrap -> Function Split (ModuleModel maintains lifecycle)  
```java
// Create new application instance, share FrameworkModel  
DubboBootstrap.newInstance(FrameworkModel)  // SharedFrameworkModel -> NewApplicationModel  
    .addModule()  // New ModuleModel  
    	.addReference(ReferenceConfig)  // Attach service configuration to the module  
    	.addReference(ReferenceConfig)  
    	.addService(ServiceConfig)  
    .endModule()  
    .addModule()  
    	.addReference(ReferenceConfig)  
    	.addService(ServiceConfig)  
    .endModule()  
    .addRegistry()  
    .addConfigCenter()  
    .start()  

// Compatible with old Bootstrap API, using default application instance  
DubboBootstrap.getInstance()      // DefaultFrameworkModel -> DefaultApplicationModel  
    .addReference(ReferenceConfig) // DefaultApplicationModel -> DefaultModuleModel  
    .addService(ServiceConfig)  // DefaultApplicationModel -> DefaultModuleModel  
    .setRegistry()              // DefaultApplicationModel  
    .start()  

// Create new application instance  
DubboBootstrap.newInstance()      // DefaultFrameworkModel -> NewApplicationModel  
    .addReference(ReferenceConfig) // NewApplicationModel -> DefaultModuleModel  
    .addService(ServiceConfig)  // NewApplicationModel -> DefaultModuleModel  
    .setRegistry()              // NewApplicationModel  
    .start()  
```
3. ReferenceConfig, ServiceConfig  
   1. ModuleModel dynamic setting  
   2. Needs to delegate the initialization of ExtensionLoader to setModuleModel  
   3. consumerUrl carries ModuleModel  
4. ModuleModel, ApplicationModel, FrameworkModel  
   1. ModuleModel -> ConsumerModels, ProviderModels  
   2. ApplicationModel -> ConfigManager (application-level attribute information), ModuleModels  
5. ConsumerModel, ProviderModel  
6. The registration center needs to support multiple subscriptions  
7. Spring


1. ModuleModel, ApplicationModel, FrameworkModel (ExtensionLoader)  
2. ReferenceConfig, ServiceConfig (ConsumerModel, ProviderModel)  
3. ExtensionLoader (Filter changes)  

