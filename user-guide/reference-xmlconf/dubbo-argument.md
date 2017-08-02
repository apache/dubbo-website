<style>
table {
  width: 100%;
  max-width: 65em;
  border: 1px solid #dedede;
  margin: 15px auto;
  border-collapse: collapse;
  empty-cells: show;
}
table th,
table td {
  height: 35px;
  border: 1px solid #dedede;
  padding: 0 10px;
}
table th {
  font-weight: bold;
  text-align: center !important;
  background: rgba(158,188,226,0.2);
  white-space: nowrap;
}
table tbody tr:nth-child(2n) {
  background: rgba(158,188,226,0.12);
}
table td:nth-child(1) {
  white-space: nowrap;
}
table tr:hover {
  background: #efefef;
}
.table-area {
  overflow: auto;
}
</style>

<script type="text/javascript">
[].slice.call(document.querySelectorAll('table')).forEach(function(el){
    var wrapper = document.createElement('div');
    wrapper.className = 'table-area';
    el.parentNode.insertBefore(wrapper, el);
    el.parentNode.removeChild(el);
    wrapper.appendChild(el);
})
</script>

方法参数配置：  
配置类：com.alibaba.dubbo.config.ArgumentConfig  
说明：该标签为|&lt;dubbo:method&gt;的子标签，用于方法参数的特征描述，比如：  
```xml
|&lt;dubbo:method name="findXxx" timeout="3000" retries="2"&gt;
    |&lt;dubbo:argument index="0" callback="true" /&gt;
|&lt;dubbo:method&gt;
```
|标签 | 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性|
| -------- |---------|---------|---------|---------|---------|---------|---------|---------|
|&lt;dubbo:argument&gt; | index |   | int | 必填 |   | 标识 | 方法名 | 2.0.6以上版本|
|&lt;dubbo:argument&gt; | type |   | String | 与index二选一 |   | 标识 | 通过参数类型查找参数的index | 2.0.6以上版本|
|&lt;dubbo:argument&gt; | callback | |&lt;metodName&gt;|&lt;index&gt;.retries | boolean | 可选 |   | 服务治理 | 参数是否为callback接口，如果为callback，服务提供方将生成反向代理，可以从服务提供方反向调用消费方，通常用于事件推送. | 2.0.6以上版本|