<template>
  <div class="page-container">
    <div class="header-wrapper">
      <div class="header-content">
        <h2 class="logo" @click="$router.push('/products')" style="cursor: pointer">Go Mall</h2>
        <div class="header-actions">
           <el-button link @click="$router.push('/products')">返回商城首页</el-button>
        </div>
      </div>
    </div>

    <div class="main-wrapper">
      <div class="layout-container">
        <div class="sidebar">
          <div class="user-brief">
            <el-avatar :size="60" :src="userInfo.avatar || defaultAvatar"></el-avatar>
            <div class="brief-name">{{ userInfo.nickname || userInfo.username || '新用户' }}</div>
            <el-tag v-if="userInfo.role === 'admin'" size="small" type="danger" style="margin-top: 5px;">系统管理员</el-tag>
          </div>
          <el-menu :default-active="activeMenu" class="side-menu" @select="handleMenuSelect">
            <el-menu-item index="profile"><el-icon><User /></el-icon> 个人资料</el-menu-item>
            <el-menu-item index="address"><el-icon><Location /></el-icon> 收货地址</el-menu-item>
            <el-menu-item index="security"><el-icon><Lock /></el-icon> 账号安全</el-menu-item>
            <el-menu-item v-if="userInfo.role === 'admin'" index="admin" @click="$router.push('/admin')">
              <el-icon><Monitor /></el-icon>
              <span style="color: #F56C6C; font-weight: bold;">管理后台系统</span>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="content-area">
          <div v-if="activeMenu === 'profile'" class="panel">
            <h3 class="panel-title">个人资料</h3>
            <el-form :model="userInfo" label-width="100px" style="max-width: 500px; margin-top: 30px;">
              <el-form-item label="头像">
                <div class="avatar-edit">
                  <el-avatar :size="80" :src="userInfo.avatar || defaultAvatar"></el-avatar>
                  <div style="margin-left: 20px;">
                    <el-button type="primary" size="small" @click="triggerUpload">上传本地图片</el-button>
                  </div>
                  <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleFileChange" />
                </div>
              </el-form-item>
              <el-form-item label="账号"><el-input v-model="userInfo.username" disabled></el-input></el-form-item>
              <el-form-item label="身份"><el-tag :type="userInfo.role === 'admin' ? 'danger' : 'success'">{{ userInfo.role === 'admin' ? '管理员' : '普通会员' }}</el-tag></el-form-item>
              <el-form-item label="昵称"><el-input v-model="userInfo.nickname"></el-input></el-form-item>
              <el-form-item label="手机号"><el-input v-model="userInfo.mobile"></el-input></el-form-item>
              <el-form-item><el-button type="primary" @click="handleUpdateProfile" :loading="loading">保存修改</el-button></el-form-item>
            </el-form>
          </div>

          <div v-if="activeMenu === 'address'" class="panel">
            <div class="panel-header">
              <h3 class="panel-title">收货地址管理</h3>
              <el-button type="primary" size="small" @click="openAddressDialog('add')">新增地址</el-button>
            </div>
            <el-empty v-if="addressList.length === 0" description="暂无收货地址" />
            <div class="address-grid" v-else>
              <div v-for="item in addressList" :key="item.id" class="addr-card" :class="{ 'is-default': item.is_default }">
                <div class="addr-header">
                  <strong>{{ item.name }}</strong>
                  <span class="mobile">{{ item.mobile }}</span>
                </div>
                <div class="addr-body">
                  {{ item.province }} {{ item.city }} {{ item.district }}<br>
                  {{ item.detail_address }}
                </div>
                <div class="addr-footer">
                  <div>
                    <el-tag v-if="item.is_default" size="small" type="success" effect="dark">默认</el-tag>
                    <el-button v-else type="primary" link size="small" @click="handleSetDefault(item.id)">设为默认</el-button>
                  </div>
                  <div class="ops">
                    <el-button link type="primary" size="small" @click="openAddressDialog('edit', item)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="handleDeleteAddress(item.id)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeMenu === 'security'" class="panel">
            <h3 class="panel-title">账号安全</h3>
            <div class="security-item">
              <div class="sec-info"><strong>登录密码</strong><p>建议定期更换密码以保障账号安全</p></div>
              <el-button type="primary" plain size="small" @click="showPwdDialog = true">修改密码</el-button>
            </div>
            <div style="margin-top: 50px; text-align: center;">
              <el-button type="danger" plain @click="logout" style="width: 200px;">退出当前账号</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddressDialog" :title="addressFormType === 'add' ? '新增地址' : '编辑地址'" width="500px">
      <el-form :model="addressForm" label-width="80px">
        <el-form-item label="收货人"><el-input v-model="addressForm.name" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="addressForm.mobile" /></el-form-item>
        <el-form-item label="地区">
          <div style="display:flex; gap:5px;">
            <el-input v-model="addressForm.province" placeholder="省" />
            <el-input v-model="addressForm.city" placeholder="市" />
            <el-input v-model="addressForm.district" placeholder="区" />
          </div>
        </el-form-item>
        <el-form-item label="详细地址"><el-input type="textarea" v-model="addressForm.detail_address" /></el-form-item>
        <el-form-item v-if="addressFormType === 'add'">
          <el-checkbox v-model="addressForm.is_default">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAddress" :loading="submitting">确认保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPwdDialog" title="修改登录密码" width="400px">
      <el-form :model="pwdForm" label-width="80px">
        <el-form-item label="旧密码"><el-input v-model="pwdForm.old_password" type="password" show-password/></el-form-item>
        <el-form-item label="新密码"><el-input v-model="pwdForm.new_password" type="password" show-password/></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPwdDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePwd">提交修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Location, Lock, Monitor } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request' 
