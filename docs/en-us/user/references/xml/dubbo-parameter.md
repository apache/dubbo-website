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
# dubbo:parameter

Optional parameter configuration. The corresponding class is `java.util.Map`. This tag is used as a sub tag to configure custom parameters for extending `<dubbo:protocol>`, `<dubbo:service>`, `<dubbo:provider>`, `<dubbo:reference>` or `<dubbo:consumer>`.

| Attribute | Corresponding URL parameter | Type   | Required    | Default Value | Function           | Description             | Compatibility |
| --------- | --------------------------- | ------ | ----------- | ------------- | ------------------ | ----------------------- | ------------- |
| key       | key                         | string | <b>True</b> |               | Service governance | routing parameter key   | Above 2.0.0   |
| value     | value                       | string | <b>True</b> |               | Service governance | routing parameter value | Above 2.0.0   |

For example：

```xml
<dubbo:protocol name="napoli">
    <dubbo:parameter key="http://10.20.160.198/wiki/display/dubbo/napoli.queue.name" value="xxx" />
</dubbo:protocol>
```

you can also use it like this: 

```xml
<dubbo:protocol name="jms" p:queue="xxx" />
```

