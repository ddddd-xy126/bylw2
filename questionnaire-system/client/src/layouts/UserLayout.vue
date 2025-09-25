<template>
  <div class="user-layout">
    <header class="header">
      <div class="header-left">
        <router-link to="/home" class="logo">智能问卷分析系统</router-link>
      </div>
      <div class="header-center">
        <nav class="nav-center">
          <router-link to="/home">首页</router-link>
          <router-link to="/forum">问卷论坛</router-link>
          <router-link v-if="isAuthed" to="/create">创建问卷</router-link>
          <router-link to="/rankings/participation">问卷排行榜</router-link>
          <router-link v-if="isAuthed" to="/profile">个人中心</router-link>
        </nav>
      </div>
      <div class="header-right">
        <router-link v-if="!isAuthed" to="/login">登录</router-link>
        <router-link v-if="!isAuthed" to="/register">注册</router-link>

        <el-dropdown v-if="isAuthed" @command="handleCommand" class="user-dropdown">
          <div class="user-info">
            <el-avatar 
              :size="36" 
              :src="userAvatar" 
              class="user-avatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="user-name">{{ nickname || "用户" }}</span>
            <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>
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
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/user";
import { User, ArrowDown, SwitchButton } from "@element-plus/icons-vue";

const userStore = useUserStore();
const { profile, token } = storeToRefs(userStore);

import { useRouter } from "vue-router";

const isAuthed = computed(() => !!token.value);
const nickname = computed(() => profile.value?.nickname);
const userAvatar = computed(() => {
  // 如果用户有头像，使用用户头像，否则使用默认头像
  return profile.value?.avatar || generateAvatarUrl(nickname.value);
});

// 生成基于用户名的头像URL（使用在线头像服务）
const generateAvatarUrl = (name) => {
  if (!name) return '';
  // 使用DiceBear API生成头像，或者可以使用其他头像服务
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=667eea,764ba2&fontSize=40`;
};

const router = useRouter();

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
</script>

<style scoped>
.header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-left {
  display: flex;
  align-items: center;
}
.logo {
  font-weight: 700;
  color: #667eea;
  text-decoration: none;
  font-size: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 2px 8px rgba(102, 126, 234, 0.3));
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 40px;
}
.nav-center {
  display: flex;
  gap: 28px;
}
.nav-center a {
  color: #333;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.nav-center a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.6s;
}

.nav-center a:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.08);
  transform: translateY(-1px);
}

.nav-center a:hover::before {
  left: 100%;
}

.nav-center a.router-link-active {
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.2);
  font-weight: 600;
}

.nav-center a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 1px;
}
.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.header-right a {
  color: #667eea;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.header-right a:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.user-dropdown {
  cursor: pointer;
}

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
}

.user-info:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.25);
}

.user-avatar {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.user-info:hover .user-avatar {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.user-name {
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  color: #667eea;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  padding: 6px;
  min-width: 160px;
}

:deep(.el-dropdown-menu__item) {
  border-radius: 8px;
  margin: 2px 0;
  padding: 10px 12px;
  transition: all 0.3s ease;
  color: #333;
  font-weight: 500;
}

:deep(.el-dropdown-menu__item:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  transform: translateX(4px);
}



:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
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
}
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
}
.dropdown-item {
  display: block;
  padding: 10px 12px;
  color: #333;
  text-decoration: none;
}
.dropdown-item:hover {
  background: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header {
    padding: 0 20px;
  }
  
  .header-center {
    margin: 0 20px;
  }
  
  .nav-center {
    gap: 20px;
  }
  
  .nav-center a {
    padding: 6px 12px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .logo {
    font-size: 18px;
  }
  
  .header-center {
    margin: 0 16px;
  }
  
  .nav-center {
    gap: 16px;
  }
  
  .nav-center a {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .header-right {
    gap: 12px;
  }
  
  .header-right a {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .user-info {
    padding: 5px 10px;
    gap: 6px;
  }
  
  .user-avatar {
    width: 32px !important;
    height: 32px !important;
  }
  
  .user-name {
    font-size: 13px;
    max-width: 70px;
  }
}

@media (max-width: 640px) {
  .nav-center {
    gap: 12px;
  }
  
  .nav-center a {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .header-right a {
    padding: 4px 8px;
    font-size: 13px;
  }
  
  .user-info {
    padding: 4px 8px;
    gap: 6px;
  }
  
  .user-avatar {
    width: 28px !important;
    height: 28px !important;
  }
  
  .user-name {
    font-size: 12px;
    max-width: 60px;
  }
  
  .dropdown-arrow {
    font-size: 10px;
  }
}
</style>
