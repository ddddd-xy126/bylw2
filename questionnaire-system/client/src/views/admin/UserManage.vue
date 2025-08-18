<template>
  <div class="admin-um">
    <el-page-header content="后台 - 用户管理" @back="$router.push('/admin')" />
    <el-card style="margin-top:16px">
      <el-empty description="用户管理占位（查看/搜索/封禁/解封/管理员管理）" />
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-um { padding: 16px; }
</style>


