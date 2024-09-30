---
title: "Rushing to Cloud Native, Dubbo Releases Go Version"
linkTitle: "Dubbo Go Release"
tags: ["Go"]
date: 2021-01-11
description: This article documents an interview with He Xinming by OSCHINA. Original source: https://www.oschina.net/question/3820517_2306822
---

On May 21, after more than a year of incubation, Apache Dubbo graduated from the Apache Software Foundation and became an Apache top-level project.

![img](/imgs/blog/dubbo-go/dubbo-tlp-twitter.jpg)


Dubbo is a high-performance RPC framework open-sourced by Alibaba in 2011, which has significant influence in the Java ecosystem. After experiencing a period of criticism for "stopping maintenance," Dubbo announced a renewed focus on maintenance in 2017.

The re-launched Dubbo aims to reactivate the community, regain developer trust, and gradually transform into an internationalized and modernized project. 

During this process, Dubbo released multiple versions and gradually transformed from an RPC framework to a microservices ecosystem. At the beginning of 2018, Dubbo entered the Apache Software Foundation incubator.

A year later, Dubbo released its first milestone version 2.7.0, featuring highly requested asynchronous support and the separation of the registration center and configuration center.

In April this year, the official progress of Dubbo 3.0 was announced, including new features like asynchronous Filter chains, reactive programming, cloud-native/Service Mesh exploration, and integration with Alibaba both internally and externally.

