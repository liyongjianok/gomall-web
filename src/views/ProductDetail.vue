<template>
  <div class="page-container">
    <div class="sticky-header">
      <div class="header-content">
        <h2 class="logo" @click="goHome">Go Mall</h2>
        
        <div class="user-info">
          <el-badge :value="cartCount" :hidden="cartCount === 0" class="cart-badge">
            <el-button 
              :icon="ShoppingCart" 
              circle 
              size="large"
              class="cart-btn"
              @click="$router.push('/cart')"
            />
          </el-badge>

          <el-dropdown trigger="click" style="margin-left: 20px;" @command="handleUserCommand">
            <div class="user-dropdown-link">
              <el-avatar :size="32" :src="userAvatar || defaultAvatar" />
              <span class="username">我的账户</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="main-content" v-loading="loading">
      <div class="breadcrumb-box">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/products' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ product?.name || '商品详情' }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <el-card class="detail-card" shadow="never" v-if="product">
        <div class="product-intro">
          <div class="preview-wrap">
            <el-image 
              :src="formatImg(product.picture)" 
              class="main-img" 
              fit="contain"
              :preview-src-list="[formatImg(product.picture)]" 
            />
          </div>

          <div class="item-info-wrap">
            <h1 class="sku-name">{{ product.name }}</h1>
            <div class="news">
              <el-tag size="small" type="danger" effect="plain" style="margin-right: 5px;">自营</el-tag> 
              <span class="sub-title">{{ product.description }}</span>
            </div>

            <div class="summary-price-wrap">
              <div class="price-box">
                <span class="dt">秒杀价</span>
                <div class="dd">
                  <span class="symbol">¥</span>
                  <span class="price">{{ product.price }}</span>
                  <span class="old-price" v-if="product.price">¥{{ (product.price * 1.2).toFixed(2) }}</span>
                </div>
              </div>
              <div class="activity-box">
                <el-icon color="#fff"><Timer /></el-icon>
                <span class="text">限时秒杀，手慢无！</span>
              </div>
            </div>

            <div class="sku-meta">
              <div class="meta-row">
                <span class="label">SKU 编号</span>
                <span class="val">{{ product.sku_id || product.id }}</span>
              </div>
              <div class="meta-row">
                <span class="label">剩余库存</span>
                <span class="val">{{ product.stock > 0 ? product.stock + ' 件' : '缺货' }}</span>
              </div>
              <div class="meta-row">
                <span class="label">商品评分</span>
                <span class="val">
                  <el-rate v-model="rating" disabled show-score text-color="#ff9900" score-template="{value}" />
                </span>
              </div>
              <div class="meta-row">
                <span class="label">配送至</span>
                <span class="val">全国包邮 <span style="color:#999;font-size:12px;">(部分偏远地区除外)</span></span>
              </div>
            </div>

            <el-divider border-style="dashed" />

            <div class="buy-group">
              <div class="qty-box">
                <el-input-number v-model="quantity" :min="1" :max="99" size="large" />
              </div>
              <div class="btns">
                <el-button 
                  type="warning" 
                  size="large" 
                  class="btn-cart"
                  @click="handleAddToCart"
                  :loading="btnLoading"
                >
                  加入购物车
                </el-button>
                <el-button 
                  type="danger" 
                  size="large" 
                  class="btn-buy"
                  @click="handleSeckill"
                  :loading="btnLoading"
                  :disabled="product.stock <= 0"
                >
                  立即秒杀
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-bottom">
          <el-tabs v-model="activeTab" class="product-tabs">
            
            <el-tab-pane label="商品介绍" name="intro">
              <div class="rich-content">
                <p class="section-title">产品参数</p>
                <div class="params-table">
                  <div class="p-item"><span>商品名称：</span>{{ product.name }}</div>
                  <div class="p-item"><span>商品编号：</span>{{ product.sku_id || product.id }}</div>
                  <div class="p-item"><span>上架时间：</span>2023-10-01</div>
                  <div class="p-item"><span>产地：</span>中国大陆</div>
                </div>
                
                <p class="section-title">商品详情</p>
                <div class="demo-long-img">
                  <p>{{ product.description }}</p>
                  <p>新鲜直达，品质保证。</p>
                  <img src="https://placehold.co/800x400/f5f5f5/999999?text=Product+Details+Image+1" />
                  <img src="https://placehold.co/800x600/f5f5f5/999999?text=Product+Details+Image+2" />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane :label="'商品评价 (' + mockReviews.length + ')'" name="reviews">
              <div class="reviews-container">
                <div class="rate-header">
                  <div class="rate-score">
                    <span class="num">98%</span>
                    <span class="text">好评率</span>
                  </div>
                  <div class="rate-tags">
                    <el-tag>味道不错 (120)</el-tag>
                    <el-tag>非常新鲜 (80)</el-tag>
                    <el-tag>物流快 (60)</el-tag>
                    <el-tag type="info">包装一般 (5)</el-tag>
                  </div>
                </div>

                <div class="review-list">
                  <div v-for="review in mockReviews" :key="review.id" class="review-item">
                    <div class="user-col">
                      <el-avatar :size="40" :src="review.avatar" />
                      <span class="name">{{ review.username }}</span>
                    </div>
                    <div class="content-col">
                      <el-rate v-model="review.star" disabled size="small" />
                      <p class="text">{{ review.content }}</p>
                      <div class="img-list" v-if="review.images">
                        <el-image 
                          v-for="(img, idx) in review.images" 
                          :key="idx" 
                          :src="img" 
                          class="review-img"
                          :preview-src-list="review.images"
                        />
                      </div>
                      <span class="time">{{ review.time }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
      
      <el-empty v-else description="商品加载失败" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail, seckillProduct } from '../api/product'
