---
title: "Step-by-Step Guide to Deploying Dubbo Applications to Kubernetes – Apache Dubbo Kubernetes Best Practices"
linkTitle: "Step-by-Step Guide to Deploying Dubbo Applications to Kubernetes – Apache Dubbo Kubernetes Best Practices"
tags: ["apachecon2023", "observability", "metrics", "tracing"]
date: 2023-10-07
authors: ["Jiang Heqing"]
description: Step-by-Step Guide to Deploying Dubbo Applications to Kubernetes – Apache Dubbo Kubernetes Best Practices
---

Refining Cloud Native – Dubbo Kubernetes Best Practices

Abstract: This article is compiled from the sharing by Jiang Heqing, a research and development engineer at Alibaba Cloud and a member of the Apache Dubbo PMC. The content is primarily divided into six parts:

- 1. Initializing the project using Dubbo Starter
- 2. Protocol selection for microservices development
- 3. Quickly initializing the environment based on Kubernetes
- 4. Rapidly deploying applications to the Kubernetes cluster
- 5. Best practices for cloud-native microservices observability
- 6. Managing microservice applications in Kubernetes

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img.png)

The image above is a demo inspired by Istio, consisting of four components: Product Page, Reviews, Details, and Ratings, which create an entire microservice architecture that enables simple calls.

## 1. Initializing the Project using Dubbo Starter

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_1.png)

First, let’s introduce the functionality of the Starter. For many developers, creating a new application under the Java ecosystem typically involves using an IDE to create a new project, using a Maven artifact, or based on Spring's Initializer.

The image above shows that we built our project initialization based on Spring's Initializer. By clicking the URL at the top, you can view this page directly, where you need to enter the corresponding group and artifact. Then, select the components you wish to use, such as Nacos and Prometheus.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_2.png)

Additionally, we provide a Dubbo plugin in the IDE. This plugin can be installed as shown in the above image, or if you are using Dubbo configuration in your repository, it will prompt you for direct installation. Once installed, there will be a corresponding initialization project on the right.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_3.png)

The image above is an example, where a Dubbo project is established. You need to select the required component information here, click create, and it will create a brand new project locally for you to develop on this template.

## 2. Protocol Selection for Microservices Development

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_4.png)

We will use the latest Triple protocol, which overall supports compatibility with gRPC, HTTP/1, and HTTP/2.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_5.png)

The main point to share here is that we have capabilities based on curl, meaning tools like POSTMAN and HttpClient are supported.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_6.png)

Now, let’s take a look at our project, which is the one we just created. I will start the application, configure some registry center addresses, and this follows a standard Spring startup process. An interface is defined that returns a "hello" message. With a simple command, I can directly return my hello world result. This significantly aids our testing, as we can directly test the interface once launched locally.

## 3. Quickly Initializing the Environment Based on Kubernetes

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_7.png)

Assuming we have completed the development of the code for the four applications mentioned earlier, next, I want to deploy it to the K8s environment. A very important step before deployment is that we need to initialize the environment first. Components like Nacos, ZK, Skywalking, Zipkin, and Prometheus need to be installed as they are prerequisite dependencies for the application. The installation process for these components is quite complex; how can we simplify this process?

Dubbo provides a command that allows you to pull up all the components on the left in the K8s ecosystem with one click.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_8.png)

Here’s a simple example. Once pulled up, it will assist you in launching all the components. Note that we will continue to use Prometheus later on. The entire address of Nacos and Zookeeper will be given to you directly.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_9.png)

This is another example. By executing a simple command, the local environment will prepare the kubectl configuration, and it will automatically create all the components for you. In this way, we can get all service deployments with one click.

## 4. Rapidly Deploying Applications to the Kubernetes Cluster

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_10.png)

There are three key points in deploying applications: containerization of the application, stateless deployment, and lifecycle alignment.

