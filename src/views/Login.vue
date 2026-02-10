<template>
    <div class="login-wrapper">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
  
      <div class="login-container">
        <div class="login-left">
          <h1>Go Ecommerce</h1>
          <p>基于微服务的高性能电商后台管理系统</p>
        </div>
        
        <el-card class="login-card" shadow="always">
          <template #header>
            <div class="card-header">
              <span>欢迎登录</span>
            </div>
          </template>
          
          <el-form :model="form" size="large" class="login-form">
            <el-form-item>
              <el-input 
                v-model="form.username" 
                placeholder="请输入用户名" 
                prefix-icon="User"
              />
            </el-form-item>
            <el-form-item>
              <el-input 
                v-model="form.password" 
                type="password" 
                placeholder="请输入密码" 
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                class="login-btn" 
                @click="handleLogin" 
                :loading="loading"
              >
                立即登录
              </el-button>
            </el-form-item>
            <div class="login-options">
               <el-link type="info" :underline="false">忘记密码？</el-link>
               <el-link type="primary" :underline="false" @click="handleRegister">注册账号</el-link>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { User, Lock } from '@element-plus/icons-vue' // 需要引入图标
  
  const router = useRouter()
  const loading = ref(false)
  
  const form = reactive({
    username: 'shouguang_03', 
    password: '123'
  })
  
  const handleLogin = async () => {
    if(!form.username || !form.password) {
      ElMessage.warning('请输入用户名和密码')
      return
    }
    loading.value = true
    try {
      const res = await axios.post('/api/v1/user/login', form)
      if (res.data.code === 200) {
        ElMessage.success('登录成功')
        localStorage.setItem('token', res.data.data.token)
        localStorage.setItem('userId', res.data.data.id)
        router.push('/products')
      } else {
        ElMessage.error(res.data.msg || '登录失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('网络错误或服务未启动')
    } finally {
      loading.value = false
    }
  }
  
  const handleRegister = () => {
    ElMessage.info('注册功能待开发')
  }
  </script>
  
  <style scoped>
  .login-wrapper {
    height: 100vh;
    width: 100vw;
    /* 漂亮的渐变背景 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  
  /* 装饰背景球 */
  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
  }
  .shape-1 {
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.3);
    top: -50px;
    left: -50px;
  }
  .shape-2 {
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.2);
    bottom: -100px;
    right: -100px;
  }
  
  .login-container {
    display: flex;
    width: 900px;
    height: 500px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px); /* 毛玻璃效果 */
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
    z-index: 1;
    overflow: hidden;
  }
  
  .login-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px;
    color: white;
    background: rgba(0,0,0,0.2);
  }
  .login-left h1 {
    font-size: 32px;
    margin-bottom: 10px;
  }
  
  .login-card {
    width: 450px;
    border: none;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  /* 去掉 Element Card 默认边框，融合更好 */
  :deep(.el-card) {
    border: none;
    background: white;
  }
  :deep(.el-card__header) {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .card-header {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
  }
  
  .login-form {
    padding: 0 20px;
  }
  
  .login-btn {
    width: 100%;
    font-size: 16px;
    padding: 20px 0;
  }
  
  .login-options {
    display: flex;
    justify-content: space-between;
  }
  </style>