# Consumer Configurations

## Base Config
Consumer config is under the dubboerl application with sys.config
```erlang
{dubboerl,[
	%% other config ...
	{consumer,[
		{<<"interface fullname">>,[Option]},
		%% eg:
		{<<"org.apache.dubbo.erlang.sample.service.facade.UserOperator">>,[]},
	]}
]}
```
Option is to be added.
