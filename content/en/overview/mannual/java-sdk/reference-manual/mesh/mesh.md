---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/mesh/mesh/
    - /en/docs3-v2/java-sdk/reference-manual/mesh/mesh/
description: Describes how to debug the Dubbo mesh proxyless mode.
linkTitle: Debug Reference Documentation
title: Debug Reference Documentation
type: docs
weight: 2
---






## Prerequisite Environment Preparation

* Docker environment
* Kubernetes environment (recommended docker desktop for its GUI, includes a small Kubernetes environment, the following demonstrations are based on docker desktop)
* Istio environment
* Dubbo samples code, master branch suffices
* Dubbo version >= 3.1.0
Setting Up Kubernetes Environment
Currently, Dubbo only supports Mesh deployment in a Kubernetes environment, so you need to set up a Kubernetes environment before running this example. (It is recommended to use docker desktop for setup, which can directly run a Kubernetes environment.)
https://docs.docker.com/desktop/install/mac-install/

## Setting Up Kubernetes Environment

Currently, Dubbo only supports Mesh deployment in a Kubernetes environment, so you need to set up a Kubernetes environment before running this example. (It is recommended to use docker desktop for setup, which can directly run a Kubernetes environment.)
https://docs.docker.com/desktop/install/mac-install/

## Setting Up Istio Environment

Reference documentation for setting up Istio environment:
Istio Installation Documentation(https://istio.io/latest/docs/setup/getting-started/)
Note: When installing Istio, you need to enable first-party-jwt support (add --set values.global.jwtPolicy=first-party-jwt when using the istioctl tool), otherwise it will cause client authentication failure.
Installation command reference:

```java
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.xx.x
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo --set values.global.jwtPolicy=first-party-jwt -y
```

## Building dubbo and dubbo-samples Environment

Enter dubbo-dependencies-bom, change the grpc version to 1.41.0

```java
<grpc.version>1.41.0</grpc.version>
```

Enter the dubbo-samples-xds directory and add the configuration:

```java
dubbo.application.metadataServiceProtocol=dubbo
```

Package the dubbo code by switching to the dubbo root directory and executing the following command:

```java
mvn clean package -DskipTests
```

Switch to the dubbo-samples code and import the just packaged dubbo code in the dubbo-samples-xds pom file.
Next, modify the debug mode, taking dubbo-xds-consumer as an example:
Change the docker file of dubbo-samples-consumer and set the debug mode to suspend=y, the modified docker file is as follows:

```java
FROM openjdk:8-jdk
ADD ./target/dubbo-samples-xds-consumer-1.0-SNAPSHOT.jar dubbo-samples-xds-consumer-1.0-SNAPSHOT.jar
EXPOSE 31000
CMD java -jar -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=31000 /dubbo-samples-xds-consumer-1.0-SNAPSHOT.jar
```

Then execute the following command to package:

```java
cd dubbo-samples/dubbo-samples-xds
mvn clean package -DskipTests
```

## Building Docker Images

```java
cd ./dubbo-samples-xds-provider/
# dubbo-samples-xds/dubbo-samples-xds-provider/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-provider_0.0.1 .
cd ../dubbo-samples-xds-consumer/
# dubbo-samples-xds/dubbo-samples-xds-consumer/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-consumer_0.0.1 .
cd ../
```

## Creating K8s Namespace

```java
# Initialize namespace
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-xds/deploy/Namespace.yml

# Switch namespace
kubens dubbo-demo
```

If kubens switch fails, just install kubectl.
## Deploying Containers

```java
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

After successfully executing the above commands, the docker desktop containers page looks like this, where dubbo-samples appear in several containers, including consumer and provider:

![docker-desktop.png](/imgs/user/docker-desktop.png)

Check the k8s_server_dubbo-samples-xds-provider-XXX logs, and the following logs appear:

```java
Dec 28, 2022 8:42:48 AM org.apache.dubbo.config.deploy.DefaultApplicationDeployer info
INFO:  [DUBBO] Dubbo Application[1.1](dubbo-samples-xds-provider) is ready., dubbo version: 1.0-SNAPSHOT, current host: 10.1.5.64
Dec 28, 2022 8:42:49 AM org.apache.dubbo.registry.xds.util.protocol.AbstractProtocol info
INFO:  [DUBBO] receive notification from xds server, type: type.googleapis.com/envoy.config.listener.v3.Listener, dubbo version: 1.0-SNAPSHOT, current host: 10.1.5.64
Dec 28, 2022 8:42:53 AM org.apache.dubbo.registry.xds.util.protocol.AbstractProtocol info
INFO:  [DUBBO] receive notification from xds server, type: type.googleapis.com/envoy.config.listener.v3.Listener, dubbo version: 1.0-SNAPSHOT, current host: 10.1.5.64
dubbo service started
```

![xds-provider-log.png](/imgs/user/xds-provider-log.png)

Check the k8s_server_dubbo-samples-xds-consumer-XXX logs, and it is waiting for the debug connection:
![xds-consumer-listener.png](/imgs/user/xds-consumer-listener.png)
Open a terminal and enter the command to view available and Running status pods: 

```java
kubectl get pods
```
![k8s-pods.png](/imgs/user/k8s-pods.png)

Enter the following command to map the pods' ports to the local machine:

```java
kubectl port-forward dubbo-samples-xds-consumer-64c6c6f444-kk2vr 31000:31000
```

![port-forward.png](/imgs/user/port-forward.png)

Switch to idea, edit configuration, set the debugger mode to attach to remote JVM, choose the port exposed in the above docker file, select the module classpath as dubbo-samples-xds-consumer, and click debug to successfully connect.
![remote-debug.png](/imgs/user/remote-debug.png)

You can see that the breakpoint has been successfully hit:
![xds-debug-success.png](/imgs/user/xds-debug-success.png)
At this point, checking the logs of k8s_server_dubbo-samples-xds-consumer-XXX indicates it is successfully running:
![xds-consumer-debug-success-log.png](/imgs/user/xds-consumer-debug-success-log.png)

