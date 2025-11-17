<template>
  <div class="collections-page">
    <div class="page-header">
      <h2>我的收藏</h2>
      <p>管理您收藏的问卷</p>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="16" align="middle">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索收藏的问卷..."
            prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="categoryFilter"
            placeholder="选择分类"
            clearable
            @change="handleCategoryChange"
          >
            <el-option label="全部分类" value="" />
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.name"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            @change="handleSortChange"
          >
            <el-option label="收藏时间（最新）" value="newest" />
            <el-option label="收藏时间（最早）" value="oldest" />
            <el-option label="问卷标题" value="title" />
            <el-option label="参与人数" value="participants" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button
            type="danger"
            :disabled="selectedItems.length === 0"
            @click="batchRemove"
          >
            <el-icon>
              <Delete />
            </el-icon>
            批量取消 ({{ selectedItems.length }})
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 收藏列表 -->
    <el-card class="collections-card" shadow="never">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="filteredTotal === 0" class="empty-container">
        <el-empty description="暂无收藏的问卷">
          <template #description>
            <p v-if="searchKeyword || categoryFilter">
              未找到符合条件的收藏问卷，请尝试其他筛选条件
            </p>
            <p v-else>
              您还没有收藏任何问卷，去<router-link to="/home">首页</router-link
              >发现更多精彩问卷吧！
            </p>
          </template>
        </el-empty>
      </div>

      <div v-else class="collections-list">
        <div class="list-header">
          <el-checkbox
            v-model="selectAll"
            :indeterminate="indeterminate"
            @change="handleSelectAll"
          >
            全选
          </el-checkbox>
          <span class="total-count">共 {{ filteredTotal }} 个收藏</span>
        </div>

        <div class="survey-grid">
          <div
            v-for="collection in paginatedCollections"
            :key="collection.id"
            class="survey-item"
            :class="{ selected: selectedItems.includes(collection.id) }"
          >
            <el-checkbox
              :model-value="selectedItems.includes(collection.id)"
              @change="(checked) => handleItemSelect(collection.id, checked)"
              class="item-checkbox"
            />

            <div class="survey-main" @click="goToSurvey(collection.surveyId)">
              <div class="survey-icon">
                <el-icon size="24" color="#F56C6C">
                  <Star />
                </el-icon>
              </div>

              <div class="survey-info">
                <div class="survey-header">
                  <h3 class="survey-title" :title="collection.title">
                    {{ collection.title }}
                  </h3>
                  <div class="survey-badges">
                    <el-tag
                      :type="getCategoryTagType(collection.category)"
                      size="small"
                    >
                      {{ collection.category }}
                    </el-tag>
                  </div>
                </div>

                <div class="survey-meta">
                  <span class="meta-item">
                    <el-icon>
                      <User />
                    </el-icon>
                    作者：{{ collection.author }}
                  </span>
                  <span class="meta-item">
                    <el-icon>
                      <User />
                    </el-icon>
                    参与人数：{{ collection.participantCount || 0 }}
                  </span>
                  <span class="meta-item">
                    <el-icon>
                      <Clock />
                    </el-icon>
                    {{ collection.duration }}分钟
                  </span>
                  <span class="meta-item">
                    <el-icon>
                      <Star />
                    </el-icon>
                    评分：{{ collection.averageRating || 0 }}
                  </span>
                </div>

                <div class="survey-description">
                  {{ collection.description }}
                </div>

                <div class="collected-time">
                  收藏于 {{ formatDate(collection.createdAt) }}
                </div>
              </div>
            </div>

            <div class="survey-actions">
              <el-button
                type="primary"
                @click.stop="goToSurvey(collection.surveyId)"
              >
                <el-icon>
                  <View />
                </el-icon>
                开始答题
              </el-button>
              <el-button
                type="danger"
                @click.stop="removeFavorite(collection.id, collection.surveyId)"
                :loading="removingItems.includes(collection.id)"
              >
                <el-icon>
                  <Delete />
                </el-icon>
                取消收藏
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="filteredTotal > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48]"
            :total="filteredTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChangeLocal"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Delete,
  View,
  User,
  Clock,
  Star,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user";
