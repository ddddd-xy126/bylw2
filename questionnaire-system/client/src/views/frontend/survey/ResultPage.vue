<template>
  <div class="survey-result-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="handleGoBack">
        <template #content>
          <div class="header-content">
            <h2>测评报告</h2>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>测评报告</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </template>
      </el-page-header>
    </div>

    <div class="result-container" v-loading="loading">
      <!-- 报告内容区域 -->
      <el-card class="report-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-info">
              <h3>{{ reportData.surveyTitle || '问卷标题' }}</h3>
              <p>{{ reportData.category || '问卷分类' }}</p>
            </div>
            <div class="header-actions">
              <el-button type="primary" :icon="Download" @click="downloadReport">
                下载报告
              </el-button>
            </div>
          </div>
        </template>

        <!-- 报告概览 -->
        <div class="report-overview">
          <el-row :gutter="24">
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-icon">
                  <el-icon color="#67C23A"><CircleCheck /></el-icon>
                </div>
                <div class="item-content">
                  <div class="item-label">完成时间</div>
                  <div class="item-value">{{ formatDateTime(reportData.submittedAt) }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-icon">
                  <el-icon color="#409EFF"><Timer /></el-icon>
                </div>
                <div class="item-content">
                  <div class="item-label">答题用时</div>
                  <div class="item-value">{{ formatDuration(reportData.duration) }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-icon">
                  <el-icon color="#E6A23C"><TrophyBase /></el-icon>
                </div>
                <div class="item-content">
                  <div class="item-label">测评得分</div>
                  <div class="item-value score">{{ reportData.score || 0 }} 分</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-icon">
                  <el-icon color="#F56C6C"><Document /></el-icon>
                </div>
                <div class="item-content">
                  <div class="item-label">题目数量</div>
                  <div class="item-value">{{ reportData.totalQuestions || 0 }} 题</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 评估结果 -->
        <div class="evaluation-result" v-if="reportData.result">
          <el-divider content-position="left">
            <el-icon><Medal /></el-icon>
            <span style="margin-left: 8px;">评估结果</span>
          </el-divider>
          <div class="result-content">
            <el-alert
              :title="reportData.result"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>{{ reportData.resultDescription || '恭喜您完成测评！' }}</p>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 答题详情预览 -->
        <div class="answer-preview" v-if="reportData.answers && reportData.answers.length > 0">
          <el-divider content-position="left">
            <el-icon><List /></el-icon>
            <span style="margin-left: 8px;">答题详情</span>
          </el-divider>
          <div class="answers-grid">
            <div 
              v-for="(answer, index) in reportData.answers" 
              :key="index" 
              class="answer-card"
            >
              <div class="answer-header">
                <span class="question-num">Q{{ index + 1 }}</span>
                <span class="question-text">{{ answer.question || '题目' }}</span>
              </div>
              <div class="answer-body">
                <el-icon><Check /></el-icon>
                <span>{{ formatAnswer(answer.answer) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 评价区域 -->
      <el-card class="rating-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>
              <el-icon><ChatDotRound /></el-icon>
              <span style="margin-left: 8px;">问卷评价</span>
            </h3>
            <el-tag v-if="myRating" type="success" size="small">已评价</el-tag>
          </div>
        </template>

        <!-- 已有评价的展示 -->
        <div v-if="myRating && !isEditing" class="my-rating-display">
          <div class="rating-show">
            <span class="label">我的评分：</span>
            <el-rate :model-value="myRating.rating" disabled show-score :size="24" />
          </div>
          <div class="comment-show">
            <span class="label">评论内容：</span>
            <p class="comment-text">{{ myRating.content }}</p>
          </div>
          <div class="rating-actions">
            <el-button type="primary" size="small" @click="startEdit">
              <el-icon><Edit /></el-icon>
              修改评价
            </el-button>
            <el-button type="danger" size="small" @click="deleteRating">
              <el-icon><Delete /></el-icon>
              删除评价
            </el-button>
          </div>
        </div>

        <!-- 评价表单 -->
        <div v-else class="rating-form">
          <el-form label-width="80px">
            <el-form-item label="评分" required>
              <div class="rating-input">
                <el-rate 
                  v-model="ratingForm.rating" 
                  :size="32"
                  show-text
                  :texts="['极差', '失望', '一般', '满意', '惊喜']"
                />
              </div>
            </el-form-item>
            <el-form-item label="评论" required>
              <el-input
                v-model="ratingForm.content"
                type="textarea"
                :rows="4"
                placeholder="分享您对这个问卷的看法... (至少10个字)"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                @click="submitRating" 
                :loading="submitting"
                :disabled="!canSubmit"
                size="large"
              >
                <el-icon v-if="!submitting"><ChatLineRound /></el-icon>
                {{ myRating ? '保存修改' : '发表评价' }}
              </el-button>
              <el-button 
                v-if="myRating" 
                @click="cancelEdit" 
                size="large"
              >
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Download,
  CircleCheck,
  Timer,
  TrophyBase,
  Document,
  Medal,
  List,
  Check,
  ChatDotRound,
  Edit,
  Delete,
  ChatLineRound
} from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user';
import { 
  createCommentApi, 
  updateCommentApi, 
  deleteCommentApi, 
  getUserCommentApi,
  getUserAnswerApi 
} from '@/api/survey';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const reportData = ref({});
const myRating = ref(null);
const isEditing = ref(false);
const submitting = ref(false);

const ratingForm = ref({
  rating: 5,
  content: ''
});

// 计算属性
const canSubmit = computed(() => {
  return ratingForm.value.content.trim().length > 0;
});

// 方法
const handleGoBack = () => {
  router.back();
};

const formatDateTime = (date) => {
  if (!date) return '未知时间';
  return new Date(date).toLocaleString('zh-CN');
};

const formatDuration = (duration) => {
  if (!duration) return '0分0秒';
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}分${seconds}秒`;
};

const formatAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.join('、');
  }
  return answer || '未作答';
};

const downloadReport = () => {
  ElMessage.info('报告下载功能开发中...');
};

const startEdit = () => {
  ratingForm.value = {
    rating: myRating.value.rating,
    content: myRating.value.content
  };
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  ratingForm.value = {
    rating: 5,
    content: ''
  };
};

// 提交评价
const submitRating = async () => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再发表评价');
    router.push(`/login?redirect=/survey/result/${route.params.id}`);
    return;
  }

  if (!ratingForm.value.content.trim()) {
    ElMessage.warning('请填写评论内容');
    return;
  }

  submitting.value = true;
  try {
    const userId = userStore.profile?.id || userStore.userId;
    const username = userStore.profile?.nickname || userStore.profile?.username || userStore.userName;
    const surveyId = reportData.value.surveyId;

    if (myRating.value) {
      // 更新已有评价
      await updateCommentApi(surveyId, userId, {
        rating: ratingForm.value.rating,
        content: ratingForm.value.content
      });

      myRating.value = {
        ...myRating.value,
        rating: ratingForm.value.rating,
        content: ratingForm.value.content,
        updatedAt: new Date().toISOString()
      };
      
      isEditing.value = false;
      ElMessage.success('评价已更新');
    } else {
      // 创建新评价
      const newComment = await createCommentApi(surveyId, {
        userId: userId,
        username: username,
        avatar: userStore.profile?.avatar || '',
        rating: ratingForm.value.rating,
        content: ratingForm.value.content
      });

      myRating.value = newComment;
      ElMessage.success('评价发表成功');
    }
  } catch (error) {
    console.error('提交评价失败:', error);
    ElMessage.error('操作失败：' + error.message);
  } finally {
    submitting.value = false;
  }
};

// 删除评价
const deleteRating = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此评价吗？删除后不可恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const userId = userStore.profile?.id || userStore.userId;
    const surveyId = reportData.value.surveyId;
    
    await deleteCommentApi(surveyId, userId);

    myRating.value = null;
    ratingForm.value = { rating: 5, content: '' };
    ElMessage.success('评价已删除');
  } catch (err) {
    if (err && (err === 'cancel' || err.type === 'cancel')) return;
    ElMessage.error('删除失败：' + (err.message || err));
  }
};

// 加载报告数据
const loadReportData = async () => {
  loading.value = true;
  try {
    const answerId = route.params.id;
    
    // 尝试从URL参数获取surveyId和userId
    const surveyId = route.query.surveyId;
    const userId = userStore.profile?.id || userStore.userId;
    
    if (surveyId && userId) {
      // 从问卷的answers中获取用户的答题记录
      const userAnswer = await getUserAnswerApi(surveyId, userId);
      if (userAnswer) {
        reportData.value = userAnswer;
        await loadMyRating();
        loading.value = false;
        return;
      }
    }
    
    // 兼容旧的answerId方式（从独立的answers表查询）
    const response = await fetch(`http://localhost:3002/answers/${answerId}`);
    if (!response.ok) throw new Error('报告不存在');
    
    const data = await response.json();
    reportData.value = data;

    // 加载用户的评价
    await loadMyRating();
  } catch (error) {
    console.error('加载报告失败:', error);
    ElMessage.error('加载报告失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

// 加载我的评价
const loadMyRating = async () => {
  try {
    const userId = userStore.profile?.id || userStore.userId;
    const surveyId = reportData.value.surveyId;

    if (!surveyId || !userId) return;

    const comment = await getUserCommentApi(surveyId, userId);
    myRating.value = comment;
  } catch (error) {
    console.error('加载评价失败:', error);
  }
};

// 生命周期
onMounted(() => {
  loadReportData();
});
</script>

<style lang="scss" scoped>
.survey-result-page {
  min-height: 100vh;
  background: var(--theme-background-color);
  padding: 20px;

  .page-header {
    background: linear-gradient(135deg, var(--color-primary-light-3) 0%, var(--color-primary) 100%);
    padding: var(--spacing-lg) var(--spacing-xl);
    margin-bottom: 24px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);

    :deep(.el-page-header) {
      .el-page-header__back {
        color: var(--text-inverse);
        font-weight: var(--font-weight-semibold);
        transition: all var(--transition-base);
        
        &:hover {
          color: var(--color-primary-dark-4);
          transform: translateX(-4px);
        }

        .el-icon {
          font-size: var(--font-size-lg);
        }
      }

      .el-page-header__content {
        color: var(--text-inverse);
      }
    }

    .header-content {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--text-inverse);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .el-breadcrumb {
        :deep(.el-breadcrumb__separator) {
          color: rgba(255, 255, 255, 0.7);
        }

        :deep(.el-breadcrumb__inner) {
          color: rgba(255, 255, 255, 0.9);
          font-weight: var(--font-weight-medium);
          transition: color var(--transition-base);

          &:hover {
            color: var(--text-inverse);
          }

          &.is-link:hover {
            color: var(--color-primary-dark-4);
          }
        }
      }
    }
  }

  .result-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-info {
        h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .report-card {
      border-radius: 12px;

      .report-overview {
        margin-bottom: 24px;

        .overview-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          transition: all 0.3s;

          &:hover {
            background: #f0f2f5;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .item-icon {
            font-size: 32px;
          }

          .item-content {
            flex: 1;

            .item-label {
              font-size: 13px;
              color: #909399;
              margin-bottom: 4px;
            }

            .item-value {
              font-size: 20px;
              font-weight: 600;
              color: #303133;

              &.score {
                color: #E6A23C;
                font-size: 24px;
              }
            }
          }
        }
      }

      .evaluation-result {
        margin: 24px 0;

        .result-content {
          .el-alert {
            border-radius: 8px;

            p {
              margin: 8px 0 0 0;
              line-height: 1.6;
            }
          }
        }
      }

      .answer-preview {
        .answers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          margin-top: 16px;

          .answer-card {
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #67C23A;

            .answer-header {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              margin-bottom: 12px;

              .question-num {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 28px;
                height: 28px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                flex-shrink: 0;
              }

              .question-text {
                flex: 1;
                font-size: 14px;
                font-weight: 500;
                color: #303133;
                line-height: 28px;
              }
            }

            .answer-body {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: white;
              border-radius: 6px;
              font-size: 14px;
              color: #606266;

              .el-icon {
                color: #67C23A;
                flex-shrink: 0;
              }
            }
          }
        }
      }
    }

    .rating-card {
      border-radius: 12px;

      .my-rating-display {
        .rating-show {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;

          .label {
            font-weight: 600;
            color: #303133;
          }
        }

        .comment-show {
          margin-bottom: 20px;

          .label {
            font-weight: 600;
            color: #303133;
            display: block;
            margin-bottom: 12px;
          }

          .comment-text {
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            color: #606266;
            line-height: 1.6;
            margin: 0;
          }
        }

        .rating-actions {
          display: flex;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f0f2f5;
        }
      }

      .rating-form {
        .rating-input {
          display: flex;
          align-items: center;
        }

        .el-textarea {
          .el-textarea__inner {
            border-radius: 8px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .survey-result-page {
    padding: 12px;

    .result-container {
      .report-overview {
        .el-row {
          .el-col {
            margin-bottom: 12px;
          }
        }
      }

      .answers-grid {
        grid-template-columns: 1fr !important;
      }
    }
  }
}
</style>
