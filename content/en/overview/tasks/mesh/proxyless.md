---
type: docs
title: "Istio + Proxyless"
linkTitle: "Proxyless mode"
weight: 2
description: ""
---

Proxyless mode means that Dubbo communicates directly with Istiod, and implements service discovery and service governance capabilities through the xDS protocol.
In this example, a simple example will be used to demonstrate how to use the Proxyless mode.

[Sample Address](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-xds)

## code structure

This section mainly introduces the code structure of the example used in this article. By imitating the relevant configuration in this example and modifying the existing project code, the existing project can quickly run in Proxyless Mesh mode.

### 1. Interface definition

In order to make the example simple enough, a simple interface definition is used here, and only the parameters are spliced ​​to be returned.

```java
public interface GreetingService {
     String sayHello(String name);
}
```

### 2. Interface implementation

```java
@DubboService(version = "1.0.0")
public class AnnotatedGreetingService implements GreetingService {
     @Override
     public String sayHello(String name) {
         System.out.println("greeting service received: " + name);
         return "hello, " + name + "! from host: " + NetUtils. getLocalHost();
     }
}
```

### 3. Client subscription method

**Because the native xDS protocol cannot support the mapping from interface to application name, it is necessary to configure the `providedBy` parameter to mark which application this service comes from. **

In the future, we will realize automatic [service mapping](/en/docs3-v2/java-sdk/concepts-and-architecture/service-discovery/) relationship acquisition based on the control plane of Dubbo Mesh, and there will be no need for independent configuration parameters at that time. Dubbo can be run under the Mesh system, so stay tuned.

```java
@Component("annotated Consumer")
public class GreetingServiceConsumer {
     @DubboReference(version = "1.0.0", providedBy = "dubbo-samples-xds-provider")
     private GreetingService greetingService;
     public String doSayHello(String name) {
         return greetingService.sayHello(name);
     }
}
```

### 4. Server configuration

The server configuration registration center is the address of istio, and the protocol is xds.

We recommend configuring `protocol` to be the tri protocol (fully compatible with the grpc protocol) for a better experience in the istio system.

In order to make Kubernetes aware of the state of the application, it is necessary to configure `qosAcceptForeignIp` parameter so that Kubernetes can obtain the correct application state, [alignment lifecycle](/en/docs3-v2/java-sdk/advanced-features-and-usage/ others/dubbo-kubernetes-probe/).

```properties
dubbo.application.name=dubbo-samples-xds-provider
dubbo.application.metadataServicePort=20885
dubbo.registry.address=xds://istiod.istio-system.svc:15012
dubbo.protocol.name=tri
dubbo.protocol.port=50052
dubbo.application.qosAcceptForeignIp=true
```

### 5. Client Configuration

The client configuration registration center is the address of istio, and the protocol is xds.

```properties
dubbo.application.name=dubbo-samples-xds-consumer
dubbo.application.metadataServicePort=20885
dubbo.registry.address=xds://istiod.istio-system.svc:15012
dubbo.application.qosAcceptForeignIp=true
```

## Quick start

### Step 1: Build the Kubernetes environment

Currently Dubbo only supports Mesh deployment in the Kubernetes environment, so you need to build the Kubernetes environment before running and starting this example.

Build reference documents:

