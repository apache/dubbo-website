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
# dubbo:module

Module configuration. The corresponding class `com.alibaba.dubbo.config.ModuleConfig`

| Property | The corresponding class | Type | Requisite | Default | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | module | string | <b>Y</b> | | service governance | Module name is for registry combing the dependencies of modules. | above 2.2.0 |
| version | module.version | string | N | | service governance | module version | above 2.2.0 |
| owner | owner | string | N | | service governance | Module manager, Pls. fill in the mailbox prefix of the person in charge | above 2.2.0 |
| organization | organization | string | N | | service governance |Organization name is for registry distinguishing between the source of service. As a suggestion, this property should be written in config file directly. Such as china,intl,itu,crm,asc,dw,aliexpress etc. | above 2.2.0 |
