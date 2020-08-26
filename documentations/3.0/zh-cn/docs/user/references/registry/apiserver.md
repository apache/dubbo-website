# Kubernetes API Server 注册中心

[Kubernetes Service](https://kubernetes.io/docs/concepts/services-networking/service/) 
是 Kubernetes 平台对微服务模型的抽象，
部署在 Kubernetes 平台之上的 POD 实例可被自动归类到虚拟的 Service 下。
这样，部署在 Kubernetes 平台上的微服务消费者可实现对 Service Name 的直接依赖或调用，
由 Kubernetes 平台实现流量从 Service 到 POD 节点的分发。

## 依赖
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-registry-kubernetes</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

由于 Kubernetes 不提供作为元数据中心的配置，
如果使用自动服务名与接口的映射，需要另外引入元数据中心以支持服务自省的服务发现功能。

## 配置

1. 获取 API Server 地址信息

    参考命令：
    ```bash
    kubectl cluster-info | grep 'Kubernetes master' | awk '/http/ {print $NF}'
    ```
    
    记录结果中的 <API Server ip> <API Server port>
    ```bash
    https://<API Server ip>:<API Server port>
    ```

    注：配置文件中无需配置网络协议信息，默认使用 HTTPS 协议，
    如需使用 HTTP 协议可通过参数进行配置。

2. 获取 API Server 证书信息

    参考命令：
    ```bash
    kubectl get secret default-token-52r8g -o jsonpath="{['data']['ca\.crt']}"
    ```

    记录结果中的 Base64 字符串信息。

3. 创建 ServiceAccount 并获取 Token

    API Server 注册中心对应的 ServiceAccount 需要拥有以下权限才可以正常工作：

   - Pods 读写权限
   - Services 读权限
   - Endpoints 读权限

    参考配置：（假设访问范围在 dubbo-demo 的命名空间下）
    
    ```yaml
    apiVersion: v1
    kind: Namespace
    metadata:
      name: dubbo-demo
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      namespace: dubbo-demo
      name: dubbo-role
    rules:
    - apiGroups: [""]
      resources: ["pods"]
      verbs: ["get", "watch", "list", "update", "patch"]
    - apiGroups: [""] 
      resources: ["services", "endpoints"]
      verbs: ["get", "watch", "list"]
    ---
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: dubbo-sa
      namespace: dubbo-demo
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: dubbo-sa-bind
      namespace: dubbo-demo
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: dubbo-role
    subjects:
    - kind: ServiceAccount
      name: dubbo-sa
    ```

    将上述配置写入到 `ServiceAccount.yml` 后使用 `kubectl apply -f ServiceAccount.yml` 进行配置。获取 Token 方法如下：
    
    ```bash
    kubectl -n dubbo-demo describe secret $(kubectl -n dubbo-demo get secret | grep dubbo-sa | awk '{print $1}')
    ```
    
    记录输出内容中 <authentication_token> 部分。
    
    ```bash
    Name: dubbo-sa-token-2g5c6
    Namespace:    dubbo-demo
    Labels:       <none>
    Annotations:  kubernetes.io/service-account.name: dubbo-sa
  kubernetes.io/service-account.uid: 963e68f3-738d-4f10-bf32-92a3fbf44774
    
    Type:  kubernetes.io/service-account-token
    
    Data
    ====
    ca.crt:     1025 bytes
    namespace:  10 bytes
    token:      <authentication_token>
    ```

4. 配置信息

    要启用 Kubernetes API Server 注册中心需要对配置文件进行以下配置：
    
    ```bash
    dubbo.registry.address=kubernetes://${your kubernetes api server ip here}:${your kubernetes api server port here}?registry-type=service&duplicate=false&namespace=dubbo-demo&useHttps=true&caCertData=${your API Server CA Token here, Base64 encoded}&oauthToken=${your ServiceAccount token here}
    ```


## 备注

- Kubernetes Service 的应用名需要与对应的 Dubbo 的应用名一致
- Dubbo Kubernetes 注册中心本身不强依赖 Kubernetes Service 端口号，但如果要打通 Spring Cloud 对接，建议端口号与业务接口的端口号一致。
