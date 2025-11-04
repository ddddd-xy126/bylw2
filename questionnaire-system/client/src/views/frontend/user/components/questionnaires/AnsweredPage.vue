<template>
  <div class="answered-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-info">
        <h2>已填写问卷</h2>
        <p>查看您已完成的问卷答题记录，重新查看结果或再次答题</p>
      </div>
      <div class="header-stats">
        <el-statistic title="总答题数" :value="totalAnswered" />
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input v-model="searchKeyword" placeholder="搜索问卷标题" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterCategory" placeholder="问卷分类" clearable @change="handleFilter">
            <el-option label="全部分类" value="" />
            <el-option label="心理健康" value="心理健康" />
            <el-option label="教育" value="教育" />
            <el-option label="职业发展" value="职业发展" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="handleFilter" />
        </el-col>
      </el-row>
    </el-card>

    <!-- 问卷列表 -->
    <div class="survey-list" v-loading="loading">
      <div v-for="answer in filteredAnswers" :key="answer.id" class="survey-item">
        <div class="survey-main">
          <div class="survey-icon">
            <el-icon size="24" color="#67d474d5">
              <Document />
            </el-icon>
          </div>

          <div class="survey-info">
            <div class="survey-header">
              <h3 class="survey-title">{{ answer.title }}</h3>
              <div class="survey-badges">
                <el-tag size="small" type="primary">{{ answer.category }}</el-tag>
                <el-tag size="small" type="success">已完成</el-tag>
              </div>
            </div>

            <div class="survey-meta">
              <span class="meta-item">
                <el-icon>
                  <Calendar />
                </el-icon>
                答题时间：{{ formatDate(answer.submittedAt) }}
              </span>
              <span class="meta-item" v-if="answer.score">
                <el-icon>
                  <Star />
                </el-icon>
                得分：{{ answer.score }}分
              </span>
              <span class="meta-item" v-if="answer.duration">
                <el-icon>
                  <Clock />
                </el-icon>
                用时：{{ formatDuration(answer.duration) }}
              </span>
              <span class="meta-item" v-if="answer.survey">
                <el-icon>
                  <User />
                </el-icon>
                {{ answer.survey.participantCount || 0 }}人参与
              </span>
            </div>

            <div class="survey-result" v-if="answer.result">
              <span class="result-label">结果：</span>
              <span class="result-text">{{ answer.result }}</span>
            </div>
          </div>
        </div>

        <div class="survey-actions">
          <el-button type="primary" @click="viewResult(answer)" :disabled="!answer.score">
            <el-icon>
              <View />
            </el-icon>
            查看结果
          </el-button>
          <el-button @click="retakeSurvey(answer.surveyId)" :disabled="!answer.survey">
            <el-icon>
              <RefreshRight />
            </el-icon>
            重新答题
          </el-button>
          <el-button type="danger" plain @click="handleDelete(answer)">
            <el-icon>
              <Delete />
            </el-icon>
            删除记录
          </el-button>
          <el-button type="warning" plain @click="handleFavorite(answer)">
            <el-icon>
              <Star />
            </el-icon>
            收藏问卷
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!loading && filteredAnswers.length === 0" description="暂无已填写的问卷" class="empty-state">
        <el-button type="primary" @click="goToSurveys">
          去答题
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="totalAnswered > pageSize">
      <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="totalAnswered"
        layout="prev, pager, next, jumper, total" @current-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Document,
  Calendar,
  Star,
  Clock,
  User,
  View,
  RefreshRight,
  Delete
} from "@element-plus/icons-vue";

import { getUserAnsweredSurveysApi, addFavoriteApi, moveAnsweredToRecycleApi } from "@/api/user";
import { useUserStore } from "@/store/user";
import { useListFilter } from "@/hooks/useListFilter";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const answeredSurveys = ref([]);

// 使用通用列表筛选 hooks（封装搜索/筛选/分页）
const {
  searchKeyword,
  filterCategory,
  dateRange,
  currentPage,
  pageSize,
  filteredList: filteredAnswers,
  totalItems: totalAnswered,
  handleSearch,
  handleFilter,
  handlePageChange,
} = useListFilter({ sourceList: answeredSurveys, searchFields: ["title"] });

// 方法
const loadAnsweredSurveys = async () => {
  loading.value = true;
  try {
    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error("请先登录");
      return;
    }

    const data = await getUserAnsweredSurveysApi(userId);
    answeredSurveys.value = data.sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );
  } catch (error) {
    ElMessage.error("加载已填写问卷失败：" + error.message);
  } finally {
    loading.value = false;
  }
};


const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("zh-CN");
};

const formatDuration = (duration) => {
  if (!duration) return "未知";
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}分${seconds}秒`;
};

const formatAnswerValue = (value) => {
  // 如果没有值，返回"未作答"
  if (!value) return "未作答";
  
  // 如果是数组，用顿号连接
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join("、") : "未作答";
  }
  
  // 返回字符串值
  return value;
};

const viewResult = (answer) => {
  // 跳转到结果页，带上 surveyId 参数
  router.push({
    path: `/surveys/result/${answer.id}`,
    query: {
      surveyId: answer.surveyId
    }
  });
};

const retakeSurvey = (surveyId) => {
  router.push(`/surveys/${surveyId}`);
};

const goToSurveys = () => {
  router.push("/");
};

// 删除答题记录
const handleDelete = async (answer) => {
  try {
    // 弹出确认框
    await ElMessageBox.confirm(
      '确定要删除此答题记录吗？删除后该记录会移入回收站，可在回收站恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 调用 API：先保存到 recycleBin 再删除 answers
    await moveAnsweredToRecycleApi(answer.id, answer);

    // 从本地数组移除
    answeredSurveys.value = answeredSurveys.value.filter(a => a.id !== answer.id);

    ElMessage.success('已删除并移入回收站');
  } catch (err) {
    // 当取消确认时，Element Plus 会抛出一个对象，我们不显示错误
    if (err && (err === 'cancel' || err.type === 'cancel')) return;
    ElMessage.error('删除失败：' + (err.message || err));
  }
};

// 收藏问卷
const handleFavorite = async (answer) => {
  try {
    await addFavoriteApi(userStore.profile?.id, answer.surveyId);
    ElMessage.success("收藏成功");
  } catch (error) {
    ElMessage.error("收藏失败：" + error.message);
  }
};

// 生命周期
onMounted(() => {
  loadAnsweredSurveys();
});
</script>
