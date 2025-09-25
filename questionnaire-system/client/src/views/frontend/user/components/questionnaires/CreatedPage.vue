<template>
  <el-card>
    <template #header>
      <h2>我创建的问卷</h2>
    </template>
    <el-empty description="我创建的问卷管理页面占位符">
      <template #description>
        <p>功能包括：查看创建的问卷、编辑问卷、复制问卷、删除问卷、查看统计数据等</p>
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