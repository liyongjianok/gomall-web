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
          <el-button :icon="ShoppingCart" circle size="large" class="cart-btn" @click="$router.push('/cart')" />
          <el-dropdown @command="handleUserCommand">
            <div class="user-dropdown-link">
              <el-avatar :size="36" :src="userAvatar || defaultAvatar" />
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
                <span class="order-time">{{ order.created_at || order.CreatedAt }}</span>
                <span class="order-no">订单号：{{ order.order_no || order.OrderNo }}</span>
              </div>
              <div class="header-right">
                <span class="status-text" :class="getStatusClass(order.status || order.Status)">
                  {{ getStatusText(order.status || order.Status) }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <div class="product-group">
                <div v-for="item in (order.items || order.Items)" :key="item.sku_id || item.SkuId" class="product-row">
                  <img :src="item.picture || item.Picture" class="thumb" />
                  <div class="info">
                    <div class="name">{{ item.product_name || item.ProductName }}</div>
                    <div class="sku">{{ item.sku_name || item.SkuName }}</div>
                  </div>
                  <div class="unit-price">¥ {{ item.price || item.Price }} x {{ item.quantity || item.Quantity }}</div>
                  
                  <div class="item-action" v-if="(order.status || order.Status) === 1">
                    <el-button v-if="item._reviewed" size="small" type="success" plain disabled>已评价</el-button>
                    <el-button v-else size="small" type="primary" plain @click="openReviewDialog(order, item)">评价商品</el-button>
                  </div>
                </div>
              </div>

              <div class="action-column">
                <div class="amount-info">
                  <span class="label">实付金额：</span>
                  <span class="total-price">¥ {{ order.total_amount || order.TotalAmount }}</span>
                </div>
                
                <div class="btn-area">
                  <el-button 
                    v-if="isUnpaid(order.status || order.Status)" 
                    type="danger" 
                    class="pay-btn"
                    @click="handlePay(order)"
                  >
                    立即支付
                  </el-button>
                  <el-button 
                    v-if="isUnpaid(order.status || order.Status)" 
                    text 
                    @click="handleCancel(order)"
                  >
                    取消订单
                  </el-button>
                  
                  <el-button v-if="(order.status || order.Status) === 1" type="info" plain size="small" @click="$router.push('/products')">再次购买</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <el-dialog v-model="reviewDialogVisible" title="发表评价" width="500px">
      <div class="review-form-header" v-if="currentReviewItem">
        <img :src="currentReviewItem.picture || currentReviewItem.Picture" class="review-thumb" />
        <span>{{ currentReviewItem.product_name || currentReviewItem.ProductName }}</span>
      </div>
      <el-form :model="reviewForm" label-width="80px" style="margin-top: 20px;">
        <el-form-item label="商品评分">
          <el-rate v-model="reviewForm.star" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" show-text />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input 
            v-model="reviewForm.content" 
            type="textarea" 
            :rows="4" 
            placeholder="商品满足你的期待吗？说说你的使用心得吧！"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview" :loading="submitReviewLoading">提交评价</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList } from '../api/order'
import { payOrder } from '../api/payment'
import { addReview, checkReviewStatus } from '../api/review' 
import request from '../utils/request'
import { ShoppingCart, ArrowDown } from '@element-plus/icons-vue' 
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const searchQuery = ref('')

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const userAvatar = ref('')
const userNickname = ref('') 

const reviewDialogVisible = ref(false)
const submitReviewLoading = ref(false)
const currentReviewItem = ref(null)
const reviewForm = reactive({
  order_no: '',
  sku_id: '',
  product_id: 0, 
  content: '',
  star: 5,
  sku_name: ''
})

const isUnpaid = (status) => status === 0 || status === undefined || status === null

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOrderList()
    if (res.code === 200 || res.data) {
      list.value = res.data.orders || res.data.Orders || res.data || []
    }
  } catch (e) {
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

const loadUserInfo = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const res = await request.get('/user/info')
      if (res.code === 200 && res.data) {
        userAvatar.value = res.data.avatar || res.data.Avatar
        userNickname.value = res.data.username || res.data.Username || '匿名用户'
      }
    } catch (e) {}
  }
}

