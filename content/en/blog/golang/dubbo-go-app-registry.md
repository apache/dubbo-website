---
title: "Dubbo-go Application Dimension Registration Model"
linkTitle: "Dubbo-go Application Dimension Registration Model"
tags: ["Go"]
date: 2021-01-14
description: Application dimension registration model in Dubbo-go
---

Dubbo 3.0 is approaching. The most important aspect is service introspection, which is based on the application dimension registration model. As Dubbo-go, which is fully aligned with Dubbo in functionality, released its v1.5.0 version in July of this year [2020], it established a foundation for aligning with Dubbo 3.0 by the end of the year.

As the Go language version of Dubbo, Dubbo-go has significant differences in implementation due to cross-language issues. This article focuses on discussing the Dubbo-go community's understanding and implementation of this model, as well as the differences between it and Dubbo.

## 1 Quote

Before v1.5, the registration model of Dubbo-go was service-oriented, which could be intuitively understood as interface-oriented. For instance, the registration information, according to the service-oriented model, is as follows:

```json
"com.xxx.User":[
  {"name":"instance1", "ip":"127.0.0.1", "metadata":{"timeout":1000}},
  {"name":"instance2", "ip":"127.0.0.2", "metadata":{"timeout":2000}},
  {"name":"instance3", "ip":"127.0.0.3", "metadata":{"timeout":3000}}, 
]
```

The advantage of this model is obvious, as it is simple and intuitive, providing fine-grained service control.

However, in recent years, with the advent of the cloud era, this model has revealed its shortcomings:

1. Mainstream registration models are application-oriented;
2. Registering by service dimension leads to a scale proportional to the number of services, putting great pressure on the registration center under large-scale clusters [e.g., the ICBC software center's service registration scale reaches tens of thousands];

## 2 New Registration Model in Dubbo-go v1.5.0

This time, Dubbo-go supports a new registration model, which is the application dimension registration model. In simple terms, under the application dimension registration, the registration information looks like:

```json
"application1": [
  {"name":"instance1", "ip":"127.0.0.1", "metadata":{}},
  {"name":"instance2", "ip":"127.0.0.2", "metadata":{}},
  {"name":"instanceN", "ip":"127.0.0.3", "metadata":{}}
]
```

Under this model, the registration information can be significantly reduced, and the scale of the cluster is only related to the number of instances.

Meanwhile, in implementing this feature, Dubbo-go aims to achieve two goals:

1. Complete compatibility for users, with seamless migration;
2. Retain the ability to finely control service granularity—i.e., maintain existing service dimension metadata;

Thus, Dubbo-go focuses on addressing the following points:

1. How to find out which application provides the service based on the interface since the current consumer configuration is interface-based? For example, if the user configured the `com.xxx.User` service, how would Dubbo-go know which application is providing this service?
2. Once it is known which application it is, how to access the registration information of the application, such as instance information, and how to know the metadata of the `com.xxx.User` service itself?

To solve these two issues, Dubbo-go introduces two additional components based on the existing registration model: ServiceNameMapping and MetadataService.

The former is used to solve the mapping between service and application, while the latter is used to obtain the service metadata.

Thus, Dubbo-go's application dimension registration model becomes:

![img](/imgs/blog/dubbo-go/app-registry/app-registry-model.png)

### 2.1 ServiceNameMapping

ServiceNameMapping is not complicated. Considering that a typical consumer wants to call a service, they mostly know which application provides the service, so Dubbo-go introduces a new configuration item `provideBy`.

![img](/imgs/blog/dubbo-go/app-registry/provideby.png)

Of course, the term "mostly" acknowledges that sometimes it's indeed unknown who provides the service, so Dubbo-go also supports a configuration center-based ServiceNameMapping implementation. Dubbo-go will read the corresponding application name from the configuration center using the service name as the key. This means that when the provider starts, it will also write its service-application mapping into the configuration center.

### 2.2 MetadataService

MetadataService is slightly more complex, with both `remote` and `local` modes.

Similar to the earlier ServiceNameMapping, Dubbo-go provides a configuration center-based implementation of MetadataService, known as `remote` mode. When the provider starts, it will write the service metadata in.

The other mode is `local`. Dubbo-go can treat MetadataService as a regular microservice, provided by the Provider. Similar to:

![img](/imgs/blog/dubbo-go/app-registry/local-metadata-service.png)

This brings up a question:

Since Dubbo-go regards MetadataService as an ordinary service, how can the consumer obtain the metadata from MetadataService? This is a classic chicken-or-egg problem.

Dubbo-go's solution is rather straightforward: when the provider starts, it not only writes its own information to the registration center but also writes its MetadataService information.

This is the registration information for an application:

![img](/imgs/blog/dubbo-go/app-registry/registry-info.png)

Essentially, application dimension registration information + service metadata = service dimension registration information. In other words, application dimension registration is merely a way to restructure this information.

## 3 Differences and Improvements

Dubbo-go v1.5.x is aligned with Dubbo 2.7.5 and can be seen as a direct implementation of its Go source code, but considering the language differences between Java and Go, the implementations cannot be completely equivalent.

### 3.1 Revision Number Comparison

When registering MetadataService, Dubbo v2.7.x writes the hash value of all service interfaces of its provider application as a revision number into the metadata center. This revision is a comprehensive calculation result of all interfaces' methods and their parameters. The purpose is to reduce the number of pulls from consumer to the registration center.

The hash algorithm used to calculate revision in Go is inconsistent with that in Java, and the method signature information in Go differs from that in Java, resulting in differing hash values.

This inconsistency leads to the situation where if Go applications and Java applications simultaneously publish the same service, the revision numbers of Go services and Java services will inevitably differ, requiring the consumer to cache the metadata of these two revision numbers separately.

### 3.2 Application Registration Timing

One consideration in implementing Dubbo-go v1.5.0 was to maintain full backward compatibility with v1.4.x. Dubbo-go v1.5.x consumers can call services from Dubbo-go v1.4.x applications, Dubbo v2.6.x applications, and of course, services from the corresponding v2.7.x applications.

To achieve compatibility, Dubbo-go v1.5.x faced an issue: when the Dubbo-go provider application starts, it registers its application information to the metadata center only after a service has successfully started, whereas in Dubbo 2.7.x, the provider application registers instances only after all service interface information has been registered to the metadata center!

The consequence of this issue is that every time a provider publishes an interface to the metadata center, it triggers both Dubbo-go v1.5.0 and Dubbo v2.7.x consumer applications to pull information from Dubbo-go v1.5.0, which results in significant performance degradation on the consumer side when the provider has published many services.

Dubbo-go has fixed this in v1.5.1, where the provider first publishes all its service interfaces to the metadata center before registering instances to the registration center, reducing the number of metadata pulls by consumers.

> Author of this article: Baize (Jiang Chao), GitHub ID [@Patrick0308](https://github.com/Patrick0308), open-source enthusiast.

