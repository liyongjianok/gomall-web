<template>
  <div class="product-manage">
    <el-card shadow="never">
      <template #header>
        <div class="header-content">
          <div class="title-group">
            <el-icon><Goods /></el-icon>
            <span>寿光蔬菜库存动态管理</span>
          </div>
          <el-button type="primary" @click="handleBatchPrice">批量调价 (应对市场波动)</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="query" class="search-bar">
        <el-form-item label="蔬菜名称">
          <el-input v-model="query.name" placeholder="请输入关键词" />
        </el-form-item>
        <el-button type="primary" @click="fetchData">查询</el-button>
      </el-form>

      <el-table :data="productList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="蔬菜图片" width="120" align="center">
          <template #default="scope">
            <el-image :src="scope.row.picture" class="table-img" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="品名" width="180" />
        <el-table-column prop="price" label="当前单价" width="120">
          <template #default="scope">
            <span class="price-text">￥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存量" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.stock < 50 ? 'danger' : 'success'">
              {{ scope.row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="editProduct(scope.row)">修改价格/库存</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(scope.row)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="editVisible" title="编辑蔬菜信息" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="蔬菜名">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="editForm.price" :precision="2" :step="0.1" />
        </el-form-item>
        <el-form-item label="库存量">
          <el-input-number v-model="editForm.stock" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存更改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { Goods } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../utils/request'

const loading = ref(false)
const productList = ref([])
const editVisible = ref(false)
const query = reactive({ name: '' })
const editForm = reactive({ id: 0, name: '', price: 0, stock: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/products', { params: { page: 1, page_size: 100 } })
    if (res.code === 200) productList.value = res.data.products
  } finally {
    loading.value = false
  }
}

const editProduct = (row) => {
  Object.assign(editForm, row)
  editVisible.value = true
}

const submitEdit = async () => {
  const res = await request.post('/admin/product/update', editForm)
  if (res.code === 200) {
    ElMessage.success('更新成功')
    editVisible.value = false
    fetchData()
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定要下架 ${row.name} 吗？`, '提示', { type: 'warning' })
  const res = await request.post('/admin/product/delete', { id: row.id })
  if (res.code === 200) {
    ElMessage.success('已下架')
    fetchData()
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.header-content { display: flex; justify-content: space-between; align-items: center; }
.title-group { display: flex; align-items: center; gap: 8px; font-weight: bold; color: #166534; }
.search-bar { margin-bottom: 20px; }
.table-img { width: 50px; height: 50px; border-radius: 4px; }
.price-text { color: #f56c6c; font-weight: bold; }
</style>