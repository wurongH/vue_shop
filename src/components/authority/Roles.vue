<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card v-if="!showRolesCard">
      <el-row>
        <el-col>
          <el-button 
            type="primary" 
            size="small" 
            @click="addRolesDialog = true"
          >
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe  row-key="id">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="['bd-bottom', index1 == 0 ? 'bd-top' : '', 'vcenter']"
            >
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 == 0 ? '' : 'bd-top', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRight(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRight(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column
          label="角色名称"
          prop="roleName"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="角色描述"
          prop="roleDesc"
          align="center"
        >
        </el-table-column>
        <el-table-column label="操作" align="center" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
             >
             编辑
             </el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRoles(scope.row.id)"
            >
            删除
            </el-button>
            <el-button 
              type="warning" 
              size="mini" 
              icon="el-icon-setting"
              @click="showSetRolesDiaog(scope.row)"
            >
            权限分配
          </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card v-if="showRolesCard">
      <header class="header">分配权限</header>
      <el-row class="tree" :style="{height:documentHeight}">
        <el-tree 
          :data="rightslist" 
          :props="treeProps"
          node-key="id" 
          ref="treeRef"
          show-checkbox
          default-expand-all
          :default-checked-keys="defKeys"
        >
        </el-tree>
      </el-row>
      <el-row class="r-btn">
        <el-button @click="setRolesCadrClosed" size="small">取消</el-button>
        <el-button type="primary" size="small" @click="allRights" >确定</el-button>
      </el-row>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialog"
      width="40%"
      @close="addRolesDialogClosed"
    >
      <el-form
        :model="addRolesForm"
        :rules="addRolesRules"
        ref="addRolesRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input size="small" v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input size="small" v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addRolesDialog = false" size="small">取消</el-button>
        <el-button type="primary" size="small" @click="addRoles">确定</el-button>
      </div>
    </el-dialog>
    <!-- 修改角色 -->
    <el-dialog title="修改角色" :visible.sync="editRolesDialog" width="40%">
      <el-form
        :model="editRolesForm"
        :rules="editRolesRules"
        ref="editRolesRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName" size="small"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc" size="small"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editRolesDialog = false" size="small">取 消</el-button>
        <el-button type="primary" @click="editRules" size="small">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { async } from 'q'
import defaultHeight from '@/mixins/defaultHeight'
export default {
  data() {
    return {
      showRolesCard: false,
      addRolesDialog: false,
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      addRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [{}]
      },
      rolesList: [],
      editRolesForm: {},
      editRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [{}]
      },
      editRolesDialog: false,
      setRolesDialog: false,
      rightslist: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: ''
    }
  },
  mixins:[defaultHeight],
  created() {
    this.getRolesList()
  },
  methods: {
    addRolesDialogClosed() {
      this.$refs.addRolesRef.resetFields()
    },
    //添加角色
    addRoles() {
      this.$refs.addRolesRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(
            'roles',
            this.addRolesForm
          )
          if (res.meta.status == 201) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.addRolesDialog = false
            this.getRolesList()
          } else {
            this.$message({
              message: res.meta.msg,
              type: 'error'
            })
          }
        }
      })
    },
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status == 200) {
        this.rolesList = res.data
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    //显示编辑角色
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status === 200) {
        this.editRolesForm = res.data
        this.editRolesDialog = true
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    //编辑角色
    editRules() {
      this.$refs.editRolesRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'roles/' + this.editRolesForm.roleId,
            {
              roleName: this.editRolesForm.roleName,
              roleDesc: this.editRolesForm.roleDesc
            }
          )
          if (res.meta.status === 200) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.editRolesDialog = false
            this.getRolesList()
          } else {
            this.$message({
              message: res.meta.msg,
              type: 'error'
            })
          }
        }
      })
    },
    //删除角色
    async removeRoles(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //确认删除  返回confirm
      //取消删除  返回cancel
      if (confirmResult == 'confirm') {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status === 200) {
          this.$message({
            message: res.meta.msg,
            type: 'success'
          })
          this.getRolesList()
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
    //根据id删除对应权限
    async removeRight(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult == 'confirm') {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status === 200) {
          this.$message({
            message: res.meta.msg,
            type: 'success'
          })
          role.children = res.data
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
    setRolesCadrClosed() {
      this.showRolesCard = false
      this.defKeys = []
    },
    //显示权限分配
    async showSetRolesDiaog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status === 200) {
        this.rightslist = res.data
        this.getLeafKeys(role, this.defKeys)
        this.showRolesCard = true
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })        
      }      
    },
    //通过递归获取角色所有三级权限id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }      
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    //点击为角色分配权限
    async allRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const isStr = keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: isStr
      })
      if (res.meta.status === 200) {
        this.$message({
          message: res.meta.msg,
          type: 'success'
        })
        this.getRolesList()
        this.showRolesCard = false
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
.el-tag {
  margin: 6px;
}
.bd-top {
  border-top: 1px solid #eee;
}
.bd-bottom {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
.header {
  font-size: 16px;
  margin-bottom: 6px;
}
.tree {
  overflow-y:auto;
}
.r-btn {
  display: flex;
  justify-content:flex-end;
  margin-right: 38px;
}
</style>