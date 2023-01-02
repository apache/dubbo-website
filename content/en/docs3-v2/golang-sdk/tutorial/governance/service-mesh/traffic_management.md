---
title: traffic management
type: docs
weight: 3
---

In this section, we will continue the previous task [[Deploy Dubbo-go application in Istio environment]](../deploy/).

In the previous task, we deployed a set of Dubbo-go Server and Client applications in the cluster, and verified the success of service discovery and invocation. In this section, we will create a new version of the server-side application. By configuring VirtualService and DestinationRule, routing management and traffic transfer capabilities are realized

## 1. Preparations

- The dubbo-go cli tool and dependent tools have been installed, grpc_cli (for local debugging).
- The docker, helm, and kubectl environments have been installed. (arm machines need to support docker buildx)
- Task [[Deploy Dubbo-go application in Istio environment]](../deploy/) completed

## 2. Develop multi-version Dubbo-go applications.

### 2.1 Use dubbogo-cli to create another project template

```bash
$ dubbogo-cli newApp .
```

### 2.2 Develop and deploy client Dubbo-go application v2:

#### Write business logic

- Modify the implementation method of package/service/service.go, and return the version number as v2.0.0

```go
func (s *GreeterServerImpl) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
return &api.User{Name: "Hello " + in.Name, Id: "v2.0.0"}, nil
}
```

- Modify the following configuration file, use the xds protocol as the registration center, and load the service structure named GreeterServerImpl.

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

  Modify the following fields in the Makefile, specify the address and version of the image to be built, and change the image tag to 2.0.0.

  Specify the name that needs to be installed through helm.

  ```
  IMAGE = xxx/dubbo-go-server
  TAG = 2.0.0
  HELM_INSTALL_NAME = dubbo-go-server
  ```

- Specify the application and image to be deployed:

  Modify the following fields in chart/app/Chart.yaml, and specify the current application name as `dubbo-go-server`. When we created the v1 version of the service, we already had the service of the application. The template will not be created during this deployment service.

  ```yaml
  apiVersion: v1
  name: dubbo-go-server
  description: dubbo-go-server
  ```

  Modify the following fields in chart/app/values.yaml, specify the image to be deployed as 2.0.0, and the currently developed application version dubbogoAppVersion as v2.

  The deployed image needs to be consistent with the image built above. The current application version is used for mesh traffic rule control.

  ```yaml
  image:
    repository: xxx/dubbo-go-server
    pullPolicy: Always
    tag: "2.0.0"
  
  # Dubbo-go-mesh version control labels
  version:
    labels:
      dubbogoAppVersion: v2
  ```

  At this point, the build parameters and release parameters have been specified, ready to build and deploy.

#### Use templates to build and deploy Dubbo-go applications

- Build and push images

  `$ make build` (locally for amd64 machines)

  or

  `$ make buildx-publish` (Local is arm64 machine, depends on docker buildx command)

- Publish Dubbo-go Server v2 to the cluster

  ```bash
  $ make deploy
  NAME: dubbo-go-server-v2
  LAST DEPLOYED: Thu Apr 7 12:29:28 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  $ helm list
  NAME NAMESPACE REVISION UPDATED STATUS CHART dubbo-go-client default 1 2022-04-07 11:49:55.517898 +0800 CST deployed dubbo-go-client-0.0.1 1.16.0
  dubbo-go-server-v1 default 1 2022-04-07 11:23:18.397658 +0800 CST deployed dubbo-go-server-0.0.1 1.16.0
  dubbo-go-server-v2 default 1 2022-04-07 12:29:28.497476 +0800 CST deployed dubbo-go-client-0.0.1 1.16.0
  ```

  It can be seen that the deployment through helm is successful, and there is already a Client application and two versions of Server in the cluster.

### 2.3 Verify application

#### View resource deployment

Looking at the deployed deployment, the server contains two versions.

```bash
$ kubectl get deployment
NAME READY UP-TO-DATE AVAILABLE AGE
dubbo-go-client-v1 1/1 1 1 40m
dubbo-go-server-v2 1/1 1 1 77s
dubbo-go-server-v1 1/1 1 1 67m
```

View the deployed service. Two versions of the deployment share the same service.

```bash
$ kubectl get svc
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
dubbo-go-client ClusterIP 192.168.8.176 <none> 20000/TCP 41m
dubbo-go-server ClusterIP 192.168.216.253 <none> 20000/TCP 67m
```

Check the Client application log to verify that the request is called to two versions of the application.

```bash
$ kubectl get pods | grep client | awk '{print $1}' | xargs kubectl logs
...
2022-04-07T05:06:40.384Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:41.386Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:42.388Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:43.389Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:44.390Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:45.392Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:46.393Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:47.394Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:48.396Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:49.397Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
```

So far, we have successfully developed and deployed multi-version applications.