import { addCartItem, getCartList } from '../api/cart'
// 🔥 引入 request 用于获取用户信息
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart, ArrowDown, ArrowLeft, Timer } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const btnLoading = ref(false)
const product = ref(null)
const quantity = ref(1)
const activeTab = ref('intro')
const rating = ref(4.8)
const cartCount = ref(0)

// 🔥 头像相关
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const userAvatar = ref('')

// 模拟评价数据
const mockReviews = ref([
  { 
    id: 1, 
    username: '张**三', 
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', 
    star: 5, 
    content: '非常新鲜，发货速度也很快，家里人都很喜欢吃！', 
    time: '2023-10-25 12:30',
    images: ['https://placehold.co/100x100?text=Pic1', 'https://placehold.co/100x100?text=Pic2']
  },
  { 
    id: 2, 
    username: '李**四', 
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', 
    star: 4, 
    content: '性价比很高，下次还会再来买的。', 
    time: '2023-10-24 09:15' 
  },
  { 
    id: 3, 
    username: '王**五', 
    avatar: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg', 
    star: 5, 
    content: '包装很严实，没有损坏，这就是我要的味道。', 
    time: '2023-10-20 18:20' 
  }
])

const productId = route.params.id

const goHome = () => router.push('/products')

// 用户菜单操作
const handleUserCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    ElMessage.success('已退出登录')
    router.push('/login')
  } else if (command === 'orders') {
    router.push('/orders')
  } else if (command === 'profile') {
    router.push('/user')
  }
}

const formatImg = (url) => {
  if (url && url.startsWith('http')) return url
  return 'https://placehold.co/500x500?text=NoImage'
}

const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getProductDetail(Number(productId))
    if (res.data) {
      product.value = res.data
      // 兼容字段
      product.value.price = res.data.price || res.data.Price
      product.value.id = res.data.id || res.data.Id
      product.value.sku_id = res.data.sku_id || res.data.SkuId
      // 如果后端没返回 stock，默认给一个值演示
      product.value.stock = res.data.stock !== undefined ? res.data.stock : 999 
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

// 🔥 获取用户信息（头像）
const loadUserInfo = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const res = await request.get('/user/info')
      if (res.code === 200 && res.data) {
        userAvatar.value = res.data.avatar
      }
    } catch (e) { console.error(e) }
  }
}

// 获取购物车数量
const updateCartCount = async () => {
  try {
    const res = await getCartList()
    // 兼容后端不同的大小写返回
    let items = []
    if (res.data && res.data.items) items = res.data.items
    else if (res.data && res.data.Items) items = res.data.Items
    
    cartCount.value = items.length
  } catch(e) {}
}

const handleAddToCart = async () => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    return router.push('/login')
  }
  btnLoading.value = true
  try {
    const res = await addCartItem({
      sku_id: product.value.sku_id || product.value.id,
      quantity: quantity.value
    })
    if (res.code === 200) {
      ElMessage.success('成功加入购物车')
      updateCartCount()
    } else {
      ElMessage.error(res.msg || '加入失败')
    }
  } catch (error) {
    ElMessage.error('服务异常')
  } finally {
    btnLoading.value = false
  }
}

const handleSeckill = async () => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    return router.push('/login')
  }
  btnLoading.value = true
  try {
    const targetId = product.value.sku_id || product.value.id
    const res = await seckillProduct(targetId)
    
    if (res.code === 200) {
      ElMessageBox.alert('恭喜！抢购请求已提交，系统正在为您创建订单...', '抢购成功', {
        confirmButtonText: '查看订单',
        type: 'success',
        callback: () => router.push('/orders')
      })
    } else {
      ElMessage.error(res.msg || '抢购失败')
    }
  } catch (error) {
    if (error.message) ElMessage.error(error.message)
  } finally {
    btnLoading.value = false
  }
}

onMounted(() => {
  if (productId) {
    loadDetail()
    if(localStorage.getItem('token')) {
      loadUserInfo()
      updateCartCount()
    }
  } else {
    router.back()
  }
})
</script>

