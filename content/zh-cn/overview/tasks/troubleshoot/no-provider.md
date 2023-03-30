---
aliases:
    - /zh/overview/tasks/troubleshoot/no-provider/
description: 在 Dubbo 抛出地址找不到异常的时候的排查思路
linkTitle: 地址找不到异常
title: 地址找不到异常
type: docs
weight: 2
---



在开发与生产部署过程中，由于 Dubbo 是一个需要基于服务发现功能进行调用的框架，很容易由于各种客观原因出现 `No Provder` 的异常，本文旨在通过体系化的排查思路，让您能够在异常的时候快速定位原因并解决。

```
java.lang.IllegalStateException: Failed to check the status of the service org.apache.dubbo.samples.api.GreetingsService. No provider available for the service org.apache.dubbo.samples.api.GreetingsService from the url consumer://*** to the consumer 30.221.146.226 use dubbo version 3.2.0-beta.4
```

```
Exception in thread "main" org.apache.dubbo.rpc.RpcException: No provider available from registry 127.0.0.1:2181 for service org.apache.dubbo.samples.api.GreetingsService on consumer 30.221.146.226 use dubbo version 3.2.0-beta.4, please check status of providers(disabled, not registered or in blacklist).
```

## 一句话总结
服务找不到时先自查服务是否已经开发完部署了，然后在注册中心中确认是否已经注册，如果注册检查服务端发布情况、如果未注册检查消费端订阅情况，中间任何一步出问题都会导致异常。

## 排查思路全览

![img](/imgs/docs3-v2/java-sdk/troubleshoot/1676536783437-2e3853cf-68bd-43b1-bc66-81dfc1c4585b.jpeg)

## 详细教程
### 1 识别异常的服务以及订阅模式
为了后续正确定位排查的方向，第一步需要先确认有报错的服务名。

![img](/imgs/docs3-v2/java-sdk/troubleshoot/1676616010488-a31451e7-e34e-44b8-ba16-bf6e3f162e33.png)
![img](/imgs/docs3-v2/java-sdk/troubleshoot/1676615807014-5413111b-109e-4976-a25b-d15fe75b314d.png)
![img](/imgs/docs3-v2/java-sdk/troubleshoot/1676616273793-f0bd82b5-bbc6-483f-b945-abe707556b37.png)
![img](/imgs/docs3-v2/java-sdk/troubleshoot/1676616314724-042f1157-cdee-4aaa-b1ac-355c6f1b53e4.png)

如上图所示，常见的地址找不到异常报错中会包括对应的服务名，格式有以下两种。

```
No provider available for the service ${serviceName}

No provider available from registry ${registryAddress} for service ${serviceName}
```

在这个报错日志中可以提取出报错对应的服务名。此处需要注意关注对应的分组与版本号，通常格式如下：

```
${group}/${interfaceName}:${version}
```

除了获取报错对应的服务名外，还需要获取该服务的订阅模式。（默认通常为 `APPLICATION_FIRST` 也即是双订阅模式）

如一下日志所示，可以在 Dubbo 的日志中搜索 `[DUBBO] Succeed Migrated to` 关键字，获取对应的订阅模式。

```
[26/02/23 03:27:07:007 CST] main  INFO migration.MigrationRuleHandler:  [DUBBO] Succeed Migrated to APPLICATION_FIRST mode. Service Name: org.apache.dubbo.samples.api.GreetingsService, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 192.168.31.5
```

当前 Dubbo 共有三种订阅模式：

- FORCE_INTERFACE：仅订阅接口级服务发现模型的数据，这种数据为 2.7.x 及之前的 Dubbo 版本发布的数据模型。
- FORCE_APPLICATION：仅应用级服务发现模型的数据，这种数据为 3.x 版本开始 Dubbo 为云原生大规模部署的应用所设计的数据模型。
- APPLICATION_FIRST：同时订阅接口级服务发现模型和应用级服务发现模型的数据，任何一种模型下有数据都可以调用，默认优先使用应用级服务发现模型的数据。

如果该有问题的服务的订阅模式为 FORCE_INTERFACE，则后续排查中需要检查接口级的地址是否正常发布；如果为 FORCE_APPLICATION 则需要检查应用级地址是否正常发布；如果为 APPLICATION_FIRST 则任意一种地址模型发布都可以。

