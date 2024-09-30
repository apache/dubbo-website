---
title: "Apache Dubbo Adds a New Member to Its Multilingual System: The First Rust Language Version is Officially Released"
linkTitle: "Dubbo Releases Its First Rust Language Version Implementation"
tags: ["Rust", "Release Notes"]
date: 2022-10-23
description: > 
    This article introduces the core features and usage of Dubbo Rust's first official version v0.2.0, along with future plans and participation methods for the Dubbo Rust community.
---

Dubbo Rust is positioned as an important implementation of the Dubbo multilingual system, providing a high-performance, easy-to-use, and extensible RPC framework, while offering rich service governance capabilities through integration with the Dubbo Mesh system. This article mainly introduces the basic situation of the Dubbo Rust project, quickly experiences the features of Rust's first official version through an example, and outlines recent plans for the Dubbo Rust community, suitable for developers and enterprises interested in or adopting Rust.

## 1 Introduction to Dubbo Rust
Dubbo, as one of the most active star projects of the Apache Foundation, is also the most popular open-source microservice framework in China, with significant advantages in usability, high-performance communication, and service governance. Through Dubbo3 and Dubbo Mesh, it provides cloud-native friendly development and deployment modes. Meanwhile, the multilingual system of Dubbo has also developed rapidly, with long-term support for Java and Golang implementations, and the official launch of support for languages like Rust, Node, Python, and C++ in the community.

