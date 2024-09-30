---
aliases:
    - /en/overview/tasks/mesh/migration/proxyless/
    - /en/overview/tasks/mesh/migration/proxyless/
description: ""
linkTitle: Other Issues?
title: Other Issues?
type: docs
weight: 3
---



Proxyless mode refers to Dubbo communicating directly with Istiod, utilizing the xDS protocol to achieve capabilities such as service discovery and service governance. This example will demonstrate how to use Proxyless mode through a simple demonstration.

[Example Address](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-xds)

## Code Architecture

This section primarily introduces the code architecture of the example used in this article. By mimicking the relevant configurations in this example, existing project code can be quickly adapted to run in Proxyless Mesh mode.

### 1. Interface Definition

To keep the example simple, a straightforward interface definition is used, returning a concatenated result of parameters.

```java
public interface GreetingService {
    String sayHello(String name);
}
```

### 2. Interface Implementation

```java
@DubboService(version = "1.0.0")
public class AnnotatedGreetingService implements GreetingService {
    @Override
    public String sayHello(String name) {
        System.out.println("greeting service received: " + name);
        return "hello, " + name + "! from host: " + NetUtils.getLocalHost();
    }
}
```

### 3. Client Subscription Method

**Since the native xDS protocol does not support obtaining the mapping from the interface to the application name, the `providedBy` parameter needs to be configured to indicate which application this service comes from.**

In the future, we will implement automatic [service mapping](/en/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/) relationship retrieval based on Dubbo Mesh's control panel, eliminating the need for independent parameter configurations.

```java
@Component("annotatedConsumer")
public class GreetingServiceConsumer {
    @DubboReference(version = "1.0.0", providedBy = "dubbo-samples-xds-provider")
    private GreetingService greetingService;
    public String doSayHello(String name) {
        return greetingService.sayHello(name);
    }
}
```

### 4. Server Configuration

The server configuration registers the Istio address as the registration center, and the protocol is xds.

We recommend setting the `protocol` to tri (fully compatible with grpc) for a better experience within the Istio environment.

To allow Kubernetes to be aware of the application's status, the `qosAcceptForeignIp` parameter needs to be configured for Kubernetes to obtain the correct application status, [aligning the lifecycle](/en/overview/mannual/java-sdk/advanced-features-and-usage/others/dubbo-kubernetes-probe/).

```properties
dubbo.application.name=dubbo-samples-xds-provider
dubbo.application.metadataServicePort=20885
dubbo.registry.address=xds://istiod.istio-system.svc:15012
dubbo.protocol.name=tri
dubbo.protocol.port=50052
dubbo.application.qosAcceptForeignIp=true
```

### 5. Client Configuration

The client configuration registers the Istio address as the registration center, and the protocol is xds.

```properties
dubbo.application.name=dubbo-samples-xds-consumer
dubbo.application.metadataServicePort=20885
dubbo.registry.address=xds://istiod.istio-system.svc:15012
dubbo.application.qosAcceptForeignIp=true
```

## Quick Start

### Step 1: Set Up Kubernetes Environment

Currently, Dubbo only supports Mesh deployment in Kubernetes environments, so you need to set up a Kubernetes environment before running this example.

Reference Documentation:

