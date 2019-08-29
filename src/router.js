import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Roles from './components/authority/Roles.vue'
import Rights from './components/authority/Rights.vue'
import Categories from './components/goods/categories.vue'
import List from './components/goods/list.vue'
import Params from './components/goods/params.vue'
import Add from './components/goods/add.vue'
import Order from './components/order/order.vue'
import Reports from './components/reports/reports.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/roles', component: Roles },
        { path: '/rights', component: Rights },
        { path: '/categories', component: Categories },
        { path: '/goods', component: List },
        { path: '/params', component: Params },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order},
        { path: '/reports', component: Reports},
      ]
    }
  ]
})

//挂载路由导航守卫
// to 将要访问路径  from 代表从哪个路径跳转而来  next() 放行  next('/login') 强制跳转
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  tokenStr ? next() : next('/login')
})
export default router
