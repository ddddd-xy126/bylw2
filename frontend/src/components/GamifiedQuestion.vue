<template>
	<div class="question">
		<h3>{{ title }}</h3>
		<p class="meta" v-if="timeLimit">限时：{{ timeLeft }}s</p>
		<slot />
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({ title: String, timeLimit: { type: Number, default: 0 } })
const timeLeft = ref(props.timeLimit)
let timer = null

onMounted(() => {
	if (props.timeLimit > 0) {
		timer = setInterval(() => {
			if (timeLeft.value > 0) timeLeft.value -= 1
		}, 1000)
	}
})

onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.question{border:1px solid #ddd;border-radius:8px;padding:12px;margin:12px 0}
.meta{color:#999;font-size:12px}
</style>
