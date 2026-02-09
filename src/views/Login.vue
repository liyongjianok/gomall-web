<template>
    <div class="login-container">
      <el-card class="login-card">
        <template #header>
          <h2>Go 电商系统登录</h2>
        </template>
        
        <el-form :model="form" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
            <el-button @click="handleRegister">注册</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  
  const router = useRouter()
  const loading = ref(false)
  
  // 表单数据
  const form = reactive({
    username: 'shouguang_03', // 默认填好，方便测试
    password: '123456'
  })
  
  // 登录逻辑
  const handleLogin = async () => {
    if(!form.username || !form.password) {
      ElMessage.warning('请输入用户名和密码')
      return
    }
  
    loading.value = true
    try {
      // 发送请求给 Go 网关
      // 注意：因为配置了 vite proxy，这里直接写 /api 开头即可
      const res = await axios.post('/api/v1/user/login', form)
      
      // 检查后端返回的 code
      if (res.data.code === 200) {
        ElMessage.success('登录成功')
        
        // 关键：把 Token 存到浏览器本地
        localStorage.setItem('token', res.data.data.token)
        localStorage.setItem('userId', res.data.data.id)
        
        // 跳转到首页
        router.push('/home')
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
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
  }
  .login-card {
    width: 400px;
  }
  </style>