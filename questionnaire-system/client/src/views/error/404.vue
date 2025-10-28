<template>
  <div class="error">
    <h1>404</h1>
    <p>页面未找到</p>
    <router-link to="/home">返回首页</router-link>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.error {
  text-align: center;
  padding: 60px 16px;

  h1 {
    font-size: 96px;
    margin: 0;
    color: #f56c6c;
  }

  p {
    font-size: 18px;
    color: #606266;
    margin: 12px 0 24px 0;
  }

  a,
  .router-link {
    color: var(--color-primary-light-3);
    text-decoration: none;
  }
}
</style>
