<template>
  <div class="error">
    <h1>404</h1>
    <p>页面未找到</p>
    <router-link to="/home">返回首页</router-link>
  </div>
</template>

<script setup></script>

<style scoped>
.error {
  text-align: center;
  padding: 60px 16px;
}
h1 {
  font-size: 64px;
  margin: 0;
}
p {
  color: #666;
}
</style>
