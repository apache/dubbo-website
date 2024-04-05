<template>
  <div id="app">
    <div id="PullRequestSample" style="width:100%;height:400px"></div>
    <div id="PullRequestThrpt" style="width:100%;height:400px"></div>
  </div>
</template>

<script>

export default {
  name: 'PullRequest',
  data() {
    return {
      resultList: [],
    }
  },
  mounted() {
    this.init();
    this.sampleEcharts();
    this.thrptEcharts();
  },
  methods: {
    init() {
      let jmh;

      this.$.ajax({
        type: "GET",
        async: false,
        url: "https://raw.githubusercontent.com/wxbty/jmh_result/main/test-results/pr/merged_results.json",
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
      const myChart = this.$echarts.init(document.getElementById('PullRequestSample'));

// 转换数据结构，按serialization属性分类并收集Item对象
      let collect = this.resultList
          .filter(a => a.mode === 'sample')
          // .filter(a => a.params['dubbo.protocol.serialization'] === 'hessian2')
          // .filter(a => filterSerialization.includes(a.params.serialization) && filterProtocol.includes(a.params.protocol))
          .reduce((acc, result) => {
            let {time, serialization, protocol} = result.params;
            let item = {
              time: Number(time),
              score: Math.round(result.primaryMetric.scorePercentiles['99.0'] * 1000),
              serialization: serialization,
              protocol: protocol,
              commitId: result.commitId
            };
            let key = protocol + "-" + serialization;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(item);
            return acc;
          }, {});

// 创建一个存储Template对象的数组
      let templateList = {};

      Object.entries(collect).forEach(([key, items]) => {
        // 按时间升序排序
        let sortedItems = items.sort((a, b) => a.time - b.time);

        templateList[key] = {
          time: sortedItems.map(i => i.time),
          score: sortedItems.map(i => i.score),
          commitId: sortedItems.map(i => i.commitId)
        };
      });

// 使用时间类型的轴
//       let xAxisData = Array.from(new Set([].concat(...Object.values(templateList).map(obj => obj.time)))).sort((a, b) => a - b);

// 自定义时间轴的标签格式
      function formatDate(timestamp) {
        var date = new Date(timestamp);
        return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
      }

// 生成ECharts所需的series数据结构
      let seriesData = Object.keys(templateList).map((key) => {
        let data = templateList[key].time.map((time, index) => {
          return {
            name: formatDate(time),
            value: [time, templateList[key].score[index], templateList[key].commitId[index]]
          };
        });
        return {
          name: key,
          type: 'line',
          showSymbol: true, // 显示标记点
          hoverAnimation: false, // 关闭hover动画
          symbolSize: 10, // 设置点的直径大小为10
          markPoint: {
            data: [
              {type: 'max', name: 'Max'},
              {type: 'min', name: 'Min'}
            ]
          },
          markLine: {
            data: [{type: 'average', name: 'Avg'}]
          },
          data: data
        };
      });

// ECharts配置对象
      let option = {
        // animation: false,
        title: {
          text: '提交记录 P99',
          x: 'center',
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let res = params[0].axisValueLabel + '<br/>';
            params.forEach(item => {
              res += item.marker + " " + (item.data.value[2] !== null ? item.data.value[2] : '') + "：" + (item.data.value[1] !== null ? item.data.value[1] : '-') + 'ms<br/>';
            });
            return res;
          }
        },
        // legend: {
        //   data: Object.keys(templateList)
        // },
        grid: {
          // top: '3%',
          left: '3%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'time',
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          name: '耗时(ms)'
        },
        series: seriesData
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    }
    ,
    thrptEcharts() {
      // 基于准备好的dom，初始化echarts实例
      const myChart = this.$echarts.init(document.getElementById('PullRequestThrpt'));

// 转换数据结构，按serialization属性分类并收集Item对象
      let collect = this.resultList
          .filter(a => a.mode === 'thrpt')
          // .filter(a => a.params['dubbo.protocol.serialization'] === 'hessian2')
          // .filter(a => filterSerialization.includes(a.params.serialization) && filterProtocol.includes(a.params.protocol))
          .reduce((acc, result) => {
            let {time, serialization, protocol} = result.params;
            let item = {
              time: Number(time),
              score: Math.round(result.primaryMetric.scorePercentiles['99.0']),
              serialization: serialization,
              protocol: protocol
            };
            let key = protocol + "-" + serialization;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(item);
            return acc;
          }, {});

// 创建一个存储Template对象的数组
      let templateList = {};

      Object.entries(collect).forEach(([key, items]) => {
        // 按时间升序排序
        let sortedItems = items.sort((a, b) => a.time - b.time);

        templateList[key] = {
          time: sortedItems.map(i => i.time),
          score: sortedItems.map(i => i.score)
        };
      });

// 使用时间类型的轴
//       let xAxisData = Array.from(new Set([].concat(...Object.values(templateList).map(obj => obj.time)))).sort((a, b) => a - b);

// 自定义时间轴的标签格式
      function formatDate(timestamp) {
        var date = new Date(timestamp);
        return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
      }

// 生成ECharts所需的series数据结构
      let seriesData = Object.keys(templateList).map((key) => {
        let data = templateList[key].time.map((time, index) => {
          return {
            name: formatDate(time),
            value: [time, templateList[key].score[index]]
          };
        });
        return {
          name: key,
          type: 'line',
          showSymbol: true, // 显示标记点
          hoverAnimation: false, // 关闭hover动画
          symbolSize: 10, // 设置点的直径大小为10
          markPoint: {
            data: [
              {type: 'max', name: 'Max'},
              {type: 'min', name: 'Min'}
            ]
          },
          markLine: {
            data: [{type: 'average', name: 'Avg'}]
          },
          data: data
        };
      });

// ECharts配置对象
      let option = {
        // animation: false,
        title: {
          text: '提交 QPS',
          x: 'center',
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let res = params[0].axisValueLabel + '<br/>';
            params.forEach(item => {
              res += item.marker + " " + (item.data.value[1] !== null ? item.data.value[1] : '-') + 'ops/s<br/>';
            });
            return res;
          }
        },
        // legend: {
        //   data: Object.keys(templateList)
        // },
        grid: {
          // top: '3%',
          left: '3%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'time',
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          name: 'ops/s'
        },
        series: seriesData
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    }
  }
}

</script>

<style scoped>

</style>