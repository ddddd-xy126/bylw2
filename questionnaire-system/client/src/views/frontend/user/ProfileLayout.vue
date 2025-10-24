<template>
  <div class="profile-layout">
    <div class="profile-container">
      <!-- 左侧导航栏 -->
      <div class="profile-sidebar">
        <div class="user-info-mini">
          <el-avatar :size="60" :src="userAvatar">
            {{ userStore.userName?.charAt(0) }}
          </el-avatar>
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
  DataAnalysis
} from "@element-plus/icons-vue";

import { useUserStore } from "@/store/user";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 计算属性
const userAvatar = computed(() => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${userStore.userName || 'User'}`;
});

const activeMenu = computed(() => {
  return route.path;
});

// 方法
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

<style scoped>
.profile-layout {
  min-height: 100vh;
  background: #80e6a265;
  padding: 20px;
}

.profile-container {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
  min-height: calc(100vh - 20px);
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
  /* height: fit-content;
  position: sticky;
  top: 30px; */
}

.user-info-mini {
  padding: 32px 24px;
  background: #25923457;
  color: white;
  text-align: center;
}

.user-info-mini .el-avatar {
  margin-bottom: 16px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.user-details h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.user-details p {
  margin: 0 0 12px 0;
  font-size: 14px;
  opacity: 0.9;
}

.user-details .el-tag {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

/* 菜单样式 */
.profile-menu {
  border: none;
  background: transparent;
}

.profile-menu .el-menu-item {
  height: 56px;
  line-height: 56px;
  margin: 10px 12px;
  border-radius: 12px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  color: #4a5568;
  font-weight: 500;
}

.profile-menu .el-menu-item:hover {
  background: #25923457;
  color: white;
  transform: translateX(4px);
}

.profile-menu .el-menu-item.is-active {
  background: #25923457;
  color: white;
  box-shadow: 0 4px 12px rgba(65, 128, 79, 0.3);
}

.profile-menu .el-sub-menu .el-sub-menu__title {
  height: 56px;
  line-height: 56px;
  margin: 0 12px;
  border-radius: 12px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  color: #4a5568;
  font-weight: 500;
}

.profile-menu .el-sub-menu .el-sub-menu__title:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.profile-menu .el-sub-menu.is-active .el-sub-menu__title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.profile-menu .el-sub-menu .el-menu {
  background: #f8fafc;
  margin: 8px 12px;
  border-radius: 8px;
  padding: 8px 0;
}

.profile-menu .el-sub-menu .el-menu-item {
  height: 44px;
  line-height: 44px;
  margin: 0 8px;
  font-size: 14px;
}

.profile-menu .el-menu-item .el-icon {
  margin-right: 12px;
  font-size: 18px;
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
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .profile-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .profile-sidebar {
    width: 100%;
    position: static;
  }
  
  .user-info-mini {
    display: flex;
    align-items: center;
    text-align: left;
    padding: 20px 24px;
  }
  
  .user-info-mini .el-avatar {
    margin-bottom: 0;
    margin-right: 16px;
  }
  
  .profile-menu {
    display: flex;
    overflow-x: auto;
    padding: 0 12px 12px;
  }
  
  .profile-menu .el-menu-item,
  .profile-menu .el-sub-menu {
    white-space: nowrap;
    margin-right: 8px;
  }
}

@media (max-width: 768px) {
  .profile-layout {
    padding: 12px;
  }
  
  .profile-content {
    padding: 20px;
  }
  
  .user-info-mini {
    flex-direction: column;
    text-align: center;
  }
  
  .user-info-mini .el-avatar {
    margin-right: 0;
    margin-bottom: 12px;
  }
}

/* 滚动条样式 */
.profile-sidebar::-webkit-scrollbar,
.profile-content::-webkit-scrollbar {
  width: 6px;
}

.profile-sidebar::-webkit-scrollbar-track,
.profile-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.profile-sidebar::-webkit-scrollbar-thumb,
.profile-content::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.profile-sidebar::-webkit-scrollbar-thumb:hover,
.profile-content::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* 动画效果 */
.profile-sidebar,
.profile-content {
  animation: slideInUp 0.6s ease-out;
}

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

/* 悬停效果 */
.profile-sidebar {
  transition: all 0.3s ease;
}

.profile-sidebar:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.profile-content {
  transition: all 0.3s ease;
}

.profile-content:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* 加载状态 */
.profile-layout.loading {
  pointer-events: none;
}

.profile-layout.loading .profile-sidebar,
.profile-layout.loading .profile-content {
  opacity: 0.7;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.9;
  }
}

/* 自定义标签样式 */
.user-details .el-tag.el-tag--danger {
  background: rgba(245, 101, 101, 0.2);
  border-color: rgba(245, 101, 101, 0.3);
  color: #f56565;
}

.user-details .el-tag.el-tag--primary {
  background: rgba(66, 153, 225, 0.2);
  border-color: rgba(66, 153, 225, 0.3);
  color: #4299e1;
}
</style>

