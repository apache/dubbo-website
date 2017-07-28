缺省主机IP查找顺序：

* 通过LocalHost.getLocalHost()获取本机地址。
* 如果是127.*等loopback地址，则扫描各网卡，获取网卡IP。

注册的地址如果获取不正确，比如需要注册公网地址，可以：

1. 可以在/etc/hosts中加入：机器名 公网IP，比如：
    
    ```
    test1 205.182.23.201
    ```
    
2. 在dubbo.xml中加入主机地址的配置：

    ```xml
    <dubbo:protocol host="http://10.20.160.198/wiki/display/dubbo/205.182.23.201">
    ```

3. 或在dubbo.properties中加入主机地址的配置：

    ```
    dubbo.protocol.host=205.182.23.201
    ```
    
缺省主机端口与协议相关：

* dubbo: 20880
* rmi: 1099
* http: 80
* hessian: 80
* webservice: 80
* memcached: 11211
* redis: 6379

主机端口配置：

1. 在dubbo.xml中加入主机地址的配置：

    ```xml
    <dubbo:protocol name="dubbo" port="20880">
    ```

2. 或在dubbo.properties中加入主机地址的配置：

    ```
    dubbo.protocol.dubbo.port=20880
    ```