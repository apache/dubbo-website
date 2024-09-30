---
title: "Dubbo-Api-Docs -- Apache Dubbo Documentation Display & Testing Tool"
linkTitle: "Dubbo-Api-Docs -- Apache Dubbo Documentation Display & Testing Tool"
tags: ["Java"]
date: 2020-12-22
description: >
  This article will introduce you to Dubbo-Api-Docs
---
# Dubbo-Api-Docs 
## Background
Swagger is a specification and complete front-end framework used to generate, describe, call, and visualize RESTful style web services. The Swagger specification has gradually evolved into the OpenAPI specification.

Springfox is a framework that integrates Swagger, implemented based on Spring MVC/Spring Webflux, which automatically generates Swagger description files through the use of some annotations defined to describe interfaces, allowing Swagger to display and call interfaces.

I believe many people have heard of and used Swagger and Springfox, so I won't elaborate further.

Dubbo-Admin has an interface testing feature, but it lacks documentation for interface descriptions, making this testing feature more suitable for interface developers to test interfaces. Others who want to use this feature must first understand the interface information through documentation written by the interface developers or other means. Is there a tool on the Dubbo side that combines documentation display and testing functions, allowing the interface to be provided directly to the caller without writing documentation, similar to Swagger/Springfox? 

Previously, some research was conducted, finding similar tools:
* Some are based on Springfox, simply placing JSON in a text area, similar to the testing feature in Admin.
* Others are based on Swagger’s Java version OpenAPI specification generation tools, able to display some simple parameters of basic data types as form items.

They all share a common point: they turn your provider into a web project. Of course, some providers are loaded and started via a web container, and there are even those integrated with web projects, which is fine. But there are also non-web providers. Do I have to turn it into a web project for documentation? (And introduce a bunch of Web framework dependencies? For example, Spring MVC) Or delete its references and related annotations from the code during production packaging? Is there a simpler way?

There is no RPC specification in OpenAPI, and Swagger is an implementation of OpenAPI, so it does not support RPC-related calls. Springfox is a tool that implements RESTful APIs through Swagger, and RESTful is web-based, which Dubbo cannot use directly. We ultimately chose to implement it ourselves:
* Provide some simple annotations to describe interface information.
* Parse annotations and cache the results during the provider startup.
* Add several interfaces for acquiring interface information used by Dubbo-Api-Docs in the provider.
* Implement an HTTP gateway to call Dubbo interfaces via Dubbo's generic invocation on the Dubbo Admin side.
* Implement interface information display and call functionality on the Dubbo Admin side.
* Display parameters directly as form items in the following situations, others as JSON: 
  * Method parameters are of basic data types.
  * Method parameters are a Bean, and the Bean properties are basic data types.
* Very few third-party dependencies, most of which are already in your project.
* Can decide whether to load via profile, easily modify profile during packaging to distinguish between production and testing, even if you’re already using the profile.
  
> Today, I am pleased to announce: Dubbo users can also enjoy a Swagger-like experience -- Dubbo-Api-Docs is released.
> 
## Overview
Dubbo-Api-Docs is a tool for displaying Dubbo interface documentation and testing interfaces.

Using Dubbo-Api-Docs is divided into two main steps:
1. Introduce Dubbo-Api-Docs related jar packages into the Dubbo project and add annotations similar to Swagger.
2. View interface descriptions and test them in Dubbo-Admin.

With the above two steps, you can enjoy a Swagger-like experience and can turn off the scanning of Dubbo-Api-Docs in the production environment.

Dubbo-Api-Docs currently obtains the interface list of the service through direct connection to the service node. When testing interfaces, direct connection or connection via the registry can be used. In the future, there will be an increase in the methods to obtain the service list via the registry and additional support for new functionalities according to Dubbo's upgrade plan. It will also include features based on community needs.

Dubbo-Api-Docs will scan docs-related annotations after the service provider has started and cache the processing results. It will also add some Dubbo provider interfaces related to Dubbo-Api-Docs. The cached data may be placed in the Dubbo metadata center in the future.

## Current Version: 2.7.8.1

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-annotations</artifactId>
    <version>${dubbo-version}</version>
</dependency>

<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-core</artifactId>
    <version>${dubbo-version}</version>
