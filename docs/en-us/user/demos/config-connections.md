# Config connections

## Control connections at server-side
Limit server-side accept to no more than 10 connections

```xml
<dubbo:provider protocol="dubbo" accepts="10" />
```
OR

```xml
<dubbo:protocol name="dubbo" accepts="10" />
```

## Control connections at client-side
Limit client-side creating connection to no more than 10 connections for interface `com.foo.BarService`.
```xml
<dubbo:reference interface="com.foo.BarService" connections="10" />
```

OR

```xml
<dubbo:service interface="com.foo.BarService" connections="10" />
```
**NOTE:** If used default protocol(`dubbo` protocol), and the value of  `connections` attribute is great than 0,then each service reference will has itself connection,else all service which belong to same remote server will share only one connection. In this framework,we called `private` connection or `share` connection.

If `<dubbo:service>` and `<dubbo:reference>` are both configured accepts/connections,`<dubbo:reference>` is preferred,Ref to [Configuration coverage strategy](http://dubbo.apache.org/books/dubbo-user-book-en/demos/config-rule.html).

* : Because connection is connect on Server,so configure at Provider.