### 2 查询注册中心是否存在服务
#### 2.1 通过 Dubbo Admin 查询（推荐）
如果您的集群中部署了 Dubbo Admin，可以直接 Dubbo Admin 的控制台中的“服务查询”模块查询该服务的注册情况。
![img](/imgs/docs3-v2/java-sdk/troubleshoot/1676619545350-62c71bca-44c2-4d28-8660-969e2a24dccb.png)
![img](/imgs/docs3-v2/java-sdk/troubleshoot/1676620038647-54bcbafb-1ee1-470f-8e48-8017dd7321dc.png)

如上图所示，请结合前述第 1 步中服务发现模型确认是否能查询到预期的服务端。
如果能查到，请跳转到第 x 步继续排查，如果不能查到请跳转到第 3 步进行排查。

#### 2.2 通过注册中心查询
如果您没有部署 Dubbo Admin，则可以通过注册中心直接查询原始数据。

#### 2.2.1 Nacos 注册中心
1）接口级服务发现
在接口级服务发现模型下，可以直接通过 Nacos 控制台查询服务信息，入口为 "服务管理" - "服务列表"，输入服务名在服务名称一栏搜索即可查询。

注：Nacos 注册中心下，Dubbo 服务名与 Nacos 服务名映射关系为 `providers:${interfaceName}:${version}:${group}`，如 `dev/com.example.DemoService:1.0.0` 映射为 `providers:com.example.DemoService:1.0.0:dev`。

![img](/imgs/docs3-v2/java-sdk/troubleshoot/1677399028899-c36dbb0e-a6a9-42f1-85f8-a746410588ec.png)

如上图所示，请结合前述第 1 步中服务发现模型确认是否能查询到预期的服务端。
如果能查到，请跳转到第 x 步继续排查，如果不能查到请跳转到第 3 步进行排查。

2）应用级服务发现
在应用级服务发现模型下，需要先查询服务映射的信息，入口为 "配置管理" - "配置列表"，Data ID 为接口名，Group 为 `mapping`。

注：查询服务映射时 Data ID 为接口名，不需要填写分组、版本号。

![img](/imgs/docs3-v2/java-sdk/troubleshoot/1677399521159-399758bd-09c9-4365-a2e3-960fadbf93a8.png)

![img](/imgs/docs3-v2/java-sdk/troubleshoot/1677399582939-a92dbc6a-e197-418d-899e-a13cbd958ec2.png)

如上图所示，查询该配置的配置内容中是否存在预期的应用名。
如果能查到，请以该应用名为服务名称继续排查，如果不能查到请跳转到第 3 步进行排查。

在查询到应用名以后，需要进一步查询服务信息，入口为 "服务管理" - "服务列表"，输入服务名在服务名称一栏搜索即可查询。

注：此处的服务名称为上一步查询出的应用名，非接口名。

![img](/imgs/docs3-v2/java-sdk/troubleshoot/1677399702538-0d198aa5-dd40-49ec-a5ad-b3615c4e9d6a.png)

如上图所示，请结合前述第 1 步中服务发现模型确认是否能查询到预期的服务端。
如果能查到，请跳转到第 x 步继续排查，如果不能查到请跳转到第 3 步进行排查。

#### 2.2.2 通过 Zookeeper 注册中心查询

1）接口级服务发现
在接口级服务发现模型下，可以直接通过 Zookeeper 命令行查询服务信息，路径为 `/dubbo/${interfaceName}/providers`。

注：Zookeeper 注册中心中路径上为接口名，分组和版本号在地址参数上，如果您指定了服务的分组或版本号，需要检查每个地址的参数。

```bash
[zk: localhost:2181(CONNECTED) 1] ls /dubbo/org.apache.dubbo.samples.api.GreetingsService/providers
[dubbo%3A%2F%2F30.221.144.195%3A20880%2Forg.apache.dubbo.samples.api.GreetingsService%3Fanyhost%3Dtrue%26application%3Dfirst-dubbo-provider%26background%3Dfalse%26deprecated%3Dfalse%26dubbo%3D2.0.2%26dynamic%3Dtrue%26environment%3Dproduct%26executor-management-mode%3Ddefault%26file-cache%3Dtrue%26generic%3Dfalse%26interface%3Dorg.apache.dubbo.samples.api.GreetingsService%26methods%3DsayHi%26pid%3D37828%26prefer.serialization%3Dfastjson2%2Chessian2%26release%3D3.2.0-beta.6-SNAPSHOT%26service-name-mapping%3Dtrue%26side%3Dprovider%26timestamp%3D1677463548624]
```

