---
aliases:
    - /en/overview/tasks/mesh/migration/deploy-on-k8s/
    - /en/overview/tasks/mesh/migration/deploy-on-k8s/
description: This example demonstrates the deployment of a Dubbo application to Kubernetes using API-SERVER as the registry center and reusing Kubernetes Native Service. The limitation of this example is that each Dubbo application must be granted permissions to access specific resources on API-SERVER. Direct access and monitoring of API-SERVER is not an issue for small to medium clusters, but it may challenge the stability of API-SERVER in larger clusters. Additionally, consider deploying Dubbo applications to Kubernetes with a Dubbo control plane, which does not require granting access to API-SERVER and alleviates concerns about stability caused by excessive data connections.
linkTitle: Protocol Recognition
title: Protocol Recognition
type: docs
weight: 2
---



You can easily deploy Dubbo services to a Kubernetes cluster by following the steps below, with the [full code example available here](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-kubernetes).

## 1 Overall Goals

* Deploy Dubbo applications to Kubernetes
* Implement service discovery based on Kubernetes built-in Service
* Integrate Dubbo applications with Kubernetes lifecycle

## 2 Basic Workflow

1. Create a Dubbo application ([dubbo-samples-kubernetes](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-kubernetes))
2. Build container images and push to the image repository ([dubbo-demo example image](https://hub.docker.com/r/apache/dubbo-demo))
3. Deploy Dubbo Provider and Dubbo Consumer to Kubernetes
4. Verify service discovery and calls are normal

## 3 Detailed Steps

### 3.1 Environment Requirements

Ensure that the following environment is installed locally to provide container runtime, Kubernetes cluster, and access tools.

* [Docker](https://www.docker.com/get-started/)
* [Minikube](https://minikube.sigs.k8s.io/docs/start/)
* [Kubectl](https://kubernetes.io/docs/tasks/tools/)
* [Kubens (optional)](https://github.com/ahmetb/kubectx)

Start the local Kubernetes cluster using the following command:

```shell
minikube start
```

Check if the cluster is running normally and if kubectl is bound to the default local cluster:

```shell
kubectl cluster-info
```

### 3.2 Prerequisites

As the example Dubbo project is deployed in Pods and interacts with API-SERVER, there are corresponding permission requirements. Here we create an independent ServiceAccount and bind the necessary Roles. All later Dubbo Kubernetes resources will use the newly created ServiceAccount.

With the following command, we created an independent Namespace `dubbo-demo` and ServiceAccount `dubbo-sa`.

```shell
# Initialize the namespace and account
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-provider/src/main/resources/k8s/ServiceAccount.yml

# Switch namespace
kubens dubbo-demo
```

### 3.3 Deploying to Kubernetes

#### 3.3.1 Deploy Provider

```shell
# Deploy Service
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-provider/src/main/resources/k8s/Service.yml

# Deploy Deployment
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-provider/src/main/resources/k8s/Deployment.yml
```

The above commands create a Service named `dubbo-samples-apiserver-provider`. Note that the service name here is the same as the Dubbo application name.

The Deployment then deploys a pod instance with 3 replicas, thus completing the Provider startup.
You can check the startup logs with the following commands.

```shell
# Check the pod list
kubectl get pods -l app=dubbo-samples-apiserver-provider

# Check pod deployment logs
kubectl logs your-pod-id
```

#### 3.3.2 Deploy Consumer

```shell
# Deploy Service
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-consumer/src/main/resources/k8s/Service.yml

# Deploy Deployment
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-consumer/src/main/resources/k8s/Deployment.yml
```

Deploying the consumer is the same as the provider. Here, the K8S Service and Dubbo consumer names are kept consistent: dubbo-samples-apiserver-consumer.

Check the startup logs, and the consumer completes the consumption of the provider service.

```shell
# Check the pod list
kubectl get pods -l app=dubbo-samples-apiserver-consumer

# Check pod deployment logs
kubectl logs your-pod-id
```

The logs output as follows:

```java
[22/04/22 01:10:24:024UTC]main INFO deploy.DefaultApplicationDeployer:[DUBBO]Dubbo Application[1.1](dubbo-samples-apiserver-consumer)is ready.,dubbo version:3.0.7,current host:172.17.0.6
        result:hello,Kubernetes Api Server
```

### 3.4 Modify Project and Package (Optional)

The example project and related images are ready. This section is for users who need to modify the example and check the deployment effect. You can view the [full code example here](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-kubernetes).

Configure the Dubbo project to use Kubernetes as the registry, specifying the default API-SERVER cluster address `kubernetes.default.srv` through `DEFAULT_MASTER_HOST`, along with two additional parameters: `namespace` and `trustCerts`.

```properties
dubbo.application.name=dubbo-samples-apiserver-provider
dubbo.application.metadataServicePort=20885
dubbo.registry.address=kubernetes://DEFAULT_MASTER_HOST?registry-type=service&duplicate=false&namespace=dubbo-demo&trustCerts=true
dubbo.protocol.name=dubbo
dubbo.protocol.port=20880
dubbo.application.qosEnable=true
dubbo.application.qosAcceptForeignIp=true
dubbo.provider.token=true
```

To package the image locally, you can use the `jib-maven-plugin` to package the image.

```shell
# Package and push the image
mvn compile jib:build
```

> The Jib plugin automatically packages and publishes the image. Note that for local development, you must change the Docker registry organization in the jib plugin configuration from apache/dubbo-demo to an organization you have permission for (ensure to modify others in the Kubernetes manifests, as well, to deploy your custom image). If you encounter authentication issues with the jib plugin, refer to [the relevant link](https://github.com/GoogleContainerTools/jib/blob/master/docs/faq.md#what-should-i-do-when-the-registry-responds-with-unauthorized) for configuring Docker registry authentication information.
> You can specify directly in the command line `mvn compile jib:build -Djib.to.auth.username=x -Djib.to.auth.password=x -Djib.from.auth.username=x -Djib.from.auth.username=x`, or use docker-credential-helper.

## 4 Best Practices

TBD

* readiness probe
* liveness probe
* CI/CD access with Skalfold

## 5 Appendix k8s manifests

ServiceAccount.yml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dubbo-demo
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dubbo-demo
  name: dubbo-role
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "watch", "list", "update", "patch"]
  - apiGroups: ["", "service.dubbo.apache.org"]
    resources: ["services", "endpoints", "virtualservices", "destinationrules"]
    verbs: ["get", "watch", "list"]
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dubbo-sa
  namespace: dubbo-demo
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dubbo-sa-bind
  namespace: dubbo-demo
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: dubbo-role
subjects:
  - kind: ServiceAccount
    name: dubbo-sa
```

Service.yml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: dubbo-samples-apiserver-provider
  namespace: dubbo-demo
spec:
  clusterIP: None
  selector:
    app: dubbo-samples-apiserver-provider
  ports:
    - protocol: TCP
      port: 20880
      targetPort: 20880
```

Deployment.yml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dubbo-samples-apiserver-provider
  namespace: dubbo-demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dubbo-samples-apiserver-provider
  template:
    metadata:
      labels:
        app: dubbo-samples-apiserver-provider
    spec:
      serviceAccountName: dubbo-sa
      containers:
        - name: server
          image: apache/dubbo-deemo:dubbo-samples-apiserver-provider_0.0.1
          ports:
            - containerPort: 20880
          livenessProbe:
            httpGet:
              path: /live
              port: 22222
            initialDelaySeconds: 5
            periodSeconds: 5
          readinessProbe:
            httpGet:
              path: /ready
              port: 22222
            initialDelaySeconds: 5
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /startup
              port: 22222
            failureThreshold: 30
            periodSeconds: 10
```

Service.yml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: dubbo-samples-apiserver-consumer
  namespace: dubbo-demo
spec:
  clusterIP: None
  selector:
    app: dubbo-samples-apiserver-consumer
  ports:
    - protocol: TCP
      port: 20880
      targetPort: 20880
```

Deployment.yml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dubbo-samples-apiserver-consumer
  namespace: dubbo-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dubbo-samples-apiserver-consumer
  template:
    metadata:
      labels:
        app: dubbo-samples-apiserver-consumer
    spec:
      serviceAccountName: dubbo-sa
      containers:
        - name: server
          image: apache/dubbo-demo:dubbo-samples-apiserver-consumer_0.0.1
          ports:
            - containerPort: 20880
          livenessProbe:
            httpGet:
              path: /live
              port: 22222
            initialDelaySeconds: 5
            periodSeconds: 5
          readinessProbe:
            httpGet:
              path: /ready
              port: 22222
            initialDelaySeconds: 5
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /startup
              port: 22222
            failureThreshold: 30
            periodSeconds: 10
```

