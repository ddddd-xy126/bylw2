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
import { ref, onMounted, inject, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useHomeLogic } from "@/composables/useHomeLogic";
import { useListFilter } from '@/hooks/useListFilter'
import StatsCards from "./components/StatsCards.vue";
import SurveyList from "./components/SurveyList.vue";

const router = useRouter();
const surveysSection = ref(null);

// 使用业务逻辑组合函数（只取数据和必要方法）
const {
  surveys,
  categories,
  totalParticipants,
  loadData,
  getCategoryName,
  isFavorite,
  toggleFavorite,
  loading,
  userStore,
} = useHomeLogic();

// 把 surveys 交给 useListFilter 管理客户端搜索/分类/分页
const sourceList = computed(() => (surveys.value || []).map(s => ({
  ...s,
  // 用于全文搜索
  searchText: `${s.title || ''} ${s.description || ''} ${(s.tags || []).join(' ')}`
})))

const {
  searchKeyword,
  filterCategory,
  sortBy,
  currentPage,
  pageSize,
  filteredList,
  filteredTotal,
  handleSearch,
  handleFilter,
  handleSort,
  handlePageChange,
  handleSizeChange,
} = useListFilter({ sourceList, searchFields: ['searchText'] })

// 为模板保持兼容名称
const filteredSurveys = filteredList
const totalSurveys = filteredTotal

// 从导航栏注入搜索和筛选
const headerSearch = inject('headerSearch', null);
if (headerSearch) {
  watch(() => headerSearch.searchQuery.value, (newVal) => {
    searchKeyword.value = newVal;
    handleSearch();
  });

  watch(() => headerSearch.selectedCategory.value, (newVal) => {
    filterCategory.value = newVal;
    handleFilter();
  });
}

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
  /* background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); */
}

/* 欢迎横幅 */
.welcome-banner {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #586abd 0%, #8c71a7 100%);
  color: white;
  margin-bottom: 40px;
}

.banner-content {
  text-align: center;
  z-index: 2;
  max-width: 600px;
  padding: 0 20px;
}

.banner-title {
  font-size: 3.2rem;
  font-weight: 800;
  margin-bottom: 1.2rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #e8f4fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.banner-subtitle {
  font-size: 1.3rem;
  margin-bottom: 2.5rem;
  opacity: 0.95;
  line-height: 1.7;
  font-weight: 400;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.banner-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.banner-actions .el-button {
  padding: 14px 36px;
  font-size: 1.05rem;
  border-radius: 50px;
  border: none;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.banner-actions .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.banner-actions .el-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
}

.banner-actions .el-button:hover::before {
  left: 100%;
}


/* 内容区域 */
.stats-wrapper,
.surveys-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stats-wrapper {
  margin-bottom: 32px;
  transform: translateY(-20px);
}

.surveys-section {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
  padding: 36px 32px;
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(102, 126, 234, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(182, 182, 182, 0.8);
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.surveys-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #586abd 0%, #8c71a7 100%);
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  padding: 0 20px;
}

.pagination-section .el-pagination {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
  padding: 24px 32px;
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(102, 126, 234, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* 添加滚动动画 */
.stats-wrapper,
.surveys-section {
  animation: fadeInUp 0.6s ease-out;
}

.surveys-section {
  animation-delay: 0.1s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 悬停效果 */
.surveys-section:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 16px 48px rgba(102, 126, 234, 0.16),
    0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-title {
    font-size: 2.4rem;
  }
  
  .banner-subtitle {
    font-size: 1.15rem;
  }
  
  .banner-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .banner-actions .el-button {
    width: 200px;
  }
  
  .surveys-section {
    margin: 0 15px 24px;
    padding: 24px 20px;
    border-radius: 20px;
  }
  
  .stats-wrapper {
    padding: 0 15px;
  }
  
  .decoration-circle {
    display: none;
  }
  
  .banner-actions .el-button {
    padding: 12px 28px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .banner-title {
    font-size: 2rem;
    letter-spacing: -0.01em;
  }
  
  .banner-subtitle {
    font-size: 1.1rem;
  }
  
  .surveys-section {
    margin: 0 10px 20px;
    padding: 20px 16px;
    border-radius: 16px;
  }
  
  .banner-actions .el-button {
    padding: 10px 24px;
    font-size: 0.95rem;
  }
  
  .welcome-banner {
    min-height: 400px;
  }
}
</style>
