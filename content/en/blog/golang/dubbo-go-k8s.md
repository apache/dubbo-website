---
title: "Design and Implementation of Using Kubernetes Native as a Registration Center in dubbo-go"
linkTitle: "Design and Implementation of Using Kubernetes Native as a Registration Center in dubbo-go"
tags: ["Go"]
date: 2021-01-14
description: >
    With the promotion of cloud-native, more and more companies or organizations containerize their services and deploy these containerized services in Kubernetes clusters.
---

Today's article will introduce the intention, design plan, and specific implementation of dubbo-go using Kubernetes as a service registry.

So far, the implementation of this plan has been merged into the master branch of dubbo-go. The specific implementation is regarding Kubernetes [PullRequest](https://github.com/apache/dubbo-go/pull/400).

## Philosophy of Managing Resources in Kubernetes

Kubernetes, as a container orchestration management solution, can be subjectively divided into service process management and service access management.

- Service instance management is primarily reflected in the Pod design pattern and the controller pattern, where controllers ensure that Pods with specific labels (Kubernetes-Label) remain at a constant number (more deletion, less addition).
- Service management is mainly through Kubernetes-Service, which by default provides a VIP (Kubernetes-ClusterIP) for Pods with specific labels (Kubernetes-Label), and all requests to that group of Pods are forwarded to the real service provider Pods according to a round-robin load strategy. CoreDNS provides a unique domain name for this Kubernetes-Service within the cluster.

## Service Discovery Model in Kubernetes

To clarify the solutions provided by K8s in service access management, let's take the API (HTTPS) service provided by kube-apiserver as an example. The K8s cluster assigns a valid ClusterIP for the service and allocates a unique domain name "kubernetes" through CoreDNS. When Pods within the cluster need to access this service, they can directly use https://kubernetes:443.

![img](/imgs/blog/dubbo-go/k8s/k8s-service-discovery.png)

The specific process is shown in the image above (red for client, green for kube-apiserver):

1. The client first resolves the domain name "kubernetes" via CoreDNS to obtain the corresponding Cluster IP of 10.96.0.1.
2. The client initiates an HTTP request to 10.96.0.1.
3. The HTTP request is intercepted by IP tables created by kube-proxy and randomly DNATs to 10.0.2.16 or 10.0.2.15.
4. The client establishes a connection and interacts with the Pod providing the service.

Thus, it can be seen that the service discovery provided by Kubernetes is at the domain name resolution level.

## Service Discovery Model in Dubbo

Similarly, to clarify the service discovery model of dubbo, let's take a simple example of a dubbo-consumer discovering and accessing a Provider.

![img](/imgs/blog/dubbo-go/k8s/dubbo-service-discovery.png)

The specific process is shown in the image above:

1. The Provider registers the metadata of the current process in the Registry, including IP, Port, and service name, etc.
2. The Consumer retrieves the access information of the Provider from the Registry and initiates a request directly.

Thus, it can be seen that the current service discovery model of dubbo is at the Endpoint level, and the registered information not only includes IP and Port but also other metadata.

## Reasons for Not Using Kubernetes Service Discovery Model Directly

From the above two sections, the reasons for not being able to directly use Kubernetes as a registration center are mainly summarized as follows:

1. The service description fields of the standard resource objects in Kubernetes-Service do not provide the complete dubbo process metadata fields, thus it cannot use Kubernetes-Service for service registration and discovery directly.
2. The service registration in dubbo-go is based on each process, and each dubbo process needs to perform independent registration.
3. The default creation of VIP for Kubernetes-Service and the round-robin load strategy conflicts with the load strategy of the existing Cluster module in dubbo-go.

## Registration/Discovery Solution Adopted by Dubbo-go

### Service Registration

Kubernetes implements service registration/discovery based on the Service object. However, the existing dubbo scheme is to register each dubbo-go process independently. Therefore, dubbo-go chooses to write the unique metadata of this process into the description of the Pod resource object in Kubernetes running this **dubbo-go** process. Each Pod running a dubbo process writes its metadata into the Kubernetes-Pod Annotations field. To avoid conflicts with other Operators or other types of controllers (like Istio) that use the Annotations field, dubbo-go uses a key of **dubbo.io/annotation** and a value of JSON-encoded arrays of K/V pairs that are base64 encoded.

An example is:

```yaml
apiVersion: v1
kind: Pod
metadata:
 annotations:
 dubbo.io/annotation:
W3siayI6Ii9kdWJibyIsInYiOiIifSx7ImsiOiIvZHViYm8vY29tLmlrdXJlbnRvLnVzZXIuVXNlcl
Byb3ZpZGVyIiwidiI6IiJ9LHsiayI6Ii9kdWJiby9jb20uaWt1cmVudG8udXNlci5Vc2VyUHJvdmlk
ZXIvY29uc3VtZXJzIiwidiI6IiJ9LHsiayI6Ii9kdWJibyIsInYiOiIifSx7ImsiOiIvZHViYm8vY2
9tLmlrdXJlbnRvLnVzZXIuVXNlclByb3ZpZGVyIiwidiI6IiJ9LHsiayI6Ii9kdWJiby9jb20uaWt1
cmVudG8udXNlci5Vc2VyUHJvdmlkZXIvcHJvdmlkZXJzIiwidiI6IiJ9LHsiayI6Ii9kdWJiby9jb2
0uaWt1cmVudG8udXNlci5Vc2VyUHJvdmlkZXIvY29uc3VtZXJzL2NvbnN1bWVyJTNBJTJGJTJGMTcy
LjE3LjAuOCUyRlVzZXJQcm92aWRlciUzRmNhdGVnb3J5JTNEY29uc3VtZXJzJTI2ZHViYm8lM0RkdW
Jib2dvLWNvbnN1bWVyLTIuNi4wJTI2cHJvdG9jb2wlM0RkdWJibyIsInYiOiIifV0=
```

Since each dubbo-go Pod is only responsible for registering its process's metadata, the length of the Annotations field will not increase with the number of running dubbo-go Pods.

### Service Discovery

Relying on the Kubernetes API Server provides the Watch feature. It can observe changes to Pod objects within a specific namespace. dubbo-go restricts the watch conditions to the namespace where the current Pod resides and watches Pods with a key of **dubbo.io/label** and a value of **dubbo.io-value**. When the corresponding Pod's changes are watched, the local cache is updated in real-time and service cluster management is established through the Registry's Subscribe notification.

### Overall Design Diagram

![img](/imgs/blog/dubbo-go/k8s/design.png)

The specific process is shown in the image above:

1. The dubbo-go Deployment or other types of controllers use the Kubernetes Downward-Api to inject the namespace of the current Pod into the dubbo-go process as an environment variable.
2. After the dubbo-go process's Pod starts, it retrieves the current namespace and Pod name through environment variables, invoking the Kubernetes-Apiserver PATCH functionality to add a key of **dubbo.io/label** and a value of **dubbo.io-value** to the Pod's label.
3. The dubbo-go process calls the Kubernetes-Apiserver to write its metadata into the current Pod's Annotations field through the PATCH interface.
4. The dubbo-go process LISTs other Pods with the same label in the current namespace and decodes the corresponding Annotations field to obtain information about other Pods.
5. The dubbo-go process WATCHes the Annotations field changes of other Pods with the same label in the current namespace.

## Conclusion

K8s has already provided a set of service discovery, service registration, and service cluster management mechanisms for the services it hosts. Meanwhile, dubbo-go also has its own service cluster management system. These two functionalities are in conflict, and without a way to tune the two, the dubbo-go team decided to maintain the service cluster management unique to dubbo while selectively abandoning the Service functionality, writing metadata directly into the Pod object's Annotations.

Of course, this is just one of the schemes of dubbo-go using K8s as a service registration center. In the future, the community will interface with K8s in a more "cloud-native" manner, so let's wait and see.

dubbo-go community DingTalk group: 23331795, you are welcome to join.

> Author Information: Wang Xiang, GitHub ID: sxllwx, employed at Chengdu Datun Technology Co., Ltd., Golang developer.

