---
aliases:
    - /en/overview/tasks/traffic-management/accesslog/
    - /en/overview/tasks/traffic-management/accesslog/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/accesslog/
description: ""
linkTitle: Access Log
title: Dynamically Enable Access Log to Track Service Calls
type: docs
weight: 3
---

The access log can effectively record all service request information processed by a machine over a period of time, including request reception time, remote IP, request parameters, response results, etc. Dynamically enabling the access log at runtime is very helpful for problem troubleshooting.

## Before You Start
* [Deploy the Shop Mall Project](../#Deploy-Mall-System)
* Deploy and open [Dubbo Admin](../.././../reference/admin/architecture/)

## Task Details

All user services of the mall are provided by the UserService of the `User` application. Through this task, we enable the access log for one or more machines of the `User` application to observe the overall access situation of user services.

### Dynamically Enable Access Log

Dubbo identifies the access log status through the `accesslog` tag. We can specify the output location of the log file, and we can also enable the access log for a specific machine.

![accesslog.png](/imgs/v3/tasks/accesslog/accesslog1.png)

#### Operation Steps
1. Open the Dubbo Admin console
2. In the left navigation bar, select 【Service Governance】>【Dynamic Configuration】
3. Click "Create", enter the application name `shop-user`, and check "Enable Access Log" (at this time, the access log will be printed together with the normal log).

![Admin Access Log Setting Screenshot](/imgs/v3/tasks/accesslog/accesslog_admin.png)

After visiting the login page again and logging into any machine of the `User` application, you can see the access log in the following format.

```text
[2022-12-30 12:36:31.15900] -> [2022-12-30 12:36:31.16000] 192.168.0.103:60943 -> 192.168.0.103:20884 - org.apache.dubbo.samples.UserService login(java.lang.String,java.lang.String) ["test",""], dubbo version: 3.2.0-beta.4-SNAPSHOT, current host: 192.168.0.103
[2022-12-30 12:36:33.95900] -> [2022-12-30 12:36:33.95900] 192.168.0.103:60943 -> 192.168.0.103:20884 - org.apache.dubbo.samples.UserService getInfo(java.lang.String) ["test"], dubbo version: 3.2.0-beta.4-SNAPSHOT, current host: 192.168.0.103
[2022-12-30 12:36:31.93500] -> [2022-12-30 12:36:34.93600] 192.168.0.103:60943 -> 192.168.0.103:20884 - org.apache.dubbo.samples.UserService getInfo(java.lang.String) ["test"], dubbo version: 3.2.0-beta.4-SNAPSHOT, current host: 192.168.0.103
```

#### Rule Details

**Rule Key:** shop-user

**Rule Body**

```yaml
configVersion: v3.0
enabled: true
configs:
  - side: provider
    parameters:
      accesslog: true
```

The key configuration to enable access logs is as follows:

```yaml
parameters:
  accesslog: true
```

The effective values of accesslog are as follows:
* When `true` or `default`, the access log will be output together with the business logger. You can configure the `dubbo.accesslog` appender in advance to adjust the output location and format of the logs.
* A specific file path like `/home/admin/demo/dubbo-access.log` will print the access log to the specified file.

In the Admin interface, you can also specify whether to enable the access log for a specific machine for precise problem troubleshooting, with the corresponding backend rule as follows:

```yaml
configVersion: v3.0
enabled: true
configs:
  - match
     address:
       oneof:
        - wildcard: "{ip}:*"
    side: provider
    parameters:
      accesslog: true
```

Here, replace `{ip}` with the specific machine address.

