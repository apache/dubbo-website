---
type: docs
title: "Dubbo proxy mesh using Envoy & Istio"
linkTitle: "Sidecar mode"
weight: 1
description: "This example demonstrates how to use Istio+Envoy's Service Mesh deployment mode to develop a Dubbo3 service. The Dubbo3 service uses Triple as the communication protocol. The communication process is intercepted by the Envoy data plane, and Dubbo is managed using the standard Istio traffic management capability."
---

By following the steps below, you can easily learn how to develop a Dubbo service that conforms to the Service Mesh architecture, deploy it to Kubernetes, and access Istio's traffic management system. Check here [Complete sample source code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-mesh-k8s)

## 1 Overall Objective

* Deploy Dubbo application to Kubernetes
* Istio automatically injects Envoy and implements traffic interception
* Traffic governance based on Istio rules

## 2 Basic process and working principle

This example demonstrates how to deploy an application developed by Dubbo under the Istio system to realize Envoy's automatic proxying of Dubbo services. The overall architecture of the example is shown in the figure below.

![thinsdk](/imgs/v3/mesh/thinsdk-envoy.png)

The steps you will need to complete the example are as follows:

1. Create a Dubbo application ( [dubbo-samples-mesh-k8s](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-mesh-k8s) )
2. Build the container image and push it to the mirror warehouse ([the official image of this example](https://hub.docker.com/r/apache/dubbo-demo) )
3. Deploy Dubbo Provider and Dubbo Consumer to Kubernetes respectively and verify that Envoy proxy injection is successful
4. Verify Envoy discovers the service address, normally intercepts RPC traffic and implements load balancing
5. Proportional traffic forwarding based on Istio VirtualService

## 3 detailed steps

### 3.1 Environmental requirements

Please ensure that the following environment is installed locally to provide container runtime, Kubernetes cluster and access tools

* [Docker](https://www.docker.com/get-started/)
* [Minikube](https://minikube.sigs.k8s.io/docs/start/)
* [Kubectl](https://kubernetes.io/docs/tasks/tools/)
* [Istio](https://istio.io/latest/docs/setup/getting-started/)
* [Kubens(optional)](https://github.com/ahmetb/kubectx)

Start the local Kubernetes cluster with the following command

```shell
minikube start
```

Check that the cluster is up and running with kubectl, and that kubectl is bound to the default local cluster

```shell
kubectl cluster-info
```

### 3.2 Create an independent namespace and enable automatic injection

Use the following command to create an independent Namespace `dubbo-demo` for the sample project, and enable sidecar automatic injection at the same time.

```shell
# Initialize the namespace
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/Namespace.yml

# switch namespace
kubens dubbo-demo

# dubbo-demo enable automatic injection
kubectl label namespace dubbo-demo istio-injection=enabled

```

### 3.3 Deploy to Kubernetes

#### 3.3.1 Deploy Provider

```shell
# Deploy the Service
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/provider/Service.yml

# Deploy Deployment
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/provider/Deployment.yml
```

The above command creates a Service named `dubbo-samples-mesh-provider`, note that the service name here is the same as the dubbo application name in the project.

Then the Deployment deploys a 2-copy pod instance, and the Provider is started.

You can check the startup log with the following command.

```shell
# View pod list
kubectl get pods -l app=dubbo-samples-mesh-provider

# View pod deployment logs
kubectl logs your-pod-id
```

At this time, there should be a dubbo provider container instance and an Envoy Sidecar container instance in the pod.

#### 3.3.2 Deploy Consumer

```shell
# Deploy the Service
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/consumer/Service.yml

# Deploy Deployment
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/consumer/Deployment.yml
```

Deploying consumer and provider is the same, here also keep K8S Service and Dubbo consumer application name (in [dubbo.properties](https://github.com/apache/dubbo-samples/blob/master/3-extensions/registry //dubbo-samples-mesh-k8s/dubbo-samples-mesh-consumer/src/main/resources/spring/dubbo-consumer.properties) consistent: `dubbo.application.name=dubbo-samples-mesh- consumer`.

> The provider service (application) name of consumption is also specified in the Dubbo Consumer service statement `@DubboReference(version = "1.0.0", providedBy = "dubbo-samples-mesh-provider", lazy = true)`

### 3.4 Check the normal communication between Provider and Consumer

After performing step 3.3, check the startup log to see that the consumer has completed consumption of the provider service.

```shell
# View pod list
kubectl get pods -l app=dubbo-samples-mesh-consumer

# View pod deployment logs
kubectl logs your-pod-id

# View pod isitio-proxy logs
kubectl logs your-pod-id -c istio-proxy
```

You can see that the consumer pod log output is as follows (the Triple protocol is load balanced by the Envoy proxy):

```bash
===================== dubbo invoke 0 end ======================
[10/08/22 07:07:36:036 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18. 96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 1 end ======================
[10/08/22 07:07:42:042 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18. 96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

```

The consumer istio-proxy log output is as follows:

```shell
[2022-07-15T05:35:14.418Z] "POST /org.apache.dubbo.samples.Greeter/greet HTTP/2" 200
- via_upstream - "-" 19 160 2 1 "-" "-" "6b8a5a03-5783-98bf-9bee-f93ea6e3d68e"
"dubbo-samples-mesh-provider:50052" "172.17.0.4:50052"
outbound|50052||dubbo-samples-mesh-provider.dubbo-demo.svc.cluster.local 172.17.0.7:52768 10.101.172.129:50052 172.17.0.7:38488 - default
```

You can see the provider pod log output as follows:

```shell
[10/08/22 07:08:47:047 UTC] tri-protocol-50052-thread-8 INFO impl.GreeterImpl: Server test dubbo tri mesh received greet request name: "service mesh"

[10/08/22 07:08:57:057 UTC] tri-protocol-50052-thread-9 INFO impl.GreeterImpl: Server test dubbo tri mesh received greet request name: "service mesh"
```

The log output of provider istio-proxy is as follows:

```shell
[2022-07-15T05:25:34.061Z] "POST /org.apache.dubbo.samples.Greeter/greet HTTP/2" 200
- via_upstream - "-" 19 162 1 1 "-" "-" "201e6976-da10-96e1-8da7-ad032e58db47"
"dubbo-samples-mesh-provider:50052" "172.17.0.10:50052"
  inbound|50052|| 127.0.0.6:47013 172.17.0.10:50052 172.17.0.7:60244
   outbound_.50052_._.dubbo-samples-mesh-provider.dubbo-demo.svc.cluster.local default
```

### 3.5 Traffic Governance - VirtualService implements proportional traffic forwarding

Deploy the v2 version of the demo provider
```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/provider/Deployment-v2.yml
```

Set VirtualService and DestinationRule, and observe that traffic is directed to provider v1 and provider v2 respectively in a ratio of 4:1.
```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/3-extensions/registry/dubbo-samples-mesh-k8s/deploy/traffic/virtual-service.yml
```

From the log output of the consumer side, observe the traffic distribution effect as shown in the figure below:

```java
===================== dubbo invoke 100 end ======================
[10/08/22 07:15:58:058 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18. 96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 101 end ======================
[10/08/22 07:16:03:003 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18. 96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 102 end ======================
[10/08/22 07:16:08:008 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18. 96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 103 end ======================
[10/08/22 07:16:13:013 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v2: 172.18.96.6:50052, client: 172.18. 96.6, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 104 end ======================
[10/08/22 07:16:18:018 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18. 96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 105 end ======================
[10/08/22 07:16:24:024 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18. 96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 106 end ======================
[10/08/22 07:16:29:029 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18. 96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 107 end ======================
[10/08/22 07:16:34:034 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18. 96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 108 end ======================
[10/08/22 07:16:39:039 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.22:50052, client: 172.18. 96.22, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"

===================== dubbo invoke 109 end ======================
[10/08/22 07:16:44:044 UTC] main INFO action.GreetingServiceConsumer: consumer Unary reply <-message: "hello, service mesh, response from provider-v1: 172.18.96.18:50052, client: 172.18. 96.18, local: dubbo-samples-mesh-provider, remote: null, isProviderSide: true"


```

### 3.6 View dashboard

See [How to start the dashboard](https://istio.io/latest/docs/setup/getting-started/#dashboard) on the Istio official website.

## 4 Modified Example

> 1. Modifying the example is not a necessary step, this section is for readers who want to adjust the code and see the deployment effect.
> 2. Note that the project source code storage path must be in English, otherwise protobuf compilation will fail.

Modify Dubbo Provider configuration `dubbo-provider.properties`

```properties
# provider
dubbo.application.name=dubbo-samples-mesh-provider
dubbo.application.metadataServicePort=20885
dubbo.registry.address=N/A
dubbo.protocol.name=tri
dubbo.protocol.port=50052
dubbo.application.qosEnable=true
# In order for the Kubernetes cluster to access the probe normally, it is necessary to enable QOS to allow remote access, which may bring security Risk, please carefully evaluate before opening
dubbo.application.qosAcceptForeignIp=true
```

Modify Dubbo Consumer configuration `dubbo-consumer.properties`

```properties
# consumer
dubbo.application.name=dubbo-samples-mesh-consumer
dubbo.application.metadataServicePort=20885
dubbo.registry.address=N/A
dubbo.protocol.name=tri
dubbo.protocol.port=20880
dubbo.consumer.timeout=30000
dubbo.application.qosEnable=true
# In order for the Kubernetes cluster to access the probe normally, it is necessary to enable QOS to allow remote access. This operation may bring security risks. Please evaluate it carefully before opening it
dubbo.application.qosAcceptForeignIp=true
# Flag to enable mesh sidecar proxy mode
dubbo.consumer.meshEnable=true
```

After completing the code modification, package the image through the Dockerfile provided by the project

```shell
# Package and push the image
mvn compile jib:build
```

> The Jib plugin will automatically package and publish the image. Note that for local development, you need to change the docker registry organization apache/dubbo-demo in the jib plug-in configuration to an organization with your own authority (including dubboteam in other kubernetes manifests to ensure that kubernetes deploys your own customized image) , if you encounter jib plug-in authentication problems, please refer to [corresponding link](https://github.com/GoogleContainerTools/jib/blob/master/docs/faq.md#what-should-i-do-when-the- registry-responds-with-unauthorized) to configure docker registry authentication information.
> You can specify `mvn compile jib:build -Djib.to.auth.username=x -Djib.to.auth.password=x -Djib.from.auth.username=x -Djib.from.auth directly on the command line .username=x`, or use docker-credential-helper.

## 5 Common commands

```shell
# dump current Envoy configs
kubectl exec -it ${your pod id} -c istio-proxy curl http://127.0.0.1:15000/config_dump > config_dump

# Enter the istio-proxy container
kubectl exec -it ${your pod id} -c istio-proxy -- /bin/bash

# View container logs
kubectl logs ${your pod id} -n ${your namespace}

kubectl logs ${your pod id} -n ${your namespace} -c istio-proxy

# Enable automatic sidecar injection
kubectl label namespace ${your namespace} istio-injection=enabled --overwrite

# Turn off automatic sidecar injection
kubectl label namespace ${your namespace} istio-injection=disabled --overwrite
```

## 6 Notes

1. In the example, both the producer and the consumer belong to the same namespace; if you need to call a provider of a different namespace, you need to configure it as follows (**dubbo version>=3.1.2**):

Annotation method:
```java
  @DubboReference(providedBy = "istio-demo-dubbo-producer", providerPort = 20885, providerNamespace = "istio-demo")

```
xml way
```xml
<dubbo:reference id="demoService" check="true"
                   interface="org.apache.dubbo.samples.basic.api.DemoService"
                   provider-port="20885"
                   provided-by="istio-dubbo-producer"
                   provider-namespace="istio-demo"/>
```