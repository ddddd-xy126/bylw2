<template>
  <div class="survey-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="$router.back()">
        <template #content>
          <div class="header-content">
            <span class="header-title">问卷详情</span>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
              >
              <el-breadcrumb-item>问卷详情</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </template>
      </el-page-header>
    </div>

    <div class="detail-container" v-loading="loading">
      <!-- 问卷基本信息 -->
      <div class="main-content">
        <el-card class="survey-info-card" shadow="hover">
          <div class="survey-header">
            <div class="header-left">
              <h1 class="survey-title">{{ detail.title || "问卷标题" }}</h1>
              <div class="survey-meta">
                <el-tag :type="getStatusTagType(detail.status)" size="small">
                  {{ getStatusText(detail.status) }}
                </el-tag>
                <span class="meta-item">
                  <el-icon>
                    <User />
                  </el-icon>
                  {{ detail.creator?.nickname || detail.author || "匿名作者" }}
                </span>
                <span class="meta-item">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  {{ formatDate(detail.createdAt) }}
                </span>
                <span class="meta-item" v-if="detail.Category">
                  <el-icon>
                    <Tag />
                  </el-icon>
                  {{ detail.Category.name }}
                </span>
              </div>
            </div>
            <div class="header-right">
              <el-button
                type="primary"
                size="large"
                :loading="startLoading"
                @click="startSurvey"
              >
                <el-icon>
                  <CaretRight />
                </el-icon>
                开始测试
              </el-button>
            </div>
          </div>

          <div class="survey-description">
            <p>{{ detail.description || "暂无描述" }}</p>
          </div>

          <!-- 统计信息 -->
          <div class="stats-section">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon color="#67d474d5">
                      <User />
                    </el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">
                      {{ detail.participantCount || 0 }}
                    </div>
                    <div class="stat-label">参与人数</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon color="#67C23A">
                      <Clock />
                    </el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">
                      {{ detail.estimatedTime || 5 }}分钟
                    </div>
                    <div class="stat-label">预计用时</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon color="#E6A23C">
                      <Document />
                    </el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ getQuestionCount() }}</div>
                    <div class="stat-label">题目数量</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon color="#F56C6C">
                      <Star />
                    </el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">
                      {{ detail.averageRating || 4.5 }}
                    </div>
                    <div class="stat-label">平均评分</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <!-- 问题预览 -->
        <el-card class="questions-preview-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>
                <el-icon>
                  <List />
                </el-icon>
                问题预览
              </h3>
              <span class="question-count"
                >共 {{ getQuestionCount() }} 道题</span
              >
            </div>
          </template>

          <div class="questions-overview">
            <div class="question-types">
              <div
                class="type-item"
                v-for="type in questionTypes"
                :key="type.type"
              >
                <div class="type-icon">
                  <el-icon>
                    <component :is="type.icon" />
                  </el-icon>
                </div>
                <div class="type-info">
                  <div class="type-name">{{ type.name }}</div>
                  <div class="type-count">{{ type.count }} 题</div>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="sample-questions">
              <div
                v-for="(question, index) in getSampleQuestions()"
                :key="question.id"
                class="sample-question"
              >
                <div class="question-number">{{ index + 1 }}.</div>
                <div class="question-content">
                  <div class="question-title">
                    {{ question.title || question.content }}
                  </div>
                  <div class="question-type-tag">
                    <el-tag
                      size="small"
                      :type="getQuestionTypeColor(question.type)"
                    >
                      {{ getQuestionTypeName(question.type) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="view-all-questions"
              v-if="(detail.questions || []).length > 3"
            >
              <el-button
                type="text"
                @click="showAllQuestions = !showAllQuestions"
              >
                {{ showAllQuestions ? "收起" : "查看全部题目" }}
                <el-icon>
                  <component :is="showAllQuestions ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 评论区域 -->
        <el-card class="comments-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>
                <el-icon>
                  <ChatLineRound />
                </el-icon>
                用户评价
              </h3>
              <span class="comment-count"
                >{{ comments.total || 0 }} 条评论</span
              >
            </div>
          </template>

          <!-- 评价统计 -->
          <div class="rating-summary">
            <div class="rating-overview">
              <div class="overall-rating">
                <div class="rating-score">{{ detail.averageRating || 0 }}</div>
                <el-rate
                  :model-value="detail.averageRating || 0"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
                <div class="rating-count">
                  {{ detail.ratingCount || 0 }} 人评价
                </div>
              </div>
              <div class="rating-distribution">
                <div v-for="i in 5" :key="i" class="rating-bar">
                  <span class="star-count">{{ 6 - i }}星</span>
                  <el-progress
                    :percentage="getRatingPercentage(6 - i)"
                    :stroke-width="8"
                    :show-text="false"
                    color="#67d474"
                  />
                  <span class="percentage"
                    >{{ getRatingPercentage(6 - i) }}%</span
                  >
                </div>
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 评价提示 -->
          <div class="comment-tip">
            <el-alert title="温馨提示" type="info" :closable="false" show-icon>
              <template #default>
                <p>完成问卷答题后，您可以在测评报告页面发表评价和打分。</p>
              </template>
            </el-alert>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list" v-loading="loadingComments">
            <div
              v-for="comment in comments.list"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-avatar">
                <el-avatar :src="comment.avatar" :size="40">
                  {{ comment.username?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.username }}</span>
                  <el-rate :model-value="comment.rating" disabled :size="16" />
                  <span class="comment-time">{{
                    formatDate(comment.createdAt)
                  }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
              </div>
            </div>

            <el-empty
              v-if="!comments.list?.length && !loadingComments"
              description="暂无评论"
              :image-size="80"
            />
          </div>
        </el-card>
      </div>

      <!-- 侧边栏 -->
      <div class="sidebar">
        <!-- 快速操作 -->
        <el-card class="action-card" shadow="hover">
          <template #header>
            <h4>快速操作</h4>
          </template>
          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              block
              :loading="startLoading"
              @click="startSurvey"
            >
              <el-icon>
                <CaretRight />
              </el-icon>
              开始测试
            </el-button>
            <el-button
              type="success"
              size="default"
              block
              @click="toggleFavorite"
              :loading="favoriteLoading"
            >
              <el-icon>
                <Star />
              </el-icon>
              {{ detail.isFavorite ? "取消收藏" : "收藏问卷" }}
            </el-button>
            <el-button
              type="info"
              size="default"
              block
              @click="shareQuestionnaire"
            >
              <el-icon>
                <Share />
              </el-icon>
              分享问卷
            </el-button>
          </div>
        </el-card>

        <!-- 作者信息 -->
        <el-card class="author-card" shadow="hover" v-if="detail.creator">
          <template #header>
            <h4>作者信息</h4>
          </template>
          <div class="author-info">
            <div class="author-avatar">
              <el-avatar :src="detail.creator.avatar" :size="60">
                {{ detail.creator.nickname?.charAt(0) }}
              </el-avatar>
            </div>
            <div class="author-details">
              <div class="author-name">{{ detail.creator.nickname }}</div>
              <div class="author-stats">
                <div class="stat">
                  <span class="label">创建问卷</span>
                  <span class="value">{{
                    detail.creator.surveyCount || 0
                  }}</span>
                </div>
                <div class="stat">
                  <span class="label">获得赞数</span>
                  <span class="value">{{ detail.creator.likeCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 相关推荐 -->
        <el-card class="recommend-card" shadow="hover">
          <template #header>
            <div class="card-header-with-icon">
              <el-icon><Collection /></el-icon>
              <h4>相关推荐</h4>
            </div>
          </template>
          <div class="recommend-list">
            <div
              v-for="survey in recommendedSurveys"
              :key="survey.id"
              class="recommend-item"
              @click="navigateToSurvey(survey.id)"
            >
              <div class="recommend-content">
                <div class="recommend-header">
                  <h5 class="recommend-title">{{ survey.title }}</h5>
                  <el-tag size="small" type="success" effect="plain"
                    >推荐</el-tag
                  >
                </div>
                <div class="recommend-meta">
                  <span class="meta-info">
                    <el-icon><User /></el-icon>
                    {{ survey.participantCount || 0 }}人
                  </span>
                  <div class="rating-info">
                    <el-rate
                      :model-value="survey.averageRating || 4.0"
                      disabled
                      :size="14"
                      :show-score="false"
                    />
                    <span class="rating-text">{{
                      survey.averageRating || 4.0
                    }}</span>
                  </div>
                </div>
                <div class="recommend-actions">
                  <el-button
                    size="small"
                    type="primary"
                    text
                    @click.stop="quickStart(survey.id)"
                  >
                    <el-icon><CaretRight /></el-icon>
                    开始测试
                  </el-button>
                  <el-button
                    size="small"
                    type="success"
                    text
                    @click.stop="quickFavorite(survey.id)"
                  >
                    <el-icon><Star /></el-icon>
                    收藏
                  </el-button>
                </div>
              </div>
            </div>

            <el-empty
              v-if="recommendedSurveys.length === 0"
              description="暂无相关推荐"
              :image-size="80"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  User,
  Calendar,
  Promotion as Tag,
  CaretRight,
  Clock,
  Document,
  Star,
  List,
  ChatLineRound,
  Share,
  MoreFilled as More,
  Collection,
} from "@element-plus/icons-vue";

import {
  getSurveyDetail,
  getSurveyCommentsApi,
  createCommentApi,
  listSurveys,
} from "@/api/survey";
import { useUserStore } from "@/store/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const detail = ref({});
const comments = ref({ list: [], total: 0 });
const showAllQuestions = ref(false);
const startLoading = ref(false);
const favoriteLoading = ref(false);
const loadingComments = ref(false);

// 推荐问卷
const recommendedSurveys = ref([]);

// 计算属性
const questionTypes = computed(() => {
  const questions = detail.value.questions || [];
  const types = {};

  questions.forEach((q) => {
    const type = q.type || "single";
    types[type] = (types[type] || 0) + 1;
  });

  const typeMap = {
    single: { name: "单选题", icon: "CircleCheck" },
    multiple: { name: "多选题", icon: "More" },
    text: { name: "文本题", icon: "Edit" },
    rating: { name: "评分题", icon: "Star" },
  };

  return Object.entries(types).map(([type, count]) => ({
    type,
    count,
    ...(typeMap[type] || { name: "其他", icon: "Document" }),
  }));
});

// 方法
const getQuestionCount = () => {
  return (detail.value.questions || []).length;
};

const getSampleQuestions = () => {
  const questions = detail.value.questions || [];
  return showAllQuestions.value ? questions : questions.slice(0, 3);
};

const getStatusTagType = (status) => {
  const typeMap = {
    published: "success",
    draft: "info",
    closed: "danger",
  };
  return typeMap[status] || "info";
};

const getStatusText = (status) => {
  const textMap = {
    published: "进行中",
    draft: "草稿",
    closed: "已结束",
  };
  return textMap[status] || "未知";
};

const getQuestionTypeName = (type) => {
  const nameMap = {
    single: "单选题",
    multiple: "多选题",
    text: "文本题",
    rating: "评分题",
  };
  return nameMap[type] || "其他";
};

const getQuestionTypeColor = (type) => {
  const colorMap = {
    single: "primary",
    multiple: "success",
    text: "warning",
    rating: "danger",
  };
  return colorMap[type] || "info";
};

const getRatingPercentage = (rating) => {
  // 模拟评分分布数据
  const distribution = {
    5: 60,
    4: 25,
    3: 10,
    2: 3,
    1: 2,
  };
  return distribution[rating] || 0;
};

const formatDate = (date) => {
  if (!date) return "未知时间";
  return new Date(date).toLocaleDateString("zh-CN");
};

const startSurvey = async () => {
  startLoading.value = true;
  try {
    // 检查问卷是否已停止收集
    if (detail.value.isCollecting === false) {
      ElMessage.warning("该问卷已停止收集，暂时无法填写");
      return;
    }

    // 检查登录状态
    if (!userStore.isLoggedIn) {
      const result = await ElMessageBox.confirm(
        "开始测试需要登录，是否前往登录？",
        "提示",
        {
          confirmButtonText: "去登录",
          cancelButtonText: "取消",
          type: "info",
        }
      );
      if (result === "confirm") {
        router.push(`/login?redirect=/surveys/${route.params.id}`);
      }
      return;
    }

    // 跳转到答题页面
    router.push(`/surveys/answer/${route.params.id}`);
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("操作失败，请重试");
    }
  } finally {
    startLoading.value = false;
  }
};

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    return;
  }

  favoriteLoading.value = true;
  try {
    // 模拟收藏/取消收藏
    await new Promise((resolve) => setTimeout(resolve, 500));
    detail.value.isFavorite = !detail.value.isFavorite;
    ElMessage.success(detail.value.isFavorite ? "收藏成功" : "取消收藏成功");
  } catch (error) {
    ElMessage.error("操作失败，请重试");
  } finally {
    favoriteLoading.value = false;
  }
};

const shareQuestionnaire = () => {
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      ElMessage.success("链接已复制到剪贴板");
    })
    .catch(() => {
      ElMessage.error("复制失败，请手动复制链接");
    });
};

