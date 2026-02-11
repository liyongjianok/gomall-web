<template>
  <div class="page-container">
    <div class="header-wrapper">
      <div class="header-content">
        <h2 class="logo" @click="handleSearch" style="cursor: pointer;">Go Mall</h2>
        
        <div class="search-box">
          <el-input 
            v-model="queryParams.query" 
            placeholder="搜商品..." 
            clearable 
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
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
          
          <el-dropdown @command="handleUserCommand" trigger="click">
            <div class="user-dropdown-link">
              <el-avatar :size="36" :src="userAvatar || defaultAvatar" />
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

    <div class="main-wrapper">
      <div class="goods-area" v-loading="loading">
        <el-empty v-if="productList.length === 0 && !loading" description="暂无商品" />
        
        <div class="strict-grid" v-if="productList.length > 0">
          <el-card 
            v-for="item in productList" 
            :key="item.id" 
            class="goods-card" 
            hover 
            shadow="hover"
          >
            <div class="goods-img-box" @click="goToDetail(item.id)">
              <img 
                :src="(item.picture && item.picture.startsWith('http')) ? item.picture : 'https://placehold.co/300x300?text=NoImage'" 
                class="goods-img" 
              />
            </div>
            
            <div class="goods-info">
              <h3 class="goods-name" :title="item.name" @click="goToDetail(item.id)" v-html="item.name"></h3>
              <p class="goods-desc" :title="item.description" v-html="item.description"></p>
                        
              <div class="goods-bottom">
                <span class="price">¥ {{ item.price }}</span>
                <el-button type="primary" size="small" @click="goToDetail(item.id)">
                  详情
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.page_size"
          :total="total"
          :page-sizes="[8, 16, 32]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProductList } from '../api/product'
import { ShoppingCart, ArrowDown } from '@element-plus/icons-vue' 
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const loading = ref(false)
const productList = ref([])
const total = ref(0)

// 头像相关变量
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const userAvatar = ref('')

const queryParams = reactive({
  page: 1,
  page_size: 16, 
  query: '', 
  category_id: 0
})

const getList = async () => {
  loading.value = true
  try {
    const res = await getProductList(queryParams)
    if (res.data && res.data.products) {
      productList.value = res.data.products
    } else if (res.data && res.data.Products) {
      productList.value = res.data.Products
    } else {
      productList.value = []
    }
    total.value = Number(res.data?.total || 0)
  } catch (error) {
    console.error("加载失败:", error)
    ElMessage.error("商品加载失败")
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1 
  getList()
}

const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

// 处理用户菜单点击 
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

// 获取用户信息（头像）
const loadUserInfo = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const res = await request.get('/user/info')
      if (res.code === 200 && res.data) {
        userAvatar.value = res.data.avatar
      }
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }
}

onMounted(() => {
  getList()
  loadUserInfo() // 挂载时加载头像
})
</script>

<style>
html { overflow-y: scroll; }
</style>

<style scoped>
.page-container { 
  min-height: 100vh; 
  background-color: #f5f7fa; 
  display: flex; 
  flex-direction: column; 
}

.header-wrapper { 
  position: sticky; 
  top: 0; 
  z-index: 999; 
  background-color: white; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); 
  width: 100%; 
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
}

.search-box { 
  width: 400px; 
}

/* 用户信息区样式优化 */
.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-btn {
  font-size: 18px;
  border: none;
  background: #f0f2f5;
  color: #606266;
}
.cart-btn:hover {
  background: #e6e8eb;
  color: #409EFF;
}

.user-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.2s;
}

.user-dropdown-link:hover {
  background: #f5f7fa;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.main-wrapper { 
  width: 1200px; 
  margin: 20px auto; 
  flex: 1; 
  padding-bottom: 40px;
}

.strict-grid { 
  display: grid; 
  width: 100%; 
  gap: 20px; 
  grid-template-columns: repeat(4, 1fr); 
}

/* 响应式适配 */
@media (max-width: 1220px) { 
  .header-content, .main-wrapper { 
    width: 100%; 
    padding: 0 20px; 
    box-sizing: border-box; 
  } 
  .strict-grid { 
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  } 
}

.goods-card { 
  width: 100%; 
  height: 380px; 
  border-radius: 8px; 
  transition: all 0.3s; 
  display: flex; 
  flex-direction: column; 
  border: none;
}

.goods-card:hover { 
  transform: translateY(-5px); 
  box-shadow: 0 10px 20px rgba(0,0,0,0.1); 
}

/* 强制覆盖 Element Plus Card 内部样式 */
:deep(.el-card__body) { 
  padding: 0; 
  display: flex; 
  flex-direction: column; 
  height: 100%; 
  width: 100%; 
}

.goods-img-box { 
  width: 100%; 
  height: 200px; 
  flex-shrink: 0; 
  overflow: hidden; 
  background: #fff; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  border-bottom: 1px solid #f0f0f0; 
  cursor: pointer;
}

.goods-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  transition: transform 0.3s;
}

.goods-card:hover .goods-img {
  transform: scale(1.05);
}

.goods-info { 
  padding: 15px; 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  background: white; 
  overflow: hidden; 
}

.goods-name { 
  margin: 0 0 8px 0; 
  font-size: 16px; 
  font-weight: 600; 
  color: #303133; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  cursor: pointer;
}
.goods-name:hover { color: #409EFF; }

.goods-desc { 
  color: #909399; 
  font-size: 13px; 
  margin: 0 0 15px 0; 
  line-height: 1.5; 
  height: 40px; 
  display: -webkit-box; 
  -webkit-box-orient: vertical; 
  -webkit-line-clamp: 2; 
  overflow: hidden; 
}

.goods-bottom { 
  margin-top: auto; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.price { 
  color: #f56c6c; 
  font-size: 18px; 
  font-weight: bold; 
}

.pagination-container { 
  margin-top: 40px; 
  display: flex; 
  justify-content: center; 
}
</style>