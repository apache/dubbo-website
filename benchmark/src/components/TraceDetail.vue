<template>
  <div>
    <el-row>
      <el-col :span="6">
        <span>选择两个配置对比</span>
        <el-cascader :show-all-levels="false"
                     :props="props"
                     v-model="selectedOptions"
                     :options="cascaderOptions"
                     @change="handleCascaderChange"
                     clearable>

        </el-cascader>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
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

      <el-col :span="12">
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

    <!--    <el-table :data="tableData" border style="width: 100%">-->
    <!--      <el-table-column label="指标" width="180">-->
    <!--        <template slot-scope="scope">-->
    <!--          {{ scope.row['dubbo.protocol.serialization'] }}-->
    <!--        </template>-->
    <!--      </el-table-column>-->
    <!--      <el-table-column>-->
    <!--        <template slot-scope="{row}">-->
    <!--          <el-table-->
    <!--              :data="createSpanTree(row.spans_)"-->
    <!--              style="width: 100%"-->
    <!--              row-key="spanId_"-->
    <!--              border-->
    <!--              lazy-->
    <!--              :tree-props="{children: 'children'}"-->
    <!--          >-->
    <!--            <el-table-column prop="operationName_" label="日期"></el-table-column>-->
    <!--            <el-table-column prop="cost" label="耗时（ms）"></el-table-column>-->
    <!--          </el-table>-->
    <!--        </template>-->
    <!--      </el-table-column>-->
    <!--    </el-table>-->
  </div>
</template>

