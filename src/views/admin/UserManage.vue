<template>
    <div class="user-manage">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <div class="left">
              <span class="title">注册用户管理</span>
              <el-tag size="small" type="info" style="margin-left: 10px;">
                共 {{ userList.length }} 位会员
              </el-tag>
            </div>
            <el-button type="primary" :icon="Refresh" @click="fetchData">刷新数据</el-button>
          </div>
        </template>
  
        <el-table :data="userList" v-loading="loading" border stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column prop="username" label="登录账号" min-width="120" />
          <el-table-column prop="nickname" label="用户昵称" min-width="120">
            <template #default="scope">
              {{ scope.row.nickname || '未设置' }}
            </template>
          </el-table-column>
          <el-table-column prop="mobile" label="手机号码" width="130" />
          
          <el-table-column label="权限角色" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'" effect="plain">
                {{ scope.row.role === 'admin' ? '管理员' : '普通会员' }}
              </el-tag>
            </template>
          </el-table-column>
  
          <el-table-column label="账户状态" width="160" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.is_disabled"
                :disabled="scope.row.role === 'admin'"
                active-color="#F56C6C"
                inactive-color="#67C23A"
                active-text="禁用"
                inactive-text="正常"
                inline-prompt
                @change="(val) => handleStatusToggle(scope.row, val)"
              />
            </template>
          </el-table-column>
  
          <el-table-column prop="created_at" label="注册时间" width="180">
            <template #default="scope">
               {{ formatTime(scope.row.created_at) }}
            </template>
          </el-table-column>
  
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="scope">
              <el-button 
                v-if="scope.row.role !== 'admin'"
                type="danger" 
                size="small" 
                plain
                :icon="Delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
              <span v-else style="font-size: 12px; color: #999;">-</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Refresh, Delete } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { getAdminUserList, toggleUserStatus, deleteAdminUser } from '../../api/admin'
  
  const loading = ref(false)
  const userList = ref([])
  
  // 获取数据
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getAdminUserList({ page: 1, page_size: 100 })
      if (res.code === 200) {
        userList.value = res.data.users || []
      }
    } catch (e) {
      ElMessage.error('获取用户列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 状态切换 (禁用/启用)
  const handleStatusToggle = async (row, isDisabled) => {
    try {
      const res = await toggleUserStatus({ user_id: row.id, disabled: isDisabled })
      if (res.code === 200) {
        ElMessage.success({
          message: `${row.username} 已${isDisabled ? '封禁' : '解除限制'}`,
          type: isDisabled ? 'warning' : 'success'
        })
      }
    } catch (e) {
      row.is_disabled = !isDisabled // 失败回滚前端状态
      ElMessage.error('状态更新失败')
    }
  }
  
  // 🔥 删除用户逻辑
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确定要永久删除用户 "${row.username}" 吗？此操作将清除该用户所有订单记录且不可撤销！`,
        '严正警告',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          confirmButtonClass: 'el-button--danger',
          type: 'error',
        }
      )
      
      loading.value = true
      const res = await deleteAdminUser(row.id)
      if (res.code === 200) {
        ElMessage.success('用户已强制注销')
        await fetchData() // 刷新列表
      }
    } catch (e) {
      // 用户取消删除
    } finally {
      loading.value = false
    }
  }
  
  // 时间格式化 (如果后端返回的是 ISO 字符串)
  const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return new Date(timeStr).toLocaleString()
  }
  
  onMounted(() => fetchData())
  </script>
  
  <style scoped>
  .user-manage {
    padding: 5px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-header .left {
    display: flex;
    align-items: center;
  }
  .title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
  }
  :deep(.el-table__row) {
    height: 60px;
  }
  </style>