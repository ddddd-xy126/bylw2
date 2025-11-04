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
        <TemplateCard
          v-for="template in filteredList" 
          :key="template.id"
          :template="template"
          @click="selectTemplate"
          @use="useTemplate"
          @preview="showPreview"
        />
      </div>

      <!-- 分页 -->
      <div class="pagination-section" v-if="filteredTotal > pageSize">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[12, 24, 48]"
          :total="filteredTotal" layout="total, sizes, prev, pager, next, jumper" @current-change="handlePageChange"
          @size-change="handleSizeChange" />
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" :title="previewTemplate?.title" width="80%" class="preview-dialog">
      <div v-if="previewTemplate" class="template-preview">
        <div class="preview-info">
          <div class="info-row">
            <span class="info-label">分类：</span>
            <span>{{ previewTemplate.category }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">问题数：</span>
            <span>{{ previewTemplate.questions }}题</span>
          </div>
          <div class="info-row">
            <span class="info-label">预计时长：</span>
            <span>{{ previewTemplate.duration }}分钟</span>
          </div>
          <div class="info-row">
            <span class="info-label">评分：</span>
            <el-rate v-model="previewTemplate.rating" disabled size="small" />
            <span>{{ previewTemplate.rating }}分</span>
          </div>
        </div>

        <div class="preview-sections">
          <div v-for="(section, index) in previewTemplate.template.sections" :key="index" class="preview-section">
            <h4>{{ section.title }}</h4>
            <div v-for="(question, qIndex) in section.questions" :key="qIndex" class="preview-question">
              <div class="question-header">
                <span class="question-number">{{ qIndex + 1 }}.</span>
                <span class="question-title">{{ question.title }}</span>
                <span v-if="question.required" class="required-mark">*</span>
              </div>
              <div class="question-type">{{ getQuestionTypeText(question.type) }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="usePreviewTemplate">
          使用此模板
        </el-button>
      </template>
    </el-dialog>
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
import TemplateCard from '@/components/TemplateCard.vue'
import { getTemplatesApi } from '@/api/survey'

const router = useRouter()

// 响应式数据
const sortBy = ref('popular')
const loading = ref(false)
const previewVisible = ref(false)
const previewTemplate = ref(null)
const userFavorites = ref([])

// 从 db.json 获取的模板数据
const templates = ref([])

// 分类数据
const categories = ref([
  { label: '企业管理', value: 'enterprise' },
  { label: '产品研发', value: 'product' },
  { label: '心理健康', value: 'psychology' },
  { label: '教育培训', value: 'education' },
  { label: '市场调研', value: 'market' },
  { label: '用户体验', value: 'ux' },
  { label: '学术研究', value: 'academic' },
  { label: '活动反馈', value: 'event' }
])

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
    usageCount: t.usageCount || t.participants || 0,
    isHot: t.isHot !== undefined ? t.isHot : (t.participants > 1500),
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

// page size change

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 使用 API 获取模板
    const templateData = await getTemplatesApi()
    
    // 处理数据格式
    templates.value = templateData.map(t => ({
      ...t,
      category: t.category || '其他',
      categoryValue: t.categoryValue || t.category,
      questions: t.questions?.length || 0,
      tags: t.tags || [],
      isHot: t.participants > 1500 || false,
      isNew: new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isPro: t.isPro || false
    }))
  } catch (error) {
    ElMessage.error('加载模板失败：' + error.message)
    templates.value = []
  } finally {
    loading.value = false
  }
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
  ElMessage.success(`正在使用模板：${template.title}`)
  router.push(`/create/template/${template.id}`)
}

const showPreview = (template) => {
  previewTemplate.value = template
  previewVisible.value = true
}

const usePreviewTemplate = () => {
  if (previewTemplate.value) {
    useTemplate(previewTemplate.value)
    previewVisible.value = false
  }
}

// const isFavorite = (templateId) => {
//   return userFavorites.value.includes(templateId)
// }

// const toggleFavorite = (templateId) => {
//   const index = userFavorites.value.indexOf(templateId)
//   if (index > -1) {
//     userFavorites.value.splice(index, 1)
//     ElMessage.info('已取消收藏')
//   } else {
//     userFavorites.value.push(templateId)
//     ElMessage.success('已添加到收藏')
//   }
// }

const getQuestionTypeText = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'text': '文本题',
    'rating': '评分题',
    'likert': '量表题'
  }
  return typeMap[type] || '未知题型'
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

.preview-dialog {
  .template-preview {
    max-height: 60vh;
    overflow-y: auto;
  }

  .preview-info {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        font-weight: 500;
        color: #333;
        min-width: 80px;
      }
    }
  }

  .preview-sections {
    display: flex;
    flex-direction: column;

    .preview-section {
      margin-bottom: 24px;

      h4 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e5e7eb;
      }
    }

    .preview-question {
      background: #f9fafb;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 12px;

      .question-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .question-number {
          font-weight: 600;
          color: var(--color-primary-light-3);
        }

        .question-title {
          flex: 1;
          font-weight: 500;
          color: #333;
        }

        .required-mark {
          color: #f56c6c;
          font-weight: 600;
        }
      }

      .question-type {
        font-size: 0.875rem;
        color: #888;
      }
    }
  }
}
</style>