import axios from 'axios'
import { ElMessage } from 'element-plus'

// 1. 创建 axios 实例
const service = axios.create({
    baseURL: '/api/v1', // 所有的请求自动加上 /api/v1 前缀
    timeout: 5000       // 超时时间
})

// 2. 请求拦截器 (每次发请求前自动执行)
service.interceptors.request.use(
    config => {
        // 从浏览器缓存获取 Token
        const token = localStorage.getItem('token')
        if (token) {
            // 如果有 Token，自动加到 Header 里
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 3. 响应拦截器 (收到结果后自动执行)
service.interceptors.response.use(
    response => {
        const res = response.data
        // 如果后端返回 code 不是 200，视为错误
        if (res.code !== 200) {
            ElMessage.error(res.msg || '系统错误')
            return Promise.reject(new Error(res.msg || 'Error'))
        }
        return res
    },
    error => {
        // 处理 401 (Token 过期/未登录)
        if (error.response && error.response.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            localStorage.removeItem('token')
            window.location.href = '/login' // 强制跳回登录页
        } else {
            ElMessage.error(error.message || '网络请求失败')
        }
        return Promise.reject(error)
    }
)

export default service