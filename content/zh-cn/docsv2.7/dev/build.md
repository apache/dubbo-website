---
aliases:
    - /zh/docsv2.7/dev/build/
description: 从源码开始构建 Dubbo
linkTitle: 源码构建
title: 源码构建
type: docs
weight: 1
---



## 代码签出

通过以下的这个命令签出最新的项目源码 [^1]：

```sh
git clone https://github.com/apache/dubbo.git
```

## 分支

我们使用 master 作为主干版本的开发，使用分支作为维护版本。可以通过 https://github.com/apache/dubbo/tags 来查看所有版本的标签。

## 构建

Dubbo 使用 [maven](http://maven.apache.org) 作为构建工具。

要求

* Java 1.8 以上的版本
* Maven 2.2.1 或者以上的版本   

构建之前需要配置以下的 `MAVEN_OPTS`

```sh    
export MAVEN_OPTS=-Xmx1024m -XX:MaxPermSize=512m
``` 

使用以下命令做一次构建

```sh
mvn clean install
```

可以通过以下的构建命令来跳过单元测试

```sh
mvn install -Dmaven.test.skip
```

## 构建源代码 jar 包

通过以下命令以构建 Dubbo 的源代码 jar 包

```sh
mvn clean source:jar install -Dmaven.test.skip
```

并且修改你的样例项目中的 dubbo 依赖为本地仓库的 SANPSHOT 版本，然后使用远程 debug 来调试 dubbo。

## IDE 支持

使用以下命令来生成 IDE 的工程

### Intellij Idea

```sh
mvn idea:idea
```

### eclipse

```sh
mvn eclipse:eclipse
```

在 eclipse 中导入

首先，需要在 eclipse 中配置 maven 仓库。通过 Preferences -> Java -> Build Path -> Classpath 定义 `M2_REPO` 的 classpath 变量指向本地的 maven 仓库。 [^2]


也可以通过以下的 maven 命令配置：

```sh
mvn eclipse:configure-workspace -Declipse.workspace=/path/to/the/workspace/
```

[^1]: 也可以直接在 https://github.com/apache/dubbo 上浏览源代码
[^2]: UNIX 下的路径是 ${HOME}/.m2/repository, Windows 下的路径是 C:\Documents and Settings\<user>\.m2\repository
