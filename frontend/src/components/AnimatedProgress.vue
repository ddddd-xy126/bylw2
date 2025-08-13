<template>
	<div class="bar">
		<div class="fill" :style="{ width: pct + '%' }"></div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ value: { type: Number, default: 0 }, max: { type: Number, default: 100 } })
const pct = computed(() => Math.max(0, Math.min(100, (props.value / props.max) * 100)))
</script>

<style scoped>
.bar{height:10px;background:#eee;border-radius:8px;overflow:hidden}
.fill{height:100%;background:#42b983;transition:width .4s ease}
</style>
