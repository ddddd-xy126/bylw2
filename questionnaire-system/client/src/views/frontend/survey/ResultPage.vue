<template>
  <div class="survey-result">
    <el-page-header content="测评报告" @back="$router.back()" />
    <el-card style="margin-top: 16px">
      <el-empty description="报告展示占位（图表/建议/下载）" />
    </el-card>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>

.survey-result {
  padding: 16px;
}
</style>
