<template>
  <div class="rating-page">
    <el-card class="header-card">
      <div class="page-header">
        <div class="header-icon">⭐</div>
        <div class="header-content">
          <h2>问卷评分排行榜</h2>
          <p>用户评分最高的优质问卷</p>
        </div>
      </div>
    </el-card>

    <el-card class="rankings-card" v-loading="loading">
      <!-- 榜单列表 -->
      <div class="rankings-list" v-if="rankings.length > 0">
        <div v-for="(survey, index) in rankings" :key="survey.id" class="ranking-item"
          :class="{ 'top-rank': index < 3 }">
          <div class="rank-badge" :class="`rank-${index + 1}`">
            <span v-if="index < 3" class="medal">{{ getMedalIcon(index) }}</span>
            <span v-else class="rank-number">{{ index + 1 }}</span>
          </div>

          <div class="survey-content">
            <div class="survey-main">
              <div class="survey-info">
                <h3 class="survey-title">{{ survey.title }}</h3>
                <p class="survey-description">{{ survey.description }}</p>

                <div class="survey-meta">
                  <el-tag type="primary" size="small">{{ survey.category }}</el-tag>
                  <span class="meta-item">
                    <el-icon>
                      <User />
                    </el-icon>
                    {{ survey.author }}
                  </span>
                  <span class="meta-item">
                    <el-icon>
                      <Clock />
                    </el-icon>
                    {{ survey.duration }}分钟
                  </span>
                </div>
              </div>
            </div>

            <div class="survey-stats">
              <div class="rating-box">
                <div class="rating-stars">
                  <el-rate v-model="survey.rating" disabled show-score text-color="#ff9900" score-template="{value}" />
                </div>
                <div class="rating-value">{{ survey.rating }} 分</div>
              </div>

              <div class="participation-info">
                <el-icon>
                  <User />
                </el-icon>
                <span>{{ survey.participants }} 人参与</span>
              </div>

              <el-button type="primary" @click="goToSurvey(survey.id)" class="participate-btn">
                立即参与
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && rankings.length === 0" description="暂无排行数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/index.js';
import { ElMessage } from 'element-plus';
import { User, Clock } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const rankings = ref([]);

// 获取奖牌图标
const getMedalIcon = (index) => {
  const medals = ['🥇', '🥈', '🥉'];
  return medals[index] || '';
};

// 加载排行榜数据
const loadRankings = async () => {
  loading.value = true;
  try {
    // 获取所有已发布的问卷，按评分降序排列
    const surveys = await apiClient.get('/surveys', {
      params: {
        status: 'published',
        _sort: 'rating',
        _order: 'desc',
        _limit: 20
      }
    });
    // 客户端再次排序确保正确（从大到小）
    rankings.value = surveys.sort((a, b) => b.rating - a.rating);
    console.log('评分排行榜数据:', rankings.value.map(s => ({ title: s.title, rating: s.rating })));
  } catch (error) {
    console.error('加载排行榜失败:', error);
    ElMessage.error('加载排行榜失败');
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

<style lang="scss" scoped>
.rating-page {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    border: none;

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
        }

        p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
  }

  .rankings-card {
    overflow: visible;
  }

  .rankings-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .ranking-item {
    display: flex;
    gap: 20px;
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #e4e7ed;
    transition: all 0.3s ease;
    background: white;

    &:hover {
      border-color: #fa709a;
      box-shadow: 0 8px 24px rgba(250, 112, 154, 0.2);
      transform: translateY(-3px);
    }

    &.top-rank {
      background: linear-gradient(135deg, #fff9e6 0%, #fffaf0 100%);
      border-width: 3px;
    }

    .rank-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      flex-shrink: 0;
      font-weight: 700;
      font-size: 24px;

      &.rank-1 {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
      }

      &.rank-2 {
        background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
        box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);
      }

      &.rank-3 {
        background: linear-gradient(135deg, #cd7f32 0%, #e6a87e 100%);
        box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4);
      }

      &:not(.rank-1):not(.rank-2):not(.rank-3) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .medal {
        font-size: 36px;
        line-height: 1;
      }

      .rank-number {
        font-size: 28px;
      }
    }

    .survey-content {
      flex: 1;
      display: flex;
      gap: 20px;
      justify-content: space-between;
      min-width: 0;

      .survey-main {
        flex: 1;
        display: flex;
        gap: 15px;
        min-width: 0;

        .survey-info {
          flex: 1;
          min-width: 0;

          .survey-title {
            font-size: 18px;
            font-weight: 700;
            color: #333;
            margin: 0 0 10px 0;
            line-height: 1.4;
          }

          .survey-description {
            font-size: 14px;
            color: #666;
            margin: 0 0 12px 0;
            line-height: 1.6;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .survey-meta {
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
          }
        }
      }

      .survey-stats {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-end;
        justify-content: space-between;
        min-width: 200px;

        .rating-box {
          text-align: center;

          .rating-stars {
            margin-bottom: 8px;
          }

          .rating-value {
            font-size: 24px;
            font-weight: 700;
            color: #fa709a;
          }
        }

        .participation-info {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          color: #666;
        }

        .participate-btn {
          width: 120px;
          height: 40px;
          font-weight: 600;
        }
      }
    }
  }

  /* 响应式 */
  @media (max-width: 1200px) {
    .survey-content {
      flex-direction: column;
    }

    .survey-stats {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      min-width: 100%;
    }
  }

  @media (max-width: 768px) {
    .ranking-item {
      flex-direction: column;
      gap: 15px;
    }

    .rank-badge {
      width: 50px;
      height: 50px;
      align-self: flex-start;
    }

    .survey-main {
      flex-direction: column;
    }

    .survey-stats {
      flex-direction: column;
      align-items: stretch;
    }

    .participate-btn {
      width: 100%;
    }
  }
}
</style>