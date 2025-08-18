<template>
  <div class="profile-page">
    <el-page-header content="个人中心 - 基础信息" @back="$router.push('/')" />
    <el-card style="margin-top:16px">
      <el-form label-width="90px">
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="输入昵称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
const form = reactive({ nickname: '' })
</script>

<style scoped>
.profile-page { padding: 16px; }
</style>


