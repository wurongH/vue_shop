<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            size="small"
            clearable
            placeholder="请输入搜索内容"
            v-model="queryInfo.query"
            @clear="getList"
          >
            <el-button
              slot="append"
              @click="getList"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" size="small" @click="addUserDialog = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-table :data="tableData" border stripe>
          <el-table-column type="index" align="center" size="mini" width="50">
          </el-table-column>
          <el-table-column
            align="center"
            v-for="(item, index) in column"
            :key="index"
            size="mini"
            :prop="item.name"
            :min-width="item.minWidth"
            :label="item.label"
          >
          </el-table-column>
          <el-table-column align="center" label="状态" min-width="160px">
            <template slot-scope="scope">
              <el-switch
                size="mini"
                v-model="scope.row.mg_state"
                @change="userStateChange(scope.row)"
              >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="操作"
            width="220px"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                @click="ShowEditDialog(scope.row.id)"
                size="mini"
              >
              </el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="removeUser(scope.row.id)"
                size="mini"
              >
              </el-button>
              <el-tooltip
                effect="dark"
                content="分配角色"
                placement="top"
                :enterable="false"
              >
                <el-button type="warning" icon="el-icon-setting" size="mini" 
                @click="showRolesDialog(scope.row)">
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <el-row>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[2, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </el-row>
    </el-card>
    <!-- 添加用户 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialog"
      width="40%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addUserForm"
        :rules="addUserFormRules"
        ref="addUserFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input size="small" v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input size="small" v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input size="small" v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input size="small" v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addUserDialog = false" size="small">取 消</el-button>
        <el-button type="primary" @click="addUser" size="small"
          >确 定</el-button
        >
      </div>
    </el-dialog>
    <!-- 修改用户 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserDialog"
      width="40%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editUserForm"
        :rules="editUserFormRules"
        ref="editUserFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input
            size="small"
            v-model="editUserForm.username"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input size="small" v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input size="small" v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editUserDialog = false" size="small">取 消</el-button>
        <el-button type="primary" @click="editUser" size="small">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 角色分配 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRolesDialog"
      width="40%"
      @close="setRolDialogClosed"
    >
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择" size="small">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>          
        </p>
      </div>
      <div slot="footer">
        <el-button @click="setRolesDialog = false" size="small">取 消</el-button>
        <el-button type="primary" @click="setRoles" size="small">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { type } from 'os'
import table from '@/mixins/tables'
export default {
  data() {
    //验证合法邮箱
    var checkEmail = (rule, val, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(val)) {
        return cb()
      } else {
        cb(new Error('请输入合法邮箱'))
      }
    }
    //验证合法手机号
    var checkMobile = (rule, val, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(val)) {
        return cb()
      } else {
        cb(new Error('请输入合法手机号'))
      }
    }

    return {
      tableData: [],
      column: [
        { name: 'username', label: '姓名', minWidth: '160px' },
        { name: 'email', label: '邮箱', minWidth: '160px' },
        { name: 'mobile', label: '电话', minWidth: '160px' },
        { name: 'role_name', label: '角色', minWidth: '160px' }
      ],
      addUserDialog: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUserFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '密码长度在 6 到 15 个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editUserDialog: false,
      editUserForm: {},
      editUserFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      setRolesDialog: false,
      rolesList: [],
      userInfo: {},
      selectedRoleId: ''
    }
  },
  mixins:[table],
  created() {
    this.getList();
  },
  methods: {
    async getList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status == 200) {
        this.tableData = res.data.users
        this.total = res.data.total
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status == 200) {
        this.$message({
          message: res.meta.msg,
          type: 'success'
        })
      } else {
        userInfo.mg_state = !userInfo.mg_state
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },
    addDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    //添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addUserForm)
          if (res.meta.status == 201) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.addUserDialog = false
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
    //显示编辑用户
    async ShowEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status == 200) {
        this.editUserForm = res.data
        this.editUserDialog = true
      } else {
        this.$message({
          message: res.meta.msg,
          type: 'error'
        })
      }
    },

    editDialogClosed() {
      this.$refs.editUserFormRef.resetFields()
    },
    //编辑用户
    editUser() {
      this.$refs.editUserFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'users/' + this.editUserForm.id,
            {
              email: this.editUserForm.email,
              mobile: this.editUserForm.mobile
            }
          )
          if (res.meta.status == 200) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            this.editUserDialog = false
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
    //删除用户
    async removeUser(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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
        const { data: res } = await this.$http.delete('users/' + id)
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
      } else {
        this.$message({
          message: '已取消删除',
          type: 'info'
        })
      }
    },
 
    async showRolesDialog(userInfo) {
      this.userInfo = userInfo
      const {data: res}= await this.$http.get('roles')
      if (res.meta.status == 200) {
        this.rolesList = res.data
        this.setRolesDialog = true
      } else {
        this.$message({
          msg: res.meta.msg,
          type: 'error'
        })
      }     
    },
    setRolDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
    //分配角色
    async setRoles() {
      if (this.selectedRoleId) {
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        })
        if (res.meta.status == 200) {
          this.$message({
            message: res.meta.msg,
            type: 'success'
          }) 
          this.getList()
          this.setRolesDialog = false
        } else {
          this.$message({
            message: res.meta.msg,
            type: 'error'
          })             
        }
      } else {
        this.$message({
          message: '请选择要分配的角色',
          type: 'error'
        })
      }  
    }
  }
}
</script>

<style lang="less" scoped>

</style>