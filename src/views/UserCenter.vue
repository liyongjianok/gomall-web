<template>
    <div class="page-container">
      <div class="main-card">
        <el-tabs tab-position="left" style="height: 500px">
          
          <el-tab-pane label="个人资料">
            <div class="profile-box">
              <h3>基本信息</h3>
              <el-form :model="form" label-width="80px" style="max-width: 400px">
                <el-form-item label="头像">
                   <el-avatar :size="80" :src="form.avatar" class="mb-2"></el-avatar>
                   <el-input v-model="form.avatar" placeholder="输入头像图片URL"></el-input>
                </el-form-item>
                <el-form-item label="账号">
                  <el-input v-model="form.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="昵称">
                  <el-input v-model="form.nickname"></el-input>
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="form.mobile"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdate">保存修改</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
  
          <el-tab-pane label="收货地址">
            <el-empty description="地址管理功能开发中..."></el-empty>
          </el-tab-pane>
  
          <el-tab-pane label="安全设置">
            <el-button type="danger" plain @click="logout">退出登录</el-button>
          </el-tab-pane>
  
        </el-tabs>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import request from '../utils/request'
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const form = ref({
    id: 0,
    username: '',
    nickname: '',
    mobile: '',
    avatar: ''
  })
  
  const loadInfo = async () => {
    const res = await request.get('/user/info')
    if (res.code === 200) {
      form.value = res.data
    }
  }
  
  const handleUpdate = async () => {
    const res = await request.post('/user/update', {
      nickname: form.value.nickname,
      mobile: form.value.mobile,
      avatar: form.value.avatar
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
      loadInfo() // 刷新
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }
  
  onMounted(loadInfo)
  </script>
  
  <style scoped>
  .page-container { padding: 40px; background: #f5f7fa; min-height: 100vh; display: flex; justify-content: center; }
  .main-card { width: 900px; background: #fff; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); padding: 20px; }
  .profile-box { padding-left: 20px; }
  .mb-2 { margin-bottom: 10px; }
  </style>