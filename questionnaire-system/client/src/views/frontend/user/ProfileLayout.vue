<template>
  <div class="profile-layout">
    <div class="profile-container">
      <!-- 左侧导航栏 -->
      <div class="profile-sidebar">
        <div class="user-info-mini">
          <div class="avatar-wrapper" @click="handleAvatarClick">
            <el-avatar :size="60" :src="userAvatar">
              {{ userStore.userName?.charAt(0) }}
            </el-avatar>
            <div class="avatar-overlay">
              <el-icon><Camera /></el-icon>
              <span>更换头像</span>
            </div>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleAvatarUpload"
          />
          <div class="user-details">
            <h3>{{ userStore.userName || '用户' }}</h3>
            <p>{{ userStore.profile?.email || '暂无邮箱' }}</p>
            <el-tag :type="userStore.isAdmin ? 'danger' : 'primary'" size="small">
              {{ userStore.isAdmin ? "管理员" : "普通用户" }}
            </el-tag>
          </div>
        </div>

        <el-menu
          :default-active="activeMenu"
          class="profile-menu"
          @select="handleMenuSelect"
          router
        >
          <el-menu-item index="/profile/info">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
          
          <el-menu-item index="/profile/collections">
            <el-icon><Star /></el-icon>
            <span>收藏管理</span>
          </el-menu-item>

          <el-sub-menu index="questionnaires">
            <template #title>
              <el-icon><Files /></el-icon>
              <span>问卷状态</span>
            </template>
            <el-menu-item index="/profile/questionnaires/answered">
              <el-icon><Check /></el-icon>
              <span>已填写</span>
            </el-menu-item>
            <el-menu-item index="/profile/questionnaires/created">
              <el-icon><Edit /></el-icon>
              <span>我创建的</span>
            </el-menu-item>
            <el-menu-item index="/profile/questionnaires/pending">
              <el-icon><Clock /></el-icon>
              <span>待审核</span>
            </el-menu-item>
            <el-menu-item index="/profile/questionnaires/published">
              <el-icon><Promotion /></el-icon>
              <span>已发布</span>
            </el-menu-item>
            <el-menu-item index="/profile/questionnaires/trash">
              <el-icon><Delete /></el-icon>
              <span>回收站</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/profile/achievements">
            <el-icon><Trophy /></el-icon>
            <span>个人成就</span>
          </el-menu-item>

          <el-menu-item index="/profile/reports">
            <el-icon><DataAnalysis /></el-icon>
            <span>分析报告</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧内容区域 -->
      <div class="profile-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { 
  User, 
  Star, 
  Document, 
  Files,
  Check,
  Edit,
  Clock,
  Promotion,
  Delete,
  Trophy,
  DataAnalysis,
  Camera
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

import { useUserStore } from "@/store/user";
import { updateProfileApi } from "@/api/user";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const avatarInput = ref(null);

