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
                {{ editMode ? "取消编辑" : "编辑资料" }}
              </el-button>
            </div>
          </template>

          <!-- 头像部分 -->
          <div class="avatar-section-inline">
            <div class="avatar-container">
              <el-avatar
                :size="80"
                :src="profileForm.avatar"
                class="profile-avatar"
              >
                {{
                  profileForm.nickname?.charAt(0) ||
                  profileForm.username?.charAt(0)
                }}
              </el-avatar>
              <div class="avatar-info">
                <h3>{{ profileForm.nickname || profileForm.username }}</h3>
                <p class="role-badge">
                  <el-tag
                    :type="profileForm.role === 'admin' ? 'danger' : 'primary'"
                  >
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
              <el-button type="text" @click="passwordDialogVisible = true">
                <el-icon><Lock /></el-icon>
                修改密码
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
                  <el-input
                    v-model="profileForm.nickname"
                    placeholder="请输入昵称"
                  >
                    <template #prepend>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="profileForm.email"
                    placeholder="请输入邮箱地址"
                  >
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
                  <el-input
                    v-model="profileForm.phone"
                    placeholder="请输入手机号"
                  >
                    <template #prepend>
                      <el-icon><Phone /></el-icon>
                    </template>
                  </el-input>
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
        <el-card class="activity-card" shadow="never" style="margin-top: 24px">
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

    <!-- 修改密码对话框 -->
    <ChangePasswordDialog
      v-model="passwordDialogVisible"
      @success="handlePasswordChanged"
    />

    <!-- 更换头像对话框 -->
    <ChangeAvatarDialog
      v-model="avatarDialogVisible"
      @success="handleAvatarChanged"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
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
  Lock,
} from "@element-plus/icons-vue";
import {
  getAdminProfileApi,
  updateAdminProfileApi,
  getAdminActivitiesApi,
  recordAdminActivity,
} from "@/api/admin";
import { useUserStore } from "@/store/user";
import ChangePasswordDialog from "@/components/ChangePasswordDialog.vue";
import ChangeAvatarDialog from "@/components/ChangeAvatarDialog.vue";

// 响应式数据
const userStore = useUserStore();
const editMode = ref(false);
const saving = ref(false);
const passwordDialogVisible = ref(false);
const avatarDialogVisible = ref(false);

const profileFormRef = ref();

// 表单数据
const profileForm = reactive({
  id: null,
  username: "",
  nickname: "",
  email: "",
  phone: "",
  bio: "",
  avatar: "",
  role: "",
  createdAt: "",
});

// 最近活动
const recentActivities = ref([]);

// 验证规则
const profileRules = {
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "昵称长度在 2 到 20 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
};

// 方法
const getRoleText = (role) => {
  const roleMap = {
    admin: "系统管理员",
    user: "普通用户",
    moderator: "版主",
  };
  return roleMap[role] || "未知角色";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("zh-CN");
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return "刚刚";
  }
};

const saveProfile = async () => {
  try {
    await profileFormRef.value.validate();
    saving.value = true;

    const result = await updateAdminProfileApi(profileForm);

    // 记录操作
    await recordAdminActivity({
      adminId: profileForm.id,
      adminName: profileForm.nickname || profileForm.username,
      title: "更新个人资料",
      description: "修改了个人资料信息",
      type: "profile_update",
    });

    ElMessage.success(result.message || "个人资料更新成功");
    editMode.value = false;

    // 重新加载活动记录
    await loadActivitiesData();
  } catch (error) {
    ElMessage.error(error.message || "保存失败，请检查输入信息");
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  profileFormRef.value.resetFields();
};

const changeAvatar = () => {
  avatarDialogVisible.value = true;
};

// 密码修改成功回调
const handlePasswordChanged = async () => {
  console.log("密码修改成功");
  await loadActivitiesData();
};

// 头像修改成功回调
const handleAvatarChanged = async () => {
  console.log("头像修改成功");
  // 重新加载个人资料
  await loadProfileData();
  await loadActivitiesData();
};

// 加载数据的方法
const loadProfileData = async () => {
  try {
    const profile = await getAdminProfileApi();
    // 更新表单数据
    Object.assign(profileForm, profile);
  } catch (error) {
    console.error("加载个人资料失败:", error);
  }
};

const loadActivitiesData = async () => {
  try {
    // 获取当前用户ID，优先使用 profileForm.id，其次使用 userStore
    const userId = profileForm.id || userStore.profile?.id;
    if (!userId) {
      console.warn("无法获取用户ID，跳过加载活动记录");
      return;
    }

    // 只加载当前管理员的活动记录，传入字符串类型的ID
    const result = await getAdminActivitiesApi(10, String(userId));
    recentActivities.value = result.list || [];
    console.log("加载的活动记录:", result);
  } catch (error) {
    console.error("加载活动数据失败:", error);
  }
};

onMounted(async () => {
  // 并行加载所有数据
  await Promise.all([loadProfileData(), loadActivitiesData()]);
});
</script>

<style lang="scss" scoped>
.admin-profile-page {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;

  /* 页面头部 */
  .page-header {
    margin-bottom: 24px;
  }

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

  .avatar-actions {
    margin-top: 12px;
  }

  .profile-info {
    text-align: center;
    padding-top: 20px;

    h3 {
      margin: 0 0 8px 0;
      color: #1a202c;
      font-size: 20px;
    }
  }

  .role-badge {
    margin: 8px 0;
  }

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

    .role-badge {
      margin: 8px 0;
    }

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
  .activity-content {
    padding-left: 8px;
  }

  .activity-title {
    font-weight: 500;
    color: #1a202c;
    margin-bottom: 4px;
  }

  .activity-desc {
    font-size: 12px;
    color: #666;
  }

  /* 表单样式 */
  .input-tip {
    font-size: 12px;
    color: #999;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    padding: 16px;
  }
}
</style>
