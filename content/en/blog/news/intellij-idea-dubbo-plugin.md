---
title: "IntelliJ IDEA❤️Apache Dubbo, Official IDEA Plugin Released!"
linkTitle: "IntelliJ IDEA❤️Apache Dubbo, Official IDEA Plugin Released!"
date: 2023-10-23
tags: ["News"]
authors: Dubbo Community
description: >
   IntelliJ IDEA loves Apache Dubbo. The official IDEA has released the Apache Dubbo in Spring Framework plugin, supporting Dubbo scaffolding and project template creation.
---

The most popular Java Integrated Development Environment, IntelliJ IDEA, has teamed up with the open-source microservices framework Apache Dubbo community, bringing great news to microservices developers. Alongside IntelliJ IDEA version 2023.2, **Jetbrains officially released a new plugin - Apache Dubbo in Spring Framework**.

![IntelliJ IDEA loves️ Apache Dubbo](/imgs/blog/2023/10/plugin/img_6.png)

This plugin helps developers address Dubbo project initialization issues and facilitates the identification of Dubbo services and their dependencies during the project development process, making microservice development based on Apache Dubbo very simple.

## Install Plugin
Before installing the Apache Dubbo plugin, please ensure you are using IntelliJ IDEA version 2023.2 or above.
![image.png](/imgs/blog/2023/10/plugin/img.png)

There are two ways to install the Apache Dubbo plugin.

### Method One
Open the plugin's official page [Apache Dubbo in Spring Framework](https://plugins.jetbrains.com/plugin/20938-apache-dubbo-in-spring-framework) in your browser, and click the “Install to IntelliJ IDEA 2023.2” button at the top right corner to complete the installation.
![image.png](/imgs/blog/2023/10/plugin/img_1.png)

### Method Two
Go to Preferences -> Plugins, search for 'Apache Dubbo', and install it.
![image.png](/imgs/blog/2023/10/plugin/img_2.png)

## Create Application Using the Plugin
Once the plugin is installed, let's see how to create and develop an Apache Dubbo microservice application using the plugin.

### Open Popup
Open the new project dialog by selecting "File -> New -> Project". In the dialog, you will see the Apache Dubbo plugin listed in the template list on the left. Click to select it.
![image.png](/imgs/blog/2023/10/plugin/img_3.png)

Depending on the application needs, enter the project name, save path, coordinates, JDK version, and other information, then click "Next" to proceed to the next step.
### Select Components
![image.png](/imgs/blog/2023/10/plugin/img_4.png)

The plugin will use `dubbo-spring-boot-starter` to create a Spring Boot project, so we need to

- First, select the versions of Dubbo and Spring Boot.
- Second, choose the appropriate Dubbo and business components based on project needs.

Finally, click “Create” to complete the project creation.
![image.png](/imgs/blog/2023/10/plugin/img_5.png)
## Summary
The release of the official IntelliJ IDEA plugin greatly simplifies the cost of Dubbo project initialization. The Apache Dubbo community will continue to collaborate with IntelliJ to abstract more Dubbo features into plugin components to simplify issues such as dependency and configuration management in Dubbo usage. In addition to the plugin form, you can also directly open [start.dubbo.apache.org](https://start.dubbo.apache.org) online service to quickly create Dubbo projects through your browser.

