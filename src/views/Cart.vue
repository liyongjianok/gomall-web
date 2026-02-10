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
        <div class="page-header">
          <h2>我的购物车</h2>
        </div>
  
        <el-card class="cart-card" shadow="never" v-loading="loading">
          <el-empty v-if="cartList.length === 0" description="购物车还是空的，快去选购吧！">
            <el-button type="primary" @click="$router.push('/products')">去逛逛</el-button>
          </el-empty>
  
          <div v-else>
            <el-table :data="cartList" style="width: 100%" size="large">
              <el-table-column label="商品信息" width="400">
                <template #default="scope">
                  <div class="product-info">
                    <el-image 
                      src="https://placehold.co/100x100?text=Product" 
                      class="p-img" 
                    />
                    <span class="p-name">商品 ID: {{ scope.row.sku_id }}</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="单价" align="center">
                <template #default="scope">
                  <span>--</span>
                </template>
              </el-table-column>
  
              <el-table-column label="数量" align="center">
                <template #default="scope">
                  <el-tag>{{ scope.row.quantity }}</el-tag>
                </template>
              </el-table-column>
  
              <el-table-column label="操作" align="center">
                <template #default>
                  <el-button type="danger" link disabled>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
  
            <div class="cart-footer">
              <div class="total-box">
                <span>共 <span class="num">{{ cartList.length }}</span> 件商品</span>
              </div>
              <el-button type="primary" size="large" class="checkout-btn" @click="openCheckout">
                去结算
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
  
      <el-dialog v-model="checkoutVisible" title="确认订单" width="500px">
        <div class="checkout-content">
          <p class="section-title">请选择收货地址：</p>
          
          <div v-if="addressList.length > 0">
            <el-radio-group v-model="selectedAddressId" class="address-group">
              <el-radio 
                v-for="addr in addressList" 
                :key="addr.id" 
                :label="addr.id" 
                border
                class="address-item"
              >
                <div class="addr-text">
                  <span class="name">{{ addr.name }}</span>
                  <span class="mobile">{{ addr.mobile }}</span>
                  <br/>
                  <span class="detail">{{ addr.province }} {{ addr.city }} {{ addr.detail_address }}</span>
                </div>
              </el-radio>
            </el-radio-group>
          </div>
          
          <el-empty v-else description="暂无地址，请先添加" :image-size="80">
            <el-button type="primary" size="small" @click="handleAddAddressMock">一键添加测试地址</el-button>
          </el-empty>
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
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { getCartList } from '../api/cart'
  import { getAddressList, addAddress } from '../api/address'
  import { createOrder } from '../api/order'
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  const router = useRouter()
  const loading = ref(false)
  const cartList = ref([])
  const checkoutVisible = ref(false)
  const addressList = ref([])
  const selectedAddressId = ref(null)
  const orderLoading = ref(false)
  
  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }
  
  // 加载购物车
  const loadCart = async () => {
    loading.value = true
    try {
      const res = await getCartList()
      // 注意：后端返回的结构是 { items: [...] } 还是直接 [...]
      // 根据 proto 定义，GetCartResponse 包含 items
      if (res.data && res.data.items) {
        cartList.value = res.data.items
      } else {
        cartList.value = []
      }
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
  
  // 打开结算弹窗
  const openCheckout = async () => {
    checkoutVisible.value = true
    // 加载地址列表
    try {
      const res = await getAddressList()
      if (res.data && res.data.address) {
        addressList.value = res.data.address
        // 默认选中第一个
        if (addressList.value.length > 0) {
          selectedAddressId.value = addressList.value[0].id
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  
  // 一键添加测试地址 (方便测试)
  const handleAddAddressMock = async () => {
    try {
      await addAddress({
        name: "测试用户",
        mobile: "13800138000",
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
        detail_address: "科技园 88 号"
      })
      ElMessage.success("地址添加成功")
      openCheckout() // 重新加载列表
    } catch (error) {
      console.error(error)
    }
  }
  
  // 提交订单
  const handleCreateOrder = async () => {
    if (!selectedAddressId.value) return
    
    orderLoading.value = true
    try {
      const res = await createOrder({
        address_id: selectedAddressId.value
      })
      if (res.code === 200) {
        // 下单成功
        ElMessageBox.alert(`下单成功！订单号：${res.data.order_no}`, '成功', {
          confirmButtonText: '去支付',
          callback: () => {
            // TODO: 跳转到支付页面或订单列表
            router.push('/products') // 暂时回首页，后续改为订单页
          }
        })
        checkoutVisible.value = false
      }
    } catch (error) {
      console.error(error)
    } finally {
      orderLoading.value = false
    }
  }
  
  onMounted(() => {
    loadCart()
  })
  </script>
  
  <style scoped>
  .page-container {
    min-height: 100vh;
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
  }
  .sticky-header {
    position: sticky; top: 0; z-index: 999;
    background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 0 20px;
  }
  .header-content {
    width: 1200px; margin: 0 auto; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .logo { margin: 0; font-size: 20px; color: #409EFF; font-weight: bold; }
  
  .main-content {
    width: 1200px; margin: 20px auto; padding: 0 20px; box-sizing: border-box;
  }
  
  .page-header { margin-bottom: 20px; }
  
  .cart-card { min-height: 400px; border-radius: 8px; }
  
  .product-info { display: flex; align-items: center; gap: 15px; }
  .p-img { width: 60px; height: 60px; border-radius: 4px; background: #f0f0f0; }
  .p-name { font-size: 14px; color: #333; font-weight: bold; }
  
  .cart-footer {
    margin-top: 30px;
    border-top: 1px solid #eee;
    padding-top: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
  }
  .total-box { font-size: 16px; color: #666; }
  .num { color: #f56c6c; font-weight: bold; font-size: 20px; margin: 0 4px; }
  .checkout-btn { width: 150px; font-size: 18px; }
  
  /* 地址选择样式 */
  .address-group { width: 100%; display: flex; flex-direction: column; gap: 10px; }
  .address-item { width: 100%; height: auto; padding: 10px; margin-left: 0 !important; }
  .addr-text { line-height: 1.6; }
  .name { font-weight: bold; font-size: 16px; margin-right: 10px; }
  .mobile { color: #666; }
  .detail { display: block; font-size: 12px; color: #999; margin-top: 4px; }
  </style>