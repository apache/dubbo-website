# Servitization best practice 

## Modularization

It is recommended to put service interfaces, service models, service exceptions, and so on in the API package,Because the service model and exception are part of the API, it is also in conformity with the modularization principle:Reusing the publish equivalence principle (REP) and the Common Reuse Principle (CRP).

If you need, you can also consider placing a spring reference configuration in the API package, so that the user can only use the configuration in the spring loading process, and the configuration suggestion is placed in the package directory of the module, so as not to conflict, eg:`com/alibaba/china/xxx/dubbo-reference.xml`。

## Granularity

The service interface should have large granularity as possible.Each service method should represent a function rather than a step of a function, otherwise it will be faced with distributed transaction problem. Dubbo does not provide distributed transaction support at present.

The service interface recommends the division of the business scene as a unit and abstract the similar business to prevent the explosion of the number of interfaces.

It is not recommended to use an too abstract universal interface, such as Map query (Map), which has no explicit semantics, which will inconvenience later maintenance.

## Version

Each interface should define a version number to provide possible subsequent incompatible upgrades,eg: `<dubbo:service interface="com.xxx.XxxService" version="1.0" />`。

It is recommended to use a two bit version number, because the third - bit version number is usually compatible with a compatible upgrade, and a change of service version is required only when incompatible.

When incompatible, half of the provider is upgraded to a new version, and all the consumers are upgraded to a new version, and the remaining half providers are upgraded to a new version.

## Compatibility

The service interface adds method or the service model adds fields. It can be backward compatible, delete methods or delete fields, and will not be compatible. The new fields of the enumerated type are not compatible, so we need to upgrade by changing the version number.

The compatibility of each protocol is different, see: [Protocol introduction](./references/protocol/introduction.md)

## Enumeration type

If it is a complete set, you can use Enum, eg:`ENABLE`, `DISABLE`。

If it is the type of business, there will be an obvious type of increase in the future, and it is not recommended to use  `Enum`, and it is not recommended to use Enum and can be replaced by  `String` .

If you use`Enum`in the return value,And add the  `Enum` value,suggestions to upgrade the service consumption, so that the service provider does not return a new value.

If the  `Enum`  value is used in the incoming parameter,and add the `Enum` value,it is suggested that the service provider be upgraded first, so that the service consumer will not pass the new value.

## Serialization

The service parameters and return values suggest that the POJO object is used, that is, the object of the attribute is represented by the `setter`, `getter` method.

Service parameters and return values do not recommend the use of interfaces, because data model abstraction is of little significance, and serialization requires interfaces to implement meta information of classes, and can not play the purpose of hiding implementation.

Service parameters and return values must be byValue, but not byReference. The reference or return values of consumers and providers are not the same, but the values are the same. Dubbo does not support remote objects.

## Exception

It is suggested that abnormal reporting errors are used rather than return error codes, and exception information can carry more information and have more semantic friendliness.

If you are worried about performance problems, you can use the override () method of fillInStackTrace () out of the exception class as an empty method to make it not a copy of the stack information when necessary.

Query method is not recommended throws checked, otherwise the caller in the query will be too much `try...catch, and can not be processed.`

Service providers should not throw the exception of DAO or SQL to the consumer side. They should package the exception that consumers do not care about in service implementation, otherwise consumers may not be able to serialize the corresponding exception.

## Call

Not just because it is a Dubbo call, wrap the call logic eith `try...catch`clause. `try...catch` should be added to the appropriate rollback boundary.

The check logic for the input parameters should be available at the Provider side. For performance considerations, the service implementer may consider adding a service Stub class to the API package to complete the test.