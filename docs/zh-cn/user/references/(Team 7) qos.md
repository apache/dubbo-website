# Telnet (new version) Command Usage 
 dubbo 2.5.8 version reconstructs the telnet module, providing new telnet command support. 

### Port
the port of new version telnet is different from the port of dubbo agreement. The default port is `22222`, which can be changed by modifying configuration file `dubbo.properties` 
 ```
dubbo.application.qos.port=33333
```
 or by modifying the JVM parameter
 ```
-Ddubbo.application.qos.port=33333
```
 ### Safety
 In default situation, dubbo can receive any command sent from the host, which can be changed by modifying the configuration file `dubbo.properties`  
 ```
dubbo.application.qos.accept.foreign.ip=false
```
 or by configuring the JVM parameter
 ```
-Ddubbo.application.qos.accept.foreign.ip=false
```
 to reject command sent from the remote host, allowing only the local server to run the command 
 ### Telnet and http protocal 
 The telnet module supports both http and telnet protocal for usage convenience under most situations. 
 For example, 
 ```
➜  ~ telnet localhost 22222
Trying ::1...
telnet: connect to address ::1: Connection refused
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
  ████████▄  ███    █▄  ▀█████████▄  ▀█████████▄   ▄██████▄
  ███   ▀███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███  ▄███▄▄▄██▀   ▄███▄▄▄██▀  ███    ███
  ███    ███ ███    ███ ▀▀███▀▀▀██▄  ▀▀███▀▀▀██▄  ███    ███
  ███    ███ ███    ███   ███    ██▄   ███    ██▄ ███    ███
  ███   ▄███ ███    ███   ███    ███   ███    ███ ███    ███
  ████████▀  ████████▀  ▄█████████▀  ▄█████████▀   ▀██████▀
 dubbo>ls
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|com.alibaba.dubbo.demo.DemoService| N |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
 dubbo>
```
 ```
➜  ~ curl "localhost:22222/ls?arg1=xxx&arg2=xxxx"
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|com.alibaba.dubbo.demo.DemoService| N |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```
 ### ls List consumers and providers 


 ```
dubbo>ls
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|com.alibaba.dubbo.demo.DemoService| Y |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```

List the services that dubbo provides to providers and consumers

 ### Online service command 
When using delay publishing function(com.alibaba.dubbo.config.AbstractServiceConfig#register set as false), you can use “online” command to online the service 

 ```
//online all services
dubbo>online
OK
 //online part of servies according to regularity.
dubbo>online com.*
OK
```

 Common usage situations:
- Because there is no JIT or the related resources warm-up, when the machine is restarted and the online QPS is relatively high , a large amount of timeout situations may occur. At this time,the problem can be solved by distributing the wholesale service and increasing the traffic gradually.
 - A machine needs to be back online after going offline due to some reasons.
 
 ### Offline service Command 
 Offline command can be used if temporary offline service is needed when bug occurs. 
 
 ```
//offline all service 
dubbo>offline
OK
 //offline some services according to regular rules
dubbo>offline com.*
OK
```
 ### help command
 ```
//list all commands
dubbo>help
 //list the specific use case of a command 
dubbo>help online
+--------------+----------------------------------------------------------------------------------+
| COMMAND NAME | online                                                                           |
+--------------+----------------------------------------------------------------------------------+
|      EXAMPLE | online dubbo                                                                     |
|              | online xx.xx.xxx.service                                                         |
+--------------+----------------------------------------------------------------------------------+
 dubbo>
```
