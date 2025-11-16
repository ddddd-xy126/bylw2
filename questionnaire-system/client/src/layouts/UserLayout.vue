<template>
  <div class="user-layout">
    <header class="header">
      <div class="header-left">
        <router-link to="/home" class="logo">智能问卷分析系统</router-link>
      </div>
      <div class="header-center">
        <nav class="nav-center">
          <router-link to="/home">首页</router-link>
          <router-link to="/surveys">问卷列表</router-link>
          <router-link v-if="isAuthed" to="/create">创建问卷</router-link>
          <router-link to="/rankings/participation">问卷排行榜</router-link>
          <router-link v-if="isAuthed" to="/profile">个人中心</router-link>
        </nav>
      </div>
      <div class="header-right">
        <!-- 公告通知图标 -->
        <el-badge v-if="isAuthed" :value="unreadAnnouncementCount" :hidden="!unreadAnnouncementCount"
          class="notification-badge">
          <el-button circle @click="showAnnouncements" type="info" size="default">
            <el-icon>
              <Bell />
            </el-icon>
          </el-button>
        </el-badge>

        <router-link v-if="!isAuthed" to="/login">登录</router-link>

        <el-dropdown v-if="isAuthed" @command="handleCommand" class="user-dropdown">
          <div class="user-info">
            <el-avatar :size="36" :src="userAvatar" class="user-avatar">
              <el-icon>
                <User />
              </el-icon>
            </el-avatar>
            <span class="user-name">{{ username || "用户" }}</span>
            <el-icon class="dropdown-arrow">
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon>
                  <SwitchButton />
                </el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <router-link v-if="isAuthed && profile?.role === 'admin'" to="/admin/dashboard">后台管理</router-link>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
    <footer class="footer">© Questionnaire System</footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/user";
import { useDataStore } from "@/store/data";
import {useRouter } from "vue-router";
import { User, ArrowDown, SwitchButton, Bell } from "@element-plus/icons-vue";
import { ElNotification, ElMessageBox } from "element-plus";
import { getAnnouncementsApi } from '@/api/admin';

const userStore = useUserStore();
const dataStore = useDataStore();
const { profile, token } = storeToRefs(userStore);
const router = useRouter();

// 公告相关
const announcements = ref([]);
const unreadAnnouncementCount = ref(0);

const isAuthed = computed(() => !!token.value);
const username = computed(() => profile.value?.username);
const userAvatar = computed(() => {
  // 优先使用用户上传的头像
  if (profile.value?.avatar) {
    return profile.value.avatar;
  }
  // 如果用户有头像，使用用户头像，否则使用默认头像
  return profile.value?.avatar || generateAvatarUrl(username.value);
});