First, let’s introduce application containerization. To containerize an application, you need to create a Dockerfile, include a JDK package, and add the startup command and script. Additionally, write a Java compilation script to include the resulting jar package. This process is quite complex, so we can use the Jib plugin. This plugin is a Maven plugin; you just need to set up the configuration and specify your Image.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_11.png)

As you can see, I only need to add a corresponding configuration dependency in my pom file, and with one-click Maven compile mode, it will build the image during the Maven packaging process and push it directly to a remote repository. This can all be accomplished with just one command, and after configuration, all future image updates can be automated, without the need to write cumbersome Dockerfiles.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_12.png)

Next, let's discuss stateless deployment. After creating the image, the next step is to run it. We can use the K8s deployment model, which is pulled directly from the K8s website. Once pulled down, we can specify the corresponding application name, image information, etc. This is essential for K8s; we need to configure a demo like this. Of course, cloud vendors will provide a visual interface for you, and the underlying configuration is such a YAML.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_13.png)

This is a simple example. After configuring the deployment, the specified image is assigned. I've also declared a service, which is very important as it will serve as the ingress configuration for the from_end application. Upon applying the image, we can run this environment on K8s.

Here, let me do a simple test. I introduced a curl container, and similarly, we can use the earlier curl command to access the newly deployed container node, and it returns the hello world data.

In summary, through deployment, we can run containers on K8s; additionally, it can provide services externally, which I can invoke using the curl command below.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_14.png)

Finally, let’s discuss lifecycle alignment. Once the overall deployment is completed, multiple Pods will be deployed, which involves batching behaviors. If we divide it into two batches, ensuring that my business is non-disruptive, we will need K8s to assist us with batch processing. K8s only knows that processes are up, so we need to let K8s understand whether the application is in the startup state, ready, and alive. This is the process provided by K8s; how do we match it with Dubbo's process?

The right side of the image displays some port information provided natively by Dubbo, which will be exposed to supply such state information to K8s, allowing the lifecycle to align completely.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_15.png)

The above image is an example. When the application starts, it sleeps for 20 seconds, then configures the corresponding Pro information.

Let’s assume that if it waits 20 seconds, then my application must exceed 20 seconds to start up. Because I modified the code, it needs to be recompiled, using one-click Maven compile mode to push it again. After that, I apply the deployment, and at this point, the Pod state is all not ready, all are zero states.

Since Dubbo has not finished starting after the initial 20 seconds, it remains in not ready state. Once the sleep phase is over, it changes to ready status, and then batch processing can occur, which is the lifecycle alignment process.

This way, K8s knows when the application has started successfully or failed, allowing for better scheduling.

## 5. Best Practices for Cloud-Native Microservices Observability

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_16.png)

Once deployed, we will also involve the observability of the entire application. As our application may be deployed on many nodes, I need to sense the application's state.

The observability system includes the Metrics system and the Tracing system. The Metrics system includes several indicators, such as Google's four environmental indicators: latency, traffic, etc. In relation to Dubbo, it will provide QPS, RT, etc., as best practices for Metrics in this system.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_17.png)

Earlier when initializing the environment for deployment, we mentioned the Prometheus service, which is utilized now. After deploying the Prometheus environment, we just need to configure a few simple lines of Metrics collection information. Then Prometheus will help you gather many Metrics on your nodes and get the panel information on the right, which is also provided by Dubbo, showing Dubbo's state.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_18.png)

The above image is a demonstration example. We add the Metrics collection information to the previous deployment example, and after applying it, we can use the entire Grafana to export. After running for some time, there will be corresponding traffic information, such as QPS, RT, success rate, etc.

Once we obtain these metrics, we can also set up alerts. For instance, if QPS suddenly drops from 100 to 0, or if the success rate suddenly decreases significantly, we need to issue a warning to inform everyone of the current issue. We can rely on Prometheus collection for proactive pushes, which is the alerting process.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_19.png)

Tracing includes built-in tracing and agent injection solutions. Currently, mainstream languages like Go usually use SDK dependencies for an open tracing mechanism. As agent injection under the Go framework is not very complete, Dubbo itself also offers native tracing capability support.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_20.png)

