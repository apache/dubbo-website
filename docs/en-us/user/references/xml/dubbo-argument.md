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
# dubbo:argument

Method argument configuration. The corresponding class：`com.alibaba.dubbo.config.ArgumentConfig`. This tag is child of `<dubbo:method>`, which is for feature description of method argument, such as:

```xml
<dubbo:method name="findXxx" timeout="3000" retries="2">
    <dubbo:argument index="0" callback="true" />
</dubbo:method>
```
| Property | Corresponding URL parameter | Type | Requisite | Default | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| index | | int | <b>Y</b> | | identification | method name | above 2.0.6 |
| type | | String | Index and type choose one | | identification | Find index of argument by it | above 2.0.6 |
| callback | &lt;metodName&gt;&lt;index&gt;.retries | boolean | N | | service governance | Mark whether this argument is a callback service. If true, provider will generate reverse proxy,which can invoke consumer in turn. Generally for event pushing | above 2.0.6 |