> [minikube(https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/)](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/)
>
> [kubeadm(https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/)](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools /)
>
> [k3s(https://k3s.io/)](https://k3s.io/)

### Step 2: Build the Istio environment

Build the Istio environment reference document:

[Istio Installation Documentation (https://istio.io/latest/docs/setup/getting-started/)](https://istio.io/latest/docs/setup/getting-started/)

Note: When installing Istio, you need to enable [first-party-jwt support](https://istio.io/latest/docs/ops/best-practices/security/#configure-third-party-service-account- tokens) (add the parameter `--set values.global.jwtPolicy=first-party-jwt` when using the `istioctl` tool to install)**, otherwise it will cause the problem of client authentication failure.

Attached installation command reference:

```bash
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.xx.x
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo --set values.global.jwtPolicy=first-party-jwt -y
```

### Step 3: Pull the code and build

```bash
git clone https://github.com/apache/dubbo-samples.git
cd dubbo-samples/dubbo-samples-xds
mvn clean package -DskipTests
```

### Step 4: Build the image

Since Kubernetes adopts containerized deployment, the code needs to be packaged in a mirror before deployment.

```bash
cd ./dubbo-samples-xds-provider/
# dubbo-samples-xds/dubbo-samples-xds-provider/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-provider_0.0.1 .
cd ../dubbo-samples-xds-consumer/
# dubbo-samples-xds/dubbo-samples-xds-consumer/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-consumer_0.0.1 .
cd ../
```

### Step 5: Create namespace

```bash
# Initialize the namespace
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-xds/deploy/Namespace.yml

# switch namespace
kubens dubbo-demo
```

### Step 6: Deploy the container

```bash
cd ./dubbo-samples-xds-provider/src/main/resources/k8s
# dubbo-samples-xds/dubbo-samples-xds-provider/src/main/resources/k8s/Deployment.yml
# dubbo-samples-xds/dubbo-samples-xds-provider/src/main/resources/k8s/Service.yml
kubectl apply -f Deployment.yml
kubectl apply -f Service.yml
cd ../../../../../dubbo-samples-xds-consumer/src/main/resources/k8s
# dubbo-samples-xds/dubbo-samples-xds-consumer/src/main/resources/k8s/Deployment.yml
kubectl apply -f Deployment.yml
cd ../../../../../
```

Looking at the log of the consumer, you can observe the following log:
```
result: hello, xDS Consumer! from host: 172.17.0.5
result: hello, xDS Consumer! from host: 172.17.0.5
result: hello, xDS Consumer! from host: 172.17.0.6
result: hello, xDS Consumer! from host: 172.17.0.6
```

## common problem

1. Configure a separate Istio cluster `clusterId`

Usually the `clusterId` of Istio under the Kubernetes system is `Kubernetes`, if you are using a self-built istio production cluster or a cluster provided by a cloud vendor, you may need to configure `clusterId`.

Configuration method: Specify the `ISTIO_META_CLUSTER_ID` environment variable as the desired `clusterId`.

Reference configuration:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
   name: dubbo-samples-xds-consumer
spec:
   selector:
     matchLabels:
       demo: consumer
   replicas: 2
   template:
     metadata:
       labels:
         demo: consumer
     spec:
       containers:
         - env:
             - name: ISTIO_META_CLUSTER_ID
               value: Kubernetes
           name: dubbo-samples-xds-provider
           image: xxx
```

How to get `clusterId`:
> kubectl describe pod -n istio-system istiod-58b4f65df9-fq2ks
> Read the value of `CLUSTER_ID` in the environment variable

2. Istio authentication failed

Since the current Dubbo version does not support istio's `third-party-jwt` authentication, it is necessary to configure `jwtPolicy` to `first-party-jwt`.

3. providedBy

Since the current Dubbo version is limited by the communication model of istio and cannot obtain the application name corresponding to the interface, it is necessary to configure the `providedBy` parameter to mark which application the service comes from.
In the future, we will realize automatic [service mapping](/en/docs3-v2/java-sdk/concepts-and-architecture/service-discovery/) relationship acquisition based on the control plane of Dubbo Mesh, and there will be no need for independent configuration parameters at that time. Dubbo can be run under the Mesh system, so stay tuned.

4. protocol name

In Proxyless mode, application-level service discovery uses `Kubernetes Native Service` for application service discovery, but due to the limitation of istio, it currently only supports traffic interception and forwarding of `http` protocol and `grpc` protocol, so `Kubernetes Service` is configured in When you need to specify the `spec.ports.name` property to start with `http` or `grpc`.
Therefore we recommend using the triple protocol (fully compatible with the grpc protocol). Here, even if `name` is configured to start with `grpc`, it is actually a `dubbo` protocol that can also perform normal service discovery, but it affects the function of traffic routing.

Reference configuration:
```yaml
apiVersion: v1
kind: Service
metadata:
   name: dubbo-samples-xds-provider
spec:
   clusterIP: None
   selector:
     demo: provider
   ports:
     - name: grpc-tri
       protocol: TCP
       port: 50052
       targetPort: 50052
```

5. metadataServicePort

Since the metadata discovered by Dubbo 3 application-level services cannot be obtained from istio, it is necessary to use the service introspection mode. This requires that the port of `Dubbo MetadataService` is unified in the whole cluster.

Reference configuration:
```properties
dubbo.application.metadataServicePort=20885
```

In the future, we will realize automatic acquisition of [service metadata](/en/docs3-v2/java-sdk/concepts-and-architecture/service-discovery/) based on the control plane of Dubbo Mesh, and no independent configuration parameters will be required at that time. Dubbo can be run under the Mesh system, so stay tuned.

6. qosAcceptForeignIp

Due to the limitations of the working principle of the Kubernetes probe detection mechanism, the originator of the detection request is not `localhost`, so you need to configure the `qosAcceptForeignIp` parameter to enable global access.

```properties
dubbo.application.qosAcceptForeignIp=true
```

Note: There are dangerous commands on the qos port, please evaluate the security of the network first. Even if the qos is not open, it only affects the inability of Kubernetes to obtain the life cycle status of Dubbo.

7. Do not need to enable injection

In Proxyless mode, the pod does not need to enable envoy injection. Please make sure that there is no `istio-injection=enabled` label in the namespace.

8. Plain text connection istiod

In Proxyless mode, connect to istiod through ssl by default, and also support connecting to istiod through clear text.

Plain text connection reference configuration:
```properties
dubbo.registry.secure=plaintext
```