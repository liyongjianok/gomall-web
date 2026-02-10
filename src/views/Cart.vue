<template>
    <div class="page-container">
      <div class="sticky-header">
        <div class="header-content">
          <h2 class="logo" @click="$router.push('/products')" style="cursor: pointer">Go Mall</h2>
          <div class="user-info">
            <el-button type="info" link @click="logout">退出</el-button>
          </div>
        </div>
      </div>
  
      <div class="main-content">
        <div class="top-bar">
          <el-button @click="$router.push('/products')" icon="ArrowLeft" size="large" class="back-btn">
            继续购物
          </el-button>
        </div>
  
        <div class="page-title">
          <h3>我的购物车</h3>
        </div>
  
        <el-card class="cart-card" shadow="never" v-loading="loading">
          <el-empty v-if="cartList.length === 0 && !loading" description="购物车空空如也">
            <el-button type="primary" @click="$router.push('/products')">去逛逛</el-button>
          </el-empty>
  
          <div v-else>
            <el-table 
              :data="cartList" 
              style="width: 100%" 
              size="large"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" />
  
              <el-table-column label="商品信息" min-width="400">
                <template #default="scope">
                  <div class="product-info">
                    <el-image 
                      :src="(scope.row.picture && scope.row.picture.startsWith('http')) ? scope.row.picture : 'https://placehold.co/100x100?text=Product'" 
                      class="p-img" 
                    />
                    <div class="p-text">
                      <div class="p-name">{{ scope.row.name || '加载中...' }}</div>
                      <div class="p-id">SKU ID: {{ scope.row.sku_id }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="单价" width="150" align="center">
                <template #default="scope">
                  <span class="price">¥ {{ scope.row.price || '--' }}</span>
                </template>
              </el-table-column>
  
              <el-table-column label="数量" width="180" align="center">
                <template #default="scope">
                  <el-input-number 
                    v-model="scope.row.quantity" 
                    :min="1" 
                    :max="99" 
                    size="small"
                  />
                </template>
              </el-table-column>
  
              <el-table-column label="小计" width="150" align="center">
                <template #default="scope">
                  <span class="subtotal" v-if="scope.row.price">
                    ¥ {{ (scope.row.price * scope.row.quantity).toFixed(2) }}
                  </span>
                  <span v-else>--</span>
                </template>
              </el-table-column>
  
              <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                  <el-button 
                    type="danger" 
                    link 
                    icon="Delete"
                    @click="handleDelete(scope.row.sku_id)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
  
            <div class="cart-footer">
              <div class="total-box">
                <span>已选 <span class="num">{{ selectedItems.length }}</span> 件商品</span>
                <span class="total-label">合计：</span>
                <span class="total-price">¥ {{ totalPrice }}</span>
              </div>
              <el-button 
                type="primary" 
                size="large" 
                class="checkout-btn" 
                @click="openCheckout"
                :disabled="selectedItems.length === 0"
              >
                去结算
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
  
      <el-dialog v-model="checkoutVisible" title="确认订单" width="700px" destroy-on-close>
        <div class="checkout-content">
          <div class="section-header">
            <span class="title">收货人信息</span>
            <el-button link type="primary" size="small" @click="handleAddAddressMock">
              + 新增测试地址
            </el-button>
          </div>
          
          <div class="address-container" v-loading="addrLoading">
            <el-empty v-if="!addressList || addressList.length === 0" description="暂无地址，请点击右上角新增" :image-size="60" />
            
            <div v-else class="address-grid">
              <div 
                v-for="addr in addressList" 
                :key="addr.id" 
                class="address-card"
                :class="{ active: selectedAddressId === addr.id }"
                @click="selectedAddressId = addr.id"
              >
                <div class="card-top">
                  <span class="name">{{ addr.name }}</span>
                  <span class="mobile">{{ addr.mobile }}</span>
                </div>
                <div class="card-bottom">
                  {{ addr.province }} {{ addr.city }} {{ addr.district }} <br/>
                  {{ addr.detail_address }}
                </div>
                <div class="check-mark" v-if="selectedAddressId === addr.id">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="checkoutVisible = false">取消</el-button>
            <el-button type="primary" @click="handleCreateOrder" :loading="orderLoading" :disabled="!selectedAddressId">
              立即下单
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  // 🔥 确保你的 api/cart.js 里导出了 deleteCartItem
  import { getCartList, deleteCartItem } from '../api/cart' 
  import { getProductDetail } from '../api/product' 
  import { getAddressList, addAddress } from '../api/address'
  import { createOrder } from '../api/order'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowLeft, Check, Delete } from '@element-plus/icons-vue' 
  
  const router = useRouter()
  const loading = ref(false)
  const addrLoading = ref(false)
  const orderLoading = ref(false)
  const cartList = ref([])
  const selectedItems = ref([])
  
  const checkoutVisible = ref(false)
  const addressList = ref([])
  const selectedAddressId = ref(null)
  
  const totalPrice = computed(() => {
    let sum = 0
    selectedItems.value.forEach(item => {
      if (item.price) {
        sum += item.price * item.quantity
      }
    })
    return sum.toFixed(2)
  })
  
  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }
  
  const handleSelectionChange = (val) => {
    selectedItems.value = val
  }
  
  const loadCart = async () => {
    loading.value = true
    try {
      const res = await getCartList()
      let rawItems = []
      if (res.data && res.data.items) rawItems = res.data.items
      else if (res.data && res.data.Items) rawItems = res.data.Items
      
      if (rawItems.length === 0) {
        cartList.value = []
        loading.value = false
        return
      }
  
      const promises = rawItems.map(async (item) => {
        try {
          const pRes = await getProductDetail(item.sku_id)
          if (pRes.data) {
            return {
              ...item,
              name: pRes.data.name,
              picture: pRes.data.picture,
              price: pRes.data.price
            }
          }
        } catch (e) { console.error(e) }
        return item
      })
      cartList.value = await Promise.all(promises)
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
  
  // 🔥 删除逻辑 🔥
  const handleDelete = (skuId) => {
    ElMessageBox.confirm(
      '确定要移除该商品吗?',
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    ).then(async () => {
      try {
        await deleteCartItem({ sku_id: skuId })
        ElMessage.success('已移除')
        loadCart() // 刷新列表
      } catch (error) {
        console.error(error)
        ElMessage.error('删除失败')
      }
    })
  }
  
  const loadAddresses = async () => {
    addrLoading.value = true
    try {
      const res = await getAddressList()
      let list = []
      if (res.data) {
        if (Array.isArray(res.data)) list = res.data
        else if (res.data.address) list = res.data.address
        else if (res.data.addresses) list = res.data.addresses
      }
      addressList.value = list
      
      const currentStillExists = list.find(a => a.id === selectedAddressId.value)
      if ((!selectedAddressId.value || !currentStillExists) && list.length > 0) {
        selectedAddressId.value = list[0].id
      }
    } catch (error) {
      console.error("加载地址失败", error)
    } finally {
      addrLoading.value = false
    }
  }
  
  const openCheckout = () => {
    if (selectedItems.value.length === 0) {
      ElMessage.warning("请先勾选需要结算的商品")
      return
    }
    checkoutVisible.value = true
    loadAddresses()
  }
  
  const handleAddAddressMock = async () => {
    try {
      const randomNum = Math.floor(Math.random() * 1000)
      await addAddress({
        name: `用户${randomNum}`,
        mobile: "13800138000",
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
        detail_address: `科技园 ${randomNum} 号`
      })
      ElMessage.success("地址添加成功")
      await loadAddresses()
    } catch (error) {
      console.error(error)
    }
  }
  
  const handleCreateOrder = async () => {
    if (!selectedAddressId.value) return
    
    orderLoading.value = true
    try {
      const res = await createOrder({
        address_id: Number(selectedAddressId.value)
      })
      
      if (res.code === 200) {
        checkoutVisible.value = false
        ElMessageBox.alert(
          `订单号：${res.data.order_no}`, 
          '下单成功 🎉', 
          {
            confirmButtonText: '继续',
            callback: () => {
              loadCart() // 刷新
              selectedItems.value = [] 
            }
          }
        )
      } else {
         ElMessage.error(res.msg || '下单失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('服务异常')
    } finally {
      orderLoading.value = false
    }
  }
  
  onMounted(() => {
    loadCart()
  })
  </script>
  
  <style scoped>
  /* 保持之前的样式，Grid 布局对齐地址 */
  .page-container { min-height: 100vh; background-color: #f5f7fa; display: flex; flex-direction: column; }
  .sticky-header { position: sticky; top: 0; z-index: 999; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 0 20px; }
  .header-content { width: 1200px; margin: 0 auto; height: 60px; display: flex; align-items: center; justify-content: space-between; }
  .logo { margin: 0; font-size: 20px; color: #409EFF; font-weight: bold; }
  .main-content { width: 1200px; margin: 20px auto; padding: 0 20px; box-sizing: border-box; flex: 1; }
  .top-bar { margin-bottom: 20px; display: flex; justify-content: flex-start; }
  .back-btn { background-color: white; border-color: #dcdfe6; color: #606266; }
  .back-btn:hover { border-color: #409EFF; color: #409EFF; background-color: #ecf5ff; }
  .page-title h3 { border-left: 4px solid #409EFF; padding-left: 10px; margin-bottom: 20px; color: #333; }
  .cart-card { min-height: 500px; border-radius: 8px; }
  .product-info { display: flex; align-items: center; gap: 15px; }
  .p-img { width: 80px; height: 80px; border-radius: 4px; border: 1px solid #eee; }
  .p-text { display: flex; flex-direction: column; justify-content: center; }
  .p-name { font-size: 15px; font-weight: bold; color: #333; margin-bottom: 5px; }
  .p-id { font-size: 12px; color: #999; }
  .price { color: #333; }
  .subtotal { color: #f56c6c; font-weight: bold; }
  .cart-footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; align-items: center; gap: 20px; }
  .total-box { font-size: 14px; color: #666; display: flex; align-items: baseline; }
  .num { color: #f56c6c; font-weight: bold; margin: 0 4px; font-size: 16px; }
  .total-label { margin-left: 20px; font-size: 16px; }
  .total-price { color: #f56c6c; font-size: 28px; font-weight: bold; }
  .checkout-btn { width: 160px; height: 50px; font-size: 18px; }
  .address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 10px; }
  .address-card { border: 1px solid #dcdfe6; border-radius: 4px; padding: 15px; cursor: pointer; position: relative; transition: all 0.2s; }
  .address-card:hover { border-color: #409EFF; }
  .address-card.active { border-color: #409EFF; background-color: #f0f9eb; box-shadow: 0 0 0 1px #409EFF inset; }
  .card-top { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px; font-size: 15px; }
  .card-bottom { font-size: 13px; color: #666; line-height: 1.5; }
  .check-mark { position: absolute; bottom: 0; right: 0; background: #409EFF; color: white; width: 20px; height: 20px; border-top-left-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
  .title { font-weight: bold; font-size: 16px; border-left: 3px solid #409EFF; padding-left: 8px; }
  </style>