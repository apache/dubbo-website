# 工程介绍
此工程维护 **[dubbo.io](http://dubbo.io)官方网站&文档** 内容。
## 说明
限于dubbo.github.io工程的特殊性，对工程使用说明如下：
1. 工程静态内容发布在github pages
2. 工程有两个分支，`master`和`rd_sources`。  
   * `master`分支存放的用于发布到github pages的静态页面内容，一般不做手动修改
   * `rd_sources`分支存放的是markdown格式的文档内容，请在此分支修改，修改后通过bin/publish_gitbook.sh脚本完成自动发布

## 使用方法
  本地clone工程： git clone -b rd_sources https://github.com/dubbo/dubbo.github.io.git ./dubbo.github.io  
  修改文档并提交，如需发布，请执行bin/publish_gitbook.sh脚本
