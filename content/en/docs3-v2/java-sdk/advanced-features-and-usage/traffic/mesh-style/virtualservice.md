---
type: docs
title: "VirtualService"
linkTitle: "VirtualService"
weight: 30
description: "Rules for inbound traffic"
---

### VirtualService
`VirtualService` is a rule used to process inbound traffic, that is to say, it is used to describe which inbound traffic applies to this routing rule.
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | should be named in the form of `application name/router type`. The `name` attribute is determined once the Router type is defined | YES |
| hosts | string[] | generally refers to the application name | NO |
| dubbo | DubboRoute[] | dubbo routing rules, executed sequentially, return immediately when conditions are met | NO |

+ Router types are as follows:

| name | Description |
| --- | --- |
| StandardRouter | A Router that fully uses the standard VirtualService description |
| to be added | to be added |


### DubboRoute
`DubboRoute` is an attribute in `VirtualService`, which is used to describe the boundary of the routing strategy.
+ Example of use
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
    route details:
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | The name of the rule, easy to identify the purpose of the rule | NO |
| services | StringMatch[] | A list of service names for which the rule takes effect. You can use a specific service name or a regular * to match; if it is not configured by default, it means that all services are valid | |
| fault | dubboFaultInject[] | fault injection (not implemented) | NO |
| mirror | Destination | mirror traffic (not implemented) | NO |
| retries | DubboRetry[] | Retry related (unimplemented) | NO |
| timeout | DubboTimeout[] | timeout related (unimplemented) | NO |
| routedetail | DubboRouteDetail[] | Specific traffic rules, executed sequentially, return immediately when conditions are met | YES |

### DubboRouteDetail
`DubboRouteDetail` is used to describe detailed routing rules
+ Example of use
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
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | The name of the rule details, easy to identify the purpose of the rule | NO |
| match | DubboMatchRequest[] | matching condition | YES |
| route | DubboRouteDestination[] | the actual destination address of the qualified traffic | YES |
| mirror | Destination | mirror traffic (not implemented) | NO |
| retries | DubboRetry[] | Retry related (unimplemented) | NO |
| timeout | DubboTimeout[] | timeout related (unimplemented) | NO |


### DubboMatchRequest
`DubboMatchRequest` is used to describe the matching rules of the request
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match: #DubboMatchRequest
      - name:
        method:
        sourceLabels:
        attachments:
        headers:
        threshold:
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | matching rule name | YES |
| method | DubboMethodMatch | method related matching | YES |
| sourceLabels | map\<string, string\> | Related labels typed by the caller, including application name, machine group, machine environment variable information, etc.; for HSF-JAVA, you can get the corresponding key from the reported URL/ value | YES |
| attachments | DubboAttachmentMatch | Other information attached to the request, such as HSF request context, Eagleeye context, etc. | NO |
| headers | map\<string, StringMatch\> | Common request protocol fields, etc., such as interface name, method name, timeout, etc. | NO |
| threshold | DoubleMatch | The machines in the called subset list account for the threshold of the entire host | NO |

Since there may be duplication of fields among headers, attachmes, and methods, TODO further refines

### DubboMethodMatch
`DubboMethodMatch` is used to achieve method matching
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match:
      - method: #DubboMethodRequest
        - name_match:
          argc:
          args:
          argp:
          headers:
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name_match | StringMatch | match the calling method name in the request | YES |
| argc | int | The number of parameters matching the request | NO |
| args | DubboMethodArg[]| is an array of DubboMethodArg type, indicating the condition that each parameter value needs to meet | NO |
| argp | StringMatch[] | match request parameter type | NO |
| headers | map\<string, StringMatch\> | reserved | NO |

### DubboMethodArg
`DubboMethodArg` is used to match method parameters
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match:
      -method:
        - args: #DubboMethodArg
          - index:
            str_value:
            type:
            num_value:
            bool_value:
            reserve:
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| index | uint32 | The position of the matching parameter, the index field starts from 1 (that is, the $index parameter) | YES |
| type | string | The type of the matching parameter, taking the string type of java as an example, the value of this field is java.lang.String, and the default value of this field is java.lang.String | YES |
| str_value | ListStringMatch | The value of the matching parameter, parsed according to $type ListStringMatcher: match java.lang.String) | NO |
| num_value | ListDoubleMatch | Numeric type match | NO |
| bool_value | BoolMatch | bool value type match | NO |
| reserve | reserve | Complex type matching, not defined for now | NO |