As you can see, you only need to depend on the Dubbo starter in the dependencies section, enable the Tracing capability in the configuration, and initiate an indicator report. 9411 is the backend for our Zipkin.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_21.png)

This is also an example where I only need to configure these settings, and its data will be reported to Zipkin. Just add this dependency.

Similarly, package it using the earlier command to push the image up, and we'll wait a moment. During the push process, we can observe the Zipkin component, which was also pulled up together during the K8s environment initialization, so everything can be done just by prior deployment.

Then we execute a curl command because I need my environment to have traffic. After deployment, let's execute the curl command to fetch; this has essentially completed the backend development and returned real results.

Next, we go to Zipkin to see if we can locate this tracing. First, we map 9411 over, and we can see the corresponding metric information by using a simple query. All of the end-to-end call details will be visible here; this is the complete workflow for the end-to-end integration. Essentially, you only need to include the dependencies and reporting configurations upfront, and everything will be handled behind the scenes, allowing you to see what happened across the entire link.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_22.png)

Additionally, you can also utilize agent-based methods. If we deploy based on K8s, integrating an agent is also very convenient. You can directly inject the entire Java configuration information using an initContainer, allowing you to see the corresponding end-to-end info on Skywalking. Since it's similar to what was previously mentioned, I won't elaborate on its demo project.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_23.png)

Overall, for observability, we can view QPS and RT information through Metrics, and see full link access information through Tracing. Here provides us an excellent solution: we should first monitor the service to better troubleshoot the overall issues, immediately knowing if the application has crashed. For instance, if the availability rate drops to zero at two in the morning, a series of automated mechanisms can inform you of the application issue for quick recovery. This quick recovery could involve rollback strategies or traffic isolation measures executed promptly.

With such a rapid chain from observation to troubleshooting and then to quick recovery, an overall secure and stable system can be constructed in the production environment. Thus, our goal after observation is to ensure the entire application's stability.

## 6. Managing Microservice Applications in Kubernetes

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_24.png)

The benefits brought by K8s include rapid scaling—where I can quickly scale from one Pod to multiple Pods based on K8s. K8s operates from the process of deploying entire Images, meaning once the image is packaged, your environment is fixed, and you only need to expand horizontally.

Rapid horizontal scaling may encounter several bottlenecks. If I want my application to scale quickly, even if the scaling takes several minutes, by the time it completes, the peak workload may have already passed; this introduces the concept of Native Images.

With Native Images, we can achieve efficient serverless horizontal scaling. If we can achieve millisecond-level startup, during traffic peaks, I can scale my Pods many times; when traffic diminishes, they can be quickly terminated, effectively compressing costs.

Another issue is how to determine when to scale. This requires monitoring based on Metrics and analyzing historical data to predict how much traffic there will be at specific points and then scaling up in advance or automating the scaling process.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_25.png)

Let’s say, for instance, if there are issues with my ratings, and I need to isolate the faults and promote an adaptive result.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_26.png)

At this point, you simply need to configure the rule in the image above, and it will return the result. This is the Admin use case, which I won’t delve further into. Also, as mentioned earlier, we are enhancing our Go version's capabilities, which will see more improvements in the future.

![dubbo-kubernetes-best-practice](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_27.png)

Moreover, based on Istio's Service Mesh governance, we selected the Triple protocol for protocol selection, which is completely based on the HTTP standard. Therefore, by utilizing the entire Istio system, once you attach subcard, it helps you manage traffic governance. The prerequisite for all this is that your protocol must be visible to Istio.

For example, if you originally used Dubbo 2’s Dubbo protocol, which is a private TCP protocol, it would be difficult for Istio to recognize your protocol content. However, using the Triple protocol based on HTTP standards allows Istio to know what's in your header, facilitating traffic forwarding. Thus, it fully embraces the Mesh system and supports all Istio governance capabilities.

