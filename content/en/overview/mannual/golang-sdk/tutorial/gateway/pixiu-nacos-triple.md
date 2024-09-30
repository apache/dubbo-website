---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/pixiu/pixiu-nacos-triple/
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/pixiu/pixiu-nacos-triple/
description: Exposing Dubbo-go services using Pixiu
title: Exposing Dubbo-go services using Pixiu
type: docs
weight: 9
---






The Dubbo-go-pixiu gateway supports calls to Dubbo clusters in GO/Java. In the scenario of Dubbo-go 3.0, we can request the Pixiu gateway over HTTP protocol outside the cluster, perform protocol conversion at the gateway layer, and further call the Dubbo-go services inside the cluster.

![img](/imgs/docs3-v2/golang-sdk/samples/pixiu-nacos-triple/triple-pixiu.png)

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

And when the dubbo-go service starts, it configures the application name as my-dubbogo-app in the dubbogo.yml:

```yaml
dubbo:
	application:
  	name: my-dubbogo-app
```

The Pixiu gateway can resolve the path as http://my-dubbogo-app/org.apache.dubbo.quickstart.samples.UserProvider/SayHello and forward it to the corresponding service. The body from external HTTP requests is JSON serialized request parameters, for example, {"name":"test"}.

We currently recommend using Nacos as the registration center.

Users can deploy our demo in their cluster, preferably with the ability to expose lb type services so that services in the cluster can be accessed from the public network, or requests can be made directly within the cluster. For your cluster, execute:

```bash
$ kubectl apply -f https://raw.githubusercontent.com/dubbogo/triple-pixiu-demo/master/deploy/pixiu-triple-demo.yml
```

This will create the following resources under the dubbogo-triple-nacos namespace, including three triple-servers, one pixiu gateway, and one nacos server. The services will be exposed to the public network via Service.

```plain
namespace/dubbogo-triple-nacos created
service/dubbo-go-nacos created
deployment.apps/dubbogo-nacos-deployment created
deployment.apps/pixiu created
deployment.apps/server created
service/pixiu created
```

Obtain the public IP of Pixiu and make a call:

```plain
$ kubectl get svc -n dubbogo-triple-nacos
NAME             TYPE           CLUSTER-IP        EXTERNAL-IP     PORT(S)          AGE
dubbo-go-nacos   ClusterIP      192.168.123.204   <none>          8848/TCP         32s
pixiu            LoadBalancer   192.168.156.175   30.XXX.XXX.XX   8881:30173/TCP   32s
```

Call the demo service with curl and receive the response.

```bash
$ curl -X POST -d '{"name":"laurence"}' http://30.XXX.XXX.XX:8881/dubbogoDemoServer/org.apache.dubbo.laurence.samples.UserProvider/SayHello
{"name":"Hello laurence","id":"12345","age":21}
```

