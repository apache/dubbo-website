# Coding convention

## Code style

The source and JavaDoc of Dubbo follow below specifications:

* [Code Conventions for the Java Programming Language](http://www.oracle.com/technetwork/java/codeconvtoc-136057.html)
* [How to Write Doc Comments for the Javadoc Tool](http://www.oracle.com/technetwork/java/javase/documentation/index-137868.html)

## Exception and Logging

* Log more context information as possible, such as error reason, error server address, client address, registry center address, dubbo version and so on.
* Try to put the main cause at the front, and display all other context information with key-value paris after it.
* Log is not printed where the exception is thrown, log level is determined by the final exception handler, and must print log when dicarding exception.
* `ERROR` log means NEED TO ALARM, `WARN` log means COULD AUTO RECOVERY, `INFO` long mean NORMAL.
* Suggestion: config `ERROR` log in Monitor center for real-time alarm, summary and send `WARN` log weekly.
* `RpcException` is the ONLY external exception of Dubbo，all internal exceptions mush be transfered to `RpcException` if need to throw out to user.
* `RpcException` CAN NOT have sub-class, all types of information are identified with ErrorCode in order to keep compatible.

## Configuration and URL

* Use initials and camelCase for multiple words for object properties [^1].
* Use lowercase and split by '-' for multiple words for config properties [^2].
* Use lowercase and split by '.' for multiple words for URL properties [^3].
* Use URL transfer parameters as possible, Don't define Map or other types, config information also transfer to URL style.
* Minimize URL nesting to keep URL simplicity.

## Unit testing and integration testing

* Use JUnit and EasyMock for unit testing, use TestNG for integration testing, use DBUnit for database testing.
* Don't put large integration test case in unit testing for running speed of unit test case.
* Use `try...finally` or `tearDown` to release resource for all test cases of unit testing.
* Minimize test case that with `while` loop which need waiting repsonse, use to make the logic in timer as function for timer and net testing.
* For fail-safe testing, unified use `LogUtil` assertion log output.

## Extension point base class and AOP

* AOP class should be named as `XxxWrapper`，Base class should be named as `AbstractXxx`.
* Use AOP for combine relationship between extension points, `ExtensionLoader` only loads extension points, including AOP extension.
* Try to use Ioc inject dependency of extension points, Don't direct dependent on factory method of `ExtensionLoader`.
* Try to use AOP implement the common action of extension points, instead of using base class, such as the `isAvailable` checking before load balancing, which is independent of load balance. Close the URL paramters which no need to check.
* Use base class for abstaction for a variety of similar types, such as RMI, Hessian 3rd protocols which have generated interface proxy, only transfer interface proxy to `Invoker` to complete bridging, and public base class can do the logic.
* The base class is also part of the SPI, and each extension should have a convenient base class support.

## Module and packaging

* Base on reusability for packaging, dividing the interface, base class and large implementation into separate modules.
* Put all interfaces under the base package of module, and put base classes in support subpackage, different implementations are placed under the subpackage named by extension point.
* Try to keep subpackage dependent on parent package, NOT reverse.

[^1]: Java convention
[^2]: Spring convention
[^3]: Dubbo convention