<template>
    <el-container class="admin-container">
      <el-aside width="240px" class="admin-aside">
        <div class="admin-logo">
          <span class="icon">🌿</span>
          <span class="text">寿光生鲜管理后台</span>
        </div>
        <el-menu
          router
          :default-active="$route.path"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><Monitor /></el-icon>
            <span>数据大屏</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/products">
            <el-icon><ShoppingBag /></el-icon>
            <span>商品库存管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders">
            <el-icon><List /></el-icon>
            <span>订单发货处理</span>
          </el-menu-item>
          <div class="menu-divider"></div>
          <el-menu-item index="/products">
            <el-icon><Back /></el-icon>
            <span>返回商城首页</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
  
      <el-container>
        <el-header class="admin-header">
          <div class="breadcrumb">管理中心 / {{ pageTitle }}</div>
          <div class="admin-info">
            <el-tag type="danger" effect="dark">超级管理员</el-tag>
            <el-button link @click="handleLogout">退出</el-button>
          </div>
        </el-header>
        
        <el-main class="admin-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Monitor, User, ShoppingBag, List, Back } from '@element-plus/icons-vue'
  
  const route = useRoute()
  const router = useRouter()
  
  const pageTitle = computed(() => {
    const titles = {
      '/admin/dashboard': '数据大屏',
      '/admin/users': '用户管理',
      '/admin/products': '商品管理',
      '/admin/orders': '订单处理'
    }
    return titles[route.path] || '概览'
  })
  
  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .admin-container { height: 100vh; }
  .admin-aside { background: #304156; transition: width 0.3s; }
  .admin-logo {
    height: 60px; line-height: 60px; text-align: center;
    background: #2b2f3a; color: #fff; font-weight: bold; overflow: hidden;
  }
  .admin-logo .icon { font-size: 20px; margin-right: 8px; }
  .admin-header {
    background: #fff; border-bottom: 1px solid #e6e6e6;
    display: flex; align-items: center; justify-content: space-between; padding: 0 20px;
  }
  .admin-info { display: flex; align-items: center; gap: 15px; }
  .admin-main { background: #f0f2f5; padding: 20px; }
  .menu-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 10px 0; }
  </style>