如上所示，请结合前述第 1 步中服务发现模型确认是否能查询到预期的服务端。
如果能查到，请跳转到第 x 步继续排查，如果不能查到请跳转到第 3 步进行排查。

2）应用级服务发现
在应用级服务发现模型下，需要先查询服务映射的信息，可以通过 Zookeeper 的命令行工具查询，路径为 `/dubbo/mapping/${interfaceName}`

注：查询服务映射时 interfaceName 为接口名，不需要填写分组、版本号。

```bash
[zk: localhost:2181(CONNECTED) 6] get /dubbo/mapping/org.apache.dubbo.samples.api.GreetingsService
first-dubbo-provider
```

如上所示，查询该配置的配置内容中是否存在预期的应用名。
如果能查到，请以该应用名为服务名称继续排查，如果不能查到请跳转到第 3 步进行排查。

在查询到应用名以后，需要进一步查询服务信息，可以直接通过 Zookeeper 命令行查询服务信息，路径为 `/services/${interfaceName}`。

注：此处的服务名称为上一步查询出的应用名，非接口名。

```bash
[zk: localhost:2181(CONNECTED) 7] ls /services/first-dubbo-provider
[30.221.144.195:20880]
```

如上图所示，请结合前述第 1 步中服务发现模型确认是否能查询到预期的服务端。
如果能查到，请跳转到第 x 步继续排查，如果不能查到请跳转到第 3 步进行排查。

注：如果采用了应用级服务发现模型后检查消费端地址仍找不到则可能是该服务端没有发布对应的服务，请从第 3 步开始排查。

### 3 检查服务端是否已经发布服务
#### 3.1 通过 Dubbo QoS 查询（推荐）
在 Dubbo 应用启动的时候，默认会在本地的 22222 端口发布一个 QoS 服务，可以用于运行时查询节点的状态。通常，如果没有独立配置 `dubbo.application.qos-enable` 或者 `dubbo.application.qos-port` 都可以基于本方法查询服务的信息。

找到预期发布该服务的机器，登陆到其控制台，执行 `telnet 127.0.0.1 22222` 和 `ls`：
```bash
➜ telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>ls
As Provider side:
+------------------------------------------------------------------------------------+---------------------+
|                                Provider Service Name                               |         PUB         |
+------------------------------------------------------------------------------------+---------------------+
|                    org.apache.dubbo.samples.api.GreetingsService                   |nacos-A(Y)/nacos-I(Y)|
+------------------------------------------------------------------------------------+---------------------+
|DubboInternal - first-dubbo-provider/org.apache.dubbo.metadata.MetadataService:1.0.0|                     |
+------------------------------------------------------------------------------------+---------------------+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+

dubbo>

```

如果机器上没有 `telnet` 也可以通过 `cURL` 发起调用，请求地址为 `http://127.0.0.1:22222/ls`：
```bash
➜ curl http://127.0.0.1:22222/ls
As Provider side:
+------------------------------------------------------------------------------------+---------------------+
|                                Provider Service Name                               |         PUB         |
+------------------------------------------------------------------------------------+---------------------+
|                    org.apache.dubbo.samples.api.GreetingsService                   |nacos-A(Y)/nacos-I(Y)|
+------------------------------------------------------------------------------------+---------------------+
|DubboInternal - first-dubbo-provider/org.apache.dubbo.metadata.MetadataService:1.0.0|                     |
+------------------------------------------------------------------------------------+---------------------+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```

注：默认情况下 `ls` 命令仅允许本机调用，如果您无法登陆对应的机器，请参考 3.2 通过日志进行检查。

如上结果所示，请检查在 `As Provider side` 一栏中是否存在您所发布的服务名，如果存在则代表该服务已经发布。
第二列 `PUB` 中的信息为该服务的注册情况，格式为 `${registryName}-${registerType}(${status})`。`registerType` 有两种情况，分别是 `A` 和 `I` 代表着应用级服务发现模型和接口级服务发现模型。可以通过该信息判断服务发布的情况。

如果您无法找到您所发布的服务，请检查以下清单：

1. 该服务是否已经添加到该机器所对应的运行代码中
2. 该服务是否已经正确配置到 Dubbo 环境中，请检查如 `@EnableDubbo`、`@DubboService` 或者 XML 等配置是否正确

如果您找到了您所发布的服务，但是服务状态是 `N`，请检查以下清单：

1. 该服务配置了 `register=false`
2. 是否有外部的命令调用了 `offline`
3. 应用是否启动成功（包括但不限于如 Tomcat、Spring 的启动状态）

