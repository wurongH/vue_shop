<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="7">
          <el-input 
            size="small" 
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @click="getList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table
        :data="tableData"
        border
        stripe
      >
        <el-table-column type="index"></el-table-column>
        <el-table-column
          v-for="(item, index) in tableColumn"
          :key="index"
          :label="item.label"
          :prop="item.name"         
        >
        </el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag size="samll" type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag size="small" type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
        </el-table-column>
        <el-table-column label="操作" width="130px" align="center"> 
          <template slot-scope="scope">
            <el-button 
              size="mini" 
              type="primary" 
              icon="el-icon-edit" 
              @click="showEditDialog(scope.row)"
            >
            </el-button>
            <el-button 
              size="mini" 
              type="success" 
              icon="el-icon-location-outline"
              @click="showLocationDialog(scope.row)"
            >
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </el-row>
    </el-card>
    <el-dialog
      title="修改地址"
      :visible.sync="editLocation"
      @close="addressDialogClosed"
      width="40%"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader 
            :options="cityData" 
            v-model="addressForm.address1" 
            style="width: 100%"
            expandTrigger="hover"
            size="small"
            >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2" size="small"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="editLocation = false">取 消</el-button>
        <!-- 后端未提供修改地址api  -->
        <el-button size="small" type="primary" @click="editLocation = false">确 定</el-button>
      </div>    
    </el-dialog>

    <el-dialog
      title="物流地址"
      :visible.sync="progressVisible"
      width="40%"
    >
      <el-timeline>
        <el-timeline-item v-for="(item, index) in progressInfo" :key="index" :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>    
  </div>
</template>
<script>
import table from '@/mixins/tables.js'
import util from '@/mixins/util'
import cityData from './citydata.js'
export default {
  data() {
    return {
      tableColumn: [
        {name: 'order_number', label: '订单编号'},
        {name: 'order_price', label: '订单价格'}
      ],
      editLocation: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ],
      },
      cityData,
      progressVisible: false,
      progressInfo: []

    }
  },
  mixins: [table],
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const {data: res} = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status == 200) {
        res.data.goods.map(d => {
          d.create_time = util.Format(d.create_time)
        })
        this.tableData  = res.data.goods
        this.total = res.data.total
      } else {
        this.$message({
          message: res.meta.status,
          type: 'error'
        })
      }
    },
    showEditDialog() {
      this.editLocation = true
    },
    // 供测试的物流单号：1106975712662
    async showLocationDialog() {
      const {data: res} = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status == 200) {
        this.progressInfo = res.data
        this.progressVisible = true
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
  },
}
</script>
<style lang="less" scope>
  @import '../../plugins/timeline/timeline.css';
  @import '../../plugins/timeline-item/timeline-item.css';
</style>