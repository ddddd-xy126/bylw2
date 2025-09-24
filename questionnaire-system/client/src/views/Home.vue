<template>
  <div class="home">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <h1 class="banner-title">智能问卷分析系统</h1>
        <p class="banner-subtitle">发现洞察，创造价值 - 让每个问卷都充满意义</p>
        <div class="banner-actions">
          <el-button type="primary" size="large" @click="scrollToSurveys">
            浏览问卷
          </el-button>
          <el-button 
            v-if="userStore.isLoggedIn" 
            type="success" 
            size="large" 
            @click="goToProfile"
          >
            我的中心
          </el-button>
          <el-button 
            v-else 
            size="large" 
            @click="goToLogin"
          >
            立即登录
          </el-button>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-wrapper">
      <StatsCards
        :total-surveys="surveys.length"
        :total-participants="totalParticipants"
        :user-favorites="userStore.favorites.length"
        :user-points="userStore.achievements?.points || 0"
      />
    </div>

    <!-- 搜索和过滤 -->
    <div class="search-wrapper">
      <SearchFilter
        v-model:search-query="searchQuery"
        v-model:selected-category="selectedCategory"
        :categories="categories"
        @search="handleSearch"
        @category-change="handleCategoryChange"
      />
    </div>

    <!-- 热门推荐 -->
    <div class="featured-wrapper">
      <FeaturedSurveys
        :surveys="surveys"
        :user-favorites="userStore.favorites"
        @survey-click="goToSurvey"
        @survey-start="goToSurvey"
        @toggle-favorite="toggleFavorite"
      />
    </div>

    <!-- 问卷列表 -->
    <div class="surveys-section" ref="surveysSection">
      <SurveyList
        v-model:sort-by="sortBy"
        :surveys="filteredSurveys"
        :loading="loading"
        :get-category-name="getCategoryName"
        :is-favorite="isFavorite"
        :show-favorite="userStore.isLoggedIn"
        @sort-change="handleSortChange"
        @survey-click="goToSurvey"
        @survey-start="goToSurvey"
        @toggle-favorite="toggleFavorite"
      />
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useHomeLogic } from "@/composables/useHomeLogic";
import SearchFilter from "@/components/home/SearchFilter.vue";
import StatsCards from "@/components/home/StatsCards.vue";
import SurveyList from "@/components/home/SurveyList.vue";
import FeaturedSurveys from "@/components/home/FeaturedSurveys.vue";

const router = useRouter();
const surveysSection = ref(null);

// 使用业务逻辑组合函数
const {
  // 数据
  searchQuery,
  selectedCategory,
  sortBy,
  currentPage,
  pageSize,
  loading,
  
  // 计算属性
  surveys,
  categories,
  filteredSurveys,
  totalSurveys,
  totalParticipants,
  
  // 方法
  loadData,
  getCategoryName,
  isFavorite,
  toggleFavorite,
  
  // 事件处理
  handleSearch,
  handleCategoryChange,
  handleSortChange,
  handlePageChange,
  handleSizeChange,
  
  // Store
  userStore
} = useHomeLogic();

// 路由跳转
const goToSurvey = (surveyId) => {
  router.push(`/surveys/${surveyId}`);
};

const goToProfile = () => {
  router.push('/profile');
};

const goToLogin = () => {
  router.push('/login');
};

const scrollToSurveys = () => {
  if (surveysSection.value) {
    surveysSection.value.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// 生命周期
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 欢迎横幅 */
.welcome-banner {
  position: relative;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 60px;
}

.banner-content {
  text-align: center;
  z-index: 2;
  max-width: 600px;
  padding: 0 20px;
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffffff, #e8f4fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.banner-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.banner-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.banner-actions .el-button {
  padding: 12px 32px;
  font-size: 1rem;
  border-radius: 25px;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.banner-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* 装饰元素 */
.banner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: -2s;
}

.circle-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 60%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 内容区域 */
.stats-wrapper,
.search-wrapper,
.featured-wrapper,
.surveys-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stats-wrapper {
  margin-bottom: 40px;
  transform: translateY(-30px);
}

.search-wrapper {
  margin-bottom: 40px;
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.featured-wrapper {
  margin-bottom: 60px;
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.surveys-section {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-bottom: 60px;
  padding: 0 20px;
}

.pagination-section .el-pagination {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-title {
    font-size: 2.5rem;
  }
  
  .banner-subtitle {
    font-size: 1.1rem;
  }
  
  .banner-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .banner-actions .el-button {
    width: 200px;
  }
  
  .search-wrapper,
  .featured-wrapper,
  .surveys-section {
    margin: 0 15px 30px;
    padding: 20px;
  }
  
  .stats-wrapper {
    padding: 0 15px;
  }
  
  .decoration-circle {
    display: none;
  }
}

@media (max-width: 480px) {
  .banner-title {
    font-size: 2rem;
  }
  
  .search-wrapper,
  .featured-wrapper,
  .surveys-section {
    margin: 0 10px 20px;
    padding: 15px;
  }
}
</style>