如果您找到了您所发布的服务，但是对应的服务发现模型错误，请检查以下清单：

1. 注册中心地址是否配置了 `registry-type=service`
2. 是否配置了应用级的注册模式，如 `dubbo.application.register-type`

如果您找到了您所发布的服务，且对应的服务发现模型下服务状态是 `Y`，请跳转到第 4 步进行排查。

#### 3.2 通过日志检查
如果您由于各种原因无法使用 Dubbo QoS，可以在对应机器的日志上搜索 `[DUBBO] Export dubbo service ${serviceName}` 来检查服务是否已经发布。

```bash
[26/02/23 04:34:41:041 CST] main  INFO config.ServiceConfig:  [DUBBO] Export dubbo service org.apache.dubbo.samples.api.GreetingsService to local registry url : injvm://***, dubbo version: 3.1.7, current host: 192.168.31.5
```

如上所示，则代表着该服务已经发布，如果您无法找到您所发布的服务，请检查以下清单：

1. 该服务是否已经添加到该机器所对应的运行代码中
2. 该服务是否已经正确配置到 Dubbo 环境中，请检查如 `@EnableDubbo`、`@DubboService` 或者 XML 等配置是否正确

在确定了服务已经发布了以后，可以在对应机器的日志上搜索 `[DUBBO] Register dubbo service ${serviceName} to registry ${registryAddress}` 来检查服务是否已经注册。

```bash
[26/02/23 04:34:41:041 CST] main  INFO config.ServiceConfig:  [DUBBO] Register dubbo service org.apache.dubbo.samples.api.GreetingsService url dubbo://*** to registry 127.0.0.1:8848, dubbo version: 3.1.7, current host: 192.168.31.5
```

如上所示，则代表着该服务已经注册，如果您无法找到相关日志，请检查以下清单：

1. 该服务配置了 `register=false`
2. 是否有外部的命令调用了 `offline`
3. 应用是否启动成功（包括但不限于如 Tomcat、Spring 的启动状态）

如果您找到了您所注册的服务，请跳转到第 4 步进行排查。

### 4 检查服务端注册中心配置
#### 4.1 通过 Dubbo Admin 查询（推荐）
注：Dubbo 3.2.0 及以上版本支持

在 Dubbo 应用启动的时候，默认会在本地的 22222 端口发布一个 QoS 服务，可以用于运行时查询节点的状态。通常，如果没有独立配置 `dubbo.application.qos-enable` 或者 `dubbo.application.qos-port` 都可以基于本方法查询服务的信息。

找到预期发布该服务的机器，登陆到其控制台，执行 `telnet 127.0.0.1 22222` 和 `getConfig RegistryConfig`：
```bash
➜ telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>getConfig RegistryConfig
ApplicationModel: Dubbo Application[1.1](first-dubbo-provider)
RegistryConfig: null
<dubbo:registry address="nacos://127.0.0.1:8848" protocol="nacos" port="8848" />

```

如上述结果所示，请检查对应的注册中心配置是否符合预期，如果不符合请修改对应的配置。
如果第 3 步和第 4 步检查均符合预期，则该服务应该可以在第 2 步的注册中心中查询到，如果查询不到请检查注册中心是否工作正常。

注：`getConfig` 命令仅允许本机调用，如果您无法登陆对应的机器，请参考 4.2 通过日志进行检查。

#### 4.2 通过日志检查
如果您由于各种原因无法使用 Dubbo QoS，可以在对应机器的日志上搜索 `[DUBBO] <dubbo:registry address=` 来检查注册中心的配置。

```bash
[27/02/23 09:36:46:046 CST] main  INFO context.ConfigManager:  [DUBBO] <dubbo:registry address="nacos://127.0.0.1:8848" protocol="nacos" port="8848" />, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195
```

如上述结果所示，请检查对应的注册中心配置是否符合预期，如果不符合请修改对应的配置。
如果第 3 步和第 4 步检查均符合预期，则该服务应该可以在第 2 步的注册中心中查询到，如果查询不到请检查注册中心是否工作正常。

### 5 检查服务端网络配置

在服务端发布了服务以后，请检查网络防火墙（iptables、ACL 等）是否允许 Dubbo 端口进行通信，默认 Dubbo 协议端口号为 20880、Triple 协议端口号为 50051。具体端口号可以从第 2 步注册中心中的信息获取。

测试方式：在消费端机器直接 telnet 远程的端口。

