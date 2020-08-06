# 公共契约

这里记录的是 Dubbo 公共契约，希望所有扩展点遵守。

## URL

* 所有扩展点参数都包含 URL 参数，URL 作为上下文信息贯穿整个扩展点设计体系。
* URL 采用标准格式：`protocol://username:password@host:port/path?key=value&key=value`

## 日志

* 如果不可恢复或需要报警，打印 ERROR 日志。
* 如果可恢复异常，或瞬时的状态不一致，打印 WARN 日志。
* 正常运行时的中间状态提示，打印 INFO 日志。