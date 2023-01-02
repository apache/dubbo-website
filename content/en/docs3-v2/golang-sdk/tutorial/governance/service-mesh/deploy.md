---
title: Deploy Dubbo-go application in Istio environment
type: docs
weight: 2
---

In this chapter, we will use the application template to quickly create a set of Dubbo-go Server and Client applications and deploy them in the Istio cluster; observe, debug and verify that service discovery and invocation are successful.

## 1. Preparations

- The dubbo-go cli tool and dependent tools have been installed, grpc_cli (for local debugging).
- The docker, helm, and kubectl environments have been installed. (arm machines need to support docker buildx)
- [Task [istio environment deployment]](../istio/) completed

## 2. Develop server-side Dubbo-go application

### 2.1 Use dubbogo-cli to create a project template

```plain
$ mkdir mesh-app-server
$ cd mesh-app-server
$ dubbogo-cli newApp .
$ tree .
.
├── Makefile
├── api
│ └── api.proto
├──build
│ └── Dockerfile
├── chart
│ ├── app
│ │ ├── Chart.yaml
│ │ ├── templates
│ │ │ ├── _helpers.tpl
│ │ │ ├── deployment.yaml
│ │ │ ├── service.yaml
│ │ │ └── serviceaccount.yaml
│ │ └── values.yaml
│ └── nacos_env
│ ├── Chart.yaml
│ ├── templates
│ │ ├── _helpers.tpl
│ │ ├── deployment.yaml
│ │ └── service.yaml
│ └── values.yaml
├── cmd
│ └── app.go
├── conf
│ └── dubbogo.yaml
├── go.mod
├── go.sum
└── pkg
    └── service
        └── service.go
```

The generated project includes several directories:

- api: place interface files: proto file and generated pb.go file
- build: place build related files
- Chart: place the chart warehouse for publishing, the basic environment chart warehouse: nacos, mesh (under development)
- cmd: program entry
- conf: framework configuration
- pkg/service: RPC service implementation
- Makefile:

- - Mirror, Helm installation name:

- - ```
    IMAGE = $(your_repo)/$(namespace)/$(image_name)
    TAG = 1.0.0
    HELM_INSTALL_NAME = dubbo-go-app
    ```

- - Provide scripts such as:

- - - make build # Package the image and push it
- make buildx-publish # The arm architecture locally packs the amd64 image and pushes it, relying on buildx
- make deploy # Publish the application through helm
- make remove # Delete the published helm application
- make proto-gen # generate pb.go file under api
  -...

### 2.2 Develop and deploy Dubbo-go applications:

#### Developing Applications

- compile interface

  Developers need to modify the proto file, and the default interface can be used directly in this task.

  ```bash
  $ make proto-gen
  protoc --go_out=./api --go-triple_out=./api ./api/api.proto
  ```

- pull dependencies

  ```bash
  $ go get dubbo.apache.org/dubbo-go/v3@3.0
  $ make tidy
  go mod tidy
  ```

- Write business logic

  Modify pkg/service/service.go to implement the function, and the version displayed in the returned string is v1.0.0

  ```go
  func (s *GreeterServerImpl) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
  return &api.User{Name: "Hello " + in.Name, Id: "v1.0.0"}, nil
  }
  ```

- Modify the following configuration fields to use the xds protocol as the registration center

  conf/dubbogo.yaml

  ```yaml
  dubbo:
    registries:
      xds:
        protocol: xds
        address: istiod.istio-system.svc.cluster.local:15010
    protocols:
      triple:
        name: tri
        port: 20000
    provider:
      services:
        GreeterServerImpl:
          interface: "" # read from stub
  
  ```

  At this point, the application development is complete.

#### Configure build and deployment parameters

- Specify the image to be built:

  Modify the following fields in the Makefile to specify the address and version of the image to be built.

  Specify the name that needs to be installed through helm.

  ```
  IMAGE = xxx/dubbo-go-server
  TAG = 1.0.0
  HELM_INSTALL_NAME = dubbo-go-server-v1
  ```