### 6 检查消费端是否订阅服务
#### 6.1 通过 Dubbo QoS 查询（推荐）
在 Dubbo 应用启动的时候，默认会在本地的 22222 端口发布一个 QoS 服务，可以用于运行时查询节点的状态。通常，如果没有独立配置 `dubbo.application.qos-enable` 或者 `dubbo.application.qos-port` 都可以基于本方法查询服务的信息。

找到预期发布该服务的机器，登陆到其控制台，执行 `telnet 127.0.0.1 22222` 和 `ls`：
```bash
➜ telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>ls
As Provider side:
+------------------------------------------------------------------------------------+---+
|                                Provider Service Name                               |PUB|
+------------------------------------------------------------------------------------+---+
|DubboInternal - first-dubbo-consumer/org.apache.dubbo.metadata.MetadataService:1.0.0|   |
+------------------------------------------------------------------------------------+---+
As Consumer side:
+---------------------------------------------+---------------------+
|            Consumer Service Name            |         NUM         |
+---------------------------------------------+---------------------+
|org.apache.dubbo.samples.api.GreetingsService|zookeeper-AF(I-1,A-1)|
+---------------------------------------------+---------------------+

dubbo>

```

如果机器上没有 `telnet` 也可以通过 `cURL` 发起调用，请求地址为 `http://127.0.0.1:22222/ls`：
```bash
➜ curl http://127.0.0.1:22222/ls
As Provider side:
+------------------------------------------------------------------------------------+---+
|                                Provider Service Name                               |PUB|
+------------------------------------------------------------------------------------+---+
|DubboInternal - first-dubbo-consumer/org.apache.dubbo.metadata.MetadataService:1.0.0|   |
+------------------------------------------------------------------------------------+---+
As Consumer side:
+---------------------------------------------+---------------------+
|            Consumer Service Name            |         NUM         |
+---------------------------------------------+---------------------+
|org.apache.dubbo.samples.api.GreetingsService|zookeeper-AF(I-1,A-1)|
+---------------------------------------------+---------------------+
```

注：默认情况下 `ls` 命令仅允许本机调用，如果您无法登陆对应的机器，请参考 3.2 通过日志进行检查。

如上结果所示，请检查在 `As Consumer side` 一栏中是否存在您所发布的服务名，如果存在则代表该服务已经发布。
第二列 `NUM` 中的信息为该服务的注册情况，格式为 `${registryName}-${migrationType}(${level}-${count})`。

1. `migrationType` 有三种情况，分别是 `AF`、`FA` 和 `FI` 代表着订阅的模式。`AF` 会优先使用应用级模型下的地址，如果应用级地址找不到会自动使用接口级模型的地址。`FA` 和 `FI` 则会只使用应用级模型的地址和接口级模型的地址。
2. `level` 有两种情况，分别是 `I` 和 `A`，代表着接口级模型下的地址和应用级模型下的地址。

如果您无法找到您所发布的服务，请检查以下清单：

1. 该服务是否已经添加到该机器所对应的运行代码中
2. 该服务是否已经正确配置到 Dubbo 环境中，请检查如 `@EnableDubbo`、`@DubboReference` 或者 XML 等配置是否正确

如果您找到了您所发布的服务，但是服务的地址数是 `0`，请检查以下清单：

1. 注册中心的工作状态
2. 从第 2 步重新排查

如果您找到了您所发布的服务，但是对应的服务发现模型错误，请检查以下清单：

1. 是否配置的订阅迁移规则，如 `dubbo-migration.yaml` 或动态配置，请参考 [应用级服务发现地址迁移规则说明](/zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-rule/)

如果您找到了您所发布的服务，且对应的服务发现模型下地址数非 `0`，请跳转到第 7 步进行排查。

#### 6.2 通过日志检查
如果您由于各种原因无法使用 Dubbo QoS，可以在对应机器的日志上搜索 `[DUBBO] Subscribe: ` 来检查服务是否已经订阅。

```bash
[27/02/23 11:02:05:005 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Subscribe: consumer://***/org.apache.dubbo.samples.api.GreetingsService?***, dubbo version: 3.2.0-beta.6, current host: 30.221.144.195
```

如上所示，则代表着该服务已经发布，如果您无法找到您所发布的服务，请检查以下清单：

1. 该服务是否已经添加到该机器所对应的运行代码中
2. 该服务是否已经正确配置到 Dubbo 环境中，请检查如 `@EnableDubbo`、`@DubboReference` 或者 XML 等配置是否正确