- Dubbo Official Website [https://dubbo.apache.org/](https://dubbo.apache.org/)
- Dubbo Java https://github.com/apache/dubbo/
- Dubbo Golang https://github.com/apache/dubbo-go/
- **Dubbo Rust https://github.com/apache/dubbo-rust/**

The goal of Dubbo Rust is to align with all core feature designs of Dubbo3, including high-performance communication based on HTTP/2, user-friendly microservice development programming models, and rich service governance capabilities provided through integration with Dubbo Mesh. Compared to other language implementations, Dubbo Rust will take advantage of Rust’s extreme performance, safety, and instruction-level control capabilities.
For microservices frameworks, mainstream programming languages have corresponding implementations, and Dubbo Rust will fill the gap in the Rust domain:

- Golang: has occupied a significant position in the microservices framework domain with open-source communities like dubbo-go, gRPC, go-micro, and go-zero
- Java: the most widely used programming language in China, with excellent microservices frameworks like Spring Cloud and Dubbo being very popular
- C/C++: frameworks such as brpc and grpc 
- Rust: currently lacks a well-developed microservices framework

Leveraging Dubbo's vast user base and the overall plan for the Mesh service governance under the Dubbo system, Dubbo Rust can easily integrate into the existing cloud-native research and development system without increasing the R&D burden on users. The following image shows the Dubbo Mesh architecture design released by the community.

![dubbo-rust](/imgs/rust/dubbo-rust-mesh.png)

In the above architecture, the overall system is divided into two parts: the control plane and the data plane, where

- The control plane is responsible for managing traffic governance, address discovery, security authentication, observability, and other service governance-related configuration management work, including interfacing with underlying technologies such as K8S;
- Dubbo Rust acts as a component of the data plane, responsible for receiving configurations from the control plane; applying the configuration to services; while providing basic RPC communication capabilities for services.

In terms of architecture design, Dubbo Rust will be designed around Dubbo's core design as well as the characteristics of the Rust language, and the core design of the Dubbo framework will be output as documentation to enhance the usability of the Dubbo framework. Thus, Dubbo Rust has the following features: usability, high performance, and scalability, while providing rich service governance capabilities for cloud-native environments.

## 2 Quick Experience of Dubbo Rust
### 2.1 Core Capabilities of the First Version
**The first official version of Dubbo Rust is v0.2.0**, with capabilities including:

- Basic communication capabilities based on the HTTP/2 Triple protocol
- Support for RPC definitions based on IDL with Protobuf for code generation, and Serde serialization 
- Support for request-response, request/response streaming, bi-streaming communication models
- A simple and extensible architecture designed to support the extension of components like Listener, Connector, Filter, Protocol, and Invoker

The core components and communication flow of Dubbo Rust v0.2.0 are depicted in the following image.

![dubbo-rust](/imgs/rust/dubbo-rust-module.png)

The core architecture has been basically completed, and subsequent versions will focus on extending core components and designing and implementing service governance-related components. 
### 2.2 Quick Start
> For a complete example, see 【Dubbo Official Website】 -> 【Rust SDK Documentation】.  
 [https://dubbo.apache.org/zh-cn/overview/mannual/rust-sdk/quick-start/](/en/overview/mannual/rust-sdk/quick-start/)

The basic steps for developing a service using Dubbo Rust are:

1. Define the service using IDL
2. Add Dubbo Rust dependency to the project
3. Compile the IDL
4. Write Server & Client logic based on the generated stub from the IDL
5. Run the project

1. Define the Dubb service using IDL
```protobuf
```protobuf
// ./proto/greeter.proto
syntax = "proto3";

option java_multiple_files = true;

package org.apache.dubbo.sample.tri;


// The request message containing the user's name.
message GreeterRequest {
string name = 1;
}

// The response message containing the greetings
message GreeterReply {
string message = 1;
}

service Greeter{
// unary
rpc greet(GreeterRequest) returns (GreeterReply);
}
```
```

2. Add Dubbo Rust dependency
```toml
```toml
# ./Cargo.toml
[package]
name = "example-greeter"
version = "0.1.0"
edition = "2021"

[dependencies]
dubbo = "0.1.0"
dubbo-config = "0.1.0"

[build-dependencies]
dubbo-build = "0.1.0"
```
```
3. Compile the IDL and write logic based on the generated stub
Write Dubbo Server
```rust
#[tokio::main]
async fn main() {
    register_server(GreeterServerImpl {
        name: "greeter".to_string(),
    });

    // Dubbo::new().start().await;
    Dubbo::new()
        .with_config({
            let r = RootConfig::new();
            match r.load() {
                Ok(config) => config,
                Err(_err) => panic!("err: {:?}", _err), // response was dropped
            }
        })
        .start()
        .await;
}

struct GreeterServerImpl {
    name: String,
}

impl Greeter for GreeterServerImpl {
    async fn greet(
        &self,
        request: Request<GreeterRequest>,
    ) -> Result<Response<GreeterReply>, dubbo::status::Status> {
        println!("GreeterServer::greet {:?}", request.metadata);

        Ok(Response::new(GreeterReply {
            message: "hello, dubbo-rust".to_string(),
        }))
    }
}
```
```
Write Dubbo Client
```rust
#[tokio::main]
async fn main() {
    let mut cli = GreeterClient::new().with_uri("http://127.0.0.1:8888".to_string());

    println!("# unary call");
    let resp = cli
        .greet(Request::new(GreeterRequest {
            name: "message from client".to_string(),
        }))
        .await;
    let resp = match resp {
        Ok(resp) => resp,
        Err(err) => return println!("{:?}", err),
    };
    let (_parts, body) = resp.into_parts();
    println!("Response: {:?}", body);
}
```

Thus, a simple Dubbo Rust example is completed, and the complete documentation can be found on the Dubbo official website.

## 3 Roadmap and Future Plans
The Dubbo Rust Roadmap is divided into three stages:

- First, provide the basic capabilities as an RPC framework, focusing on completing RPC communication based on HTTP/2, RPC definitions based on IDL, and other essential RPC core components.
- Second, enhance Dubbo Rust as a microservice framework with advanced functionalities, including service definitions, configurations, and functional design, such as service timeouts, asynchronous calls, and context propagation. For specifics, refer to the advanced features of Dubbo Java.
- The third stage focuses on introducing rich service governance capabilities such as traffic governance, rate limiting, and observability, which will primarily be achieved by integrating with the Dubbo Mesh system, i.e., adapting to implement the Dubbo Mesh control plane.

The first stage of work has been largely completed, and you can delve into it through the Quick Start mentioned above. Work on the second and third phases is fully underway in the community, and interested community developers are welcome to participate; please see the contact information below.

The following image emphasizes the assessment of the current completeness of Dubbo Rust’s functions and task breakdown from the first stage (RPC framework) and second stage (microservice development framework) perspectives.

![dubbo-rust](/imgs/rust/dubbo-rust-tasks.png)

The above image presents important components of Dubbo Rust’s core design, ensuring that Dubbo Rust possesses a complete RPC communication capability and service governance capability in the microservices framework.

- Protocol, Filter, Listener, Connector, and other components are the core capabilities of RPC communication.
- Service registration and discovery, load balancing, Cluster, and Metadata pave the way for subsequent service governance capabilities.

In addition to the modules listed above, some non-functional requirements also need support, such as:

- Intercommunication testing among Dubbo multilingual frameworks
- Performance verification and a continuous benchmarking mechanism
- Continuous optimization of the overall architecture, such as simplifying core configurations and improving corresponding documentation

## 4 Join the Dubbo Rust Community
Like the Rust language, Dubbo Rust is a very vibrant and cutting-edge community. On the other hand, relying on the vast developer community and enterprise users behind the Apache Dubbo community, Dubbo Rust has a very solid user base and growth potential. The rapid development of Dubbo Rust anticipates contributions from community contributors.
Participating in the Dubbo Rust community offers:

- Witnessing the construction and development of the Dubbo Rust open-source project
- Learning the Rust language through practical use in large projects, deepening understanding of Rust
- Nomination as an Apache Dubbo Committer PMC
- Increasing personal exposure through the Dubbo community, enhancing individual technical influence
- Opportunities for face-to-face communication with industry experts from companies like Alibaba, quickly broadening technical perspective

Ways to participate in the Dubbo Rust community include:

- Searching and joining DingTalk groups and participating in community bi-weekly meetings, DingTalk group number **44694199**
- Visiting GitHub to create Issues or contribute code [https://github.com/apache/dubbo-rust](https://github.com/apache/dubbo-rust)

