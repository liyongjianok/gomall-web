<template>
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>注册用户概览</span>
          <el-button type="primary" link @click="fetchData">刷新数据</el-button>
        </div>
      </template>
  
      <el-table :data="userList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="登录账号" />
        <el-table-column prop="nickname" label="用户昵称" />
        <el-table-column prop="mobile" label="手机号码" />
        <el-table-column label="权限角色">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'info'">
              {{ scope.row.role === 'admin' ? '管理员' : '普通会员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账户状态">
          <template #default="scope">
            <el-switch
              v-model="scope.row.is_disabled"
              active-color="#ff4949"
              inactive-color="#13ce66"
              active-text="禁用"
              inactive-text="正常"
              @change="(val) => handleStatusToggle(scope.row.id, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" />
      </el-table>
    </el-card>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getAdminUserList, toggleUserStatus } from '../../api/admin'
  import { ElMessage } from 'element-plus'
  
  const loading = ref(false)
  const userList = ref([])
  
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getAdminUserList({ page: 1, page_size: 50 })
      if (res.code === 200) userList.value = res.data.users
    } finally { loading.value = false }
  }
  
  const handleStatusToggle = async (userId, isDisabled) => {
    try {
      const res = await toggleUserStatus({ user_id: userId, disabled: isDisabled })
      if (res.code === 200) {
        ElMessage.success(isDisabled ? '账号已成功封禁' : '账号已解除限制')
      }
    } catch (e) {
      fetchData() // 失败回滚显示状态
    }
  }
  
  onMounted(() => fetchData())
  </script>