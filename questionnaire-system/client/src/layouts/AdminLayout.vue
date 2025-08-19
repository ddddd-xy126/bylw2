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
  width: 220px;
  background: #1f2d3d;
  color: #fff;
  padding: 16px;
}
.sidebar a {
  color: #fff;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.topbar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: #fff;
}
.title {
  font-weight: 600;
}
.spacer {
  flex: 1;
}
.content {
  padding: 16px;
}
</style>
