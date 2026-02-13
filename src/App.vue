<template>
  <el-config-provider :locale="zhCn">
    <div class="main-app-container">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<style>
html, body {
  margin: 0 !important;
  padding: 0 !important;
  background-color: #f5f7fa;
}

#app {
  /* 确保根节点占满全屏，并且内部子元素可以居中 */
  width: 100%;
  min-height: 100vh;
}

.main-app-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; /* 保证子元素在水平方向居中 */
}

/* 链接全局样式 */
a {
  text-decoration: none;
  color: inherit;
}

/* 统一盒模型 */
* {
  box-sizing: border-box;
}
</style>