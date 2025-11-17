<template>
  <div class="participation-page">
    <el-card class="header-card">
      <div class="page-header">
        <div class="header-icon">📊</div>
        <div class="header-content">
          <h2>参与人数排行榜</h2>
          <p>最受欢迎的问卷排行</p>
        </div>
      </div>
    </el-card>

    <el-card class="rankings-card" v-loading="loading">
      <!-- 前三名特殊展示 -->
      <div class="top-three" v-if="topThree.length > 0">
        <div
          v-for="(survey, index) in topThree"
          :key="survey.id"
          class="top-item"
          :class="`rank-${index + 1}`"
        >
          <div class="medal">
            <span class="medal-icon">{{ getMedalIcon(index) }}</span>
            <span class="rank-number">#{{ index + 1 }}</span>
          </div>
          <div class="survey-card">
            <div class="survey-info">
              <h3 class="survey-title">{{ survey.title }}</h3>
              <p class="survey-description">{{ survey.description }}</p>
              <div class="survey-meta">
                <el-tag type="primary" size="small">{{
                  survey.category
                }}</el-tag>
                <el-tag type="warning" size="small">
                  <el-icon><Star /></el-icon>
                  {{ survey.rating }}
                </el-tag>
              </div>
              <div class="participation-stats">
                <div class="stat-item">
                  <el-icon><User /></el-icon>
                  <span class="stat-value">{{ survey.participantCount }}</span>
                  <span class="stat-label">参与人数</span>
                </div>
                <div class="stat-item">
                  <el-icon><Clock /></el-icon>
                  <span class="stat-value">{{ survey.duration }}分钟</span>
                </div>
              </div>
            </div>
          </div>
          <el-button
            type="primary"
            class="participate-btn"
            @click="goToSurvey(survey.id)"
          >
            立即参与
          </el-button>
        </div>
      </div>

      <!-- 4-10名列表展示 -->
      <div class="rankings-list" v-if="otherRankings.length > 0">
        <div class="list-header">
          <span class="col-rank">排名</span>
          <span class="col-survey">问卷信息</span>
          <span class="col-participants">参与人数</span>
          <span class="col-rating">评分</span>
          <span class="col-action">操作</span>
        </div>
        <div
          v-for="(survey, index) in otherRankings"
          :key="survey.id"
          class="list-item"
        >
          <div class="col-rank">
            <span class="rank-badge">{{ index + 4 }}</span>
          </div>
          <div class="col-survey">
            <div class="survey-brief">
              <div class="brief-info">
                <h4 class="brief-title">{{ survey.title }}</h4>
                <div class="brief-meta">
                  <el-tag type="info" size="small">{{
                    survey.category
                  }}</el-tag>
                  <span class="brief-author">{{ survey.author }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-participants">
            <div class="participants-count">
              <el-icon><User /></el-icon>
              <span class="count-number">{{ survey.participantCount }}</span>
            </div>
          </div>
          <div class="col-rating">
            <div class="rating-display">
              <el-icon color="#fadb14"><Star /></el-icon>
              <span class="rating-number">{{ survey.averageRating }}</span>
            </div>
          </div>
          <div class="col-action">
            <el-button
              type="primary"
              size="small"
              @click="goToSurvey(survey.id)"
            >
              参与问卷
            </el-button>
          </div>
        </div>
      </div>

      <el-empty
        v-if="!loading && rankings.length === 0"
        description="暂无排行数据"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/index.js";
import { ElMessage } from "element-plus";
import { Star, User, Clock } from "@element-plus/icons-vue";

const router = useRouter();
const loading = ref(false);
const rankings = ref([]);

// 前三名
const topThree = computed(() => rankings.value.slice(0, 3));

// 4-10名
const otherRankings = computed(() => rankings.value.slice(3, 10));

// 获取奖牌图标
const getMedalIcon = (index) => {
  const medals = ["🥇", "🥈", "🥉"];
  return medals[index] || "";
};

// 加载排行榜数据
const loadRankings = async () => {
  loading.value = true;
  try {
    // 获取所有已发布的问卷
    const surveys = await apiClient.get("/surveys", {
      params: {
        status: "published",
        _sort: "participants",
        _order: "desc",
        _limit: 10,
      },
    });
    // 客户端再次排序确保正确（从大到小）
    rankings.value = surveys.sort(
      (a, b) => (b.participantCount || 0) - (a.participantCount || 0)
    );
    console.log(
      "参与排行榜数据:",
      rankings.value.map((s) => ({
        title: s.title,
        participantCount: s.participantCount,
      }))
    );
  } catch (error) {
    console.error("加载排行榜失败:", error);
    ElMessage.error("加载排行榜失败");
  } finally {
    loading.value = false;
  }
};

// 跳转到问卷详情
const goToSurvey = (surveyId) => {
  router.push(`/surveys/${surveyId}`);
};

onMounted(() => {
  loadRankings();
});
</script>

<style scoped lang="scss">
.participation-page {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
  background: linear-gradient(
    135deg,
    var(--color-primary-light-3) 0%,
    var(--color-primary) 100%
  );
  border: none;
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-lg);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;

  .header-icon {
    font-size: 48px;
    line-height: 1;
  }

  .header-content {
    h2 {
      margin: 0 0 5px 0;
      font-size: 28px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    p {
      margin: 0;
      font-size: 14px;
      opacity: 0.95;
    }
  }
}

.rankings-card {
  overflow: visible;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
}

/* 前三名特殊展示 */
.top-three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.top-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px;

  &.rank-1 {
    .medal {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    }
  }

  &.rank-2 {
    .medal {
      background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    }
  }

  &.rank-3 {
    .medal {
      background: linear-gradient(135deg, #cd7f32 0%, #e6a87e 100%);
    }
  }

  .medal {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);

    .medal-icon {
      font-size: 32px;
      line-height: 1;
    }

    .rank-number {
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }
  }
}

