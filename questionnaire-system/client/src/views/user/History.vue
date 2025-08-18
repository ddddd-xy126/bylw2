<template>
  <div class="history-page">
    <el-page-header content="个人中心 - 历史问卷" @back="$router.push('/')" />
    <el-card style="margin-top:16px">
      <el-empty description="历史记录占位" />
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.history-page { padding: 16px; }
</style>


