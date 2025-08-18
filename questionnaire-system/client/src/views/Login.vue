<template>
  <div class="login-page">
    <el-card class="box">
      <h3>登录</h3>
      <el-form :model="form" @submit.prevent>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">登录</el-button>
          <el-button type="text" @click="goHome">返回首页</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { loginApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const form = reactive({ email: '', password: '' })

const submit = async () => {
  const { data } = await loginApi(form)
  userStore.setToken(data.token)
  userStore.setProfile(data.user)
  router.push('/')
}

const goHome = () => router.push('/')
</script>

<style scoped>
.login-page { display: flex; justify-content: center; align-items: center; height: 100%; }
.box { width: 360px; }
</style>


