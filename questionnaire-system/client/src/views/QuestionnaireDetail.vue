<template>
  <div class="q-detail">
    <el-page-header content="问卷详情/动态答题（占位）" @back="$router.back()" />
    <el-card style="margin-top:16px">
      <el-skeleton :rows="5" animated />
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.q-detail { padding: 16px; }
</style>


