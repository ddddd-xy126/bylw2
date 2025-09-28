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
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
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
          <el-button type="danger" :disabled="selectedItems.length === 0" @click="batchRemove">
            <el-icon><Delete /></el-icon>
            批量删除 ({{ selectedItems.length }})
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 收藏列表 -->
    <el-card class="collections-card" shadow="never">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="filteredCollections.length === 0" class="empty-container">
        <el-empty description="暂无收藏的问卷">
          <template #description>
            <p v-if="searchKeyword || categoryFilter">
              未找到符合条件的收藏问卷，请尝试其他筛选条件
            </p>
            <p v-else>
              您还没有收藏任何问卷，去<router-link to="/home">首页</router-link>发现更多精彩问卷吧！
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
          <span class="total-count">共 {{ filteredCollections.length }} 个收藏</span>
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
            
            <div class="survey-content" @click="goToSurvey(collection.surveyId)">
              <div class="survey-thumbnail">
                <img
                  :src="collection.thumbnail || '/images/default-survey.jpg'"
                  :alt="collection.title"
                  @error="handleImageError"
                />
                <div class="survey-overlay">
                  <el-icon><View /></el-icon>
                </div>
              </div>
              
              <div class="survey-info">
                <h3 class="survey-title" :title="collection.title">
                  {{ collection.title }}
                </h3>
                <p class="survey-description">
                  {{ collection.description }}
                </p>
                
                <div class="survey-meta">
                  <el-tag :type="getCategoryTagType(collection.category)" size="small">
                    {{ collection.category }}
                  </el-tag>
                  <span class="survey-author">{{ collection.author }}</span>
                  <span class="survey-participants">
                    <el-icon><User /></el-icon>
                    {{ collection.participants || 0 }}
                  </span>
                </div>
                
                <div class="survey-stats">
                  <span class="stat-item">
                    <el-icon><Clock /></el-icon>
                    {{ collection.duration }}分钟
                  </span>
                  <span class="stat-item">
                    <el-icon><Star /></el-icon>
                    {{ collection.rating || 0 }}
                  </span>
                  <span class="stat-item difficulty">
                    {{ collection.difficulty }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="survey-actions">
              <span class="collected-time">
                收藏于 {{ formatDate(collection.createdAt) }}
              </span>
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="goToSurvey(collection.surveyId)"
                >
                  开始答题
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="removeFavorite(collection.id, collection.surveyId)"
                  :loading="removingItems.includes(collection.id)"
                >
                  取消收藏
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="filteredCollections.length > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48]"
            :total="filteredCollections.length"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Delete, View, User, Clock, Star } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user';
import { getFavoritesApi, removeFavoriteApi } from '@/api/user';

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const collections = ref([]);
const categories = ref([]);
const searchKeyword = ref('');
const categoryFilter = ref('');
const sortBy = ref('newest');
const currentPage = ref(1);
const pageSize = ref(12);
const selectedItems = ref([]);
const removingItems = ref([]);

// 计算属性
const filteredCollections = computed(() => {
  let filtered = [...collections.value];
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.author.toLowerCase().includes(keyword)
    );
  }
  
  // 分类过滤
  if (categoryFilter.value) {
    filtered = filtered.filter(item => item.categoryId == categoryFilter.value);
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'participants':
        return (b.participants || 0) - (a.participants || 0);
      default:
        return 0;
    }
  });
  
  return filtered;
});

const paginatedCollections = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCollections.value.slice(start, end);
});

const selectAll = computed({
  get() {
    return selectedItems.value.length === paginatedCollections.value.length && paginatedCollections.value.length > 0;
  },
  set(value) {
    if (value) {
      selectedItems.value = paginatedCollections.value.map(item => item.id);
    } else {
      selectedItems.value = [];
    }
  }
});

const indeterminate = computed(() => {
  return selectedItems.value.length > 0 && selectedItems.value.length < paginatedCollections.value.length;
});

// 方法
const loadCollections = async () => {
  try {
    loading.value = true;
    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error('请先登录');
      return;
    }
    
    const favoriteSurveys = await getFavoritesApi(userId);
    collections.value = favoriteSurveys;
    
    // 提取分类信息
    const categorySet = new Set();
    favoriteSurveys.forEach(survey => {
      if (survey.categoryId && survey.category) {
        categorySet.add(JSON.stringify({
          id: survey.categoryId,
          name: survey.category
        }));
      }
    });
    
    categories.value = Array.from(categorySet).map(cat => JSON.parse(cat));
    
  } catch (error) {
    console.error('加载收藏失败:', error);
    ElMessage.error('加载收藏失败');
  } finally {
    loading.value = false;
  }
};

