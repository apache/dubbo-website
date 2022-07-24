---
type: docs
title: "VirtualService"
linkTitle: "VirtualService"
weight: 30
description: "入站流量的规则"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/advanced-features-and-usage/service/routing/mesh-style/virtualservice/)。
{{% /pageinfo %}}

#### VirtualService
`VirtualService`是用来处理入站流量的规则，也就是说用来描述哪些入站流量适用于该路由规则。
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string |  应以 `应用名/Router类型`的方式来命名。`name`属性一经定义Router类型就确定下来了 | YES  |
| hosts | string[] |  一般指应用名 | NO  |
| dubbo | DubboRoute[] | dubbo 路由规则，顺序执行，符合条件立即返回 | NO |

+ Router类型如下：

| name|  Description |
| --- | --- |
| StandardRouter | 完全使用标准 VirtualService 描述的 Router |
| 待补充 | 待补充 |


#### DubboRoute
`DubboRoute`是`VirtualService`中的属性，用来描述路由策略的边界。
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo: #DubboRoute
  - name:
    service:
    fault:
    mirror:
    retries:
    timeout:
    routedetail:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | 规则的名字，方便识别规则用意 | NO |
| services | StringMatch[] | 规则生效的服务名列表，可使用具体的服务名，也可以使用正则 * 的方式进行匹配；默认不配置，则代表所有的服务都生效 | |
| fault | dubboFaultInject[] | 故障注入(未实现) | NO |
| mirror | Destination | 镜像流量(未实现) | NO |
| retries | DubboRetry[]  | 重试相关(未实现) | NO |
| timeout | DubboTimeout[] | 超时相关(未实现) | NO |
| routedetail | DubboRouteDetail[] | 具体的流量规则，顺序执行，符合条件立即返回 | YES |

#### DubboRouteDetail
`DubboRouteDetail`用来描述详细的路由规则
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail: #DubboRouteDetail
    - name:
      match:
      route:
      mirror:
      retries:
      timeout:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | 规则详情的名字，方便识别规则用意 | NO |
| match | DubboMatchRequest[] | 匹配条件 | YES |
| route | DubboRouteDestination[] | 符合条件的流量的实际目标地址 | YES |
| mirror | Destination | 镜像流量(未实现) | NO |
| retries | DubboRetry[]  | 重试相关(未实现) | NO |
| timeout | DubboTimeout[] | 超时相关(未实现) | NO | 


#### DubboMatchRequest
`DubboMatchRequest`用来描述请求的匹配规则
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match: #DubboMatchRequest
      - name:
        method:
        sourceLabels:
        attachments:
        headers:
        threshold:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | 匹配规则名称 | YES |
| method | DubboMethodMatch | 方法相关的匹配 | YES |
| sourceLabels | map\<string, string\> | 调用端打的相关 lables, 包含应用名、机器分组、机器环境变量信息等; 对于 HSF-JAVA 来说，可以从上报的 URL 拿到对应的 key/value | YES |
| attachments | DubboAttachmentMatch | 请求附带的其他信息，比如 HSF 请求上下文、Eagleeye 上下文等 | NO |
| headers | map\<string, StringMatch\> | 通用的请求协议字段等，如接口名、方法名、超时等 | NO |
| threshold | DoubleMatch | 调用的 subset 列表的机器，占整个 host 的阀值 | NO |

由于 headers 、attachemes 、method 之间可能存在字段一样重复的情况，TODO 进一步细化

#### DubboMethodMatch
`DubboMethodMatch`是用来实现方法的匹配
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match:
      - method: #DubboMethodRequest
        - name_match:
          argc:
          args:
          argp:
          headers:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name_match | StringMatch | 匹配请求中的调用方法名 | YES |
| argc | int | 匹配请求的参数个数 | NO |
| args | DubboMethodArg[]| 为 DubboMethodArg 类型的数组，表示每个参数值需要满足的条件 | NO |
| argp | StringMatch[] | 匹配请求的参数类型 | NO |
| headers | map\<string, StringMatch\> | 预留 | NO |

#### DubboMethodArg
`DubboMethodArg`用来实现方法参数的匹配
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match:
      - method:
        - args: #DubboMethodArg
          - index:
            str_value:
            type:
            num_value:
            bool_value:
            reserve:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| index | uint32 | 匹配参数的位置，index字段从1开始（即第$index个参数） | YES |
| type | string | 匹配参数的类型，以java的 string 类型为例，该字段取值 java.lang.String，该字段默认为 java.lang.String | YES |
| str_value | ListStringMatch | 匹配参数的值，根据$type进行解析 ListStringMatcher：匹配 java.lang.String） | NO |
| num_value | ListDoubleMatch | 数值类型匹配 | NO |
| bool_value | BoolMatch | bool 值类型匹配| NO |
| reserve | reserve  | 复杂类型的匹配，暂时不定义| NO |


