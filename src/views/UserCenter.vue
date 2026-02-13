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
          </div>
          <el-menu :default-active="activeMenu" class="side-menu" @select="handleMenuSelect">
            <el-menu-item index="profile">
              <el-icon><User /></el-icon> 个人资料
            </el-menu-item>
            <el-menu-item index="address">
              <el-icon><Location /></el-icon> 收货地址
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon> 账号安全
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
                  <div style="margin-left: 20px; display: flex; flex-direction: column; gap: 10px;">
                    <el-button type="primary" size="small" @click="triggerUpload">上传本地图片</el-button>
                    <el-button link type="info" size="small" @click="showAvatarDialog = true">选择预设头像</el-button>
                  </div>
                  <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleFileChange" />
                </div>
              </el-form-item>
              <el-form-item label="账号"><el-input v-model="userInfo.username" disabled></el-input></el-form-item>
              <el-form-item label="昵称"><el-input v-model="userInfo.nickname" placeholder="请输入昵称"></el-input></el-form-item>
              <el-form-item label="手机号"><el-input v-model="userInfo.mobile" placeholder="请输入手机号"></el-input></el-form-item>
              <el-form-item><el-button type="primary" @click="handleUpdateProfile" :loading="loading">保存修改</el-button></el-form-item>
            </el-form>
          </div>

          <div v-if="activeMenu === 'address'" class="panel">
            <div class="panel-header">
              <h3 class="panel-title">收货地址管理</h3>
              <el-button type="primary" @click="openAddressDialog('add')">新增地址</el-button>
            </div>
            <el-empty v-if="addressList.length === 0" description="暂无收货地址"></el-empty>
            <div class="address-grid" v-else>
              <div v-for="item in addressList" :key="item.id" class="addr-card" :class="{ 'is-default-border': item.is_default }">
                <div class="addr-header">
                  <span class="addr-name">{{ item.name }}</span>
                  <span class="addr-mobile">{{ item.mobile }}</span>
                </div>
                <div class="addr-body">
                  {{ item.province }} {{ item.city }} {{ item.district }}<br>{{ item.detail_address }}
                </div>
                <div class="addr-footer">
                  <div>
                    <el-tag v-if="item.is_default" size="small" type="success" effect="dark">默认地址</el-tag>
                    <el-button v-else type="primary" link size="small" @click="handleSetDefault(item.id)">设为默认</el-button>
                  </div>
                  <div class="actions">
                    <el-button type="primary" link size="small" @click="openAddressDialog('edit', item)">编辑</el-button>
                    <el-button type="danger" link size="small" @click="handleDeleteAddress(item.id)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeMenu === 'security'" class="panel">
            <h3 class="panel-title">账号安全</h3>
            <div class="security-item">
              <div class="sec-info"><strong>登录密码</strong><p>建议定期更换密码以保障账号安全</p></div>
              <el-button type="primary" plain @click="showPwdDialog = true">修改密码</el-button>
            </div>
            <div class="logout-area"><el-button type="danger" plain @click="logout" style="width: 200px;">退出当前账号</el-button></div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddressDialog" :title="addressFormType === 'add' ? '新增收货地址' : '编辑收货地址'" width="550px">
      <el-form :model="addressForm" label-width="90px">
        <el-form-item label="收货人"><el-input v-model="addressForm.name"/></el-form-item>
        <el-form-item label="手机号"><el-input v-model="addressForm.mobile"/></el-form-item>
        <el-form-item label="所在地区">
          <div style="display: flex; gap: 10px;">
            <el-input v-model="addressForm.province" placeholder="省"/><el-input v-model="addressForm.city" placeholder="市"/><el-input v-model="addressForm.district" placeholder="区/县"/>
          </div>
        </el-form-item>
        <el-form-item label="详细地址"><el-input type="textarea" v-model="addressForm.detail_address"/></el-form-item>
        <el-form-item v-if="addressFormType === 'add'">
          <el-checkbox v-model="addressForm.is_default">设为默认收货地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAddress">保存地址</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAvatarDialog" title="选择系统预设头像" width="500px">
      <div class="avatar-grid">
        <img v-for="(img, index) in presetAvatars" :key="index" :src="img" class="avatar-option" :class="{ active: tempAvatar === img }" @click="tempAvatar = img">
      </div>
      <template #footer><el-button @click="showAvatarDialog = false">取消</el-button><el-button type="primary" @click="confirmAvatar">确定使用</el-button></template>
    </el-dialog>
    <el-dialog v-model="showPwdDialog" title="修改密码" width="400px">
      <el-form :model="pwdForm" label-width="80px">
        <el-form-item label="旧密码"><el-input v-model="pwdForm.old_password" type="password" show-password/></el-form-item>
        <el-form-item label="新密码"><el-input v-model="pwdForm.new_password" type="password" show-password/></el-form-item>
      </el-form>
      <template #footer><el-button @click="showPwdDialog = false">取消</el-button><el-button type="primary" @click="handleUpdatePwd">提交修改</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Location, Lock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request' 
