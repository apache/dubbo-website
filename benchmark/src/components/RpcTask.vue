<template>
  <div id="app">
    <div id="RpcTaskP99" style="width:100%;height:400px"></div>
    <div id="RpcTaskQPS" style="width:100%;height:400px"></div>
  </div>
</template>

<script>
export default {
  name: 'RpcTask',
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

// 获取JMH结果字符串
      let jmh;
      this.$.ajax({
        type: 'GET',
        async: false,
        url: 'https://raw.githubusercontent.com/wxbty/jmh_result/main/test-results/fixed/rpc/merged_prop_results.json',
        success: function (res) {
          jmh = res;
        }
      });


      try {
        this.resultList = JSON.parse(jmh);
      } catch (error) {
        console.error('解析JMH结果字符串出错：', error);
      }

    },
    sampleEcharts() {
      // 基于准备好的dom，初始化echarts实例
      const myChart = this.$echarts.init(document.getElementById('RpcTaskP99'));


      let time = this.resultList[0].params.time
// 转换数据结构，按serialization属性分类并收集Item对象
      let collect = this.resultList
          .filter((a) => a.mode === 'sample')
          .map((result) => {
            // 注意这里只用一个参数接收当前元素
            let protocol = JSON.parse(result.params.prop)['dubbo.protocol.name'];
            return {
              score: Math.round(result.primaryMetric.scorePercentiles['99.0'] * 1000),
              protocol: protocol
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
          text: 'RPC协议 P99对比',
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
            barWidth: '35%',
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
      const myChart = this.$echarts.init(document.getElementById('RpcTaskQPS'));


      let time = this.resultList[0].params.time
// 转换数据结构，按serialization属性分类并收集Item对象
      let collect = this.resultList
          .filter((a) => a.mode === 'thrpt')
          .map((result) => {
            // 注意这里只用一个参数接收当前元素
            let protocol = JSON.parse(result.params.prop)['dubbo.protocol.name'];
            return {
              score: Math.round(result.primaryMetric.scorePercentiles['99.0']),
              protocol: protocol
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
          text: 'RPC协议 QPS对比',
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
            barWidth: '35%',
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
    }
  }
}

</script>

<style scoped>

</style>