// 计算属性
const userAvatar = computed(() => {
  // 优先使用用户上传的头像
  if (userStore.profile?.avatar) {
    return userStore.profile.avatar;
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=${userStore.userName || 'User'}`;
});

const activeMenu = computed(() => {
  return route.path;
});

// 方法
const handleAvatarClick = () => {
  avatarInput.value?.click();
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件');
    return;
  }

  // 验证文件大小（限制为 2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB');
    return;
  }

  try {
    // 将图片转换为 Base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Avatar = e.target.result;
      
      // 更新用户头像到后端
      const currentProfile = userStore.profile;
      if (!currentProfile) {
        ElMessage.error('用户未登录');
        return;
      }

      await updateProfileApi(currentProfile.id, {
        ...currentProfile,
        avatar: base64Avatar,
        updatedAt: new Date().toISOString()
      });

      // 更新 store
      userStore.setProfile({
        ...currentProfile,
        avatar: base64Avatar
      });

      ElMessage.success('头像更新成功');
    };
    
    reader.onerror = () => {
      ElMessage.error('图片读取失败');
    };
    
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('上传头像失败:', error);
    ElMessage.error('头像上传失败，请重试');
  }

  // 清空 input，允许重复选择同一文件
  event.target.value = '';
};

const handleMenuSelect = (index) => {
  router.push(index);
};

const goToHome = () => {
  // 根据用户角色智能导航
  if (userStore.isAdmin) {
    router.push("/admin/dashboard");
  } else {
    router.push("/home");
  }
};

// 生命周期
onMounted(() => {
  // 初始化用户数据
});
</script>

<style scoped lang="scss">
.profile-layout {
  min-height: 100vh;
  background: var(--theme-background-color);
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }

  &.loading {
    pointer-events: none;

    .profile-sidebar,
    .profile-content {
      opacity: 0.7;
      animation: pulse 1.5s ease-in-out infinite;
    }
  }
}

.profile-container {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
  min-height: calc(100vh - 20px);

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 16px;
  }
}

/* 左侧边栏样式 */
.profile-sidebar {
  width: 320px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out;
  
  // 粘性定位，粘在导航栏底部
  position: sticky;
  top: 84px; // 导航栏高度64px + 20px间距
  align-self: flex-start;
  max-height: calc(100vh - 104px); // 视口高度 - top值 - 底部间距
  overflow-y: auto;

  @media (max-width: 1024px) {
    width: 100%;
    position: static;
    max-height: none;
  }

  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(102, 126, 234, 0.5);
    }
  }

  .user-info-mini {
    padding: 32px 24px;
    background: #25923457;
    color: white;
    text-align: center;

    @media (max-width: 1024px) {
      display: flex;
      align-items: center;
      text-align: left;
      padding: 20px 24px;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }

    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 16px;
      cursor: pointer;

      @media (max-width: 1024px) {
        margin-bottom: 0;
        margin-right: 16px;
      }

      @media (max-width: 768px) {
        margin-right: 0;
        margin-bottom: 12px;
      }

      .el-avatar {
        border: 4px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
      }

      .avatar-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.3s ease;
        color: white;
        font-size: 12px;

        .el-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }
      }

      &:hover .avatar-overlay {
        opacity: 1;
      }

      &:hover .el-avatar {
        transform: scale(1.05);
      }
    }

    .user-details {
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      p {
        margin: 0 0 12px 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .el-tag {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;

        &.el-tag--danger {
          background: rgba(245, 101, 101, 0.2);
          border-color: rgba(245, 101, 101, 0.3);
          color: #f56565;
        }

        &.el-tag--primary {
          background: rgba(66, 153, 225, 0.2);
          border-color: rgba(66, 153, 225, 0.3);
          color: #4299e1;
        }
      }
    }
  }

  .profile-menu {
    border: none;
    background: transparent;

    @media (max-width: 1024px) {
      display: flex;
      overflow-x: auto;
      padding: 0 12px 12px;
    }

    .el-menu-item {
      height: 56px;
      line-height: 56px;
      margin: 10px 12px;
      border-radius: 12px;
      margin-bottom: 4px;
      transition: all 0.3s ease;
      color: #4a5568;
      font-weight: 500;

      @media (max-width: 1024px) {
        white-space: nowrap;
        margin-right: 8px;
      }

      &:hover {
        background: #25923457;
        color: white;
        transform: translateX(4px);
      }

      &.is-active {
        background: #25923457;
        color: white;
        box-shadow: 0 4px 12px rgba(65, 128, 79, 0.3);
      }

      .el-icon {
        margin-right: 12px;
        font-size: 18px;
      }
    }

    .el-sub-menu {
      .el-sub-menu__title {
        height: 56px;
        line-height: 56px;
        margin: 0 12px;
        border-radius: 12px;
        margin-bottom: 4px;
        transition: all 0.3s ease;
        color: #4a5568;
        font-weight: 500;

        @media (max-width: 1024px) {
          white-space: nowrap;
          margin-right: 8px;
        }

        &:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
      }

      &.is-active .el-sub-menu__title {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .el-menu {
        background: #f8fafc;
        margin: 8px 12px;
        border-radius: 8px;
        padding: 8px 0;

        .el-menu-item {
          height: 44px;
          line-height: 44px;
          margin: 0 8px;
          font-size: 14px;
        }
      }
    }
  }
}

/* 右侧内容区域 */
.profile-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 32px;
  overflow: hidden;
  scroll-behavior: smooth;
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 20px;
  }

  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(102, 126, 234, 0.5);
    }
  }
}

/* 动画效果 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.9;
  }
}
</style>