import { getAddressList, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api/address'

const router = useRouter()
const activeMenu = ref('profile')
const loading = ref(false)
const submitting = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const fileInput = ref(null)

const userInfo = reactive({ id: 0, username: '', nickname: '', mobile: '', avatar: '', role: '' })
const addressList = ref([])

// 地址表单逻辑
const showAddressDialog = ref(false)
const addressFormType = ref('add')
const addressForm = reactive({ id: 0, name: '', mobile: '', province: '', city: '', district: '', detail_address: '', is_default: false })

// 密码逻辑
const showPwdDialog = ref(false)
const pwdForm = reactive({ old_password: '', new_password: '' })

// 1. 初始化加载
const loadUserProfile = async () => {
  try {
    const res = await request.get('/user/info')
    if (res.code === 200) {
      Object.assign(userInfo, res.data)
      if (res.data.role) {
        localStorage.setItem('role', res.data.role)
      } else {
        // 如果后端没给，就用本地现有的，防止被 undefined 冲掉
        userInfo.role = localStorage.getItem('role') || 'user'
      }
    }
  } catch (err) { ElMessage.error('无法获取用户信息') }
}

const fetchAddresses = async () => {
  const res = await getAddressList()
  if (res.code === 200) addressList.value = res.data.addresses || []
}

// 2. 菜单切换逻辑
const handleMenuSelect = (index) => {
  if (index === 'admin') return
  activeMenu.value = index
  if (index === 'address') fetchAddresses()
}

// 3. 地址操作函数 (🔥 补齐缺失逻辑)
const openAddressDialog = (type, row = null) => {
  addressFormType.value = type
  showAddressDialog.value = true
  if (type === 'add') {
    Object.assign(addressForm, { id: 0, name: '', mobile: '', province: '', city: '', district: '', detail_address: '', is_default: false })
  } else {
    Object.assign(addressForm, row)
  }
}

const handleSubmitAddress = async () => {
  submitting.value = true
  try {
    const api = addressFormType.value === 'add' ? createAddress : updateAddress
    const res = await api(addressForm)
    if (res.code === 200) {
      ElMessage.success('地址保存成功')
      showAddressDialog.value = false
      fetchAddresses()
    }
  } finally { submitting.value = false }
}

const handleSetDefault = async (id) => {
  const res = await setDefaultAddress(id)
  if (res.code === 200) {
    ElMessage.success('已设为默认')
    fetchAddresses()
  }
}

const handleDeleteAddress = async (id) => {
  await ElMessageBox.confirm('确定要删除该收货地址吗？', '提示', { type: 'warning' })
  const res = await deleteAddress(id)
  if (res.code === 200) {
    ElMessage.success('删除成功')
    fetchAddresses()
  }
}

// 4. 资料与头像
const triggerUpload = () => fileInput.value?.click()
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => { userInfo.avatar = reader.result }
}

const handleUpdateProfile = async () => {
  loading.value = true
  try {
    const res = await request.post('/user/update', { 
      nickname: userInfo.nickname, 
      mobile: userInfo.mobile, 
      avatar: userInfo.avatar 
    })
    if (res.code === 200) ElMessage.success('更新成功')
  } finally { loading.value = false }
}

// 5. 密码与退出
const handleUpdatePwd = async () => {
  const res = await request.post('/user/password', pwdForm)
  if (res.code === 200) {
    ElMessage.success('修改成功，请重新登录')
    logout()
  }
}

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => loadUserProfile())
</script>

<style scoped>
.page-container { min-height: 100vh; background: #f5f7fa; }
.header-wrapper { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.header-content { width: 1200px; margin: 0 auto; height: 60px; display: flex; align-items: center; justify-content: space-between; }
.logo { color: #409EFF; font-weight: bold; }
.main-wrapper { width: 1200px; margin: 30px auto; }
.layout-container { display: flex; gap: 20px; }
.sidebar { width: 240px; background: #fff; border-radius: 8px; padding: 20px 0; min-height: 500px; }
.user-brief { text-align: center; padding: 20px; border-bottom: 1px solid #f0f0f0; margin-bottom: 10px; }
.brief-name { margin-top: 10px; font-weight: bold; color: #303133; }
.side-menu { border-right: none; }
.content-area { flex: 1; background: #fff; border-radius: 8px; padding: 30px; min-height: 500px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.panel-title { margin: 0; font-size: 18px; color: #303133; border-left: 4px solid #409EFF; padding-left: 12px; }
.avatar-edit { display: flex; align-items: center; }
.address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.addr-card { border: 1px solid #eee; padding: 15px; border-radius: 8px; background: #fafafa; position: relative; transition: all 0.3s; }
.addr-card:hover { border-color: #409EFF; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.is-default { border-color: #67C23A; background: #f0f9eb; }
.addr-header { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #f0f0f0; padding-bottom: 5px; }
.addr-body { color: #666; font-size: 14px; line-height: 1.6; min-height: 45px; }
.addr-footer { margin-top: 15px; display: flex; justify-content: space-between; align-items: center; }
.security-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid #f9f9f9; }
.sec-info strong { display: block; margin-bottom: 5px; }
.sec-info p { margin: 0; color: #999; font-size: 13px; }
</style>