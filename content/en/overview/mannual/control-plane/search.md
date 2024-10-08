---
aliases:
  - /en/overview/reference/admin/search/
  - /en/overview/reference/admin/search/
description: ""
linkTitle: Document Query
title: Admin Service Query
type: docs
weight: 2
working_in_progress: true
---

The Admin supports a visual display of the status of the Dubbo microservice cluster, making it easy for users to globally grasp the distribution of applications, services, and instances in the cluster. Admin can also obtain more detailed information about a specific service through queries:
* Home page cluster dashboard, displaying the overall distribution of cluster applications, services, instances, and overall traffic conditions.
* Supports querying detailed information based on application name, service name (can include version & group), instance IP.
* Supports automatic completion of service name/application name.
* Supports viewing the details of a single service instance.

## Home Dashboard

![admin-dashboard](/imgs/v3/reference/admin/console/dashboard.png)

## Query by Dubbo Service Name

Enter `interface name:version` for precise service query.

![admin-search-service](/imgs/v3/reference/admin/console/admin-search-service.png)

Use the `*` wildcard for fuzzy service queries.

![admin-search-service2](/imgs/v3/reference/admin/console/admin-search-service.png)

## Query by Application Name

Enter the application name to query all services associated with the application (including provided and consumed services).

![admin-search-application](/imgs/v3/reference/admin/console/admin-search-application.png)

## Query by Instance IP Name

Enter the instance IP to query all services associated with the instance (including provided and consumed services).

![admin-search-ip](/imgs/v3/reference/admin/console/admin-search-ip.png)

> Supports filtering services based on port.

## View Service Instance Details

Click `Details` in the service list to view the service details.

![admin-search-service-detail](/imgs/v3/reference/admin/console/admin-search-service-detail.png)

