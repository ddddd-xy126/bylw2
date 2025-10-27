<template>
  <div class="error">
    <h1>403</h1>
    <p>无权限访问该页面</p>
    <router-link to="/home">返回首页</router-link>
    <div style="margin-top: 12px">
      <router-link to="/admin/login">管理员登录</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.error {
  text-align: center;
  padding: 60px 16px;

  h1 {
    font-size: 64px;
    margin: 0;
  }

  p {
    color: #666;
  }

  a,
  .router-link {
    color: #409eff;
    text-decoration: none;
  }
}
</style>
