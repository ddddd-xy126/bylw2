<template>
  <div class="admin-qm">
    <el-page-header content="后台 - 问卷管理" @back="$router.push('/admin')" />
    <el-card style="margin-top:16px">
      <el-empty description="问卷管理占位（创建/编辑/审核/发布/下架/删除）" />
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-qm { padding: 16px; }
</style>


