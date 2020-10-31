# Recommended usage

## Configuring the attributes of the consumer side as much as possible on the provider side

the reason is：

* Service providers are more aware of service performance parameters than service users，Such as the timeout time of the call, the reasonable retry times, and so on.
* If  a attribute is configurated in provider side,  not configurated in consumer side,  consumer service will use the attribute in provider side. That is to say, the provider side's attribute can be used as consumer's default value [^1]. Otherwise, consumer service will use consumer-side's attribute，but can't cnotrol the provider service,it's usually unreasonable.

Configuring the attributes of the consumer side as much as possible on the provider side，Make the provider service developer think more about the characteristics and quality of the provider side service. 

Examples：

```xml
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService"
    timeout="300" retry="2" loadbalance="random" actives="0"
/>
 
<dubbo:service interface="com.alibaba.hello.api.WorldService" version="1.0.0" ref="helloService"
    timeout="300" retry="2" loadbalance="random" actives="0" >
    <dubbo:method name="findAllPerson" timeout="10000" retries="9" loadbalance="leastactive" actives="5" />
<dubbo:service/>
```

The consumer side properties that can be configured on provider are：

0. `timeout` Method call timeout
1. `retries` The number of failed retries, default value is 1 [^2]
2. `loadbalance` Load balance algorithm [^3]，default algorithm is random `random`,and polling `roundrobin`、least active [^4] `leastactive`
3. `actives` Consumer side, maximum concurrent call limitation. That is , when the concurrent requests of consumer service reach maximum  configuration,the new call will wait until to catch a timeout error.
  Configurated in  `dubbo:method`(method level configuration) , then the concurrent limitation point at method.Configurated in `dubbo:service`(service level configuration),then the concurrent limitation point at service.

Detailed configuration instructions see：[Dubbo configuration introduction](./references/xml/introduction.md)

## Configuring reasonable provider end properties on provider

```xml
<dubbo:protocol threads="200" /> 
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService"
    executes="200" >
    <dubbo:method name="findAllPerson" executes="50" />
</dubbo:service>
```

The provider side properties that can be configured on provider service are：

0. `threads` service thread pool size
1. `executes` If concurrent requests number that a provider service handled reach the maximum thead pool count , the new call will wait,then the consumer call may catch a timeout error. Configurated in  `dubbo:method`(method level configuration) , then the concurrent limitation point at method.Configurated in `dubbo:service`(service level configuration),then the concurrent limitation point at service.

## Configuration management information

Now we have the owner information and organization infomation to differentiate the sites。It's easy to contact with the service owners when there is a problem, please write at least two persons for backup. The information of owners and organizations can be seen in the registry.

application configuration owners,organizations:

```xml
<dubbo:application owner=”ding.lid,william.liangf” organization=”intl” />
```

service configuration owners:

```xml
<dubbo:service owner=”ding.lid,william.liangf” />
```

reference configuration owners:

```xml
<dubbo:reference owner=”ding.lid,william.liangf” />
```

`dubbo:service`、`dubbo:reference` have no configuration owner, then use the owner configured in `dubbo:application`.

## Set up the Dubbo cache file

Provider service list caching file:

```xml
<dubbo:registry file=”${user.home}/output/dubbo.cache” />
```

Notations:

0. You can modify  the cahe file path of the application according to the needs. Ensure that the file will not be cleared during the release process.
1. If there are more than one application process, do not use the same file path to avoid the content being overwritten.

This file caches the list of the registry and the list of service providers. With this configuration, when the application is restarted , if  the Dubbo registry is not available, the application will read the information from the service provider list from the cache file. That can ensure the availability of the application.

## Monitor configuration

0. Expose service with a fixed port, instead of using a random port


      In this way, when there is a delay in the registry push, the consumer can also call the  original provider service address hrough the cache list and succeed。

1. Use Dragoon's HTTP monitoring item to monitor the service provider on the registry

     The state of Dragoon monitoring service in the registry : http://dubbo-reg1.hst.xyi.cn.alidc.net:8080/status/com.alibaba.morgan.member.MemberService:1.0.5 Ensure that the service exists on the registry .

2. Service provider,use Dragoon's telnet mommand or shell monitor  command

    Monitoring service provider port status ：`echo status | nc -i 1 20880 | grep OK | wc -l`, 20880 is the service port

3. Service consumer side, cast the service to EchoService，and call `$echo()`  to test whether the provider of the service is available 

    eg: `assertEqauls(“OK”, ((EchoService)memberService).$echo(“OK”));`

## Don't use the configuration of dubbo.properties file, suggeset to use  the configuration of XML 

All of the configuration items in the dubbo can be configured in the spring configuration file,and can be configured for a single service.

The Dubbo default value is used if completely not set up , please see the instructions in the article  [Dubbo configuration introduction](./references/xml/introduction.md) .

### The relation between attribute name of dubbo.properties and XML

0. application name `dubbo.application.name`

      ```xml
      <dubbo:application name="myalibaba" >
      ```

1. registry address `dubbo.registry.address`

    ```xml
    <dubbo:registry address="11.22.33.44:9090" >
    ```

2. call timeout `dubbo.service.*.timeout`

    Timeout can be set in multiple configuration items `timeout`,cover from top to bottom （The top one have a higher priority ）[^5]，The coverage strategy of other parameters（`retries`、`loadbalance`、`actives` and so on）is：

    Certain method  Configuration of a provider service

    ```xml 
    <dubbo:service interface="com.alibaba.xxx.XxxService" >
        <dubbo:method name="findPerson" timeout="1000" />
    </dubbo:service>
    ```

    Configuration of a provider specific interface 

    ```xml
    <dubbo:service interface="com.alibaba.xxx.XxxService" timeout="200" />
    ```

3. Service provider protocol `dubbo.service.protocol`、Service monitor port `dubbo.service.server.port`

    ```xml
    <dubbo:protocol name="dubbo" port="20880" />
    ```
    
5. Service thread pool size `dubbo.service.max.thread.threads.size`

    ```xml
    <dubbo:protocol threads="100" />
    ```

6. No provider throws exceptions (Fast-Fail) when the consumer is started ()
  `alibaba.intl.commons.dubbo.service.allow.no.provider`

    ```xml
    <dubbo:reference interface="com.alibaba.xxx.XxxService" check="false" />
    ```

[^1]: Overlay rules for configuration: 1) The method level configuration has a higher priority than the interface level, that is to say,small scope have a high priority 2) Consumer side configuration has a higher priority than provider side, better than global configuration, the last one is the Dubbo hard coded configuration value（[Dubbo configuration introduction](./configuration/properties.md)）
[^2]: With the first call, the call will be called 3 times
[^3]: How to select a service to call when there are multiple Provider services
[^4]: It means that consumer service can call the best provider service, and reduce to call the the slow provider service.
[^5]: `timeout` Can be set in multiple places, configuration items and overlay rules： [Dubbo Schema configuration introduction](./references/xml/introduction.md)