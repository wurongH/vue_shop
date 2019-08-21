<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type="primary" size="small" @click="ShowAddCateDialog">添加分类</el-button>
      </el-row>
      <tree-table
        class="treeTable"
        :data="tableData"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted == false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
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
    </el-card>
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialog"
      width="40%"
      @close="addCateClose"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input
            size="small"
            v-model="addCateForm.cat_name"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader 
            size="small"
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps" 
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable 
            change-on-select
          >

          </el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="addCateDialog = false">取 消</el-button>
        <el-button size="small" type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>


    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialog"
      width="40%"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input
            size="small"
            v-model="editCateForm.cat_name"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="editCateDialog = false">取 消</el-button>
        <el-button size="small" type="primary" @click="editCate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import table from '@/mixins/tables.js'
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      columns: [
        {label: '分类名称', prop: 'cat_name', minWidth: '220px'},
        {label: '是否有效', minWidth: '160px', type: 'template', template: 'isOk'},
        {label: '排序', minWidth: '160px', type: 'template', template: 'order'},
        {label: '操作', width: '180px', type: 'template', template: 'opt'},
      ],
      addCateDialog: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [{required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      editCateDialog: false,
      editCateForm: {},
      editCateFormRules: {
        cat_name: [{required: true, message: '请输入分类名称', trigger: 'blur' }]
      }
    }
  },
  mixins: [table],
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const {data: res} = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status == 200) {
        this.tableData = res.data.result
        this.total = res.data.total
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    addCateClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    ShowAddCateDialog() {
      this.getParentCateList()
      this.addCateDialog = true
    },
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {
        params: { type:2 }
      })
      if (res.meta.status == 200) {
        this.parentCateList = res.data
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      
    },
    addCate() {
      this.$refs.addCateFormRef.validate( async valid => {
        if (valid) {
          const {data: res} = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status == 201) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.getList()
            this.addCateDialog = false
          } else {
            this.$message({
              message: res.meta.msg,
              type: 'error'
            })
          }
        }
      })
      
    },
    async showEditCateDialog(id) {
      const {data: res} = await this.$http.get('categories/' + id)
      if (res.meta.status == 200) {
        this.editCateForm = res.data
        this.editCateDialog = true
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })        
      }      
    },
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (valid) {
          const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, {
            cat_name: this.editCateForm.cat_name
          })
          if (res.meta.status == 200) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.editCateDialog = false
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
    async removeCate(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',  {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'          
        }      
      ).catch(err => err)
      //确认删除  返回confirm
      //取消删除  返回cancel
      if (confirmResult == 'confirm') {
        const {data: res} = await this.$http.delete('categories/' + id)
        if (res.meta.status == 200) {
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
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>