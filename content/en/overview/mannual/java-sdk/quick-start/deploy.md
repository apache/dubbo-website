---
description: Quick Deployment of Dubbo Applications
linkTitle: Deploying Dubbo Applications
title: Quick Deployment of Dubbo Applications
type: docs
toc_hide: true
hide_summary: true
weight: 3
---

In the previous article, we created a Dubbo application from scratch and detailed its code structure. Next, we will learn how to deploy this Dubbo application.

This article will explain the deployment of Dubbo applications based on a Kubernetes cluster, and the deployment architecture is shown in the diagram below.
![Dubbo+Kubernetes+Nacos Deployment Architecture]()

{{% alert title="Note" color="info" %}}
In real-world usage, the deployment environment may vary widely, including Kubernetes Services, Service Mesh, virtual machines, and more. Please refer to [Deployment Documentation]() for more detailed content.
{{% /alert %}}

## Prerequisites
The Dubbo community provides tools and solutions to simplify the packaging and deployment process in the entire Kubernetes environment. Therefore, we need to install the relevant tools before we begin.

1. Install dubboctl (if not already installed)
    ```sh
    curl -L https://raw.githubusercontent.com/apache/dubbo-kubernetes/master/release/downloadDubbo.sh | sh -

    cd dubbo-$version
    export PATH=$PWD/bin:$PATH
    ```

## Deploying the Application

### Initialize Microservices Cluster

1. Once dubboctl is installed, initialize the microservice deployment environment with the following command:
    ```sh
    dubboctl manifest install --profile=demo
    ```

    For demonstration purposes, the above command will install Zookeeper, Dubbo Control Plane, Prometheus, Grafana, Zipkin, Ingress, and other components at once. For more explanations and configurations about `--profile=demo`, please refer to the documentation.

2. Check if the environment is ready:
    ```sh
    kubectl get services -n dubbo-system
    ```

3. Finally, enable the automatic injection mode for the target Kubernetes namespace, so that the application can automatically connect to the Zookeeper registry and other components after deployment.
    ```shell
    kubectl label namespace dubbo-demo dubbo-injection=enabled --overwrite
    ```

### Deploying the Dubbo Application

Next, we will package the image for the application created earlier (please ensure that Docker is installed locally and the Docker process is running). Run the following command in the application's root directory:
```shell
dubboctl build --dockerfile=./Dockerfile
```

The `build` command packages the source code into an image and pushes it to a remote repository. Depending on the network situation, it may take some time to complete the command.

Next, we need to generate the Kubernetes resource files for deploying the application by running the following command:
```shell
dubboctl deploy
```

The `deploy` command will generate the Kubernetes resource manifests using the image just packaged by `build`. After successful execution of the command, you will see the generated `kube.yaml` file in the current directory, which includes the definitions of Kubernetes resources such as deployment and service.

{{% alert title="Note" color="warning" %}}
Local builds may take a long time. If you encounter problems with local builds, you can use the following command to skip the `build` process.
```sh
dubboctl deploy --image=apache/dubbo-demo:quickstart_0.1
# `--image` specifies using an officially prepared example image
```
{{% /alert %}}

Next, deploy the application to the Kubernetes environment.
```shell
kubectl apply -f ./kube.yaml
```

Check the deployment status:
```shell
kubectl get services -n dubbo-demo
```

## Accessing the Application
After a successful deployment, you can check the application status in the following ways.

{{< tabpane text=true >}}
{{< tab header="Please choose according to your situation:" disabled=true />}}
{{% tab header="Local Kubernetes Cluster" lang="en" %}}
<br/>

1. If you are using a local Kubernetes cluster, please use the following method to access the application and verify the deployment status:
    ```shell
    dubboctl dashboard admin
    ```

2. The above command will automatically open the admin console. If it doesn't open in your environment, please visit the following address with your browser:
    http://localhost:38080/admin

3. To continue testing Dubbo services through the triple protocol, execute the following command for port mapping:
    ```shell
    kubectl port-forward <pod-name> 50051:50051
    ```

4. Access the service using curl:
    ```shell
    curl \
        --header "Content-Type: application/json" \
        --data '["Dubbo"]' \
        http://localhost:50051/com.example.demo.dubbo.api.DemoService/sayHello/
    ```

{{% /tab %}}

{{% tab header="Alibaba Cloud ACK" lang="zh-cn" %}}
<br/>

For cloud-hosted Kubernetes clusters, you can verify using the following method. Here, taking Alibaba Cloud ACK Cluster as an example:

ACK ingress-controller access method......
{{% /tab %}}
{{< /tabpane >}}

