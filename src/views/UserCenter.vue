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
            <div class="brief-name">{{ userInfo.nickname || userInfo.username }}</div>
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
                  
                  <input 
                    type="file" 
                    ref="fileInput" 
                    style="display: none" 
                    accept="image/*"
                    @change="handleFileChange"
                  />
                </div>
              </el-form-item>

              <el-form-item label="账号">
                <el-input v-model="userInfo.username" disabled></el-input>
              </el-form-item>

              <el-form-item label="昵称">
                <el-input v-model="userInfo.nickname" placeholder="请输入昵称"></el-input>
              </el-form-item>

              <el-form-item label="手机号">
                <el-input v-model="userInfo.mobile" placeholder="请输入手机号"></el-input>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleUpdateProfile" :loading="loading">保存修改</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-if="activeMenu === 'address'" class="panel">
            <div class="panel-header">
              <h3 class="panel-title">收货地址管理</h3>
              <el-button type="primary" @click="openAddressDialog('add')">新增地址</el-button>
            </div>

            <el-empty v-if="addressList.length === 0" description="暂无收货地址"></el-empty>

            <div class="address-grid" v-else>
              <div v-for="item in addressList" :key="item.id" class="addr-card">
                <div class="addr-header">
                  <span class="addr-name">{{ item.name }}</span>
                  <span class="addr-mobile">{{ item.mobile }}</span>
                </div>
                <div class="addr-body">
                  {{ item.province }} {{ item.city }} {{ item.district }}
                  <br>
                  {{ item.detail_address }}
                </div>
                <div class="addr-footer">
                  <el-tag v-if="item.is_default" size="small" type="success">默认</el-tag>
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
              <span>登录密码</span>
              <el-button type="primary" link @click="showPwdDialog = true">修改密码</el-button>
            </div>
            <div class="logout-area">
              <el-button type="danger" plain @click="logout" style="width: 200px;">退出登录</el-button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <el-dialog v-model="showAvatarDialog" title="选择头像" width="500px">
      <div class="avatar-grid">
        <img 
          v-for="(img, index) in presetAvatars" 
          :key="index" 
          :src="img" 
          class="avatar-option" 
          :class="{ active: tempAvatar === img }"
          @click="tempAvatar = img"
        >
      </div>
      <div style="margin-top: 20px;">
        <el-input v-model="tempAvatar" placeholder="或者输入网络图片地址"></el-input>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAvatarDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAvatar">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="showPwdDialog" title="修改密码" width="400px">
      <el-form :model="pwdForm" label-width="80px">
        <el-form-item label="旧密码">
          <el-input v-model="pwdForm.old_password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="pwdForm.new_password" type="password" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPwdDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePwd">确认修改</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAddressDialog" :title="addressFormType === 'add' ? '新增地址' : '编辑地址'" width="500px">
      <el-form :model="addressForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addressForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="省份">
          <el-input v-model="addressForm.province" placeholder="如：山东省"></el-input>
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="addressForm.city" placeholder="如：潍坊市"></el-input>
        </el-form-item>
        <el-form-item label="区县">
          <el-input v-model="addressForm.district" placeholder="如：寿光市"></el-input>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input type="textarea" v-model="addressForm.detail_address"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddressDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitAddress">保存</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Location, Lock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request' 
import { getAddressList, createAddress, updateAddress, deleteAddress } from '../api/address'

const router = useRouter()
const activeMenu = ref('profile')
const loading = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const fileInput = ref(null)

// 用户信息
const userInfo = reactive({
  id: 0,
  username: '',
  nickname: '',
  mobile: '',
  avatar: ''
})

// 头像相关
const showAvatarDialog = ref(false)
const tempAvatar = ref('')
const presetAvatars = [
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
  'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
]

// 地址相关
const addressList = ref([])
const showAddressDialog = ref(false)
const addressFormType = ref('add')
const addressForm = reactive({
  id: 0,
  name: '',
  mobile: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  is_default: false
})

const showPwdDialog = ref(false)
const pwdForm = reactive({
  old_password: '',
  new_password: ''
})

// 加载用户信息
const loadUserProfile = async () => {
  const res = await request.get('/user/info')
  if (res.code === 200) {
    Object.assign(userInfo, res.data)
  }
}

// 加载地址列表
const loadAddresses = async () => {
  const res = await getAddressList()
  if (res.code === 200 && res.data && res.data.addresses) {
    addressList.value = res.data.addresses
  } else {
    addressList.value = []
  }
}

// 菜单切换
const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'address') {
    loadAddresses()
  }
}

