---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/traffic_management/
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/traffic_management/
description: Traffic Management
title: Traffic Management
type: docs
weight: 3
---






In this section, we will continue from the previous task [【Deploying Dubbo-go Applications in Istio Environment】](../deploy/).

In the previous task, we deployed a set of Dubbo-go Server and Client applications in the cluster and verified that service discovery and invocation were successful. In this section, we will create a new version of the server application. By configuring VirtualService and DestinationRule, we will achieve routing management and traffic shifting capabilities.

## 1. Preparation

- The dubbo-go CLI tool and dependencies have been installed, as well as grpc_cli (for local debugging if needed).
- Docker, Helm, and kubectl environments have been installed. (Arm machines need to support docker buildx)
- The task [【Deploying Dubbo-go Applications in Istio Environment】](../deploy/) has been completed.

## 2. Develop Multi-Version Dubbo-go Applications.

### 2.1 Create Another Project Template Using dubbogo-cli

```bash
$ dubbogo-cli newApp . 
```

### 2.2 Develop and Deploy Client Dubbo-go Application v2:

#### Write Business Logic

- Modify the implementation method of package/service/service.go to return version number v2.0.0

```go
func (s *GreeterServerImpl) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
	return &api.User{Name: "Hello " + in.Name, Id: "v2.0.0"}, nil
}
```

- Modify the following configuration file to use the xds protocol as the registration center, loading the service structure named GreeterServerImpl.

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

  So far, the application development is complete.

#### Configure Build and Deployment Parameters

- Specify the image to be built:

  Modify the Makefile as follows to specify the image address and version to be built. We change the image tag to 2.0.0.

  Specify the name for Helm installation.

  ```
  IMAGE = xxx/dubbo-go-server
  TAG = 2.0.0
  HELM_INSTALL_NAME = dubbo-go-server
  ```

- Specify the application and image to be deployed:

  Modify chart/app/Chart.yaml as follows to specify the current application name as `dubbo-go-server`. When we created the v1 version service, this application's service already exists, so the template will not create the service during this deployment.

  ```yaml
  apiVersion: v1
  name: dubbo-go-server
  description: dubbo-go-server
  ```

  Modify chart/app/values.yaml as follows to specify the image to be deployed as 2.0.0 and the current application version dubbogoAppVersion as v2.

  The deployed image must match the image built above. The current application version is used for mesh traffic rule control.

  ```yaml
  image:
    repository:  xxx/dubbo-go-server
    pullPolicy: Always
    tag: "2.0.0"
  
  # Dubbo-go-mesh version control labels
  version:
    labels:
      dubbogoAppVersion: v2
  ```

  With this, the build and release parameters are specified, and we can proceed to build and deploy.

#### Build and Deploy Dubbo-go Application Using Template

- Build and push the image

  `$ make build  `   (for local amd64 machines) 

  or  

  `$ make buildx-publish`     (for local arm64 machines, relies on docker buildx command)

- Release Dubbo-go Server v2 to the cluster

  ```bash
  $ make deploy
  NAME: dubbo-go-server-v2
  LAST DEPLOYED: Thu Apr  7 12:29:28 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  $ helm list
  NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   dubbo-go-client         default         1               2022-04-07 11:49:55.517898 +0800 CST    deployed        dubbo-go-client-0.0.1   1.16.0     
  dubbo-go-server-v1      default         1               2022-04-07 11:23:18.397658 +0800 CST    deployed        dubbo-go-server-0.0.1   1.16.0     
  dubbo-go-server-v2      default         1               2022-04-07 12:29:28.497476 +0800 CST    deployed        dubbo-go-client-0.0.1   1.16.0
  ```

  It can be seen that the deployment via Helm was successful, and there is currently one Client application and two versions of the Server in the cluster.

### 2.3 Verify Application

#### Check Resource Deployment Status

Check the deployed deployment; the server includes two versions.

```bash
$  kubectl get deployment 
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
dubbo-go-client-v1   1/1     1            1           40m
dubbo-go-server-v2   1/1     1            1           77s
dubbo-go-server-v1   1/1     1            1           67m
```

