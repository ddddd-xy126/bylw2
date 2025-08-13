<template>
	<div class="layout">
		<header class="header">
			<h1>智能问卷分析系统</h1>
			<nav>
				<router-link to="/">首页</router-link>
				<router-link to="/questionnaires">问卷列表</router-link>
				<router-link to="/reports">报告</router-link>
				<router-link to="/achievements">成就</router-link>
				<router-link to="/profile">个人中心</router-link>
			</nav>
		</header>
		<main>
			<router-view />
		</main>
	</div>
</template>

<script setup>
</script>

<style scoped>
.layout{max-width:1080px;margin:0 auto;padding:16px}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
nav a{margin-right:12px}
</style>
