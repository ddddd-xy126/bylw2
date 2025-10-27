<template>
  <div class="survey-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="$router.back()">
        <template #content>
          <div class="header-content">
            <span class="header-title">问卷详情</span>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
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
              <h1 class="survey-title">{{ detail.title || '问卷标题' }}</h1>
              <div class="survey-meta">
                <el-tag :type="getStatusTagType(detail.status)" size="small">
                  {{ getStatusText(detail.status) }}
                </el-tag>
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ detail.creator?.nickname || detail.author || '匿名作者' }}
                </span>
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(detail.createdAt) }}
                </span>
                <span class="meta-item" v-if="detail.Category">
                  <el-icon><Tag /></el-icon>
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
                <el-icon><CaretRight /></el-icon>
                开始测试
              </el-button>
            </div>
          </div>

          <div class="survey-description">
            <p>{{ detail.description || '暂无描述' }}</p>
          </div>

          <!-- 统计信息 -->
          <div class="stats-section">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon color="#409EFF"><User /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ detail.participantCount || 0 }}</div>
                    <div class="stat-label">参与人数</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon color="#67C23A"><Clock /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ detail.estimatedTime || 5 }}分钟</div>
                    <div class="stat-label">预计用时</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon color="#E6A23C"><Document /></el-icon>
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
                    <el-icon color="#F56C6C"><Star /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ detail.averageRating || 4.5 }}</div>
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
                <el-icon><List /></el-icon>
                问题预览
              </h3>
              <span class="question-count">共 {{ getQuestionCount() }} 道题</span>
            </div>
          </template>

          <div class="questions-overview">
            <div class="question-types">
              <div class="type-item" v-for="type in questionTypes" :key="type.type">
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
                  <div class="question-title">{{ question.title || question.content }}</div>
                  <div class="question-type-tag">
                    <el-tag size="small" :type="getQuestionTypeColor(question.type)">
                      {{ getQuestionTypeName(question.type) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>

            <div class="view-all-questions" v-if="(detail.questions || []).length > 3">
              <el-button type="text" @click="showAllQuestions = !showAllQuestions">
                {{ showAllQuestions ? '收起' : '查看全部题目' }}
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
                <el-icon><ChatLineRound /></el-icon>
                用户评价
              </h3>
              <span class="comment-count">{{ comments.total || 0 }} 条评论</span>
            </div>
          </template>

          <!-- 评价统计 -->
          <div class="rating-summary">
            <div class="rating-overview">
              <div class="overall-rating">
                <div class="rating-score">{{ detail.averageRating || 4.5 }}</div>
                <el-rate
                  :model-value="detail.averageRating || 4.5"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
              </div>
              <div class="rating-distribution">
                <div v-for="i in 5" :key="i" class="rating-bar">
                  <span class="star-count">{{ 6 - i }}星</span>
                  <el-progress
                    :percentage="getRatingPercentage(6 - i)"
                    :stroke-width="8"
                    :show-text="false"
                  />
                  <span class="percentage">{{ getRatingPercentage(6 - i) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 发表评论 -->
          <div class="comment-form" v-if="userStore.isLoggedIn">
            <el-divider />
            <div class="form-header">
              <h4>发表评价</h4>
            </div>
            <el-form @submit.prevent="submitComment">
              <el-form-item label="评分">
                <el-rate v-model="commentForm.rating" />
              </el-form-item>
              <el-form-item label="评论内容">
                <el-input
                  v-model="commentForm.content"
                  type="textarea"
                  :rows="3"
                  placeholder="分享您对这个问卷的看法..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitComment" :loading="submittingComment">
                  发表评论
                </el-button>
              </el-form-item>
            </el-form>
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
                  <el-rate
                    :model-value="comment.rating"
                    disabled
                    :size="16"
                  />
                  <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
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
              <el-icon><CaretRight /></el-icon>
              开始测试
            </el-button>
            <el-button 
              type="success" 
              size="default" 
              block
              @click="toggleFavorite"
              :loading="favoriteLoading"
            >
              <el-icon><Star /></el-icon>
              {{ detail.isFavorite ? '取消收藏' : '收藏问卷' }}
            </el-button>
            <el-button 
              type="info" 
              size="default" 
              block
              @click="shareQuestionnaire"
            >
              <el-icon><Share /></el-icon>
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
                  <span class="value">{{ detail.creator.surveyCount || 0 }}</span>
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
            <h4>相关推荐</h4>
          </template>
          <div class="recommend-list">
            <div 
              v-for="survey in recommendedSurveys" 
              :key="survey.id"
              class="recommend-item"
              @click="$router.push(`/surveys/${survey.id}`)"
            >
              <div class="recommend-title">{{ survey.title }}</div>
              <div class="recommend-meta">
                <span class="participants">{{ survey.participantCount || 0 }}人参与</span>
                <el-rate :model-value="survey.averageRating || 4.0" disabled :size="12" />
              </div>
            </div>
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
  ArrowUp,
  ArrowDown,
  CircleCheck,
  Edit,
  MoreFilled as More
} from "@element-plus/icons-vue";

import { getSurveyDetail, getSurveyCommentsApi, createCommentApi } from "@/api/survey";
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
const submittingComment = ref(false);

// 评论表单
const commentForm = ref({
  rating: 5,
  content: ''
});

// 推荐问卷
const recommendedSurveys = ref([
  {
    id: 2,
    title: "职业兴趣测试",
    participantCount: 856,
    averageRating: 4.3
  },
  {
    id: 3,
    title: "学习方式评估",
    participantCount: 642,
    averageRating: 4.1
  },
  {
    id: 4,
    title: "压力管理能力测试",
    participantCount: 734,
    averageRating: 4.4
  }
]);

// 计算属性
const questionTypes = computed(() => {
  const questions = detail.value.questions || [];
  const types = {};
  
  questions.forEach(q => {
    const type = q.type || 'single';
    types[type] = (types[type] || 0) + 1;
  });
  
  const typeMap = {
    single: { name: '单选题', icon: 'CircleCheck' },
    multiple: { name: '多选题', icon: 'More' },
    text: { name: '文本题', icon: 'Edit' },
    rating: { name: '评分题', icon: 'Star' }
  };
  
  return Object.entries(types).map(([type, count]) => ({
    type,
    count,
    ...typeMap[type] || { name: '其他', icon: 'Document' }
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
    published: 'success',
    draft: 'info',
    closed: 'danger'
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status) => {
  const textMap = {
    published: '进行中',
    draft: '草稿',
    closed: '已结束'
  };
  return textMap[status] || '未知';
};

const getQuestionTypeName = (type) => {
  const nameMap = {
    single: '单选题',
    multiple: '多选题',
    text: '文本题',
    rating: '评分题'
  };
  return nameMap[type] || '其他';
};

const getQuestionTypeColor = (type) => {
  const colorMap = {
    single: 'primary',
    multiple: 'success',
    text: 'warning',
    rating: 'danger'
  };
  return colorMap[type] || 'info';
};

const getRatingPercentage = (rating) => {
  // 模拟评分分布数据
  const distribution = {
    5: 60,
    4: 25,
    3: 10,
    2: 3,
    1: 2
  };
  return distribution[rating] || 0;
};

const formatDate = (date) => {
  if (!date) return '未知时间';
  return new Date(date).toLocaleDateString('zh-CN');
};

const startSurvey = async () => {
  startLoading.value = true;
  try {
    // 检查登录状态
    if (!userStore.isLoggedIn) {
      const result = await ElMessageBox.confirm(
        '开始测试需要登录，是否前往登录？',
        '提示',
        {
          confirmButtonText: '去登录',
          cancelButtonText: '取消',
          type: 'info'
        }
      );
      if (result === 'confirm') {
        router.push(`/login?redirect=/surveys/${route.params.id}`);
      }
      return;
    }
    
    // 跳转到答题页面
    router.push(`/surveys/answer/${route.params.id}`);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请重试');
    }
  } finally {
    startLoading.value = false;
  }
};

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    return;
  }
  
  favoriteLoading.value = true;
  try {
    // 模拟收藏/取消收藏
    await new Promise(resolve => setTimeout(resolve, 500));
    detail.value.isFavorite = !detail.value.isFavorite;
    ElMessage.success(detail.value.isFavorite ? '收藏成功' : '取消收藏成功');
  } catch (error) {
    ElMessage.error('操作失败，请重试');
  } finally {
    favoriteLoading.value = false;
  }
};

const shareQuestionnaire = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制链接');
  });
};

const submitComment = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    return;
  }
  
  if (!commentForm.value.content.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }
  
  submittingComment.value = true;
  try {
    const newComment = await createCommentApi(route.params.id, {
      ...commentForm.value,
      userId: userStore.user.id,
      username: userStore.user.nickname || userStore.user.username
    });
    
    comments.value.list.unshift(newComment);
    comments.value.total++;
    
    // 重置表单
    commentForm.value.content = '';
    commentForm.value.rating = 5;
    
    ElMessage.success('评论发表成功');
  } catch (error) {
    ElMessage.error('评论发表失败：' + error.message);
  } finally {
    submittingComment.value = false;
  }
};

