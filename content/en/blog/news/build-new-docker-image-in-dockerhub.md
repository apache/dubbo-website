---
title: "Publishing Dubbo Admin Images on DockerHub"
linkTitle: "Publishing Dubbo Admin Images on DockerHub"
date: 2018-04-23
tags: ["News"]
description: >
  This article will introduce how to publish Dubbo Admin images on Dockerhub.
---

Dubbo Admin is the service governance center for Dubbo, providing many features such as service governance and configuration management needed for daily operations.

Dubbo Admin includes both front-end and back-end code. If users need to download the source code and compile it themselves, it will take some time. This experience is not ideal, especially for users who wish to quickly research and try Dubbo Admin.

Docker is an open-source application container engine that allows developers to package applications and their dependencies into a portable image. There is a strong demand in the community for a Dubbo Admin image. Docker maintains a public repository, DockerHub, which also has many domestic mirrors, allowing for faster access. Publishing the Dubbo Admin image to DockerHub is a good choice.

## Applying for a DockerHub Account
To publish images on DockerHub, you naturally need an account. DockerHub has two common account types: personal accounts and organizational accounts. Apache has an organizational account on DockerHub[^apache-repo]. Our first choice is to publish under the organizational account.

DockerHub manages organizational accounts based on groups, meaning there are multiple groups under an organizational account, each with different members, and a group can manage one or more images.

So the first step is to apply for permission, which requires submitting an issue to the Apache Infrastructure team to request DockerHub image repository and group permissions. Currently, the image and group have been applied for; you just need to apply for group permissions, following up on previous requests[^request-ticket].

After applying for the permissions, logging in with the Apache account should show the corresponding images and configuration options.

## Adding New Build Rules
There are two ways to publish images to DockerHub: one is to build the image locally and then push it to DockerHub, and the other is to provide a Dockerfile and use the build functionality on DockerHub directly. The latter is obviously more operationally convenient, and the Dubbo Admin image is currently published this way.

When a new version of Dubbo Admin is released, a new Dockerfile file needs to be added to the project's docker directory. You can refer to the current Dockerfile for version 0.1.0[^docker-file]. The configuration may vary slightly depending on the specific version, but is generally consistent.

After adding the Dockerfile, go to the DockerHub management interface to add Build Rules.

![dockerhub-build-rules.png](/imgs/blog/dockerhub-build-rules.png)

Fill it out according to the actual situation. There are two points to note:
+ The latest version must match the latest version configuration.
+ Do not check Autobuild.

Checking Autobuild will trigger an automatic build for every git commit. However, since Dubbo Admin does not provide snapshot Docker images, it only needs to build and publish when releasing a new version.

After making changes, click Save, then trigger the build manually.

## Conclusion
In summary, the steps to publish an image on DockerHub are not complicated. If permissions have already been applied for, the process is very smooth.

Additionally, building on DockerHub requires queuing, and sometimes you may encounter long wait times before the build starts, so patience is required.

[^apache-repo]: https://hub.docker.com/r/apache
[^request-ticket]: https://issues.apache.org/jira/browse/INFRA-18167
[^docker-file]: https://github.com/apache/dubbo-admin/blob/develop/docker/0.1.0/Dockerfile

