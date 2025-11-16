<template>
  <div id="app">
    <el-row>
      <el-col :span="24"><div style="font-size: 30px">Dubbo 基准测试</div></el-col>
    </el-row>
    <el-row>
      <el-col :span="24"><div style="font-size: 15px; text-align: right;">
        <a target="_blank"
           href="https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners#standard-github-hosted-runners-for-public-repositories">
          32并发线程 Linux 4C8T 16GB JDK1.8</a>
      </div>
      </el-col>
    </el-row>

    <el-row style="margin-top: 100px">
      <el-divider><span style="font-size: 20px;">手动触发对比</span></el-divider>
      <el-col :span="24"><trigger-trace-detail></trigger-trace-detail></el-col>
    </el-row>
  </div>
</template>

<script>
import TriggerTraceDetail from "@/components/TriggerTraceDetail.vue";

export default {
  name: 'App',
  components: {
    TriggerTraceDetail
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  //margin-top: 60px;
}
</style>
