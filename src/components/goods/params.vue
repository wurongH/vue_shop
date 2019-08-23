<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
      >
      </el-alert>
      <el-row class="cata_select">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            size="small"
            expandTrigger="hover"
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          >
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialog=true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag 
                  closable 
                  class="tags" 
                  v-for="(item, index) in scope.row.attr_vals" 
                  :key="index"
                  @close="tagClose(index, scope.row)"
                >
                {{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.tagInputVisible"
                  v-model="scope.row.tagInputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button 
                  v-else 
                  class="button-new-tag" 
                  size="small" 
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialog=true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag 
                  closable 
                  class="tags" 
                  v-for="(item, index) in scope.row.attr_vals" 
                  :key="index"
                  @close="tagClose(index, scope.row)"
                >
                {{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.tagInputVisible"
                  v-model="scope.row.tagInputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button 
                  v-else 
                  class="button-new-tag" 
                  size="small" 
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加 -->
    <el-dialog 
      :title=" '添加' + titleText"
      :visible.sync="addDialog"
      width="40%"
      @close="addDialogClosed"
    >
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input  v-model="addForm.attr_name" size="small">
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="addDialog = false" size="small">取 消</el-button>
      <el-button type="primary" @click="addParams" size="small">确 定</el-button>
    </div>
    </el-dialog>
    <!-- 修改 -->
    <el-dialog 
      :title=" '修改' + titleText"
      :visible.sync="editDialog"
      width="40%"
      @close="editDialogClosed"
    >
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input  v-model="editForm.attr_name" size="small">
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="editDialog = false" size="small">取 消</el-button>
      <el-button type="primary" @click="editParams" size="small">确 定</el-button>
    </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: [],
      selectedCateKeys: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialog: false,
      addForm: {
        attr_name: '',
      },
      addFormRules:{
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
      editDialog: false,
      editForm: {},
      editFormRules:{
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      } 
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.selectedCateKeys.length == 3) {
        return this.selectedCateKeys[2]
      } else {
        return null
      }
    },
    titleText() {
      if (this.activeName == 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
    
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status == 200) {
        this.cateList = res.data
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    handleChange() {
      this.getParamsData()
    },
    handleTabClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedCateKeys.length !==3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      } 
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {sel: this.activeName}
      })
      if (res.meta.status == 200) {
        res.data.map(d=> {
          d.attr_vals = d.attr_vals ? d.attr_vals.split(' ') : []
          d.tagInputVisible = false
          d.tagInputValue = ''
        })
        this.activeName == 'many' ? this.manyTableData = res.data : this.onlyTableData = res.data
        
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status == 201) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.addDialog = false
            this.getParamsData()
          } else {
            this.$message({
              message: res.meta.msg,
              type: 'error'
            })
          }
        }
      })
    },
    // 编辑
    async showEditDialog(attrId) {
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: {attr_sel: this.activeName}
      })
      if (res.meta.status == 200) {
        this.editForm = res.data
        this.editDialog = true
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName            
          })
          if (res.meta.status == 200) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.editDialog = false
            this.getParamsData()
          } else {
            this.$message({
              message: res.meta.msg,
              type: 'error'
            })
          }
        }
      })
    },
    async removeParams(attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      //确认删除  返回confirm
      //取消删除  返回cancel
      if (confirmResult == 'confirm') {
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status == 200) {
          this.$message({
            message: res.meta.msg,
            type: 'success'
          }) 
          this.getParamsData()
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
    handleInputConfirm(row) {
      if (row.tagInputValue.trim().length == 0) {
        row.tagInputValue = ''
        row.tagInputVisible = false
        return
      } 
      else { 
        row.attr_vals.push(row.tagInputValue.trim()) 
        row.tagInputValue = ''
        row.tagInputVisible = false  
      }
      this.saceAttrVals(row)
    },
    async saceAttrVals(row) {
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status == 200) {
        this.$message({
          message: res.meta.msg,
          type: 'success'
        })
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    showInput(row) {
      row.tagInputVisible = true
      // $nextTick 页面元素被重新渲染后  才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    tagClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saceAttrVals(row)
    },
  }
}
</script>
<style lang="less" scoped>
.cata_select {
  margin-top: 10px;

  .el-cascader {
    width: 250px;
  }
}
.tags {
  margin: 6px;
}
.input-new-tag {
  width: 120px;
}
</style>