- Specify the application and image to be deployed:

  Modify the following fields in chart/app/Chart.yaml, and specify the current application name as `dubbo-go-server`. When deploying, a service named dubbo-go-server will be created and associated with all versions of the current application.

  ```yaml
  apiVersion: v1
  name: dubbo-go-server
  description: dubbo-go-server
  ```

  Modify the following fields in chart/app/values.yaml, and specify the image to be deployed and the currently developed application version dubbogoAppVersion as v1.

  The deployed image needs to be consistent with the image built above. The current application version is used for mesh traffic rule control.

  ```yaml
  image:
    repository: xxx/dubbo-go-server
    pullPolicy: Always
    tag: "1.0.0"
  
  # Dubbo-go-mesh version control labels
  version:
    labels:
      dubbogoAppVersion: v1
  ```

  At this point, the build parameters and release parameters have been specified, ready to build and deploy.

#### Use templates to build and deploy Dubbo-go applications

- Build and push images

  `$ make build` (locally for amd64 machines)

  or

  `$ make buildx-publish` (Local is arm64 machine, depends on docker buildx command)

- Publish the Dubbo-go application to the cluster

  ```bash
  $ make deploy
  helm install dubbo-go-server-v1 ./chart/app
  NAME: dubbo-go-server-v1
  LAST DEPLOYED: Thu Apr 7 11:19:42 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  $ helm list
  NAME NAMESPACE REVISION UPDATED STATUS CHART APP VERSION
  dubbo-go-server-v1 default 1 2022-04-07 11:19:42.350553 +0800 CST deployed dubbo-go-server-0.0.1 1.16.0
  ```

  It can be seen that the deployment through helm is successful



### 2.3 Verify application

#### View resource deployment

View the deployed deployment, the version is v1.

```bash
$ kubectl get deployment
NAME READY UP-TO-DATE AVAILABLE AGE
dubbo-go-server-v1 1/1 1 1 26s
```

View the deployed service.

```bash
$ kubectl get svc
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
dubbo-go-server ClusterIP 192.168.216.253 <none> 20000/TCP 70s
```

#### (*Optional) Debug the deployed Dubbo-go application locally

Use kubectl port-forward Dubbo-go to apply locally

```bash
$ kubectl port-forward svc/dubbo-go-server 20000
Forwarding from 127.0.0.1:20000 -> 20000
Forwarding from [::1]:20000 -> 20000
```

Use grpc_cli to debug applications in the cluster, refer to the task [[Use grpc_cli to debug Dubbo-go applications]](/en/docs3-v2/golang-sdk/tutorial/debugging/grpc_cli/)

```bash
$ grpc_cli ls localhost:20000 -l
filename: api/api.proto
package: api;
service Greeter {
  rpc SayHello(api.HelloRequest) returns (api.User) {}
  rpc SayHelloStream(stream api.HelloRequest) returns (stream api.User) {}
}
```

Use grpc_cli to initiate a call to test the interface

```bash
$ grpc_cli call localhost:20000 SayHello "name: 'laurence'"
connecting to localhost:20000
name: "Hello Laurence"
id: "v1.0.0"
Received trailing metadata from server:
accept-encoding: identity, gzip
grpc-accept-encoding : identity,deflate,gzip
Rpc succeeded with OK status
```

So far, we have successfully developed an application and deployed it in the istio cluster.

## 3. Develop client-side Dubbo-go application

### 3.1 Use dubbogo-cli to create another project template

```bash
$ dubbogo-cli newApp .
```

### 3.2 Develop and deploy client Dubbo-go applications:

#### Write business logic

- Modify the main method of cmd/app.go to initiate a call to the downstream interface every second

