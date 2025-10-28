<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <!-- 系统标题 -->
      <div class="sidebar-header">
        <div class="logo">
          <el-icon size="24" color="#3498db"><Platform /></el-icon>
          <span>问卷系统</span>
        </div>
        <div class="admin-info">
          <el-avatar :size="32" :src="adminAvatar">
            {{ adminName.charAt(0) }}
          </el-avatar>
          <span class="admin-name">{{ adminName }}</span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
        router
        background-color="transparent"
        text-color="#ecf0f1"
        active-text-color="#3498db"
      >
        <!-- 仪表盘 -->
        <el-menu-item index="/admin/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>

        <!-- 问卷管理 -->
        <el-sub-menu index="questionnaire">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>问卷管理</span>
          </template>
          <el-menu-item index="/admin/questionnaires/list">
            <el-icon><List /></el-icon>
            <span>问卷列表</span>
          </el-menu-item>
          <el-menu-item index="/admin/questionnaires/pending">
            <el-icon><Clock /></el-icon>
            <span>待审核问卷</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 题目管理 -->
        <el-menu-item index="/admin/questions">
          <el-icon><EditPen /></el-icon>
          <span>题目管理</span>
        </el-menu-item>

        <!-- 人员管理 -->
        <el-menu-item index="/admin/users">
          <el-icon><UserFilled /></el-icon>
          <span>人员管理</span>
        </el-menu-item>

        <!-- 公告管理 -->
        <el-menu-item index="/admin/announcements">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
      </el-menu>
    </aside>
    <div class="main">
      <header class="topbar">
        <div class="breadcrumb-section">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">控制台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentPageTitle">{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="spacer" />
        <div class="topbar-actions">
          <el-badge :value="notificationCount" class="notification-badge" :hidden="!notificationCount">
            <el-button type="text" @click="showNotifications">
              <el-icon size="18"><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-dropdown @command="handleUserAction">
            <div class="user-dropdown">
              <el-avatar :size="32" :src="adminAvatar">
                {{ adminName.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ adminName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人资料
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <section class="content">
        <router-view />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Platform,
  Odometer,
  Document,
  List,
  Clock,
  EditPen,
  UserFilled,
  SwitchButton,
  Bell,
  ArrowDown,
  User
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 响应式数据
const adminName = ref('管理员')
const adminAvatar = computed(() => `https://api.dicebear.com/7.x/initials/svg?seed=${adminName.value}`)
const notificationCount = ref(3)

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 计算当前页面标题
const currentPageTitle = computed(() => {
  const pathTitleMap = {
    '/admin/dashboard': '仪表盘',
    '/admin/questionnaires/list': '问卷列表',
    '/admin/questionnaires/pending': '待审核问卷',
    '/admin/questions': '题目管理',
    '/admin/users': '人员管理',
    '/admin/announcements': '公告管理',
    '/admin/profile': '个人资料'
  }
  return pathTitleMap[route.path] || ''
})

// 方法
const handleMenuSelect = (index) => {
  router.push(index)
}

const handleUserAction = (command) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'logout':
      onLogout()
      break
  }
}

const showNotifications = () => {
  ElMessage.info('通知功能待实现')
  notificationCount.value = 0
}

const onLogout = () => {
  userStore.logout()
  router.replace('/admin/login')
}

onMounted(() => {
  // 初始化管理员信息
  adminName.value = userStore.userName || '管理员'
})
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  @media (max-width: 1024px) {
    width: 260px;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    flex-direction: row;
    padding: 0;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.05)"/><circle cx="75" cy="75" r="3" fill="rgba(255,255,255,0.03)"/><circle cx="90" cy="10" r="1" fill="rgba(255,255,255,0.08)"/></svg>');
    pointer-events: none;
  }

  /* 侧边栏头部 */
  &-header {
    padding: 24px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
      padding: 16px;
      border-bottom: none;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 700;
    color: #3498db;

    @media (max-width: 480px) {
      span {
        display: none;
      }
    }
  }

  .admin-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 4px;
      padding: 8px;
    }

    .admin-name {
      font-size: 14px;
      font-weight: 500;
      color: #ecf0f1;

      @media (max-width: 768px) {
        font-size: 12px;
      }
    }
  }

  /* 菜单样式 */
  &-menu {
    flex: 1;
    border: none;
    background: transparent;
    padding: 16px 0;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
      flex: 1;
      padding: 16px 0;
      display: flex;
      overflow-x: auto;
    }

    .el-menu-item {
      height: 50px;
      line-height: 50px;
      margin: 0 16px 8px;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: #ecf0f1;
      font-weight: 500;
      position: relative;
      overflow: hidden;
      animation: slideInLeft 0.3s ease-out;

      @media (max-width: 768px) {
        margin: 0 8px;
        white-space: nowrap;
        min-width: 120px;
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(52, 152, 219, 0.15) 0%, rgba(41, 128, 185, 0.15) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        background: rgba(52, 152, 219, 0.15);
        color: #3498db;
        transform: translateX(4px);
      }

      &:hover::before {
        opacity: 1;
      }

      &.is-active {
        background: linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(41, 128, 185, 0.2) 100%);
        color: #3498db;
        font-weight: 600;
        transform: translateX(4px);
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
      }

      &.is-active::after {
        content: '';
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: #3498db;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(52, 152, 219, 0.8);
      }
    }

    /* 子菜单样式 */
    .el-sub-menu {
      .el-sub-menu__title {
        height: 50px;
        line-height: 50px;
        margin: 0 16px 8px;
        border-radius: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: #ecf0f1;
        font-weight: 500;
        animation: slideInLeft 0.3s ease-out;

        @media (max-width: 768px) {
          margin: 0 8px;
          white-space: nowrap;
          min-width: 120px;
        }

        &:hover {
          background: rgba(52, 152, 219, 0.15);
          color: #3498db;
          transform: translateX(4px);
        }
      }

      &.is-active .el-sub-menu__title {
        color: #3498db;
        background: rgba(52, 152, 219, 0.15);
      }

      .el-menu {
        background: rgba(0, 0, 0, 0.1);
        margin: 8px 16px;
        border-radius: 8px;
        padding: 8px 0;

        .el-menu-item {
          height: 44px;
          line-height: 44px;
          margin: 0 8px 4px;
          font-size: 14px;
          padding-left: 32px;
        }
      }
    }
  }

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(52, 152, 219, 0.5);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(52, 152, 219, 0.8);
  }
}

/* 主要内容区域 */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--text-inverse)ff;
}

/* 顶部栏样式 */
.topbar {
  display: flex;
  align-items: center;
  padding: 16px 32px;
  background: var(--text-inverse)ff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  .breadcrumb-section {
    display: flex;
    align-items: center;

    .el-breadcrumb {
      font-size: 14px;
    }
  }

  .spacer {
    flex: 1;
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 768px) {
      gap: 8px;
    }

    @media (max-width: 480px) {
      gap: 8px;
    }

    .notification-badge {
      cursor: pointer;
    }

    .user-dropdown {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9fa;

      @media (max-width: 768px) {
        .user-name {
          display: none;
        }
      }

      &:hover {
        background: #e9ecef;
        transform: translateY(-1px);
      }

      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: #2c3e50;
      }
    }
  }
}

/* 内容区域 */
.content {
  padding: 32px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 80px);
  position: relative;

  @media (max-width: 1024px) {
    padding: 24px;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.3)"/><circle cx="80" cy="80" r="3" fill="rgba(255,255,255,0.2)"/><circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.4)"/></svg>');
    pointer-events: none;
    opacity: 0.5;
  }
}

/* 动画效果 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
