<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightList" border stripe :height="documentHeight">
          <el-table-column type="index" align="center" size="mini" width="50">
          </el-table-column>
          <el-table-column
            align="center"
            v-for="(item, index) in rightColumn"
            :key="index"
            size="mini"
            :prop="item.name"
            :min-width="item.minWidth"
            :label="item.label"
          >
          </el-table-column>
          <el-table-column 
            align="center"
            label="权限等级"
            prop="level"
            minWidth="160px">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.level =='0'">一级</el-tag>
              <el-tag type="success" v-else-if="scope.row.level =='1'">二级</el-tag>
              <el-tag type="warning" v-else>三级</el-tag>
            </template>
          </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
import defaultHeight from '@/mixins/defaultHeight'
export default {
  data() {
    return {
      rightList: [],
      rightColumn: [
        { name: 'authName', label: '权限名称', minWidth: '160px' },
        { name: 'path', label: '路径', minWidth: '160px' }      
      ]
    }
  },
  //自适应浏览屏幕高度
  mixins: [defaultHeight],
  created() {
    this.getRightList()
  },
  methods: {
    async getRightList() {
      const {data: res} = await this.$http.get('rights/list')
      if (res.meta.status == 200) {
        this.rightList = res.data
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })        
      }
    }
  }
}
</script>
<style lang="less" scoped>

</style>
