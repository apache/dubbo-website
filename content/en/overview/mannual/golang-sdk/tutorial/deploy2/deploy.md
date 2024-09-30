---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/deploy/
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/deploy/
description: Deploying Dubbo-go application in Istio environment
title: Deploying Dubbo-go application in Istio environment
type: docs
weight: 2
---

In this chapter, we will quickly create a set of Dubbo-go Server and Client applications using the application template and deploy them in an Istio cluster; observe, debug, and verify service discovery and successful calls.

## 1. Preparation

- The dubbo-go CLI tool and dependency tools are installed, grpc_cli (for local debugging if needed).
- The docker, helm, and kubectl environments are installed. (Arm machines must support docker buildx)
- The task [Deployment of Istio Environment](../istio/) is complete.

## 2. Developing the Server-side Dubbo-go Application

### 2.1 Create Project Template with dubbogo-cli

```plain
$ mkdir mesh-app-server
$ cd mesh-app-server
$ dubbogo-cli newApp . 
$  tree .
.
├── Makefile
├── api
│   └── api.proto
├── build
│   └── Dockerfile
├── chart
│   ├── app
│   │   ├── Chart.yaml
│   │   ├── templates
│   │   │   ├── _helpers.tpl
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── serviceaccount.yaml
│   │   └── values.yaml
│   └── nacos_env
│       ├── Chart.yaml
│       ├── templates
│       │   ├── _helpers.tpl
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       └── values.yaml
├── cmd
│   └── app.go
├── conf
│   └── dubbogo.yaml
├── go.mod
├── go.sum
└── pkg
    └── service
        └── service.go
```

The generated project includes several directories:

- api: stores interface files: proto files and generated pb.go files
- build: stores build-related files
- chart: stores chart repository for release and base environment chart repository: nacos, mesh (in development)
- cmd: program entry point
- conf: framework configuration
- pkg/service: RPC service implementation
- Makefile:

- - Image, Helm install name:

- - ```
    IMAGE = $(your_repo)/$(namespace)/$(image_name)
    TAG = 1.0.0
    HELM_INSTALL_NAME = dubbo-go-app 
    ```

- - Provides scripts, e.g.:

- - - make build # Package the image and push
    - make buildx-publish # Packages amd64 image for arm architecture locally and pushes, depends on buildx
    - make deploy  # Deploys the application via helm
    - make remove  # Removes the already deployed helm application
    - make proto-gen # Generates pb.go files under api
    - ...

### 2.2 Develop and Deploy the Dubbo-go Application:

#### Developing the Application

- Compile the interface

  Developers need to modify the proto file, in this task, we can use the default interface directly.

  ```bash
  $ make proto-gen
  protoc --go_out=./api --go-triple_out=./api ./api/api.proto
  ```

- Pull dependencies

  ```bash
  $ go get dubbo.apache.org/dubbo-go/v3@3.0
  $ make tidy
  go mod tidy
  ```

- Write business logic

  Modify pkg/service/service.go implementation function, return version "v1.0.0" in the string.

  ```go
  func (s *GreeterServerImpl) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
  	return &api.User{Name: "Hello " + in.Name, Id: "v1.0.0"}, nil
  }
  ```

- Modify the configuration as follows to use xds protocol as the registry

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

  Thus, the application development is complete.

#### Configure Build and Deploy Parameters

- Specify the image to be built:

  Modify the Makefile as follows to specify the image address and version to be built.

  Specify the name for installation via helm.

  ```
  IMAGE = xxx/dubbo-go-server
  TAG = 1.0.0
  HELM_INSTALL_NAME = dubbo-go-server-v1
  ```

- Specify the application and image to be deployed:

  Modify chart/app/Chart.yaml as follows to specify the current application name as `dubbo-go-server`, during deployment a service named dubbo-go-server will be created, associating all versions of the current application.

  ```yaml
  apiVersion: v1
  name: dubbo-go-server
  description: dubbo-go-server
  ```

  Modify chart/app/values.yaml as follows to specify the image to be deployed and the current application version dubbogoAppVersion as v1.

  The deployed image must match the built image above. The current application version is used for mesh traffic rule control.

  ```yaml
  image:
    repository:  xxx/dubbo-go-server
    pullPolicy: Always
    tag: "1.0.0"
  
  # Dubbo-go-mesh version control labels
  version:
    labels:
      dubbogoAppVersion: v1
  ```

  Thus, the build and release parameters are ready for building and deploying.

#### Use the Template to Build and Deploy the Dubbo-go Application

- Build and Push the Image

  `$ make build  `   (Local is amd64 machine) 

  or  

  `$ make buildx-publish`     (Local is arm64 machine, relies on docker buildx command)

- Deploy the Dubbo-go Application to the Cluster

  ```bash
  $ make deploy 
  helm install dubbo-go-server-v1 ./chart/app
  NAME: dubbo-go-server-v1
  LAST DEPLOYED: Thu Apr  7 11:19:42 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  $ helm list
  NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
  dubbo-go-server-v1      default         1               2022-04-07 11:19:42.350553 +0800 CST    deployed        dubbo-go-server-0.0.1   1.16.0  
  ```

  The deployment via helm was successful.

### 2.3 Verify the Application

#### Check Resource Deployment Status

Check the deployed deployment with version v1.

```bash
$ kubectl get deployment 
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
dubbo-go-server-v1   1/1     1            1           26s
```

