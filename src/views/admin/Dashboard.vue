<template>
    <div class="dashboard-container">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in statsCards" :key="item.title">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-header">
              <span class="title">{{ item.title }}</span>
              <el-tag :type="item.tagType" size="small">{{ item.tag }}</el-tag>
            </div>
            <div class="stat-value">{{ item.prefix }}{{ item.value }}</div>
            <div class="stat-footer">较昨日 {{ item.trend }}%</div>
          </el-card>
        </el-col>
      </el-row>
  
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="16">
          <el-card header="销售趋势图 (最近7天)" shadow="never">
            <div style="height: 350px; display: flex; align-items: center; justify-content: center; background: #fafafa; color: #999;">
              📈 销售曲线图表占位
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card header="热销蔬菜排行" shadow="never">
            <el-table :data="hotProducts" size="small">
              <el-table-column type="index" label="排名" width="50" />
              <el-table-column prop="name" label="品名" />
              <el-table-column prop="sales" label="销量" width="80" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getStats } from '../../api/admin'
  
  const statsCards = ref([
    { title: '总销售额', value: '0.00', prefix: '￥', tag: '实时', tagType: 'danger', trend: '+12' },
    { title: '订单总量', value: '0', prefix: '', tag: '累计', tagType: 'success', trend: '+5' },
    { title: '注册用户', value: '0', prefix: '', tag: '用户', tagType: 'info', trend: '+2' },
    { title: '在售商品', value: '0', prefix: '', tag: '种类', tagType: 'warning', trend: '0' }
  ])
  
  const hotProducts = ref([
    { name: '寿光大葱', sales: 1250 },
    { name: '水果黄瓜', sales: 980 },
    { name: '红心萝卜', sales: 860 },
    { name: '精品西红柿', sales: 720 }
  ])
  
  const loadStats = async () => {
    const res = await getStats()
    if (res.code === 200) {
      statsCards.value[0].value = res.data.total_sales.toFixed(2)
      statsCards.value[1].value = res.data.order_count
      statsCards.value[2].value = res.data.user_count
      statsCards.value[3].value = res.data.product_count
    }
  }
  
  onMounted(() => loadStats())
  </script>
  
  <style scoped>
  .stat-card { border-radius: 8px; }
  .stat-header { display: flex; justify-content: space-between; align-items: center; color: #666; font-size: 14px; }
  .stat-value { font-size: 28px; font-weight: bold; margin: 15px 0; color: #303133; }
  .stat-footer { font-size: 12px; color: #999; }
  </style>