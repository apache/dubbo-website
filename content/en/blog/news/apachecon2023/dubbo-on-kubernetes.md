---
title: "手把手教你部署Dubbo应用到Kubernetes – Apache Dubbo Kubernetes 最佳实践"
linkTitle: "手把手教你部署Dubbo应用到Kubernetes – Apache Dubbo Kubernetes 最佳实践"
tags: ["apachecon2023", "observability", "metrics", "tracing"]
date: 2023-10-07
authors: ["江河清"]
description: 手把手教你部署Dubbo应用到Kubernetes – Apache Dubbo Kubernetes 最佳实践
---

精进云原生 – Dubbo Kubernetes 最佳实践

摘要：本文整理自阿里云研发工程师、Apache Dubbo PMC江河清的分享。本篇内容主要分为六个部分：

- 一、使用 Dubbo Starter 初始化项目
- 二、开发微服务之协议选型
- 三、基于 Kubernetes 快速初始化环境
- 四、快速部署应用到 Kubernetes 集群中
- 五、云原生微服务可观测最佳实践
- 六、在 Kubernetes 中管理微服务应用

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img.png)

上图是从 Istio 借鉴的一个demo，它包含了四个组件，分别是Product Page、Reviews、Details、Ratings，它就是一个全链路的串联，实现了整体的微服务架构，它的功能可以实现我们简单的调用。

## 一、使用 Dubbo Starter 初始化项目

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_1.png)

首先介绍一下Starter的功能。对于很多开发来说，在Java体系下创建出新的应用，无外乎就是用IDE创建一个新的项目，或者用maven的artifact，或者基于Spring的Initializer。

上图使我们基于Spring的Initializer建立了我们自己的初始化项目的工程。我们点击最上面的网址就能直接看到这个页面了，你需要输入对应的group和artifact。然后选择你希望用到的组件，比如Nacos、Prometheus的组件等等。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_2.png)

除此之外，我们在IDE里提供了一个Dubbo的插件。这个插件可以通过上图的方式进行安装，或者如果你的仓库里已经用到了Dubbo的配置，它会提示你可以直接安装。安装完成后在右边就会有一个对应的初始化的项目了。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_3.png)

上图是一个示例，它在这里建立了一个Dubbo的项目，然后你需要在这里选中所需要的组件信息，最后点击创建，之后它就会帮你在本地直接创建出一个全新的项目，然后你就可以在这个模版上开发了。

## 二、开发微服务之协议选型

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_4.png)

我们会用到最新的Triple协议，它整体支持兼容gRPC、HTTP/1、HTTP/2。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_5.png)

这里主要想和大家分享的点是，我们基于curl访问的能力，比如POSTMAN、HttpClient都是支持的。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_6.png)

下面来看一下我们的项目，这是刚才建立的一个项目，我现在把应用启动起来，配置一些注册中心的地址，这就是一个标准的Spring的启动的流程。这里定义了一个接口，这个接口返回了一个"hello"的内容信息。然后我用一个简单的命令，就可以直接返回我的hello world的结果了。这样对我们本身的测试来说有很大的帮助，也就是本地启动之后，就可以直接测试接口。

## 三、基于 Kubernetes 快速初始化环境

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_7.png)

假设我们已经把前面四个应用的代码全部开发完成了，接下来我要把它部署到K8s环境上。部署之前有一个非常重要的步骤，需要先初始化环境。比如Nacos、ZK、Skywalking、Zipkin、Prometheus等组件，我们都需要将它们安装上去，因为它们是应用前置依赖的各种组件。这些组件的安装流程都很复杂，那么我们如何简化这个流程呢？

Dubbo提供了一个命令，这个命令可以一键帮你在K8s体系下拉起上图左边的所有组件。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_8.png)

这里有一个简单的例子，拉起来之后，它会把所有的组件都会帮你拉起来。这里埋一个点，这里的Prometheus我们后面还会继续使用。整个Nacos的地址，Zookeeper的地址都会直接提供给你。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_9.png)

这也是一个的例子。执行一个简单的命令，然后本地会把kubectl的配置都准备好，它就会自动的帮你把组件都创建起来。也就是我们一键就可以获取到所有service的部署。

## 四、快速部署应用到 Kubernetes 集群中

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_10.png)

部署应用有三个重要的点，分别是应用容器化、无状态部署、生命周期对齐。

首先介绍一下应用容器化。想要将应用容器化，首先需要建一个dockerfile，引入一个jdk的包，把启动命令和启动脚本拉进去。然后还要写一个Java的编译的脚本，把Java编译的jar包结果拉进去。这个过程非常复杂，所以我们可以用一下Jib的插件。这个插件是maven的一个plugin，我只需要把这些配进去，指定成我的Image就足够了。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_11.png)