// 触发文件上传
const triggerUpload = () => {
  fileInput.value.click()
}

// 处理文件选择 (转 Base64)
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 限制 2MB
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 2MB')
    return
  }

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    userInfo.avatar = reader.result // 预览并赋值
    ElMessage.success('图片读取成功，请点击“保存修改”')
  }
  reader.onerror = () => {
    ElMessage.error('图片读取失败')
  }
}

// 更新个人资料
const handleUpdateProfile = async () => {
  loading.value = true
  try {
    const res = await request.post('/user/update', {
      nickname: userInfo.nickname,
      mobile: userInfo.mobile,
      avatar: userInfo.avatar
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } finally {
    loading.value = false
  }
}

// 确认头像选择 (预设)
const confirmAvatar = () => {
  if (tempAvatar.value) {
    userInfo.avatar = tempAvatar.value
    showAvatarDialog.value = false
  }
}

// 打开地址弹窗
const openAddressDialog = (type, row) => {
  addressFormType.value = type
  showAddressDialog.value = true
  if (type === 'add') {
    Object.assign(addressForm, { id:0, name:'', mobile:'', province:'', city:'', district:'', detail_address:'' })
  } else {
    Object.assign(addressForm, row)
  }
}

// 修改密码
const handleUpdatePwd = async () => {
  if (!pwdForm.old_password || !pwdForm.new_password) {
    return ElMessage.warning('请输入密码')
  }
  try {
    const res = await request.post('/user/password', pwdForm)
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      logout() // 强制下线
    } else {
      ElMessage.error(res.msg || '修改失败')
    }
  } catch (e) {
    ElMessage.error('服务异常')
  }
}

// 提交地址
const handleSubmitAddress = async () => {
  try {
    const api = addressFormType.value === 'add' ? createAddress : updateAddress
    const payload = {
      name: addressForm.name,
      mobile: addressForm.mobile,
      province: addressForm.province,
      city: addressForm.city,
      district: addressForm.district,
      detail_address: addressForm.detail_address
    }
    if (addressFormType.value === 'edit') payload.id = addressForm.id

    const res = await api(payload)
    if (res.code === 200) {
      ElMessage.success('操作成功')
      showAddressDialog.value = false
      loadAddresses()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch(e) {
    ElMessage.error('服务异常')
  }
}

// 删除地址
const handleDeleteAddress = async (id) => {
  await ElMessageBox.confirm('确定删除该地址吗？', '提示', { type: 'warning' })
  const res = await deleteAddress(id)
  if (res.code === 200) {
    ElMessage.success('删除成功')
    loadAddresses()
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  router.push('/login')
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.page-container { min-height: 100vh; background: #f5f7fa; }
.header-wrapper { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.header-content { width: 1200px; margin: 0 auto; height: 60px; display: flex; align-items: center; justify-content: space-between; }
.logo { color: #409EFF; cursor: pointer; }

.main-wrapper { width: 1200px; margin: 30px auto; }
.layout-container { display: flex; gap: 20px; }

/* 侧边栏 */
.sidebar { width: 240px; background: #fff; border-radius: 8px; padding: 20px 0; min-height: 500px; }
.user-brief { text-align: center; padding: 20px; border-bottom: 1px solid #f0f0f0; margin-bottom: 10px; }
.brief-name { margin-top: 10px; font-weight: bold; color: #303133; }
.side-menu { border-right: none; }

/* 内容区 */
.content-area { flex: 1; background: #fff; border-radius: 8px; padding: 30px; min-height: 500px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-title { margin: 0; font-size: 20px; color: #303133; border-left: 4px solid #409EFF; padding-left: 10px; }

/* 头像编辑 */
.avatar-edit { display: flex; align-items: center; }

/* 头像选择 */
.avatar-grid { display: flex; gap: 15px; flex-wrap: wrap; }
.avatar-option { width: 80px; height: 80px; border-radius: 4px; cursor: pointer; border: 2px solid transparent; object-fit: cover; }
.avatar-option:hover { border-color: #a0cfff; }
.avatar-option.active { border-color: #409EFF; }

/* 地址卡片 */
.address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.addr-card { border: 1px solid #eee; border-radius: 4px; padding: 15px; position: relative; transition: all 0.3s; }
.addr-card:hover { border-color: #409EFF; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.addr-header { font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between; }
.addr-body { color: #666; font-size: 14px; line-height: 1.5; height: 50px; }
.addr-footer { margin-top: 10px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #eee; padding-top: 10px; }

/* 安全设置 */
.security-item { display: flex; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid #eee; }
.logout-area { margin-top: 50px; text-align: center; }
</style>