Check the deployed service. Both versions of the deployment share the same service.

```bash
$ kubectl get svc        
NAME              TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)     AGE
dubbo-go-client   ClusterIP   192.168.8.176     <none>        20000/TCP   41m
dubbo-go-server   ClusterIP   192.168.216.253   <none>        20000/TCP   67m
```

Check Client application logs to verify that requests were successfully called to both versions of the application.

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T05:06:40.384Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:41.386Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:42.388Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:43.389Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:44.390Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:45.392Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:46.393Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:47.394Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:48.396Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:49.397Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
```

Thus, we have successfully developed and deployed multi-version applications.

## 3. Configure Request Routing

### 3.1 Configure Destination Rule

Execute the following command to create a destination rule that subdivides dubbo-go-server into two subsets, v1 and v2.

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
        dubbogoAppVersion: v1 # Corresponding to version label specified in chart/app/values.yaml in application template
    - name: v2
      labels:
        dubbogoAppVersion: v2
```

### 3.2 Apply Virtual Service

Execute the following command to create a route that routes all traffic to the v1 version application.

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
    - destination:
        host: dubbo-go-server
        subset: v1
```

### 3.3 Verify Route Effectiveness

All traffic will be directed to the v1 version application.

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T05:40:44.353Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:45.354Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:46.356Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:47.357Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:48.359Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:49.361Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
```

## 4. User Identity-Based Routing

With the above multi-version application route foundation, we can manage traffic flexibly through some strategies.

### 4.1 Add User Identity to Client Application

We want traffic tagged with user: admin to experience the new version v2 application.

Returning to the previously created dubbo-go-client project, modify the main function in cmd/app.go to add the invocation identifier: `user: admin`.

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
		ctx := context.Background()
		ctx = context.WithValue(ctx, constant.AttachmentKey, map[string]string{ 
			"user":"admin", // Use context to add identifiers for invocation
		})

		if rsp, err := client.SayHello(ctx, request); err != nil{
			logger.Errorf("call server error = %s", err)
		}else{
			logger.Infof("call server response = %+v", rsp)
		}
		time.Sleep(time.Second)
	}
}
```

- Build and push the image, overriding the previous commit. You may also upgrade the released image version.

  `$ make build  `   (for local amd64 machines) 

  or  

  `$ make buildx-publish`     (for local arm64 machines, relies on docker buildx command)

- Remove the dubbo-go-client application

  ```
  $ make remove
  helm uninstall dubbo-go-client
  release "dubbo-go-client" uninstalled
  ```

- Reissue the application.

  `$ make deploy`

  After the release, verify that the invocation was successful. Due to the previous routing configuration, all traffic is directed to the v1 version.

  ```bash
  $ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
  ...
  2022-04-07T05:40:44.353Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:45.354Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:46.356Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:47.357Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:48.359Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:49.361Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  ```

### 4.2 Create User Identity-Based Routing

Execute the following command to modify/create the routing that routes all traffic with the user: admin identifier to the v2 version.

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
      - destination:
          host: dubbo-go-server
          subset: v2
  - route:
    - destination:
        host: dubbo-go-server
        subset: v1
```

### 4.3 Verify Route Effectiveness

All traffic will be directed to the v2 version application.

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T05:52:18.714Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:19.716Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:20.717Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:21.718Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:22.720Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:23.722Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:24.723Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
```



## 5. Weight-Based Routing

### 5.1 Create Weight-Based Routing

Continuing from the previous task, we execute the following command to modify/create the routing that directs 10% of the traffic to the new version application for gray testing.

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
      - destination:
          host: dubbo-go-server
          subset: v1
        weight: 90
      - destination:
          host: dubbo-go-server
          subset: v2
        weight: 10
```

### 5.2 Verify Route Effectiveness

A small amount of traffic will be directed to the v2 version.

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T05:55:52.035Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:53.036Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:54.037Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:55.039Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:56.041Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:57.043Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:58.045Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:59.047Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:56:00.049Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:56:01.050Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:56:02.053Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:56:03.055Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
```

