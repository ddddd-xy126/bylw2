<template>
  <div class="user-layout">
    <header class="header">
      <router-link to="/home" class="logo">智能问卷分析系统</router-link>
      <div class="spacer" />
      <nav class="nav">
        <router-link to="/home">问卷广场</router-link>
        <router-link v-if="isAuthed" to="/profile">{{
          nickname || "个人中心"
        }}</router-link>
        <router-link v-if="!isAuthed" to="/login">登录</router-link>
        <router-link v-if="!isAuthed" to="/register">注册</router-link>
        <a v-if="isAuthed" href="javascript:void(0)" @click="logout">退出</a>
      </nav>
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

const isAuthed = computed(() => !!token.value);
const nickname = computed(() => profile.value?.nickname);

function logout() {
  userStore.logout();
}
</script>

<style scoped>
.header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
  background: #fff;
}
.logo {
  font-weight: 600;
  color: #333;
  text-decoration: none;
}
.spacer {
  flex: 1;
}
.main {
  min-height: calc(100vh - 56px - 56px);
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
</style>
