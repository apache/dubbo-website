---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/dev/dubbo-pilot/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/dev/dubbo-pilot/
description: dubbo-pilot Control Plane 部署
linkTitle: dubbo-pilot Control Plane 部署
title: dubbo-pilot Control Plane 部署
type: docs
weight: 2
---






* [1.总体目标](#target)
* [2.基本流程](#basic)
* [3.详细步骤](#detail)
    + [3.1 环境要求](#env)
    + [3.2 istio 本地部署](#native_deploy)
        - [3.2.1 编译](#nbuild)
        - [3.2.2 部署 & debug](#ndeploy)
    + [3.3 istio 容器部署](#docker_deploy)
        - [3.3.1 编译](#dbuild)
        - [3.3.2 部署 & debug](#ddeploy)
<h2 id="target">1 总体目标</h2>

* 控制面编译和镜像构建
* 使用 istioctl 在 kubernetes 环境部署
* 如何对控制面程序 debug



<h2 id="basic">2 基本流程</h2>
这个例子将演示如何在编译 dubbo-pilot 控制平面并在 kubernetes 环境下如何使用 istioctl 进行部署

1. 本地启动控制平面，对 dubbo-pilot 进行启动和 debug
2. 使用 istioctl 在 k8s 环境启动和 debug 


<h2 id="detail">3 详细步骤</h2>
<h3 id="env">3.1 环境要求</h3>

* Golang
* Docker
* Minikube/Kind
* Kubectl
* Dlv


<h3 id="native_deploy">3.2 本地部署</h3>
<h4 id="nbuild">3.2.1 编译</h4>

1. 编译 docker-builder
```
cd dubbo-go-pixiu/tools/docker-builder && go install

docker-builder -h:

Builds Istio docker images

Usage:
   [flags]

Flags:
      --architecures strings   architectures to build (default [linux/amd64])
      --base-version string    base version to use (default "latest")
      --builder string         type of builder to use. options are crane or docker (default "docker")
  -h, --help                   help for this command
      --hub strings            docker hub(s) (default [localhost:5000])
      --istio-version string   istio version to use (default "1.14-dev")
      --kind-load              kind cluster to load into
      --no-cache               disable caching
      --no-clobber             do not allow pushing images that already exist
      --proxy-version string   proxy version to use (default "7ae8e27f274b33dc2f4d83100aea5971ed6698d3")
      --push                   push targets to registry
      --save                   save targets to tar.gz
      --tag strings            docker tag(s) (default [latest])
      --targets strings        targets to build (default [app,app_sidecar_centos_7,app_sidecar_debian_11,app_sidecar_ubuntu_jammy,app_sidecar_ubuntu_xenial,ext-authz,install-cni,istioctl,operator,pilot,proxyv2])
      --variants strings       variants to build (default [default])
      --version                show build version
```

2. 使用 docker-builder 自动编译 && 构建镜像

编译 istioctl
```
docker-builder --targets istioctl

编译完成：

ls  out/linux_amd64/
istioctl  logs  pilot-agent  pilot-discovery
```

编译 dubbo-pilot 并推送到私有镜像仓库
```
tools/docker-builder/docker-builder --targets pilot --hub docker.io/bobtthp --push
```


<h4 id="ndeploy">3.2.2 本地部署</h4>

本地启动方式：
```
./out/linux_amd64/pilot-discovery

启动日志：
2022-09-24T15:31:56.751245Z	info	FLAG: --caCertFile=""
2022-09-24T15:31:56.751277Z	info	FLAG: --clusterAliases="[]"
2022-09-24T15:31:56.751280Z	info	FLAG: --clusterID="Kubernetes"
2022-09-24T15:31:56.751282Z	info	FLAG: --clusterRegistriesNamespace="istio-system"
2022-09-24T15:31:56.751284Z	info	FLAG: --configDir=""
2022-09-24T15:31:56.751286Z	info	FLAG: --ctrlz_address="localhost"
2022-09-24T15:31:56.751289Z	info	FLAG: --ctrlz_port="9876"
2022-09-24T15:31:56.751291Z	info	FLAG: --domain="cluster.local"
...
2022-09-24T15:31:56.753814Z	info	initializing mesh configuration ./etc/istio/config/mesh
```

<h3 id="docker_deploy">3.3 容器部署</h3>

<h4 id="dbuild">3.3.1 镜像构建</h4>

构建远程 debug 镜像

1. 下载 dlv
```
git clone https://github.com/go-delve/delve.git
make install

which dlv
/root/go/bin/dlv
```

2. Dockerfile 增加dlv dubbo-go-pixiu/pilot/docker/Dockerfile.pilot:
```
COPY ${TARGETARCH:-amd64}/dlv /usr/local/bin/dlv
```

3. 拷贝 dlv 至镜像挂载目录中：
```
cp /root/go/bin/dlv out/linux_amd64/dockerx_build/build.docker.pilot/amd64/
```

4. debug 镜像构建并推送:
```
docker-builder --targets pilot --hub docker.io/bobtthp --push --tag debug
```

5. 本地也可以查看镜像构建情况：

```
[root~master-1] /tmp/dubbo-go-pixiu/tools/docker-builder> docker images
REPOSITORY                                                        TAG                                               IMAGE ID       CREATED             SIZE
bobtthp/pilot                                                     latest                                            7b1aadd55120   13 minutes ago      262MB
```



<h4 id="ddeploy">3.3.2 部署</h4>

1. 使用刚构建的镜像部署:
```
out/linux_amd64/istioctl --set .values.pilot.image=bobtthp/pilot:debug install
```

2. 查看部署情况：
```
[root~master] /tmp/dubbo-go-pixiu/tools/docker-builder> kubectl  get po -n istio-system
NAME                    READY   STATUS    RESTARTS   AGE
istiod-fd5d9f77-2ncjq   1/1     Running   0          18m
```


3. 进入容器远程 debug:
```
[root~master-1] /tmp/dubbo-go-pixiu> kubectl  exec -it -n istio-system istiod-fd5d9f77-2ncjq bash
kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl exec [POD] -- [COMMAND] instead.
```

4. 启动 dlv:
```
istio-proxy@istiod-fd5d9f77-2ncjq:/$ dlv --listen=:8015 --headless=true --api-version=2 --log attach `ps -ef |grep pilot-discovery| awk '{print $2}'`
2022-11-04T15:43:14Z error layer=debugger could not create config directory: mkdir /home/istio-proxy/.config: read-only file system
API server listening at: [::]:8015
2022-11-04T15:43:14Z warning layer=rpc Listening for remote connections (connections are not authenticated nor encrypted)
2022-11-04T15:43:14Z info layer=debugger attaching to pid 1
```


5. 对外暴露端口：

```
[root~master-1] /tmp> kubectl  port-forward -n istio-system istiod-fd5d9f77-2ncjq 8015:8015
Forwarding from 127.0.0.1:8015 -> 8015
Forwarding from [::1]:8015 -> 8015
```

6. 可以进行远程调试