<style scoped>
.page-container { min-height: 100vh; background-color: #f4f4f4; display: flex; flex-direction: column; }

/* 头部样式 */
.sticky-header { position: sticky; top: 0; z-index: 999; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.06); height: 64px; }
.header-content { width: 1200px; margin: 0 auto; height: 100%; display: flex; align-items: center; justify-content: space-between; }
.logo { margin: 0; font-size: 24px; color: #e4393c; font-weight: 800; cursor: pointer; letter-spacing: -1px; }
.user-info { display: flex; align-items: center; }
.cart-btn { font-size: 18px; border: none; background: #f0f2f5; color: #606266; }
.cart-btn:hover { background: #e6e8eb; color: #409EFF; }
.user-dropdown-link { display: flex; align-items: center; cursor: pointer; padding: 5px; border-radius: 4px; transition: background 0.2s; }
.user-dropdown-link:hover { background: #f5f7fa; }
.username { margin: 0 8px; font-size: 14px; color: #606266; font-weight: 500; }

/* 主内容 */
.main-content { width: 1200px; margin: 20px auto; flex: 1; }
.breadcrumb-box { margin-bottom: 15px; font-size: 13px; }

/* 商品卡片 - 上半部分 */
.detail-card { border-radius: 0; border: none; overflow: visible; }
.product-intro { display: flex; gap: 40px; padding: 20px 0; }

/* 左侧图片 */
.preview-wrap { width: 400px; flex-shrink: 0; }
.main-img { width: 400px; height: 400px; border: 1px solid #eee; border-radius: 2px; }

/* 右侧信息 */
.item-info-wrap { flex: 1; }
.sku-name { font-size: 20px; color: #333; font-weight: 700; line-height: 1.4; margin-bottom: 10px; }
.news { margin-bottom: 15px; }
.sub-title { color: #e4393c; font-size: 14px; }

/* 价格区域 */
.summary-price-wrap { background: #f3f3f3; padding: 15px; border-radius: 4px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.price-box { display: flex; align-items: baseline; }
.dt { color: #999; font-size: 13px; margin-right: 15px; }
.dd { display: flex; align-items: baseline; }
.symbol { color: #e4393c; font-size: 18px; }
.price { color: #e4393c; font-size: 32px; font-weight: bold; margin-right: 10px; }
.old-price { color: #999; text-decoration: line-through; font-size: 14px; }
.activity-box { background: #e4393c; color: white; padding: 2px 10px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 4px; }

/* 规格参数 */
.sku-meta { margin-bottom: 20px; }
.meta-row { display: flex; margin-bottom: 8px; font-size: 13px; }
.label { width: 70px; color: #999; }
.val { color: #666; display: flex; align-items: center; }

/* 购买区域 */
.buy-group { margin-top: 25px; display: flex; gap: 20px; align-items: center; }
.btns { display: flex; gap: 15px; }
.btn-cart { width: 140px; height: 46px; font-size: 16px; font-weight: bold; }
.btn-buy { width: 140px; height: 46px; font-size: 16px; font-weight: bold; }

/* 详情 & 评价区 */
.detail-bottom { margin-top: 30px; background: #fff; border: 1px solid #eee; min-height: 500px; }
:deep(.el-tabs__nav-wrap) { padding: 0 20px; background: #f7f7f7; }
:deep(.el-tabs__item) { font-size: 16px; height: 50px; line-height: 50px; }
:deep(.el-tabs__content) { padding: 20px; }

/* 商品介绍 */
.rich-content { width: 100%; }
.section-title { background: #f7f7f7; padding: 10px; font-weight: bold; margin-bottom: 15px; border-left: 3px solid #e4393c; }
.params-table { display: flex; flex-wrap: wrap; margin-bottom: 30px; font-size: 14px; color: #666; }
.p-item { width: 33%; margin-bottom: 10px; }
.demo-long-img { text-align: center; color: #999; }
.demo-long-img img { display: block; width: 100%; margin: 10px 0; border: 1px solid #f0f0f0; }

/* 评价列表 */
.rate-header { background: #fff; border: 1px solid #ffd2b1; background: #fff9f3; padding: 15px; display: flex; align-items: center; margin-bottom: 20px; }
.rate-score { color: #e4393c; font-size: 30px; font-weight: bold; margin-right: 30px; display: flex; flex-direction: column; align-items: center; }
.rate-score .text { font-size: 12px; color: #999; font-weight: normal; }
.rate-tags { flex: 1; }
.rate-tags .el-tag { margin-right: 10px; margin-bottom: 5px; cursor: pointer; }

.review-item { display: flex; padding: 20px 0; border-bottom: 1px solid #eee; }
.user-col { width: 120px; text-align: center; font-size: 12px; color: #666; }
.user-col .name { display: block; margin-top: 5px; }
.content-col { flex: 1; }
.content-col .text { margin: 8px 0; font-size: 14px; line-height: 1.5; color: #333; }
.content-col .time { font-size: 12px; color: #999; }
.img-list { display: flex; gap: 10px; margin-bottom: 10px; }
.review-img { width: 60px; height: 60px; border-radius: 4px; border: 1px solid #eee; }
</style>