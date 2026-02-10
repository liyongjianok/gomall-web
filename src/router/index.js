import { createRouter, createWebHistory } from 'vue-router'

// 懒加载组件
const Login = () => import('../views/Login.vue')
const Home = () => import('../views/Home.vue')
const ProductList = () => import('../views/ProductList.vue')

const routes = [
    { path: '/', redirect: '/login' }, // 默认跳登录
    { path: '/login', component: Login },
    { path: '/home', component: Home },
    { path: '/products', component: ProductList }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router