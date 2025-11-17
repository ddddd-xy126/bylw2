<template>
  <div class="list-page">
    <div class="list-header">
      <h2>问卷列表</h2>
      <p class="sub">浏览平台上所有公开问卷，可按分类筛选并搜索</p>

      <div class="list-search">
        <el-input
          v-model="searchQuery"
          placeholder="搜索问卷标题或描述或标签"
          clearable
          @input="handleSearch"
          size="small"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <div class="category-buttons">
          <el-button
            :type="isSelected(null) ? 'primary' : 'default'"
            @click="selectCategory(null)"
            size="small"
            class="category-btn"
            >全部</el-button
          >
          <el-button
            v-for="cat in categories"
            :key="cat.id"
            :type="isSelected(cat.id) ? 'primary' : 'default'"
            @click="selectCategory(cat.id)"
            size="small"
            class="category-btn"
          >
            {{ cat.name }}
          </el-button>
        </div>
      </div>
    </div>

    <div class="surveys-area">
      <SurveyList
        v-model:sort-by="sortBy"
        :surveys="paginatedSurveys"
        :loading="loading"
        :is-favorite="isFavorite"
        :show-favorite="userStore.isLoggedIn"
        :show-sort="false"
        @toggle-favorite="toggleFavorite"
        @survey-click="goToSurvey"
        @survey-start="goToSurvey"
      />
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="totalSurveys > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalSurveys"
        layout="prev, pager, next, jumper, total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import SurveyList from "./components/SurveyList.vue";
import { useHomeLogic } from "@/composables/useHomeLogic";

const router = useRouter();
const {
  surveys,
  categories,
  selectedCategory,
  sortBy,
  loading,
  loadData,
  isFavorite,
  toggleFavorite,
  handleCategoryChange,
  searchQuery,
  handleSearch,
  userStore,
} = useHomeLogic();

// 分页相关
const currentPage = ref(1);
const pageSize = ref(12);

// 选择分类
const selectCategory = (catId) => {
  selectedCategory.value = catId;
  currentPage.value = 1; // 重置页码
  handleCategoryChange();
};

//将问卷的 categoryId 统一成字符串形式返回；如果缺失则尝试通过 survey.category 名称或 slug 在 categories 中查找
const getSurveyCategoryId = (s) => {
  if (s == null) return undefined;
  if (s.categoryId !== undefined && s.categoryId !== null)
    return String(s.categoryId);
  // 尝试匹配 category 字段（名称或 slug）
  const catField = s.category || s.categoryName || s.categorySlug;
  if (!catField) return undefined;
  const found = (categories.value || []).find(
    (c) =>
      String(c.id) === String(catField) ||
      (c.name && c.name.toLowerCase() === String(catField).toLowerCase()) ||
      (c.slug && c.slug.toLowerCase() === String(catField).toLowerCase())
  );
  return found ? String(found.id) : undefined;
};

const isSelected = (catId) => {
  // 当 selectedCategory 为 null/undefined 时，认为当前选择是“全部”
  if (selectedCategory.value === null || selectedCategory.value === undefined) {
    return catId === null || catId === undefined;
  }
  return String(selectedCategory.value) === String(catId);
};

// 根据 selectedCategory 过滤和排序
const surveysToShow = computed(() => {
  const list = Array.isArray(surveys.value)
    ? surveys.value.filter(
        (s) => s.status === "published" && s.isCollecting !== false
      )
    : [];
  // 如果选择了分类,通过统一的 categoryId 字符串进行匹配(兼容数字/字符串以及缺失 categoryId 的问卷)
  let filtered = list;
  if (selectedCategory.value) {
    filtered = list.filter((s) => {
      const sid = getSurveyCategoryId(s);
      return sid ? sid === String(selectedCategory.value) : false;
    });
  }
  // 排序逻辑：和 useHomeLogic 保持一致
  const result = [...filtered];
  switch (sortBy.value) {
    case "latest":
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "hot":
      result.sort(
        (a, b) => (b.participantCount || 0) - (a.participantCount || 0)
      );
      break;
    case "recommended":
      result.sort((a, b) => {
        const scoreA =
          (a.averageRating || 0) * 0.6 +
          ((a.participantCount || 0) / 1000) * 0.4;
        const scoreB =
          (b.averageRating || 0) * 0.6 +
          ((b.participantCount || 0) / 1000) * 0.4;
        return scoreB - scoreA;
      });
      break;
  }
  return result;
});

// 分页后的问卷列表
const paginatedSurveys = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return surveysToShow.value.slice(start, end);
});

// 总数
const totalSurveys = computed(() => surveysToShow.value.length);

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const goToSurvey = (id) => router.push(`/surveys/${id}`);

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.list-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30px 285px;
  background-color: var(--theme-background-color);
  min-height: 100vh;

  .list-header {
    background: var(--text-inverse);
    border-radius: 12px;
    padding: 25px 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    h2 {
      font-size: 22px;
      color: #333;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .sub {
      font-size: 14px;
      color: #888;
      margin-bottom: 16px;
    }

    .list-search {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .el-input {
        width: 300px;
      }

      .category-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .category-btn {
          transition: all 0.2s ease;
          border-radius: 20px;
          font-size: 13px;
          padding: 6px 14px;

          &:hover {
            color: var(--color-success-light);
            border-color: var(--color-success-light);
          }

          &.is-active {
            background-color: var(--color-success-light);
            color: var(--text-inverse);
            border-color: var(--color-success-light);
          }
        }
      }
    }
  }

  .surveys-area {
    background: var(--text-inverse);
    border-radius: 12px;
    padding: 25px 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    background: var(--text-inverse);
    border-radius: 12px;
  }

  /* 响应式 */
  @media (max-width: 768px) {
    padding: 20px;

    .list-header {
      padding: 20px;

      .list-search {
        .el-input {
          width: 100%;
        }

        .category-buttons {
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>
