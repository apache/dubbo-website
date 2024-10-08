---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/dev/dubbo-pilot/
    - /en/docs3-v2/dubbo-go-pixiu/dev/dubbo-pilot/
    - /en/overview/reference/pixiu/dev/dubbo-pilot/
    - /en/overview/mannual/dubbo-go-pixiu/dev/dubbo-pilot/
description: dubbo-pilot Control Plane Deployment
linkTitle: dubbo-pilot Control Plane Deployment
title: dubbo-pilot Control Plane Deployment
type: docs
weight: 2
---






* [1. Overall Goals](#target)
* [2. Basic Process](#basic)
* [3. Detailed Steps](#detail)
    + [3.1 Environment Requirements](#env)
    + [3.2 Local Deployment of Istio](#native_deploy)
        - [3.2.1 Compilation](#nbuild)
        - [3.2.2 Deployment & Debugging](#ndeploy)
    + [3.3 Container Deployment of Istio](#docker_deploy)
        - [3.3.1 Image Building](#dbuild)
        - [3.3.2 Deployment](#ddeploy)
<h2 id="target">1 Overall Goals</h2>

* Compile the control plane and build images
* Deploy using istioctl in a Kubernetes environment
* How to debug the control plane program



<h2 id="basic">2 Basic Process</h2>
This example will demonstrate how to compile the dubbo-pilot control plane and how to deploy it using istioctl in a Kubernetes environment.

1. Start the control plane locally, and debug dubbo-pilot.
2. Use istioctl for starting and debugging in the k8s environment.


<h2 id="detail">3 Detailed Steps</h2>
<h3 id="env">3.1 Environment Requirements</h3>

* Golang
* Docker
* Minikube/Kind
* Kubectl
* Dlv


<h3 id="native_deploy">3.2 Local Deployment</h3>
<h4 id="nbuild">3.2.1 Compilation</h4>

1. Compile the docker-builder
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

2. Use docker-builder to automatically compile and build the image

Compile istioctl
```
docker-builder --targets istioctl

Compilation completed:

ls  out/linux_amd64/
istioctl  logs  pilot-agent  pilot-discovery
```

Compile dubbo-pilot and push to private image repository
```
tools/docker-builder/docker-builder --targets pilot --hub docker.io/bobtthp --push
```


<h4 id="ndeploy">3.2.2 Local Deployment</h4>

Local start method:
```
./out/linux_amd64/pilot-discovery

Startup log:
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

<h3 id="docker_deploy">3.3 Container Deployment</h3>

<h4 id="dbuild">3.3.1 Image Building</h4>

Build remote debug image

1. Download dlv
```
git clone https://github.com/go-delve/delve.git
make install

which dlv
/root/go/bin/dlv
```

2. Add dlv to Dockerfile in dubbo-go-pixiu/pilot/docker/Dockerfile.pilot:
```
COPY ${TARGETARCH:-amd64}/dlv /usr/local/bin/dlv
```

3. Copy dlv to the image mount directory:
```
cp /root/go/bin/dlv out/linux_amd64/dockerx_build/build.docker.pilot/amd64/
```

4. Build and push the debug image:
```
docker-builder --targets pilot --hub docker.io/bobtthp --push --tag debug
```

5. You can also check the image build status locally:

```
[root~master-1] /tmp/dubbo-go-pixiu/tools/docker-builder> docker images
REPOSITORY                                                        TAG                                               IMAGE ID       CREATED             SIZE
bobtthp/pilot                                                     latest                                            7b1aadd55120   13 minutes ago      262MB
```



<h4 id="ddeploy">3.3.2 Deployment</h4>

1. Deploy using the newly built image:
```
out/linux_amd64/istioctl --set .values.pilot.image=bobtthp/pilot:debug install
```

2. Check the deployment status:
```
[root~master] /tmp/dubbo-go-pixiu/tools/docker-builder> kubectl  get po -n istio-system
NAME                    READY   STATUS    RESTARTS   AGE
istiod-fd5d9f77-2ncjq   1/1     Running   0          18m
```


3. Enter the container for remote debugging:
```
[root~master-1] /tmp/dubbo-go-pixiu> kubectl  exec -it -n istio-system istiod-fd5d9f77-2ncjq bash
kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl exec [POD] -- [COMMAND] instead.
```

4. Start dlv:
```
istio-proxy@istiod-fd5d9f77-2ncjq:/$ dlv --listen=:8015 --headless=true --api-version=2 --log attach `ps -ef |grep pilot-discovery| awk '{print $2}'`
2022-11-04T15:43:14Z error layer=debugger could not create config directory: mkdir /home/istio-proxy/.config: read-only file system
API server listening at: [::]:8015
2022-11-04T15:43:14Z warning layer=rpc Listening for remote connections (connections are not authenticated nor encrypted)
2022-11-04T15:43:14Z info layer=debugger attaching to pid 1
```


5. Expose ports:

```
[root~master-1] /tmp> kubectl  port-forward -n istio-system istiod-fd5d9f77-2ncjq 8015:8015
Forwarding from 127.0.0.1:8015 -> 8015
Forwarding from [::1]:8015 -> 8015
```

6. Remote debugging is now possible.

