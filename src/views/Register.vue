<template>
    <div class="register-wrapper">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
  
      <div class="register-container">
        <div class="register-left">
          <h1>加入 Go Mall</h1>
          <p>开启您的寿光新鲜蔬菜之旅</p>
          <div class="v-divider"></div>
          <p class="sub-text">只需几秒，即可享受高品质农产品直供服务</p>
        </div>
        
        <el-card class="register-card">
          <div class="card-header">
            <span>新用户注册</span>
          </div>
          
          <el-form :model="form" :rules="rules" ref="formRef" size="large" label-position="top">
            <el-form-item prop="username">
              <el-input v-model="form.username" placeholder="设置登录账号 (至少3位)" :prefix-icon="User" />
            </el-form-item>
  
            <el-form-item prop="mobile">
              <el-input v-model="form.mobile" placeholder="您的手机号码" :prefix-icon="Iphone" />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="form.password" 
                type="password" 
                placeholder="设置登录密码 (至少6位)" 
                :prefix-icon="Lock" 
                show-password 
              />
            </el-form-item>
  
            <el-form-item prop="confirmPassword">
              <el-input 
                v-model="form.confirmPassword" 
                type="password" 
                placeholder="确认登录密码" 
                :prefix-icon="CircleCheck" 
                show-password 
              />
            </el-form-item>
  
            <el-form-item prop="nickname">
              <el-input v-model="form.nickname" placeholder="您的收货人昵称" :prefix-icon="Postcard" />
            </el-form-item>
  
            <el-form-item>
              <el-button type="primary" class="register-btn" @click="handleRegister" :loading="loading">
                立即注册
              </el-button>
            </el-form-item>
  
            <div class="back-link">
              <span>已有账号？</span>
              <el-link type="primary" :underline="false" @click="$router.push('/login')">返回登录</el-link>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { User, Lock, Postcard, CircleCheck, Iphone } from '@element-plus/icons-vue'
  import request from '../utils/request'
  
  const router = useRouter()
  const formRef = ref(null)
  const loading = ref(false)
  
  // 🔥 所有字段初始化为空字符串，拒绝预填充
  const form = reactive({
    username: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  })
  
  const validateConfirmPass = (rule, value, callback) => {
    if (value === '') {
      callback(new Error('请再次输入密码'))
    } else if (value !== form.password) {
      callback(new Error('两次输入密码不一致!'))
    } else {
      callback()
    }
  }
  
  const rules = {
    username: [
      { required: true, message: '账号不能为空', trigger: 'blur' },
      { min: 3, message: '长度至少3位', trigger: 'blur' }
    ],
    mobile: [
      { required: true, message: '手机号不能为空', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入11位手机号', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '密码不能为空', trigger: 'blur' },
      { min: 6, message: '长度至少6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, validator: validateConfirmPass, trigger: 'blur' }
    ],
    nickname: [{ required: true, message: '昵称不能为空', trigger: 'blur' }]
  }
  
  const handleRegister = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        loading.value = true
        try {
          const res = await request.post('/user/register', {
            username: form.username,
            nickname: form.nickname,
            mobile: form.mobile,
            password: form.password
          })
          if (res.code === 200) {
            ElMessage.success('注册成功，欢迎加入寿光生鲜！')
            router.push('/login')
          } else {
            ElMessage.error(res.msg || '注册失败')
          }
        } catch (error) {
          ElMessage.error('用户名或手机号可能已被占用')
        } finally {
          loading.value = false
        }
      }
    })
  }
  </script>
  
  <style scoped>
  .register-wrapper {
    height: 100vh; width: 100vw;
    background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
    display: flex; justify-content: center; align-items: center;
    position: relative; overflow: hidden;
  }
  
  .shape { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; }
  .shape-1 { width: 300px; height: 300px; background: rgba(255, 255, 255, 0.4); top: -50px; left: -50px; }
  .shape-2 { width: 400px; height: 400px; background: rgba(255, 255, 255, 0.3); bottom: -100px; right: -100px; }
  
  .register-container {
    display: flex; width: 950px; min-height: 650px;
    background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(15px);
    border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    z-index: 1; overflow: hidden; border: 1px solid rgba(255,255,255,0.3);
  }
  
  .register-left {
    flex: 1; display: flex; flex-direction: column; justify-content: center;
    padding: 60px; color: #2c3e50; background: rgba(255,255,255,0.1);
  }
  .register-left h1 { font-size: 36px; margin-bottom: 10px; font-weight: 800; }
  .v-divider { width: 40px; height: 4px; background: #409EFF; margin: 20px 0; border-radius: 2px; }
  .sub-text { font-size: 14px; opacity: 0.7; }
  
  .register-card { width: 480px; border: none; border-radius: 0; padding: 10px 30px; }
  :deep(.el-card) { border: none; background: white; }
  
  .card-header { text-align: center; font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
  .register-btn { width: 100%; padding: 12px 0; font-weight: bold; margin-top: 5px; font-size: 16px; }
  .back-link { text-align: center; margin-top: 15px; font-size: 14px; color: #666; }
  
  :deep(.el-form-item) { margin-bottom: 15px; }
  </style>