import { getFavoritesApi, removeFavoriteApi } from "@/api/user";
import { getCategoriesApi } from "@/api/survey";
import { useListFilter } from "@/hooks/useListFilter";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const collections = ref([]);
const categories = ref([]);
const categoryFilter = ref("");
const sortBy = ref("newest");
const selectedItems = ref([]);
const removingItems = ref([]);

// 计算属性
// 先按分类/状态对源数据做预过滤（categoryFilter 为组件本地控制）
const sourceForFilter = computed(() => {
  let list = [...collections.value];
  if (categoryFilter.value) {
    list = list.filter((item) => item.category === categoryFilter.value);
  }
  return list;
});

// 根据 sortBy 返回比较函数（传入 hooks 使用）
const sortFn = (a, b) => {
  switch (sortBy.value) {
    case "newest":
      return new Date(b.createdAt) - new Date(a.createdAt);
    case "oldest":
      return new Date(a.createdAt) - new Date(b.createdAt);
    case "title":
      return a.title.localeCompare(b.title);
    case "participants":
      return (b.participantCount || 0) - (a.participantCount || 0);
    default:
      return 0;
  }
};

const {
  searchKeyword,
  currentPage,
  pageSize,
  filteredList: paginatedCollections,
  filteredTotal,
  handleSearch,
  handleFilter,
  handlePageChange,
} = useListFilter({
  sourceList: sourceForFilter,
  searchFields: ["title", "description", "author"],
  sortFn,
});

const selectAll = computed({
  get() {
    return (
      selectedItems.value.length === paginatedCollections.value.length &&
      paginatedCollections.value.length > 0
    );
  },
  set(value) {
    if (value) {
      selectedItems.value = paginatedCollections.value.map((item) => item.id);
    } else {
      selectedItems.value = [];
    }
  },
});

const indeterminate = computed(() => {
  return (
    selectedItems.value.length > 0 &&
    selectedItems.value.length < paginatedCollections.value.length
  );
});

// 方法
const loadCategories = async () => {
  try {
    categories.value = await getCategoriesApi();
  } catch (error) {
    console.error("加载分类失败:", error);
    ElMessage.error("加载分类失败");
    categories.value = [];
  }
};

const loadCollections = async () => {
  try {
    loading.value = true;
    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error("请先登录");
      return;
    }

    const favoriteSurveys = await getFavoritesApi(userId);
    collections.value = favoriteSurveys;
  } catch (error) {
    console.error("加载收藏失败:", error);
    ElMessage.error("加载收藏失败");
  } finally {
    loading.value = false;
  }
};