</dependency>
```

## Quick Start
### 1. Add Dubbo-Api-Docs annotations to method parameters in the Dubbo provider project
* If the Dubbo provider's interfaces and method parameters are in a separate jar project, introduce: dubbo-api-docs-annotations in that project.
* Introduce dubbo-api-docs-core in the Dubbo provider project.
* Add the annotation @EnableDubboApiDocs in the project startup class (the class annotated with @SpringBootApplication) or configuration class (the class annotated with @Configuration) to enable the Dubbo Api Docs feature.
> To avoid increasing resource consumption in the production environment, it is recommended to create a separate configuration class to enable Dubbo-Api-Docs, in conjunction with the @Profile("dev") annotation.
> Of course, Dubbo-Api-Docs only consumes a bit more CPU resources when the project starts and uses a bit of memory for caching. In the future, consideration will be given to placing the cached content in the metadata center.
  
#### Here, we take some service interfaces from the [dubbo-api-docs-examples](https://github.com/apache/dubbo-spi-extensions/tree/2.7.x/dubbo-api-docs/dubbo-api-docs-examples) project as an example:
```bash
git clone -b 2.7.x https://github.com/apache/dubbo-spi-extensions.git
```

Enter the dubbo-spi-extensions/dubbo-api-docs/dubbo-api-docs-examples directory.

The dubbo-api-docs-examples contains two sub-modules:
* examples-api: A jar project containing service interfaces and parameter Beans.
* examples-provider: Provider service side with Spring Boot starter and service implementation.

Below we will add Dubbo-Api-Docs to these two sub-modules. 

> examples-api:

Maven inclusion:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-annotations</artifactId>
    <version>2.7.8</version>
</dependency>
```
In org.apache.dubbo.apidocs.examples.params, there are two Beans, let's add docs annotations to them:
* QuickStartRequestBean as parameter Bean, add @RequestParam.
```java
public class QuickStartRequestBean {

  @RequestParam(value = "You name", required = true, description = "please enter your full name", example = "Zhang San")
  private String name;

  @RequestParam(value = "You age", defaultValue = "18")
  private int age;

  @RequestParam("Are you a main?")
  private boolean man;
  
  // getter/setter omitted...
}
```
* QuickStartRespBean as response Bean, add @ResponseProperty.
```java
public class QuickStartRespBean {

  @ResponseProperty(value = "Response code", example = "500")
  private int code;

  @ResponseProperty("Response message")
  private String msg;

  // getter/setter omitted...
}
```
Since we only selected some interfaces for demonstration, the docs annotations related to these interfaces have been added.
> examples-provider:

Maven inclusion:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-core</artifactId>
    <version>2.7.8</version>
</dependency>
```
We select one interface as a demonstration:

The quickStart method in org.apache.dubbo.apidocs.examples.api.impl.QuickStartDemoImpl.

QuickStartDemoImpl implements the interface org.apache.dubbo.apidocs.examples.api.IQuickStartDemo in the api package.

* In QuickStartDemoImpl:
```java
@DubboService
@ApiModule(value = "quick start demo", apiInterface = IQuickStartDemo.class, version = "v0.1")
public class QuickStartDemoImpl implements IQuickStartDemo {

