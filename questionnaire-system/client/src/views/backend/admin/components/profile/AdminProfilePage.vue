<template>
  <div class="admin-profile-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>个人资料</h1>
        <p>管理您的个人信息和账户设置</p>
      </div>
    </div>

    <!-- 个人资料卡片 -->
    <el-row :gutter="24">
      <!-- 基本信息 -->
      <el-col :span="24">
        <el-card class="profile-card" shadow="never">
          <template #header>
            <div class="card-header">
              <h3>基本信息</h3>
              <el-button type="primary" @click="editMode = !editMode">
                <el-icon><Edit /></el-icon>
                {{ editMode ? '取消编辑' : '编辑资料' }}
              </el-button>
            </div>
          </template>

          <!-- 头像部分 -->
          <div class="avatar-section-inline">
            <div class="avatar-container">
              <el-avatar :size="80" :src="profileForm.avatar" class="profile-avatar">
                {{ profileForm.nickname?.charAt(0) || profileForm.username?.charAt(0) }}
              </el-avatar>
              <div class="avatar-info">
                <h3>{{ profileForm.nickname || profileForm.username }}</h3>
                <p class="role-badge">
                  <el-tag :type="profileForm.role === 'admin' ? 'danger' : 'primary'">
                    {{ getRoleText(profileForm.role) }}
                  </el-tag>
                </p>
                <p class="join-date">
                  <el-icon><Calendar /></el-icon>
                  加入时间: {{ formatDate(profileForm.createdAt) }}
                </p>
              </div>
            </div>
            <div class="avatar-actions">
              <el-button type="text" @click="changeAvatar">
                <el-icon><Camera /></el-icon>
                更换头像
              </el-button>
            </div>
          </div>

          <el-divider />

          <el-form
            :model="profileForm"
            :rules="profileRules"
            ref="profileFormRef"
            label-width="100px"
            :disabled="!editMode"
          >
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="profileForm.username" disabled>
                    <template #append>
                      <span class="input-tip">用户名不可修改</span>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="角色" prop="role">
                  <el-input :value="getRoleText(profileForm.role)" disabled>
                    <template #prepend>
                      <el-icon><UserFilled /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="profileForm.nickname" placeholder="请输入昵称">
                    <template #prepend>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" placeholder="请输入邮箱地址">
                    <template #prepend>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="profileForm.phone" placeholder="请输入手机号">
                    <template #prepend>
                      <el-icon><Phone /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="部门" prop="department">
                  <el-select v-model="profileForm.department" placeholder="请选择部门">
                    <el-option label="技术部" value="tech" />
                    <el-option label="运营部" value="operations" />
                    <el-option label="产品部" value="product" />
                    <el-option label="市场部" value="marketing" />
                    <el-option label="人事部" value="hr" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="个人简介" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="介绍一下自己..."
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item v-if="editMode">
              <el-button type="primary" @click="saveProfile" :loading="saving">
                <el-icon><Check /></el-icon>
                保存修改
              </el-button>
              <el-button @click="resetForm">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="activity-card" shadow="never" style="margin-top: 24px;">
          <template #header>
            <h4>最近活动</h4>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="formatDateTime(activity.timestamp)"
              size="small"
            >
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>


    </el-row>

    <!-- 密码修改对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
      :destroy-on-close="true"
    >
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changePassword" :loading="changingPassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="avatarDialogVisible"
      title="更换头像"
      width="600px"
      :destroy-on-close="true"
    >
      <div class="avatar-upload-section">
        <div class="current-avatar">
          <h4>当前头像</h4>
          <el-avatar :size="80" :src="profileForm.avatar">
            {{ profileForm.nickname?.charAt(0) || profileForm.username?.charAt(0) }}
          </el-avatar>
        </div>

        <div class="upload-area">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="handleAvatarUpload"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择图片
            </el-button>
            <div class="upload-tip">
              支持 JPG、PNG 格式，建议尺寸 200x200px，大小不超过 2MB
            </div>
          </el-upload>
        </div>

        <div class="preset-avatars">
          <h4>选择预设头像</h4>
          <div class="avatars-grid">
            <div
              v-for="avatar in presetAvatars"
              :key="avatar.id"
              class="preset-avatar"
              :class="{ active: selectedAvatar === avatar.url }"
              @click="selectPresetAvatar(avatar.url)"
            >
              <el-avatar :size="60" :src="avatar.url" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="avatarDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAvatar" :loading="savingAvatar">
          保存头像
        </el-button>
      </template>
    </el-dialog>

    <!-- 快捷操作浮动按钮 -->
    <div class="floating-actions">
      <el-button circle type="primary" @click="passwordDialogVisible = true">
        <el-icon><Lock /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Edit,
  User,
  UserFilled,
  Message,
  Phone,
  Check,
  Refresh,
  Camera,
  Calendar,
  Document,
  Warning,
  Clock,
  Lock,
  Upload
} from '@element-plus/icons-vue'
import {
  getAdminProfileApi,
  updateAdminProfileApi,
  changeAdminPasswordApi,
  updateAdminAvatarApi,

  getAdminActivitiesApi
} from '@/api/admin'