// 生成基于用户名的头像URL（使用在线头像服务）
const generateAvatarUrl = (name) => {
  if (!name) return '';
  // 使用DiceBear API生成头像，或者可以使用其他头像服务
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=667eea,764ba2&fontSize=40`;
};

// 加载公告列表
const loadAnnouncements = async () => {
  if (!isAuthed.value) return;

  try {
    const data = await getAnnouncementsApi({
      isActive: true,
      sort: 'publishedAt',
      order: 'desc'
    });
    announcements.value = data;

    // 从localStorage获取已读公告ID列表
    const readAnnouncementsStr = localStorage.getItem('readAnnouncements') || '[]';
    const readAnnouncements = JSON.parse(readAnnouncementsStr);

    // 计算未读公告数量
    const unreadCount = data.filter(a => !readAnnouncements.includes(a.id)).length;
    unreadAnnouncementCount.value = unreadCount;
  } catch (error) {
    console.error('加载公告失败:', error);
  }
};

// 显示公告列表
const showAnnouncements = () => {
  if (announcements.value.length === 0) {
    ElNotification({
      title: '暂无公告',
      message: '当前没有新的系统公告',
      type: 'info',
      duration: 3000
    });
    return;
  }

  // 构建公告HTML内容
  const announcementHtml = announcements.value.map((announcement, index) => {
    const typeIcon = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[announcement.type] || 'ℹ️';

    return `
      <div style="margin-bottom: 16px; padding: 12px; border-left: 3px solid ${getAnnouncementColor(announcement.type)}; background: #f5f7fa; border-radius: 4px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #303133;">
          ${typeIcon} ${announcement.title}
        </div>
        <div style="font-size: 14px; color: #606266; line-height: 1.6; margin-bottom: 8px;">
          ${announcement.content}
        </div>
        <div style="font-size: 12px; color: #909399;">
          发布时间: ${new Date(announcement.publishedAt).toLocaleString('zh-CN')}
        </div>
      </div>
    `;
  }).join('');

  ElMessageBox({
    title: '系统公告',
    message: announcementHtml,
    dangerouslyUseHTMLString: true,
    confirmButtonText: '知道了',
    customStyle: {
      width: '600px'
    },
    callback: () => {
      // 标记所有公告为已读
      const readAnnouncements = announcements.value.map(a => a.id);
      localStorage.setItem('readAnnouncements', JSON.stringify(readAnnouncements));
      unreadAnnouncementCount.value = 0;
    }
  });
};

// 获取公告类型对应的颜色
const getAnnouncementColor = (type) => {
  const colorMap = {
    info: '#67d474d5',
    success: '#67C23A',
    warning: '#E6A23C',
    error: '#F56C6C'
  };
  return colorMap[type] || '#67d474d5';
};

function logout() {
  // 判断当前用户是否是管理员
  const isAdmin = profile.value?.role === 'admin';

  userStore.logout();

  // 根据用户角色重定向到不同的登录页面
  if (isAdmin) {
    router.replace("/admin/login");
  } else {
    router.replace("/login");
  }
}

function handleCommand(command) {
  if (command === "logout") {
    logout();
  }
}

// 监听用户登录状态变化
watch(isAuthed, (newVal) => {
  if (newVal) {
    loadAnnouncements();
  } else {
    announcements.value = [];
    unreadAnnouncementCount.value = 0;
  }
});

// 组件挂载时检查
onMounted(() => {
  if (isAuthed.value) {
    loadAnnouncements();
  }
});
</script>

<style scoped lang="scss">
.header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, var(--text-inverse) 0%, var(--color-primary-light-5) 100%);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 1024px) {
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    padding: 0 16px;
  }

  &-left {
    display: flex;
    align-items: center;

    .logo {
      font-weight: 700;
      color: var(--color-primary-light-3);
      text-decoration: none;
      font-size: 20px;
      background: linear-gradient(135deg, var(--color-primary-light-3) 0%, var(--color-primary-dark-1) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transition: all 0.3s ease;

      @media (max-width: 768px) {
        font-size: 18px;
      }

      &:hover {
        transform: scale(1.05);
        filter: drop-shadow(0 2px 8px rgba(53, 58, 78, 0.3));
      }
    }
  }

  &-center {
    flex: 1;
    display: flex;
    justify-content: center;
    margin: 0 40px;

    @media (max-width: 1024px) {
      margin: 0 20px;
    }

    @media (max-width: 768px) {
      margin: 0 16px;
    }

    .nav-center {
      display: flex;
      gap: 28px;
      align-items: center;

      @media (max-width: 1024px) {
        gap: 20px;
      }

      @media (max-width: 768px) {
        gap: 16px;
      }

      @media (max-width: 640px) {
        gap: 12px;
      }

      a {
        color: var(--text-primary-1);
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 500;
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;

        @media (max-width: 1024px) {
          padding: 6px 12px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          padding: 6px 10px;
          font-size: 13px;
        }

        @media (max-width: 640px) {
          padding: 4px 8px;
          font-size: 12px;
        }

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(102, 234, 109, 0.301), transparent);
          transition: left 0.6s;
        }

        &:hover {
          color: var(--text-link-hover);
          background: rgba(102, 234, 109, 0.08);
          transform: translateY(-1px);
        }

        &:hover::before {
          left: 100%;
        }

        &.router-link-active {
          color: var(--text-link-hover);
          background: linear-gradient(135deg, rgba(102, 234, 113, 0.15) 0%, rgba(32, 168, 77, 0.356) 100%);
          box-shadow: 0 4px 12px rgba(102, 234, 113, 0.2), inset 0 1px 0 rgba(25, 216, 73, 0.2);
          border: 1px solid rgba(86, 177, 64, 0.11);
          font-weight: 600;
        }

        &.router-link-active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: linear-gradient(135deg, var(--color-primary-light-3) 0%, var(--color-primary-dark-1) 100%);
          border-radius: 1px;
        }
      }
    }
  }

  &-right {
    display: flex;
    gap: 16px;
    align-items: center;

    @media (max-width: 768px) {
      gap: 12px;
    }

    .notification-badge {
      margin-right: 8px;

      :deep(.el-badge__content) {
        background-color: var(--color-accent-5);
        border: 2px solid #fff;
      }
    }

    a {
      color: var(--color-primary-light-3);
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;

      @media (max-width: 768px) {
        padding: 6px 12px;
        font-size: 14px;
      }

      @media (max-width: 640px) {
        padding: 4px 8px;
        font-size: 13px;
      }

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: rgba(102, 126, 234, 0.2);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      }
    }

    .user-dropdown {
      cursor: pointer;

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 24px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
        border: 1px solid rgba(102, 126, 234, 0.15);
        backdrop-filter: blur(10px);

        @media (max-width: 768px) {
          padding: 5px 10px;
          gap: 6px;
        }

        @media (max-width: 640px) {
          padding: 4px 8px;
          gap: 6px;
        }

        &:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.25);
        }

        .user-avatar {
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;

          @media (max-width: 768px) {
            width: 32px !important;
            height: 32px !important;
          }

          @media (max-width: 640px) {
            width: 28px !important;
            height: 28px !important;
          }
        }

        &:hover .user-avatar {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .user-name {
          color: var(--color-primary-dark-1);
          font-weight: 600;
          font-size: 14px;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          @media (max-width: 768px) {
            font-size: 13px;
            max-width: 70px;
          }

          @media (max-width: 640px) {
            font-size: 12px;
            max-width: 60px;
          }
        }

        .dropdown-arrow {
          color: var(--color-primary-dark-1);
          font-size: 12px;
          transition: transform 0.3s ease;

          @media (max-width: 640px) {
            font-size: 10px;
          }
        }

        &:hover .dropdown-arrow {
          transform: rotate(180deg);
        }
      }
    }
  }
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  background: linear-gradient(145deg, var(--text-inverse)ff 0%, #f8f9ff 100%);
  border: 1px solid rgba(37, 146, 52, 0.1);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  padding: 6px;
  min-width: 160px;

  .el-dropdown-menu__item {
    border-radius: 8px;
    margin: 2px 0;
    padding: 10px 12px;
    transition: all 0.3s ease;
    color: #333;
    font-weight: 500;

    &:hover {
      background: linear-gradient(135deg, var(--color-primary-light-5) 0%, var(--color-primary-light-4) 100%);
      color: var(--color-primary-dark-2);
    }

    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
}

.main {
  min-height: calc(100vh - 64px - 56px);
  padding: 16px;
}

.footer {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.user-menu {
  position: relative;

  .user-name {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 14px;
  }

  .dropdown {
    position: absolute;
    right: 0;
    top: 36px;
    background: #fff;
    border: 1px solid #e6e6e6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    min-width: 140px;
    z-index: 30;

    &-item {
      display: block;
      padding: 10px 12px;
      color: #333;
      text-decoration: none;

      &:hover {
        background: #f5f5f5;
      }
    }
  }
}
</style>
