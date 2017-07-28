方法参数配置：  
配置类：com.alibaba.dubbo.config.ArgumentConfig  
说明：该标签为|&lt;dubbo:method&gt;的子标签，用于方法参数的特征描述，比如：  
```xml
|&lt;dubbo:method name="findXxx" timeout="3000" retries="2"&gt;
    |&lt;dubbo:argument index="0" callback="true" /&gt;
|&lt;dubbo:method&gt;
```
|标签 | 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性|
| -------- |---------|---------|---------|---------|---------|---------|---------|---------|
|&lt;dubbo:argument&gt; | index |   | int | 必填 |   | 标识 | 方法名 | 2.0.6以上版本|
|&lt;dubbo:argument&gt; | type |   | String | 与index二选一 |   | 标识 | 通过参数类型查找参数的index | 2.0.6以上版本|
|&lt;dubbo:argument&gt; | callback | |&lt;metodName&gt;|&lt;index&gt;.retries | boolean | 可选 |   | 服务治理 | 参数是否为callback接口，如果为callback，服务提供方将生成反向代理，可以从服务提供方反向调用消费方，通常用于事件推送. | 2.0.6以上版本|