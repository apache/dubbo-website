---
type: docs
title: "Deploying to Kubernetes"
linkTitle: "Native K8S Service based on API-SERVER"
weight: 2
description: "This example demonstrates the usage example of deploying Dubbo application to Kubernetes and reusing Kubernetes Native Service directly using API-SERVER as the registration center.
The limitation of this example is that each Dubbo application needs to be granted permission to access specific resources of the API-SERVER. At the same time, direct access and monitoring of the API-SERVER is not a problem for small and medium clusters.
However, for larger-scale clusters, it may bring certain challenges to the stability of API-SERVER. In addition, you can consider deploying Dubbo applications to Kuberntes with the Dubbo control plane.
This solution does not need to grant the Dubbo application permission to access the API-SERVER, nor does it need to worry about the stability caused by the API-SERVER connecting too many data planes. "
---

You can follow the steps below to easily deploy the Dubbo service to the Kubernetes cluster. Check out the [full code sample address](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry /dubbo-samples-kubernetes)

## 1 Overall Objective

* Deploy Dubbo application to Kubernetes
* Realize service discovery based on Kubernetes built-in Service
* Connect Dubbo application to Kubernetes life cycle

## 2 Basic process

1. Create a Dubbo
   Application ( [dubbo-samples-kubernetes](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-kubernetes) )
2. Build the container image and push it to the mirror warehouse ( [dubbo-demo example image](https://hub.docker.com/r/apache/dubbo-demo) )
3. Deploy Dubbo Provider and Dubbo Consumer to Kubernetes respectively
4. Verify that service discovery and calling are normal

## 3 detailed steps

### 3.1 Environmental requirements

Please ensure that the following environment is installed locally to provide container runtime, Kubernetes cluster and access tools

* [Docker](https://www.docker.com/get-started/)
* [Minikube](https://minikube.sigs.k8s.io/docs/start/)
* [Kubectl](https://kubernetes.io/docs/tasks/tools/)
* [Kubens(optional)](https://github.com/ahmetb/kubectx)

Start the local Kubernetes cluster with the following command

```shell
minikube start
```

Check that the cluster is up and running with kubectl, and that kubectl is bound to the default local cluster

```shell
kubectl cluster-info
```

### 3.2 Preconditions

Since the sample Dubbo projects are all deployed in Pods and interact with API-SERVER, there are corresponding permission requirements. Here we create an independent ServiceAccount and bind the necessary Roles. All Dubbo Kubernetes later
All resources will use the newly created ServiceAccount here.

Through the following commands, we have created an independent Namespace `dubbo-demo` and ServiceAccount `dubbo-sa`.

```shell
# Initialize namespace and account
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-provider/src/main/resources/k8s/ServiceAccount.yml

# switch namespace
kubens dubbo-demo
```

### 3.3 Deploy to Kubernetes

#### 3.3.1 Deploy Provider

```shell
# Deploy the Service
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-provider/src/main/resources/k8s/Service.yml

# Deploy Deployment
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-provider/src/main/resources/k8s/Deployment.yml
```

The above command creates a Service named `dubbo-samples-apiserver-provider`, note that the service name here is the same as the dubbo application name in the project.

Then Deployment deploys a 3-copy pod instance, and the Provider is started.
You can check the startup log with the following command.

```shell
# View pod list
kubectl get pods -l app=dubbo-samples-apiserver-provider

# View pod deployment logs
kubectl logs your-pod-id
```

#### 3.3.2 Deploy Consumer

```shell
# Deploy the Service
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-consumer/src/main/resources/k8s/Service.yml

# Deploy Deployment
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-kubernetes/dubbo-samples-apiserver-consumer/src/main/resources/k8s/Deployment.yml
```

Deploying consumer and provider is the same, here also keep K8S Service and Dubbo consumer name consistent: dubbo-samples-apiserver-consumer.

Check the startup log, the consumer completes the consumption of the provider service.

```shell
# View pod list
kubectl get pods -l app=dubbo-samples-apiserver-consumer

# View pod deployment logs
kubectl logs your-pod-id
```

You can see the log output as follows:

```java
[22/04/22 01:10:24:024UTC]main INFO deploy.DefaultApplicationDeployer:[DUBBO]Dubbo Application[1.1](dubbo-samples-apiserver-consumer) is ready.,dubbo version:3.0.7,current host :172.17.0.6
         result: hello, Kubernetes Api Server
```

### 3.4 Modify the project and package it (can be skipped)

The sample project and related images are ready, this section is only for users who need to modify the sample and see the deployment effect. Check here [full code sample address](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-kubernetes)

Set the Dubbo project to use Kubernetes as the registration center. Here, DEFAULT_MASTER_HOST specifies the default API-SERVER cluster address kubernetes.default.srv, and also specifies
namespace, trustCerts two parameters

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

If you want to package the image locally, you can use the jib-maven-plugin plugin to package the image

```shell
# Package and push the image
mvn compile jib:build
```

> The Jib plugin will automatically package and publish the image. Note that for local development, you need to change the docker registry organization apache/dubbo-demo in the jib plug-in configuration to an organization with your own authority (including dubboteam in other kubernetes manifests to ensure that kubernetes deploys your own customized image) , if you encounter jib plug-in authentication problems, please refer to [corresponding link](https://github.com/GoogleContainerTools/jib/blob/master/docs/faq.md#what-should-i-do-when-the- registry-responds-with-unauthorized) to configure docker registry authentication information.
> You can specify `mvn compile jib:build -Djib.to.auth.username=x -Djib.to.auth.password=x -Djib.from.auth.username=x -Djib.from.auth directly on the command line .username=x`, or use docker-credential-helper.

## 4 Best Practices

TBD

* rediness probe
* liveness probe
* ci/cd access to Skalfold

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