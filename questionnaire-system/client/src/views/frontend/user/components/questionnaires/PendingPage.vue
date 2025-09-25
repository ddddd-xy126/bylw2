<template>
  <el-card>
    <template #header>
      <h2>待审核问卷</h2>
    </template>
    <el-empty description="待审核问卷管理页面占位符">
      <template #description>
        <p>功能包括：查看待审核的问卷、撤回审核、修改问卷、查看审核状态等</p>
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