Check the deployed service.

```bash
$ kubectl get svc 
NAME              TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)     AGE
dubbo-go-server   ClusterIP   192.168.216.253   <none>        20000/TCP   70s
```

#### (Optional) Local Debugging of the Deployed Dubbo-go Application

Use kubectl port-forward to forward Dubbo-go application to local

```bash
$ kubectl port-forward svc/dubbo-go-server 20000
Forwarding from 127.0.0.1:20000 -> 20000
Forwarding from [::1]:20000 -> 20000
```

Use grpc_cli to debug applications inside the cluster, refer to the task [Debugging Dubbo-go Application using grpc_cli](/en/overview/mannual/golang-sdk/tutorial/debugging/grpc_cli/)

```bash
$ grpc_cli ls localhost:20000 -l
filename: api/api.proto
package: api;
service Greeter {
  rpc SayHello(api.HelloRequest) returns (api.User) {}
  rpc SayHelloStream(stream api.HelloRequest) returns (stream api.User) {}
}
```

Use grpc_cli to initiate a call and test the interface

```bash
$ grpc_cli call localhost:20000 SayHello "name: 'laurence'"
connecting to localhost:20000
name: "Hello laurence"
id: "v1.0.0"
Received trailing metadata from server:
accept-encoding : identity,gzip
grpc-accept-encoding : identity,deflate,gzip
Rpc succeeded with OK status
```

Thus, we have successfully developed an application and deployed it in the Istio cluster.

## 3. Develop the Client-side Dubbo-go Application

### 3.1 Create Another Project Template Using dubbogo-cli

```bash
$ dubbogo-cli newApp . 
```

### 3.2 Develop and Deploy the Client-side Dubbo-go Application:

#### Write Business Logic

- Modify the main method in cmd/app.go to make a call to the downstream interface once per second.

```go
func main() {
	client := &api.GreeterClientImpl{}
	config.SetConsumerService(client)
	if err := config.Load(); err != nil {
		panic(err)
	}
	request := &api.HelloRequest{
		Name: "laurence",
	}

	for{
		if rsp, err := client.SayHello(context.Background(), request); err != nil{
			logger.Errorf("call server error = %s", err)
		}else{
			logger.Infof("call server response = %+v", rsp)
		}
		time.Sleep(time.Second)
	}
}
```

- Modify the configuration file to use xds protocol as the registry, loading client service named GreeterClientImpl.

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

  Thus, the application development is complete.

#### Configure Build and Deploy Parameters

- Specify the image to be built:

  Modify the Makefile as follows to specify the image address and version to be built.

  Specify the name for installation via helm.

  ```
  IMAGE = xxx/dubbo-go-client
  TAG = 1.0.0
  HELM_INSTALL_NAME = dubbo-go-client
  ```

- Specify the application and image to be deployed:

  Modify chart/app/Chart.yaml as follows to specify the current application name as `dubbo-go-client`, during deployment a service named dubbo-go-client will be created, associating all versions of the current application. For an application that is only a client, a service can be omitted, it can be modified by developers in the template; we will create it by default in this tutorial.

  ```yaml
  apiVersion: v1
  name: dubbo-go-client
  description: dubbo-go-client
  ```

  Modify chart/app/values.yaml as follows to specify the image to be deployed and the current application version dubbogoAppVersion as v1.

  The deployed image must match the built image above. The current application version is used for mesh traffic rule control.

  ```yaml
  image:
    repository:  xxx/dubbo-go-client
    pullPolicy: Always
    tag: "1.0.0"
  
  # Dubbo-go-mesh version control labels
  version:
    labels:
      dubbogoAppVersion: v1
  ```

  Thus, the build and release parameters are ready for building and deploying.

#### Use the Template to Build and Deploy the Dubbo-go Application

- Build and Push the Image

  `$ make build  `   (Local is amd64 machine) 

  or  

  `$ make buildx-publish`     (Local is arm64 machine, relies on docker buildx command)

- Deploy the Dubbo-go Client Application to the Cluster

  ```bash
  $ make deploy 
  helm install dubbo-go-client ./chart/app
  NAME: dubbo-go-client
  LAST DEPLOYED: Thu Apr  7 11:49:55 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  $ helm list
  NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
  dubbo-go-client         default         1               2022-04-07 11:49:55.517898 +0800 CST    deployed        dubbo-go-client-0.0.1   1.16.0     
  dubbo-go-server-v1      default         1               2022-04-07 11:23:18.397658 +0800 CST    deployed        dubbo-go-server-0.0.1   1.16.0
  ```

  It can be seen that the deployment via helm was successful, and both Client and Server applications now exist in the cluster.

### 3.3 Verify the Application

#### Check Resource Deployment Status

Check the deployed client and server deployments.

```bash
$ kubectl get deployment       
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
dubbo-go-client-v1   1/1     1            1           22m
dubbo-go-server-v1   1/1     1            1           49m
```

Check client call logs

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T04:13:55.777Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:56.778Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:57.779Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:58.781Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:59.782Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:14:00.784Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:14:01.785Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
```

Verify the call was successful.

## 4. Summary

The application templates provided by dubbogo-cli conveniently support developers in image building, pushing, and deployment.

In the Istio environment, server applications register their service information on Istio, while clients listen to xds resources, querying the Istio debug port for interface-level service discovery. Developers do not need to worry about concepts like service names, hostnames, and cluster names; they only need to import interfaces and initiate calls.

