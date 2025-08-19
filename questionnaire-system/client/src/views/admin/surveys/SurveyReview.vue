<template>
  <div class="admin-survey-review">
    <el-page-header content="问卷审核" @back="$router.push('/admin/surveys')" />
    <el-card style="margin-top: 16px">
      <el-empty description="审核队列占位（通过/拒绝/备注）" />
    </el-card>
  </div>
</template>

<script setup></script>

<style scoped>
.admin-survey-review {
  padding: 16px;
}
</style>
