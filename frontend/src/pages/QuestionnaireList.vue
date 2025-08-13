<template>
	<section>
		<h2>问卷列表</h2>
		<select v-model="status">
			<option value="">全部</option>
			<option value="published">已发布</option>
			<option value="draft">草稿</option>
		</select>
		<ul>
			<li v-for="q in list" :key="q.id">
				<router-link :to="`/questionnaires/${q.id}`">{{ q.title }}</router-link>
			</li>
		</ul>
	</section>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import api from '../services/api.js'

const list = ref([])
const status = ref('')

watchEffect(async () => {
	const { data } = await api.get('/questionnaires', { params: { status: status.value || undefined } })
	list.value = data
})
</script>
