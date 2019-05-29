# Apache官方Dubbo主页的维护

Apache有一个官方的网站，用来维护所有的孵化项目的信息。每一个孵化项目在这个网站下都有一个信息页。
Dubbo的信息页地址是https://incubator.apache.org/projects/dubbo.html。

当项目发生比较大的变化，比如新的committer的加入，新的PMC的当选，或是新版本的Release等，都需要将这些更新信息维护到这个页面。
这个官方网站的项目地址是https://svn.apache.org/repos/asf/incubator/public/trunk。

维护这个页面的方法如下：

1.安装SVN。若是Mac OS X系统或是Linux系统，则自带了SVN。若是Windows系统，则请首先自行安装SVN。

2.用SVN将https://svn.apache.org/repos/asf/incubator/public/trunk这个项目checkout下来。

3.修改content/projects/dubbo.xml文件，并保存。

4.安装ANT。执行trunk目录下的build.sh或者build.bat脚本构建项目。

5.构建完成后，可以用浏览器打开target/site/projects/dubbo.html文件，预览修改是否生效。

6.用SVN的commit命令将dubbo.xml文件提交到服务器，并且不要提交dubbo.html文件（因为服务器端会定时自动构建）。
此过程会要求输入Apache id和密码。

参考:

1.http://incubator.apache.org/guides/website.html
2.https://svn.apache.org/repos/asf/incubator/public/trunk/README.txt
