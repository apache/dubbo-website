# Hostname Binding

## Lookup order

Default host IP lookup order：

* Get local address via `LocalHost.getLocalHost()`.
* If it is `127. *` loopback address, then scan the network for host IP

## Host configuration

Registered address if it is not correct, such as the need to register public address, you can do this:

1. edit `/etc/hosts` : add machinename and public ip, such as:

    ```
    test1 205.182.23.201
    ```

2. in `dubbo.xml` add host address configuration:

    ```xml
    <dubbo:protocol host="205.182.23.201">
    ```

3. or config that in `dubbo.properties`:

    ```properties
   dubbo.protocol.host=205.182.23.201
    ```

## Port configuration

The default port and protocol:

Protocol  | Port
------------- | -------------
dubbo | 20880
rmi  | 1099
http  | 80
hessian | 80
webservice | 80
memcached | 11211
redis | 6379

You can configure the port as follows:

1. in `dubbo.xml` add port configuration:

    ```xml
    <dubbo:protocol name="dubbo" port="20880">
    ```

2. or config that in `dubbo.properties`:

    ```properties
    dubbo.protocol.dubbo.port=20880
    ```
