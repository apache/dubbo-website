# Service container

The service container is a standalone launcher because the backend service does not require the functionality of a Web container ,such as Tomcat or JBoss. If you insist on using web containers to load service providers, that increase complexity and is waste of resources.

The service container is just a simple Main method and loads a simple Spring container to expose the service.

The content of Service container can be extended, built-in spring, jetty, log4j etc..  This can be expanded with [Container Extension Points](http://dubbo.apache.org/books/dubbo-dev-book-en/impls/container.html). Configure it with the -D parameter in the java command or `dubbo.properties`.

## Container type

### Spring Container

* Automatically load all spring configurations in the `META-INF/spring`.

    ```properties
dubbo.spring.config=classpath*:META-INF/spring/*.xml
```

### Jetty Container

* Start an embedded Jetty for reporting status.
* Configure:
    * `dubbo.jetty.port=8080`: configure jetty start up port
    * `dubbo.jetty.directory=/foo/bar`: static file that can be visited by jetty directly.
    * `dubbo.jetty.page=log,status,system`: configure the displayed page, loading all pages by default


### Log4j Container

* Automatic configuration log4j configuration. At the start of the multi-process, log files automatically by process sub-directory.
* Configure:
    * `dubbo.log4j.file=/foo/bar.log`: configure log file path
    * `dubbo.log4j.level=WARN`: configure log level
    * `dubbo.log4j.subdirectory=20880`: configure log sub directory for multi-process startup and avoiding conflict

## Container startup

load spring by default.

```sh
java com.alibaba.dubbo.container.Main
```

Load the container that passed in by the main method

```sh
java com.alibaba.dubbo.container.Main spring jetty log4j
```

Load the container that passed in by the JVM option.


```sh
java com.alibaba.dubbo.container.Main -Ddubbo.container=spring,jetty,log4j
```

Load the container that passed in by `dubbo.properties` in the classpath.

```
dubbo.container=spring,jetty,log4j
```