可以看到，我只需要把我的pom里添加一个对应的配置项依赖，通过一键maven的编译模式，它就可以在maven打包的过程中帮你构建完镜像，然后直接推送到远端仓库。这一切都只需要这一个命令就可以完成，而且一次性配置之后，未来你所有的镜像更新都可以自动化的去做，不需要再去写繁琐的dockerfile。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_12.png)

其次介绍一下无状态部署。刚才我们把镜像打出来了，这只是第一步，紧接着我们要让镜像run起来。我们可以基于K8s的deployment的模式，它是从K8s的官网上直接拉下来的。拉下来之后我们可以指定对应的应用名、镜像信息等等，这是K8s无法绕过去的，相对于说它需要配置这样的一个demo，当然也会有云厂商平台提供一个可视化的界面给你，它的底层配置的就是这样的一个yarml。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_13.png)

这是一个简单的例子，把deployment配置完之后，指定了刚才的镜像。同时我声明了一个service，这个service非常重要，它后面会作为from_end应用入口的配置，但它是一个Ingress网关。可以看到apply镜像之后，我们就可以在K8s体系上把这个环境run起来了。

这里做一个简单的测试，我引入一个curl的容器，同样我们可以用刚才curl的命令访问我新部署好的容器节点，可以看到它返回了hello world的数据信息。

综上，我们通过deployment的部署，可以在K8s上把容器run起来，同时它还可以对外提供服务，对外提供的服务我可以通过下面curl的命令进行调用。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_14.png)

最后介绍一下生命周期对齐。整体部署上了之后，大家都会进行多Pod部署，所以就会涉及到分批的行为。如果现在分了两批，且我希望我的业务中间是不中断的，这个时候就需要让K8s帮我们进行分批处理。因为K8s只知道进程起来了，所以我们需要让K8s感知到这个应用当前的状态是否startup了。然后还需要让K8s知道是否ready，以及是否存活。这是K8s提供的流程，那么怎么和Dubbo的流程相匹配呢？

上图右侧有一些Dubbo原生提供的ports信息，我们会对外发布这样的Dubbo的状态信息，可以让你和K8s的生命周期完整的对齐。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_15.png)

上图是一个例子。在整个应用启动的时候，这里sleep了20秒，然后配置了对应的Pro信息。

我们简单推测一下，我在前面设置了等待20秒，那么我的应用肯定要超过20秒才能起来。因为修改了代码，所以这里需要重新编译一下，用一键maven的编译模式直接推上去。接下来要把deployment apply进去，进去之后Pod的状态全都是not ready的，都是零的状态。

因为前面sleep了20秒的时候，Dubbo还没启动完，所以都是not ready的状态。我们等sleep的阶段过了，它就会变成ready的状态，然后再进行分批这就是生命周期对齐的过程。

所以K8s知道应用什么时候启动成功了，什么时候启动失败了，才能进行更好的调度。

## 五、云原生微服务可观测最佳实践

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_16.png)

部署上去之后，我们还会涉及到整个应用的可观测。因为我们的应用可能部署了非常多节点，我需要感知应用的状态。

可观测体系包括Metrics体系和Tracing体系。Metrics体系包括几个指标，比如谷歌的四个环境指标，延迟、流量等等。对应到Dubbo，会提供QPS、RT等等指标，它都是在这样体系下的Metrics的最佳实践。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_17.png)

前面在部署初始化环境的时候，提了Prometheus的服务，现在就有用了。当我把Prometheus环境部署完之后，我们只需配置几行简单的Metrics采集信息。然后Prometheus就会帮你在你的节点上面采集很多的Metrics信息，然后得到右边的panel信息，这个panel也是Dubbo官方提供的，可以直接看到Dubbo的状态信息。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_18.png)

上面是一个演示的例子。我们在前面的deployment的例子上加上Metrics的采集信息，然后把它apply进去之后，我们就可以用整个Grafana导出过来。跑了一段时间之后，就会有对应的流量信息，比如QPS信息、RT信息、成功率等等。

得到这些指标后，我们还可以做一个告警。比如QPS从100突然跌到了0，或者成功率突然跌了很多，这种情况我们需要做一个警示，让大家知道当前发生的问题。我们可以基于Prometheus采集，做一个主动的推送，这就是告警的过程。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_19.png)

Tracing包括内置的Tracing、agent注入的方案。目前主流的Go语言和其他语言大多都会用sdk依赖一个open去做一个Tracing。因为Go构体系下的agent注入也不太完善，Dubbo本身也提供了默认Tracing的能力支持。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_20.png)

