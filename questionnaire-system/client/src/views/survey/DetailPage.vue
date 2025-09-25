<template>
  <div class="survey-detail">
    <el-page-header content="问卷详情" @back="$router.back()" />
    <el-card style="margin-top: 16px">
      <el-skeleton :rows="4" v-if="loading" animated />
      <template v-else>
        <h3>{{ detail.title }}</h3>
        <p>{{ detail.description }}</p>
        <el-button
          type="primary"
          @click="$router.push(`/surveys/answer/${detail.id}`)"
          >开始作答</el-button
        >
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getSurveyDetail } from "@/api/survey";
const route = useRoute();
const loading = ref(true);
const detail = ref({});
onMounted(async () => {
  detail.value = await getSurveyDetail(route.params.id);
  loading.value = false;
});
</script>

<style scoped>
.survey-detail {
  padding: 16px;
}
</style>
