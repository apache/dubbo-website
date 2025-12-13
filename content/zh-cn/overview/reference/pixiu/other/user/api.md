---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/api/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/api/
    - /zh-cn/overview/reference/pixiu/other/user/api/
    - /zh-cn/overview/mannual/dubbo-go-pixiu/user/api/
description: API 模型介绍
linkTitle: API 模型介绍
title: API 模型介绍
type: docs
weight: 20
---

# Api

API 模型介绍，建议在为 api_config.yaml 自定义 API 之前阅读。

## Api Gateway

API 是 dubbo-go-pixiu 的关键特性。通过此特性，您可以将 dubbo 服务暴露为 HTTP 服务。

### Configuration

Sample:
``` yaml
name: api name
description: api description
resources:
  - path: '/'
    type: restful
    description: resource documentation
    methods:
      - httpVerb: GET
        enable: true
        inboundRequest:
          requestType: http
          queryStrings:
            - name: id
              required: false
        integrationRequest:
          requestType: dubbo
          mappingParams:
            - name: queryStrings.id
              mapTo: 1
          applicationName: "BDTService"
          interface: "com.ikurento.user.UserProvider"
          method: "GetUser"
          clusterName: "test_dubbo"

definitions:
  - name: modelDefinition
    schema: >-
      {
        "type" : "object",
        "properties" : {
          "id" : {
            "type" : "integer"
          },
          "type" : {
            "type" : "string"
          },
          "price" : {
            "type" : "number"
          }
        }
      }
```
name
:
> The name of the Gateway.


description
:
> The description of the Gateway

resources
:
> Defines the API resources.

path
:
> 定义 API 的路径。可以接受参数化路径。例如，您可以指定 /users/:id，:id 将被视为查询字符串中的参数。您也可以指定 /users/:id/transactions/:transactionId，其中 :id 和 :transactionId 将被用作查询参数。
type
:
> The type of the API, possible values: restful. Type dubbo will be support later to provide dubbo-to-http gateway function.

filters
:
> The filters in resource level. Use comma to separate the filters.

methods
:
> Defines the methods within the resource. 

httpVerb
:
> The http method, accept GET/POST/PUT/DELETE/OPTIONS/PATCH/HEAD/HEAD/ANY(Not supported yet)

enable
:
> Defines the API is online/offline. true -> online, false -> offline. When the API is offline, it returns 406.

inboundRequest
:
> Defines the way to expose the API.

requestType
: 
> the inbound request type. Values: http. Type dubbo will be support later to provide dubbo-to-http gateway function.

queryString
:
> 查询字符串定义 API 暴露的参数。您在路径中定义的参数将合并到这里的配置中。

    name: 查询参数的名称
    required: 参数是否必填.

requestBody
:
> The parameters in request body. It works with the definition config. 
    
    definitionName: The name of the defined definition maps to this request body.

integrationRequest
:
> Defines the detail of the actual backend service.

requestType
:
> The request type in integrationRequest defines the type of the backend service. 'dubbo' is the value we support now. 'http' will be support later with the dubbo-to-http pixiu feature.

mappingParams
:
> It is the field that describe how to map the inboundRequest parameters to backend service parameters.

    name: inboundRequest 参数名称。使用 queryStrings.* 表示 queryStrings 中定义的参数，
    mapTo: 目标参数的索引。从 0 开始。

application
:
> The name of the target dubbo application.

interface
:
> The interface represents the interface in dubbo.

method
:
> The method in integrationRequest represents the method in dubbo

clusterName
:
> The clusterName defines which dubbo cluster to call(Will release later)

definitions
:
> the definitions of the models. They will be used as request body.

    name: The name of the definitions.
    schema: The detail definition of the definition. Use json.schema.

