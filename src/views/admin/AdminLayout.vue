<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-logo">
        <el-icon><Monitor /></el-icon>
        <span>后台管理系统</span>
      </div>

      <el-menu
        :default-active="$route.path"
        class="admin-menu"
        router
      >
        <el-menu-item index="/products" class="back-mall-btn">
          <el-icon><Back /></el-icon>
          <span>返回商城首页</span>
        </el-menu-item>

        <div class="menu-divider"></div>

        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据大屏概览</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户权限管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/products">
          <el-icon><Goods /></el-icon>
          <span>蔬菜库存管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/orders">
          <el-icon><Tickets /></el-icon>
          <span>订单发货处理</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <div class="breadcrumb">{{ $route.meta.title || '管理后台' }}</div>
        <div class="admin-user">
          <el-tag size="small" type="danger">管理员</el-tag>
        </div>
      </header>

      <section class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </section>
    </main>
  </div>
</template>

<script setup>
import { Monitor, Back, DataLine, User, Goods, Tickets } from '@element-plus/icons-vue'
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh; /* 固定视口高度 */
  width: 100vw;
  overflow: hidden; /* 禁止外层滚动 */
  background-color: #f0f2f5;
}

.admin-sidebar {
  width: 240px;
  background-color: #001529;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* 防止侧边栏被压缩 */
}

.admin-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #002140;
}

.admin-logo .el-icon { margin-right: 10px; font-size: 24px; }

.admin-menu {
  border-right: none;
  flex: 1;
}

/* 侧边栏菜单样式覆盖 */
:deep(.el-menu) {
  background-color: transparent;
  border: none;
}
:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.65);
}
:deep(.el-menu-item:hover), :deep(.el-menu-item.is-active) {
  color: #fff !important;
  background-color: #1890ff !important;
}

/* 🔥 返回商城按钮特殊样式 */
.back-mall-btn {
  background-color: #1d39c4 !important;
  color: #fff !important;
  margin: 10px;
  border-radius: 4px;
  height: 40px !important;
  line-height: 40px !important;
}

.menu-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 10px 20px;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 内部容器也禁止溢出 */
}

.admin-header {
  height: 64px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0,21,41,0.08);
  z-index: 10;
}

.admin-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto; /* 只有这里允许纵向滚动，防止切换页面时整体跳动 */
}

/* 页面切换动画 */
.fade-transform-enter-active, .fade-transform-leave-active {
  transition: all 0.3s;
}
.fade-transform-enter-from { opacity: 0; transform: translateX(-30px); }
.fade-transform-leave-to { opacity: 0; transform: translateX(30px); }
</style>