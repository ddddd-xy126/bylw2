<template>
  <div class="survey-detail">
    <el-page-header @back="$router.back()">
      <template #content>
        <span class="text-large font-600">{{
          survey?.title || "问卷详情"
        }}</span>
      </template>
    </el-page-header>

    <el-loading :loading="loading">
      <div class="survey-content" v-if="survey && !loading">
        <!-- 问卷信息 -->
        <el-card class="survey-info-card" v-if="!isAnswering">
          <div class="survey-header">
            <h1>{{ survey.title }}</h1>
            <div class="survey-actions">
              <el-button
                :icon="isFavorite ? StarFilled : Star"
                :type="isFavorite ? 'warning' : 'default'"
                @click="toggleFavorite"
                v-if="userStore.isLoggedIn"
              >
                {{ isFavorite ? "已收藏" : "收藏" }}
              </el-button>
              <el-button
                type="primary"
                @click="startAnswering"
                :disabled="!survey.questions?.length"
              >
                开始答题
              </el-button>
            </div>
          </div>

          <p class="survey-description">{{ survey.description }}</p>

          <div class="survey-meta">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="问卷分类">
                <el-tag type="info">{{
                  getCategoryName(survey.categoryId)
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="题目数量">
                {{ survey.questions?.length || 0 }} 道
              </el-descriptions-item>
              <el-descriptions-item label="预计用时">
                约 {{ estimatedTime }} 分钟
              </el-descriptions-item>
              <el-descriptions-item label="参与人数">
                {{ survey.participantCount || 0 }} 人
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(survey.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="平均评分">
                <el-rate
                  :model-value="survey.averageRating || 0"
                  disabled
                  show-score
                />
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!-- 答题界面 -->
        <el-card class="answer-card" v-if="isAnswering && currentQuestion">
          <div class="progress-section">
            <div class="progress-info">
              <span
                >第 {{ currentQuestionIndex + 1 }} 题，共
                {{ survey.questions.length }} 题</span
              >
              <span
                >{{
                  Math.round(
                    ((currentQuestionIndex + 1) / survey.questions.length) * 100
                  )
                }}%</span
              >
            </div>
            <el-progress
              :percentage="
                ((currentQuestionIndex + 1) / survey.questions.length) * 100
              "
              :stroke-width="8"
              :show-text="false"
            />
          </div>

          <div class="question-section">
            <h2>{{ currentQuestion.content }}</h2>

            <!-- 单选题 -->
            <div
              v-if="currentQuestion.type === 'single'"
              class="answer-options"
            >
              <el-radio-group
                v-model="answers[currentQuestion.id]"
                size="large"
              >
                <el-radio
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  :value="option"
                  class="option-radio"
                >
                  {{ option }}
                </el-radio>
              </el-radio-group>
            </div>

            <!-- 多选题 -->
            <div
              v-else-if="currentQuestion.type === 'multiple'"
              class="answer-options"
            >
              <el-checkbox-group
                v-model="answers[currentQuestion.id]"
                size="large"
              >
                <el-checkbox
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  :value="option"
                  class="option-checkbox"
                >
                  {{ option }}
                </el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 文本题 -->
            <div
              v-else-if="currentQuestion.type === 'text'"
              class="answer-options"
            >
              <el-input
                v-model="answers[currentQuestion.id]"
                type="textarea"
                :rows="4"
                placeholder="请输入您的答案..."
                maxlength="500"
                show-word-limit
                size="large"
              />
            </div>
          </div>

          <div class="navigation-section">
            <el-button
              @click="prevQuestion"
              :disabled="currentQuestionIndex === 0"
              size="large"
            >
              上一题
            </el-button>
            <el-button
              type="primary"
              @click="nextQuestion"
              :disabled="!isCurrentAnswerValid"
              size="large"
            >
              {{
                currentQuestionIndex === survey.questions.length - 1
                  ? "提交答卷"
                  : "下一题"
              }}
            </el-button>
          </div>
        </el-card>

        <!-- 完成界面 -->
        <el-card class="result-card" v-if="isCompleted">
          <el-result
            icon="success"
            title="问卷提交成功！"
            sub-title="感谢您的参与"
          >
            <template #extra>
              <div class="result-info">
                <div class="score-section" v-if="finalScore !== null">
                  <h3>您的得分</h3>
                  <div class="score-display">{{ finalScore }}分</div>
                </div>
                <div class="actions-section">
                  <el-button @click="viewReport" type="primary"
                    >查看详细报告</el-button
                  >
                  <el-button @click="resetSurvey">重新答题</el-button>
                  <el-button @click="goToHome">返回首页</el-button>
                </div>
              </div>
            </template>
          </el-result>
        </el-card>

        <!-- 评论区 -->
        <el-card class="comments-card" v-if="!isAnswering">
          <template #header>
            <div class="comments-header">
              <span>用户评论 ({{ comments.length }})</span>
              <el-button
                type="primary"
                @click="showCommentDialog = true"
                v-if="userStore.isLoggedIn"
              >
                发表评论
              </el-button>
            </div>
          </template>

          <div class="comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <div class="user-info">
                  <span class="username">{{
                    comment.user?.nickname || "匿名用户"
                  }}</span>
                  <el-rate
                    :model-value="comment.rating"
                    disabled
                    size="small"
                  />
                </div>
                <span class="comment-date">{{
                  formatDate(comment.createdAt)
                }}</span>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </div>

            <el-empty v-if="!comments.length" description="暂无评论" />
          </div>
        </el-card>
      </div>

      <el-empty v-else-if="!loading" description="问卷不存在或已删除" />
    </el-loading>

    <!-- 评论对话框 -->
    <el-dialog v-model="showCommentDialog" title="发表评论" width="500px">
      <el-form :model="commentForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate v-model="commentForm.rating" />
        </el-form-item>
        <el-form-item label="评论内容">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评论..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCommentDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitComment"
          :loading="commentSubmitting"
        >
          提交评论
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Star, StarFilled } from "@element-plus/icons-vue";

import { useUserStore } from "@/store/user";
import { useDataStore } from "@/store/data";
import {
  getSurveyDetail,
  submitSurveyApi,
  getSurveyCommentsApi,
  createCommentApi,
} from "@/api/survey";
import { addFavoriteApi, removeFavoriteApi, getFavoritesApi } from "@/api/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const dataStore = useDataStore();

// 响应式数据
const loading = ref(true);
const survey = ref(null);
const comments = ref([]);
const categories = ref([
  { id: 1, name: "心理测试" },
  { id: 2, name: "技能评估" },
  { id: 3, name: "健康评估" },
  { id: 4, name: "教育培训" },
  { id: 5, name: "娱乐测试" },
  { id: 6, name: "市场调研" },
]);

// 答题相关
const isAnswering = ref(false);
const isCompleted = ref(false);
const currentQuestionIndex = ref(0);
const answers = reactive({});
const finalScore = ref(null);

// 评论相关
const showCommentDialog = ref(false);
const commentSubmitting = ref(false);
const commentForm = reactive({
  rating: 5,
  content: "",
});

// 计算属性
const currentQuestion = computed(() => {
  if (!survey.value?.questions?.length) return null;
  return survey.value.questions[currentQuestionIndex.value];
});

const estimatedTime = computed(() => {
  const questionCount = survey.value?.questions?.length || 0;
  return Math.max(1, Math.ceil(questionCount * 0.5)); // 每题约30秒
});

const isFavorite = computed(() => {
  if (!userStore.isLoggedIn || !survey.value) return false;
  const favoritesArray = Array.isArray(userStore.favorites)
    ? userStore.favorites
    : [];
  return favoritesArray.some((fav) => fav.questionnaireId === survey.value.id);
});

const isCurrentAnswerValid = computed(() => {
  if (!currentQuestion.value) return false;

  const answer = answers[currentQuestion.value.id];
  if (currentQuestion.value.type === "multiple") {
    return Array.isArray(answer) && answer.length > 0;
  }
  return answer !== undefined && answer !== null && answer !== "";
});

// 方法
const loadSurveyData = async () => {
  loading.value = true;
  try {
    const surveyData = await getSurveyDetail(route.params.id);
    survey.value = surveyData;

    // 加载评论
    const commentsData = await getSurveyCommentsApi(route.params.id);
    comments.value = commentsData;

    // 如果用户已登录，更新收藏状态
    if (userStore.isLoggedIn) {
      const favorites = await getFavoritesApi();
      userStore.setUserData({ favorites });
    }
  } catch (error) {
    ElMessage.error("加载问卷失败：" + error.message);
  } finally {
    loading.value = false;
  }
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find((c) => c.id === categoryId);
  return category?.name || "未分类";
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("zh-CN");
};

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    return;
  }

  try {
    if (isFavorite.value) {
      await removeFavoriteApi(survey.value.id);
      const favoritesArray = Array.isArray(userStore.favorites)
        ? userStore.favorites
        : [];
      userStore.favorites = favoritesArray.filter(
        (fav) => fav.questionnaireId !== survey.value.id
      );
      ElMessage.success("取消收藏成功");
    } else {
      await addFavoriteApi(survey.value.id);
      const favoritesArray = Array.isArray(userStore.favorites)
        ? userStore.favorites
        : [];
      userStore.favorites = [
        ...favoritesArray,
        { questionnaireId: survey.value.id },
      ];
      ElMessage.success("收藏成功");
    }
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

const startAnswering = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录后再答题");
    return;
  }

  if (!survey.value?.questions?.length) {
    ElMessage.warning("该问卷暂无题目");
    return;
  }

  isAnswering.value = true;
  currentQuestionIndex.value = 0;

  // 初始化答案对象
  survey.value.questions.forEach((question) => {
    if (question.type === "multiple") {
      answers[question.id] = [];
    } else {
      answers[question.id] = "";
    }
  });
};

