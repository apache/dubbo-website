# 服务容器

服务容器是一个 standalone 的启动程序，因为后台服务不需要 Tomcat 或 JBoss 等 Web 容器的功能，如果硬要用 Web 容器去加载服务提供方，增加复杂性，也浪费资源。

服务容器只是一个简单的 Main 方法，并加载一个简单的 Spring 容器，用于暴露服务。

服务容器的加载内容可以扩展，内置了 spring, jetty, log4j 等加载，可通过[容器扩展点](http://dubbo.apache.org/books/dubbo-dev-book/impls/container.html)进行扩展。配置配在 java 命令的 -D 参数或者 `dubbo.properties` 中。

## 容器类型

### Spring Container

* 自动加载 `META-INF/spring` 目录下的所有 Spring 配置。
* 配置 spring 配置加载位置：

    ```properties
dubbo.spring.config=classpath*:META-INF/spring/*.xml
```

### Jetty Container

* 启动一个内嵌 Jetty，用于汇报状态。
* 配置：
    * `dubbo.jetty.port=8080`：配置 jetty 启动端口
    * `dubbo.jetty.directory=/foo/bar`：配置可通过 jetty 直接访问的目录，用于存放静态文件
    * `dubbo.jetty.page=log,status,system`：配置显示的页面，缺省加载所有页面


### Log4j Container

* 自动配置 log4j 的配置，在多进程启动时，自动给日志文件按进程分目录。
* 配置：
    * `dubbo.log4j.file=/foo/bar.log`：配置日志文件路径
    * `dubbo.log4j.level=WARN`：配置日志级别
    * `dubbo.log4j.subdirectory=20880`：配置日志子目录，用于多进程启动，避免冲突

## 容器启动

缺省只加载 spring

```sh
java com.alibaba.dubbo.container.Main
```

通过 main 函数参数传入要加载的容器

```sh
java com.alibaba.dubbo.container.Main spring jetty log4j
```

通过 JVM 启动参数传入要加载的容器

```sh
java com.alibaba.dubbo.container.Main -Ddubbo.container=spring,jetty,log4j
```

通过 classpath 下的 `dubbo.properties` 配置传入要加载的容器

```
dubbo.container=spring,jetty,log4j
```