  @ApiDoc(value = "quick start demo", version = "v0.1", description = "this api is a quick start demo", responseClassDescription="A quick start response bean")
  @Override
  public QuickStartRespBean quickStart(@RequestParam(value = "strParam", required = true) String strParam, QuickStartRequestBean beanParam) {
    return new QuickStartRespBean(200, "hello " + beanParam.getName() + ", " + beanParam.toString());
  }
}
```
At this point, the docs-related annotations have been added. Next, let's enable Dubbo-Api-Docs. Add a configuration class, located anywhere as long as it can be scanned by Spring Boot.

We add a configuration class DubboDocConfig in the org.apache.dubbo.apidocs.examples.cfg package :
```java
@Configuration
@Profile("dev")  // used with Profile, only loaded when the profile is dev
@EnableDubboApiDocs  // Enable Dubbo-Api-Docs
public class DubboDocConfig {
}
```
At this point, everything related to Dubbo-Api-Docs has been added. There are more detailed examples in the [dubbo-api-docs-examples](https://github.com/apache/dubbo-spi-extensions/tree/2.7.x/dubbo-api-docs/dubbo-api-docs-examples) project. Below, we will look at the effect after adding Dubbo-Api-Docs.

![demoApi2](/imgs/blog/api-docs/quickStart.png)


### 2. Start the provider project
* The example uses Nacos as the registry, [download and start Nacos](https://nacos.io).
* In the example above, we start the org.apache.dubbo.apidocs.examples.ExampleApplication in the examples-provider project.
In the examples-provider directory:
```bash
mvn spring-boot:run
```



### 3. Download Dubbo-Admin
[Dubbo-Admin Repository](https://github.com/apache/dubbo-admin) 

> Dubbo-Admin needs to download the develop branch source to start.
> ```bash
> git clone -b develop https://github.com/apache/dubbo-admin.git
> ```

### 4. Start and Access Dubbo-Admin
Refer to the instructions in dubbo-admin to start:
```text
1. Modify the registry address in dubbo-admin-server/src/main/resources/application.properties
2. Compile with mvn clean package
3. Start: 
mvn --projects dubbo-admin-server spring-boot:run
or
cd dubbo-admin-distribution/target; java -jar dubbo-admin-0.1.jar
4. Browser access: http://localhost:8080
5. Default username and password are both: root
```

### 5. Enter the "Interface Documentation" module
* Enter the provider's machine IP and port in "Dubbo provider IP" and "Dubbo provider port", click the "Load Interface List" button on the right.
* The left-side interface list loads the interface list, clicking any interface displays its information and parameter form on the right.
* After filling in the form content, click the test button at the bottom.
* The response section displays the response examples and actual response result.

## Source Code Repository
Dubbo-Api-Docs is divided according to functionality, in two repositories:

### dubbo-spi-extensions 
> [dubbo-spi-extensions Repository Address](https://github.com/apache/dubbo-spi-extensions)

This repository contains some non-core functional extensions of Dubbo. Dubbo-Api-Docs is a sub-module of this repository. As this repository is part of Dubbo 3.0 planning, and Dubbo-Api-Docs is developed based on Dubbo 2.7.x, the [2.7.x branch has been added, where Dubbo-Api-Docs resides](https://github.com/apache/dubbo-spi-extensions/tree/2.7.x/dubbo-api-docs).
This repository contains documentation-related annotations, annotation scanning capabilities, and usage examples for Dubbo-Api-Docs:
* dubbo-api-docs-annotations: Related annotations for document generation. Considering practical situations where Dubbo API interface classes and interface parameters will be planned as a separate jar package, the annotations are also separated into a jar package.
* dubbo-api-docs-core: Responsible for parsing annotations, generating documentation information and caching. The Dubbo-Api-Docs related interfaces mentioned earlier are also in this package.
* dubbo-api-docs-examples: Usage examples.

### Dubbo-Admin
> [Dubbo-Admin Repository Address](https://github.com/KeRan213539/dubbo-admin)

The documentation display and testing are placed in the Dubbo Admin project.

## Annotation Description
* @EnableDubboApiDocs: Configuration annotation, enables Dubbo API docs functionality.
* @ApiModule: Class annotation, Dubbo interface module information, used to mark the purpose of an interface class module.
    * value: Module name.
    * apiInterface: The interface implemented by the provider.
    * version: Module version.
* @ApiDoc: Method annotation, Dubbo interface information, used to mark the purpose of an interface.
    * value: Interface name.
    * description: Interface description (HTML tags can be used).
    * version: Interface version.
    * responseClassDescription: Description of the response data.
* @RequestParam: Class property/method parameter annotation, marking request parameters.
    * value: Parameter name.
    * required: Whether the parameter is required.
    * description: Parameter description.
    * example: Parameter example.
    * defaultValue: Parameter default value.
    * allowableValues: Allowed values, setting this property will generate a dropdown list for the parameter on the interface.
        * Note: Using this property will generate a dropdown selection box.
        * boolean type parameters do not need to set this property, it will default to generating a true/false dropdown list.
        * Enum type parameters will automatically generate dropdown lists; if you do not want to expose all enum values, you can set this property individually.
* @ResponseProperty: Class property annotation, marking response parameters.
    * value: Parameter name.
    * example: Example.

## Usage Notes

* The response bean (return type of the interface) supports custom generics, but only supports one generic placeholder.
* About the use of Map: The key of the Map can only be of basic data types. If the key of the Map is not of a basic data type, it will not generate a standard JSON format, leading to exceptions.
* Synchronous/asynchronous of the interface is taken from org.apache.dubbo.config.annotation.Service#async / org.apache.dubbo.config.annotation.DubboService#async.

## Example Description
The dubbo-api-docs-examples directory in [dubbo-spi-extensions / Dubbo-Api-Docs](https://github.com/apache/dubbo-spi-extensions/tree/2.7.x/dubbo-api-docs) contains example projects:
* examples-api: jar project containing service provider interface classes and parameter Beans.
* examples-provider: Provider project using dubbo-spring-boot-starter, with nacos as the registry.
* examples-provider-sca: Provider project using spring-cloud-starter-dubbo, with nacos as the registry.

### Example Usage Steps
1. The example uses nacos as the registry, [download and start nacos](https://nacos.io).
2. Start any one of the examples-provider and examples-provider-sca. You can also start both. examples-provider uses port 20881 and examples-provider-sca uses port 20882. Both projects are spring boot projects, and the startup class is under org.apache.dubbo.apidocs.examples.
3. Start [Dubbo-Admin](https://github.com/KeRan213539/dubbo-admin), browser access: http://localhost:8080.
4. Enter the "Interface Documentation" module in dubbo-admin.
5. Enter the provider's machine IP and port in "Dubbo provider IP" and "Dubbo provider port", click the "Load Interface List" button on the right.
6. The left-side interface list loads the interface list, clicking any interface displays its information and parameter form on the right.
7. After filling in the form content, click the test button at the bottom.
8. The response section displays response examples and actual response results.

