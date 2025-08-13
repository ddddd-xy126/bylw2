<template>
	<section>
		<h2>分析报告</h2>
		<div ref="pieRef" style="width: 100%; height: 280px;"></div>
		<div ref="lineRef" style="width: 100%; height: 280px; margin-top: 16px;"></div>
	</section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const pieRef = ref(null)
const lineRef = ref(null)

onMounted(() => {
	const pie = echarts.init(pieRef.value)
	pie.setOption({
		title: { text: '答案分布' },
		series: [{ type: 'pie', data: [ { value: 40, name: 'A'}, { value: 32, name: 'B'}, { value: 28, name: 'C'} ] }]
	})
	const line = echarts.init(lineRef.value)
	line.setOption({
		title: { text: '完成率趋势' },
		xAxis: { type: 'category', data: ['周一','周二','周三','周四','周五','周六','周日'] },
		yAxis: { type: 'value' },
		series: [{ type: 'line', data: [20, 30, 45, 50, 65, 70, 80] }]
	})
})
</script>
