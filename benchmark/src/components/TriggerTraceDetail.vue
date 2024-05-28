<template>
  <div>
    <div class="form-layout">
      <el-form label-width="100px" class="left-form">
        <el-form-item label="仓库地址" prop="repo_url">
          <el-input v-model="REPO_URL" placeholder="仓库地址"></el-input>
        </el-form-item>

        <el-form-item label="Github Token" prop="PUSH_TOKEN">
          <el-input v-model="PUSH_TOKEN" placeholder="token"></el-input>
        </el-form-item>

        <!-- 使用一个新的form-item来包裹后三个需要放在一行的元素，但这样做并不是标准的。通常，form-item直接放在form下面 -->
        <el-row :gutter="20" class="form-row">
          <el-col :span="8">
            <el-form-item label="左侧配置" prop="leftSelectedOptions" class="form-item-in-row">
              <el-cascader v-model="leftSelectedOptions" :options="cascaderOptions" clearable></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="右侧配置" prop="rightSelectedOptions" class="form-item-in-row">
              <el-cascader v-model="rightSelectedOptions" :options="cascaderOptions" clearable></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item class="form-item-in-row">
              <el-button type="primary" @click="open">开始运行</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="right-text">
        <div
            style="font-size: 16px; line-height: 1.5; border: 1px solid #ccc; padding: 10px; margin-bottom: 20px; text-decoration: none; text-align: left;">
          <p style="text-align: left;">用户需提供一个自己的GitHub仓库来存储数据，可以新创建一个，
              也可使用现有的。您只需要参照示例仓库（<a href="https://github.com/apache/dubbo-awesome" target="_blank">jmh_result</a>可直接fork）
            的workflow的配置即可。此外，为确保有权限推送数据，还需配置用户的GitHub Token。</p>
        </div>
      </div>
    </div>

    <el-row>
      <el-col :span="6">
        <div id="TriggerP99" style="width:100%;height:400px;margin-top: 30px"></div>
      </el-col>
      <el-col :span="6">
        <div id="TriggerQps" style="width:100%;height:400px;margin-top: 30px"></div>
      </el-col>
      <el-col :span="6">
        <el-header>
          <h1 style="overflow: hidden;  white-space: nowrap;  text-overflow: ellipsis">{{ leftTableTitle }}</h1>
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
          <el-table-column prop="operationName_" label="方法名" min-width="82%"></el-table-column>
          <el-table-column prop="cost" label="耗时（ms）" min-width="18%"></el-table-column>
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
          <el-table-column prop="operationName_" label="方法名" min-width="82%"></el-table-column>
          <el-table-column prop="cost" label="耗时（ms）" min-width="18%"></el-table-column>
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
      REPO_URL: null,
      PUSH_NAME: null,
      REPO_NAME: null,
      PUSH_TOKEN: null,

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
      this.sampleEcharts();
      this.thrptEcharts();
    } catch (error) {
      console.error("init：", error);
    }
    try {
      this.initTable();
    } catch (error) {
      console.error("initTable：", error);
    }
  },

  methods: {
    init() {
      this.REPO_URL = localStorage.getItem('REPO_URL') || ''
      this.PUSH_NAME = localStorage.getItem('PUSH_NAME') || ''
      this.REPO_NAME = localStorage.getItem('REPO_NAME') || ''
      this.PUSH_TOKEN = localStorage.getItem('PUSH_TOKEN') || ''


      if (this.PUSH_NAME && this.REPO_NAME) {
        let jmh;

        const gitUrlPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\.git$/; // 正则表达式匹配带.git后缀的GitHub仓库URL
        const match = this.REPO_URL.match(gitUrlPattern);
        if (match) {
          this.PUSH_NAME = match[1]; // 用户名是第一个捕获组
          this.REPO_NAME = match[2]; // 仓库名是第二个捕获组
        }

        this.$.ajax({
          type: "GET",
          async: false,
          url: "https://raw.githubusercontent.com/" + this.PUSH_NAME + "/" + this.REPO_NAME + "/master/test-results/scenario/merged_prop_results.json",
          success: function (res) {
            jmh = res
          }
        });

        try {
          this.resultList = JSON.parse(jmh);
        } catch (error) {
          console.error("解析JMH结果字符串出错：", error);
          throw error;
        }
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
              score: Number((result.primaryMetric.scorePercentiles['99.0'] * 1000).toFixed(1)),
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
                fontSize: '15px',
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
                fontSize: '15px',
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

      if (this.PUSH_NAME && this.REPO_NAME) {
        let jmh;

        this.$.ajax({
          type: "GET",
          async: false,
          url: "https://raw.githubusercontent.com/" + this.PUSH_NAME + "/" + this.REPO_NAME + "/master/test-results/scenario/merged_prop_traces.json",
          success: function (res) {
            jmh = res
          }
        });

        try {
          this.triggerTable = JSON.parse(jmh);
        } catch (error) {
          console.error("解析JMH结果字符串出错：", error);
        }

        this.leftTableDate = this.createSpanTree(this.triggerTable != null && this.triggerTable.length > 0 ? this.triggerTable[0].spans_ : [])
        this.rightTableDate = this.createSpanTree(this.triggerTable != null && this.triggerTable.length > 1 ? this.triggerTable[1].spans_ : [])

        this.leftTableTitle = this.triggerTable != null && this.triggerTable.length > 0 ? JSON.parse(this.triggerTable[0].prop)['dubbo.protocol.name'] + "-" + JSON.parse(this.triggerTable[0].prop)['dubbo.protocol.serialization'] : ""
        this.rightTableTitle = this.triggerTable != null && this.triggerTable.length > 1 ? JSON.parse(this.triggerTable[1].prop)['dubbo.protocol.name'] + "-" + JSON.parse(this.triggerTable[1].prop)['dubbo.protocol.serialization'] : ""
      }

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
      if (!this.PUSH_TOKEN) {
        this.$message({
          type: 'warning',
          message: 'token为空'
        });
        return
      }
      if (!this.REPO_URL) {
        this.$message({
          type: 'warning',
          message: '仓库地址为空'
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

            const gitUrlPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\.git$/; // 正则表达式匹配带.git后缀的GitHub仓库URL
            const match = this.REPO_URL.match(gitUrlPattern);
            if (match) {
              this.PUSH_NAME = match[1]; // 用户名是第一个捕获组
              this.REPO_NAME = match[2]; // 仓库名是第二个捕获组
            } else {
              this.PUSH_NAME = '';
              this.REPO_NAME = '';
              this.$message({
                type: 'error',
                message: '输入的URL格式不正确，请确保它是带有.git后缀的GitHub仓库URL'
              });
            }

            this.$.ajax({
              url: "https://api.github.com/repos/" + this.PUSH_NAME + "/" + this.REPO_NAME + "/dispatches",
              type: "POST",
              beforeSend: (xhr) => {
                xhr.setRequestHeader("Authorization", "Basic " + btoa("username:" + this.PUSH_TOKEN));
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader("Accept", "application/vnd.github.everest-preview+json");
              },
              data: JSON.stringify({
                "event_type": "manual-trigger",
                "client_payload": {
                  "prop": prop,
                  "PUSH_NAME": this.PUSH_NAME,
                  "REPO_NAME": this.REPO_NAME,
                  "PUSH_TOKEN": this.PUSH_TOKEN,
                  "RESULTS_REPO_BRANCH": 'master'
                }
              }),

              PUSH_NAME: null,
              REPO_NAME: null,
              PUSH_TOKEN: null,

              success: (data) => {
                instance.confirmButtonLoading = false;
                console.log("Success:", data);
                localStorage.setItem('PUSH_NAME', this.PUSH_NAME)
                localStorage.setItem('REPO_NAME', this.REPO_NAME)
                localStorage.setItem('PUSH_TOKEN', this.PUSH_TOKEN)
                localStorage.setItem('REPO_URL', this.REPO_URL)
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

.form-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 根据需要调整垂直对齐方式 */
}

.left-form {
  flex: 1; /* 占据剩余空间的一部分 */
  max-width: calc(50% - 20px); /* 假设两边间隔为20px，则左侧表单最大宽度为50%减去间隔 */
  margin-right: 20px; /* 右边距，与.right-text保持间隔 */
}

.right-text {
  flex-shrink: 0; /* 防止.right-text被压缩 */
  width: calc(50% - 20px); /* 右侧文本区域宽度 */
  /* 其他样式，如字体大小、颜色等 */
}

.left-form .el-form-item__label {
  text-align: left; /* 确保标签左对齐 */
}

.left-form .el-row {
  display: flex; /* 使用Flexbox布局 */
  align-items: center; /* 垂直居中 */
}

.left-form .el-col {
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
}
</style>