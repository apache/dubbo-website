# Dubbo 版本发布及新特性速览

## 版本速览
Dubbo 社区目前主力维护的有 2.6.x 和 2.7.x 两大版本，其中，
* 2.6.x 主要以 bugfix 和少量 enhancements 为主，因此能完全保证稳定性
* 2.7.x 作为社区的主要开发版本，得到持续更新并增加了大量新 feature 和优化，同时也带来了一些稳定性挑战

### 2.7.x 版本

|      | 版本    | 重要功能                                                     | 升级建议                      |
| ---- | ------- | ------------------------------------------------------------ | ------------------------------- |
| 1    | 2.7.6   | bugfix of 2.7.5<br /> 服务鉴权 | **推荐生产使用**            |
| 2    | 2.7.5   | 服务自省<br />HTTP/2（gRPC） <br />Protobuf <br />TLS<br />性能优化<br /><br />https://github.com/apache/dubbo/releases/tag/dubbo-2.7.5 | 不建议大规模生产使用            |
| 3    | 2.7.4.1 | [bugfixes and enhancements of 2.7.3](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.4.1) | **推荐生产使用**                |
| 4    | 2.7.3   | [bigfixes of and enhancements of 2.7.2](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.3) | **推荐生产使用**                |
| 5    | 2.7.2   | [bigfixes of and enhancements of 2.7.1](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.2)      | 不建议大规模生产使用            |
| 6    | 2.7.1   | [bigfixes of and enhancements of 2.7.0](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.1)      | 不建议大规模生产使用            |
| 7    | 2.7.0   | 异步编程模型 - 消费端/提供端异步<br />服务治理规则增强<br />简化的注册模型<br />配置中心、元数据中心<br />package 重构<br /><br />https://github.com/apache/dubbo/releases/tag/dubbo-2.7.0 | beta 版本，2.6.x 重构后首个版本 |


### 2.6.x 及之前版本

|      | 版本         | 重要功能                | 升级建议                               |
| ---- | ------------ | ----------------------- | -------------------------------------- |
| 1    | 2.6.x        | bugfix                  | 建议持续升级最新版本，所有版本生产可用 |
| 2    | 2.5.x        | 停止维护 |   建议升级最新 2.6.x 版本    |
| 3    | 2.4.x 及之前 | 停止维护      | 建议升级最新 2.6.x 版本    |


## 值得关注的新特性
* Dubbo 云原生计划（敬请期待...）
* Kubernetes Native Service Discovery（敬请期待...）
* [gRPC (HTTP/2) 协议](../references/protocol/grpc/)
* [使用 Protobuf 定义 Dubbo 服务](../examples/protobuf-idl/)
* [TLS 安全传输](../examples/tls/)
* 实例级服务发现
* [服务鉴权](../examples/auth/)
* 性能优化
    * [调用链路提升 30%](/zh-cn/blog/2020/05/18/dubbo-java-2.7.5-功能解析/)
    * [消费端线程模型](../examples/consumer-threadpool/)
    * 地址推送链路
    
## 热门文章列表
[从 2019 到 2020，Apache Dubbo 年度总结](/zh-cn/blog/2020/05/11/从-2019-到-2020apache-dubbo-年度回顾与总结/)  
[Dubbo 2.7.5 里程碑版本发布](/zh-cn/blog/2020/05/18/dubbo-java-2.7.5-功能解析/)  
[Dubbo 在协议与多语言方向的探索：支持 gRPC、Protobuf](/zh-cn/blog/2019/10/28/dubbo-在跨语言和协议穿透性方向上的探索支持-http/2-grpc-和-protobuf/)
