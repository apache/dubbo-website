# Maven Plugin Reference

## Start a simple registry server

Start a simple registry server listening on port 9099 [^1]:

```sh
mvn dubbo:registry -Dport=9099 
```

## Generate a service provider demo application

Generate a service provider with the specified interface and version:

```sh
mvn dubbo:create -Dapplication=xxx -Dpackage=com.alibaba.xxx -Dservice=XxxService,YyyService -Dversion=1.0.0 
```

[^1]: Default port is 9090 if the port is not specified