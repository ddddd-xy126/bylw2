<template>
  <div class="home">
    <!-- 顶部搜索和筛选 -->
    <div class="header-section">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-input
            v-model="searchQuery"
            placeholder="搜索问卷..."
            size="large"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-select
            v-model="selectedCategory"
            placeholder="选择分类"
            size="large"
            style="width: 100%"
            @change="handleCategoryChange"
            clearable
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#409EFF"><Document /></el-icon>
              <div class="stats-text">
                <div class="stats-number">{{ surveys.length }}</div>
                <div class="stats-label">总问卷数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#67C23A"><User /></el-icon>
              <div class="stats-text">
                <div class="stats-number">{{ totalParticipants }}</div>
                <div class="stats-label">参与人数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#E6A23C"><Star /></el-icon>
              <div class="stats-text">
                <div class="stats-number">{{ userStore.favorites.length }}</div>
                <div class="stats-label">我的收藏</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#F56C6C"><Trophy /></el-icon>
              <div class="stats-text">
                <div class="stats-number">
                  {{ userStore.achievements?.points || 0 }}
                </div>
                <div class="stats-label">积分</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 问卷列表 -->
    <div class="survey-section">
      <div class="section-header">
        <h2>热门问卷</h2>
        <el-radio-group v-model="sortBy" @change="handleSortChange">
          <el-radio-button value="latest">最新</el-radio-button>
          <el-radio-button value="hot">热门</el-radio-button>
          <el-radio-button value="recommended">推荐</el-radio-button>
        </el-radio-group>
      </div>

      <el-loading :loading="loading">
        <el-row :gutter="20" v-if="filteredSurveys.length">
          <el-col
            :span="8"
            v-for="survey in filteredSurveys"
            :key="survey.id"
            style="margin-bottom: 20px"
          >
            <el-card
              class="survey-card"
              shadow="hover"
              @click="goToSurvey(survey.id)"
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
                  {{ getCategoryName(survey.categoryId) }}
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
                  @click.stop="goToSurvey(survey.id)"
                >
                  开始答题
                </el-button>
                <el-button
                  :icon="isFavorite(survey.id) ? Star : StarFilled"
                  :type="isFavorite(survey.id) ? 'warning' : 'default'"
                  size="small"
                  @click.stop="toggleFavorite(survey.id)"
                  v-if="userStore.isLoggedIn"
                >
                  {{ isFavorite(survey.id) ? "已收藏" : "收藏" }}
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-else description="暂无问卷数据" :image-size="100" />
      </el-loading>
    </div>

    <!-- 分页 -->
    <div class="pagination-section" v-if="filteredSurveys.length">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[9, 18, 36]"
        :total="totalSurveys"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Search,
  Document,
  User,
  Star,
  Trophy,
  StarFilled,
} from "@element-plus/icons-vue";

import { useUserStore } from "@/store/user";
import { useDataStore } from "@/store/data";
import { listSurveys, getSurveyCommentsApi } from "@/api/survey";
import { addFavoriteApi, removeFavoriteApi, getFavoritesApi } from "@/api/user";

const router = useRouter();
const userStore = useUserStore();
const dataStore = useDataStore();

// 响应式数据
const searchQuery = ref("");
const selectedCategory = ref(null);
const sortBy = ref("latest");
const currentPage = ref(1);
const pageSize = ref(9);
const loading = ref(false);

// 计算属性
const surveys = computed(() => dataStore.surveys);
const categories = computed(() => dataStore.categories);

const filteredSurveys = computed(() => {
  // 确保 surveys.value 是数组
  const surveysArray = Array.isArray(surveys.value) ? surveys.value : [];

  let filtered = surveysArray.filter((survey) => survey.status === "published");

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (survey) =>
        survey.title.toLowerCase().includes(query) ||
        survey.description.toLowerCase().includes(query)
    );
  }

  // 分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter(
      (survey) => survey.categoryId === selectedCategory.value
    );
  }

  // 排序
  switch (sortBy.value) {
    case "latest":
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "hot":
      filtered.sort(
        (a, b) => (b.participantCount || 0) - (a.participantCount || 0)
      );
      break;
    case "recommended":
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filtered.slice(start, end);
});

const totalSurveys = computed(() => {
  const surveysArray = Array.isArray(surveys.value) ? surveys.value : [];

  let total = surveysArray.filter(
    (survey) => survey.status === "published"
  ).length;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    total = surveysArray.filter(
      (survey) =>
        survey.status === "published" &&
        (survey.title.toLowerCase().includes(query) ||
          survey.description.toLowerCase().includes(query))
    ).length;
  }

  if (selectedCategory.value) {
    total = surveysArray.filter(
      (survey) =>
        survey.status === "published" &&
        survey.categoryId === selectedCategory.value
    ).length;
  }

  return total;
});

const totalParticipants = computed(() => {
  const surveysArray = Array.isArray(surveys.value) ? surveys.value : [];
  return surveysArray.reduce(
    (sum, survey) => sum + (survey.participantCount || 0),
    0
  );
});

// 方法
const loadData = async () => {
  loading.value = true;
  try {
    // 加载问卷列表
    const surveysResponse = await listSurveys();
    // 处理不同的响应格式
    const surveysData = Array.isArray(surveysResponse)
      ? surveysResponse
      : surveysResponse.items || surveysResponse.data || [];

    dataStore.setSurveys(surveysData);

    // 如果用户已登录，加载收藏等数据
    if (userStore.isLoggedIn) {
      const favoritesResponse = await getFavoritesApi();
      // 确保 favorites 是数组
      const favorites = Array.isArray(favoritesResponse)
        ? favoritesResponse
        : favoritesResponse.items || favoritesResponse.data || [];
      userStore.setUserData({ favorites });
    }
  } catch (error) {
    ElMessage.error("加载数据失败：" + error.message);
    dataStore.setError(error.message);
  } finally {
    loading.value = false;
  }
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find((c) => c.id === categoryId);
  return category?.name || "未分类";
};

const isFavorite = (surveyId) => {
  const favoritesArray = Array.isArray(userStore.favorites)
    ? userStore.favorites
    : [];
  return favoritesArray.some((fav) => fav.questionnaireId === surveyId);
};

const toggleFavorite = async (surveyId) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    return;
  }

  try {
    if (isFavorite(surveyId)) {
      await removeFavoriteApi(surveyId);
      const favoritesArray = Array.isArray(userStore.favorites)
        ? userStore.favorites
        : [];
      userStore.favorites = favoritesArray.filter(
        (fav) => fav.questionnaireId !== surveyId
      );
      ElMessage.success("取消收藏成功");
    } else {
      await addFavoriteApi(surveyId);
      const favoritesArray = Array.isArray(userStore.favorites)
        ? userStore.favorites
        : [];
      userStore.favorites = [...favoritesArray, { questionnaireId: surveyId }];
      ElMessage.success("收藏成功");
    }
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

const goToSurvey = (surveyId) => {
  router.push(`/surveys/${surveyId}`);
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleCategoryChange = () => {
  currentPage.value = 1;
};

const handleSortChange = () => {
  currentPage.value = 1;
};

const handlePageChange = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleSizeChange = () => {
  currentPage.value = 1;
};

// 生命周期
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.stats-section {
  margin-bottom: 32px;
}

.stats-card {
  height: 80px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-text {
  flex: 1;
}

.stats-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stats-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.survey-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

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

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