const removeFavorite = async (collectionId, surveyId) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消收藏这个问卷吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    removingItems.value.push(collectionId);
    
    const userId = userStore.profile?.id;
    await removeFavoriteApi(userId, surveyId);
    
    // 从列表中移除
    collections.value = collections.value.filter(item => item.id !== collectionId);
    
    // 从选中项中移除
    selectedItems.value = selectedItems.value.filter(id => id !== collectionId);
    
    ElMessage.success('取消收藏成功');
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error);
      ElMessage.error('取消收藏失败');
    }
  } finally {
    removingItems.value = removingItems.value.filter(id => id !== collectionId);
  }
};

const batchRemove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要取消收藏选中的 ${selectedItems.value.length} 个问卷吗？`,
      '批量操作确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    const userId = userStore.profile?.id;
    const itemsToRemove = collections.value.filter(item => selectedItems.value.includes(item.id));
    
    // 批量删除
    const promises = itemsToRemove.map(item => removeFavoriteApi(userId, item.surveyId));
    await Promise.all(promises);
    
    // 从列表中移除
    collections.value = collections.value.filter(item => !selectedItems.value.includes(item.id));
    
    selectedItems.value = [];
    ElMessage.success(`成功取消收藏 ${itemsToRemove.length} 个问卷`);
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量取消收藏失败:', error);
      ElMessage.error('批量取消收藏失败');
    }
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

const handlePageChange = (page) => {
  currentPage.value = page;
  selectedItems.value = [];
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  selectedItems.value = [];
};

const handleSelectAll = (checked) => {
  selectAll.value = checked;
};

const handleItemSelect = (itemId, checked) => {
  if (checked) {
    selectedItems.value.push(itemId);
  } else {
    selectedItems.value = selectedItems.value.filter(id => id !== itemId);
  }
};

const getCategoryTagType = (category) => {
  const types = {
    '心理健康': 'success',
    '学习能力': 'primary',
    '职业发展': 'warning',
    '生活方式': 'info',
    '兴趣爱好': 'success',
    '人际关系': 'warning',
    '情绪管理': 'danger',
    '认知能力': 'primary'
  };
  return types[category] || 'info';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const handleImageError = (event) => {
  event.target.src = '/images/default-survey.jpg';
};

// 监听分页变化，清空选中项
watch([currentPage, pageSize], () => {
  selectedItems.value = [];
});

// 生命周期
onMounted(() => {
  loadCollections();
});
</script>

<style scoped>
.collections-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
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
}

.empty-container a {
  color: #409eff;
  text-decoration: none;
}

.empty-container a:hover {
  text-decoration: underline;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
  margin-bottom: 24px;
}

.total-count {
  color: #909399;
  font-size: 14px;
}

.survey-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.survey-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #f0f2f5;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.survey-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.survey-item.selected {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.item-checkbox {
  margin-right: 16px;
  margin-top: 8px;
}

.survey-content {
  display: flex;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.survey-thumbnail {
  width: 120px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  margin-right: 16px;
}

.survey-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.survey-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.survey-thumbnail:hover .survey-overlay {
  opacity: 1;
}

.survey-overlay .el-icon {
  color: white;
  font-size: 24px;
}

.survey-info {
  flex: 1;
  min-width: 0;
}

.survey-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.survey-author {
  color: #909399;
  font-size: 13px;
}

.survey-participants {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.survey-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.stat-item.difficulty {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.survey-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-left: 16px;
}

.collected-time {
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 32px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .collections-page {
    padding: 0;
  }
  
  .page-header {
    margin-bottom: 16px;
  }
  
  .page-header h2 {
    font-size: 20px;
  }
  
  .filter-card :deep(.el-row) {
    flex-direction: column;
  }
  
  .filter-card :deep(.el-col) {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .survey-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .item-checkbox {
    align-self: flex-start;
    margin: 0 0 12px 0;
  }
  
  .survey-content {
    flex-direction: column;
  }
  
  .survey-thumbnail {
    width: 100%;
    height: 120px;
    margin: 0 0 12px 0;
  }
  
  .survey-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 12px 0 0 0;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-buttons .el-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .survey-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .survey-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .pagination-container :deep(.el-pagination) {
    justify-content: center;
  }
}
</style>