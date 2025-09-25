<template>
  <el-card>
    <template #header>
      <h2>回收站</h2>
    </template>
    <el-empty description="回收站管理页面占位符">
      <template #description>
        <p>功能包括：查看已删除的问卷、恢复问卷、永久删除、批量操作等</p>
      </template>
      <el-button type="primary">功能开发中...</el-button>
    </el-empty>
  </el-card>
</template>

<script setup>
// 占位符页面
</script>

<style scoped>
h2 {
  margin: 0;
  color: #303133;
}
</style>