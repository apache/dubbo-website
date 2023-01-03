---
title: Use Pixiu to expose Dubbo-go service
weight: 9
type: docs
---

The Dubbo-go-pixiu gateway supports calling GO/Java Dubbo clusters. In the Dubbo-go 3.0 scenario, we can use the Pixiu gateway to request the Pixiu gateway with the HTTP protocol outside the cluster, perform protocol conversion at the gateway layer, and further call the Dubbo-go service in the cluster.

![img](/imgs/docs3-v2/golang-sdk/samples/pixiu-nacos-triple/triple-pixiu.png)

The path for the user to call the Dubbo-go service is http://$(app_name)/$(service_name)/$(method)

For example, a proto file has the following definition:

```protobuf
package org.apache.dubbo.quickstart.samples;

service UserProvider {
  rpc SayHello (HelloRequest) returns (User) {}
}

message HelloRequest {
  string name = 1;
}
```

And configure the application name in dubbogo.yml when the dubbo-go service is started: my-dubbogo-app:

```yaml
dubbo:
application:
  name: my-dubbogo-app
```

The pixiu gateway can resolve the route whose path is http://my-dubbogo-app/org.apache.dubbo.quickstart.samples.UserProvider/SayHello and forward it to the corresponding service. The body from the external HTTP request is a json serialized request parameter, such as {"name":"test"}.

We currently recommend using Nacos as the registry.

Users can deploy our demo in their own clusters. It is better for the cluster to have the ability to expose lb type services, so that the services in the cluster can be accessed from the public network, and you can also make requests directly in the cluster. For your cluster, execute:

```bash
$ kubectl apply -f https://raw.githubusercontent.com/dubbogo/triple-pixiu-demo/master/deploy/pixiu-triple-demo.yml
```

The following resources will be created under the dubbogo-triple-nacos namespace, including three triple-servers, one pixiu gateway, and one nacos server. And expose the service to the public network through Servcie.

```plain
namespace/dubbogo-triple-nacos created
service/dubbo-go-nacos created
deployment.apps/dubbogo-nacos-deployment created
deployment.apps/pixiu created
deployment.apps/server created
service/pixiu created
```

Obtain pixiu public network ip and call it

```plain
$ kubectl get svc -n dubbogo-triple-nacos
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
dubbo-go-nacos ClusterIP 192.168.123.204 <none> 8848/TCP 32s
pixiu LoadBalancer 192.168.156.175 30.XXX.XXX.XX 8881:30173/TCP 32s
```

Call the demo service through curl and get the response result.

```bash
$ curl -X POST -d '{"name":"laurence"}' http://30.XXX.XXX.XX:8881/dubbogoDemoServer/org.apache.dubbo.laurence.samples.UserProvider/SayHello
{"name":"Hello Laurence","id":"12345","age":21}
```