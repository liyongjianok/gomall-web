<template>
  <div class="page-container">
    <div class="sticky-header">
      <div class="header-content">
        <h2 class="logo" @click="goHome" style="cursor: pointer">Go Mall</h2>
        
        <div class="user-info">
          <el-button 
            icon="ShoppingCart" 
            circle 
            size="large"
            style="margin-right: 15px; font-size: 18px;" 
            @click="$router.push('/cart')"
          />
          
          <el-button type="info" link @click="logout">退出</el-button>
        </div>
      </div>
    </div>

    <div class="main-content">
      
      <div class="top-bar">
        <el-button @click="goHome" icon="ArrowLeft" size="large" class="back-btn">
          返回商品列表
        </el-button>
      </div>

      <el-card class="detail-card" v-loading="loading" shadow="never">
        <div class="detail-wrapper" v-if="product">
          
          <div class="img-section">
            <img 
              :src="(product.picture && product.picture.startsWith('http')) ? product.picture : 'https://placehold.co/500x500?text=NoImage'" 
              class="main-img" 
            />
          </div>

          <div class="info-section">
            <h1 class="p-name">{{ product.name }}</h1>
            
            <div class="price-box">
              <span class="label">价格</span>
              <span class="currency">¥</span>
              <span class="amount">{{ product.price }}</span>
            </div>

            <div class="desc-box">
              <span class="label">描述</span>
              <p class="p-desc">{{ product.description }}</p>
            </div>

            <el-divider border-style="dashed" />

            <div class="action-area">
              <div class="quantity-box">
                <span class="label">数量</span>
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="99" 
                  size="large"
                />
              </div>
              
              <div class="btn-group">
                <el-button 
                  type="warning" 
                  size="large" 
                  class="action-btn"
                  icon="ShoppingCart"
                  @click="handleAddToCart"
                  :loading="btnLoading"
                >
                  加入购物车
                </el-button>
                
                <el-button 
                  type="danger" 
                  size="large" 
                  class="action-btn"
                  icon="Lightning"
                  @click="handleSeckill"
                  :loading="btnLoading"
                >
                  立即秒杀
                </el-button>
              </div>
            </div>

            <div class="tips-box">
              <el-alert 
                title="秒杀提示" 
                type="error" 
                description="库存有限，手慢无！秒杀成功后请尽快支付。"
                show-icon 
                :closable="false"
              />
            </div>
          </div>
        </div>
        
        <el-empty v-else description="商品不存在或加载失败" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail, seckillProduct } from '../api/product'
import { addToCart } from '../api/cart'
import { ElMessage } from 'element-plus'
// 引入图标
import { ArrowLeft, ShoppingCart, Lightning } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const btnLoading = ref(false)
const product = ref(null)
const quantity = ref(1)
const productId = route.params.id

const goHome = () => {
  router.push('/products')
}

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getProductDetail(Number(productId))
    if (res.data) {
      product.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAddToCart = async () => {
  btnLoading.value = true
  try {
    const res = await addToCart({
      sku_id: product.value.id,
      quantity: quantity.value
    })
    if (res.code === 200) {
      ElMessage.success('成功加入购物车')
    }
  } catch (error) {
    console.error(error)
  } finally {
    btnLoading.value = false
  }
}

const handleSeckill = async () => {
  btnLoading.value = true
  try {
    const res = await seckillProduct(product.value.id)
    if (res.code === 200) {
      ElMessage.success('🎉 秒杀成功！')
    }
  } catch (error) {
    // request.js handled error
  } finally {
    btnLoading.value = false
  }
}

onMounted(() => {
  if (productId) {
    loadDetail()
  } else {
    ElMessage.error('参数错误')
    router.back()
  }
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* Header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 0 20px;
}
.header-content {
  width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo { margin: 0; font-size: 20px; color: #409EFF; font-weight: bold; }

/* Main Content */
.main-content {
  width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 按钮区域 */
.top-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}
.back-btn {
  background-color: white;
  border-color: #dcdfe6;
  color: #606266;
  font-weight: 500;
}
.back-btn:hover {
  border-color: #409EFF;
  color: #409EFF;
  background-color: #ecf5ff;
}

/* 详情卡片 */
.detail-card {
  border-radius: 8px;
  min-height: 500px;
}

.detail-wrapper {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.img-section {
  width: 450px;
  height: 450px;
  flex-shrink: 0;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fcfcfc;
}
.main-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.p-name {
  font-size: 26px;
  color: #333;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.price-box {
  background: #fff3f3;
  padding: 15px 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
}
.label {
  color: #999;
  font-size: 14px;
  width: 50px;
  display: inline-block;
  margin-right: 10px;
}
.currency { color: #e4393c; font-size: 18px; font-weight: bold; }
.amount { color: #e4393c; font-size: 36px; font-weight: bold; }

.desc-box {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}
.p-desc { margin: 0; color: #666; font-size: 14px; line-height: 1.6; flex: 1; }

.action-area { margin-top: 20px; }
.quantity-box { display: flex; align-items: center; margin-bottom: 25px; }
.btn-group { display: flex; gap: 20px; }
.action-btn { width: 180px; height: 50px; font-size: 18px; }
.tips-box { margin-top: 30px; }
</style>