// 打开评价弹窗 (Robust Version)
const openReviewDialog = async (order, item) => {
  let sId = item.sku_id || item.SkuId || item.id 
  if (!sId) sId = item.product_id || item.ProductId

  const oNo = order.order_no || order.OrderNo || ''
  
  if (!sId || !oNo) {
    console.error("数据缺失:", item, order)
    return ElMessage.error('订单数据异常，无法评价')
  }

  try {
    const res = await checkReviewStatus({ order_no: oNo, sku_id: Number(sId) })
    if (res.data && (res.data.has_reviewed || res.data.HasReviewed)) {
      item._reviewed = true 
      return ElMessage.warning('您已经评价过该商品啦！')
    }
  } catch (e) {
    console.error(e)
  }

  currentReviewItem.value = item
  reviewForm.order_no = oNo
  reviewForm.sku_id = Number(sId)
  reviewForm.sku_name = item.sku_name || item.SkuName || item.skuName || '默认规格'
  reviewForm.content = ''
  reviewForm.star = 5
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  if (!reviewForm.content.trim()) return ElMessage.warning('评价内容不能为空哦！')
  submitReviewLoading.value = true
  try {
    const res = await addReview({
      ...reviewForm,
      user_nickname: userNickname.value,
      user_avatar: userAvatar.value || defaultAvatar
    })
    if (res.code === 200) {
      ElMessage.success('🎉 评价成功！感谢您的反馈。')
      reviewDialogVisible.value = false
      if (currentReviewItem.value) currentReviewItem.value._reviewed = true
    } else {
      ElMessage.error(res.msg || '评价失败')
    }
  } catch (error) {
    if (error.message && error.message.includes('已评价')) {
      ElMessage.warning('您已经评价过该商品啦！')
      reviewDialogVisible.value = false
      if (currentReviewItem.value) currentReviewItem.value._reviewed = true
    } else {
      ElMessage.error('提交失败，请稍后再试')
    }
  } finally {
    submitReviewLoading.value = false
  }
}

const getStatusText = (s) => {
  const status = isUnpaid(s) ? 0 : Number(s)
  if (status === 0) return '待支付'
  if (status === 1) return '已完成'
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

const handlePay = async (order) => {
  try {
    await ElMessageBox.confirm(`确认支付订单 ¥${order.total_amount || order.TotalAmount} 吗？`, '支付确认', {
      confirmButtonText: '确定支付', // 🔥 明确的中文按钮
      cancelButtonText: '取消',      // 🔥 明确的中文按钮
      type: 'warning'
    })
    await payOrder({ order_no: order.order_no || order.OrderNo, amount: order.total_amount || order.TotalAmount })
    ElMessage.success('支付成功！')
    loadData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('支付失败') }
}

const handleCancel = (order) => ElMessage.info('取消功能暂未开放')
const handleGlobalSearch = () => router.push({ path: '/products', query: { q: searchQuery.value } })
const handleUserCommand = (command) => {
  if (command === 'logout') { localStorage.clear(); router.push('/login') } 
  else if (command === 'home') router.push('/products') 
  else if (command === 'profile') router.push('/user')
}

onMounted(() => { loadData(); loadUserInfo() })
</script>

<style scoped>
.header-wrapper { background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); width: 100%; position: sticky; top: 0; z-index: 100;}
.header-content { width: 1200px; margin: 0 auto; height: 60px; display: flex; align-items: center; justify-content: space-between; }
.logo { font-size: 22px; color: #409EFF; font-weight: bold; margin: 0; cursor: pointer;}
.search-box { width: 400px; }
.user-info { display: flex; align-items: center; gap: 20px; }
.cart-btn { font-size: 18px; border: none; background: #f0f2f5; color: #606266; }
.user-dropdown-link { display: flex; align-items: center; cursor: pointer; padding: 5px; }
.username { margin: 0 8px; font-size: 14px; color: #606266; font-weight: 500; }
.main-wrapper { width: 1200px; margin: 30px auto; min-height: 500px;}
.page-header { margin-bottom: 20px;}
.page-title { margin-top: 15px; font-size: 24px; color: #303133;}
.order-card { margin-bottom: 20px; border: 1px solid #e4e7ed; border-radius: 4px;}
.card-header { background: #f5f7fa; padding: 10px 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #e4e7ed; font-size: 13px; color: #606266;}
.header-left { display: flex; gap: 30px; }
.order-no { color: #303133; }
.status-text { font-weight: bold; font-size: 14px; }
.text-warning { color: #e6a23c; } .text-success { color: #67c23a; } .text-info { color: #909399; }
.card-body { display: flex; padding: 20px;}
.product-group { flex: 1; border-right: 1px solid #e4e7ed; padding-right: 20px;}
.product-row { display: flex; align-items: center; margin-bottom: 15px;}
.thumb { width: 70px; height: 70px; border: 1px solid #eee; border-radius: 4px; margin-right: 15px; object-fit: cover;}
.info { flex: 1; }
.name { font-size: 14px; color: #303133; margin-bottom: 5px; }
.sku { font-size: 12px; color: #909399; }
.unit-price { width: 120px; text-align: right; color: #606266; font-size: 13px; }
.item-action { width: 100px; text-align: right; margin-left: 20px; }
.action-column { width: 200px; padding-left: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center;}
.amount-info { margin-bottom: 15px; text-align: center;}
.label { font-size: 12px; color: #909399; }
.total-price { font-size: 18px; color: #f56c6c; font-weight: bold; display: block; margin-top: 5px; }
.btn-area { display: flex; flex-direction: column; gap: 10px; width: 100%;}
.pay-btn { width: 100%; }
.review-form-header { display: flex; align-items: center; gap: 15px; padding: 10px; background: #f9fafc; border-radius: 4px; font-weight: bold; color: #333;}
.review-thumb { width: 40px; height: 40px; border-radius: 4px; border: 1px solid #eee;}
@media (max-width: 1220px) { .header-content, .main-wrapper { width: 100%; padding: 0 20px; box-sizing: border-box; } }
</style>