<template>
  <div class="page-container">
    <div class="header-wrapper">
      <div class="header-content">
        <h2 class="logo" @click="$router.push('/products')">Go Mall</h2>
        
        <div class="search-box">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜全站商品..." 
            @keyup.enter="handleGlobalSearch"
          >
            <template #append>
              <el-button @click="handleGlobalSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        
        <div class="user-info">
          <el-button 
            :icon="ShoppingCart" 
            circle 
            size="large"
            class="cart-btn"
            @click="$router.push('/cart')"
          />
          
          <el-dropdown @command="handleUserCommand">
            <div class="user-dropdown-link">
              <el-avatar :size="36" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span class="username">我的账户</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="home">返回首页</el-dropdown-item>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="orders" disabled>我的订单</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="main-wrapper">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/products' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>我的订单</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">我的订单</h2>
      </div>

      <div class="order-content" v-loading="loading">
        <el-empty v-if="list.length === 0 && !loading" description="您还没有订单，快去买点东西吧！">
          <el-button type="primary" @click="$router.push('/products')">去逛逛</el-button>
        </el-empty>

        <div v-else>
          <el-card v-for="order in list" :key="order.order_no" class="order-card" shadow="never">
            <div class="card-header">
              <div class="header-left">
                <span class="order-time">{{ order.created_at }}</span>
                <span class="order-no">订单号：{{ order.order_no }}</span>
              </div>
              <div class="header-right">
                <span class="status-text" :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <div class="product-group">
                <div v-for="item in order.items" :key="item.sku_id" class="product-row">
                  <img :src="item.picture" class="thumb" />
                  <div class="info">
                    <div class="name">{{ item.product_name }}</div>
                    <div class="sku">{{ item.sku_name }}</div>
                  </div>
                  <div class="unit-price">¥ {{ item.price }} x {{ item.quantity }}</div>
                </div>
              </div>

              <div class="action-column">
                <div class="amount-info">
                  <span class="label">实付金额：</span>
                  <span class="total-price">¥ {{ order.total_amount }}</span>
                </div>
                
                <div class="btn-area">
                  <el-button 
                    v-if="isUnpaid(order.status)" 
                    type="danger" 
                    class="pay-btn"
                    @click="handlePay(order)"
                  >
                    立即支付
                  </el-button>
                  <el-button 
                    v-if="isUnpaid(order.status)" 
                    text 
                    @click="handleCancel(order)"
                  >
                    取消订单
                  </el-button>
                  
                  <el-button v-if="order.status === 1" type="primary" plain size="small" @click="$router.push('/products')">再次购买</el-button>
                  <el-button v-if="order.status === 2" type="info" plain size="small" disabled>已取消</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList } from '../api/order'
import { payOrder } from '../api/payment'
import { ShoppingCart, ArrowDown } from '@element-plus/icons-vue' 
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const searchQuery = ref('')

// 判断是否为待支付 (兼容 undefined/null)
const isUnpaid = (status) => {
  return status === 0 || status === undefined || status === null
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOrderList()
    if (res.code === 200 || res.data) {
      list.value = res.data.orders || res.data || []
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

// 状态显示逻辑
const getStatusText = (s) => {
  const status = isUnpaid(s) ? 0 : Number(s)
  if (status === 0) return '待支付'
  if (status === 1) return '已支付'
  if (status === 2) return '已取消'
  return '未知'
}

const getStatusClass = (s) => {
  const status = isUnpaid(s) ? 0 : Number(s)
  if (status === 0) return 'text-warning'
  if (status === 1) return 'text-success'
  if (status === 2) return 'text-info'
  return ''
}

// 支付
const handlePay = async (order) => {
  try {
    await ElMessageBox.confirm(`确认支付订单 ¥${order.total_amount} 吗？`, '支付确认', {
      confirmButtonText: '确定支付',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await payOrder({ order_no: order.order_no, amount: order.total_amount })
    ElMessage.success('支付成功！')
    loadData()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('支付失败')
  }
}

// 取消 (暂未对接后端接口)
const handleCancel = (order) => {
  ElMessage.info('取消功能暂未开放')
}

// 顶部搜索 (跳转回首页搜索)
const handleGlobalSearch = () => {
  router.push({ path: '/products', query: { q: searchQuery.value } })
}

// 用户菜单
const handleUserCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    router.push('/login')
  } else if (command === 'home') {
    router.push('/products')
  } else if (command === 'profile') {
    router.push('/user')
  }
}

onMounted(loadData)
</script>

<style>
/* 全局样式覆盖 */
body { margin: 0; background-color: #f5f7fa; }
</style>

<style scoped>
/* ==================== 头部样式 (与首页完全一致) ==================== */
.header-wrapper { 
  background-color: white; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); 
  width: 100%; 
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-content { 
  width: 1200px; 
  margin: 0 auto; 
  height: 60px; 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
}
.logo { 
  font-size: 22px; 
  color: #409EFF; 
  font-weight: bold; 
  margin: 0; 
  cursor: pointer;
}
.search-box { width: 400px; }
.user-info { display: flex; align-items: center; gap: 20px; }
.cart-btn { font-size: 18px; border: none; background: #f0f2f5; color: #606266; }
.cart-btn:hover { background: #e6e8eb; color: #409EFF; }
.user-dropdown-link { display: flex; align-items: center; cursor: pointer; padding: 5px; }
.username { margin: 0 8px; font-size: 14px; color: #606266; font-weight: 500; }

/* ==================== 主内容区 (1200px 居中) ==================== */
.main-wrapper { 
  width: 1200px; 
  margin: 30px auto; 
  min-height: 500px;
}

.page-header {
  margin-bottom: 20px;
}
.page-title {
  margin-top: 15px;
  font-size: 24px;
  color: #303133;
}

/* ==================== 订单卡片样式 ==================== */
.order-card {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

/* 头部灰色背景 */
.card-header {
  background: #f5f7fa;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
  font-size: 13px;
  color: #606266;
}
.header-left { display: flex; gap: 30px; }
.order-no { color: #303133; }
.status-text { font-weight: bold; font-size: 14px; }
.text-warning { color: #e6a23c; } /* 待支付 */
.text-success { color: #67c23a; } /* 已支付 */
.text-info { color: #909399; }    /* 已取消 */

/* 卡片内容区 */
.card-body {
  display: flex;
  padding: 20px;
}

/* 左侧商品组 */
.product-group {
  flex: 1;
  border-right: 1px solid #e4e7ed;
  padding-right: 20px;
}

.product-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.product-row:last-child { margin-bottom: 0; }

.thumb {
  width: 70px;
  height: 70px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-right: 15px;
  object-fit: cover;
}
.info { flex: 1; }
.name { font-size: 14px; color: #303133; margin-bottom: 5px; }
.sku { font-size: 12px; color: #909399; }
.unit-price { width: 120px; text-align: right; color: #606266; font-size: 13px; }

/* 右侧操作区 */
.action-column {
  width: 200px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.amount-info {
  margin-bottom: 15px;
  text-align: center;
}
.label { font-size: 12px; color: #909399; }
.total-price { font-size: 18px; color: #f56c6c; font-weight: bold; display: block; margin-top: 5px; }

.btn-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.pay-btn { width: 100%; }

/* 响应式适配 (防止小于1200px时错乱) */
@media (max-width: 1220px) {
  .header-content, .main-wrapper { width: 100%; padding: 0 20px; box-sizing: border-box; }
}
</style>