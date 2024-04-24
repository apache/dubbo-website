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
    <el-row>
      <el-divider><span style="font-size: 20px;">提交性能趋势</span></el-divider>
      <el-col :span="12"><PullRequest></PullRequest></el-col>
      <el-col :span="12"><ScheduledTask></ScheduledTask></el-col>
    </el-row>
    <el-row style="margin-top: 60px">
      <el-divider><span style="font-size: 20px;">相同场景对比</span></el-divider>
      <el-col :span="12"><RpcTask></RpcTask></el-col>
      <el-col :span="12"><SerializationTask></SerializationTask></el-col>
    </el-row>
    <el-row>
      <el-col :span="24"><TraceDetail></TraceDetail></el-col>
    </el-row>

    <el-row style="margin-top: 100px">
      <el-divider><span style="font-size: 20px;">手动触发对比</span></el-divider>
      <el-col :span="24"><trigger-trace-detail></trigger-trace-detail></el-col>
    </el-row>
  </div>
</template>

<script>
import PullRequest from "@/components/PullRequest.vue";
import ScheduledTask from "@/components/ScheduledTask.vue";
import TraceDetail from "@/components/TraceDetail.vue";
import RpcTask from "@/components/RpcTask.vue";
import SerializationTask from "@/components/SerializationTask.vue";
import TriggerTraceDetail from "@/components/TriggerTraceDetail.vue";

export default {
  name: 'App',
  components: {
    TriggerTraceDetail,
    SerializationTask,
    RpcTask,
    TraceDetail,
    ScheduledTask,
    PullRequest
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
