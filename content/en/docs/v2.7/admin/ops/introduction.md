---
type: docs
title: "Dubbo Admin Introductions"
linkTitle: "Introductions"
weight: 2
---

Now version 0.1 has been released, frontend uses Vue and Vuetify as javascript framework and UI framework, backend uses spring framework, you can deploy the whole project with maven or deploy frontend and backend separately.

### Deploy the whole project through maven

* install
```sh
git clone https://github.com/apache/dubbo-admin.git
cd dubbo-admin
mvn clean package
cd dubbo-admin-distribution/target
java -jar dubbo-admin-0.1.jar
```
* visit  
`http://localhost:8080`


### Deploy frontend and backend separately

* frontend deploy  
```sh
cd dubbo-admin-ui 
npm install 
npm run dev 
```
* backend deploy  
```sh
cd dubbo-admin-server
mvn clean package 
cd target
java -jar dubbo-admin-server-0.1.jar
```
* visit  
http://localhost:8081  
* in this mode, any modify of frontend will be hot reloaded


### configuration: [^1]

configuration file location
```sh
dubbo-admin-server/src/main/resources/application.properties
```
configuration:
```properties
admin.config-center=zookeeper://127.0.0.1:2181
admin.registry.address=zookeeper://127.0.0.1:2181
admin.metadata-report.address=zookeeper://127.0.0.1:2181
```

Same as Dubbo 2.7, you can set the addresses of metadata center and registry center on configuration center, in zookeeper, the path and content are as below: 
```properties
# /dubbo/config/dubbo/dubbo.properties
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
```
the addresses in configuration center have higher priority than those in `application.properties`

visit documents on github:

```sh
https://github.com/apache/dubbo-admin
```

[^1]: there's no login module in the current version.
