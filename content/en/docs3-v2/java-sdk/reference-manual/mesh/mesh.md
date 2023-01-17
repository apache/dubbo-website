---
type: docs
title: "Debug Reference Documentation"
linkTitle: "Debug Reference Documentation"
weight: 2
description: "Describe how to debug Dubbo mesh proxyless mode."
---

## Pre-environment preparation

* docker environment
* kubernetes environment (docker desktop is recommended, with a graphical interface, and a small Kubernetes environment is embedded, and the following demonstration is also based on docker desktop)
* istio environment
* dubbo-samples code, the master branch is fine
* dubbo version >= 3.1.0
  Build a Kubernetes environment
  Currently Dubbo only supports Mesh deployment in the Kubernetes environment, so you need to set up the Kubernetes environment before running and starting this example. (It is recommended to use docker desktop to build, and you can run a kubernetes environment directly)
  https://docs.docker.com/desktop/install/mac-install/

## Build Kubernetes environment

Currently Dubbo only supports Mesh deployment in the Kubernetes environment, so you need to set up the Kubernetes environment before running and starting this example. (It is recommended to use docker desktop to build, and you can run a kubernetes environment directly)
https://docs.docker.com/desktop/install/mac-install/

## Build Kubernetes environment

Build the Istio environment reference document:
Istio installation documentation (https://istio.io/latest/docs/setup/getting-started/)
Note: When installing Istio, you need to enable first-party-jwt support (add the --set values.global.jwtPolicy=first-party-jwt parameter when using the istioctl tool to install), otherwise it will cause client authentication to fail.
Attached installation command reference:

```java
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.xx.x
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo --set values.global.jwtPolicy=first-party-jwt -y
```

## Start to build dubbo and dubbo-samples environment

Enter dubbo-dependencies-bom, change grpc version to 1.41.0

```java
<grpc.version>1.41.0</grpc.version>
```

Enter the dubbo-samples-xds directory and add configuration:

```java
dubbo.application.metadataServiceProtocol=dubbo
```

Package the dubbo code, switch to the dubbo root directory, and execute the following command to package:

```java
mvn clean package -DskipTests
```

Switch to the dubbo-samples code, and introduce the newly packaged dubbo code into the pom file of dubbo-samples-xds.
Next, modify the debug mode, taking dubbo-xds-consumer as an example:
Change the docker file of dubbo-samples-consumer and change the debug mode to suspend=y, the changed docker file is as follows:

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

## Build docker image

```java
cd ./dubbo-samples-xds-provider/
# dubbo-samples-xds/dubbo-samples-xds-provider/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-provider_0.0.1 .
cd ../dubbo-samples-xds-consumer/
# dubbo-samples-xds/dubbo-samples-xds-consumer/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-consumer_0.0.1 .
cd ../
```

## Create K8s namespace

```java
# Initialize the namespace
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-xds/deploy/Namespace.yml

# switch namespace
kubens dubbo-demo
```

If the kubens switch is unsuccessful, just install kubectl
## deploy container

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

After successfully executing the above command, the docker desktop containers page looks like this, in which there are several containers in dubbo-samples, including consumer and provider:

![docker-desktop.png](/imgs/user/docker-desktop.png)



View the k8s_server_dubbo-samples-xds-provider-XXX log, the following log appears:

```java
Dec 28, 2022 8:42:48 AM org.apache.dubbo.config.deploy.DefaultApplicationDeployer info
INFO: [DUBBO] Dubbo Application[1.1](dubbo-samples-xds-provider) is ready., dubbo version: 1.0-SNAPSHOT, current host: 10.1.5.64
Dec 28, 2022 8:42:49 AM org.apache.dubbo.registry.xds.util.protocol.AbstractProtocol info
INFO: [DUBBO] receive notification from xds server, type: type.googleapis.com/envoy.config.listener.v3.Listener, dubbo version: 1.0-SNAPSHOT, current host: 10.1.5.64
Dec 28, 2022 8:42:53 AM org.apache.dubbo.registry.xds.util.protocol.AbstractProtocol info
INFO: [DUBBO] receive notification from xds server, type: type.googleapis.com/envoy.config.listener.v3.Listener, dubbo version: 1.0-SNAPSHOT, current host: 10.1.5.64
dubbo service started
```

![xds-provider-log.png](/imgs/user/xds-provider-log.png)

Check the k8s_server_dubbo-samples-xds-consumer-XXX log and find that it is waiting for a debug connection:
![xds-consumer-listener.png](/imgs/user/xds-consumer-listener.png)
Open the command terminal and enter the command to view the pods that are available and in the Running state:

```java
kubectl get pods
```
![k8s-pods.png](/imgs/user/k8s-pods.png)

Enter the following command to map the port of the pods to the local:

```java
kubectl port-forward dubbo-samples-xds-consumer-64c6c6f444-kk2vr 31000:31000
```

![port-forward.png](/imgs/user/port-forward.png)

Switch to idea, edit configuration, select attach to remote JVM for debugger mode, select the port of the above docker file expose for port, select dubbo-samples-xds-consumer for module classpath, and click debug to connect successfully
![remote-debug.png](/imgs/user/remote-debug.png)

You can see that the breakpoint has successfully entered:
![xds-debug-success.png](/imgs/user/xds-debug-success.png)
At this point, check the log of k8s_server_dubbo-samples-xds-consumer-XXX to see that it has been successfully running:
![xds-consumer-debug-success-log.png](/imgs/user/xds-consumer-debug-success-log.png)