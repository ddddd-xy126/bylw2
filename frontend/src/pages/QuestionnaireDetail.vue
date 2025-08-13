<template>
	<section>
		<h2>{{ detail?.title }}</h2>
		<GamifiedQuestion title="示例题目" :time-limit="60" />
		<button @click="submit">提交</button>
	</section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api.js'
import GamifiedQuestion from '../components/GamifiedQuestion.vue'

const route = useRoute()
const router = useRouter()
const detail = ref(null)

onMounted(async () => {
	const { data } = await api.get(`/questionnaires/${route.params.id}`)
	detail.value = data
})

async function submit() {
	await api.post(`/questionnaires/${route.params.id}/submit`, { answers: [] })
	router.push('/reports')
}
</script>
