模块信息配置：
配置类：com.alibaba.dubbo.config.ModuleConfig

|标签 | 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性|
| -------- |---------|---------|---------|---------|---------|---------|---------|---------|
|&lt;dubbo:module&gt; | name | module | string | 必填 |   | 服务治理 | 当前模块名称，用于注册中心计算模块间依赖关系 | 2.2.0以上版本|
|&lt;dubbo:module&gt; | version | module.version | string | 可选 |   | 服务治理 | 当前模块的版本 | 2.2.0以上版本|
|&lt;dubbo:module&gt; | owner | owner | string | 可选 |   | 服务治理 | 模块负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.2.0以上版本|
|&lt;dubbo:module&gt; | organization | organization | string | 可选 |   | 服务治理 | 组织名称(BU或部门)，用于注册中心区分服务来源，此配置项建议不要使用autoconfig，直接写死在配置中，比如china,intl,itu,crm,asc,dw,aliexpress等 | 2.2.0以上版本|