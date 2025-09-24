<template>
  <el-card
    class="survey-card"
    shadow="hover"
    @click="$emit('click', survey.id)"
  >
    <div class="survey-header">
      <h3>{{ survey.title }}</h3>
      <el-tag
        :type="survey.status === 'published' ? 'success' : 'info'"
        size="small"
      >
        {{ survey.status === "published" ? "已发布" : "草稿" }}
      </el-tag>
    </div>

    <p class="survey-description">{{ survey.description }}</p>

    <div class="survey-meta">
      <el-tag size="small" type="info">
        {{ categoryName }}
      </el-tag>
      <span class="survey-stats">
        <el-icon><User /></el-icon>
        {{ survey.participantCount || 0 }}
      </span>
    </div>

    <div class="survey-actions">
      <el-button
        type="primary"
        size="small"
        @click.stop="$emit('start', survey.id)"
      >
        开始答题
      </el-button>
      <el-button
        :icon="isFavorite ? Star : StarFilled"
        :type="isFavorite ? 'warning' : 'default'"
        size="small"
        @click.stop="$emit('toggleFavorite', survey.id)"
        v-if="showFavorite"
      >
        {{ isFavorite ? "已收藏" : "收藏" }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { User, Star, StarFilled } from "@element-plus/icons-vue";

defineProps({
  survey: {
    type: Object,
    required: true
  },
  categoryName: {
    type: String,
    default: "未分类"
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  showFavorite: {
    type: Boolean,
    default: true
  }
});

defineEmits(['click', 'start', 'toggleFavorite']);
</script>

<style scoped>
.survey-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 200px;
}

.survey-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.survey-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  flex: 1;
  margin-right: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.survey-description {
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.survey-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.survey-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
}

.survey-actions {
  display: flex;
  gap: 8px;
}
</style>