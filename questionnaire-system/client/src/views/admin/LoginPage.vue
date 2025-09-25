<template>
  <div class="page">
    <el-card class="card">
      <h3>管理员登录</h3>
      <el-form :model="form" @submit.prevent>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit"
            >登录</el-button
          >
          <el-button type="text" @click="goToHome">返回首页</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { login as loginApi } from "@/api/auth";

const router = useRouter();
const store = useUserStore();
const loading = ref(false);
const form = ref({ email: "", password: "" });

async function onSubmit() {
  loading.value = true;
  try {
    const response = await loginApi(form.value);
    // 处理不同的响应格式
    const { token, user } = response.data || response;
    
    store.setToken(token);
    store.setProfile(user);
    
    if (user.role !== "admin") {
      return router.replace("/403");
    }
    router.replace("/admin/dashboard");
  } catch (error) {
    console.error('登录失败:', error);
    // 这里可以添加错误提示
  } finally {
    loading.value = false;
  }
}

function goToHome() {
  router.push("/home");
}
</script>

<style scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.card {
  width: 360px;
}
</style>