> [minikube(https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/)](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/)
> 
> [kubeadm(https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/)](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/)
> 
> [k3s(https://k3s.io/)](https://k3s.io/)

### Step 2: Set Up Istio Environment

Reference Documentation for Istio Installation:

[Istio Installation Documentation(https://istio.io/latest/docs/setup/getting-started/)](https://istio.io/latest/docs/setup/getting-started/)

Note: When installing Istio, **you must enable [first-party-jwt support](https://istio.io/latest/docs/ops/best-practices/security/#configure-third-party-service-account-tokens) (add the `--set values.global.jwtPolicy=first-party-jwt` parameter when using the `istioctl` tool)**; otherwise, client authentication will fail.

Reference for Installation Commands:

```bash
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.xx.x
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo --set values.global.jwtPolicy=first-party-jwt -y
```

### Step 3: Pull Code and Build

```bash
git clone https://github.com/apache/dubbo-samples.git
cd dubbo-samples/dubbo-samples-xds
mvn clean package -DskipTests
```

### Step 4: Build Images

Since Kubernetes adopts containerized deployment, the code needs to be packaged in an image before deployment.

```bash
cd ./dubbo-samples-xds-provider/
# dubbo-samples-xds/dubbo-samples-xds-provider/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-provider_0.0.1 .
cd ../dubbo-samples-xds-consumer/
# dubbo-samples-xds/dubbo-samples-xds-consumer/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-consumer_0.0.1 .
cd ../
```

### Step 5: Create Namespace

```bash
# Initialize namespace
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-xds/deploy/Namespace.yml

# Switch namespace
kubens dubbo-demo
```

### Step 6: Deploy Containers

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

By checking the logs of the consumer, the following logs can be observed:
```
result: hello, xDS Consumer! from host: 172.17.0.5
result: hello, xDS Consumer! from host: 172.17.0.5
result: hello, xDS Consumer! from host: 172.17.0.6
result: hello, xDS Consumer! from host: 172.17.0.6
```

## Common Issues

1. Configuring a Separate Istio Cluster `clusterId`

Typically, in Kubernetes, Istio's `clusterId` is `Kubernetes`. If you are using a self-built Istio production cluster or a cluster provided by a cloud vendor, you may need to configure the `clusterId`.

Configuration Method: Specify the `ISTIO_META_CLUSTER_ID` environment variable to the desired `clusterId`.

Reference Configuration:
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
        - name: dubbo-samples-xds-provider
          image: xxx
```

`clusterId` Retrieval Method:
> kubectl describe pod -n istio-system istiod-58b4f65df9-fq2ks
> Read the value of `CLUSTER_ID` from the environment variables.

2. Istio Authentication Failure

Since the current Dubbo version does not support Istio's `third-party-jwt` authentication, it is necessary to configure `jwtPolicy` as `first-party-jwt`.

3. providedBy

Due to the current limitations of the Dubbo version with Istio's communication model, it is not possible to obtain the application name corresponding to the interface. Therefore, the `providedBy` parameter needs to be configured to indicate which application this service comes from. In the future, we will implement automatic [service mapping](/en/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/) retrieval based on Dubbo Mesh's control panel.

4. Protocol Name

In Proxyless mode, application-level service discovery is performed via `Kubernetes Native Service`. However, due to Istio's limitations, currently, only `http` and `grpc` traffic interception and forwarding are supported. Therefore, the `Kubernetes Service` configuration needs to specify the `spec.ports.name` attribute to start with `http` or `grpc`.

Thus, we recommend using the triple protocol (fully compatible with grpc). Even if the `name` is configured to start with `grpc`, it can still function properly, but it affects the traffic routing capabilities.

Reference Configuration:
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

Since Dubbo 3's application-level service discovery metadata cannot be obtained from Istio, it must rely on service introspection. This requires the `Dubbo MetadataService` port to be unified across the entire cluster.

Reference Configuration:
```properties
dubbo.application.metadataServicePort=20885
```

In the future, we will implement automatic retrieval of [service metadata](/en/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/) based on Dubbo Mesh's control panel.

6. qosAcceptForeignIp

Due to the working principles of Kubernetes probe health checks, if the initiator of the health check request is not `localhost`, the `qosAcceptForeignIp` parameter needs to be configured to allow global access.

```properties
dubbo.application.qosAcceptForeignIp=true
```

Note: The qos port contains dangerous commands; please assess network security first. Even if qos is not open, it only affects Kubernetes's ability to retrieve Dubbo's lifecycle status.

7. No Injection Needed

In Proxyless mode, pods do not require envoy injection. Please ensure there are no labels of `istio-injection=enabled` in the namespace.

8. Plain Text Connection to Istiod

In Proxyless mode, the default connection to Istiod is via SSL, but plain text connections to Istiod are also supported.

Reference Configuration for Plain Text Connection:
```properties
dubbo.registry.secure=plaintext
```

