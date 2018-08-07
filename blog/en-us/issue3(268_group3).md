##Switch Serialization/Deserialization Between IO and Dubbo Threads

When the request body of the remote procedure call is large,the IO thread may be blocked when the Provider executing the deserialization,Dubbo supports put the execution of the deserialization process into the thread pool to avoid blocking the IO thread because of the time consuming of the deserilization.


For example：

```
<dubbo:protocol name="dubbo">
	 <!--false means that deserilization not execute in IO thread-->
    <dubbo:parameter key="dubbo.in.io" value="false" />
</dubbo:protocol>
```
It is important to note that, when `dubbo:protocol` configuring `dispatcher` and the value eqauls to `direct`, all the execution steps of the remote procedure call are done in the `IO Thread`, and `Dubbo` no longer maintains other thread pool,so there is no effect on configuring the deserialization process execution thread.











