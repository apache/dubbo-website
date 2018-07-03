# Logger adapter

`2.2.1` or later, dubbo support log4j、slf4j、jcl、jdk adapters [^1], you can also explicitly configure the log output policy in the following ways:

0. Command

    ```sh
    java -Ddubbo.application.logger=log4j
    ```

0. Configure in `dubbo.properties`

    ```properties
    dubbo.application.logger=log4j
    ```

0. Configure in `dubbo.xml`

    ```xml
    <dubbo:application logger="log4j" />
    ```

[^1]: Custom Extensions[logger-adapter](http://dubbo.apache.org/books/dubbo-dev-book-en/impls/logger-adapter.html)
