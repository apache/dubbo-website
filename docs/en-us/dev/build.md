# Source Code Build

## Checkout

checkout the lastest project source code with commands blow:

```sh
git clone https://github.com/apache/incubator-dubbo.git dubbo
```

## Branches

We use `master` as the major branch for new feature development, and use other branches for maintenance. Tags for all versions can be checked via https://github.com/apache/incubator-dubbo/tags.

## Building

Dubbo relies on [maven](http://maven.apache.org) as the building tool.

Requirements:

* Java above 1.5 version
* Maven version 2.2.1 or above    

The following `MAVEN_OPTS`should be configured before building:

```sh    
export MAVEN_OPTS=-Xmx1024m -XX:MaxPermSize=512m
```

build with below command:

```sh
mvn clean install
```

skip testing using below building command:

```sh
mvn install -Dmaven.test.skip
```

## Building jar package of source code 

build Dubbo source code jar package with below command, which can debug Dubbo source code. 

```sh
mvn clean source:jar install -Dmaven.test.skip
```

## IDE support

use below command to generate IDE.

### Intellij Idea

```sh
mvn idea:idea
```

### Eclipse

```sh
mvn eclipse:eclipse
```

Importing into eclipse

Firstly, a maven repository needs to be configured in eclipse. Define `M2_REPO` and point it to the local maven repository by clicking `Preferences -> Java -> Build Path -> Classpath`.


Use the following maven command as well: 

```sh
mvn eclipse:configure-workspace -Declipse.workspace=/path/to/the/workspace/
```

1: view the source code through https://github.com/apache/incubator-dubbo 
2: path under UNIX is ${HOME}/.m2/repository, path under Windows is C:\Documents and Settings\<user>\.m2\repository

