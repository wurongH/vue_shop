<template>
  <div class="login_containter">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <el-form
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
        label-width="0px"
        class="login_form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user-solid"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="el-icon-key"
            :type="pwdType"
          >
            <i slot="suffix" class="el-icon-view" @click="showPwd" style="cursor:pointer"></i>
          </el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">
            登录
          </el-button>
          <el-button type="info" @click="resetLoginForm">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
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
        ]
      },
      pwdType: 'password'
    }
  },
  created() {
    let that = this
    document.onkeydown = function() {
      let key = window.event.keyCode
      //验证在登录界面以及按的键是回车键enter
      if (that.$route.path === '/login' && key === 13) {
        that.login()
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('login', this.loginForm)
          if (res.meta.status === 200) {
            this.$message({
              message: res.meta.msg,
              type: 'success'
            })
            window.sessionStorage.setItem('token', res.data.token)
            this.$router.push('/home')
          } else {
            this.$message({
              message: res.meta.msg,
              type: 'error'
            })
          }
        }
      })
    },
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    showPwd() {
      this.pwdType == 'password' ? this.pwdType='text': this.pwdType='password'
    }
  }
}
</script>
<style lang="less" scoped>
.login_containter {
  height: 100%;
  background-color: #2b4b6b;
  position: relative;

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }

    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
