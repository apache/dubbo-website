---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/user/deployment/
    - /en/docs3-v2/dubbo-go-pixiu/user/deployment/
    - /en/overview/reference/pixiu/user/deployment/
    - /en/overview/mannual/dubbo-go-pixiu/user/deployment/
description: Deployment operations
linkTitle: Deployment operations
title: Deployment operations
type: docs
weight: 30
---






## 1. Docker Image Deployment

Note: First confirm that Docker is installed and running on your machine.

### 1. Pull the Pixiu image from Docker Hub

`docker pull phial3/dubbo-go-pixiu:latest`

### 2. Prepare Pixiu Configuration as Needed
#### [Detailed Explanation of Pixiu Configuration Parameters](../configurations/)

Prepare the `log.yml` and `conf.yaml` configuration files, and mount these two configuration files to the local directory when starting Pixiu.

### 3. Start Pixiu

**Foreground Start**: Convenient to check if the service information is running normally.
```shell
docker run --name dubbo-go-pixiu -p 8883:8883 \
    -v /yourpath/conf.yaml:/etc/pixiu/conf.yaml \
    -v /yourpath/log.yml:/etc/pixiu/log.yml \
    apache/dubbo-go-pixiu:latest
```
**Background Start**:
```shell
docker run -itd --name dubbo-go-pixiu -p 8883:8883 \
    -v /yourpath/conf.yaml:/etc/pixiu/conf.yaml \
    -v /yourpath/log.yml:/etc/pixiu/log.yml \
    apache/dubbo-go-pixiu:latest
```

> Note:
> 
> (1) The `dubbo-go-pixiu` after the `--name` command is the name of your Pixiu instance, which can be modified as you like.
> 
> (2) The path `/yourpath/**` in the command is the absolute path where you store the Pixiu configuration files locally.

### 4. View Pixiu Instance

`docker ps | grep dubbo-go-pixiu` Running Pixiu instance.

`docker exec -it dubbo-go-pixiu /bin/bash` Enter Pixiu.

### 5. Stop Pixiu

`docker stop dubbo-go-pixiu` Stop Pixiu.

`docker restart dubbo-go-pixiu` Restart Pixiu.


## 2. Source Code Build and Deployment

Note: First confirm that Golang 1.15+ development environment is installed on your machine and that `go mod` is enabled.

### 1. Download Pixiu Source Code Locally
`git clone git@github.com:apache/dubbo-go-pixiu.git`

### 2. Configure Pixiu

#### [Detailed Explanation of Pixiu Configuration Parameters](../configurations/)

Enter the Pixiu source code directory `cd dubbo-go-pixiu/`, and modify the `conf.yaml` and `log.yml` configuration files in the `dubbo-go-pixiu/configs/` directory.

### 3. Compile and Build
Execute `make build` in the Pixiu source code directory `dubbo-go-pixiu/`.
: After the build is complete, an executable file named `dubbo-go-pixiu` will be generated in the current directory.

### 4. Start Service and Run Examples

Run `make run` in the current directory to start the Pixiu service directly based on your current configuration.

[Run Example Reference](../quickstart/)