在确定了服务已经订阅了以后，可以在对应机器的日志上搜索 `[DUBBO] Received invokers changed event from registry. ` 来检查服务是否已经推送。

```bash
[27/02/23 11:02:05:005 CST] main  INFO integration.RegistryDirectory:  [DUBBO] Received invokers changed event from registry. Registry type: interface. Service Key: org.apache.dubbo.samples.api.GreetingsService. Urls Size : 1. Invokers Size : 1. Available Size: 1. Available Invokers : 30.221.144.195:20880, dubbo version: 3.2.0-beta.6, current host: 30.221.144.195
```

如上所示，则代表着该服务已经推送，如果您无法找到相关日志，请检查以下清单：

1. 注册中心的工作状态
2. 从第 2 步重新排查

如果您找到了您所注册的服务，请跳转到第 7 步进行排查。

注：推送日志仅 3.2.0 及以上版本支持

### 7 检查消费端注册中心配置
注：本小节排查思路与第 4 步检查服务端注册中心配置类似。
#### 7.1 通过 Dubbo Admin 查询（推荐）
注：Dubbo 3.2.0 及以上版本支持

在 Dubbo 应用启动的时候，默认会在本地的 22222 端口发布一个 QoS 服务，可以用于运行时查询节点的状态。通常，如果没有独立配置 `dubbo.application.qos-enable` 或者 `dubbo.application.qos-port` 都可以基于本方法查询服务的信息。

找到预期发布该服务的机器，登陆到其控制台，执行 `telnet 127.0.0.1 22222` 和 `getConfig RegistryConfig`：
```bash
➜ telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>getConfig RegistryConfig
ApplicationModel: Dubbo Application[1.1](first-dubbo-provider)
RegistryConfig: null
<dubbo:registry address="nacos://127.0.0.1:8848" protocol="nacos" port="8848" />

```

如上述结果所示，请检查对应的注册中心配置是否符合预期，如果不符合请修改对应的配置。
如果第 6 步和第 7 步检查均符合预期，则该服务应该可以在第 2 步的注册中心中查询到，如果查询不到请检查注册中心是否工作正常。

注：`getConfig` 命令仅允许本机调用，如果您无法登陆对应的机器，请参考 4.2 通过日志进行检查。

#### 7.2 通过日志检查
如果您由于各种原因无法使用 Dubbo QoS，可以在对应机器的日志上搜索 `[DUBBO] <dubbo:registry address=` 来检查注册中心的配置。

```bash
[27/02/23 09:36:46:046 CST] main  INFO context.ConfigManager:  [DUBBO] <dubbo:registry address="nacos://127.0.0.1:8848" protocol="nacos" port="8848" />, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195
```

如上述结果所示，请检查对应的注册中心配置是否符合预期，如果不符合请修改对应的配置。
如果第 3 步和第 4 步检查均符合预期，则该服务应该可以在第 2 步的注册中心中查询到，如果查询不到请检查注册中心是否工作正常。

### 8 检查注册中心推送的地址信息
注：本小节中使用的查询命令 Dubbo 3.2.0 及以上版本支持

在 Dubbo 应用启动的时候，默认会在本地的 22222 端口发布一个 QoS 服务，可以用于运行时查询节点的状态。通常，如果没有独立配置 `dubbo.application.qos-enable` 或者 `dubbo.application.qos-port` 都可以基于本方法查询服务的信息。

找到预期发布该服务的机器，登陆到其控制台，执行 `telnet 127.0.0.1 22222` 和 `getAddress ${serviceName}`：

