<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <el-steps :space="200" :active="activeIndex*1" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs 
          :tab-position="'left'" 
          v-model="activeIndex" 
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name" size="small"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input 
                v-model="addForm.goods_price" 
                size="small" 
                v-enter-number 
                type="number"                
                oninput="value.length>8?value=value.slice(0,8):''"
              />
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input 
                v-model="addForm.goods_weight" 
                size="small" 
                v-enter-number type="number" 
                oninput="value.length>8?value=value.slice(0,8):''"
              />
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input 
                v-model="addForm.goods_number" 
                size="small" 
                v-enter-number 
                type="number" 
                oninput="value.length>8?value=value.slice(0,8):''"
              />
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                size="small"
                expandTrigger="hover"
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              >
              </el-cascader>                
            </el-form-item> 
            <el-button size="mini" @click="goBack" >返回</el-button>           
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox  :label="data" v-for="(data, index) in item.attr_vals" :key="index" border>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.atte_id">
              <el-input v-model="item.attr_vals" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccess"
              :headers="headerObj" 
              :beforeUpload="beforeFormatUpload"
              style="width:380px"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_instroduce"></quill-editor>
            <el-button type="primary" size="small" class="btnAdd" @click="add" style="margin-top: 10px">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="40%">
      <img :src="previewPath" style="width:100%">
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        pic: [],
        goods_introduce: '',
        attrs: []        
      },
      addFormRules: {
        goods_name: [
          {required: true, message: '请输入商品名称', trigger: 'blur'}
        ],
        goods_price: [
          {required: true, message: '请输入商品价格', trigger: 'blur'}
        ],
        goods_weight: [
          {required: true, message: '请输入商品重量', trigger: 'blur'}
        ],
        goods_number: [
          {required: true, message: '请输入商品数量', trigger: 'blur'}
        ],
        goods_cat: [
          {required: true, message: '请选择商品分类', trigger: 'blur'}
        ]
      },
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false,
      formatError: false,
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }    
  },
  created() {
    this.getGateList()
  },
  methods: {
    goBack() {
      this.$router.push('/goods')
    },
    async getGateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status === 200) {
        this.cateList = res.data
      } else {
        this.$message({
          message: res.meta.msg, 
          type: 'error'
        })
      }
    },
    handleChange() {
      this.addForm.goods_cat.length !==3 ? this.addForm.goods_cat = [] : ''
    },
    beforeTabLeave(activeName, oldActiveName) {
      // this.$refs.addFormRef.validate( valid => {
      //   if (!valid) {
      //     return false
      //   }                  
      // })      
      if (oldActiveName == '0' && this.addForm.goods_cat.length !== 3 ) {
        this.$message({
          message: '请先选择商品分类',
          type: 'error'
        })
        return false
      }    
    },
    async tabClicked() {
      if (this.activeIndex == '1') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'many'}
        })
        if (res.meta.status === 200) {
          res.data.map( d => {
            d.attr_vals = d.attr_vals.length == 0 ? [] : d.attr_vals.split(' ')
          })
          this.manyTableData = res.data
        }
      } else if (this.activeIndex == '2') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'only'}
        })
        if (res.meta.status === 200) {
          this.onlyTableData = res.data
        }          
      }

    },
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },  

    handleSuccess(response) {
      const picInfo = {pic: response.data.tmp_path}
      this.addForm.pic.push(picInfo)
    },
    handleRemove(file) {
      if (!this.formatError) {
        const filePath = file.response.data.temp_path
        const index = this.addForm.pics.findIndex(x => x.pic == filePath)
        this.addForm.pics.splic(index, 1)
      }
    },
    beforeFormatUpload(file) {
      const format = file.name.substring(file.name.lastIndexOf('.') + 1)
      const limitJpg = format == 'jpg' && 'JPG'
      const limitPng = format == 'png' && 'PNG'
      const limitJpeg = format == 'jpeg' && 'JPEG'
      if (!limitJpg && !limitPng && !limitJpeg) {
        this.formatError = true
        this.$message({
          message: '图片仅支持jpg,png,jpeg格式',
          type: 'warning'
        })
        return false
      }
    },
    add() {
      this.$refs.addFormRef.validate( async valid => {
        if (valid) {
          const copyForm = _.cloneDeep(this.addForm)
          copyForm.goods_cat = copyForm.goods_cat.join(',')
          this.manyTableData.map(d => {
            const newInfo = {
              attr_id: d.attr_id,
              attr_value:  d.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          this.onlyTableData.map(d => {
            const newInfo = {
              attr_id:  d.attr_id,
              attr_value:  d.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          copyForm.attrs = this.addForm.attrs

          const {data: res} = await this.$http.post('goods', copyForm)
          if (res.meta.status === 201) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.$router.push('/goods')
          } else {
            this.$message({
              message: res.meta.msg,
              type: 'error'
            })
          }
        } else {
          this.$message({
            message: '请填写必要的表单项',
            type: 'error'
          })
        }
      })
    },
  }
}
</script>
<style lang="less" scope>

</style>