---
description: "This article provides a simple summary of the changes related to extending SPI and contributing source code after the multiple-instance transformation of Dubbo3."
linkTitle: Operating Instances in Source Code
title: Multiple Instances Make Source Code Development More Complex, Learn How to Correctly Extend SPI Implementations
type: docs
weight: 3
---

This article provides a simple summary of the coding-related changes after the multiple-instance transformation of Dubbo 3.

### Hierarchical Model

From only ApplicationModel, new ScopeModel/FrameworkModel/ModuleModel are added to express the hierarchical model of multiple instances.
![image.png](https://cdn.nlark.com/yuque/0/2021/png/2391732/1630663265196-0c9e3746-3f62-406b-93d6-7d971ee3e96a.png#clientId=u53624b84-1e3c-4&from=paste&height=302&id=udc7e6f69&originHeight=604&originWidth=1378&originalType=binary&ratio=1&size=132247&status=done&style=none&taskId=u06713196-e7be-483c-8762-6bbc756f336&width=689)
Each ScopeModel instance will create and bind its own important members:

- ExtensionDirector
- BeanFactory
- ServiceRepository

ScopeModel, as the most basic model, can hold and pass in SPI/Bean/URL, etc.

### SPI Extension
#### ExtensionScope
The SPI annotation adds the scope attribute to indicate its belonging scope.
![image.png](https://cdn.nlark.com/yuque/0/2021/png/2391732/1630664482020-9d35e6de-17f7-4334-8506-3af362c03de0.png#clientId=u53624b84-1e3c-4&from=paste&height=249&id=u6c288d3d&originHeight=498&originWidth=930&originalType=binary&ratio=1&size=197493&status=done&style=none&taskId=u56167d63-ab53-4cdb-bb10-723d0c97663&width=465)
The correspondence between ExtensionScope and the hierarchical model:

- FRAMEWORK
- APPLICATION
- MODULE

#### ExtensionDirector
The new ExtensionDirector is used to implement multi-level SPI management and dependency injection.

The creation process of spi extension through ExtensionDirector is as follows:
![image.png](https://cdn.nlark.com/yuque/0/2021/png/2391732/1630664388603-d12d4002-65ea-43b9-b5c9-c0d7204b22b1.png#clientId=u53624b84-1e3c-4&from=paste&height=303&id=uf804edd7&originHeight=606&originWidth=616&originalType=binary&ratio=1&size=71595&status=done&style=none&taskId=u4944881d-0195-4a23-bdfe-346819db997&width=308)

- Each SPI can only be created on the ExtensionDirector that matches the Scope, with the aim of sharing instances and correctly injecting dependent objects between levels. The SPI of APPLICATION scope must be created on the ExtensionDirector bound to ApplicationModel, and that of FRAMEWORK scope must be created on the ExtensionDirector bound to FrameworkModel.
- Visibility is related to the scope; here visibility refers to whether dependencies can be directly injected. The SPI of FRAMEWORK scope is visible in FRAMEWORK/APPLICATION/MODULE, while the APPLICATION scope SPI is only visible in APPLICATION/MODULE.
- Invisible SPIs need to be obtained through context, such as passing ScopeModel through URL, which can resolve access issues between FRAMEWORK spi and APPLICATION spi.

The scope of visibility is shown in the diagram below:
Upper-level objects can inject SPI/Bean objects of the current and lower levels, while lower-level objects cannot inject SPI/Bean objects of upper levels.
![image.png](https://cdn.nlark.com/yuque/0/2021/png/2391732/1630665762212-fcc5e99d-2966-46cd-84ae-9257c4a216c9.png#clientId=u53624b84-1e3c-4&from=paste&height=188&id=u6c2bf0b8&originHeight=376&originWidth=1290&originalType=binary&ratio=1&size=68138&status=done&style=none&taskId=ub349222b-17af-4734-b744-dfd2f297930&width=645)
### Bean Management
A new ScopeBeanFactory is introduced for internal Bean management, supporting sharing a single instance object across multiple different modules.
ScopeBeanFactory also supports scope; the injection rules are the same as for ExtensionDirector.
For usage, please refer to: FrameworkStatusReportService, RemoteMetadataServiceImpl, MetadataReportInstance

### ServiceRepository
The original ServiceRepository has been split into three classes, corresponding to three different hierarchical models.
FrameworkServiceRepository
ServiceRepository
ModuleServiceRepository

Register the service interface information ProviderModel/ConsumerModel/ServiceDescriptor in ModuleServiceRepository, while keeping a mapping in FrameworkServiceRepository for looking up the corresponding service interface model based on requests.

### Coding Changes Summary
#### 1. How to Obtain ApplicationModel and Application Data
Original Method: ApplicationModel provides a series of static methods to obtain shared application instance data
```java
ApplicationModel.getConfigManager()
ApplicationModel.getEnvironment()
ApplicationModel.getServiceRepository()
ApplicationModel.getExecutorRepository()
ApplicationModel.getName()
```
New Method: Find the ApplicationModel instance first, then use instance methods to obtain data
```java
// Get default instance, compatible with the original single application instance
ApplicationModel.defaultModel().getApplicationEnvironment();

// Get ApplicationModel by Module
moduleModel.getApplicationModel();

// Get ApplicationModel through URL
ScopeModelUtil.getApplicationModel(url.getScopeModel());

// Obtain through Config configuration class
ScopeModelUtil.getApplicationModel(serviceConfig.getScopeModel());

// SPI/Bean can use constructor injection
public ConfigManager(ApplicationModel applicationModel) {
    this.applicationModel = applicationModel;
}

// SPI/Bean can inject by implementing ScopeModelAware interface
public class DefaultGovernanceRuleRepositoryImpl implements GovernanceRuleRepository, ScopeModelAware {

    private ApplicationModel applicationModel;

    @Override
    public void setApplicationModel(ApplicationModel applicationModel) {
        this.applicationModel = applicationModel;
    }
    // ...
}

// Enumerate all Applications in FrameworkModel
for (ApplicationModel applicationModel : frameworkModel.getApplicationModels()) {
    List<RegistryProtocolListener> listeners = applicationModel.getExtensionLoader(RegistryProtocolListener.class)
        .getLoadedExtensionInstances();
    if (CollectionUtils.isNotEmpty(listeners)) {
        for (RegistryProtocolListener listener : listeners) {
            listener.onDestroy();
        }
    }
}

// Enumerate all FrameworkModels
for (FrameworkModel frameworkModel : FrameworkModel.getAllInstances()) {
    destroyProtocols(frameworkModel);
}
```

#### 2. How to Obtain SPI Extension Instances
Original Method: Obtained through static method ExtensionLoader.getExtensionLoader()
```java
ExtensionLoader.getExtensionLoader(Cluster.class).getExtension(name, wrap);
```
New Method: Obtain through ScopeModel or ExtensionDirector
```java
applicationModel.getExtensionLoader(Cluster.class).getExtension(name, wrap);
```

#### 3. How to Find Service Models
Original Method: Lookup service models in ServiceRepository by uniqueServiceName.

New Method: Pass ScopeModel/ServiceModel through URL. Please refer to RegistryProtocol.

#### 4. How to Share Bean Instances Across Modules
Original Method: Preserve bean instances using static variables.

New Method: Share instances through BeanFactory.

#### 5. Common Utility Classes and Handling Skills
Obtain the Model of a certain level based on ScopeModel, with compatibility handling; when scopeModel parameter is null, it returns the default instance:
ScopeModelUtil.getFrameworkMode(scopeModel)
ScopeModelUtil.getApplicationMode(scopeModel)
ScopeModelUtil.getModuleMode(scopeModel)

### Scenarios Needing Transformation
1. ExtensionLoader.getExtensionLoader()
2. Application.defaultModel() or other static methods
3. Access Application layer objects from the Framework layer, such as processing Application data in Protocol, enumerating all Application data in QOS, please refer to RegistryProtocol.
4. Access default instance data in static methods
5. Static variable bean instances, cache
6. Access data in static methods of SPI interfaces, may need to split into clean SPI and Bean, please refer to FrameworkStatusReportService/FrameworkStatusReporter.
7. Some URLs might not have been transformed yet, and need to set ServiceModel/ScopeModel during creation.

