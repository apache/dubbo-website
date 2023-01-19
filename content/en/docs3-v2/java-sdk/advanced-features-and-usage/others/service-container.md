---
type: docs
title: "Custom Service Container"
linkTitle: "Custom service container"
weight: 1
description: "Understand the service custom container type and usage in Dubbo 3"
---

## Feature description
The service container of Dubbo 3 is a standalone startup program, because the background service does not need the functions of web containers such as Tomcat or JBoss. If you insist on using the web container to load the service provider, it will increase complexity and waste resources. Therefore, services usually do not require the features of web containers such as Tomcat/JBoss, and there is no need to use web containers to load services.

The Dubbo3 service container is just a simple Main method and loads a simple Spring container for exposing services.

The loading content of the service container can be extended, and spring, jetty, log4j, etc. are built-in, and can be extended through [container extension point](../../../reference-manual/spi/description/container). The configuration is configured in the -D parameter of the java command or `dubbo.properties`.

## scenes to be used
The web container is mainly used to respond to http requests and static pages. The Dubbo service provider only provides dubbo services externally. It is not suitable to use the web container. As a dubbo service provider alone, it only needs to load a simple spring container through a main method Expose the service.

## How to use
### Spring Container
- Autoload all Spring configurations under the `META-INF/spring` directory.

- Configure the spring configuration loading location:

    ```fallback
    dubbo.spring.config=classpath*:META-INF/spring/*.xml
### Jetty Container
- Starts an embedded Jetty for reporting status.
- configuration:
    - `dubbo.jetty.port=8080`: configure jetty startup port
    - `dubbo.jetty.directory=/foo/bar`: Configure a directory that can be directly accessed through jetty to store static files
    - `dubbo.jetty.page=log,status,system`: configure the displayed pages, all pages are loaded by default

### Log4j Container

- Automatically configure the configuration of log4j. When multiple processes are started, the log files are automatically divided into directories by process.
- configuration:
    - `dubbo.log4j.file=/foo/bar.log`: configure log file path
    - `dubbo.log4j.level=WARN`: configure log level
    - `dubbo.log4j.subdirectory=20880`: Configure the log subdirectory for multi-process startup to avoid conflicts


### Container loading instructions
Only spring is loaded by default
```sh
java org.apache.dubbo.container.Main
```
Pass in the container to be loaded through the main function parameter
```sh
java org.apache.dubbo.container.Main spring jetty log4j
```
Pass in the container to be loaded through the JVM startup parameters

```sh
java org.apache.dubbo.container.Main -Ddubbo.container=spring,jetty,log4j
```
Pass in the container to be loaded through `dubbo.properties` configuration under the classpath
```fallback
dubbo.container=spring,jetty,log4j
```