<script>
export default {
  name: 'TraceDetail',
  data() {
    return {
      rpcTable: [],
      serializationTable: [],
      leftTableTitle: '',
      leftTableDate: [],
      rightTableDate: [],
      rightTableTitle: '',

      selectedOptions: [],
      disabledRoots: [],
      disabledChildren: [],
      props: {multiple: true},
      cascaderOptions: [{
        value: 'rpc',
        label: 'RPC 协议',
        children: [{
          value: 'dubbo',
          label: 'Dubbo协议',
        }, {
          value: 'rmi',
          label: 'Rmi协议'
        }, {
          value: 'tri',
          label: 'Triple协议'
        }]
      }, {
        value: 'serialization',
        label: '序列化',
        children: [{
          value: 'hessian2',
          label: 'Hessian2'
        }, {
          value: 'fastjson2',
          label: 'Fastjson2'
        },{
          value: 'fastjson',
          label: 'Fastjson'
        },{
          value: 'avro',
          label: 'Avro'
        },{
          value: 'fst',
          label: 'Fst'
        },{
          value: 'gson',
          label: 'Gson'
        },{
          value: 'kryo',
          label: 'Kryo'
        }, {
          value: 'msgpack',
          label: 'Msgpack'
        }]
      }],
      tmpCascaderOptions: [{
        value: 'rpc',
        label: 'RPC 协议',
        children: [{
          value: 'dubbo',
          label: 'Dubbo协议',
        }, {
          value: 'rmi',
          label: 'Rmi协议'
        }, {
          value: 'tri',
          label: 'Triple协议'
        }]
      }, {
        value: 'serialization',
        label: '序列化',
        children: [{
          value: 'hessian2',
          label: 'Hessian2'
        }, {
          value: 'fastjson2',
          label: 'Fastjson2'
        },{
          value: 'fastjson',
          label: 'Fastjson'
        },{
          value: 'avro',
          label: 'Avro'
        },{
          value: 'fst',
          label: 'Fst'
        },{
          value: 'gson',
          label: 'Gson'
        },{
          value: 'kryo',
          label: 'Kryo'
        }, {
          value: 'msgpack',
          label: 'Msgpack'
        }]
      }]
    };
  },

  mounted() {
    this.initTable();
    this.selectedOptions = [['serialization', 'hessian2'], ['serialization', 'fastjson2']]
    this.handleCascaderChange(this.selectedOptions)
  },

  methods: {
    initTable() {

      let rpcResultList;
      this.$.ajax({
        type: "GET",
        async: false,
        url: "https://raw.githubusercontent.com/wxbty/jmh_result/main/test-results/fixed/rpc/merged_prop_traces.json",
        success: function (res) {
          rpcResultList = res
        }
      });

      try {
        this.rpcTable = JSON.parse(rpcResultList)
        console.log("this.rpcTable", this.rpcTable)
      } catch (error) {
        console.error("解析JMH结果字符串出错：", error);
      }

      let serializationResultList;
      this.$.ajax({
        type: "GET",
        async: false,
        url: "https://raw.githubusercontent.com/wxbty/jmh_result/main/test-results/fixed/serialization/merged_prop_traces.json",
        success: function (res) {
          serializationResultList = res;
        }
      });

      try {
        this.serializationTable = JSON.parse(serializationResultList)
        console.log("this.serializationResultList", this.serializationTable)
      } catch (error) {
        console.error("解析JMH结果字符串出错：", error);
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

    handleCascaderChange(value) {
      console.log("this.value", value)
      console.log("this.selectedOptions", this.selectedOptions)
      let selectedRoot

      this.cascaderOptions = this.deepCopy2DArray(this.tmpCascaderOptions)
      if (value != null && value.length > 0) {
        // 当用户选择一个根节点时，禁用其他根节点
        selectedRoot = this.cascaderOptions.find(item => item.value === value[0][0]);
      }

      if (selectedRoot) {
        this.disabledRoots = this.cascaderOptions
            .filter(item => item.value !== selectedRoot.value)
            .map(item => item.value);


        if (value.length > 2) {

          this.selectedOptions.splice(2)
          value = this.selectedOptions
          let myValue = value.map(item => item[1])
          this.disabledChildren = selectedRoot.children.filter(((item, index) => index >= 2 && !myValue.includes(item.value))).map(item => item.value);

        } else if (value.length === 2) {

          let myValue = value.map(item => item[1])
          this.disabledChildren = selectedRoot.children.filter(item => !myValue.includes(item.value)).map(item => item.value);

        } else {

          this.disabledChildren = []

        }
      } else {
        // 如果用户取消了选择，或者选择了子节点，重置禁用状态
        this.disabledRoots = [];
        this.disabledChildren = []
      }

      this.updateCascaderOptions(selectedRoot);

      this.updateTable();
    },

    updateCascaderOptions(selectedRoot) {
      // 根据禁用状态数组，动态修改数据源
      if (selectedRoot) {
        selectedRoot.children = selectedRoot.children.map(item => ({
          ...item,
          disabled: this.disabledChildren.includes(item.value),
        }));
      }

      this.cascaderOptions = this.cascaderOptions.map(item => ({
        ...item,
        disabled: this.disabledRoots.includes(item.value),
      }));
    },

    deepCopy2DArray(arr) {
      return JSON.parse(JSON.stringify(arr));
    },

    updateTable() {
      if (this.selectedOptions == null || this.selectedOptions.length === 0) {
        this.leftTableDate = []
        this.rightTableDate = []

        this.leftTableTitle = ''
        this.rightTableTitle = ''

        return
      }

      let type = this.selectedOptions[0][0];
      let value = this.selectedOptions.map(item => item[1])

      if (type === 'rpc') {
        let leftRpcFilter = this.rpcTable.find(item => value[0] === JSON.parse(item.prop)['dubbo.protocol.name']);
        let rightRpcFilter = this.rpcTable.find(item => value[1] === JSON.parse(item.prop)['dubbo.protocol.name']);

        this.leftTableDate = leftRpcFilter ? this.createSpanTree(leftRpcFilter.spans_) : []
        this.rightTableDate = rightRpcFilter ? this.createSpanTree(rightRpcFilter.spans_) : []

        this.leftTableTitle = leftRpcFilter ? JSON.parse(leftRpcFilter.prop)['dubbo.protocol.name'] : ''
        this.rightTableTitle = rightRpcFilter ? JSON.parse(rightRpcFilter.prop)['dubbo.protocol.name'] : ''
      }

      if (type === 'serialization') {
        let leftSerializationFilter = this.serializationTable.find(item => value[0] === JSON.parse(item.prop)['dubbo.protocol.serialization']);
        let rightSerializationFilter = this.serializationTable.find(item => value[1] === JSON.parse(item.prop)['dubbo.protocol.serialization']);

        this.leftTableDate = leftSerializationFilter ? this.createSpanTree(leftSerializationFilter.spans_) : []
        this.rightTableDate = rightSerializationFilter ? this.createSpanTree(rightSerializationFilter.spans_) : []

        this.leftTableTitle = leftSerializationFilter ? JSON.parse(leftSerializationFilter.prop)['dubbo.protocol.serialization'] : ''
        this.rightTableTitle = rightSerializationFilter ? JSON.parse(rightSerializationFilter.prop)['dubbo.protocol.serialization'] : ''
      }
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