### DubboAttachmentMatch
`DubboAttachmentMatch` is used to fully match any object
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match:
      - attachments: #DubboAttachmentMatch
          eagleeyecontext:
          dubbo context:
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| eagleeyecontext| map\<string, StringMatch\> | eagleeye context | NO |
| dubbocontext| map\<string, StringMatch\> | Dubbo request context | NO |

### ListStringMatch
`ListStringMatch` is a set of `StringMatch` collections, any `StringMatch` matches
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match:
      -method:
        - args:
          - index: 1
            str_value: #ListStringMatch
              oneof:
              - regex: "*abc*"
              - exact: parameter-1
```

+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| oneof | StringMatch[] | matches if any `StringMatch` matches | NO |

### StringMatch
`StringMatch` is used to describe string matching rules
+ Example of use
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
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | string (oneof) | exact match | NO |
| prefix | string (oneof) | prefix match | NO |
| regex | string (oneof) | [regular match](https://github.com/google/re2/wiki/Syntax) | NO |
| noempty | string (oneof) | non-empty character match | NO |
| empty | string (oneof) | empty character match | NO |


### ListDoubleMatch
`ListDoubleMatch` is a set of `DoubleMatch` collections, any `DoubleMatch` match matches the parameters
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match:
      -method:
        - args:
          - index: 1
            type: java.lang.Double
            num_value: #ListDoubleMatch
              oneof:
              - range:
                  start: 1
                  end: 100
                  
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| oneof | DoubleMatch[] | matches if any `DoubleMatch` matches | NO |

### DoubleMatch
`DoubleMatch` is used to match values of type `int`, `long`, `double`

+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match:
      -method:
        - args:
          - index: 1
            type: java.lang.Double
            num_value:
              oneof: #DoubleMatch[]
              - range:
                  start: 1
                  end: 100
              #Assume that the parameter value of the currently input Double type is x,
              #The meaning of the following expression is: x%mode=exact,
              #That is, it matches only when x%10=6
              - exact: 6
                mode: 10
                  
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | double(oneof) | exact value match | NO |
| range | DoubleRangeMatch(oneof) | value range matching | NO |
| mode | double | Modulo operation, it needs to be configured together with the above two semantics | NO |

### DoubleRangeMatch
`DoubleRangeMatch` is to match the range of `double` values
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match:
      -method:
        - args:
          - index: 1
            type: java.lang.Double
            num_value:
              oneof:
              - range: #DoubleRangeMatch
                  start: 1.2
                  end: 1000.5
                  
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| start | double | value greater than or equal to | YES |
| end | double | value less than | YES |


### BoolMatch
`BoolMatch` is used to match `true`, `false` exactly
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match:
      -method:
        - args:
          - index: 1
            type: java.lang.Boolean
            bool_value: #BoolMatch
              - exact: true
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | bool(oneof) | `true`, `false`, exact match | |

### ObjectMatch (not implemented)
`ObjectMatch` for an exact match on any object
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - match:
      -method:
        - args:
          - index: 1
            type: java.lang.String
            str_value:
              oneof:
              - regex: "*abc*"
              - exact: parameter-1
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| type | string | The type of the matching parameter, taking the string type of java as an example, the value of this field is java.lang.String, and the default value of this field is java.lang.String | YES |
| str_value | ListStringMatch | The value of the matching parameter, parsed according to $type ListStringMatcher: match java.lang.String) | NO |
| num_value | ListDoubleMatch | | NO |
| bool_value | BoolMatch | | NO |

### DubboRouteDestination
`DubboRouteDestination` is used to describe the strategy of traffic to the destination address
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - route: #DubboRouteDestination
        destination:
        weight: 50
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| destination | DubboDestination | routing destination Destination | YES |
| weight | int | routing weight | NO |

### DubboDestination
`DubboDestination` is used to describe the destination address of routing traffic
+ Example of use
```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  dubbo:
  - route detail:
    - route: #DubboRouteDestination
        destination:
          host:
          subnet:
          port:
          fallback:
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| host | string | The corresponding `key` value in the registry, now it is the interface name |YES|
| subset | string | address list | YES |
| port | int| port number | YES |
| fallback | DubboDestination | another address list for fallback | NO |