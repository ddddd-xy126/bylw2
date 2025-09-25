<template>
  <div class="survey-section">
    <div class="section-header">
      <h2>热门问卷</h2>
      <el-radio-group 
        :model-value="sortBy" 
        @update:model-value="$emit('update:sortBy', $event)"
        @change="$emit('sortChange')"
      >
        <el-radio-button value="latest">最新</el-radio-button>
        <el-radio-button value="hot">热门</el-radio-button>
        <el-radio-button value="recommended">推荐</el-radio-button>
      </el-radio-group>
    </div>

    <el-loading :loading="loading">
      <el-row :gutter="20" v-if="surveys.length">
        <el-col
          :span="8"
          v-for="survey in surveys"
          :key="survey.id"
          style="margin-bottom: 20px"
        >
          <SurveyCard
            :survey="survey"
            :category-name="getCategoryName(survey.categoryId)"
            :is-favorite="isFavorite(survey.id)"
            :show-favorite="showFavorite"
            @click="$emit('surveyClick', $event)"
            @start="$emit('surveyStart', $event)"
            @toggle-favorite="$emit('toggleFavorite', $event)"
          />
        </el-col>
      </el-row>

      <el-empty v-else description="暂无问卷数据" :image-size="100" />
    </el-loading>
  </div>
</template>

<script setup>
import SurveyCard from './SurveyCard.vue';

defineProps({
  surveys: {
    type: Array,
    default: () => []
  },
  sortBy: {
    type: String,
    default: 'latest'
  },
  loading: {
    type: Boolean,
    default: false
  },
  getCategoryName: {
    type: Function,
    required: true
  },
  isFavorite: {
    type: Function,
    required: true
  },
  showFavorite: {
    type: Boolean,
    default: true
  }
});

defineEmits([
  'update:sortBy', 
  'sortChange', 
  'surveyClick', 
  'surveyStart', 
  'toggleFavorite'
]);
</script>

<style scoped>
.survey-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}
</style>