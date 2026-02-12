<template>
  <el-config-provider :locale="zhCn" tag="template">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<style>
/* 1. 只处理最基础的边距，不去控制 flex 或高度，完全交给具体页面 */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  background-color: #f5f7fa;
}

/* 2. 链接全局样式 */
a {
  text-decoration: none;
  color: inherit;
}

/* 3. 基础滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}
</style>