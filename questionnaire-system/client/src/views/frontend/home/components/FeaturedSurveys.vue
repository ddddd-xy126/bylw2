<template>
  <div class="featured-surveys">
    <div class="featured-header">
      <h2>
        <el-icon><Star /></el-icon>
        热门推荐
      </h2>
      <p>精选优质问卷，助您深入了解自己</p>
    </div>

    <div class="featured-grid">
      <SurveyCardEnhanced
        v-for="survey in featuredSurveys"
        :key="survey.id"
        :survey="survey"
        :is-favorite="isFavorite(survey.id)"
        :hot-threshold="1500"
        @click="$emit('survey-click', survey.id)"
        @start="$emit('survey-start', survey.id)"
        @toggle-favorite="$emit('toggle-favorite', survey.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Star } from "@element-plus/icons-vue";
import SurveyCardEnhanced from "@/components/SurveyCardEnhanced.vue";

const props = defineProps({
  surveys: {
    type: Array,
    required: true,
  },
  userFavorites: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["survey-click", "survey-start", "toggle-favorite"]);

// 热门推荐问卷（取前6个高评分或高参与度的）
const featuredSurveys = computed(() => {
  return props.surveys
    .sort((a, b) => {
      // 按评分和参与人数排序
      const scoreA =
        (a.averageRating || 0) * 0.6 + ((a.participantCount || 0) / 1000) * 0.4;
      const scoreB =
        (b.averageRating || 0) * 0.6 + ((b.participantCount || 0) / 1000) * 0.4;
      return scoreB - scoreA;
    })
    .slice(0, 6);
});

const isFavorite = (surveyId) => {
  const favoritesArray = Array.isArray(props.userFavorites)
    ? props.userFavorites
    : [];
  return favoritesArray.some((fav) => fav.questionnaireId === surveyId);
};
</script>

<style lang="scss" scoped>
.featured-surveys {
  margin-bottom: 60px;

  .featured-header {
    text-align: center;
    margin-bottom: 40px;

    h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    p {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }
  }

  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
  }

  @media (max-width: 768px) {
    .featured-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}
</style>
