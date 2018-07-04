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
# dubbo:monitor

Monitor center configuration. The corresponding class: `com.alibaba.dubbo.config.MonitorConfig`

| Property | The corresponding class | Type | Requisite | Default | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| protocol | protocol | string | N | dubbo | service governance | Monitor center protocol. "registry" means looking up monitor center from registry. Others mean communicating to monitor center directly | above 2.0.9 |
| address | &lt;url&gt; | string | N | N/A | service governance | Communicating to monitor center directly. address="10.20.130.230:12080" | above 1.0.16 |
