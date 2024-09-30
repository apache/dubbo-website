---
title: "Dubbo-go Source Code Notes (1) Server Side Service Startup Process"
linkTitle: "Dubbo-go Source Code Notes (1) Server Side Service Startup Process"
tags: ["Go", "Source Code Analysis"]
date: 2021-01-14
description: This article will introduce the basic usage of the dubbo-go framework, and provide a server-side source code reading guide from the perspective of the export call chain, hoping to guide readers to further understand this framework.
---

With the rise of microservices architecture, many high-performance RPC frameworks have emerged. The Go language version of the Dubbo framework, dubbo-go, open-sourced by Alibaba, has also become a popular choice among developers. This article will introduce the basic usage of the dubbo-go framework, and provide a server-side source code reading guide from the export call chain perspective, hoping to guide readers to further understand this framework.

When starting with a framework, a good way to read the source code is as follows: start with the basic helloworld demo source code —> check configuration files —> start various dependency services (such as zk, consul) —> start the server —> then call the server through the client —> print complete request logs and responses. After a successful call, analyze the entire call stack of the framework from top to bottom starting from the configuration file parsing.

For C/S mode RPC requests, the entire call stack is divided into client and server parts, so you can read from the server-side configuration file parsing to the server listening startup and from the client-side configuration file parsing to a single invoker Call. This makes the complete request clear.

## Run the helloworld-demo provided by the official website

**Official demo related link**: https://github.com/dubbogo/dubbo-samples/tree/master/golang/helloworld/dubbo

### 1. dubbo-go 2.7 QuickStart

#### 1) Start a go-server service

- Clone the repository to your local machine

```bash
$ git clone https://github.com/dubbogo/dubbo-samples.git
```

- Go to the dubbo directory

```bash
$ cd dubbo-samples/golang/helloworld/dubbo
```

After entering the directory, you will see four folders, supporting both go and java clients and servers. We'll try to run a go server. Enter the app subfolder, where the go files are stored.

```bash
$ cd go-server/app
```

- Sample file structure

You can see three folders in go-server: app, assembly, profiles.

The app folder contains the go source code, the assembly folder contains optional build scripts for specific environments, and the profiles folder stores configuration files. For the dubbo-go framework, configuration files are very important; missing files will prevent the service from starting.

- Set environment variables pointing to configuration files

Since the dubbo-go framework relies on configuration files for startup, it locates the configuration files through environment variables. For the server side, two necessary environment variables are required: CONF_PROVIDER_FILE_PATH and APP_LOG_CONF_FILE, which should point to the server configuration file and log configuration file, respectively.

In the sample, we can use the dev environment, specifically the files profiles/dev/log.yml and profiles/dev/server.yml. Under app/, specify these two files in the command line:

```bash
$ export CONF_PROVIDER_FILE_PATH="../profiles/dev/server.yml"
$ export APP_LOG_CONF_FILE="../profiles/dev/log.yml"
```

- Set go proxy and run the service

```bash
$ go run .
```

If a timeout prompt appears, set the goproxy proxy.

```bash
$ export GOPROXY="http://goproxy.io"
```

Then run go run to start the service.

#### 2) Run Zookeeper

Install Zookeeper and run zkServer, default on port 2181.

#### 3) Run go-client to call server service

- Enter the source code directory of go-client

```bash
$ cd go-client/app
```

- Similarly, configure environment variables in /app

```bash
$ export CONF_CONSUMER_FILE_PATH="../profiles/dev/client.yml"
$ export APP_LOG_CONF_FILE="../profiles/dev/log.yml"
```

Configure go proxy:

```bash
$ export GOPROXY="http://goproxy.io"
```

- Run the program

```bash
$ go run .
```

You can find the printed request result in the logs:

```bash
response result: &{A001 Alex Stocks 18 2020-10-28 14:52:49.131 +0800 CST}
```

Also, in the running server, you can find the printed request in the logs:

```bash
req:[]interface {}{"A001"}
rsp:main.User{Id:"A001", Name:"Alex Stocks", Age:18, Time:time.Time{...}
```

Congratulations! A successful RPC call based on dubbo-go.

#### 4) Common Issues

