<template>
  <div>
    <el-row>
      <el-button type="primary" @click="open">触发Actions</el-button>
    </el-row>

    <el-row>
      <el-col :span="6">
        <span>选择具体配置</span>
        <el-cascader v-model="leftSelectedOptions"
                     :options="cascaderOptions"
                     clearable>

        </el-cascader>
        <div id="TriggerP99" style="width:100%;height:400px"></div>
      </el-col>
      <el-col :span="6">
        <span>选择具体配置</span>
        <el-cascader v-model="rightSelectedOptions"
                     :options="cascaderOptions"
                     clearable>

        </el-cascader>
        <div id="TriggerQps" style="width:100%;height:400px"></div>
      </el-col>

      <el-col :span="6">
        <el-header>
          <h1>{{ leftTableTitle }}</h1>
        </el-header>
        <el-table
            :data="leftTableDate"
            style="width: 100%"
            row-key="spanId_"
            border
            lazy
            default-expand-all
            :tree-props="{children: 'children'}"
        >
          <el-table-column prop="operationName_" label="方法名" min-width="90%"></el-table-column>
          <el-table-column prop="cost" label="耗时（ms）" min-width="10%"></el-table-column>
        </el-table>
      </el-col>

      <el-col :span="6">
        <el-header>
          <h1>{{ rightTableTitle }}</h1>
        </el-header>
        <el-table
            :data="rightTableDate"
            style="width: 100%"
            row-key="spanId_"
            border
            lazy
            default-expand-all
            :tree-props="{children: 'children'}"
        >
          <el-table-column prop="operationName_" label="方法名" min-width="90%"></el-table-column>
          <el-table-column prop="cost" label="耗时（ms）" min-width="10%"></el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'TriggerTraceDetail',
  data() {
    return {
      triggerTable: [],

      leftTableTitle: '',
      leftTableDate: [],
      rightTableDate: [],
      rightTableTitle: '',

      leftSelectedOptions: [],
      rightSelectedOptions: [],

      resultList: [],

      cascaderOptions: [{
        value: 'dubbo',
        label: 'Dubbo协议',
        children: [{
          value: 'hessian2',
          label: 'Hessian2'
        }, {
          value: 'fastjson2',
          label: 'Fastjson2'
        }, {
          value: 'fastjson',
          label: 'Fastjson'
        }, {
          value: 'avro',
          label: 'Avro'
        }, {
          value: 'fst',
          label: 'Fst'
        }, {
          value: 'gson',
          label: 'Gson'
        }, {
          value: 'kryo',
          label: 'Kryo'
        }, {
          value: 'msgpack',
          label: 'Msgpack'
        }]
      }, {
        value: 'rmi',
        label: 'Rmi协议',
        children: [{
          value: 'hessian2',
          label: 'Hessian2'
        }, {
          value: 'fastjson2',
          label: 'Fastjson2'
        }, {
          value: 'fastjson',
          label: 'Fastjson'
        }, {
          value: 'avro',
          label: 'Avro'
        }, {
          value: 'fst',
          label: 'Fst'
        }, {
          value: 'gson',
          label: 'Gson'
        }, {
          value: 'kryo',
          label: 'Kryo'
        }, {
          value: 'msgpack',
          label: 'Msgpack'
        }]
      }, {
        value: 'tri',
        label: 'Triple协议',
        children: [{
          value: 'hessian2',
          label: 'Hessian2'
        }, {
          value: 'fastjson2',
          label: 'Fastjson2'
        }, {
          value: 'fastjson',
          label: 'Fastjson'
        }, {
          value: 'avro',
          label: 'Avro'
        }, {
          value: 'fst',
          label: 'Fst'
        }, {
          value: 'gson',
          label: 'Gson'
        }, {
          value: 'kryo',
          label: 'Kryo'
        }, {
          value: 'msgpack',
          label: 'Msgpack'
        }]
      }],
    };
  },

  mounted() {
    try {
      this.init();
    } catch (error) {
      console.error("init：", error);
    }
    try {
      this.initTable();
    } catch (error) {
      console.error("initTable：", error);
    }
    try {
      this.sampleEcharts();
    } catch (error) {
      console.error("sampleEcharts：", error);
    }
    try {
      this.thrptEcharts();
    } catch (error) {
      console.error("thrptEcharts：", error);
    }
  },

  methods: {
    init() {
      let jmh;

      this.$.ajax({
        type: "GET",
        async: false,
        url: "https://raw.githubusercontent.com/wxbty/jmh_result/main/test-results/scenario/merged_prop_results.json",
        success: function (res) {
          jmh = res
        }
      });

      try {
        this.resultList = JSON.parse(jmh);
      } catch (error) {
        console.error("解析JMH结果字符串出错：", error);
      }
    },

    sampleEcharts() {
      // 基于准备好的dom，初始化echarts实例
      const myChart = this.$echarts.init(document.getElementById('TriggerP99'));

      let time = this.resultList[0].params.time
// 转换数据结构，按serialization属性分类并收集Item对象
      let collect = this.resultList
          .filter((a) => a.mode === 'sample')
          .map((result) => {
            // 注意这里只用一个参数接收当前元素
            let protocol = JSON.parse(result.params.prop)['dubbo.protocol.name'];
            let serialization = JSON.parse(result.params.prop)['dubbo.protocol.serialization']
            return {
              score: Math.round(result.primaryMetric.scorePercentiles['99.0'] * 1000),
              protocol: protocol + "-" + serialization
            };
          });

      // let seriesDate = collect.map((result) => {
      //   // 注意这里只用一个参数接收当前元素
      //   return {
      //     type: 'bar'
      //   };
      // });
      //
      // console.log(collect);
      // console.log(seriesDate);

      let option = {
        title: {
          text: 'P99对比',
          x: 'center',
          subtext: this.timestampToTime(time)
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          },
          formatter: function (params) {
            return params[0].data.score + 'ms';
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          // top: '3%',
          left: '3%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value',
          name: '耗时(ms)'
        },
        dataset: {
          dimensions: ['protocol', 'score'],
          source: collect
        },
        series: [
          {
            barWidth: '25%',
            type: 'bar',
            label: {
              //柱体上显示数值
              show: true, //开启显示
              position: 'top', //在上方显示
              textStyle: {
                //数值样式
                fontSize: '30px',
                color: '#666'
              },
            }
          }
        ]
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },

    thrptEcharts() {
      // 基于准备好的dom，初始化echarts实例
      const myChart = this.$echarts.init(document.getElementById('TriggerQps'));

      let time = this.resultList[0].params.time
// 转换数据结构，按serialization属性分类并收集Item对象
      let collect = this.resultList
          .filter((a) => a.mode === 'thrpt')
          .map((result) => {
            // 注意这里只用一个参数接收当前元素
            let protocol = JSON.parse(result.params.prop)['dubbo.protocol.name'];
            let serialization = JSON.parse(result.params.prop)['dubbo.protocol.serialization']
            return {
              score: Math.round(result.primaryMetric.scorePercentiles['99.0']),
              protocol: protocol + "-" + serialization
            };
          });

      // let seriesDate = collect.map((result) => {
      //   // 注意这里只用一个参数接收当前元素
      //   return {
      //     type: 'bar'
      //   };
      // });
      //
      // console.log(collect);
      // console.log(seriesDate);

      let option = {
        title: {
          text: 'QPS对比',
          x: 'center',
          subtext: this.timestampToTime(time)
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          },
          formatter: function (params) {
            return params[0].data.score + 'ops/s';
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          // top: '3%',
          left: '3%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value',
          name: 'ops/s'
        },
        dataset: {
          dimensions: ['protocol', 'score'],
          source: collect
        },
        series: [
          {
            barWidth: '25%',
            type: 'bar',
            label: {
              //柱体上显示数值
              show: true, //开启显示
              position: 'top', //在上方显示
              textStyle: {
                //数值样式
                fontSize: '30px',
                color: '#666'
              },
            }
          }
        ]
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },

    timestampToTime(timestamp) {
      let date = new Date(Number(timestamp));
      let Y = date.getFullYear() + '-';
      let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
      let D = date.getDate() + ' ';
      let h = date.getHours() + ':';
      let m = date.getMinutes() + ':';
      let s = date.getSeconds();

      return Y + M + D + h + m + s;
    },
    initTable() {

      let rpcResultList;
      this.$.ajax({
        type: "GET",
        async: false,
        url: "https://raw.githubusercontent.com/wxbty/jmh_result/main/test-results/scenario/merged_prop_traces.json",
        success: function (res) {
          rpcResultList = res
        }
      });

      try {
        this.triggerTable = JSON.parse(rpcResultList)
        console.log("this.rpcTable", this.triggerTable)
      } catch (error) {
        console.error("解析JMH结果字符串出错：", error);
      }

      this.leftTableDate = this.createSpanTree(this.triggerTable != null && this.triggerTable.length > 0 ? this.triggerTable[0].spans_ : [])
      this.rightTableDate = this.createSpanTree(this.triggerTable != null && this.triggerTable.length > 1 ? this.triggerTable[1].spans_ : [])

      this.leftTableTitle = this.triggerTable != null && this.triggerTable.length > 0 ? this.triggerTable[0].prop : ""
      this.rightTableTitle = this.triggerTable != null && this.triggerTable.length > 1 ? this.triggerTable[1].prop : ""
    }
    ,

    createSpanTree(spans) {
      console.log(spans)
      let spanMap = new Map();
      let rootSpans = [];

      // 遍历原始spans，初始化每个span，创建映射表和寻找根span
      for (let span of spans) {
        spanMap.set(span.spanId_, {
          ...span,
          spanId_: span.spanId_.toString(),
          cost: span.endTime_ - span.startTime_,
          children: []
        });
        if (span.parentSpanId_ === -1) {
          rootSpans.push(spanMap.get(span.spanId_));
        }
      }

      // 根据 parentSpanId_ 属性构建树结构
      for (let span of spans) {
        if (span.parentSpanId_ !== -1) {
          let parentSpan = spanMap.get(span.parentSpanId_);
          if (parentSpan) {
            parentSpan.children.push(spanMap.get(span.spanId_));
          }
        }
      }

      console.log(rootSpans)
      return rootSpans;
    },

    open() {
      if ((this.leftSelectedOptions == null || this.leftSelectedOptions.length === 0) && (this.rightSelectedOptions == null || this.rightSelectedOptions.length === 0)) {
        this.$message({
          type: 'warning',
          message: '请选择至少一个'
        });
        return
      }

      let leftRpc = null;
      let leftSerialization = null;

      console.log(this.leftSelectedOptions)
      if (this.leftSelectedOptions.length > 0) {
        leftRpc = this.leftSelectedOptions[0]
        leftSerialization = this.leftSelectedOptions[1]
      }

      let rightRpc = null;
      let rightSerialization = null;
      if (this.rightSelectedOptions.length > 0) {
        rightRpc = this.rightSelectedOptions[0]
        rightSerialization = this.rightSelectedOptions[1]
      }

      const h = this.$createElement;

      this.$msgbox({
        title: '消息',
        message: h('p', null, [
          h('p', null, "左边内容：rpc协议：" + (leftRpc == null ? "" : leftRpc) + "序列化：" + (leftSerialization == null ? "" : leftSerialization)),
          h('p', null, "右边内容：rpc协议：" + (rightRpc == null ? "" : rightRpc) + "序列化：" + (rightSerialization == null ? "" : rightSerialization)),
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            let leftSendDate = ""
            if (leftRpc) {
              leftSendDate += "dubbo.protocol.name|" + leftRpc;
            }
            if (leftSerialization) {
              if (leftRpc) {
                leftSendDate += "|";
              }
              leftSendDate += "dubbo.protocol.serialization|" + leftSerialization;
            }

            let rightSendDate = ""
            if (rightRpc) {
              rightSendDate += "dubbo.protocol.name|" + rightRpc;
            }
            if (rightSerialization) {
              if (rightRpc) {
                rightSendDate += "|";
              }
              rightSendDate += "dubbo.protocol.serialization|" + rightSerialization;
            }

            let prop = leftSendDate + (leftSendDate ? "@" : "") + rightSendDate;

            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '执行中...';
            this.$.ajax({
              url: "https://api.github.com/repos/wxbty/dubbo/dispatches",
              type: "POST",
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa("username: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"));
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader("Accept", "application/vnd.github.everest-preview+json");
              },
              data: JSON.stringify({
                "event_type": "manual-trigger",
                "client_payload": {
                  "prop": prop
                }
              }),
              success: function (data) {
                instance.confirmButtonLoading = false;
                console.log("Success:", data);
                done();
              },
              error: (xhr, status, error) => {
                instance.confirmButtonLoading = false;
                console.error("Error:", error);
                this.$message({
                  type: 'error',
                  message: '触发失败'
                });
              }
            });
          } else {
            done();
          }
        }
      }).then(() => {
        this.$message({
          type: 'success',
          message: '触发成功！结果将在一小时内显示'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>