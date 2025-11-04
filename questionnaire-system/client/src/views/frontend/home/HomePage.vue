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
          <el-button v-if="userStore.isLoggedIn" type="success" size="large" @click="goToProfile">
            我的中心
          </el-button>
          <el-button v-else size="large" @click="goToLogin">
            立即登录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-wrapper">
      <StatsCards 
        :total-surveys="totalSurveys" 
        :total-participants="totalParticipants"
        :user-favorites="userFavorites" 
        :user-points="userPoints" 
      />
    </div>

    <!-- 问卷列表 -->
    <div class="surveys-section" ref="surveysSection">
      <SurveyList v-model:sort-by="sortBy" :surveys="topSurveys" :loading="loading" :get-category-name="getCategoryName"
        :is-favorite="isFavorite" :show-favorite="userStore.isLoggedIn" @sort-change="handleSortChange"
        @survey-click="goToSurvey" @survey-start="goToSurvey" @toggle-favorite="toggleFavorite" />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
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
  totalSurveys,
  totalParticipants,
  userFavorites,
  userPoints,
  loadData,
  getCategoryName,
  isFavorite,
  toggleFavorite,
  loading,
  userStore,
} = useHomeLogic();

// 首页顶部展示的问卷限制为最多 20 条（最新/热门/推荐展示的预览）
const topSurveys = computed(() => (filteredSurveys.value || []).slice(0, 20));

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
  filteredList,
  handleSearch,
  handleFilter,
  handleSort,
} = useListFilter({ sourceList, searchFields: ['searchText'] })

// 首页默认展示 推荐 排序
sortBy.value = 'recommended';
handleSort();

// 为模板保持兼容名称（只需要 filteredSurveys；展示上限由 topSurveys 控制）
const filteredSurveys = filteredList

// 导航栏的全局搜索已移除；首页保持自身筛选逻辑

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

// 在 SurveyList 发出 sort-change 时触发的处理器
const handleSortChange = () => {
  // 使用 useListFilter 提供的 handleSort 来重新排序过滤后的列表
  handleSort();
};

// 生命周期
onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.home {
  font-family: "Segoe UI", "PingFang SC", sans-serif;
  background: var(--theme-background-color);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  /* ======================
     顶部欢迎横幅
  ====================== */
  .welcome-banner {
    position: relative;
    width: 100%;
    height: 70vh;
    background: radial-gradient(circle at 30% 30%,
        rgba(85, 214, 145, 0.932),
        rgba(9, 145, 27, 0.05)),
      linear-gradient(135deg, #f3fff7, #e0f8ea);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    overflow: hidden;

    .banner-content {
      z-index: 2;
      max-width: 800px;
      padding: 0 20px;

      .banner-title {
        font-size: 3.5rem;
        font-weight: 700;
        color: var(--color-primary-dark-2);
        margin-bottom: 0.5rem;
        letter-spacing: 1px;
        animation: fadeInDown 1s ease;
      }

      .banner-subtitle {
        font-size: 1.25rem;
        color: var(--color-gray-700);
        margin-bottom: 2rem;
        font-weight: 400;
        animation: fadeInUp 1.2s ease;
      }

      .banner-actions {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        flex-wrap: wrap;

        .el-button {
          border-radius: var(--radius-full);
          padding: 0.8rem 2.2rem;
          font-weight: 400;
          font-size: 1rem;
          box-shadow: 0 4px 14px rgba(9, 145, 27, 0.25);
          transition: all 0.25s ease;
          background: linear-gradient(135deg,
              var(--color-primary-light-2),
              var(--color-primary-dark-1));
          border: none;
          color: #fff;

          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 18px rgba(9, 145, 27, 0.35);
          }
        }

        .el-button[type="success"] {
          background: linear-gradient(135deg,
              var(--color-accent-4),
              var(--color-primary-dark-2));
        }

        .el-button:not([type]) {
          background: linear-gradient(135deg, #fff, #f0f0f0);
          color: var(--color-primary-dark-2);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-base);

          &:hover {
            background: #fff;
            transform: translateY(-3px);
          }
        }
      }
    }

    /* 光斑背景 */
    &::before {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle,
          rgba(9, 145, 27, 0.1),
          transparent 70%);
      animation: rotateLight 10s linear infinite;
      z-index: 1;
    }
  }

  /* ======================
   统计信息区域
====================== */
  .stats-wrapper {
    position: relative;
    width: 90%;
    max-width: 1200px;
    background: #ffffff;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    padding: 2.5rem 2rem;
    margin-top: 3rem;
    z-index: 3;
    animation: fadeIn 1.2s ease;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }
  }


  /* ======================
     问卷展示区
  ====================== */
  .surveys-section {
    width: 100%;
    padding: 4rem 2rem 6rem;
    display: flex;
    justify-content: center;

    >* {
      width: 90%;
      max-width: 1200px;
      animation: fadeInUp 1.5s ease;
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: var(--color-primary-light-3);
      border-radius: 10px;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotateLight {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
