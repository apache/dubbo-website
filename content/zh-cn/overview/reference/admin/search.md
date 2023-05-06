---
description: ""
linkTitle: 文档查询
title: Admin 服务查询
type: docs
weight: 2
working_in_progress: true
---

Admin 支持可视化的展示 Dubbo 微服务集群的状态，方便用户从全局掌握集群的应用、服务和实例分布，Admin 还可以通过查询的方式了解某一个服务更详细的信息：
* 首页集群大盘，展示集群应用、服务、示例的总体分布，集群总体流量情况等
* 支持根据应用名、服务名(可包含版本&分组)、实例 IP 查询详细信息
* 支持服务名/应用名的自动补全
* 支持查看单条服务实例的详情

## 首页大盘

![admin-dashboard](/imgs/v3/reference/admin/console/dashboard.png)

## 根据 Dubbo 服务名查询

精确输入`接口名:版本` 查询服务

![admin-search-service](/imgs/v3/reference/admin/console/admin-search-service.png)

通过 `*` 通配符模糊查询服务

![admin-search-service2](/imgs/v3/reference/admin/console/admin-search-service.png)

## 根据应用名查询

输入应用名查询某应用关联的所有服务（包含提供和消费的服务）

![admin-search-application](/imgs/v3/reference/admin/console/admin-search-application.png)

## 根据实例 IP 名查询

输入实例 IP 查询某实例关联的所有服务（包含提供和消费的服务）

![admin-search-ip](/imgs/v3/reference/admin/console/admin-search-ip.png)

> 支持基于端口过滤服务

## 查看服务实例详情

在服务列表点击 `详情` 查看服务详细情况

![admin-search-service-detail](/imgs/v3/reference/admin/console/admin-search-service-detail.png)




