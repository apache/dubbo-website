---
title: "Introduction to Apache Dubbo plugin for IntelliJ IDEA"
linkTitle: "Introduction to Apache Dubbo plugin for IntelliJ IDEA"
date: 2023-10-23
tags: ["news"]
authors: Dubbo Community
description: >
   A brief introduction to Apache Dubbo plugin for IntelliJ IDEA
---

The most popular Java IDE, IntelliJ IDEA, has collaborated with the open-source microservice framework Apache Dubbo community, bringing good news to microservice developers. Along with IntelliJ IDEA version 2023.2, Jetbras has officially released the new **Apache Dubbo in Spring Framework** plugin version.

This plugin can help developers with Dubbo project initialization and facilitate the identification of Dubbo services and their dependencies during the project development process. Developing microservices based on Apache Dubbo will become very simple.


## How to install
Before installing the Apache Dubbo plugin, please ensure that you are using IntelliJ IDEA version 2023.2 and above.

![image.png](/imgs/blog/2023/10/plugin/img.png)

There are two ways to complete the installation of the Apache Dubbo plugin

### Method 1
Open [the Apache Dubbo in Spring Framework plugin page](https://plugins.jetbrains.com/plugin/20938-apache-dubbo-in-spring-framework) with browser, and in the upper right corner of the page, click the "Install to IntelliJ IDEA 2023.2" button to complete the plugin installation.

![image.png](/imgs/blog/2023/10/plugin/img_1.png)
### Method 2
Open 'Preferences ->Plugins', enter 'Apache Dubbo' to search for plugins, and then install them.

![image.png](/imgs/blog/2023/10/plugin/img_2.png)

## Create a new Dubbo application
Next, let's take a look at how to use the plugin to create and develop an Apache Dubbo microservice application.
### The 'New Project' pop-up window
Open the 'New Project' window through 'File>New>Project'. In the pop-up window, you can see that the Apache Dubbo plugin has appeared in the generators list on the left. Click to select it.

![image.png](/imgs/blog/2023/10/plugin/img_3.png)

According to the application needs, enter the project name, save path, coordinates, JDK version, and other information. Click "Next" to proceed to the next step.

### Select Components

![image.png](/imgs/blog/2023/10/plugin/img_4.png)

The plugin will use dubbo spring boot starter to create a Spring Boot project, so we

- Firstly, you need to choose the versions of Dubbo and Spring Boot.
- Secondly, select the corresponding Dubbo and business components according to the project needs

Finally, click "Create" to complete the project creation.

![image.png](/imgs/blog/2023/10/plugin/img_5.png)

## Summary
The release of the official IntelliJ IDEA plugin greatly simplifies the cost of initializing the Dubbo project.
In addition to the plugin format, you can also directly open the start.dubbo.apache.org online service to quickly create Dubbo projects through a browser.
