<template>
  <div class="survey-card-enhanced" @click="$emit('click', survey.id)">
    <div class="card-badge">
      <span v-if="showHotBadge" class="hot-badge">🔥 热门</span>
      <span v-if="showNewBadge" class="new-badge">🆕 新品</span>
    </div>

    <div class="card-content">
      <h3 class="card-title">{{ survey.title }}</h3>
      <p class="card-description">{{ survey.description }}</p>

      <div class="card-meta">
        <div class="meta-item">
          <el-icon>
            <User />
          </el-icon>
          <span>{{ formatParticipants(survey.participantCount) }}</span>
        </div>
        <div class="meta-item">
          <el-icon>
            <Clock />
          </el-icon>
          <span>{{ survey.duration }}分钟</span>
        </div>
        <div class="meta-item rating">
          <el-rate
            :model-value="survey.rating || 0"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}"
          />
        </div>
      </div>

      <div class="card-tags">
        <el-tag
          v-for="tag in (survey.tags || []).slice(0, 3)"
          :key="tag"
          size="small"
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <div class="card-footer">
      <el-button
        type="primary"
        size="small"
        @click.stop="$emit('start', survey.id)"
      >
        开始测试
      </el-button>
      <el-button
        v-if="showFavoriteButton"
        size="small"
        :type="isFavorite ? 'warning' : 'default'"
        @click.stop="$emit('toggle-favorite', survey.id)"
      >
        <el-icon>
          <StarFilled v-if="isFavorite" />
          <Star v-else />
        </el-icon>
        {{ isFavorite ? "已收藏" : "收藏" }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Star, StarFilled, User, Clock } from "@element-plus/icons-vue";

const props = defineProps({
  survey: {
    type: Object,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  showFavoriteButton: {
    type: Boolean,
    default: true,
  },
  hotThreshold: {
    type: Number,
    default: 2000,
  },
  newDaysThreshold: {
    type: Number,
    default: 7,
  },
});

defineEmits(["click", "start", "toggle-favorite"]);

// 判断是否显示热门徽章
const showHotBadge = computed(() => {
  const participants = props.survey.participantCount || 0;
  return participants > props.hotThreshold;
});

// 判断是否显示新品徽章
const showNewBadge = computed(() => {
  if (!props.survey.createdAt) return false;
  const createdDate = new Date(props.survey.createdAt);
  const daysAgo = props.newDaysThreshold * 24 * 60 * 60 * 1000;
  return createdDate > new Date(Date.now() - daysAgo);
});

// 格式化参与人数
const formatParticipants = (num) => {
  if (!num) return "0";
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
};
</script>

<style lang="scss" scoped>
.survey-card-enhanced {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    border-color: var(--color-primary-light-1);
  }

  .card-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
  }

  .hot-badge {
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .new-badge {
    background: linear-gradient(45deg, #4ecdc4, #44a08d);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .card-content {
    margin-bottom: 20px;
    /* 保持卡片内容高度一致，避免因标题或描述长度不同导致布局错位 */
    min-height: 150px;

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      line-height: 1.4;
      padding-right: 80px; // 为徽章留出空间
      /* 固定标题高度为两行，超出使用省略号 */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-description {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 16px;
      /* 固定描述高度为两行，超出使用省略号 */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.85rem;
        color: #888;
      }

      .meta-item.rating {
        margin-left: auto;
      }
    }

    .card-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
  }

  .card-footer {
    display: flex;
    gap: 12px;
    justify-content: space-between;

    .el-button {
      flex: 1;
    }

    .el-button--warning {
      background: linear-gradient(135deg, #fadb14 0%, #ffd666 100%);
      border-color: #fadb14;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #ffd666 0%, #fadb14 100%);
        transform: scale(1.05);
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    padding: 20px;

    .card-title {
      font-size: 1.1rem;
    }

    .card-meta {
      gap: 12px;
    }

    .card-footer {
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>