```go
func main() {
client := &api. GreeterClientImpl{}
config. SetConsumerService(client)
if err := config.Load(); err != nil {
panic(err)
}
request := &api.HelloRequest{
Name: "Laurence",
}

for {
if rsp, err := client.SayHello(context.Background(), request); err != nil{
logger.Errorf("call server error = %s", err)
}else{
logger.Infof("call server response = %+v", rsp)
}
time. Sleep(time. Second)
}
}
```

- Modify the following configuration file, use the xds protocol as the registration center, and load the client service named GreeterClientImpl.

  conf/dubbogo.yaml

  ```yaml
  dubbo:
    registries:
      xds:
        protocol: xds
        address: istiod.istio-system.svc.cluster.local:15010
    consumer:
      references:
        GreeterClientImpl:
          protocol: tri
          interface: "" # read from stub
  ```

  At this point, the application development is complete.

#### Configure build and deployment parameters

- Specify the image to be built:

  Modify the following fields in the Makefile to specify the address and version of the image to be built.

  Specify the name that needs to be installed through helm.

  ```
  IMAGE=xxx/dubbo-go-client
  TAG = 1.0.0
  HELM_INSTALL_NAME = dubbo-go-client
  ```

- Specify the application and image to be deployed:

  Modify the following fields in chart/app/Chart.yaml, and specify the current application name as `dubbo-go-client`. When deploying, a service named dubbo-go-client will be created and associated with all versions of the current application. For a client-only application, you don’t need to create a sevice, and it can be modified by the developer in the template. In this tutorial, we create it by default.

  ```yaml
  apiVersion: v1
  name: dubbo-go-client
  description: dubbo-go-client
  ```

  Modify the following fields in chart/app/values.yaml, and specify the image to be deployed and the currently developed application version dubbogoAppVersion as v1.

  The deployed image needs to be consistent with the image built above. The current application version is used for mesh traffic rule control.

  ```yaml
  image:
    repository: xxx/dubbo-go-client
    pullPolicy: Always
    tag: "1.0.0"
  
  # Dubbo-go-mesh version control labels
  version:
    labels:
      dubbogoAppVersion: v1
  ```

  At this point, the build parameters and release parameters have been specified, ready to build and deploy.

#### Use templates to build and deploy Dubbo-go applications

- Build and push images

  `$ make build` (locally for amd64 machines)

  or

  `$ make buildx-publish` (Local is arm64 machine, depends on docker buildx command)

- Publish the Dubbo-go Client application to the cluster

  ```bash
  $ make deploy
  helm install dubbo-go-client ./chart/app
  NAME: dubbo-go-client
  LAST DEPLOYED: Thu Apr 7 11:49:55 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  $ helm list
  NAME NAMESPACE REVISION UPDATED STATUS CHART APP VERSION
  dubbo-go-client default 1 2022-04-07 11:49:55.517898 +0800 CST deployed dubbo-go-client-0.0.1 1.16.0
  dubbo-go-server-v1 default 1 2022-04-07 11:23:18.397658 +0800 CST deployed dubbo-go-server-0.0.1 1.16.0
  ```

  It can be seen that the deployment through helm is successful, and there are two applications, Client and Server, in the cluster.

### 3.3 Verify application

#### View resource deployment

View the deployed client and server two deployments.

```bash
$ kubectl get deployment
NAME READY UP-TO-DATE AVAILABLE AGE
dubbo-go-client-v1 1/1 1 1 22m
dubbo-go-server-v1 1/1 1 1 49m
```

Check the client call log

```bash
$ kubectl get pods | grep client | awk '{print $1}' | xargs kubectl logs
...
2022-04-07T04:13:55.777Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:56.778Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:57.779Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:58.781Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:59.782Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:14:00.784Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:14:01.785Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
```

The verification call was successful

## 4. Summary

The application template provided by dubbogo-cli can conveniently support developers to build, push, and deploy images.

In the Istio environment, the server application registers its own service information on Isito, and the client monitors the xds resource and queries the istio debug port for interface-level service discovery. Developers don't need to care about concepts such as service name, host name, and cluster name. They only need to introduce interfaces and initiate calls.