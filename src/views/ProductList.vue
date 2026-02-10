<template>
  <div class="page-container">
    <div class="header-wrapper">
      <div class="header-content">
        <h2 class="logo">Go Mall</h2>
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
            style="margin-right: 15px; font-size: 18px;" 
            @click="$router.push('/cart')"
          />
          
          <el-button type="info" link @click="logout">退出</el-button>
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
            <div class="goods-img-box">
              <img 
                :src="(item.picture && item.picture.startsWith('http')) ? item.picture : 'https://placehold.co/300x300?text=NoImage'" 
                class="goods-img" 
              />
            </div>
            
            <div class="goods-info">
              <h3 class="goods-name" :title="item.name">{{ item.name }}</h3>
              <p class="goods-desc" :title="item.description">{{ item.description }}</p>
              
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
          layout="total, prev, pager, next"
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
import { ShoppingCart } from '@element-plus/icons-vue' // 确保引入了

const router = useRouter()
const loading = ref(false)
const productList = ref([])
const total = ref(0)

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

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

onMounted(() => {
  getList()
})
</script>

<style>
html { overflow-y: scroll; }
</style>

<style scoped>
.page-container { min-height: 100vh; background-color: #f5f7fa; display: flex; flex-direction: column; margin: 0; padding: 0; }
.header-wrapper { position: sticky; top: 0; z-index: 999; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); width: 100%; }
.header-content { width: 1200px; margin: 0 auto; height: 60px; display: flex; align-items: center; justify-content: space-between; }
.logo { margin: 0; font-size: 20px; color: #409EFF; font-weight: bold; }
.search-box { width: 400px; }
.main-wrapper { width: 1200px; margin: 20px auto; flex: 1; }
.strict-grid { display: grid; width: 100%; gap: 20px; grid-template-columns: repeat(4, 1fr); justify-content: start; }
@media (max-width: 1220px) { .header-content, .main-wrapper { width: 100%; padding: 0 20px; box-sizing: border-box; } .strict-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); } }
.goods-card { width: 100%; height: 380px; border-radius: 8px; transition: transform 0.3s; display: flex; flex-direction: column; }
.goods-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
:deep(.el-card__body) { padding: 0; display: flex; flex-direction: column; height: 100%; width: 100%; }
.goods-img-box { width: 100%; height: 200px; flex-shrink: 0; overflow: hidden; background: #fff; display: flex; justify-content: center; align-items: center; border-bottom: 1px solid #f0f0f0; }
.goods-img { width: 100%; height: 100%; object-fit: cover; }
.goods-info { padding: 15px; flex: 1; display: flex; flex-direction: column; background: white; overflow: hidden; }
.goods-name { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #303133; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.goods-desc { color: #909399; font-size: 13px; margin: 0 0 15px 0; line-height: 1.5; height: 40px; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.goods-bottom { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
.price { color: #f56c6c; font-size: 18px; font-weight: bold; }
.pagination-container { margin-top: 30px; margin-bottom: 40px; display: flex; justify-content: center; }
</style>