# 主机绑定

## 查找顺序

缺省主机 IP 查找顺序：

* 通过 `LocalHost.getLocalHost()` 获取本机地址。
* 如果是 `127.*` 等 loopback 地址，则扫描各网卡，获取网卡 IP。

## 主机配置

注册的地址如果获取不正确，比如需要注册公网地址，可以：

1. 可以在 `/etc/hosts` 中加入：机器名 公网 IP，比如：
    
    ```
    test1 205.182.23.201
    ```
    
2. 在 `dubbo.xml` 中加入主机地址的配置：

    ```xml
    <dubbo:protocol host="205.182.23.201">
    ```

3. 或在 `dubbo.properties` 中加入主机地址的配置：

    ```properties
   dubbo.protocol.host=205.182.23.201
    ```

## 端口配置

缺省主机端口与协议相关：

协议  | 端口
------------- | -------------
dubbo | 20880
rmi  | 1099
http  | 80
hessian | 80
webservice | 80
memcached | 11211
redis | 6379

可以按照下面的方式配置端口：

1. 在 `dubbo.xml` 中加入主机地址的配置：

    ```xml
    <dubbo:protocol name="dubbo" port="20880">
    ```

2. 或在 `dubbo.properties` 中加入主机地址的配置：

    ```properties
    dubbo.protocol.dubbo.port=20880
    ```