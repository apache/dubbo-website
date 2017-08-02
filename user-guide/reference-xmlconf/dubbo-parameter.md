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

选项参数配置：  
配置类：java.util.Map  
说明：该标签为|&lt;dubbo:protocol&gt;或|&lt;dubbo:service&gt;或|&lt;dubbo:provider&gt;或|&lt;dubbo:reference&gt;或|&lt;dubbo:consumer&gt;的子标签，用于配置自定义参数，该配置项将作为扩展点设置自定义参数使用。

|标签 | 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性|
| -------- |---------|---------|---------|---------|---------|---------|---------|---------|
|&lt;dubbo:parameter&gt; | key | key | string | 必填 |   | 服务治理 | 路由参数键 | 2.0.0以上版本|
|&lt;dubbo:parameter&gt; | value | value | string | 必填 |   | 服务治理 | 路由参数值 | 2.0.0以上版本|

比如：  
```xml
<dubbo:protocol name="napoli">
    <dubbo:parameter key="http://10.20.160.198/wiki/display/dubbo/napoli.queue.name" value="xxx" />
</dubbo:protocol>
```
也可以：  
```xml
<dubbo:protocol name="jms" p:queue="xxx" />
```