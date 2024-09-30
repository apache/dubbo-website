---
aliases:
    - /en/overview/tasks/deploy/deploy-on-vm/
    - /en/overview/tasks/deploy/deploy-on-vm/
description: "Traditional deployment architecture based on Zookeeper and Nacos for deploying Dubbo applications in a virtual machine environment"
linkTitle: Traditional Registration Center
title: Traditional deployment architecture based on Zookeeper and Nacos for deploying Dubbo applications in a virtual machine environment
type: docs
weight: 1
---

The following diagram illustrates a typical Dubbo microservice deployment architecture using Nacos and Zookeeper as the registration center.

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes.png" style="max-width:650px;height:auto;" />

## Install Nacos
Please refer to the following documentation for how to [install Nacos]() locally.

## Deploy Application
We will continue to use the project in [Quick Start]() as an example to demonstrate the detailed steps for application packaging and deployment.

Clone the sample project locally:
```shell
$ git clone -b main --depth 1 https://github.com/apache/dubbo-samples
````

Switch to the sample directory:
```shell
$ cd dubbo-samples/11-quickstart
```

Here are two packaging and deployment modes:

### Method 1: Local Process

Local packaging process:
```shell
$ mvn clean package
```

Start the Dubbo process:
```shell
$ java -jar ./quickstart-service/target/quickstart-service-0.0.1-SNAPSHOT.jar
```

{{% alert title="Tip" color="primary" %}}
To ensure the program runs correctly, please make sure the registration center address in the `application.yml` file is correctly pointing to the desired registration center.
{{% /alert %}}

### Method 2: Docker Container

```shell
$ docker build -f ./Dockerfile -t quickstart
```

```shell
$ docker run quickstart -p port1:port2
# Some port or connection details to the registration center need to be clarified
```

{{% alert title="Tip" color="primary" %}}
In a Docker container environment, special attention is needed for the addresses used for network communication between different containers. Therefore, you may need to set the address that the Dubbo process listens to or registers with the registration center. Please refer to the following link for more information.

See [dubbo sets host through environment variables](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-docker)

Some deployment scenarios require dynamically specifying the service registration address, such as specifying the host machine IP to enable external communication in the Docker bridge network mode. Dubbo provides two pairs of system properties for the startup phase to set the external communication IP and port addresses.

* **DUBBO_IP_TO_REGISTRY**: IP address registered with the registration center
* **DUBBO_PORT_TO_REGISTRY**: Port registered with the registration center
* **DUBBO_IP_TO_BIND**: IP address to listen on
* **DUBBO_PORT_TO_BIND**: Port to listen on

The above four configuration items are optional. If not configured, dubbo will automatically obtain IP and port. Please flexibly choose configurations based on specific deployment scenarios. Dubbo supports multiple protocols, and if an application exposes multiple different protocol services at the same time and needs to specify IP or port for each service separately, please prefix the above properties with the protocol prefix. For example:

* **HESSIAN_DUBBO_PORT_TO_BIND**: Port bound for the hessian protocol
* **DUBBO_DUBBO_PORT_TO_BIND**: Port bound for the dubbo protocol
* **HESSIAN_DUBBO_IP_TO_REGISTRY**: IP for registering the hessian protocol
* **DUBBO_DUBBO_IP_TO_REGISTRY**: IP for registering the dubbo protocol

PORT_TO_REGISTRY or IP_TO_REGISTRY will not be used as the default PORT_TO_BIND or IP_TO_BIND, but the reverse is true. For example:

* Setting `PORT_TO_REGISTRY=20881` and `IP_TO_REGISTRY=30.5.97.6` does not affect `PORT_TO_BIND` and `IP_TO_BIND`.
* Setting `PORT_TO_BIND=20881` and `IP_TO_BIND=30.5.97.6`, then by default `PORT_TO_REGISTRY=20881` and `IP_TO_REGISTRY=30.5.97.6`.

{{% /alert %}}

### Check Deployment Status
Install and run dubbo-control-plane to check the local service deployment status:

1. Download the installation package

	```shell
	$ curl -L https://raw.githubusercontent.com/apache/dubbo-kubernetes/master/release/downloadDubbo.sh | sh -
	$ cd dubbo-$version/bin
	```

2. Run the following command to start the dubbo-control-plane process
	```shell
	$ ./dubbo-cp run
	```

{{% alert title="Tip" color="primary" %}}
To ensure dubbo-control-plane runs properly, please modify `conf/dubbo-cp.yml` to ensure it points to your desired registration center.
{{% /alert %}}

Visit `http://xxx` to view service deployment details.

### Graceful Online and Offline
In the case of using a traditional registration center, we need to control the timing of when instances are published to the registration center and when instances are removed from the registration center to achieve a graceful online and offline:
1. In the online phase, control the timing of instance registration to the registration center through the [delayed release]() mechanism and ensure that traffic is gradually forwarded to the new nodes through enabling [consumer preheating]().
2. In the offline phase, configure `prestop` to ensure that instance registration information is first removed from the registration center, and then enter the process of destruction.

Before going offline, it is recommended to call the following http port to remove the instance from the registration center first, then attempt to stop the process.

```shell
$ curl http://offline
$ sleep 10
$ kill dubbo-pid
```
