### 基准测试工具包
下载 [benchmark压缩包](http://code.alibabatech.com/wiki/download/attachments/7669075/dubbo.benchmark-2.0.14.tar.gz)，并解压 

阅读ReadMe.txt（内容如下，请以压缩包内的为准）

* 新建一个benchmark工程，如demo.benchmark
* 导入自己服务的接口api包和dubbo.benchmark.jar(解压dubbo.benchmark.tar.gz，在lib目录下)
* 新建一个类，实现AbstractClientRunnable

    * 实现父类的构造函数
    * 实现invoke方法，通过serviceFactory创建本地接口代理，并实现自己的业务逻辑，如下

    ```java
        public Object invoke(ServiceFactory serviceFactory) {
            DemoService demoService = (DemoService) serviceFactory.get(DemoService.class);
            return demoService.sendRequest("hello");
        }
    ```
* 将自己的benchmark工程打成jar包,如demo.benchmark.jar
* 将demo.benchmark.jar 和服务的api包放到dubbo.benchmark/lib目录下
* 配置duubo.properties
* 运行run.bat(windows)或run.sh(linux)

如想测试dubbo的不同版本，直接替换lib下的dubbo的jar包即可。 
 