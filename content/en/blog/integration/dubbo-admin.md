---
title: "Introduction to the New Dubbo Admin"
linkTitle: "Introduction to the New Dubbo Admin"
date: 2019-01-07
tags: ["Ecosystem", "Java"]
description: >
    The current version of Dubbo Admin includes most of the functions from previous versions, including service governance, service query, and supports new service governance features in Dubbo 2.7.
---

```
github: https://github.com/apache/dubbo-ops
```
The previous versions of Dubbo Admin were outdated and lacked maintenance for a long time. Therefore, a major refactoring of the project was carried out mid last year, with the following structural changes:  
* The backend framework was replaced from webx to spring boot.
* The frontend uses Vue and Vuetify.js as the development framework.
* Removed velocity templates.
* Integrated swagger for API management features.

The current version of Dubbo Admin includes most of the functions from previous versions, including service governance and service query, while supporting the new service governance features introduced in Dubbo 2.7.

## Configuration Specifications  
In Dubbo 2.7, the configuration center and registration center have been separated, and a metadata center has been added, leading to updates in the configuration methods for Dubbo Admin. The configuration in `application.properties` is as follows:   
```properties
admin.registry.address=zookeeper://127.0.0.1:2181
admin.config-center=zookeeper://127.0.0.1:2181
admin.metadata-report.address=zookeeper://127.0.0.1:2181
```
It is also possible to specify the addresses for metadata and registration centers in the configuration center, just as in Dubbo 2.7. For example, the configuration path and content are as follows: 
```properties
# /dubbo/config/dubbo/dubbo.properties
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
```
The addresses in the configuration center will override the local `application.properties` settings.

## Feature Introduction  
The features mainly continue from previous versions, including service query and governance. Version 2.7 brings significant improvements to service governance, most of which will be reflected in Dubbo Admin.

### Tag Routing  
Tag routing is a new feature introduced in Dubbo 2.7, configured per application, allowing different labels to be assigned to various servers, as shown in the configuration below:

![tag](/imgs/blog/admin/route.jpg)

During invocation, the client can set different tag names using `setAttachment`, for example, `setAttachment(tag1)`. The client can then select among the three machines shown in the image, enabling traffic isolation and gray releases.

### Application-Level Service Governance  
In Dubbo 2.6 and earlier, all service governance rules were at the service granularity. To apply a rule to the application level, all services under the application needed to be matched with the same rules, which was cumbersome. Therefore, in Dubbo 2.7, application-level service governance operations have been added, allowing conditions (including black/white lists) and dynamic configuration (including weight and load balancing) to be configured at the application level:  

![condition](/imgs/blog/admin/conditionRoute.jpg) 
  
The above image shows the condition routing configuration, which can be filled in according to application name and service name, and can also be queried by these dimensions.  

![weight](/imgs/blog/admin/weight.jpg)  

Condition routing, tag routing, and dynamic configurations are written in `yaml` format, while other rule configurations still use a form format.

#### About Compatibility  
From Dubbo 2.6 to Dubbo 2.7, significant changes occurred in service governance. Dubbo Admin is compatible with both versions:  
* For service-level configurations, entries will be written in both Dubbo 2.6 (URL) and Dubbo 2.7 (configuration files) formats to ensure that Dubbo 2.6 clients can correctly read and parse the rules. 
* Application-level configurations, including tag routing, will only be written in the Dubbo 2.7 format, as Dubbo 2.6 doesn't have this feature, so there is no need for backward compatibility.
* Dubbo Admin will only read configurations in the Dubbo 2.7 format, meaning that all configurations made on Dubbo Admin can be read, but legacy URLs in the Dubbo 2.6 format cannot be read.
* For the same application or service, each rule can only be configured once; otherwise, the new one will overwrite the old.

### Configuration Management  
Configuration management is also a newly added feature in Dubbo 2.7, with both global and application-level configurations:  
* Global Configuration: 

![config](/imgs/blog/admin/config.jpg)  

Global configurations can specify the registration center and metadata center addresses, as well as the timeout settings for both server and client, and these settings take effect globally. In addition to writing configurations, this section can also be used for viewing them. If using zookeeper as the registration and metadata center, the directory structure of the configuration files can also be viewed.  
* Application, Service Configuration  

![appConfig](/imgs/blog/admin/appConfig.jpg)  

Application-level configurations can specify settings for applications or services within applications, requiring a distinction between providers and consumers. `dubbo.reference.{serviceName}` represents the configuration for the service consumer, and `dubbo.provider.{servcieName}` represents the configuration for the service provider. The priority is service > application > global. The addresses for the registration and metadata centers can only be specified in the global configuration, which is the recommended method in Dubbo 2.7.  

### Metadata and Service Testing  
Metadata is a newly introduced element in Dubbo 2.7, mainly utilized within Dubbo Admin and appears in two primary areas:  
* Service Detail Display:
  
![metadata](/imgs/blog/admin/metadata.jpg)  

Compared to previous versions, Dubbo 2.7 adds complete signature records for service methods, therefore the service detail has also been enhanced with method details, including method name, parameter list, and return value information.  
* Service Testing: 
  
![test](/imgs/blog/admin/test.jpg)

More importantly, metadata provides a data foundation for service testing, enabling real service providers to be called directly on the page for convenience, eliminating the need to set up a Dubbo environment or write consumer code just for service invocation.