// 响应式数据
const editMode = ref(false)
const saving = ref(false)
const passwordDialogVisible = ref(false)
const avatarDialogVisible = ref(false)
const changingPassword = ref(false)
const savingAvatar = ref(false)
const selectedAvatar = ref('')

const profileFormRef = ref()
const passwordFormRef = ref()

// 表单数据
const profileForm = reactive({
  id: 3,
  username: 'admin',
  nickname: '系统管理员',
  email: 'admin@example.com',
  phone: '13800000000',
  department: 'tech',
  bio: '负责系统维护和用户管理，确保平台稳定运行。',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=admin',
  role: 'admin',
  createdAt: '2024-01-01T08:00:00Z'
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})



// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '审核问卷',
    description: '审核通过了"用户满意度调查问卷"',
    timestamp: '2024-01-25T10:30:00Z'
  },
  {
    id: 2,
    title: '用户管理',
    description: '封禁了违规用户 "spam_user"',
    timestamp: '2024-01-25T09:15:00Z'
  },
  {
    id: 3,
    title: '系统维护',
    description: '更新了系统配置',
    timestamp: '2024-01-24T16:45:00Z'
  },
  {
    id: 4,
    title: '数据导出',
    description: '导出了用户数据报表',
    timestamp: '2024-01-24T14:20:00Z'
  }
])

