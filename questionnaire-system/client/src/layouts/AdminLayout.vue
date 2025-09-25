<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <nav>
        <ul>
          <li><router-link to="/admin/dashboard">仪表盘</router-link></li>
          <li><router-link to="/admin/surveys">问卷管理</router-link></li>
          <li><router-link to="/admin/users">用户管理</router-link></li>
        </ul>
      </nav>
    </aside>
    <div class="main">
      <header class="topbar">
        <div class="title">后台管理</div>
        <div class="spacer" />
        <el-button type="text" @click="onLogout">退出登录</el-button>
      </header>
      <section class="content">
        <router-view />
      </section>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

function onLogout() {
  userStore.logout();
  router.replace("/admin/login");
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: #fff;
  padding: 24px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar nav li {
  margin: 4px 0;
}

.sidebar a {
  color: #ecf0f1;
  text-decoration: none;
  display: block;
  padding: 12px 24px;
  border-radius: 0 25px 25px 0;
  margin-right: 12px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.sidebar a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(180deg, #3498db 0%, #2980b9 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
  transform-origin: bottom;
}

.sidebar a:hover {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
  transform: translateX(8px);
}

.sidebar a:hover::before {
  transform: scaleY(1);
}

.sidebar a.router-link-active {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(41, 128, 185, 0.2) 100%);
  color: #3498db;
  font-weight: 600;
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.sidebar a.router-link-active::before {
  transform: scaleY(1);
  background: linear-gradient(180deg, #3498db 0%, #2980b9 100%);
}

.sidebar a.router-link-active::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #3498db;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.6);
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.topbar {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.title {
  font-weight: 700;
  font-size: 20px;
  color: #2c3e50;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.spacer {
  flex: 1;
}

.topbar .el-button {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.topbar .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(231, 76, 60, 0.4);
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
}

.content {
  padding: 24px;
  background: #f8f9fa;
  min-height: calc(100vh - 72px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 16px 0;
  }
  
  .sidebar nav ul {
    display: flex;
    overflow-x: auto;
    padding: 0 16px;
  }
  
  .sidebar nav li {
    margin: 0 4px;
    flex-shrink: 0;
  }
  
  .sidebar a {
    border-radius: 20px;
    margin-right: 0;
    white-space: nowrap;
    padding: 8px 16px;
  }
  
  .sidebar a:hover,
  .sidebar a.router-link-active {
    transform: translateX(0);
  }
  
  .topbar {
    padding: 12px 16px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .content {
    padding: 16px;
  }
}
</style>
