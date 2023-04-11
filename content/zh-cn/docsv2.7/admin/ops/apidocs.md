---
aliases:
    - /zh/docsv2.7/admin/ops/apidocs/
description: API文档&测试
linkTitle: API文档&测试
title: API文档&测试
type: docs
weight: 4
---



## dubbo api docs

dubbo 接口文档、测试工具,根据注解生成文档,并提供测试功能.

增加一些注解就能生成类似swagger的文档, 不会把非web的dubbo项目变为web项目.

## 相关仓库
* [dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions) 
[\分支: 2.7.x\dubbo-api-docs](https://github.com/apache/dubbo-spi-extensions/tree/2.7.x/dubbo-api-docs):
  Dubbo-Api-Docs 相关注解,解析注解
* [dubbo-admin](https://github.com/KeRan213539/dubbo-admin): Dubbo-Api-Docs 文档展示,测试功能

## 如何使用?

1. dubbo项目的方法参数中加上 dubbo api docs 注解
    * dubbo提供者项目引入 dubbo-api-docs-core
    * 如果dubbo的接口和参数是一个单独的jar包项目,引入dubbo-api-docs-annotations
    * 在提供者项目的项目启动类(标注了@SpringBootApplication的类)或者配制类(标注了@Configuration的类)中增加注解 
      @EnableDubboApiDocs 以启用Dubbo Api Docs功能
        * 为避免增加生产环境中的资源占用, 建议单独创建一个配制类用于启用Dubbo Api Docs, 并配合 @Profile("dev") 注解使用
        * 当然, Dubbo Api Docs 仅在项目启动时多消耗了点CPU资源, 并使用了一点点内存用于缓存, 将来会考虑将缓存中的内容放到元数据中心.

### 版本
当前版本: 同Dubbo版本号

```
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-annotations</artifactId>
    <version>${dubbo-version}</version>
</dependency>

<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-core</artifactId>
    <version>${dubbo-version}</version>
</dependency>
```

2. 下载 [dubbo-admin](https://github.com/apache/dubbo-admin) [下载地址](https://github.com/apache/dubbo-admin/releases)

3. 启动 dubbo-admin

4. 访问: http:// localhost:8080

5. 进入"接口文档"模块

### 注解使用

* @EnableDubboApiDocs: 配制注解, 启用 dubbo api docs 功能
* @ApiModule: 类注解, dubbo接口模块信息,用于标注一个接口类模块的用途
    * value: 模块名称
    * apiInterface: 提供者实现的接口
    * version: 模块版本
* @ApiDoc: 方法注解, dubbo 接口信息,用于标注一个接口的用途
    * value: 接口名称
    * description: 接口描述(可使用html标签)
    * version: 接口版本
    * responseClassDescription: 响应的数据的描述
* @RequestParam: 类属性/方法参数注解,标注请求参数
    * value: 参数名
    * required: 是否必传参数
    * description: 参数描述
    * example: 参数示例
    * defaultValue: 参数默认值
    * allowableValues: 允许的值,设置该属性后界面上将对参数生成下拉列表
        * 注:使用该属性后将生成下拉选择框
        * boolean 类型的参数不用设置该属性,将默认生成 true/false 的下拉列表
        * 枚举类型的参数会自动生成下拉列表,如果不想开放全部的枚举值,可以单独设置此属性.
* @ResponseProperty: 类属性注解, 标注响应参数
    * value: 参数名
    * example: 示例

### 使用注意

* 获取接口列表直连:

> 由于可能不同功能的dubbo服务都会注册到同一个注册中心,但是dubbo doc
> 使用的接口名是一样的,所以dubbo doc的接口采用直连方式以获取到不同功能服务的不同接口列表
> 测试可以直连或者走注册中心

* 响应bean(接口的返回类型)支持自定义泛型, 但只支持一个泛型占位符
* 关于Map的使用:Map的key只能用基本数据类型.如果Map的key不是基础数据类型,生成的 就不是标准json格式,会出异常
* 接口的同步/异步取自 org.apache.dubbo.config.annotation.Service.async

## 页面截图

![页面截图](/imgs/admin/dubbo_docs_zh.png)
