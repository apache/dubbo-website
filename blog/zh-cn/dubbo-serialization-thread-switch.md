
## [Issue 2131](https://github.com/apache/incubator-dubbo/issues/2131)

### CN

- Dubbo已经对用户开放切换反序列化线程的配置。
- 配置方式就是在consumer请求的URL中添加参数`decode.in.io=true/false`。
- 如果设置`decode.in.io=true`，代表将在io进程中进行序列化动作。否则，则代表Dubbo将在dubbo线程中进行。如果不设置，则默认为 `true`，将在io进程中进行反序列化操作