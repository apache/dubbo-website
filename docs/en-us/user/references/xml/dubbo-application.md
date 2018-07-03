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
# dubbo:application

Application configuration. The corresponding class: `com.alibaba.dubbo.config.ApplicationConfig`

| Property | Corresponding URL parameter | Type | Requisite | Default | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | application | string | <b>Y</b> | | service governance | Application name is the unique identifier of an application. It is for registry combing the dependencies of applications. Note: Consumer and provider application name should not be the same, and this parameter is not a match condition. As a suggestion, you can name it as your project name. For example, kylin application invokes the service of morgan application, then you can name kylin application as "kylin", and morgan application as "morgan". Maybe kylin also works as a provider, but kylin should still called "kylin". In this way, registry can understand the dependence of applications | above 1.0.16 |
| version | application.version | string | N | | service governance | The version of current application | above 2.2.0 |
| owner | owner | string | N | | service governance | Application manager. Pls. fill in the mailbox prefix of the person in charge | above 2.0.5 |
| organization | organization | string | N | | service governance | Organization name is for registry distinguishing between the source of service. As a suggestion, this property should be written in config file directly. Such as china,intl,itu,crm,asc,dw,aliexpress etc. | above 2.0.0 |
| architecture <br class="atl-forced-newline" /> | architecture <br class="atl-forced-newline" /> | string | N | | service governance | The architecture of service layering. Like intl,china and so on. Different architecture use different layer | above 2.0.7 |
| environment | environment | string | N | | service governance | Application environment. Like develop,test,product. Work as the limit condition of developing new function| above 2.0.0 |
| compiler | compiler | string | N | javassist | performance optimization | Java class compile.It is used for the generating of dynamic class. The options are JDK and javassist | above 2.1.0 |
| logger | logger | string | N | slf4j | performance optimization | The format of log output，The options are slf4j,jcl,log4j and jdk | above 2.2.0 |