// 相关推荐跳转
const navigateToSurvey = (surveyId) => {
  router.push(`/surveys/${surveyId}`);
  // 重新加载数据
  window.location.reload();
};

// 快速开始测试
const quickStart = async (surveyId) => {
  if (!userStore.isLoggedIn) {
    const result = await ElMessageBox.confirm(
      "开始测试需要登录，是否前往登录？",
      "提示",
      {
        confirmButtonText: "去登录",
        cancelButtonText: "取消",
        type: "info",
      }
    ).catch(() => "cancel");

    if (result === "confirm") {
      router.push(`/login?redirect=/surveys/${surveyId}`);
    }
    return;
  }

  router.push(`/surveys/answer/${surveyId}`);
};

// 快速收藏
const quickFavorite = async (surveyId) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    return;
  }

  try {
    // 模拟收藏操作
    await new Promise((resolve) => setTimeout(resolve, 300));
    ElMessage.success("收藏成功");
  } catch (error) {
    ElMessage.error("收藏失败，请重试");
  }
};

const loadComments = async () => {
  loadingComments.value = true;
  try {
    const data = await getSurveyCommentsApi(route.params.id);
    comments.value = data;
  } catch (error) {
    console.error("加载评论失败:", error);
  } finally {
    loadingComments.value = false;
  }
};

