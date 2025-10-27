<template>
  <div class="page">
    <el-card class="card">
      <h3>用户注册</h3>
      <el-form :model="form" @submit.prevent>
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" type="password" /></el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit">注册</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { register as registerApi } from "@/api/auth";

const router = useRouter();
const loading = ref(false);
const form = ref({ email: "", nickname: "", password: "" });

async function onSubmit() {
  loading.value = true;
  try {
    await registerApi(form.value);
    router.replace("/login");
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;

  .card {
    width: 360px;
  }
}
</style>