- When the log starts with providerInit and ConsumerInit both failing, check whether the configuration paths in the environment variables are correct and whether the configuration files are correct.
- If the log shows a register failure, it is generally due to a failure to register with the registry center. Check if the registry center is running and whether the port in the configuration file related to register is correct.
- The default starting port for the sample is 20000, ensuring no occupation before starting.

### 2. Configure Environment Variables

```bash
export APP_LOG_CONF_FILE="../profiles/dev/log.yml"
export CONF_CONSUMER_FILE_PATH="../profiles/dev/client.yml"
```

### 3. Server-Side Source Code

#### 1) Directory Structure

The example structure provided by the dubbo-go framework is as follows:

![img](/imgs/blog/dubbo-go/code1/p1.png)

- The app/ folder contains the source code, and you can create your own environment variable configuration script buliddev.sh
- The assembly/ folder contains build scripts for different platforms
- The profiles/ folder contains configuration files for different environments
- The target/ folder contains the executable files

### 2) Key Source Code

The source code is placed in the app/ folder, mainly including server.go and user.go. As the name suggests, server.go is used to start the service using the framework and register the transmission protocol; user.go defines the rpc-service structure and the structure of the transmission protocol.

- **user.go**

```go
func init() {
    config.SetProviderService(new(UserProvider))
    // ------for hessian2------
    hessian.RegisterPOJO(&User{})
}
type User struct {
    Id   string
    Name string
    Age  int32
    Time time.Time
}
type UserProvider struct {
}
func (u *UserProvider) GetUser(ctx context.Context, req []interface{}) (*User, error) {
```

In user.go, you can see the init function, which is the first part executed in the server code. User is the user-defined transmission struct, and UserProvider is the user-defined rpc_service; it contains an rpc function, GetUser. Of course, users can define other rpc function methods.

In the init function, the config.SetProviderService function is called to register the current rpc_service in the framework's config.

**You can check the design diagram provided in the official dubbo documentation:**

![img](/imgs/blog/dubbo-go/code1/p2.png)

The service layer is below the config layer, and the user service will be registered layer by layer, ultimately achieving the exposure of the server.

Once the rpc-service is registered, the hessian interface is called to register the transmission struct User.

Thus, the init function completes its execution.

- **server.go**

```go
// they are necessary:
//      export CONF_PROVIDER_FILE_PATH="xxx"
//      export APP_LOG_CONF_FILE="xxx"
func main() {
    hessian.RegisterPOJO(&User{})
    config.Load()
    initSignal()
}
func initSignal() {
    signals := make(chan os.Signal, 1)
    ...
```

Then the main function executes.

The main function performs only two operations: first, it registers the User structure using the hessian register component (which is slightly redundant from before), enabling the use of getty unpacking afterwards.

Then it calls the config.Load function, which is located in the framework config/config_loader.go. This function is the starting point for the entire framework service's launch, **the important configuration processing of this function will be detailed below**. After executing the Load() function, the configuration file will be imported into the framework, then based on the contents of the configuration file, registered services will be implemented to the configuration structure, and then Export will be called to expose to the specified registry, thus starting the specific service for the corresponding port's TCP listening, successfully starting and exposing the service.

Finally, signal listening initSignal() gracefully ends the startup process of a service.

### 4. Client-Side Source Code

The client contains client.go and user.go files, where user.go is identical to the server side, thus no further explanation is provided.

- **client.go**

```go
// they are necessary:
//      export CONF_CONSUMER_FILE_PATH="xxx"
//      export APP_LOG_CONF_FILE="xxx"
func main() {
    hessian.RegisterPOJO(&User{})
    config.Load()
    time.Sleep(3e9)
    println("\n\n\nstart to test dubbo")
    user := &User{}
    err := userProvider.GetUser(context.TODO(), []interface{}{"A001"}, user)
    if err != nil {
        panic(err)
    }
    println("response result: %v\n", user)
    initSignal()
}
```

The main function is similar to the server side; first, the transmission structure is registered with hessian, and then it calls config.Load(). In the following section, we will explain that the client and server will execute specific functions loadConsumerConfig() and loadProviderConfig() from config.Load() based on the configuration type, achieving the goal of "starting service" and "calling service".

After loading the configuration, it also rewrites the corresponding functions of the client instance userProvider through service implementation, adding function proxy, applying registry and redirecting invoker to the server IP, etc. Then by calling the GetUser function, you can directly invoke the already started server and achieve the RPC process.