// 加载推荐问卷
const loadRecommendedSurveys = async (category, currentId) => {
  try {
    // 获取所有问卷
    const allSurveys = await listSurveys();

    // 筛选相同分类且不是当前问卷的问卷
    let recommended = allSurveys
      .filter(
        (survey) =>
          survey.category === category &&
          survey.id !== currentId &&
          survey.status === "published"
      )
      // 按参与人数排序
      .sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))
      // 只取前3个
      .slice(0, 3);

    // 如果相同分类的问卷不足3个，用其他热门问卷补充
    if (recommended.length < 3) {
      const otherSurveys = allSurveys
        .filter(
          (survey) =>
            survey.id !== currentId &&
            survey.status === "published" &&
            !recommended.some((r) => r.id === survey.id)
        )
        .sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))
        .slice(0, 3 - recommended.length);

      recommended = [...recommended, ...otherSurveys];
    }

    recommendedSurveys.value = recommended;
  } catch (error) {
    console.error("加载推荐问卷失败:", error);
    recommendedSurveys.value = [];
  }
};

// 生命周期
onMounted(async () => {
  try {
    // 并行加载问卷详情和评论
    const [surveyData] = await Promise.all([
      getSurveyDetail(route.params.id),
      loadComments(),
    ]);

    detail.value = surveyData;

    // 加载推荐问卷（基于当前问卷的分类）
    await loadRecommendedSurveys(surveyData.category, surveyData.id);

    // 检查问卷是否已停止收集
    if (surveyData.isCollecting === false) {
      ElMessage.warning("该问卷已停止收集，暂时无法填写");
    }
  } catch (error) {
    ElMessage.error("加载问卷详情失败：" + error.message);
    console.error("加载详情失败:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.survey-detail-page {
  min-height: 100vh;
  background: var(--theme-background-color);
  padding: 30px 285px;

  // ===== 页面头部 =====
  .page-header {
    background: linear-gradient(
      135deg,
      var(--color-primary-light-3) 0%,
      var(--color-primary) 100%
    );
    padding: var(--spacing-lg) var(--spacing-xl);
    margin-bottom: var(--spacing-lg);
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
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-title {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--text-inverse);
        margin-right: var(--spacing-md);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .el-breadcrumb {
        font-size: var(--font-size-sm);

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

  // ===== 主体布局 =====
  .detail-container {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: var(--spacing-lg);

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }

  // ===== 主内容区 =====
  .main-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);

    .el-card {
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-base);
      transition: transform var(--transition-base),
        box-shadow var(--transition-base);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
    }
  }

  // ===== 问卷信息卡 =====
  .survey-info-card {
    .survey-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);

      .header-left {
        .survey-title {
          font-size: var(--font-size-2xl);
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .survey-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          color: var(--text-secondary);
          font-size: var(--font-size-sm);

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .el-tag {
            background-color: var(--bg-primary-light);
            border: 1px solid var(--color-primary);
            color: var(--color-primary);
          }
        }
      }

      .header-right {
        .el-button {
          border-radius: var(--radius-md);
          background-color: var(--color-primary);
          color: var(--text-inverse);
          transition: background-color var(--transition-fast);

          &:hover {
            background-color: var(--color-primary-light-2);
          }
        }
      }
    }

    .survey-description {
      margin-top: var(--spacing-md);
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--bg-primary-light);
      border-radius: var(--radius-base);
      color: var(--text-secondary);
      line-height: 1.6;
    }

    // 统计卡片
    .stats-section {
      margin-top: var(--spacing-lg);

      .stat-card {
        display: flex;
        align-items: center;
        background-color: var(--bg-primary-light);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-sm);
        transition: transform var(--transition-fast),
          box-shadow var(--transition-fast);

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          font-size: 26px;
          margin-right: var(--spacing-md);
          color: var(--color-primary);
        }

        .stat-content {
          .stat-number {
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-semibold);
            color: var(--text-primary);
          }
          .stat-label {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  // ===== 问题预览卡 =====
  .questions-preview-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        font-size: var(--font-size-lg);
        color: var(--color-primary-dark-2);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .question-count {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
      }
    }

    .type-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: var(--bg-primary-medium);
      }

      .type-icon {
        margin-right: var(--spacing-sm);
        font-size: 20px;
        color: var(--color-primary);
      }

      .type-info {
        .type-name {
          font-weight: var(--font-weight-medium);
        }
        .type-count {
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
        }
      }
    }

    .sample-question {
      display: flex;
      align-items: flex-start;
      margin-bottom: var(--spacing-sm);
      .question-number {
        color: var(--color-primary);
        font-weight: var(--font-weight-semibold);
        margin-right: var(--spacing-sm);
      }
      .question-content {
        flex: 1;
        .question-title {
          color: var(--text-primary);
          margin-bottom: 2px;
        }
      }
    }

    .view-all-questions {
      text-align: center;
      margin-top: var(--spacing-md);

      .el-button {
        color: var(--color-primary);
        font-weight: var(--font-weight-medium);
      }
    }
  }

  // ===== 评论区 =====
  .comments-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--font-size-lg);
        color: var(--color-primary-dark-2);
      }

      .comment-count {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }
    }

    .rating-summary {
      background-color: var(--bg-primary-light);
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .comment-form {
      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .login-prompt {
        padding: 32px 0;
      }

      .comment-input-form {
        .rating-input {
          display: flex;
          align-items: center;
          gap: 12px;

          .el-rate {
            height: 32px;
          }
        }

        .el-textarea {
          .el-textarea__inner {
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.6;
          }
        }
      }

      .cannot-comment-hint {
        margin: 16px 0;

        .el-alert {
          border-radius: 8px;

          p {
            margin: 8px 0;
            color: #606266;
            line-height: 1.6;
          }
        }
      }
    }

    .comment-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-light);
      transition: background-color 0.2s;

      &:hover {
        background-color: #f8f9fa;
        padding-left: 12px;
        padding-right: 12px;
        margin-left: -12px;
        margin-right: -12px;
        border-radius: 8px;
      }

      &:last-child {
        border-bottom: none;
      }

      .comment-avatar {
        flex-shrink: 0;
      }

      .comment-content {
        flex: 1;

        .comment-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .comment-author {
            font-weight: var(--font-weight-medium);
            color: var(--text-primary);
            font-size: 15px;
          }

          .comment-time {
            color: var(--text-tertiary);
            font-size: var(--font-size-xs);
            margin-left: auto;
          }
        }

        .comment-text {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 14px;
        }
      }
    }
  }

  // ===== 侧边栏 =====
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);

    .el-card {
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-base);
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .el-button {
        font-weight: var(--font-weight-medium);
        transition: all 0.3s ease;
        border-radius: 10px;
        padding: 12px 20px;
        font-size: 15px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }

      .el-button--primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;

        &:hover {
          background: linear-gradient(135deg, #5568d3 0%, #6a3f8e 100%);
        }
      }

      .el-button--success {
        background: linear-gradient(135deg, #67c23a 0%, #409eff 100%);
        border: none;

        &:hover {
          background: linear-gradient(135deg, #5daf34 0%, #3a8ee6 100%);
        }
      }

      .el-button--info {
        background: linear-gradient(135deg, #909399 0%, #606266 100%);
        border: none;

        &:hover {
          background: linear-gradient(135deg, #82848a 0%, #565a5e 100%);
        }
      }
    }

    .author-card {
      .author-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .author-details {
          .author-name {
            font-weight: var(--font-weight-semibold);
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .author-stats {
            display: flex;
            gap: var(--spacing-lg);
            font-size: var(--font-size-sm);

            .label {
              color: var(--text-secondary);
            }
            .value {
              color: var(--color-primary);
              font-weight: var(--font-weight-semibold);
            }
          }
        }
      }
    }

    .recommend-list {
      .recommend-item {
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 12px;
        border: 1px solid var(--border-light);
        cursor: pointer;
        transition: all var(--transition-fast);
        background: white;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        .recommend-content {
          .recommend-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;

            .recommend-title {
              flex: 1;
              font-size: 15px;
              font-weight: 600;
              color: var(--text-primary);
              margin: 0;
              line-height: 1.5;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .el-tag {
              flex-shrink: 0;
              margin-left: 8px;
            }
          }

          .recommend-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: var(--font-size-sm);
            color: var(--text-secondary);

            .meta-info {
              display: flex;
              align-items: center;
              gap: 4px;

              .el-icon {
                font-size: 14px;
              }
            }

            .rating-info {
              display: flex;
              align-items: center;
              gap: 6px;

              .rating-text {
                font-size: 13px;
                font-weight: 600;
                color: #f59e0b;
              }
            }
          }

          .recommend-actions {
            display: flex;
            gap: 8px;
            padding-top: 8px;
            border-top: 1px solid var(--border-light);

            .el-button {
              flex: 1;
              font-weight: 500;
              transition: all 0.2s;

              &:hover {
                transform: scale(1.05);
              }
            }
          }
        }
      }
    }
  }
}

.card-header-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-icon {
    font-size: 18px;
    color: var(--color-primary);
  }

  h4 {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: 600;
  }
}
</style>
