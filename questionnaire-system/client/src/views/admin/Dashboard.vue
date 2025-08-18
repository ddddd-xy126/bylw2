<template>
  <div class="admin-dashboard">
    <el-page-header content="后台管理 - 仪表盘" @back="$router.push('/')" />
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="8"><el-card>问卷数量：——</el-card></el-col>
      <el-col :span="8"><el-card>参与人数：——</el-card></el-col>
      <el-col :span="8"><el-card>完成率：——</el-card></el-col>
    </el-row>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-dashboard { padding: 16px; }
</style>