const loadComments = async () => {
  loadingComments.value = true;
  try {
    const data = await getSurveyCommentsApi(route.params.id);
    comments.value = data;
  } catch (error) {
    console.error('加载评论失败:', error);
  } finally {
    loadingComments.value = false;
  }
};

// 生命周期
onMounted(async () => {
  try {
    // 并行加载问卷详情和评论
    const [surveyData] = await Promise.all([
      getSurveyDetail(route.params.id),
      loadComments()
    ]);
    
    detail.value = surveyData;
  } catch (error) {
    ElMessage.error('加载问卷详情失败：' + error.message);
    console.error('加载详情失败:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.survey-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;

  .page-header {
    background: white;
    padding: 16px 0;
    border-bottom: 1px solid #e4e7ed;
    margin-bottom: 20px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* 问卷信息卡片 */
  .survey-info-card { border-radius: 12px; overflow: hidden; }

  .survey-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 20px;
  }

  .header-left { flex: 1; }

  .survey-title {
    margin: 0 0 12px 0;
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    line-height: 1.3;
  }

  .survey-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #606266;
    font-size: 14px;
  }

  .header-right { .el-button { font-size: 16px; padding: 12px 24px; } }

  .survey-description { margin-bottom: 24px;
    p { margin: 0; color: #606266; font-size: 16px; line-height: 1.6; }
  }

  /* 统计信息 */
  .stats-section { padding-top: 24px; border-top: 1px solid #f0f0f0; }

  .stat-card {
    display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8f9fa; border-radius: 8px; transition: all 0.3s ease;
    &:hover { background: #f0f2f5; transform: translateY(-2px); }
    .stat-icon { font-size: 24px; }
    .stat-content { flex: 1; }
    .stat-number { font-size: 18px; font-weight: 700; color: #303133; margin-bottom: 4px; }
    .stat-label { font-size: 12px; color: #909399; }
  }

  /* 问题预览卡片 */
  .questions-preview-card { border-radius: 12px; }

  .card-header { display: flex; justify-content: space-between; align-items: center; margin: 0;
    h3 { margin: 0; display: flex; align-items: center; gap: 8px; color: #303133; font-size: 18px; font-weight: 600; }
  }

  .question-count { color: #909399; font-size: 14px; }

  .questions-overview { padding: 0; }

  .question-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:16px; margin-bottom:20px; }
  .type-item { display:flex; align-items:center; gap:12px; padding:12px; background:#f8f9fa; border-radius:8px; }
  .type-icon { font-size:20px; color:#409eff; }
  .type-name { font-weight:600; color:#303133; }
  .type-count { color:#909399; font-size:14px; }

  .sample-questions { display:flex; flex-direction:column; gap:16px; }
  .sample-question { display:flex; gap:12px; padding:16px; background:#fafafa; border-radius:8px; border-left:4px solid #409eff; }
  .question-number { font-weight:600; color:#409eff; min-width:20px; }
  .question-content { flex:1; }
  .question-title { margin-bottom:8px; color:#303133; font-size:16px; line-height:1.4; }
  .question-type-tag { margin-top:8px; }
  .view-all-questions { text-align:center; margin-top:16px; }

  /* 评论区域 */
  .comments-card { border-radius:12px; }
  .rating-summary { margin-bottom:24px; }
  .rating-overview { display:grid; grid-template-columns:200px 1fr; gap:24px; align-items:center; }
  .overall-rating { text-align:center; padding:20px; background:#f8f9fa; border-radius:8px; }
  .rating-score { font-size:48px; font-weight:700; color:#ff9900; margin-bottom:8px; }
  .rating-distribution { display:flex; flex-direction:column; gap:8px; }
  .rating-bar { display:grid; grid-template-columns:40px 1fr 40px; gap:12px; align-items:center; }
  .star-count { font-size:14px; color:#606266; }
  .percentage { font-size:12px; color:#909399; text-align:right; }

  .comment-form { margin:24px 0; }
  .form-header h4 { margin:0 0 16px 0; color:#303133; }
  .comments-list { max-height:400px; overflow-y:auto; }
  .comment-item { display:flex; gap:12px; padding:16px 0; border-bottom:1px solid #f0f0f0; &:last-child{ border-bottom:none; } }
  .comment-content { flex:1; }
  .comment-header { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
  .comment-author { font-weight:600; color:#303133; }
  .comment-time { color:#909399; font-size:12px; margin-left:auto; }
  .comment-text { color:#606266; line-height:1.5; }

  /* 侧边栏 */
  .sidebar { display:flex; flex-direction:column; gap:16px; }
  .action-card, .author-card, .recommend-card { border-radius:12px; }
  .action-card h4, .author-card h4, .recommend-card h4 { margin:0; color:#303133; font-size:16px; font-weight:600; }
  .action-buttons { display:flex; flex-direction:column; gap:12px; }
  .author-info { text-align:center; }
  .author-avatar { margin-bottom:12px; }
  .author-name { font-size:16px; font-weight:600; color:#303133; margin-bottom:12px; }
  .author-stats { display:flex; justify-content:space-around; }
  .author-stats .stat { text-align:center; }
  .author-stats .label { display:block; font-size:12px; color:#909399; margin-bottom:4px; }
  .author-stats .value { font-size:18px; font-weight:600; color:#409eff; }

  /* 推荐列表 */
  .recommend-list { display:flex; flex-direction:column; gap:12px; }
  .recommend-item { padding:12px; border-radius:8px; background:#f8f9fa; cursor:pointer; transition:all 0.3s ease; &:hover{ background:#e9ecef; transform:translateX(4px);} }
  .recommend-title { font-size:14px; font-weight:600; color:#303133; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .recommend-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .participants { font-size:12px; color:#909399; }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .detail-container { grid-template-columns: 1fr; padding: 0 16px; }
    .sidebar { order: -1; }
    .survey-header { flex-direction: column; gap: 16px; }
    .header-right { width: 100%; }
    .survey-title { font-size: 24px; }
    .survey-meta { gap: 12px; }
    .question-types { grid-template-columns: 1fr; }
    .rating-overview { grid-template-columns: 1fr; gap: 16px; }
    .sample-question { flex-direction: column; gap: 8px; }
    .question-number { min-width: auto; }
  }

  @media (max-width: 480px) {
    .detail-container { padding: 0 12px; }
    .survey-title { font-size: 20px; }
    .meta-item { font-size: 12px; }
    .comment-item { flex-direction: column; gap: 8px; }
  }
}
</style>
