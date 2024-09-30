---
aliases:
    - /en/overview/tasks/develop/template/
    - /en/overview/tasks/develop/template/
    - /en/overview/mannual/java-sdk/tasks/develop/template/
title: "Generate Project Scaffolding via Template"
linkTitle: "Generate Project Scaffolding via Template"
date: 2023-12-31
tags: ["News"]
description: >
  This article introduces the basic usage of Dubbo Initializer, using start.dubbo.apache.org to quickly generate Dubbo projects (applications).
---

<a href="https://start.dubbo.apache.org/bootstrap.html" target="_blank">Dubbo Initializer</a> can be used to quickly generate Java project scaffolding, helping to simplify the setup, basic configuration, and component dependency management of microservice projects.

> The Initializer is still being updated, and more support for Dubbo Features will be released gradually.

## Choose Dubbo Version
The Initializer will use `dubbo-spring-boot-starter` to create Spring Boot projects, so we need to first choose the versions of Dubbo and Spring Boot.

![initializer-choose-version](/imgs/v3/tasks/develop/initializer-choose-version.png)

## Enter Basic Project Information
Next, fill in the basic project information, including project coordinates, project name, package name, JDK version, etc.

![initializer-project-info](/imgs/v3/tasks/develop/initializer-project-info.png)

## Choose Project Structure
There are two project structures to choose from: `Single Module` and `Multi Module`. In this example, we select `Single Module`.

![initializer-project-architecture](/imgs/v3/tasks/develop/initializer-project-architecture.png)

* Single Module: All component code is stored in one module, characterized by a simple structure.
* Multi Module: The generated project has `API` and `Service` modules, where `API` is for storing Dubbo service definitions, and `Service` is for service implementations or calling logic. Generally, multi-module is more conducive to independent management and publishing of service definitions.

## Select Dependency Components
We default the following dependencies for the template:
* Dubbo Components
    * Java Interface
    * Registry, Zookeeper
    * Protocol TCP
* Common Microservice Components
    * Web
    * Mybatis
    * Template Engine

![initializer-dependencies](/imgs/v3/tasks/develop/initializer-dependencies.png)

Based on the above options, the generated project will use Zookeeper as the registry, high-performance Dubbo2 TCP protocol for RPC communication, and increase dependencies and examples for components like Web, Mybatis, etc.

> Note: The above-selected Dubbo components are also default options, meaning that unless manual dependencies are added, clicking code generation directly on the page will include the above Dubbo components in the generated code.
>
> If manually adding dependency components, please pay attention to the inherent combination relationship limits between the various Dubbo dependency components, for example:
> * If you select 【Dubbo Service API】-【IDL】, it currently only supports selecting 【HTTP/2】 or 【gRPC】 protocols from 【Dubbo Protocol】.
> * Within the same dependency group, only one dependency of the same type can be selected, e.g., from the registry perspective under the 【Dubbo Registry&Config&Metadata】 group, only one of 【Zookeeper】 or 【Nacos】 can be selected. If you want to set multiple registries, please manually modify the configuration in the generated code. However, registry and configuration centers can each select one, such as Zookeeper and Apollo can be selected together.

## Generate Project Template
* Click “Browse Code” to view the project structure and code online.
* Click “Get Code” to generate the project download link.

![initializer-preview](/imgs/v3/tasks/develop/initializer-preview.png)

After downloading the project to your local machine, unzip it and import it into your IDE to develop customized Dubbo applications as needed.

