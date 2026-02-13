<template>
    <el-card shadow="never">
      <template #header>
        <div style="display: flex; justify-content: space-between">
          <span>蔬菜库存管理</span>
          <el-button type="primary" size="small">新增蔬菜</el-button>
        </div>
      </template>
  
      <el-table :data="productList" border stripe v-loading="loading">
        <el-table-column prop="id" label="商品ID" width="80" />
        <el-table-column prop="name" label="蔬菜名称" />
        <el-table-column label="价格 (元)">
          <template #default="scope">
            <el-input-number v-model="scope.row.price" :precision="2" :step="0.1" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="当前库存">
          <template #default="scope">
            <el-input-number v-model="scope.row.stock" :min="0" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="success" size="small" @click="handleUpdate(scope.row)">保存修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getAdminProductList, updateAdminProduct } from '../../api/admin'
  import { ElMessage } from 'element-plus'
  
  const loading = ref(false)
  const productList = ref([])
  
  const fetchProducts = async () => {
    loading.value = true
    try {
      const res = await getAdminProductList({ page: 1, page_size: 50 })
      if (res.code === 200) productList.value = res.data.products
    } finally { loading.value = false }
  }
  
  const handleUpdate = async (row) => {
    const res = await updateAdminProduct({ id: row.id, price: row.price, stock: row.stock })
    if (res.code === 200) ElMessage.success(`${row.name} 更新成功`)
  }
  
  onMounted(() => fetchProducts())
  </script>