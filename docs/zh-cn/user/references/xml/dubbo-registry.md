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
# dubbo:registry

注册中心配置。对应的配置类： `com.alibaba.dubbo.config.RegistryConfig`。同时如果有多个不同的注册中心，可以声明多个 `<dubbo:registry>` 标签，并在 `<dubbo:service>` 或 `<dubbo:reference>` 的 `registry` 属性指定使用的注册中心。

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | 可选 | | 配置关联 | 注册中心引用BeanId，可以在&lt;dubbo:service registry=""&gt;或&lt;dubbo:reference registry=""&gt;中引用此ID | 1.0.16以上版本 |
| address | &lt;host:port&gt; | string | <b>必填</b> | | 服务发现 | 注册中心服务器地址，如果地址没有端口缺省为9090，同一集群内的多个地址用逗号分隔，如：ip:port,ip:port，不同集群的注册中心，请配置多个&lt;dubbo:registry&gt;标签 | 1.0.16以上版本 |
| protocol | &lt;protocol&gt; | string | 可选 | dubbo | 服务发现 | 注同中心地址协议，支持dubbo, http, local三种协议，分别表示，dubbo地址，http地址，本地注册中心 | 2.0.0以上版本 |
| port | &lt;port&gt; | int | 可选 | 9090 | 服务发现 | 注册中心缺省端口，当address没有带端口时使用此端口做为缺省值 | 2.0.0以上版本 |
| username | &lt;username&gt; | string | 可选 | | 服务治理 | 登录注册中心用户名，如果注册中心不需要验证可不填 | 2.0.0以上版本 |
| password | &lt;password&gt; | string | 可选 | | 服务治理 | 登录注册中心密码，如果注册中心不需要验证可不填 | 2.0.0以上版本 |
| transport | registry.transporter | string | 可选 | netty | 性能调优 | 网络传输方式，可选mina,netty | 2.0.0以上版本 |
| timeout | registry.timeout | int | 可选 | 5000 | 性能调优 | 注册中心请求超时时间(毫秒) | 2.0.0以上版本 |
| session | registry.session | int | 可选 | 60000 | 性能调优 | 注册中心会话超时时间(毫秒)，用于检测提供者非正常断线后的脏数据，比如用心跳检测的实现，此时间就是心跳间隔，不同注册中心实现不一样。 | 2.1.0以上版本 |
| file | registry.file | string | 可选 | | 服务治理 | 使用文件缓存注册中心地址列表及服务提供者列表，应用重启时将基于此文件恢复，注意：两个注册中心不能使用同一文件存储 | 2.0.0以上版本 |
| wait | registry.wait | int | 可选 | 0 | 性能调优 | 停止时等待通知完成时间(毫秒) | 2.0.0以上版本 |
| check | check | boolean | 可选 | true | 服务治理 | 注册中心不存在时，是否报错 | 2.0.0以上版本 |
| register | register | boolean | 可选 | true | 服务治理 | 是否向此注册中心注册服务，如果设为false，将只订阅，不注册 | 2.0.5以上版本 |
| subscribe | subscribe | boolean | 可选 | true | 服务治理 | 是否向此注册中心订阅服务，如果设为false，将只注册，不订阅 | 2.0.5以上版本 |
| dynamic | dynamic | boolean | 可选 | true | 服务治理 | 服务是否动态注册，如果设为false，注册后将显示后disable状态，需人工启用，并且服务提供者停止时，也不会自动取消册，需人工禁用。 | 2.0.5以上版本 |
