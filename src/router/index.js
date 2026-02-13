import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// -------------------------------------------------------------------------
// 1. 懒加载基础页面
// -------------------------------------------------------------------------
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const ProductList = () => import('../views/ProductList.vue')
const ProductDetail = () => import('../views/ProductDetail.vue')
const Cart = () => import('../views/Cart.vue')
const OrderList = () => import('../views/OrderList.vue')
const UserCenter = () => import('../views/UserCenter.vue')

// -------------------------------------------------------------------------
// 2. 懒加载管理后台页面 (🔥 新增)
// -------------------------------------------------------------------------
const AdminLayout = () => import('../views/admin/AdminLayout.vue')
const AdminDashboard = () => import('../views/admin/Dashboard.vue')
const AdminUsers = () => import('../views/admin/UserManage.vue')
const AdminProducts = () => import('../views/admin/ProductManage.vue')
const AdminOrders = () => import('../views/admin/OrderManage.vue')

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },

    // --- 商城前端页面 ---
    { path: '/products', component: ProductList },
    { path: '/product/:id', component: ProductDetail },
    { path: '/cart', component: Cart },
    { path: '/orders', component: OrderList },
    { path: '/user', component: UserCenter },

    // --- 管理后台路由 (🔥 嵌套结构) ---
    {
        path: '/admin',
        component: AdminLayout,
        redirect: '/admin/dashboard',
        children: [
            {
                path: 'dashboard',
                component: AdminDashboard,
                meta: { title: '数据大屏', requiresAdmin: true }
            },
            {
                path: 'users',
                component: AdminUsers,
                meta: { title: '用户管理', requiresAdmin: true }
            },
            {
                path: 'products',
                component: AdminProducts,
                meta: { title: '库存管理', requiresAdmin: true }
            },
            {
                path: 'orders',
                component: AdminOrders,
                meta: { title: '订单发货', requiresAdmin: true }
            }
        ]
    },

    // 404 兜底
    { path: '/:pathMatch(.*)*', redirect: '/products' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// -------------------------------------------------------------------------
// 3. 导航守卫 (权限控制)
// -------------------------------------------------------------------------
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('role') // 建议登录后把 role 也存入 localStorage

    // 1. 如果去管理后台，检查是否是管理员
    if (to.path.startsWith('/admin')) {
        if (!token) {
            ElMessage.error('请先登录')
            return next('/login')
        }
        if (userRole !== 'admin') {
            ElMessage.warning('权限不足，无法进入管理后台')
            return next('/products')
        }
    }

    // 2. 如果去购物车或个人中心，必须登录
    const authPages = ['/cart', '/orders', '/user']
    if (authPages.includes(to.path) && !token) {
        ElMessage.info('请登录后操作')
        return next('/login')
    }

    next()
})

export default router