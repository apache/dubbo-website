# 提供者配置

## 基本配置
提供者配置项需要添加到`sys.config`文件`dubboerl`应用配置项里。
```erlang
{dubboerl,[
	%% other config ...
	{provider,[
		{module_implements,interface_module,interface_fullname,[Options]},
		%% eg:
		{userOperator_impl,userOperator,<<"org.apache.dubbo.erlang.sample.service.facade.UserOperator">>,[Option]}
	]}
]}
```

| ConfigName | Type | DefaultValue | Remarks |
| --- | --- | --- | --- |
| module_implements | atom() | - | The service implements module name|
| interface_module | atom() | - | Interface module name is transfer form java jar |
| interface_fullname | binary() | - | Interface full name is the java class name |

Option is to be added.