const removeFavorite = async (collectionId, surveyId) => {
  try {
    await ElMessageBox.confirm("确定要取消收藏这个问卷吗？", "确认操作", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    removingItems.value.push(collectionId);

    const userId = userStore.profile?.id;
    await removeFavoriteApi(userId, surveyId);

    // 从列表中移除
    collections.value = collections.value.filter(
      (item) => item.id !== collectionId
    );

    // 从选中项中移除
    selectedItems.value = selectedItems.value.filter(
      (id) => id !== collectionId
    );

    ElMessage.success("取消收藏成功");
  } catch (error) {
    if (error !== "cancel") {
      console.error("取消收藏失败:", error);
      ElMessage.error("取消收藏失败");
    }
  } finally {
    removingItems.value = removingItems.value.filter(
      (id) => id !== collectionId
    );
  }
};

const batchRemove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要取消收藏选中的 ${selectedItems.value.length} 个问卷吗？`,
      "批量操作确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const userId = userStore.profile?.id;
    const itemsToRemove = collections.value.filter((item) =>
      selectedItems.value.includes(item.id)
    );

    // 批量删除
    const promises = itemsToRemove.map((item) =>
      removeFavoriteApi(userId, item.surveyId)
    );
    await Promise.all(promises);

    // 从列表中移除
    collections.value = collections.value.filter(
      (item) => !selectedItems.value.includes(item.id)
    );

    selectedItems.value = [];
    ElMessage.success(`成功取消收藏 ${itemsToRemove.length} 个问卷`);
  } catch (error) {
    if (error !== "cancel") {
      console.error("批量取消收藏失败:", error);
      ElMessage.error("批量取消收藏失败");
    }
  }
};

const goToSurvey = (surveyId) => {
  router.push(`/surveys/${surveyId}`);
};

const handleCategoryChange = () => {
  // pre-filter changed, reset page
  handleFilter();
};

const handleSortChange = () => {
  // sortFn reads sortBy ref dynamically; just reset page
  currentPage.value = 1;
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  selectedItems.value = [];
};

const handlePageChangeLocal = (page) => {
  handlePageChange(page);
  selectedItems.value = [];
};

const handleSelectAll = (checked) => {
  selectAll.value = checked;
};

const handleItemSelect = (itemId, checked) => {
  if (checked) {
    selectedItems.value.push(itemId);
  } else {
    selectedItems.value = selectedItems.value.filter((id) => id !== itemId);
  }
};

const getCategoryTagType = (categoryName) => {
  // 从 API 获取的分类数据中查找对应的分类
  const categoryObj = categories.value.find((cat) => cat.name === categoryName);

  // 如果找到分类且有 color 属性，使用它；否则根据分类名称使用默认颜色
  if (categoryObj?.color) {
    return categoryObj.color;
  }

  // 默认颜色映射（备用方案）
  const defaultTypes = {
    心理健康: "success",
    学习能力: "primary",
    职业发展: "warning",
    生活方式: "info",
    兴趣爱好: "success",
    人际关系: "warning",
    情绪管理: "danger",
    认知能力: "primary",
  };
  return defaultTypes[categoryName] || "info";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// 监听分页变化，清空选中项
watch([currentPage, pageSize], () => {
  selectedItems.value = [];
});

// 生命周期
onMounted(() => {
  loadCategories();
  loadCollections();
});
</script>

<style scoped lang="scss">
.collections-page {
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0;
  }
}

.page-header {
  margin-bottom: 24px;

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }

  h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #303133;

    @media (max-width: 768px) {
      font-size: 20px;
    }
  }

  p {
    margin: 0;
    color: #606266;
    font-size: 14px;
  }
}

.filter-card {
  margin-bottom: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;

  @media (max-width: 768px) {
    :deep(.el-row) {
      flex-direction: column;
    }

    :deep(.el-col) {
      width: 100%;
      margin-bottom: 12px;
    }
  }
}

.collections-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.loading-container {
  padding: 24px;
}

.empty-container {
  padding: 48px 24px;
  text-align: center;

  a {
    color: var(--color-primary-light-3);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
  margin-bottom: 24px;

  .total-count {
    color: #909399;
    font-size: 14px;
  }
}

.survey-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.survey-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid #f56c6c;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  &.selected {
    border-left-color: var(--color-primary-light-3);
    background-color: #f0f9ff;
  }

  .item-checkbox {
    flex-shrink: 0;

    @media (max-width: 768px) {
      align-self: flex-start;
      margin-bottom: 12px;
    }
  }

  .survey-main {
    display: flex;
    align-items: center;
    flex: 1;
    cursor: pointer;
    gap: 16px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .survey-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: #fef0f0;
    border-radius: 12px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 40px;
      height: 40px;
    }
  }

  .survey-info {
    flex: 1;
    min-width: 0;

    .survey-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }

    .survey-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .survey-badges {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .survey-description {
      margin: 0 0 12px 0;
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .survey-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #606266;
        font-size: 14px;

        &.difficulty {
          background: #f0f2f5;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
      }
    }

    .collected-time {
      color: #909399;
      font-size: 12px;
      margin-top: 8px;
    }
  }

  .survey-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
    min-width: 120px;

    .el-button,
    :deep(.el-dropdown) {
      width: 100%;
    }

    :deep(.el-dropdown .el-button) {
      width: 100%;
    }

    .el-button + .el-button {
      margin-left: 0;
    }

    @media (max-width: 768px) {
      width: 100%;
      justify-content: center;
    }

    @media (max-width: 480px) {
      flex-direction: column;
      width: 100%;
    }
  }
}

.pagination-container {
  margin-top: 32px;
  text-align: center;

  @media (max-width: 480px) {
    :deep(.el-pagination) {
      justify-content: center;
    }
  }
}
</style>
