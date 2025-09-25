<template>
  <div class="page">
    <el-card class="card">
      <h3>重置密码</h3>
      <el-form :model="form">
        <el-form-item label="邮箱"
          ><el-input v-model="form.email"
        /></el-form-item>
        <el-form-item label="新密码"
          ><el-input v-model="form.password" type="password"
        /></el-form-item>
        <el-button type="primary">提交</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";
const form = reactive({ email: "", password: "" });
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
