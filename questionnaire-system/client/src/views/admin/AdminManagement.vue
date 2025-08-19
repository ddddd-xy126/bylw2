<template>
  <div class="admin-admins">
    <el-page-header
      content="后台 - 管理员管理"
      @back="$router.push('/admin')"
    />
    <el-card style="margin-top: 16px">
      <el-empty description="管理员管理占位（添加/移除/权限分配）" />
    </el-card>
  </div>
</template>

<script setup></script>

<style scoped>
.admin-admins {
  padding: 16px;
}
</style>
