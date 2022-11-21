---
type: docs
title: "易用性"
linkTitle: "易用性"
weight: 20
---
Dubbo提供了简单易用的配置方式，支持XML、Properties、Annotation、Yaml等格式的配置文件。以Dubbo Java SDK为例，Dubbo支持Spring Boot + Annotation的方式来开发应用。开发者只需要使用@DubboService和 @EnableDubbo来暴露服务，通过@DubboReference和@EnableDubbo即可调用暴露的服务，通过application.properties或application.yml来定义服务相关的配置信息。

Dubbo提供了丰富的samples，开发者可以根据具体情况选择合适的脚手架来构建自己的项目。

Java SDK：dubbo-samples
Golang SDK：dubbo-go-samples
Rust SDK：dubbo-rust-samples
Dubbo从开发者的角度出发，提供了一系列能力降低开发者在调试、部署和调用等环节的复杂度：

本地调用：当在本地开发时，无需配置注册中心也可以实现服务注册发现功能，减少了对注册中心的依赖。
泛化调用：可以将开发的服务用Http协议对外进行暴露，能够满足在多语言场景下服务调用的需求。
依赖检查：在服务部署的过程中，Dubbo可以检测依赖的服务是否部署成功。
延迟暴露：部署的服务可以经过一段时间以后再对外暴露，可以满足服务需要预热的需求。
异步调用：可以通过Dubbo提供的异步调用功能来提供系统的吞吐量。
关键词
支持多种格式的配置文件：支持XML、Properties、Annotation、Yaml等格式的配置文件。
提供了丰富的脚手架：不同的开发语言提供了对应的开发脚手架。目前已经支持Java、Golang和Rust。
降低调试、部署和调用等环节的复杂度：支持本地调用、泛化调用、异步调用、依赖检查和延迟暴露。