##序列化与反序列化在IO线程和Dubbo线程池间进行切换

当远程调用请求参数较多，在`Provider`执行反序列化操作时可能会造成IO线程的阻塞，`Dubbo`支持将反序列化的过程放入线程池中执行，避免因为反序列的耗时阻塞`IO线程`。

具体配置如下:

```
<dubbo:protocol name="dubbo">
	 <!--false表示不在IO线程中执行反序列化操作-->
    <dubbo:parameter key="dubbo.in.io" value="false" />
</dubbo:protocol>
```

需要注意的是，当`dubbo:protocol`配置`dispatcher`为`direct`时，远程调用的所有步骤均在`IO线程`中完成，`Dubbo`不再维护其他线程池，因此，此时配置反序列化的执行线程没有任何作用。