const nextQuestion = async () => {
  if (!isCurrentAnswerValid.value) {
    ElMessage.warning("请先回答当前问题");
    return;
  }

  if (currentQuestionIndex.value === survey.value.questions.length - 1) {
    // 提交答卷
    await submitAnswers();
  } else {
    currentQuestionIndex.value++;
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const submitAnswers = async () => {
  try {
    const answerData = {
      answers: Object.keys(answers).map((questionId) => ({
        questionId: parseInt(questionId),
        value: answers[questionId],
      })),
    };

    const result = await submitSurveyApi(survey.value.id, answerData);
    finalScore.value = result.score || Math.floor(Math.random() * 40) + 60; // 模拟评分

    isAnswering.value = false;
    isCompleted.value = true;

    ElMessage.success("答卷提交成功！");
  } catch (error) {
    ElMessage.error("提交失败：" + error.message);
  }
};

const viewReport = () => {
  router.push(`/user/reports`);
};

const resetSurvey = async () => {
  try {
    await ElMessageBox.confirm(
      "确定要重新答题吗？之前的答案将被清空。",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    // 重置状态
    isAnswering.value = false;
    isCompleted.value = false;
    currentQuestionIndex.value = 0;
    finalScore.value = null;

    // 清空答案
    Object.keys(answers).forEach((key) => {
      if (Array.isArray(answers[key])) {
        answers[key] = [];
      } else {
        answers[key] = "";
      }
    });
  } catch (error) {
    // 用户取消
  }
};

const goToHome = () => {
  // 根据用户角色智能导航
  if (userStore.isAdmin) {
    router.push("/admin/dashboard");
  } else {
    router.push("/home");
  }
};

const submitComment = async () => {
  if (!commentForm.content.trim()) {
    ElMessage.warning("请输入评论内容");
    return;
  }

  commentSubmitting.value = true;
  try {
    const comment = await createCommentApi(survey.value.id, {
      rating: commentForm.rating,
      content: commentForm.content.trim(),
    });

    // 添加到评论列表
    comments.value.unshift({
      ...comment,
      user: { nickname: userStore.userName },
    });

    // 重置表单
    commentForm.rating = 5;
    commentForm.content = "";
    showCommentDialog.value = false;

    ElMessage.success("评论发表成功");
  } catch (error) {
    ElMessage.error("评论失败：" + error.message);
  } finally {
    commentSubmitting.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadSurveyData();
});
</script>

<style scoped>
.survey-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.survey-content {
  margin-top: 20px;
}

.survey-info-card,
.answer-card,
.result-card,
.comments-card {
  margin-bottom: 20px;
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.survey-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  flex: 1;
  margin-right: 20px;
}

.survey-actions {
  display: flex;
  gap: 12px;
}

.survey-description {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.survey-meta {
  margin-top: 20px;
}

.progress-section {
  margin-bottom: 32px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.question-section {
  margin-bottom: 32px;
}

.question-section h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 24px;
  line-height: 1.5;
}

.answer-options {
  margin-bottom: 24px;
}

.option-radio,
.option-checkbox {
  display: block;
  margin-bottom: 16px;
  padding: 12px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.option-radio:hover,
.option-checkbox:hover {
  border-color: #409eff;
  background-color: #f0f8ff;
}

.option-radio.is-checked,
.option-checkbox.is-checked {
  border-color: #409eff;
  background-color: #e8f4fd;
}

.navigation-section {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.result-info {
  text-align: center;
  padding: 20px;
}

.score-section {
  margin-bottom: 32px;
}

.score-section h3 {
  margin-bottom: 16px;
  color: #333;
}

.score-display {
  font-size: 48px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 16px;
}

.actions-section {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-list {
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-weight: bold;
  color: #333;
}

.comment-date {
  color: #999;
  font-size: 12px;
}

.comment-content {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .survey-detail {
    padding: 16px;
  }

  .survey-header {
    flex-direction: column;
    gap: 16px;
  }

  .survey-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .navigation-section {
    flex-direction: column;
  }

  .actions-section {
    flex-direction: column;
  }
}
</style>
