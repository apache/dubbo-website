---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/deployment/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/deployment/
description: 部署操作
linkTitle: 部署操作
title: 部署操作
type: docs
weight: 30
---






## 一、Docker镜像部署

注：首先确认本机已经安装好docker并且启动

### 1、从docker hub 拉取 pixiu 镜像

`docker pull phial3/dubbo-go-pixiu:latest`

### 2、按照需求准备pixiu配置
#### [pixiu配置参数详解](../configurations/)

准备 `log.yml` 和 `conf.yaml` 配置文件，将这两个配置文件在pixiu启动的时候挂在到本地

### 3、启动 pixiu

**前台启动**：，可方便查看服务信息运行是否正常
```shell
docker run --name dubbo-go-pixiu -p 8883:8883 \
    -v /yourpath/conf.yaml:/etc/pixiu/conf.yaml \
    -v /yourpath/log.yml:/etc/pixiu/log.yml \
    apache/dubbo-go-pixiu:latest
```
**后台启动**：
```shell
docker run -itd --name dubbo-go-pixiu -p 8883:8883 \
    -v /yourpath/conf.yaml:/etc/pixiu/conf.yaml \
    -v /yourpath/log.yml:/etc/pixiu/log.yml \
    apache/dubbo-go-pixiu:latest
```

> 注：
> 
> (1) `--name`命令后面的dubbo-go-pixiu为你的pixiu实例的名称，可自行修改
> 
> (2)命令中的`/yourpath/**`路径为你本地存放pixiu配置文件的绝对路径

### 4、查看 pixiu 实例

`docker ps | grep dubbo-go-pixiu` 正在运行的pixiu实例

`docker exec -it dubbo-go-pixiu /bin/bash` 进入pixiu

### 5、停止pixiu

`docker stop dubbo-go-pixiu` 停止pixiu

`docker restart dubbo-go-pixiu` 重启pixiu


## 二、源码构建部署

注：首先确认本机已经安装好 golang 1.15+ 开发环境，启用`go mod`

### 1、下载 pixiu 源码到本地
`git clone git@github.com:apache/dubbo-go-pixiu.git`

### 2、配置pixiu

#### [pixiu配置参数详解](../configurations/)

进入到pixiu的源码目录`cd dubbo-go-pixiu/`,在`dubbo-go-pixiu/configs/`目录下
修改配置文件`conf.yaml`和`log.yml`

### 3、编译构建
在pixiu的源码目录`dubbo-go-pixiu/`下执行`make build`
: 构建完成会在当前目录下生成名为`dubbo-go-pixiu`的可执行文件

### 4、启动服务与运行示例

在当前目录下`make run` 可根据你当前的配置直接启动pixiu服务

[运行示例参考](../quickstart/)