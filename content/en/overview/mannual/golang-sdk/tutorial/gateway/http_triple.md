---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/pixiu/http_triple/
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/pixiu/http_triple/
description: Access Ingress Traffic
title: Access Ingress Traffic
type: docs
weight: 1
---






## 1. Preparation

- kubectl
- A k8s cluster, with kubeconfig configured 

## 2. Calling Triple Application via Gateway using HTTP Protocol

The Dubbo-go-pixiu gateway supports calling Dubbo clusters in GO/Java. In the Dubbo-go 3.0 scenario, we can request the pixiu gateway via HTTP protocol from outside the cluster, allowing protocol conversion at the gateway layer to further call Dubbo-go services inside the cluster.

![image.png](/imgs/docs3-v2/golang-sdk/tasks/pixiu/http_triple/triple-pixiu.png)

The path for users to call Dubbo-go services is http://$(app_name)/$(service_name)/$(method).

For example, if a proto file has the following definition:

```protobuf
package org.apache.dubbo.quickstart.samples;

service UserProvider {
  rpc SayHello (HelloRequest) returns (User) {}
}

message HelloRequest {
  string name = 1;
}
```

And during the startup of the dubbo-go service, the application name is configured in dubbogo.yml as my-dubbogo-app:

```yaml
dubbo:
  application:
    name: my-dubbogo-app
```

The pixiu gateway can then resolve the path my-dubbogo-app/org.apache.dubbo.quickstart.samples.UserProvider/SayHello and forward it to the corresponding service. The body of HTTP requests from external sources will be JSON serialized request parameters, e.g., {"name":"test"}.

Currently, we recommend using Nacos as the registry.

Users can deploy our demo in their own cluster, preferably with the ability to expose a service of lb type, to allow public access to services within the cluster, or requests can be made directly within the cluster.

For your cluster, execute:

```bash
$ kubectl apply -f https://raw.githubusercontent.com/dubbogo/triple-pixiu-demo/master/deploy/pixiu-triple-demo.yml
```

This will create the following resources in the dubbogo-triple-nacos namespace, including three triple-servers, one pixiu gateway, and one nacos server, exposing the service to the public through Service.

```bash
namespace/dubbogo-triple-nacos created
service/dubbo-go-nacos created
deployment.apps/dubbogo-nacos-deployment created
deployment.apps/pixiu created
deployment.apps/server created
service/pixiu created
```

Get the external IP of the pixiu and make a call:

```pgsql
$ kubectl get svc -n dubbogo-triple-nacos
NAME             TYPE           CLUSTER-IP        EXTERNAL-IP     PORT(S)          AGE
dubbo-go-nacos   ClusterIP      192.168.123.204   <none>          8848/TCP         32s
pixiu            LoadBalancer   192.168.156.175   30.XXX.XXX.XX   8881:30173/TCP   32s
```

Call the demo service using curl and obtain the response.

```bash
$ curl -X POST -d '{"name":"laurence"}' http://30.XXX.XXX.XX:8881/dubbogoDemoServer/org.apache.dubbo.laurence.samples.UserProvider/SayHello
{"name":"Hello laurence","id":"12345","age":21}
```

