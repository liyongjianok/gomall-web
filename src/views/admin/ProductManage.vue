<template>
  <div class="product-manage">
    <el-card shadow="never">
      <template #header>
        <div class="header-content">
          <div class="title-group">
            <el-icon><Goods /></el-icon>
            <span>寿光蔬菜库存动态管理</span>
          </div>
          <div class="action-btns">
            <el-button type="warning" plain @click="showBatchDialog = true">市场行情批量调价</el-button>
            <el-button type="primary" @click="fetchData">刷新数据</el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" class="search-bar">
        <el-form-item label="蔬菜名称">
          <el-input v-model="searchText" placeholder="搜索品名..." clearable @clear="fetchData" />
        </el-form-item>
        <el-form-item label="蔬菜分类">
          <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 150px">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>
        <el-tag type="info" class="count-tag">当前筛选: {{ filteredList.length }} 种</el-tag>
      </el-form>

      <el-table :data="filteredList" v-loading="loading" border stripe height="580px">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="蔬菜图片" width="100" align="center">
          <template #default="scope">
            <el-image :src="scope.row.picture" class="table-img" :preview-src-list="[scope.row.picture]" preview-teleported />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="品名" width="160" sortable />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="scope">
            <el-tag size="small" effect="plain">{{ scope.row.category || '未分类' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="当前单价" width="120" sortable>
          <template #default="scope">
            <span class="price-text">￥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存量" width="120" sortable>
          <template #default="scope">
            <el-tag :type="scope.row.stock < 100 ? 'danger' : 'success'">
              {{ scope.row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="管理操作" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="editProduct(scope.row)">修改</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(scope.row)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="editVisible" title="精细库存与价格调整" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="蔬菜名">
          <el-input v-model="editForm.name" />
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

    <el-dialog v-model="showBatchDialog" title="📈 市场行情批量调节" width="420px">
      <el-alert title="警告：此操作将按比例修改指定分类下所有蔬菜的价格。" type="warning" show-icon :closable="false" />
      <el-form :model="batchForm" label-width="100px" style="margin-top: 20px">
        <el-form-item label="目标分类">
          <el-select v-model="batchForm.category" placeholder="选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>
        <el-form-item label="涨跌系数">
          <el-input-number v-model="batchForm.ratio" :precision="2" :step="0.05" :min="0.1" :max="2.0" />
          <div class="tip-text">1.1 表示涨价10%，0.9 表示降价10%</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchDialog = false">取消</el-button>
        <el-button type="warning" @click="handleBatchUpdate" :loading="batchLoading">执行调价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { Goods } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../utils/request'

const loading = ref(false)
const productList = ref([])
const categories = ['茄果类', '瓜果类', '根茎类', '叶菜类', '葱蒜类', '菌菇类', '水果类', '豆类', '其他']

// 搜索逻辑
const searchText = ref('')
const filterCategory = ref('')

// 编辑逻辑
const editVisible = ref(false)
const editForm = reactive({ id: 0, name: '', price: 0, stock: 0 })

// 批量调价逻辑
const showBatchDialog = ref(false)
const batchLoading = ref(false)
const batchForm = reactive({ category: '', ratio: 1.0 })

// ✅ 计算属性实现前端即时过滤
const filteredList = computed(() => {
  return productList.value.filter(item => {
    const matchName = item.name.toLowerCase().includes(searchText.value.toLowerCase())
    const matchCat = filterCategory.value ? item.category === filterCategory.value : true
    return matchName && matchCat
  })
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/products', { params: { page: 1, page_size: 100 } })
    if (res.code === 200) {
      productList.value = res.data.products || []
    }
  } catch (err) {
    ElMessage.error('获取商品列表失败')
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

const handleBatchUpdate = async () => {
  if (!batchForm.category) return ElMessage.warning('请选择分类')
  batchLoading.value = true
  try {
    const res = await request.post('/admin/product/batch-price', batchForm)
    if (res.code === 200) {
      ElMessage.success(`${batchForm.category} 调价成功`)
      showBatchDialog.value = false
      fetchData()
    }
  } finally { batchLoading.value = false }
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
.title-group { display: flex; align-items: center; gap: 8px; font-weight: bold; color: #166534; font-size: 18px; }
.search-bar { margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
.table-img { width: 50px; height: 50px; border-radius: 4px; cursor: zoom-in; }
.price-text { color: #f56c6c; font-weight: bold; }
.count-tag { margin-left: 10px; height: 32px; line-height: 30px; }
.tip-text { font-size: 12px; color: #999; margin-top: 5px; }
</style>