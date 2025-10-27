<template>
  <div class="admin-stats-completion">
    <el-page-header
      content="数据统计 - 完成率"
      @back="$router.push('/admin/dashboard')"
    />
    <el-card style="margin-top: 16px">
      <el-empty description="完成率统计占位（折线/柱状图）" />
    </el-card>
  </div>
</template>

<script setup></script>

<style scoped lang="scss">
.admin-stats-completion {
  padding: 16px;
}
</style>
