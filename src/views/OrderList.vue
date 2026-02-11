<template>
    <div class="page-container">
      <div class="header">
        <h2 @click="$router.push('/products')" style="cursor:pointer">Go Mall</h2>
        <span>我的订单</span>
      </div>
  
      <div class="content">
        <el-button @click="$router.push('/products')" icon="ArrowLeft" style="margin-bottom: 20px">返回首页</el-button>
        
        <el-card v-for="order in list" :key="order.order_no" class="order-item">
          <div class="o-header">
            <span>订单号：{{ order.order_no }}</span>
            <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </div>
          <div class="o-body">
            <div v-for="item in order.items" :key="item.sku_id" class="o-goods">
              <img :src="item.picture" class="thumb">
              <div class="info">
                <div>{{ item.product_name }}</div>
                <div class="price">¥ {{ item.price }} x {{ item.quantity }}</div>
              </div>
            </div>
          </div>
          <div class="o-footer">
            <div class="total">总计: ¥ {{ order.total_amount }}</div>
            <div class="btns">
              <el-button v-if="order.status === 0 || order.status === undefined" type="primary" @click="handlePay(order)">立即支付</el-button>
              <el-button v-if="order.status === 0 || order.status === undefined" @click="handleCancel(order)">取消</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getOrderList } from '../api/order'
  import { payOrder } from '../api/payment' // 需在 api/payment.js 实现
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  const list = ref([])
  
  const loadData = async () => {
    const res = await getOrderList()
    if (res.data && res.data.orders) {
      list.value = res.data.orders
    }
  }
  
  const getStatusText = (s) => {
    const status = (s === undefined || s === null) ? 0 : Number(s)
    if (status === 0) return '待支付'
    if (status === 1) return '已支付'
    if (status === 2) return '已取消'
    return '未知状态'
  }  

  const getStatusType = (s) => {
    const status = (s === undefined || s === null) ? 0 : Number(s)
    if (status === 0) return 'warning' // 黄色
    if (status === 1) return 'success' // 绿色
    if (status === 2) return 'info'    // 灰色
    return 'danger'
  }
  
  const handlePay = async (order) => {
    try {
      // 调用 Payment 服务
      await payOrder({ order_no: order.order_no, amount: order.total_amount })
      ElMessage.success('支付成功')
      loadData() // 刷新状态
    } catch (e) {
      ElMessage.error('支付失败')
    }
  }
  
  const handleCancel = (order) => {
      // 留给你练习：调用取消接口
      ElMessage.info('暂未实现前端取消')
  }
  
  onMounted(loadData)
  </script>
  
  <style scoped>
  .page-container { background: #f5f7fa; min-height: 100vh; }
  .header { background: #fff; padding: 0 10%; height: 60px; display: flex; align-items: center; justify-content: space-between; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .content { width: 1000px; margin: 20px auto; }
  .order-item { margin-bottom: 20px; }
  .o-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; font-size: 14px; color: #666; }
  .o-goods { display: flex; gap: 15px; margin-bottom: 10px; }
  .thumb { width: 60px; height: 60px; border-radius: 4px; border: 1px solid #eee; }
  .info { font-size: 14px; }
  .o-footer { border-top: 1px solid #eee; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; }
  .total { font-weight: bold; color: #f56c6c; font-size: 18px; }
  </style>