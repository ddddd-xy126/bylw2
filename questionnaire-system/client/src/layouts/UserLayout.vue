<template>
  <div class="user-layout">
    <header class="header">
      <div class="header-left">
        <router-link to="/home" class="logo">智能问卷分析系统</router-link>
      </div>
      <div class="header-center">
        <nav class="nav-center">
          <router-link to="/home">首页</router-link>
          <router-link to="/category">问卷分类</router-link>
          <router-link to="/rankings/participation">问卷排行榜</router-link>
        </nav>
      </div>
      <div class="header-right">
        <router-link v-if="!isAuthed" to="/login">登录</router-link>
        <router-link v-if="!isAuthed" to="/register">注册</router-link>

  <el-dropdown v-if="isAuthed" @command="handleCommand">
          <span class="el-dropdown-link">{{ nickname || "个人中心" }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout">退出</el-dropdown-item>
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

const userStore = useUserStore();
const { profile, token } = storeToRefs(userStore);

import { useRouter } from "vue-router";

const isAuthed = computed(() => !!token.value);
const nickname = computed(() => profile.value?.nickname);

const router = useRouter();

function logout() {
  userStore.logout();
}

function handleCommand(command) {
  if (command === "profile") {
    router.push("/profile");
  } else if (command === "logout") {
    logout();
  }
}
</script>

<style scoped>
.header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
  background: #fff;
}
.header-left {
  display: flex;
  align-items: center;
}
.logo {
  font-weight: 600;
  color: #333;
  text-decoration: none;
  font-size: 18px;
}
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}
.nav-center {
  display: flex;
  gap: 28px;
}
.nav-center a {
  color: #333;
  text-decoration: none;
}
.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
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
</style>
