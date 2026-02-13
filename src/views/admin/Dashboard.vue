<template>
  <div class="dashboard-container" v-loading="loading">
    <el-row :gutter="15">
      <el-col :span="4" v-for="item in statsCards" :key="item.title" style="flex: 0 0 20%; max-width: 20%;">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <span class="title">{{ item.title }}</span>
            <el-icon :style="{ color: item.color }">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="stat-value">{{ item.prefix }}{{ item.displayValue }}</div>
          <div class="stat-footer">实时</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card header="支付额趋势 (最近7天)" shadow="never">
          <div ref="lineChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="蔬菜库存占比" shadow="never">
          <div ref="pieChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, markRaw } from 'vue'
import * as echarts from 'echarts'
import { Money, Wallet, User, ShoppingCart, Goods } from '@element-plus/icons-vue'
import { getDashboardData } from '../../api/admin'

const loading = ref(false)
const lineChartRef = ref(null)
const pieChartRef = ref(null)
let lineChart = null
let pieChart = null
let timer = null

// 5 个卡片定义
const statsCards = ref([
  { title: '总流水 (GMV)', displayValue: '0', prefix: '￥', icon: markRaw(Money), color: '#909399', key: 'total_sales' },
  { title: '实际成交额', displayValue: '0', prefix: '￥', icon: markRaw(Wallet), color: '#f56c6c', key: 'actual_sales' },
  { title: '注册用户', displayValue: '0', prefix: '', icon: markRaw(User), color: '#409eff', key: 'user_count' },
  { title: '累计订单', displayValue: '0', prefix: '', icon: markRaw(ShoppingCart), color: '#67c23a', key: 'order_count' },
  { title: '在售蔬菜', displayValue: '0', prefix: '', icon: markRaw(Goods), color: '#e6a23c', key: 'product_count' }
])

const loadData = async () => {
  try {
    const res = await getDashboardData()
    if (res.code === 200) {
      const data = res.data
      
      // 更新 5 个卡片
      statsCards.value[0].displayValue = data.total_sales?.toFixed(2) || '0.00'
      statsCards.value[1].displayValue = data.actual_sales?.toFixed(2) || '0.00'
      statsCards.value[2].displayValue = data.user_count || '0'
      statsCards.value[3].displayValue = data.order_count || '0'
      statsCards.value[4].displayValue = data.product_count || '0'

      // 更新折线图
      if (data.sales_trend) {
        lineChart.setOption({
          xAxis: { data: data.sales_trend.map(i => i.date) },
          series: [{ data: data.sales_trend.map(i => i.amount) }]
        })
      }
      // 更新饼图
      if (data.category_stats) {
        pieChart.setOption({
          series: [{ data: data.category_stats }]
        })
      }
    }
  } catch (err) {
    console.error('加载失败', err)
  }
}

const initCharts = () => {
  lineChart = echarts.init(lineChartRef.value)
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', boundaryGap: false, data: [] },
    yAxis: { type: 'value' },
    series: [{ name: '成交额', type: 'line', smooth: true, itemStyle: { color: '#f56c6c' }, areaStyle: { opacity: 0.1 }, data: [] }]
  })

  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0', left: 'center', itemWidth: 10, itemHeight: 10 },
    series: [{ type: 'pie', radius: ['40%', '70%'], itemStyle: { borderRadius: 8 }, data: [] }]
  })
}

onMounted(async () => {
  await nextTick()
  initCharts()
  loadData()
  timer = setInterval(loadData, 10000) // 10秒刷一次，感受实时变动
  window.addEventListener('resize', () => { lineChart?.resize(); pieChart?.resize() })
})

onUnmounted(() => {
  if(timer) clearInterval(timer)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.dashboard-container { padding: 5px; }
.stat-card { border: none; border-radius: 12px; height: 110px; }
.stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.stat-header .title { font-size: 13px; color: #909399; }
.stat-value { font-size: 20px; font-weight: bold; color: #303133; }
.stat-footer { font-size: 12px; color: #c0c4cc; margin-top: 8px; }
.chart-row { margin-top: 20px; }
.chart-box { height: 380px; width: 100%; }
</style>