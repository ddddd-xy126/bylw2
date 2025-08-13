<template>
	<section>
		<h2>个人中心</h2>
		<div v-if="!auth.token" class="card">
			<h3>登录</h3>
			<input v-model="identifier" placeholder="邮箱或手机号" />
			<input v-model="password" type="password" placeholder="密码" />
			<button @click="login">登录</button>
		</div>
		<div v-else class="card">
			<p>已登录：{{ auth.user?.identifier || '用户' }}</p>
			<button @click="logout">退出</button>
		</div>
	</section>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/index.js'
import api from '../services/api.js'

const auth = useAuthStore()
const identifier = ref('demo@example.com')
const password = ref('demopass')

async function login() {
	const { data } = await api.post('/auth/login', { identifier: identifier.value, password: password.value })
	auth.setToken(data.token)
	auth.setUser({ identifier: identifier.value })
}

function logout() { auth.logout() }
</script>

<style scoped>
.card{border:1px solid #eee;border-radius:8px;padding:12px;margin-top:12px;max-width:360px}
input{display:block;margin:6px 0;padding:6px;width:100%}
</style>
