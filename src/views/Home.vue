<template>
    <div class="home">
      <h1>欢迎来到 Go 电商首页</h1>
      <el-button type="danger" @click="testSeckill">测试秒杀 (SKU 2)</el-button>
      <el-button type="info" @click="logout">退出登录</el-button>
      
      <div style="margin-top: 20px;">
        <h3>API 测试结果：{{ result }}</h3>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  
  const router = useRouter()
  const result = ref('')
  
  // 测试秒杀接口
  const testSeckill = async () => {
    try {
      const token = localStorage.getItem('token')
      // 请求时带上 Token
      const res = await axios.post('/api/v1/product/seckill', 
        { sku_id: 2 },
        { headers: { 'Authorization': `Bearer ${token}` } } // 设置请求头
      )
      
      if (res.data.code === 200) {
        result.value = "抢购成功！"
        ElMessage.success("抢购成功")
      } else {
        result.value = res.data.msg
        ElMessage.warning(res.data.msg)
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        result.value = "系统繁忙 (Sentinel 限流)"
        ElMessage.error("系统繁忙")
      } else {
        result.value = "请求失败"
      }
    }
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }
  </script>
  
  <style>
  .home {
    padding: 50px;
    text-align: center;
  }
  </style>