## 3. Configure request routing

### 3.1 Configure target rules

Execute the following command to create a target rule that subdivides dubbo-go-server into two subsets. v1 and v2

```bash
$ kubectl apply -f destinationrule.yaml
```

destinationrule.yaml content:

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: dubbo-go-server
spec:
  host: dubbo-go-server
  subsets:
    - name: v1
      labels:
        dubbogoAppVersion: v1 # corresponds to the version label specified in chart/app/values.yaml in the application template
    - name: v2
      labels:
        dubbogoAppVersion: v2
```

### 3.2 Apply Virtual Service

Execute the following command to create a route that routes all traffic to the v1 application.

```bash
$ kubectl apply -f virtualservice.yaml
```

virtualservice.yaml content

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: dubbo-go-server
spec:
  hosts:
    - dubbo-go-server
  http:
  - route:
    -destination:
        host: dubbo-go-server
        subset: v1
```



### 3.3 Verify that the routing takes effect

All traffic will go to the v1 app.

```bash
$ kubectl get pods | grep client | awk '{print $1}' | xargs kubectl logs
...
2022-04-07T05:40:44.353Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:45.354Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:46.356Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:47.357Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:48.359Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:49.361Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
```



## 4. Routing based on user identity

With the above foundation of multi-version application routing, we can implement flexible traffic management through some strategies.

### 4.1 Add user identity for client application

We hope that traffic with the user: admin identifier can experience the new v2 version of the application.

Go back to the previously created dubbo-go-client project, modify the main function of cmd/app.go, and add the calling identifier: `user: admin`.

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
ctx := context. Background()
ctx = context.WithValue(ctx, constant.AttachmentKey, map[string]string{
"user":"admin", // Use the context context to add identity to the call
})

if rsp, err := client.SayHello(ctx, request); err != nil{
logger.Errorf("call server error = %s", err)
}else{
logger.Infof("call server response = %+v", rsp)
}
time. Sleep(time. Second)
}
}
```

- Build and push mirrors, overwriting previous commits. You can also upgrade the released image version.

  `$ make build` (locally for amd64 machines)

  or

  `$ make buildx-publish` (Local is arm64 machine, depends on docker buildx command)

- Remove dubbo-go-client application

  ```
  $ make remove
  helm uninstall dubbo-go-client
  release "dubbo-go-client" uninstalled
  ```

- Republish the app.

  `$ make deploy`

  After publishing, the verification call is successful because of the previous routing configuration. All traffic goes to the v1 version.

  ```bash
  $ kubectl get pods | grep client | awk '{print $1}' | xargs kubectl logs
  ...
  2022-04-07T05:40:44.353Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:45.354Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:46.356Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:47.357Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:48.359Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:49.361Z INFO cmd/app.go:29 call server response = name:"Hello laurence" id:"v1.0.0"
  ```

### 4.2 Create a route based on user identity

Execute the following command to modify/create a route that routes all traffic with the user: admin identifier in the request header to the v2 version.

```bash
$ kubectl apply -f virtualservice.yaml
```

virtualservice.yaml content

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: dubbo-go-server
spec:
  hosts:
    - dubbo-go-server
  http:
  - match:
    - headers:
        user:
          exact: admin
    route:
      -destination:
          host: dubbo-go-server
          subset: v2
  - route:
    -destination:
        host: dubbo-go-server
        subset: v1
```

### 4.3 Verify that the routing takes effect

All traffic will go to the v2 app.

```bash
$ kubectl get pods | grep client | awk '{print $1}' | xargs kubectl logs
...
2022-04-07T05:52:18.714Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:52:19.716Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:52:20.717Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:52:21.718Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:52:22.720Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:52:23.722Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:52:24.723Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v2.0.0"
```



## 5. Weight-based routing

### 5.1 Create weight-based routing

Continuing the above tasks, we execute the following commands to modify/create a route that imports 10% of the traffic into the new version of the application for grayscale testing.

```bash
$ kubectl apply -f virtualservice.yaml
```

virtualservice.yaml content

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: dubbo-go-server
spec:
  hosts:
    - dubbo-go-server
  http:
    - route:
      -destination:
          host: dubbo-go-server
          subset: v1
        weight: 90
      -destination:
          host: dubbo-go-server
          subset: v2
        weight: 10
```

### 5.2 Verify that the routing takes effect

A small amount of traffic will go to the v2 release.

```bash
$ kubectl get pods | grep client | awk '{print $1}' | xargs kubectl logs
...
2022-04-07T05:55:52.035Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:55:53.036Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:55:54.037Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:55:55.039Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:55:56.041Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:55:57.043Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:55:58.045Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:55:59.047Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:56:00.049Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:56:01.050Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:56:02.053Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:56:03.055Z INFO cmd/app.go:35 call server response = name:"Hello laurence" id:"v1.0.0"
```