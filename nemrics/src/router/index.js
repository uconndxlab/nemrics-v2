import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Provider from '../views/Provider'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/tag/:singleTag',
    name: 'SingleTag',
    component: Home
  },
  {
    path: '/provider/:singleProvider',
    name: 'SingleProvider',
    component: Home
  },
  {
    path: '/provider/:provider/:tag',
    name: 'ProviderAndTag',
    component: Home
  },
  {
    path:'/provider/:id',
    name:'Provider',
    component:Provider
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
