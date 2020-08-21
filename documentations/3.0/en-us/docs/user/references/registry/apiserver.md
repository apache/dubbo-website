# Kubernetes API Server Registry

[Kubernetes Service](https://kubernetes.io/docs/concepts/services-networking/service/) 
is an abstraction of the microservice model of Kubernetes. 
Pods deployed on Kubernetes will be automatically classified to Service. 
In this way, the microservice consumers deployed on Kubernetes 
can discover pods by Service Name, and then call them directly. 
This is the way of Service Discovery on Kubernetes native Service.

## Dependency
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-registry-kubernetes</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

Since Kubernetes does not provide the ability as a config center, 
it is necessary to introduce a config center to support 
the service name mapping of Service Introspection.

## Configuration


1. Get API Server host config

    Example:

    ```bash
    kubectl cluster-info | grep 'Kubernetes master' | awk '/http/ {print $NF}'
    ```

    Record the <API Server ip> <API Server port> section in the result.
    ```bash
    https://<API Server ip>:<API Server port>
    ```
    
    Notice: Protocol is needless to specify, 
    dubbo will use `https` protocol as default. 
    You can specify it with `useHttps` property in url parameters.

2. Get API Server CA cert

    Example:
    ```bash
    kubectl get secret default-token-52r8g -o jsonpath="{['data']['ca\.crt']}"
    ```
    
    Record the result which is Base64 encoded.

3. Create ServiceAccount and Get Oauth Token

    The following permissions should be granted to ServiceAccount for 
    Dubbo Kubernetes API server registry:

   - Read and Write permissions to Pods
   - Read permission to Services
   - Read permission to Endpoints

    Example: (Assuming the access scope is under the namespace of dubbo-demo)
    
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

    Fill the yaml file above in `ServiceAccount.yml` and use `kubectl apply -f ServiceAccount.yml` to config to cluster.
    
    Now, you can get Oauth Token with:

    ```bash
    kubectl -n dubbo-demo describe secret $(kubectl -n dubbo-demo get secret | grep dubbo-sa | awk '{print $1}')
    ```

    Record the <authentication_token> section in the result.

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

4. Fill properties file

    In order to enable Kubernetes API Server Registry, the following configurations are required.

    ```bash
    dubbo.registry.address=kubernetes://${your kubernetes api server ip here}:${your kubernetes api server port here}?registry-type=service&duplicate=false&namespace=dubbo-demo&useHttps=true&caCertData=${your API Server CA Token here, Base64 encoded}&oauthToken=${your ServiceAccount token here}
    dubbo.metadata-report.address=${your metadata-report address here, can be the same with config-center}
    dubbo.config-center.address=${your config-center address here}
    ```

## Note

- Kubernetes Service Name should consistent with Dubbo application name.
- Dubbo Kubernetes Registry itself does not strongly rely on the Kubernetes Service port, but if you want to cooperate with Spring Cloud, it is recommended that the port number be consistent with the port number of the interface protocol.
