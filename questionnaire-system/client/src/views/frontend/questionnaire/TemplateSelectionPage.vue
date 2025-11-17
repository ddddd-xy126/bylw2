<template>
  <div class="template-selection">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <el-button @click="goBack" type="text" size="large" class="back-button">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回
        </el-button>
        <h1>选择问卷模板</h1>
        <p>从专业设计的模板中选择，快速创建高质量问卷</p>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <div class="filter-content">
        <div class="search-bar">
          <el-input v-model="searchKeyword" placeholder="搜索模板名称或关键词..." size="large" @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-controls">
          <el-select v-model="filterCategory" placeholder="选择分类" size="large" @change="handleFilter" clearable>
            <el-option v-for="category in categories" :key="category.value" :label="category.label"
              :value="category.value" />
          </el-select>

          <el-select v-model="sortBy" placeholder="排序方式" size="large" @change="handleSort">
            <el-option label="最受欢迎" value="popular" />
            <el-option label="最新创建" value="newest" />
            <el-option label="评分最高" value="rating" />
            <el-option label="使用最多" value="usage" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <div class="nav-content">
        <div class="nav-label">热门分类：</div>
        <div class="nav-tags">
          <el-tag v-for="category in popularCategories" :key="category.value"
            :type="filterCategory === category.value ? 'primary' : ''"
            :effect="filterCategory === category.value ? 'dark' : 'plain'" class="category-tag"
            @click="selectCategory(category.value)">
            {{ category.label }}
          </el-tag>
          <el-tag v-if="filterCategory" type="info" class="category-tag clear-tag" @click="clearCategory">
            清除筛选
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 模板网格 -->
    <div class="templates-section">
      <div class="templates-header">
        <h2>
          <span>共找到 {{ filteredTotal }} 个模板</span>
        </h2>
      </div>

      <div v-if="loading" class="loading-section">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="filteredTotal === 0" class="empty-section">
        <el-empty description="没有找到符合条件的模板">
          <el-button @click="clearFilters">清除筛选条件</el-button>
        </el-empty>
      </div>

      <div v-else class="templates-grid">
        <TemplateCard v-for="template in filteredList" :key="template.id" :template="template" @click="selectTemplate"
          @use="useTemplate" @preview="showPreview" />
      </div>

      <!-- 分页 -->
      <div class="pagination-section" v-if="filteredTotal > pageSize">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[12, 24, 48]"
          :total="filteredTotal" layout="total, sizes, prev, pager, next, jumper" @current-change="handlePageChange"
          @size-change="handleSizeChange" />
      </div>
    </div>

    <!-- 预览对话框 -->
    <TemplatePreviewDialog v-model="previewVisible" :template="previewTemplate" @use="useTemplate" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useListFilter } from '@/hooks/useListFilter'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Search,
  Document,
  Clock,
  Star,
  StarFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import TemplateCard from './components/TemplateCard.vue'
import TemplatePreviewDialog from './components/TemplatePreviewDialog.vue'
import { useTemplates } from '@/composables/useTemplates'

const router = useRouter()

// 响应式数据
const sortBy = ref('popular')
const userFavorites = ref([])

// 使用 composable
const {
  templates,
  categories,
  loading,
  previewVisible,
  previewTemplate,
  loadTemplates,
  loadCategories,
  showPreview: handleShowPreview
} = useTemplates()

const popularCategories = computed(() => categories.value.slice(0, 6))

// 将原始 templates 包装为 hook 的 sourceList：添加 category 与 searchText 字段以支持分类与 tags 搜索
const sourceList = computed(() =>
  templates.value.map((t) => ({
    ...t,
    // hook 默认按 item.category 做分类过滤；确保 categoryValue 存在
    category: t.categoryValue || t.category,
    categoryValue: t.categoryValue || t.category,
    // 用于全文搜索（包括 tags）
    searchText: `${t.title} ${t.description} ${t.tags?.join(' ') || ''}`,
    // 确保数值字段存在
    usageCount: t.usageCount || t.participantCount || 0,
    isHot: t.isHot !== undefined ? t.isHot : ((t.participantCount || 0) > 1500),
    isNew: t.isNew !== undefined ? t.isNew : (new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    isPro: t.isPro || false
  }))
)

// 自定义排序函数，基于外部的 sortBy
const sortFn = (a, b) => {
  switch (sortBy.value) {
    case 'newest':
      return b.id - a.id
    case 'rating':
      return b.rating - a.rating
    case 'usage':
      return b.usageCount - a.usageCount
    case 'popular':
    default:
      const scoreA = a.rating * 0.5 + (a.usageCount / 1000) * 0.3 + (a.isHot ? 0.2 : 0)
      const scoreB = b.rating * 0.5 + (b.usageCount / 1000) * 0.3 + (b.isHot ? 0.2 : 0)
      return scoreB - scoreA
  }
}

// 使用通用 hook 管理搜索/筛选/分页
const {
  searchKeyword,
  filterCategory,
  currentPage,
  pageSize,
  filteredList,
  filteredTotal,
  handleSearch,
  handleFilter,
  handleSort,
  handlePageChange,
} = useListFilter({ sourceList, searchFields: ['searchText'], sortFn })

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadData(),
    loadCategories()
  ])
})

// 方法
const loadData = async () => {
  await loadTemplates()
}

const goBack = () => {
  router.go(-1)
}

const selectCategory = (category) => {
  filterCategory.value = filterCategory.value === category ? '' : category
  currentPage.value = 1
}

const clearCategory = () => {
  filterCategory.value = ''
  currentPage.value = 1
}

const clearFilters = () => {
  searchKeyword.value = ''
  filterCategory.value = ''
  sortBy.value = 'popular'
  currentPage.value = 1
}

const selectTemplate = (template) => {
  router.push(`/create/template/${template.id}`)
}

const useTemplate = (template) => {
  router.push(`/create/template/${template.id}`)
}

const showPreview = (template) => {
  handleShowPreview(template)
}
</script>


<style scoped lang="scss">
.template-selection {
  min-height: 100vh;
  background: var(--theme-background-color);
  padding: 30px 285px;
}

.header-section {
  margin-bottom: 32px;

  .header-content {
    position: relative;

    .back-button {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;



    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      text-align: center;
      margin-bottom: 12px;
    }

    p {
      font-size: 1.125rem;
      color: #666;
      text-align: center;
      margin: 0;
    }
  }
}

.filter-section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;

  .filter-content {
    display: flex;
    gap: 16px;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
    }

    .search-bar {
      flex: 2;
    }

    .filter-controls {
      flex: 1;
      display: flex;
      gap: 12px;

      @media (max-width: 768px) {
        width: 100%;
      }
    }
  }
}

.category-nav {
  background: #f8f9fa;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 32px;

  .nav-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .nav-label {
      font-weight: 500;
      color: #666;
      white-space: nowrap;
    }

    .nav-tags {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }
}

.category-tag {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  .clear-tag {
    margin-left: 8px;
  }
}

.templates-section {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .templates-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 24px;
  }

  .loading-section,
  .empty-section {
    padding: 40px 0;
    text-align: center;
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 32px;

    @media (max-width: 1400px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>