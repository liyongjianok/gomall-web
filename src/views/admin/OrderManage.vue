<template>
    <el-card shadow="never">
      <el-table :data="orderList" border>
        <el-table-column prop="order_no" label="订单编号" width="200" />
        <el-table-column prop="total_amount" label="订单金额" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'warning' : 'success'">
              {{ scope.row.status === 1 ? '待发货' : '已发货' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button v-if="scope.row.status === 1" type="primary" size="small" @click="handleShip(scope.row.order_no)">
              点击发货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { shipOrder } from '../../api/admin'
  import { ElMessage } from 'element-plus'
  
  const orderList = ref([
    { order_no: 'ORD202602130001', total_amount: 58.50, status: 1 }
  ])
  
  const handleShip = async (no) => {
    const res = await shipOrder(no)
    if (res.code === 200) {
      ElMessage.success('发货成功，已通知物流')
      // 实际应重新拉取列表
    }
  }
  </script>