```bash
➜ telnet 127.0.0.1 22222        
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>getAddress org.apache.dubbo.samples.api.GreetingsService
ConsumerModel: org.apache.dubbo.samples.api.GreetingsService@38b2d161

Registry: zookeeper://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=first-dubbo-consumer&dubbo=2.0.2&environment=product&executor-management-mode=default&file-cache=true&interface=org.apache.dubbo.registry.RegistryService&pid=44482&release=3.2.0-beta.6-SNAPSHOT
MigrationStep: APPLICATION_FIRST
Interface-Level: 
All Invokers: 
dubbo://30.221.144.195:20880/org.apache.dubbo.samples.api.GreetingsService?anyhost=true&application=first-dubbo-provider&background=false&check=false&deprecated=false&dubbo=2.0.2&dynamic=true&executor-management-mode=default&file-cache=true&generic=false&interface=org.apache.dubbo.samples.api.GreetingsService&methods=sayHi&prefer.serialization=fastjson2,hessian2&release=3.2.0-beta.6-SNAPSHOT&service-name-mapping=true&side=provider

Valid Invokers: 
dubbo://30.221.144.195:20880/org.apache.dubbo.samples.api.GreetingsService?anyhost=true&application=first-dubbo-provider&background=false&check=false&deprecated=false&dubbo=2.0.2&dynamic=true&executor-management-mode=default&file-cache=true&generic=false&interface=org.apache.dubbo.samples.api.GreetingsService&methods=sayHi&prefer.serialization=fastjson2,hessian2&release=3.2.0-beta.6-SNAPSHOT&service-name-mapping=true&side=provider

Disabled Invokers: 

Application-Level: 
All Invokers: 
dubbo://30.221.144.195:20880/org.apache.dubbo.samples.api.GreetingsService?anyhost=true&application=first-dubbo-consumer&background=false&deprecated=false&dubbo=2.0.2&dubbo.endpoints=[{"port":20880,"protocol":"dubbo"}]&dubbo.metadata-service.url-params={"prefer.serialization":"fastjson2,hessian2","version":"1.0.0","dubbo":"2.0.2","release":"3.2.0-beta.6-SNAPSHOT","side":"provider","port":"20880","protocol":"dubbo"}&dubbo.metadata.revision=e37fc5748b33c325056556550d33dde7&dubbo.metadata.storage-type=local&dynamic=true&environment=product&executor-management-mode=default&file-cache=true&generic=false&interface=org.apache.dubbo.samples.api.GreetingsService&methods=sayHi&pid=44482&prefer.serialization=fastjson2,hessian2&register.ip=30.221.144.195&release=3.2.0-beta.6-SNAPSHOT&service-name-mapping=true&side=consumer&sticky=false&timestamp=1677466879396&unloadClusterRelated=false

Valid Invokers: 
dubbo://30.221.144.195:20880/org.apache.dubbo.samples.api.GreetingsService?anyhost=true&application=first-dubbo-consumer&background=false&deprecated=false&dubbo=2.0.2&dubbo.endpoints=[{"port":20880,"protocol":"dubbo"}]&dubbo.metadata-service.url-params={"prefer.serialization":"fastjson2,hessian2","version":"1.0.0","dubbo":"2.0.2","release":"3.2.0-beta.6-SNAPSHOT","side":"provider","port":"20880","protocol":"dubbo"}&dubbo.metadata.revision=e37fc5748b33c325056556550d33dde7&dubbo.metadata.storage-type=local&dynamic=true&environment=product&executor-management-mode=default&file-cache=true&generic=false&interface=org.apache.dubbo.samples.api.GreetingsService&methods=sayHi&pid=44482&prefer.serialization=fastjson2,hessian2&register.ip=30.221.144.195&release=3.2.0-beta.6-SNAPSHOT&service-name-mapping=true&side=consumer&sticky=false&timestamp=1677466879396&unloadClusterRelated=false

Disabled Invokers: 


dubbo>
```

如上述结果所示，格式如下：

```bash
ConsumerModel: 订阅的信息

Registry: 注册中心地址
MigrationStep: 迁移模型（FORCE_APPLICATION, APPLCATION_FIRST, FORCE_INTERFACE)

Interface-Level: 接口级服务发现模型下地址
All Invokers: 
从注册中心推送的所有地址

Valid Invokers: 
所有可用地址

Disabled Invokers: 
所有被拉黑的地址（通常是主动下线）

Application-Level: 应用级服务发现模型下地址
All Invokers: 
从注册中心推送的所有地址

Valid Invokers: 
所有可用地址

Disabled Invokers: 
所有被拉黑的地址（通常是主动下线）

```

请检查对应迁移模型是否符合预期，默认为 `APPLCATION_FIRST`，如果对应的服务发现模型错误，请检查以下清单：

1. 是否配置的订阅迁移规则，如 `dubbo-migration.yaml` 或动态配置，请参考 [应用级服务发现地址迁移规则说明](/zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-rule/)

如果迁移模型正确，请检查对应模型下的**所有**地址是否符合预期，如果不符合预期，请检查以下清单：

1. 注册中心的工作状态
2. 从第 2 步重新排查

如果注册中心推送的地址符合预期，请检查**可用**地址是否符合预期，如果不符合预期，一般为连接异常导致的自动拉黑，通常在四层网络不通或者机房断网等情况下出现，请跳转到第 9 步进行排查。

如果**可用**地址符合预期，请跳转到第 10 步进行检查。

注：`getAddress` 命令仅允许本机调用。

