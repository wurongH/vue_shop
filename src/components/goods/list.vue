<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="5">
          <el-input 
            size="small"
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" size="small" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table
        border
        stripe
        :data="tableData"
      >
      <el-table-column type="index"></el-table-column>
      <el-table-column
        v-for="(item, index) in tableColumn"
        :key="index"
        :label="item.label"
        :prop="item.name"
        :width="item.width"
      >
      </el-table-column>
      <el-table-column label="创建时间" prop="add_time" width="150px">
        <template slot-scope="scope">
          <span v-text="scope.row.add_time"></span>
        </template>
      </el-table-column>
      <el-table-column width="130px" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.goods_id)"></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeGoods(scope.row.goods_id)"></el-button>
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
          background
        >
        </el-pagination>
      </el-row>
    </el-card>
    <el-dialog
      title="商品编辑"
      :visible.sync="editGoodsDialog"
      width="40%"
      @close="editGoodsDialogClosed"
    >
      <el-form
        :model="editGoodsForm"
        :rules="editGoodsFormRules"
        ref="editGoodsFormRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input size="small" v-model="editGoodsForm.goods_name" ></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="goods_price">
          <el-input size="small" v-model="editGoodsForm.goods_price" ></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="goods_number">
          <el-input size="small" v-model="editGoodsForm.goods_number" ></el-input>
        </el-form-item>
        <el-form-item label="重量" prop="goods_weight">
          <el-input size="small" v-model="editGoodsForm.goods_weight" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="editGoodsDialog = false">取 消</el-button>
        <el-button size="small" type="primary" @click="editGoods">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import table from '@/mixins/tables.js'
import util from '@/mixins/util'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      tableColumn: [
        {name: 'goods_name', label: '商品名称'},
        {name: 'goods_price', label: '商品价格(元)', width: '100px'},
        {name: 'goods_weight', label: '重量', width: '80px'},
        {name: 'goods_number', label: '数量', width: '80px'}
      ],
      editGoodsForm: '',
      editGoodsDialog: false,
      editGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ]
      }
    }
  },
  mixins: [table],
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const {data: res} = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status === 200) {
        res.data.goods.map(d => {  
          d.add_time = util.Format(d.add_time)
        })  
        this.tableData = res.data.goods       
        this.total = res.data.total
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    async removeGoods(goodsId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'          
        }        
      ).catch(err => err)
      //确认删除  返回confirm
      //取消删除  返回cancel
      if (confirmResult == 'confirm') {
        const {data: res} = await this.$http.delete('goods/' + goodsId)
        if (res.meta.status === 200) {
          this.$message({
            message: res.meta.msg,
            type: 'success'
          })
          this.getList()
        } else {
          this.$message({
            message: res.meta.msg,
            type: 'error'
          })
        } 
      } else {
        this.$message({
          message: '已取消删除',
          type: 'info'
        })
      }
    },
    async showEditDialog(goodsId) {
      const {data: res} = await this.$http.get('goods/' + goodsId)
      if (res.meta.status === 200) {
        this.editGoodsForm = res.data
        this.editGoodsDialog = true
      }
    },
    editGoodsDialogClosed() {
      this.$refs.editGoodsFormRef.resetFields()
    },
    editGoods() {
      this.$refs.editGoodsFormRef.validate( async valid => {
        if (valid) {
          const {data: res} = await this.$http.put('goods/' + this.editGoodsForm.goods_id, {
            goods_name: this.editGoodsForm.goods_name,
            goods_price: this.editGoodsForm.goods_price,
            goods_number: this.editGoodsForm.goods_number,
            goods_weight: this.editGoodsForm.goods_weight,
            goods_cat: this.editGoodsForm.goods_cat
          }) 
          if (res.meta.status === 200) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.editGoodsDialog = false
            this.getList() 
          } else {
            this.$message({
              message: res.meta.msg,
              type: 'error'
            })
          }       
        }
      })
    },
    goAddPage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>

</style>
