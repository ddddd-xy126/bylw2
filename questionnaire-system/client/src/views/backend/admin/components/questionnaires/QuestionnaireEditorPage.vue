<template>
  <div class="admin-questionnaire-editor-wrapper">
    <admin-questionnaire-editor />
  </div>
</template>

<script setup>
import AdminQuestionnaireEditor from './AdminQuestionnaireEditor.vue'
</script>

<style lang="scss" scoped>
.admin-questionnaire-editor-wrapper {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}
</style>