Next, we will explain the service startup, registry registration, and call process from both the server and client perspectives.

### 5. Custom Configuration File (Non-Environment Variable) Method

#### 1) Custom Configuration File for Server

- var providerConfigStr = `xxxxx` // configuration file content, can refer to log and client. Here you can define the way to obtain the configuration file, such as from a configuration center or local file reading.

> **Log Address**: https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/profiles/release/log.yml
>
> **Client Address**: https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/profiles/release/client.yml

- Set configurations before `config.Load()`, for example:

```go
func main() {
    hessian.RegisterPOJO(&User{})
    providerConfig := config.ProviderConfig{}
    yaml.Unmarshal([]byte(providerConfigStr), &providerConfig)
    config.SetProviderConfig(providerConfig)
    defaultServerConfig := dubbo.GetDefaultServerConfig()
    dubbo.SetServerConfig(defaultServerConfig)
    logger.SetLoggerLevel("warn") // info,warn
    config.Load()
    select {
    }
}
```

#### 2) Custom Configuration File for Client

- var consumerConfigStr = `xxxxx` // configuration file content, can refer to log and client. Here you can define the way to obtain the configuration file, such as configuration center or local file reading.
- Set configurations before `config.Load()`, for example:

```go
func main() {
     p := config.ConsumerConfig{}
     yaml.Unmarshal([]byte(consumerConfigStr), &p)
     config.SetConsumerConfig(p)
     defaultClientConfig := dubbo.GetDefaultClientConfig()
     dubbo.SetClientConf(defaultClientConfig)
     logger.SetLoggerLevel("warn") // info,warn
     config.Load()

     user := &User{}
     err := userProvider.GetUser(context.TODO(), []interface{}{"A001"}, user)
     if err != nil {
         log.Print(err)
         return
     }
  log.Print(user)
}
```

## Server Side

The service exposure process involves multiple encapsulations and exposures of the original rpcService. Other articles online seem too vague, so here is a simple flow chart of a user-defined service data flow:

![img](/imgs/blog/dubbo-go/code1/p3.png)

### 1. Load Configuration

#### 1) Framework Initialization

Before loading the configuration, the framework provides many predefined protocols, factories, and other components that will be registered in the corresponding module init functions for selection in the configuration files.

Among them, the important ones are:

- **Default Function Proxy Factory**: common/proxy/proxy_factory/default.go

```go
func init() {
    extension.SetProxyFactory("default", NewDefaultProxyFactory)
}
```

Its role is to encapsulate the original rpc-service into proxy_invoker for easier realization of remote call invocation. For more details, see its invoke function.

- **Registry Registration Protocol**:
  registry/protocol/protocol.go

```go
func init() {
    extension.SetProtocol("registry", GetProtocol)
}
```

It is responsible for exposing the invoker to the corresponding registry, such as the zk registry.

- **Zookeeper Registration Protocol**: registry/zookeeper/zookeeper.go

```go
func init() {
    extension.SetRegistry("zookeeper", newZkRegistry)
}
```

It combines the base_resiger, responsible for registering the service in the zookeeper registry during the exposure process, thus providing a calling method for the caller.

- **Dubbo Transport Protocol**: protocol/dubbo/dubbo.go

```go
func init() {
    extension.SetProtocol(DUBBO, GetProtocol)
}
```

It is responsible for listening to the corresponding port, exposing specific services, and starting corresponding event handlers to pass remote call events to the invoker, invoke local invoker, and obtain execution results.

- **Filter Wrapped Invocation Chain Protocol**: protocol/protocolwrapper/protocol_filter_wrapper.go

```go
func init() {
    extension.SetProtocol(FILTER, GetProtocol)
}
```

It is responsible for packaging the proxy invoker during service exposure, forming an invocation chain through the configured filters, delivered to the dubbo protocol for exposure.

The components implemented by the framework registered in advance will be used throughout the entire service exposure invocation chain based on configuration.

#### 2) Configuration File

The important configurations required for the server include three fields: services, protocols, registries.

profiles/dev/server.yml:

```yaml
registries :
  "demoZk":
    protocol: "zookeeper"
    timeout    : "3s"
    address: "127.0.0.1:2181"
services:
  "UserProvider":
    registry: "demoZk"
    protocol : "dubbo"
    interface : "com.ikurento.user.UserProvider"
    loadbalance: "random"
    warmup: "100"
    cluster: "failover"
    methods:
    - name: "GetUser"
      retries: 1
      loadbalance: "random"
protocols:
  "dubbo":
    name: "dubbo"
    port: 20000
```

The services specify the name of the rpc-service to be exposed ("UserProvider"), the name of the exposure protocol ("dubbo"), the protocol name for registration ("demoZk"), the service's interface, load balancing strategy, cluster failure strategy, and called methods.

The protocol name of the middle service needs to correspond to the mapkey under registries, and the exposed protocol name needs to correspond to the mapkey under protocols.

As observed in the above example, dubbo is used as the exposure protocol, and zookeeper is used as the intermediate registration protocol, with a designated port. If zk needs to set a username and password, it can also be specified in the configuration.

#### 3) Read and Check Configuration File

> config/config_loader.go:: Load()

In the main function of the above example, there is a direct call to the config.Load() function, the detailed execution of this function is as follows:

```go
// Load Dubbo Init
func Load() {
    // init router
    initRouter()
    // init the global event dispatcher
    extension.SetAndInitGlobalDispatcher(GetBaseConfig().EventDispatcherType)
    // start the metadata report if config set
    if err := startMetadataReport(GetApplicationConfig().MetadataType, GetBaseConfig().MetadataReportConfig); err != nil {
  logger.Errorf("Provider starts metadata report error, and the error is {%#v}", err)
  return
    }
    // reference config
    loadConsumerConfig()
    // service config
    loadProviderConfig()
    // init the shutdown callback
    GracefulShutdownInit()
}
```

In this article, we focus on the functions loadConsumerConfig() and loadProviderConfig().

For the provider side, the loadProviderConfig() function code is as follows:

![img](/imgs/blog/dubbo-go/code1/p4.png)

The first half deals with reading and checking the configuration; after entering the for loop, it begins to expose each service in turn.

As previously mentioned, various information about the service to be exposed, such as service name, interface name, and method name, has already been written in the configuration file. Inside the for loop, the registered rpcService instance is retrieved using the key through the GetProviderService function:

![img](/imgs/blog/dubbo-go/code1/p5.png)

This object becomes the rpcService variable in the for loop, registering it using the Implement function to write into sys (of type ServiceConfig), setting up sys's key and protocol group, and finally calling the Export method on sys.

This corresponds to the corresponding part of the flowchart:

![img](/imgs/blog/dubbo-go/code1/p6.png)

Thus, the framework's configuration structure obtains all configurations related to the service and the user-defined rpc-service instance, triggering the Export method aiming to expose its instance. This marks the starting point of the Export call chain.

### 2. Original Service Encapsulated into Proxy Invoker

> config/service_config.go :: Export()

Next, we enter the ServiceConfig.Export() function.

This function does some granular operations, such as allocating random ports for different protocols; if multiple central registration protocols are specified, it will expose the service through multiple registryProtocol; we only care about how to operate for a single registration protocol. Other operations include generating call URLs and registration URLs to prepare for exposure.

#### 1) First, generate the corresponding registryUrl and serviceUrl through configuration

![img](/imgs/blog/dubbo-go/code1/p7.png)

registryUrl is used to initiate registration requests to the central registry. For zookeeper, this involves passing its IP and port number plus any additional username and password.

This regUrl currently only contains registration (zk) related information; later will be supplemented with ServiceIvk, containing call-related parameters such as method name and arguments...

#### 2) For one registration protocol, register the input rpc-service instance in common.ServiceMap

![img](/imgs/blog/dubbo-go/code1/p8.png)

This Register function registers the service instance twice, once using the Interface as key in the interface service group, and once using interface and proto as key in a specific unique service.

Later, this instance will be fetched from common.Map.

#### 3) Get the default proxy factory and encapsulate the instance into the proxy invoker

```go
// Getting a proxyInvoker, the invoker's URL is the passed regUrl, which encapsulates the registered service instance into an invoker
invoker := extension.GetProxyFactory(providerConfig.ProxyFactory).GetInvoker(*regUrl)
// Expose by generating exporter and starting TCP listening
exporter = c.cacheProtocol.Export(invoker)
```

This step of the GetProxyFactory("default") method retrieves the default proxy factory and encapsulates the regUrl into the proxy invoker.