大家可以看到，在这里你只需要依赖dependency里面加上Dubbo的starter，配置项里把Tracing能力打开，开启一个指标的上报，9411是我们Zipkin的一个后端。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_21.png)

这也是一个例子，我只需要配置这些配置，它的数据就会报到Zipkin上去，这里的dependency直接加上。

同样的，用刚才的命令进行打包，把镜像推送上去，然后我们等待一下。推送的过程中可以看一下Zipkin这个组件，它也是在最前面我们在K8s初始化环境的时候一起拉起的，所以这一切你只需要在前面一次性部署的时候就可以拥有了。

然后我们简单的执行一个curl命令，因为我需要让我的环境有流量。部署完之后，用curl命令还是执行一下我们的获取，这个其实已经把后端开发完了，它返回了真实的结果。

接下来我们去Zipkin上看看能不能找到这条Tracing。首先把9411映射过来，我们可以看到curry一下，这里就会有对应的指标信息。整个全链路的调用信息这里都可以看到，这就是全链路的接入的流程。相当于你只需要把前面的dependency加上，把上报的配置加上，之后的一切我都会帮你在后面完成以及上报。你看到对应的结果，就可以知道全链路上发生了什么事情。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_22.png)

除此之外，还可以基于agent的方式。如果我们基于K8s部署，我们接入一个agent也是非常方便的。你可以基于一个initContainer把整个Java的配置项信息直接注入进去，这样在skywalking上就可以看到一个对应的全链路的信息。因为和前面是类似的，这里就不再赘述它的demo的工程了。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_23.png)

对于整个可观测来说，我们可以通过Metrics看到QPS、RT等信息，通过Tracing看到全链路的访问信息。这里提供给我们一个很好的方案，就是我们要先去做服务的观测，基于服务的观测更好的排查整体的问题，第一时间知道应用挂没挂。比如半夜两点，它的可用率跌到零了。这个时候可以通过一系列的自动化机制告诉你应用出了问题，快速的进行恢复。这里的快速恢复可以使用回滚，将流量隔离的方案他都可以快速的执行。

基于这样快速的从观测到排查，再到快速恢复的链条，可以构建整个生产环境下的安全稳定的体系。所以我们观测完之后的目标就是保证整个应用的稳定。

## 六、在 Kubernetes 中管理微服务应用

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_24.png)

K8s给我们带来的收益包括快速扩缩容，即我可以很快的基于K8s从一个Pod变成多个Pod。因为K8s是基于整个Image的部署的流程，当镜像打包出来后，你的环境就是固定的，只需要去横向的扩容即可。

横向的快速扩容也会涉及到几个瓶颈的点，如果我需要让我的应用能够快速扩容，比如我的应用提起来就要几十分钟，这种情况即使快速扩容了，等扩容完之后你的业务峰值也过去了，这里就会引入到Native Image。

基于Native Image，我们可以很好的实现整个Serverless的横向的扩容。如果可以实现毫秒级的启动，我可以在流量来的波峰，直接让我的Pod横向扩容好几倍，当它的流量下去的时候就直接下掉，这样就实现了成本的压缩。

另外还有一个问题是怎么知道什么时候要扩容？这就需要基于Metrics的观测，基于一些历史数据的分析，知道在某个时间点会有多少的流量，然后提前扩容，或者做一个自动化的扩容。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_25.png)

这里我举一个简单的例子，比如我的rating上出了一些问题，我需要把它的故障摘除掉，返回一个磨合的结果。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_26.png)

这个时候你只需要在上面去配置一个上图的规则，它就会返回。这就是Admin的使用流程，这里就不再展开了，还有刚刚提到的我们在做Go版本的重构能力，后面也都会有更好的建设。

![dubbo-kubernetes-最佳实践](/imgs/blog/2023/8/apachecon-scripts/kubernetes/img_27.png)

除此之外，基于 istio的Service Mesh治理，我们前面协议选型的时候选了Triple协议，它完全是based on HTTP标准的。因此我们使用istio的整个体系之后，你只需要挂上subcard它就会帮你去做流量治理。这一切的前提是你的协议一定是istio可见的。

比如你原来用是Dubbo 2的Dubbo的协议，它是一个私有的tcp协议，对于istio来说它很难分辨你的协议内容。如果你用了Triple协议，我们可以基于HTTP标准，你就可以知道你的header里有什么东西，可以去做一个流量的转发。所以它完全拥抱Mesh的体系，可以支持我们所有istio的治理能力。
