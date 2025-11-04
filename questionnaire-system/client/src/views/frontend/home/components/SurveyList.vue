<template>
  <div class="survey-section">
    <div class="section-header">
      <h2></h2>
      <!-- 可选排序控件（首页需要，列表页可传 false 隐藏） -->
      <div v-if="showSort" class="sort-group">
        <el-radio-group :model-value="sortBy" @update:model-value="$emit('update:sortBy', $event)"
          @change="$emit('sortChange')">
          <el-radio-button value="recommended">推荐</el-radio-button>
          <el-radio-button value="latest">最新</el-radio-button>
          <el-radio-button value="hot">热门</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div v-loading="loading">
      <!-- 使用增强版卡片组件 -->
      <div class="featured-grid" v-if="surveys.length">
        <SurveyCardEnhanced
          v-for="survey in surveys" 
          :key="survey.id"
          :survey="survey"
          :is-favorite="isFavorite(survey.id)"
          :show-favorite-button="showFavorite"
          @click="$emit('surveyClick', survey.id)"
          @start="$emit('surveyStart', survey.id)"
          @toggle-favorite="$emit('toggleFavorite', survey.id)"
        />
      </div>

      <el-empty v-if="!loading && !surveys.length" description="暂无问卷数据" :image-size="100" />
    </div>
  </div>
</template>

<script setup>
import SurveyCardEnhanced from '@/components/SurveyCardEnhanced.vue'

defineProps({
  surveys: {
    type: Array,
    default: () => []
  },
  sortBy: {
    type: String,
    default: 'latest'
  },
  showSort: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  getCategoryName: {
    type: Function,
    required: false  // 不再必需
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
<style lang="scss" scoped>
.survey-section {
  background-color: var(--color-gray-50);
  border-radius: var(--radius-lg);
  padding: 40px 40px;
  margin-bottom: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(17, 24, 39, 0.06);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 40px rgba(17, 24, 39, 0.08);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      color: #333;
    }
  }

  /* 卡片网格布局 */
  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .featured-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}
</style>