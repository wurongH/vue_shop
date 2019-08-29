<template>
  <el-container class="home">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" size="small" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleMenu">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :default-active="activePath"
          unique-opened
          router
          :collapse-transition="false"
          :collapse="isCollapse"
        >
          <el-submenu
            :index="item.id + ''"
            v-for="item in meunlist"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item
              :index="'/' + childItem.path"
              v-for="childItem in item.children"
              :key="childItem.id"
              @click="saveChildPath('/' + childItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ childItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      meunlist: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: '',
    }
  },
  created() {
    this.getMenuList(),
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    toggleMenu() {
      this.isCollapse = !this.isCollapse
    },
    //存储链接地址
    saveChildPath(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status == 200) {
        this.meunlist = res.data
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
.home {
  height: 100%;

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    div {
      display: flex;
      align-items: center;

      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .toggle-button {
      background-color: #4a5064;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      text-align: center;
      letter-spacing: 0.2em;
      cursor: pointer;
    }

    .el-menu {
      border-right: none;
    }

    .iconfont {
      margin-right: 8px;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }
}
</style>
