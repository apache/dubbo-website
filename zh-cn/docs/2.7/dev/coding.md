# 编码约定

## 代码风格

Dubbo 的源代码和 JavaDoc 遵循以下的规范：

* [Code Conventions for the Java Programming Language](http://www.oracle.com/technetwork/java/codeconvtoc-136057.html)
* [How to Write Doc Comments for the Javadoc Tool](http://www.oracle.com/technetwork/java/javase/documentation/index-137868.html)

## 异常和日志

* 尽可能携带完整的上下文信息，比如出错原因，出错的机器地址，调用对方的地址，连的注册中心地址，使用 Dubbo 的版本等。
* 尽量将直接原因写在最前面，所有上下文信息，在原因后用键值对显示。
* 抛出异常的地方不用打印日志，由最终处理异常者决定打印日志的级别，吃掉异常必需打印日志。
* 打印 `ERROR` 日志表示需要报警，打印 `WARN` 日志表示可以自动恢复，打印 `INFO` 表示正常信息或完全不影响运行。
* 建议应用方在监控中心配置 `ERROR` 日志实时报警，`WARN` 日志每周汇总发送通知。
* `RpcException` 是 Dubbo 对外的唯一异常类型，所有内部异常，如果要抛出给用户，必须转为 `RpcException`。
* `RpcException` 不能有子类型，所有类型信息用 ErrorCode 标识，以便保持兼容。

## 配置和 URL

* 配置对象属性首字母小写，多个单词用驼峰命名 [^1]。
* 配置属性全部用小写，多个单词用"-"号分隔 [^2]。
* URL参数全部用小写，多个单词用"."号分隔 [^3]。
* 尽可能用 URL 传参，不要自定义 Map 或其它上下文格式，配置信息也转成 URL 格式使用。
* 尽量减少 URL 嵌套，保持 URL 的简洁性。

## 单元和集成测试

* 单元测试统一用 JUnit 和 EasyMock，集成测试用 TestNG，数据库测试用 DBUnit。
* 保持单元测试用例的运行速度，不要将性能和大的集成用例放在单元测试中。
* 保持单元测试的每个用例都用 `try...finally` 或 `tearDown` 释放资源。
* 减少 while 循环等待结果的测试用例，对定时器和网络的测试，用以将定时器中的逻辑抽为方法测试。
* 对于容错行为的测试，比如 failsafe 的测试，统一用 `LogUtil` 断言日志输出。

## 扩展点基类与 AOP

* AOP 类都命名为 `XxxWrapper`，基类都命名为 `AbstractXxx`。
* 扩展点之间的组合将关系由 AOP 完成，`ExtensionLoader` 只负载加载扩展点，包括 AOP 扩展。
* 尽量采用 IoC 注入扩展点之间的依赖，不要直接依赖 `ExtensionLoader` 的工厂方法。
* 尽量采用 AOP 实现扩展点的通用行为，而不要用基类，比如负载均衡之前的 `isAvailable` 检查，它是独立于负载均衡之外的，不需要检查的是URL参数关闭。
* 对多种相似类型的抽象，用基类实现，比如 RMI, Hessian 等第三方协议都已生成了接口代理，只需将将接口代理转成 `Invoker` 即可完成桥接，它们可以用公共基类实现此逻辑。
* 基类也是 SPI 的一部分，每个扩展点都应该有方便使用的基类支持。

## 模块与分包

* 基于复用度分包，总是一起使用的放在同一包下，将接口和基类分成独立模块，大的实现也使用独立模块。
* 所有接口都放在模块的根包下，基类放在 support 子包下，不同实现用放在以扩展点名字命名的子包下。
* 尽量保持子包依赖父包，而不要反向。

[^1]: Java 约定
[^2]: Spring 约定
[^3]: Dubbo 约定