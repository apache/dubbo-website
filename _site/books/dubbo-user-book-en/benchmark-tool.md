# Beanchmark testing tool installer

Download the [benchmark installer](http://code.alibabatech.com/wiki/download/attachments/7669075/dubbo.benchmark-2.0.14.tar.gz)，and unzip it 

Read ReadMe.txt (the contents are as follows, in the compressed package.)

* Build a new benchmark project, such as demo.benchmark 

* Import the your own interface api jar and dubbo.benchmark.jar (Unzip dubbo.benchmark.tar.gz, under the lib directory )

* Create a new class to implement AbstractClientRunnable

    * Implement the constructor of the parent class 
    * Implement the invoke method and create a local interface proxy by serviceFactory，and finish your own business logic, as follows:

    ```java
        public Object invoke(ServiceFactory serviceFactory) {
            DemoService demoService = (DemoService) serviceFactory.get(DemoService.class);
            return demoService.sendRequest("hello");
        }
    ```

* Make your own benchmark project into a jar package, such as demo.benchmark.jar 

* Put the demo.benchmark.jar and service API jar into directory dubbo.benchmark/lib

* Configuring duubo.properties

* Run run.bat(windows) or run.sh(linux)

If you want to test the different versions of Dubbo, you can replace the jar of the Dubbo. 

