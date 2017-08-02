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

模块信息配置：
配置类：com.alibaba.dubbo.config.ModuleConfig

|标签 | 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性|
| -------- |---------|---------|---------|---------|---------|---------|---------|---------|
|&lt;dubbo:module&gt; | name | module | string | 必填 |   | 服务治理 | 当前模块名称，用于注册中心计算模块间依赖关系 | 2.2.0以上版本|
|&lt;dubbo:module&gt; | version | module.version | string | 可选 |   | 服务治理 | 当前模块的版本 | 2.2.0以上版本|
|&lt;dubbo:module&gt; | owner | owner | string | 可选 |   | 服务治理 | 模块负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.2.0以上版本|
|&lt;dubbo:module&gt; | organization | organization | string | 可选 |   | 服务治理 | 组织名称(BU或部门)，用于注册中心区分服务来源，此配置项建议不要使用autoconfig，直接写死在配置中，比如china,intl,itu,crm,asc,dw,aliexpress等 | 2.2.0以上版本|