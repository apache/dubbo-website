---
type: docs
title: "Dubbo-go Samples"
linkTitle: "Dubbo-go Samples"
description: This article introduces how to use Dubbo-go Samples
weight: 5
---


In order to facilitate the use of Dubbogo framework users, we provide the Samples repository for user reference:

[[Dubbo-go-samples warehouse address]](https://github.com/apache/dubbo-go-samples)

## 1. Examples contained in the Samples repository

* config-api: use API for configuration initialization
* configcenter: Use different configuration centers, currently supports three types: zookeeper, apollo, and nacos
* context: how to use context to pass attachment
* direct: direct connection mode
* game: game service example
* generic: generalized call
* rpc: RPC call example, including Triple, Dubbo and other protocols and cross-language/gRPC interoperability examples
* helloworld: RPC call entry example
* logger: log example
* registry: Show the docking with different registry centers, including zk, nacos, etcd
* metrics: data reporting
* filter: Examples of using provided filters and custom filters
* registry/servicediscovery: application-level service discovery example
* router: routing example
* tracing: link tracing example

## 2. How to run

There are currently three ways to run dubbo-go examples:

1. Quick start through bash command: start the sample and unit test through a simple command line
2. Start quickly in the IDE, which is also the **recommended** way: In the project ".run" subdirectory, all example GoLand run configuration files are provided, so users can simply click to run all in the IDE example.
3. Manually configure and run in the IDE: For the purpose of completeness, and in case you do not use GoLand and use other IDEs, here is also a step-by-step configuration guide to help users understand how to configure in the IDE , to run or debug dubbo-go examples.

### 2.1 Quick start via command line

*Preconditions: docker environment is required to be ready*

Below we will use "helloworld" as an example:

1. **Start the registration center (such as zookeeper)**

   ```bash
   make -f build/Makefile docker-up
   ```

   When you see output similar to the following, it means that the zookeeper server is ready to start.

   ```bash
   > Starting dependency services with ./integrate_test/dockercompose/docker-compose.yml
   Docker Compose is now in the Docker CLI, try `docker compose up`
   
   Creating network "dockercompose_default" with the default driver
   Creating dockercompose_zookeeper_1... done
   Creating etcd... done
   Creating nacos-standalone... done
   ```

   If you want to stop the registry, you can do it by running the following command:

   ```bash
   make -f build/Makefile docker-down
   ```

2. **Start Service Provider**

    ```bash
    cd helloworld/go-server/cmd
    export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
    go run .
    ```

   When you see output similar to the following, the service provider is ready to start.

   ```bash
   2021/10/27 00:33:10 Connected to 127.0.0.1:2181
   2021/10/27 00:33:10 Authenticated: id=72057926938066944, timeout=10000
   2021/10/27 00:33:10 Re-submitting `0` credentials after reconnect
   ```

3. **Run service caller**

    ```bash
   cd helloworld/go-client/cmd
   export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
   go run .
   ```

   When the following information is output, it means that `go-client` calls `go-server` successfully.

   ```bash
   2021-10-27T00:40:44.879+0800 DEBUG triple/dubbo3_client.go:106 TripleClient.Invoke: get reply = name:"Hello laurence" id:"12345" age:21
   2021-10-27T00:40:44.879+0800 DEBUG proxy/proxy.go:218 [makeDubboCallProxy] result: name:"Hello laurence" id:"12345" age:21 , err: <nil>
   2021-10-27T00:40:44.879+0800 INFO cmd/client.go:51 client response result: name:"Hello laurence" id:"12345" age:21
   ```

4. **Integration tests**
   In addition to showing how to use the functions and features in dubbo-go, this project dubbo-go-samples is also used for integration testing of apache/dubbo-go. Integration tests designed for `go-server` can be run as follows:

   Start the server first
   ```bash
   cd helloworld/go-server/cmd
   export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
   go run .
   ```

   Then switch to the single test directory, set the environment variables, and then execute the single test
   ```bash
   cd integrate_test/helloworld/tests/integration
   export DUBBO_GO_CONFIG_PATH="../../../../helloworld/go-client/conf/dubbogo.yml"
   go test -v
   ```

   When the following information is output, the integration test has passed.

   ```bash
   > Running integration test for application go-server
   ...
   --- PASS: TestSayHello (0.01s)
   PASS
   ok github.com/apache/dubbo-go-samples/integrate_test/helloworld/tests/integration0.119s
   ```

7. **Close and Cleanup**
   ```bash
   make -f build/Makefile clean docker-down
   ```

*The following two modes of operation are related to the IDE. Here we take Intellij GoLand as an example to discuss. *

### 2.2 Quick start in IDE

Once you open this project in GoLand, you can find that in the "Run Configuration" pop-up menu, there are already a series of pre-configured options for running related service providers and callers, for example: "helloworld-go-server " and "helloworld-go-client".

You can select any of these quick start related examples. Of course, before running, it is assumed that the required registry has been started in advance, otherwise the use case will fail. You can choose to start it manually, or use the "docker-compose.yml" provided in the project to start the docker instance in the registration center.

### 2.3. Manually run in the IDE

Take *Intellij GoLand* as an example here. After opening the dubbo-go-samples project in GoLand, follow the steps below to run/debug this sample:

1. **Start the zookeeper server**

   Open the "integrate_test/dockercompose/docker-compose.yml" file, and click the ▶︎▶︎ icon in the left gutter column of the editor to run, the "Service" Tab should pop up and output a text message similar to the following:
   ```
   Deploying 'Compose: docker'...
   /usr/local/bin/docker-compose -f ...integrate_test/dockercompose/docker-compose.yml up -d
   Creating network "docker_default" with the default driver
   Creating docker_zookeeper_1...
   'Compose: docker' has been deployed successfully.
   ```

2. **Start Service Provider**

   Open the "helloworld/go-server/cmd/server.go" file, then click the ▶︎ icon next to the "main" function in the left gutter column, and select "Modify Run Configuration..." from the pop-up menu, And make sure the following configuration is accurate:
   * Working Directory: Absolute path of "helloworld/go-server" directory, for example: */home/dubbo-go-samples/helloworld/go-server*
   * Environment: DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"

   In this way, the server in the example is ready and ready to run.

3. **Run Service Consumer**

   Open the "helloworld/go-client/cmd/client.go" file, then click the ▶︎ icon next to the "main" function from the left gutter column, and then select "Modify Run Configuration... ", and make sure the following configuration is accurate:
   * Working Directory: Absolute path of "helloworld/go-client" directory, for example: */home/dubbo-go-samples/helloworld/go-client*
   * Environment: DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"

   Then you can run and call the remote service. If the call is successful, there will be the following output:
   ```
   [2021-02-03/16:19:30 main.main: client.go: 66] response result: &{A001 Alex Stocks 18 2020-02-04 16:19:30.422 +0800 CST}
   ```

If you need to debug this example or the dubbo-go framework, you can switch from "Run" to "Debug" in the IDE. If you want to end, just click ◼︎ directly.