You can investigate common/proxy/proxy_factory/default.go::ProxyInvoker.Invoke() function for the svc section from common.Map and the actual invocation of svc corresponding Method.

At this point, the invoker returned from GetInvoker(*regUrl) is the proxy_invoker, which has encapsulated the user-defined rpc_service, embedding specific invocation logic within the Invoke function.

> Why use Proxy_invoker for invocation?
>
> This proxy_invoke allows the user’s function to be called in a more abstract manner; one can observe in the code the use of ins and outs to define input and output parameters, abstracting the entire invocation process into an invocation structure while encapsulating the selection of actual function names, parameter passing, and reflection process within the invoke function, making this design beneficial for future remote calls. Personally, this represents the design philosophy of the dubbo Invoke call chain.
>
> Thus, we have realized the corresponding parts in the flowchart:

![img](/imgs/blog/dubbo-go/code1/p10.png)

### 3. Registry Protocol Exposing the Above Proxy Invoker on zkRegistry

Here, we execute exporter = c.cacheProtocol.Export(invoker).

CacheProtocol serves as a caching design; corresponding to the original demo, this is the default implemented registryProtocol.

> registry/protocol/protocol.go:: Export()

This function constructs multiple EventListeners and exhibits a strong sense of Java design.

We only focus on the service exposure process, ignoring these listeners for now.

#### 1) Retrieve registration URL and service URL

![img](/imgs/blog/dubbo-go/code1/p11.png)

#### 2) Retrieve the registry instance zkRegistry

![img](/imgs/blog/dubbo-go/code1/p12.png)

There's a layer of cache operation; if the cache does not exist, it retrieves from common zkRegistry again.

#### 3) zkRegistry calls the Registry method to register dubboPath on Zookeeper

With the concrete instance of zkRegistry obtained, its definition can be found in: registry/zookeeper/registry.go.

![img](/imgs/blog/dubbo-go/code1/p13.png)

This structure combines with registry.BaseRegistry, defining the basic functional functions of the registrar, such as Registry, Subscribe, etc., yet these default-defined functions will still invoke facade-level (zkRegistry layer) specific implementation functions. This design model enables the existing functional definitions not to be redundantly redefined while allowing the introduction of outer function implementations, akin to struct inheritance but reusing code. This design model is worth learning.

We observe that the registry/protocol/protocol.go:: Export() function directly calls:

```go
// Register the existing @root@rawurl to zk via the zk registrar
err := reg.Register(*registeredProviderUrl)
```

This registers the existing RegistryUrl with the zkRegistry.

This call invokes the baseRegistry's Register function, leading to the zkRegister's DoRegister function.

![img](/imgs/blog/dubbo-go/code1/p14.png)

In this function, it creates a new node for the corresponding root.

![img](/imgs/blog/dubbo-go/code1/p15.png)

And writes specific node information, which includes the encoded service call method on the URL. 

This section of code is rather complex; for specific implementations, refer to the baseRegistry's processURL() function: http://t.tb.cn/6Xje4bijnsIDNaSmyPc4Ot.

Thus, the service calling URL has been registered in Zookeeper, and for clients to access this URL, they only need to pass the specific dubboPath to request from zk. Currently, the client can access the calling method, but the specific server-side service has not started, and the specific protocol port listening has also not commenced; this will also be handled in the registry/protocol/protocol.go:: Export() function.

#### 4) Proxy_invoker is Encapsulated into a Wrapped_invoker, Forming a Filter Invocation Chain

```go
    // enveloped invoker into wrappedInvoker
    wrappedInvoker := newWrappedInvoker(invoker, providerUrl)
    // By adding filter invocation chains to the invoker, use the dubbo protocol to Export, starting the service and returning the Exporter.
    cachedExporter = extension.GetProtocol(protocolwrapper.FILTER).Export(wrappedInvoker)
```

A newly created WrappedInvoker prepares for subsequent chained calls.

Retrieving the previously established ProtocolFilterWrapper, invoking the Export method further exposes it.

> protocol/protocolwrapped/protocol_filter_wrapper.go:Export()

![img](/imgs/blog/dubbo-go/code1/p16.png)

> protocol/protocolwrapped/protocol_filter_wrapper.go:buildInvokerChain

![img](/imgs/blog/dubbo-go/code1/p17.png)