#### DubboAttachmentMatch
`DubboAttachmentMatch`用来对任意对象的完全匹配
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match:
      - attachments: #DubboAttachmentMatch
          eagleeyecontext:
          dubbocontext:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| eagleeyecontext| map\<string, StringMatch\> | 鹰眼上下文 | NO |
| dubbocontext| map\<string, StringMatch\> | Dubbo 请求上下文 | NO |

#### ListStringMatch
`ListStringMatch`是一组`StringMatch`集合，任何一个 `StringMatch`匹配则匹配
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match:
      - method:
        - args:
          - index: 1
            str_value:  #ListStringMatch
              oneof:
              - regex: "*abc*"
              - exact: parameter-1
```

+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| oneof | StringMatch[] | 任何一个`StringMatch`匹配则匹配 | NO |

#### StringMatch
`StringMatch`用来描述字符串匹配规则
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - service: #StringMatch
    - exact: org.apache.dubbo.demoService:1.0.0
    - prefix: org.apache.dubbo.hello
    - regex: org.apache.dubbo.*Service:2.0.0
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | string (oneof)  | 完全匹配 | NO |
| prefix | string (oneof)  | 前缀匹配 | NO |
| regex | string (oneof)  | [正则匹配](https://github.com/google/re2/wiki/Syntax)  | NO |
| noempty | string (oneof)  | 非空字符匹配 | NO |
| empty | string (oneof)  | 空字符匹配 | NO |


#### ListDoubleMatch
`ListDoubleMatch`是一组`DoubleMatch`集合，任何一个 `DoubleMatch`匹配则匹配参数
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match:
      - method:
        - args:
          - index: 1
            type: java.lang.Double
            num_value: #ListDoubleMatch
              oneof:
              - range:
                  start: 1
                  end: 100
                  
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| oneof | DoubleMatch[] | 任何一个`DoubleMatch`匹配则匹配 | NO |

#### DoubleMatch
`DoubleMatch`用于匹配 `int`, `long`, `double`类型的数值

+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match:
      - method:
        - args:
          - index: 1
            type: java.lang.Double
            num_value:
              oneof: #DoubleMatch[]
              - range:
                  start: 1
                  end: 100
              #假设当前输入的Double类型的参数值为x，
              #则下面表达式的意思是：x%mode=exact, 
              #即当x%10=6才匹配
              - exact: 6
                mode: 10
                  
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | double(oneof)  | 数值完全匹配| NO |
| range | DoubleRangeMatch(oneof)  | 数值范围匹配 | NO |
| mode | double | 取模操作，需要与上面两个语义一起配置使用 | NO |

#### DoubleRangeMatch
`DoubleRangeMatch`是对`double`值的范围进行匹配
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match:
      - method:
        - args:
          - index: 1
            type: java.lang.Double
            num_value:
              oneof:
              - range: #DoubleRangeMatch
                  start: 1.2
                  end: 1000.5
                  
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| start | double | 数值大于或等于 | YES |
| end | double  | 数值小于 | YES |


#### BoolMatch
`BoolMatch`用来对`true`, `false`的完全匹配
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match:
      - method:
        - args: 
          - index: 1
            type: java.lang.Boolean
            bool_value: #BoolMatch
              - exact: true
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | bool(oneof) | `true`, `false` ,完全匹配 | |

#### ObjectMatch（未实现）
`ObjectMatch`用来对任意对象的完全匹配
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - match:
      - method:
        - args: 
          - index: 1
            type: java.lang.String
            str_value:
              oneof:
              - regex: "*abc*"
              - exact: parameter-1
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| type | string | 匹配参数的类型，以java的 string 类型为例，该字段取值 java.lang.String，该字段默认为 java.lang.String | YES |
| str_value | ListStringMatch | 匹配参数的值，根据$type进行解析 ListStringMatcher：匹配 java.lang.String） | NO |
| num_value | ListDoubleMatch | | NO |
| bool_value | BoolMatch | | NO |

#### DubboRouteDestination
`DubboRouteDestination`用来描述流量到目标地址的策略
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - route: #DubboRouteDestination
        destination:
        weight: 50
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| destination | DubboDestination | 路由目标 Destination  | YES |
| weight | int  | 路由权重  | NO  |

#### DubboDestination
`DubboDestination`用来描述路由流量的目标地址
+ 使用示例
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - routedetail:
    - route: #DubboRouteDestination
        destination:
          host:
          subnet:
          port:
          fallback:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| host | string | 注册中心里面对应的`key`值，现在是接口名 |YES|
| subset | string | 地址列表 | YES |
| port | int| 端口号 | YES |
| fallback | DubboDestination | fallback到的另外一个地址列表 | NO |