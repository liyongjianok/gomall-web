<template>
  <div class="login-wrapper">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="login-box">
      <div class="brand-section">
        <div class="logo-icon">🌿</div>
        <h1 class="brand-name">SHOUGUANG<span>FRESH</span></h1>
        <p class="brand-desc">寿光生鲜 · 绿色直供系统</p>
      </div>
      <div class="form-section">
        <h2 class="welcome-title">欢迎登录</h2>
        <el-form :model="form" size="large">
          <el-form-item>
            <el-input v-model="form.username" placeholder="账号" :prefix-icon="User" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
          </el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">进入系统</el-button>
          <div class="options">
            <el-link type="info" underline="never">找回密码</el-link>
            <el-link type="primary" underline="never" @click="$router.push('/register')">创建新账号</el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import request from '../utils/request'

const router = useRouter()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const handleLogin = async () => {
  if (!form.username || !form.password) return ElMessage.warning('请输入账号和密码')
  loading.value = true
  try {
    const res = await request.post('/user/login', { username: form.username, password: form.password })
    if (res.code === 200) {
      // 🚩 核心：先清空，防污染，再写入
      localStorage.clear()
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('user_id', res.data.user_id)

      ElMessage.success('登录成功')

      if (res.data.role === 'admin') {
        ElMessageBox.confirm('检测到管理员身份，是否进入管理后台？', '身份确认', {
          confirmButtonText: '进入后台',
          cancelButtonText: '前往商城',
          type: 'success'
        }).then(() => {
          router.push('/admin')
        }).catch(() => {
          router.push('/products')
        })
      } else {
        router.push('/products')
      }
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (error) {
    ElMessage.error('系统响应异常')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 保持原有样式不变 */
.login-wrapper { height: 100vh; width: 100vw; background-color: #f0f2f5; background-image: radial-gradient(#dcfce7 1px, transparent 1px); background-size: 20px 20px; display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden; }
.shape { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.4; z-index: 0; }
.shape-1 { width: 400px; height: 400px; background: #86efac; top: -100px; left: -100px; }
.shape-2 { width: 300px; height: 300px; background: #93c5fd; bottom: -50px; right: -50px; }
.login-box { width: 400px; padding: 40px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.5); text-align: center; z-index: 1; }
.logo-icon { font-size: 40px; margin-bottom: 10px; }
.brand-name { font-size: 24px; letter-spacing: 2px; color: #166534; margin: 0; font-weight: 900; }
.brand-name span { color: #22c55e; }
.brand-desc { font-size: 12px; color: #666; margin-bottom: 30px; letter-spacing: 4px; }
.welcome-title { font-size: 18px; color: #333; margin-bottom: 25px; font-weight: 600; }
.login-btn { width: 100%; border-radius: 12px; height: 48px; font-size: 16px; background: #166534; border: none; margin-top: 10px; transition: all 0.3s; }
.login-btn:hover { background: #15803d; transform: translateY(-1px); }
.options { display: flex; justify-content: space-between; margin-top: 20px; font-size: 13px; }
</style>