As inferred from the configurations, the proxy_invoker is layered within the call chain, resulting in a returned invocation chain invoker.

Corresponding to the parts in the diagram:

![img](/imgs/blog/dubbo-go/code1/p18.png)

At this point, we have obtained the filter invocation chain and are set to expose this chain to a particular port to respond to request events.

#### 5) Expose wrapped_invoker via Dubbo Protocol

> protocol/protocolwrapped/protocol_filter_wrapper.go:Export()

```go
// Export the wrapped invoker using the dubbo protocol
return pfw.protocol.Export(invoker)
```

Returning to the last line of the previous Export function, it calls the Export method of dubboProtocol to actually expose the aforementioned chain.

The specific implementation of this Export method can be found in: protocol/dubbo/dubbo_protocol.go: Export().

![img](/imgs/blog/dubbo-go/code1/p19.png)

This function accomplishes two tasks: constructing a trigger and starting the service.

- It encapsulates the incoming Invoker calling chain further, creating an exporter and saving the export in a map. **Note! Here the exporter is placed in SetExporterMap; during service startup, this exporter will be retrieved as part of the registration event listener!**
- It calls the openServer method of dubboProtocol, initiating a listener for the designated port.

![img](/imgs/blog/dubbo-go/code1/p20.png)

As illustrated, a Session is passed in to commence event listening on the corresponding port.

At this point, the exporter has been constructed, completing that part of the diagram:

![img](/imgs/blog/dubbo-go/code1/p21.png)

### 4. Registration Triggered Actions

The above merely initiated the service without viewing the trigger event details. Delving into the aforementioned s.newSession, it reveals that the dubbo protocol for a getty session, utilizes the default configuration:

![img](/imgs/blog/dubbo-go/code1/p22.png)

One crucial configuration is the EventListener, which defaults to the rpcHandler of dubboServer.

> protocol/dubbo/listener.go:OnMessage()

The rpcHandler contains an implemented OnMessage function, which processes upon receiving a message in the connection according to the getty API as the client calls the designated port.

```go
// OnMessage notified when RPC server session got any message in connection
func (h *RpcServerHandler) OnMessage(session getty.Session, pkg interface{}) {
```

This function implements a series of processes upon receiving an RPC call in the getty session:

- Parsing the incoming package

![img](/imgs/blog/dubbo-go/code1/p23.png)

- Constructing the request URL based on the package

![img](/imgs/blog/dubbo-go/code1/p24.png)

- Retrieving the request key and locating the exporter to be called

![img](/imgs/blog/dubbo-go/code1/p25.png)

- Accessing the corresponding Invoker

![img](/imgs/blog/dubbo-go/code1/p26.png)

- Constructing the invocation

![img](/imgs/blog/dubbo-go/code1/p27.png)

- Calling

![img](/imgs/blog/dubbo-go/code1/p28.png)

- Returning

![img](/imgs/blog/dubbo-go/code1/p29.png)

The entire invocation process proceeds smoothly. A successful RPC call returns correctly.

## Summary

- **About Layered Encapsulation of Invoker**

Ability to abstract a call into an invoke; abstraction of a protocol as an encapsulation for invoke; encapsulating specific alterations made for an invoke within the invoke function reduces module coupling. The layered encapsulation logic is clearer.

- **About URL Abstraction**

The extreme abstraction of the unified request object URL of dubbo is something I have not encountered before... I believe such encapsulation guarantees simplification and consistency of the request parameter list. However, during development, excessive misuse of abstract interfaces might cause difficulties in debugging, alongside uncertainty about which fields are pre-packaged and which are superfluous.

- **About Protocol Understanding**

My previous understanding of protocols was too specific; however, about the dubbo-go dubboProtocol, I consider it a deeper encapsulation based on getty, defining particular operations regarding sessions that the client and server should undertake. This guarantees consistency between the invoker and the invoked protocol, which is also a manifestation of the protocol — regulated by the dubbo protocol.

If you have any questions, feel free to scan the DingTalk QR code to join the discussion group: DingTalk Group Number 23331795!

> Author Profile: **Li Zhixin** (GitHub ID LaurenceLiZhixin), a student majoring in Software Engineering at Sun Yat-sen University, proficient in Java/Go, focused on cloud-native and microservices technology directions.

