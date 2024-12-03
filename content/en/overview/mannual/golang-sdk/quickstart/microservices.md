---
aliases:
   - /en/docs3-v2/golang-sdk/quickstart/
   - /en/docs3-v2/golang-sdk/quickstart/
description: Dubbo-go Quick Start
linkTitle: Developing Microservice Applications
title: Developing Microservices
type: docs
weight: 2
---

This example demonstrates how to develop microservice applications using dubbo-go, adding core microservice capabilities such as service discovery, load balancing, and traffic control to the application.

## Prerequisites
In this example, we will continue to use Protobuf to develop the microservice application. Please refer to [Develop RPC Server and RPC Client](../rpc) to learn how to install necessary plugins like protoc and protoc-gen-go-triple.

## Quick Run Example
### Download Example Source Code
We maintain a series of dubbo-go usage examples in the <a href="https://github.com/apache/dubbo-go-samples/" target="_blank">apache/dubbo-go-samples</a> repository to help users quickly learn how to use dubbo-go.

You can <a href="https://github.com/apache/dubbo-go-samples/archive/refs/heads/master.zip" target="_blank">download the example zip package and extract it</a>, or clone the repository:

```shell
$ git clone --depth 1 https://github.com/apache/dubbo-go-samples
```

Switch to the quick start example directory:

```shell
$ cd dubbo-go-samples/registry/nacos
```

### Start Nacos

Since the example application enables service discovery and uses Nacos as the registry, you need to start the registry before running the example. Please refer to [Nacos Local Installation](/en/overview/reference/integrations/nacos/) for quick installation and startup instructions for Nacos.

### Run Server
In the `go-server/cmd` example directory:

Run the following command to start the server:

```shell
$ go run server.go
```

Verify that the server has started normally using `cURL`:

```shell
$ curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:50051/greet.v1.GreetService/Greet

Greeting: Hello world
```

### Run Client

Open a new terminal and run the following command to start the client:

```shell
$ go run client.go

Greeting: Hello world
```

This is a complete flow of a dubbo-go microservice application.

## Source Code Explanation
Regarding the source code of the `dubbo-go-samples/registry/nacos` example, including service definitions, code generation, and server/client startup, it is similar to the previous [rpc server & rpc client]() discussion. Please click the link above for specific interpretations.

**The biggest difference in developing microservices is that the application includes configuration for the registry, as shown below (taking server.go as an example):**

```go
func main() {
	ins, err := dubbo.NewInstance(
		dubbo.WithName("dubbo_registry_nacos_server"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress("127.0.0.1:8848"),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(20000),
		),
	)

	srv, _ := ins.NewServer()

	greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{})

	if err := srv.Serve(); err != nil {
		logger.Error(err)
	}
}
```

Compared to when developing RPC services where we directly declare `server.NewServer(...)`, here we use `dubbo.NewInstance(...)` to initialize several globally shared microservice components, including application name, registry, protocol, etc.:

```go
ins, err := dubbo.NewInstance(
	dubbo.WithName("dubbo_registry_nacos_server"),
	dubbo.WithRegistry(
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
	),
	dubbo.WithProtocol(
		protocol.WithTriple(),
		protocol.WithPort(20000),
	),
)
```

Then, we create `ins.NewServer()` and register services for the server instance `greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{})`, and finally start the process with `srv.Serve()`.

{{% alert title="About dubbo.Instance" color="info" %}}
* When developing dubbo microservice applications, we recommend using `dubbo.Instance` to set up some global service governance capabilities, such as registry, protocol, application name, tracing, configuration center, etc.
* `ins.NewServer()` can create multiple instances, typically needed when you want to [publish multiple protocols]() on different ports.
{{% /alert %}}

If you want to add more service governance capabilities to the application, please refer to the following content:

## More Content
{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../tutorial/rpc/streaming" >}}'>Service Discovery and Load Balancing</a>
                </h4>
                <p>More about using service discovery with Nacos, Zookeeper, etc., and configuring load balancing strategies.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../tutorial/service-discovery" >}}'>Traffic Control</a>
                </h4>
                <p>Learn how to achieve proportional traffic distribution, canary releases, adjust timeout settings, traffic grayscale, and service degradation.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
		<div class="h-100 card shadow" href="#">
			<div class="card-body">
				<h4 class="card-title">
					 <a href='{{< relref "../tutorial/service-discovery" >}}'>Monitoring Service Status</a>
				</h4>
				<p>Enable metrics collection and visualize application, service, and example statuses via Prometheus and Grafana.</p>
			</div>
		</div>
	</div>
    <div class="col-sm col-md-6 mb-4">
		<div class="h-100 card shadow" href="#">
			<div class="card-body">
				<h4 class="card-title">
					 <a href='{{< relref "../tutorial/service-discovery" >}}'>Full Link Tracing</a>
				</h4>
				<p>Enable OpenTelemetry full link tracing.</p>
			</div>
		</div>
	</div>
    <div class="col-sm col-md-6 mb-4">
		<div class="h-100 card shadow" href="#">
			<div class="card-body">
				<h4 class="card-title">
					 <a href='{{< relref "../tutorial/service-discovery" >}}'>Gateway HTTP Access</a>
				</h4>
				<p>How to use gateway products like Higress, Nginx, etc., to connect front-end HTTP traffic (northbound traffic) to the back-end dubbo-go microservices cluster.</p>
			</div>
		</div>
	</div>
    <div class="col-sm col-md-6 mb-4">
		<div class="h-100 card shadow" href="#">
			<div class="card-body">
				<h4 class="card-title">
					 <a href='{{< relref "../tutorial/service-discovery" >}}'>Distributed Transactions</a>
				</h4>
				<p>Use Apache Seata as a distributed transaction solution to address distributed data consistency issues.</p>
			</div>
		</div>
	</div>
</div>
<hr>
</div>
{{< /blocks/section >}}

