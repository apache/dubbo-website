---
aliases:
    - /zh/contact/committer/apache-dubbo-page_dev/
description: 官方 Dubbo 主页的维护
linkTitle: 官方主页
title: 官方 Dubbo 主页的维护
type: docs
weight: 5
---




Apache 有一个官方的网站，用来维护所有的孵化项目的信息。每一个孵化项目在这个网站下都有一个信息页。
Dubbo 的信息页地址是 [https://incubator.apache.org/projects/dubbo.html](https://incubator.apache.org/projects/dubbo.html)。

当项目发生比较大的变化，比如新的 committer 的加入，新的 PMC 的当选，或是新版本的 Release 等，都需要将这些更新信息维护到这个页面。

这个官方网站的项目地址是[https://svn.apache.org/repos/asf/incubator/public/trunk](https://svn.apache.org/repos/asf/incubator/public/trunk)。

维护这个页面的方法如下：

1.安装 SVN。若是 Mac OS X 系统或是 Linux 系统，则自带了 SVN。若是 Windows 系统，则请首先自行安装 SVN。

2.用 SVN 将这个[项目](https://svn.apache.org/repos/asf/incubator/public/trunk) checkout 下来 。

3.修改 content/projects/dubbo.xml 文件，并保存。

4.安装 ANT。执行 trunk 目录下的 build.sh 或者 build.bat 脚本构建项目。

5.构建完成后，可以用浏览器打开 target/site/projects/dubbo.html 文件，预览修改是否生效。

6.用 SVN 的 commit 命令将 dubbo.xml 文件提交到服务器，并且不要提交 dubbo.html 文件（因为服务器端会定时自动构建）。
此过程会要求输入Apache id和密码。

参考:

1. http://incubator.apache.org/guides/website.html
2. https://svn.apache.org/repos/asf/incubator/public/trunk/README.txt