Then, Dubbo graduated. What’s new for Dubbo recently? The ecosystem is still developing. The Dubbo community recently unveiled the [Dubbo Roadmap 2019](https://github.com/dubbo/awesome-dubbo/blob/master/slides/meetup/201905@beijing/DUBBO%20ROADMAP%202019.pdf), planning to release the official version of Dubbo 3.0 in February 2020.

![img](/imgs/blog/dubbo-go/dubbo-roadmap-2019.jpg)

Recently, the official team also **announced the addition of Go language to the Dubbo ecosystem**, releasing the [dubbo-go](https://github.com/dubbo/go-for-apache-dubbo) project.

![img](/imgs/blog/dubbo-go/dubbo-go-logo.jpg)

Before this, Dubbo's cross-language extensibility had some implementations, supporting languages such as PHP, Node.js, and Python, while also implementing REST call support based on the standard Java REST API - JAX-RS 2.0 as follows:

* **PHP**: php-for-apache-dubbo, by Lexin, providing both client and server
* **Node.js**: dubbo2.js, by Qianmi, providing a client
* **Node.js**: egg-dubbo-rpc, by Ant Financial's egg team, providing both client and server
* **Python**: py-client-for-apache-dubbo, by Qianmi, providing a client

With the addition of dubbo-go, Go developers can finally experience Dubbo. It’s reported that the dubbo-go project will complete its migration to the Apache Software Foundation **this week**, and as a subproject of Apache Dubbo, the new address will be: https://github.com/apache/dubbo-go.

Regarding the project background and technical details, we interviewed He Xinming, one of the project's co-founders, currently working in the R&D department of Trip.com.

*OSCHINA*: What is dubbo-go, what is its positioning, and why create this project?

*dubbo-go He Xinming*:

**dubbo-go is a complete Go language implementation of Dubbo**.

We know Dubbo itself is based on Java, with many companies primarily using Java for development and leveraging Dubbo for RPC or microservice development.

Recently, the Go language ecosystem has been growing rapidly. Due to its advantages, departments have begun experimenting with Go to develop new projects, leading to urgent problems:

* How to achieve interoperability between Go projects and Java & Dubbo projects?
* Additionally, Go projects have demands for RPC and microservice development frameworks; how to address this?

Based on these two concerns, our Trip.com team restructured and developed the more extensible and feature-rich dubbo-go v1.0.0 version, addressing the interoperability between Go projects and Java & Dubbo projects while also providing an RPC and microservice development framework option for Go projects.

Dubbo-go provides both client and server sides, and currently, the dubbo-go community is one of the most active communities in the Dubbo ecosystem.

*OSCHINA*: We know Dubbo has significant achievements in the Java ecosystem, and there are already known microservice frameworks in the Go ecosystem. Does dubbo-go have the capability to compete with these other frameworks?

*dubbo-go He Xinming*:

Our greatest strength is acting as the Go language version of Dubbo, bridging the gap between the two languages, **bringing Dubbo closer to cloud-native**, providing maximum flexibility for developers, and significantly reducing the cost of migrating existing services to the cloud, offering enterprises more options in the cloud-native era.

*OSCHINA*: Are the features of Go reflected in dubbo-go? (For example, how is Go's high concurrency transformed from Java-based Dubbo to dubbo-go?)

*dubbo-go He Xinming*:

My understanding of Go is that first, the learning curve is smaller compared to Java; Go is easier to learn and get started with.

Secondly, Go has advantages in language design, such as its CSP programming model for efficient handling of high concurrency, and the lightweight coroutine characteristics that attract many developers compared to JVM-based Java programs.

Finally, as a cloud-native language, with the emergence of excellent projects like Docker, Kubernetes, and Istio, Go has unified the cloud-native foundation, and I believe that days of developing businesses in the cloud-native model are not far off. I think the Go ecosystem will only get better, with more people using it.

Integrating Java-based Dubbo into Go allows dubbo-go to quickly enter the cloud-native domain. As for the expression of Go language features, one can look at the **asynchronous network I/O model design in dubbo-go, which showcases the advantages of Go's lightweight coroutines**.

It is also worth mentioning some limitations of Go:

* Compared to Java, Go is still a young language with no template libraries available, leading to high development costs for the community in writing and maintaining the Hessian 2 protocol library.
* Go’s error handling is less robust compared to Java’s try/catch.
* Overall, the ecosystem is not as strong as Java's; for example, there is no powerful networking I/O library like Netty.

Why mention this? Because Dubbo uses Netty and the official Java library for Hessian 2, and at the start of dubbo-go's development, these resources were unavailable, making it **a difficult journey for dubbo-go, but the community ultimately overcame these challenges and contributed the open-source Getty and Hessian2 projects**.

A special thanks to early organizer Yu Yu from the dubbo-go community. The project's early versions were developed in **2016** under the leadership of Hu Changcheng and Liu Wei, who contributed to the Hessian2 and Getty projects, laying a solid foundation for the latest version of dubbo-go.

*OSCHINA*: Not long ago, Dubbo announced it would emphasize Service Mesh in version 3.0, which is language-agnostic. So, does it make sense for dubbo-go to join the ecosystem at this time?

*dubbo-go He Xinming*:

Service Mesh is indeed a major direction for the future of microservices; however, at this stage, we haven't seen very successful cases in major companies in China. Many small and medium-sized companies have yet to complete or even start breaking down their microservices. Currently, the dubbo-go community primarily addresses issues these types of enterprises face in implementing microservices technologies, focusing on improving relevant functionalities, optimizing overall performance, and fixing bugs. As for the future, I believe that with Dubbo Mesh's exploration in the Service Mesh field, dubbo-go will certainly follow suit and play an important role.

*OSCHINA*: What is the update relationship between dubbo-go and Dubbo? Does it synchronize features, or does it have some innovations of its own?

*dubbo-go He Xinming*:

Our latest version released is v1.0.0. After each new release, we clearly specify which Dubbo versions are compatible. Therefore, dubbo-go needs to be compatible with the functionalities corresponding to the Dubbo version numbers and will synchronize some Dubbo features.

*OSCHINA*: What noteworthy features does the newly released version bring?

*dubbo-go He Xinming*:

The currently released v1.0.0 version supports the following functionalities:

* Role: Consumer(√), Provider(√)
* Transport Protocol: HTTP(√), TCP(√)
* Serialization Protocol: JsonRPC v2(√), Hessian v2(√)
* Registration Center: ZooKeeper(√)
* Cluster Strategy: Failover(√)
* Load Balancing: Random(√)
* Filter: Echo Health Check(√)
* Extension mechanism

The dubbo-go v1.0.0 version is primarily maintained by myself and my colleague[ Fang Yincheng](https://github.com/fangyincheng) at Trip.com, with community members [Zhou Ziqing](https://github.com/u0x01) and [Gao Xinge](https://github.com/gaoxinge) contributing. This version retains Dubbo's code layering and decoupling design. The main functionalities of Dubbo 2.6.x will gradually be implemented in dubbo-go, including the SPI-based code extension mechanism, which has a corresponding extension mechanism.

In the future, we will gradually roll out more implementations of currently extensible modules, such as completing more Loadbalance, Cluster Strategy implementations (currently these tasks are undertaken by community partners, and we hope more Go enthusiasts can join the community to contribute); similarly, for Kubernetes, which is quite popular in the cloud-native field, we will synchronize Dubbo's roadmap to follow up on Kubernetes as a registration center, led by community member [Zhang Haibin](https://github.com/NameHaibinZhang).

Of course, developers can also implement new interfaces for these modules through extensions to cater to their unique needs without modifying the source code. We also warmly welcome developers to contribute useful extension implementations to the community.

This version addresses a significant problem: the **solution for interoperability with the Dubbo Java version**. We extracted this part into the [Hessian2](https://github.com/dubbogo/hessian2) project, which originated from early community contributions by [Yu Yu](https://github.com/AlexStocks) and is now maintained by community member [Wang Ge](https://github.com/wongoo), with contributions from [Zhou Ziqing](https://github.com/u0x01) and [Gao Xinge](https://github.com/gaoxinge). This project has completed compatibility support for most Java types. Everyone can also integrate this project into their projects; its open-source license is Apache-2.0.

Another critical aspect is the **TCP asynchronous network I/O library now used by dubbo-go**, which is also based on an early project by Yu Yu. It is currently maintained by community members [Wang Ge](https://github.com/wongoo) and [Fang Yincheng](https://github.com/fangyincheng), and it is also under the Apache-2.0 open-source license. In the next version, we **will further optimize the network I/O and thread dispatch aspects for dubbo-go and Getty**.

Additionally, we plan to support several other critical functionalities of Dubbo in the next steps, such as:

* routing rule (dubbo v2.6.x)
* dynamic configuration center (dubbo v2.* 7.x)
* metrics and monitoring (dubbo v2.7.x)
* trace monitoring (dubbo ecos)

*OSCHINA*: What is the current application status of the project?

*dubbo-go He Xinming*:

dubbo-go has now started being attempted by some enterprises to integrate Go language applications into their existing Java & Dubbo tech stack and to build entirely new Go language distributed applications. For example, Zhongtong Express internally calls Java Dubbo services using Go; as a service framework for Trip.com's Go language applications and for interoperability between Go and Java applications.

For specific application details, please refer to: https://github.com/dubbo/go-for-apache-dubbo/issues/2

*OSCHINA*: What is the direction of future evolution?

*dubbo-go He Xinming*:

After dubbo-go migrates to the Apache Software Foundation as a subproject of Apache Dubbo, the most important task is **further optimization of performance**. Currently, while the performance meets production-level application requirements, we believe it hasn't fully leveraged Go's advantages, and there is considerable room for optimization. For instance, as mentioned earlier, the next version will optimize the network I/O model and thread dispatch of Getty in dubbo-go applications.

Additionally, as highlighted above, we need to complete some important functionalities, maximizing **functional completeness** to align with Dubbo's capabilities. Regarding the future development of dubbo-go, it will evolve along the line of the Dubbo 2.7.x roadmap.

*OSCHINA*: Speaking of performance, what is the current performance situation?

*dubbo-go He Xinming*:

We have created a [dubbo-go-benchmark](https://github.com/dubbogo/go-for-apache-dubbo-benchmark) project, where at the hardware level of Intel(R) Xeon(R) CPU E5-2609 0 @2.40GHz with 4*8 CPU cores, sending 1k and returning 1k data with 100 concurrent requests and a total of 1 million requests, the QPS can reach around 12,000.

With a higher CPU configuration like Intel Core i9 at 2.9GHz, QPS can reach around 20,000.

In the future, we will continue performance optimization for the Hessian2 library and Getty library to save resources for users.

#### Interview Guest Introduction

**He Xinming**, Technical Expert of R&D Department at Trip.com, main author of dubbo-go. Currently focused on technologies such as Golang & Java, middle platform architecture, middleware, and blockchain.