// 预设头像
const presetAvatars = ref([
  { id: 1, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1' },
  { id: 2, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin2' },
  { id: 3, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin3' },
  { id: 4, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin4' },
  { id: 5, url: 'https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=3b82f6' },
  { id: 6, url: 'https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=10b981' },
  { id: 7, url: 'https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=f59e0b' },
  { id: 8, url: 'https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=ef4444' }
])

// 验证规则
const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const getRoleText = (role) => {
  const roleMap = {
    admin: '系统管理员',
    user: '普通用户',
    moderator: '版主'
  }
  return roleMap[role] || '未知角色'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

const saveProfile = async () => {
  try {
    await profileFormRef.value.validate()
    saving.value = true
    
    const result = await updateAdminProfileApi(profileForm)
    ElMessage.success(result.message || '个人资料更新成功')
    editMode.value = false
  } catch (error) {
    ElMessage.error(error.message || '保存失败，请检查输入信息')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  profileFormRef.value.resetFields()
}

const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    
    const result = await changeAdminPasswordApi(passwordForm)
    ElMessage.success(result.message || '密码修改成功')
    passwordDialogVisible.value = false
    
    // 重置表单
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    ElMessage.error(error.message || '密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

const changeAvatar = () => {
  selectedAvatar.value = profileForm.avatar
  avatarDialogVisible.value = true
}

const selectPresetAvatar = (url) => {
  selectedAvatar.value = url
}

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarUpload = ({ file }) => {
  // 这里应该上传到服务器，现在只是预览
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedAvatar.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const saveAvatar = async () => {
  if (!selectedAvatar.value) {
    ElMessage.warning('请选择头像')
    return
  }

  try {
    savingAvatar.value = true
    
    const result = await updateAdminAvatarApi({ avatar: selectedAvatar.value })
    profileForm.avatar = selectedAvatar.value
    ElMessage.success(result.message || '头像更新成功')
    avatarDialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message || '头像更新失败')
  } finally {
    savingAvatar.value = false
  }
}

// 加载数据的方法
const loadProfileData = async () => {
  try {
    const profile = await getAdminProfileApi()
    // 更新表单数据
    Object.assign(profileForm, profile)
  } catch (error) {
    console.error('加载个人资料失败:', error)
  }
}



const loadActivitiesData = async () => {
  try {
    const result = await getAdminActivitiesApi(4)
    recentActivities.value = result.list
  } catch (error) {
    console.error('加载活动数据失败:', error)
  }
}

onMounted(async () => {
  // 并行加载所有数据
  await Promise.all([
    loadProfileData(),
    loadActivitiesData()
  ])
})
</script>

<style lang="scss" scoped>
.admin-profile-page {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;

  /* 页面头部 */
  .page-header { margin-bottom: 24px; }

  .header-content {
    h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1a202c;
    }

    p {
      margin: 0;
      color: #718096;
      font-size: 16px;
    }
  }

  /* 卡片样式 */
  .profile-card,
  .avatar-card,
  .activity-card {
    margin-bottom: 24px;
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: #1a202c;
      font-size: 18px;
    }
  }

  /* 头像区域 */
  .avatar-section {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .profile-avatar {
    margin-bottom: 16px;
    border: 3px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .avatar-actions { margin-top: 12px; }

  .profile-info {
    text-align: center;
    padding-top: 20px;

    h3 {
      margin: 0 0 8px 0;
      color: #1a202c;
      font-size: 20px;
    }
  }

  .role-badge { margin: 8px 0; }

  .join-date {
    margin: 8px 0 0 0;
    color: #666;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  /* 内联头像区域 */
  .avatar-section-inline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
  }

  .avatar-container {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .avatar-info {
    h3 {
      margin: 0 0 8px 0;
      color: #1a202c;
      font-size: 20px;
    }

    .role-badge { margin: 8px 0; }

    .join-date {
      margin: 8px 0 0 0;
      color: #666;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: flex-start;
    }
  }

  /* 活动时间线 */
  .activity-content { padding-left: 8px; }

  .activity-title {
    font-weight: 500;
    color: #1a202c;
    margin-bottom: 4px;
  }

  .activity-desc { font-size: 12px; color: #666; }

  /* 表单样式 */
  .input-tip { font-size: 12px; color: #999; }

  /* 头像上传 */
  .avatar-upload-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .current-avatar { text-align: center;
    h4 { margin: 0 0 16px 0; color: #1a202c; }
  }

  .upload-area { text-align: center; }

  .upload-tip { margin-top: 8px; font-size: 12px; color: #666; }

  .preset-avatars {
    h4 { margin: 0 0 16px 0; color: #1a202c; }

    .avatars-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .preset-avatar {
      padding: 8px;
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover, &.active {
        border-color: var(--color-primary-light-3);
        background: rgba(64, 158, 255, 0.1);
      }
    }
  }

  /* 浮动按钮 */
  .floating-actions {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 1000;

    .el-button { box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3); }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    padding: 16px;

    .stats-grid { grid-template-columns: 1fr; }

    .avatars-grid { grid-template-columns: repeat(3, 1fr); }

    .floating-actions { right: 16px; bottom: 16px; }
  }
}
</style>