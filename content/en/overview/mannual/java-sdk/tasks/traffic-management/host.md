---
aliases:
    - /en/overview/tasks/traffic-management/host/
    - /en/overview/tasks/traffic-management/host/
description: ""
linkTitle: Directing Traffic to a Fixed Machine
title: Point-to-point Traffic Redirection to a Single Machine (e.g., Troubleshooting Issues)
type: docs
weight: 9
---



Automatic address discovery and load balancing mechanisms have many advantages; they make it possible to build scalable distributed microservices systems. However, this dynamic traffic allocation also brings a lot of complexity. A typical issue is that we can no longer predict which provider machine a request will hit. Yet, being able to expect or control requests to a specific provider machine can be very useful in certain scenarios. For instance, when developers troubleshoot complex issues in testing or production environments, reliably reproducing issues on a specific machine can greatly aid in final problem resolution.

## Before You Begin

* [Deploy the Shop Mall Project](../#deploy-the-shop-mall-project)
* Deploy and open [Dubbo Admin](../.././../reference/admin/architecture/)

## Task Details

In this task, we will use the User service as an example, redirecting all calls to the user details method `UserService#getInfo` from the Frontend application to a fixed instance.

![host1.png](/imgs/v3/tasks/host/host1.png)

### Redirect User Details Service Calls to a Fixed Machine

First, determine the actual list of machines that deploy the User application.

```sh
$ kubectl get pods -n dubbo-demo
# list result here
```

Set conditional routing rules for the `getInfo` method call of the `org.apache.dubbo.samples.UserService`, forwarding all calls of this method to a specified machine.

#### Steps
1. Open the Dubbo Admin console.
2. In the left navigation bar, select【Service Governance】>【Conditional Routing】.
3. Click "Create" and enter the service `org.apache.dubbo.samples.UserService`.

![Admin screenshot for specifying machine flow configuration](/imgs/v3/tasks/host/host_admin.png)

Open the machine logs and refresh the page to trigger user detail service calls. You can see that only the specified instance in the rules keeps refreshing the following log:
```text
Received getInfo request......
```

#### Rule Explanation

**Rule Key**: `org.apache.dubbo.samples.UserService`

**Rule Body**
```yaml
configVersion: v3.0
enabled: true
force: false
conditions:
  - 'method=getInfo => host = {your ip address}'
```

Replace `{your ip address}` with the actual deployment address of User.

## Cleanup
To avoid affecting other tasks, delete or disable the conditional routing rules just configured through Admin.

## Other Considerations
In production, redirecting traffic to fixed machines should involve safety assessments to avoid overloading a single machine, which can affect system stability. Additionally, in a cloud-native environment, IP addresses can change more frequently and may become invalid. Be sure to promptly clean up routing rules bound to specific IPs.