.survey-card {
  flex: 1;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
  background: white;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-primary);
    transform: translateY(-5px);
  }

  .survey-info {
    padding: 15px;

    .survey-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 10px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .survey-description {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0 0 12px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .survey-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .participation-stats {
      display: flex;
      gap: 15px;
      padding-top: 12px;
      border-top: 1px solid #e4e7ed;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        color: #666;

        .stat-value {
          font-weight: 700;
          color: #333;
        }

        .stat-label {
          font-size: 12px;
        }
      }
    }
  }

  .participate-btn {
    width: 100%;
    height: 40px;
    font-size: 15px;
    font-weight: 600;
  }
}

/* 4-10名列表 */
.rankings-list {
  background: white;

  .list-header {
    display: grid;
    grid-template-columns: 80px 1fr 150px 120px 150px;
    gap: 15px;
    padding: 15px 20px;
    background: #f6f8fb;
    border-radius: 8px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;

    @media (max-width: 1200px) {
      grid-template-columns: 60px 1fr 120px 100px 120px;
      gap: 10px;
      padding: 12px 15px;
    }

    @media (max-width: 768px) {
      display: none;
    }
  }

  .list-item {
    display: grid;
    grid-template-columns: 80px 1fr 150px 120px 150px;
    gap: 15px;
    padding: 15px 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
    align-items: center;

    @media (max-width: 1200px) {
      grid-template-columns: 60px 1fr 120px 100px 120px;
      gap: 10px;
      padding: 12px 15px;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    &:hover {
      background: #f6f8fb;
      transform: translateX(5px);
    }

    .col-rank {
      text-align: center;

      @media (max-width: 768px) {
        text-align: left;
      }

      .rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 700;
        font-size: 16px;
      }
    }

    .survey-brief {
      display: flex;
      gap: 12px;
      align-items: center;

      /* thumbnails removed: layout uses brief-info only */

      .brief-info {
        flex: 1;
        min-width: 0;

        .brief-title {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin: 0 0 5px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .brief-meta {
          display: flex;
          gap: 10px;
          align-items: center;

          .brief-author {
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }

    .participants-count {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 700;
      color: #667eea;

      @media (max-width: 768px) {
        justify-content: flex-start;
      }

      .count-number {
        font-size: 20px;
      }
    }

    .rating-display {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 16px;
      font-weight: 600;
      color: #fadb14;

      @media (max-width: 768px) {
        justify-content: flex-start;
      }

      .rating-number {
        color: #333;
      }
    }

    .col-action {
      @media (max-width: 768px) {
        justify-content: flex-start;
      }
    }
  }
}
</style>