### 9 检查消费端与服务端网络连通性

在服务端发布了服务以后，请检查网络防火墙（iptables、ACL 等）是否允许 Dubbo 端口进行通信，默认 Dubbo 协议端口号为 20880、Triple 协议端口号为 50051。具体端口号可以从第 2 步注册中心中的信息获取。

测试方式：在消费端机器直接 telnet 远程的端口。

常见异常场景：

1. 服务端消费端多集群部署，但是底层网络未打通
2. 生产与测试共用注册中心，但是测试环境无法调用生产服务（**Dubbo 极其不推荐测试与生产环境混用**）
3. 单机调试，但是网络与大测试网不通
4. 机房断网导致的节点断连
5. 四层网络 ACL 规则未开放 Dubbo 端口访问
6. 网络质量低、服务端负载过高等导致的网络连接质量差

### 10 检查路由信息
注：Dubbo 3.1.0 及以上版本支持
#### 10.1 报错时检查日志

在 Dubbo 出现调用异常的时候，可以在对应机器的日志上搜索 `[DUBBO] No provider available after route for the service` 来检查路由的状态。

```bash
[27/02/23 11:33:16:016 CST] main  WARN cluster.SingleRouterChain:  [DUBBO] No provider available after route for the service org.apache.dubbo.samples.api.GreetingsService from registry 30.221.144.195 on the consumer 30.221.144.195 using the dubbo version 3.2.0-beta.6-SNAPSHOT. Router snapshot is below: 
[ Parent (Input: 1) (Current Node Output: 1) (Chain Node Output: 0) ] Input: 30.221.144.195:20880 -> Chain Node Output: Empty
  [ MockInvokersSelector (Input: 1) (Current Node Output: 1) (Chain Node Output: 0) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 30.221.144.195:20880
    [ StandardMeshRuleRouter (Input: 1) (Current Node Output: 1) (Chain Node Output: 0) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 30.221.144.195:20880
      [ TagStateRouter (Input: 1) (Current Node Output: 0) (Chain Node Output: 0) Router message: Disable Tag Router. Reason: tagRouterRule is invalid or disabled ] Current Node Output: Empty, dubbo version: 3.2.0-beta.6-SNAPSHOT, current host: 30.221.144.195, error code: 2-2. This may be caused by No provider available after route for the service, go to https://dubbo.apache.org/faq/2/2 to find instructions
```

请检查对应的 `Current Node Output: 0` 所在的日志行，通常为该级路由导致的地址为空。

#### 10.2 通过 Dubbo Admin 采样查询

对于线上运行的机器，Dubbo 提供了路由结果动态采样的能力，可以通过 Dubbo QoS 开启。

开启采样的方式：
```bash
dubbo>enableRouterSnapshot com.dubbo.*
OK. Found service count: 1. This will cause performance degradation, please be careful!

dubbo>
```

获取采样结果：
```bash
dubbo>getRecentRouterSnapshot
1658224330156 - Router snapshot service com.dubbo.dubbointegration.BackendService from registry 172.18.111.184 on the consumer 172.18.111.184 using the dubbo version 3.0.9 is below: 
[ Parent (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) ] Input: 172.18.111.187:20880,172.18.111.183:20880 -> Chain Node Output: 172.18.111.187:20880,172.18.111.183:20880
  [ MockInvokersSelector (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
    [ StandardMeshRuleRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
      [ TagStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Disable Tag Router. Reason: tagRouterRule is invalid or disabled ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
        [ ServiceStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
          [ AppStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880

1658224330156 - Router snapshot service com.dubbo.dubbointegration.BackendService from registry 172.18.111.184 on the consumer 172.18.111.184 using the dubbo version 3.0.9 is below: 
[ Parent (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) ] Input: 172.18.111.187:20880,172.18.111.183:20880 -> Chain Node Output: 172.18.111.187:20880,172.18.111.183:20880
  [ MockInvokersSelector (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
    [ StandardMeshRuleRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
      [ TagStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Disable Tag Router. Reason: tagRouterRule is invalid or disabled ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
        [ ServiceStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
          [ AppStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880

···

dubbo>
```

关闭采样的方式：
```bash
dubbo>disableRouterSnapshot com.dubbo.*
OK. Found service count: 1

dubbo>
```

注：采集路由信息会消耗一定的性能，排查完毕后请及时关闭。
参考文档：[路由状态命令](/zh-cn/overview/mannual/java-sdk/reference-manual/qos/router-snapshot/)