import { getAddressList, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api/address'

const router = useRouter()
const activeMenu = ref('profile')
const loading = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const fileInput = ref(null)

const userInfo = reactive({ id: 0, username: '', nickname: '', mobile: '', avatar: '' })
const presetAvatars = ['https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png','https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png','https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg','https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg']
const showAvatarDialog = ref(false)
const tempAvatar = ref('')

const addressList = ref([])
const showAddressDialog = ref(false)
const addressFormType = ref('add')
const addressForm = reactive({ id: 0, name: '', mobile: '', province: '', city: '', district: '', detail_address: '', is_default: false })

const showPwdDialog = ref(false)
const pwdForm = reactive({ old_password: '', new_password: '' })

const loadUserProfile = async () => {
  const res = await request.get('/user/info')
  if (res.code === 200) Object.assign(userInfo, res.data)
}

const loadAddresses = async () => {
  const res = await getAddressList()
  if (res.code === 200) addressList.value = res.data.addresses || []
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'address') loadAddresses()
}

// 🔥 新增：设为默认逻辑
const handleSetDefault = async (id) => {
  try {
    const res = await setDefaultAddress(id)
    if (res.code === 200) {
      ElMessage.success('已设为默认地址')
      loadAddresses()
    }
  } catch (e) { ElMessage.error('操作失败') }
}

const triggerUpload = () => fileInput.value.click()
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => { userInfo.avatar = reader.result; ElMessage.success('预览图已加载') }
}

const handleUpdateProfile = async () => {
  loading.value = true
  try {
    const res = await request.post('/user/update', { nickname: userInfo.nickname, mobile: userInfo.mobile, avatar: userInfo.avatar })
    if (res.code === 200) ElMessage.success('个人资料已更新')
  } finally { loading.value = false }
}

const confirmAvatar = () => { if (tempAvatar.value) { userInfo.avatar = tempAvatar.value; showAvatarDialog.value = false } }
const openAddressDialog = (type, row) => {
  addressFormType.value = type
  showAddressDialog.value = true
  if (type === 'add') Object.assign(addressForm, { id:0, name:'', mobile:'', province:'', city:'', district:'', detail_address:'', is_default: false })
  else Object.assign(addressForm, row)
}

const handleUpdatePwd = async () => {
  const res = await request.post('/user/password', pwdForm)
  if (res.code === 200) { ElMessage.success('修改成功，请重新登录'); logout() }
}

const handleSubmitAddress = async () => {
  const api = addressFormType.value === 'add' ? createAddress : updateAddress
  const res = await api(addressForm)
  if (res.code === 200) { ElMessage.success('地址已保存'); showAddressDialog.value = false; loadAddresses() }
}

const handleDeleteAddress = async (id) => {
  await ElMessageBox.confirm('确定删除吗？')
  const res = await deleteAddress(id)
  if (res.code === 200) { ElMessage.success('已删除'); loadAddresses() }
}

const logout = () => { localStorage.clear(); router.push('/login') }
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
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-title { margin: 0; font-size: 18px; color: #303133; border-left: 4px solid #409EFF; padding-left: 12px; }
.avatar-edit { display: flex; align-items: center; }
.avatar-grid { display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; }
.avatar-option { width: 80px; height: 80px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: 0.3s; }
.avatar-option:hover { transform: scale(1.1); }
.avatar-option.active { border-color: #409EFF; box-shadow: 0 0 10px rgba(64,158,255,0.5); }
.address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px;}
.addr-card { border: 1px solid #ebeef5; border-radius: 8px; padding: 20px; position: relative; background: #fafafa; transition: all 0.3s;}
.addr-card:hover { border-color: #409EFF; background: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.is-default-border { border: 2px solid #67c23a !important; background: #f0f9eb !important; }
.addr-header { font-weight: bold; margin-bottom: 12px; display: flex; justify-content: space-between; }
.addr-body { color: #606266; font-size: 14px; line-height: 1.6; min-height: 45px; }
.addr-footer { margin-top: 15px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 15px; }
.security-item { display: flex; justify-content: space-between; align-items: center; padding: 25px 0; border-bottom: 1px solid #f0f0f0; }
.sec-info strong { display: block; font-size: 16px; margin-bottom: 5px; }
.sec-info p { margin: 0; font-size: 13px; color: #909399; }
.logout-area { margin-top: 60px; text-align: center; }
</style>