# DNS 注册中心

DNS 注册中心依赖 DNS 进行服务发现，
通过 DNS 的解析对服务端节点基于服务自省模型进行应用级服务发现。
目前 DNS 注册中心是针对 Kubernetes Headless Service 进行开发，理论上支持所有 DNS 服务。

## 依赖

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-registry-dns</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

由于 DNS 不提供作为元数据中心的配置，如果使用自动服务名与接口的映射，需要另外引入元数据中心以支持服务自省的服务发现功能。

## 配置

要启用 DNS 注册中心需要对配置文件进行以下示例配置：

```bash
dubbo.application.metadataServicePort=20885
dubbo.registry.address=dns://${your kube dns ip here}:53?registry-type=service&duplicate=false&addressSuffix=.dubbo-demo.svc.cluster.local.
```

配置项说明：

- `dubbo.application.metadataServicePort` 服务自省模型端口，使用 DNS 注册中心的所有应用均需要配置，且端口号必须一致
- `dubbo.registry.address` 注册中心地址信息，具体参数见后文


注册中心配置说明：


| 配置名 | 是否必填 | 默认值 | 说明 |
| :---: | :---: | :---: | :---: |
| protocol | 是 | dns | 协议 |
| ip | 是 | - | DNS 服务器 IP |
| port | 是 | 53 | DNS 端口（UDP 协议） |
| registry-type | 是 | service | 启动服务自省模型 |
| duplicate | 是 | false | 开始接口级注册（DNS 注册中心暂不支持） |
| addressPrefix | 否 | - | 域名前缀 |
| addressSuffix | 否 | .dubbo-demo.svc.cluster.local. | 域名后缀 |
| maxQueriesPerResolve | 否 | 10 | DNS 查询并发数 |
| pollingCycle | 否 | 5000 | DNS 轮询时间（单位：毫秒） |
| echoPollingCycle | 否 | 60000 | 回声测试周期（单位：毫秒） |
| scheduledThreadPoolSize | 否 | 1 | 轮询线程池大小 |

## 备注

- Kubernetes Service 的应用名需要与对应的 Dubbo 的应用名一致。
- Dubbo Kubernetes 注册中心本身不强依赖 Kubernetes Service 端口号，但如果要打通 Spring Cloud 对接，建议端口号与业务接口的端口号一致。
