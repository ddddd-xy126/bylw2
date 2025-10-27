<template>
  <div class="admin-stats-distribution">
    <el-page-header
      content="数据统计 - 分布"
      @back="$router.push('/admin/dashboard')"
    />
    <el-card style="margin-top: 16px">
      <el-empty description="分布统计占位（饼图/雷达图）" />
    </el-card>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>

.admin-stats-distribution {
  padding: 16px;
}
</style>
