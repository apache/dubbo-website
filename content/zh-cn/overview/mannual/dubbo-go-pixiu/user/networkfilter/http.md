---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/networkfilter/http/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/networkfilter/http/
description: Http NetWorkFilter 介绍
linkTitle: Http NetWorkFilter 介绍
title: Http NetWorkFilter 介绍
type: docs
weight: 10
---






Http NetWorkFilter 用来处理 HTTP 请求，它能接收来自 HTTP Listener 传递的 HTTP 请求，然后将其交给自身维护的 HTTP Filter 链进行处理，最后将响应返回给调用方。