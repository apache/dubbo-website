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
# Contribution

## Flow

* Direct adding new project, black-box dependent on Dubbo for function extension.
* Fork Dubbo on Github for BUG fixing or modify the framework.
* Pull Request after changing.

## Tasks

Funcation  | Type | Priority | Status | Claimer | Plan complete time | progress
------------- | ------------- | ------------- | ------------- | ------------- | ------------- | -------------
<Use Guideline> Translation | Document | High | Unclaimed | Pending | Pending | 0%
<Developing Guideline> translation |Document | High | Unclaimed | Pending | Pending |0%
Extension point compatibility testing |Testing | High | Claimed | 罗立树 | Pending | 0%
Performance benchmark testing | Testing | High | Unclaimed | Pending | Pending | 0%
Functional unit testing | Testing | High | Unclaimed | Pending | Pending | 0%
JTA/XA distributed transaction | Interceptor extension | High | Unclaimed | Pending | Pending | 0%
Thrift | Protocol extension | High | Developing done | 闾刚 | 2012-04-27 | 90%
ICE | Protocol extension | High | Unclaimed | Pending | Pending | 0%
ACE | Protocol extension | Low | Unclaimed | Pending | Pending | 0%
JSON-RPC | Protocol extension | Low | Unclaimed | Pending | Pending | 0%
XML-RPC | Protocol extension | Low | Unclaimed | Pending | Pending | 0%
JSR181&CXF(WebService) | Protocol extension | High | Developing done | 白文志 | 2012-04-27 | 90%
JSR311&JSR339(RestfulWebService) | Protocol extension | High | Unclaimed | Pending | Pending | 0%
JMS&ActiveMQ | Protocol extension | High | Unclaimed | Pending | Pending | 0%
Protobuf | Serialization extension | High | Researching | 朱启恒 | 2012-02-30 | 20%
Avro | Serialization extension | Low | Unclaimed | Pending | Pending | 0%
XSocket | Transmission extension | Low | Unclaimed | Pending | Pending | 0%
CGLib | Dynamic proxy extension | Low | Unclaimed | Pending | Pending | 0%
JNDI | Registry extension | High | Unclaimed | Pending | Pending | 0%
LDAP | Registry extension | Low | Unclaimed | Pending | Pending | 0%
JSR140&SLP | Registry extension | High | Unclaimed | Pending | Pending | 0%
UDDI | Registry extension | High | Unclaimed | Pending | Pending | 0%
JMX | Monitoring expansion | High | Unclaimed | Pending | Pending | 0%
SNMP | Monitoring expansion | High | Unclaimed | Pending | Pending | 0%
Cacti | Monitoring expansion | High | Unclaimed | Pending | Pending | 0%
Nagios | Monitoring expansion | High | Unclaimed | Pending | Pending | 0%
Logstash | Monitoring expansion | High | Unclaimed | Pending | Pending | 0%
JRobin | Monitoring expansion | High | Unclaimed | Pending | Pending | 0%
Maven | Package management | Low | Unclaimed | Pending | Pending | 0%
Subversion | Package management | Low | Unclaimed | Pending | Pending | 0%
JCR/JSR283 | Package management | Low | Unclaimed | Pending | Pending | 0%
SimpleDeployer | Local deployment agent | Low | Unclaimed | Pending | Pending | 0%
SimpleScheduler | Scheduler | Low | Unclaimed | Pending | Pending | 0%
