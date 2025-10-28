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
        <div v-for="template in filteredList" :key="template.id" class="template-card"
          @click="selectTemplate(template)">
          <!-- 模板标签 -->
          <div class="template-badges">
            <span v-if="template.isHot" class="badge hot-badge">🔥 热门</span>
            <span v-if="template.isNew" class="badge new-badge">🆕 新品</span>
            <span v-if="template.isPro" class="badge pro-badge">💎 专业版</span>
          </div>

          <!-- 模板内容 -->
          <div class="template-header">
            <div class="template-icon">
              <el-icon size="32">
                <Document />
              </el-icon>
            </div>
            <div class="template-category">{{ template.category }}</div>
          </div>

          <div class="template-body">
            <h3>{{ template.title }}</h3>
            <p>{{ template.description }}</p>

            <div class="template-stats">
              <div class="stat-group">
                <div class="stat-item">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span>{{ template.questions }}题</span>
                </div>
                <div class="stat-item">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  <span>{{ template.duration }}分钟</span>
                </div>
              </div>

              <div class="rating-group">
                <el-rate v-model="template.rating" disabled size="small" show-score text-color="#ff9900" />
                <span class="usage-count">{{ template.usageCount }}人使用</span>
              </div>
            </div>

            <div class="template-tags">
              <el-tag v-for="tag in template.tags.slice(0, 4)" :key="tag" size="small" type="info" effect="plain">
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <div class="template-footer">
            <el-button type="primary" size="small" @click.stop="useTemplate(template)">
              使用模板
            </el-button>
            <el-button size="small" @click.stop="showPreview(template)">
              预览
            </el-button>
            <el-button size="small" :icon="isFavorite(template.id) ? 'StarFilled' : 'Star'"
              @click.stop="toggleFavorite(template.id)">
            </el-button>
          </div>
        </div>
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

const router = useRouter()

// 响应式数据
const sortBy = ref('popular')
const loading = ref(false)
// 原始模板数据（局部静态样例）
const previewVisible = ref(false)
const previewTemplate = ref(null)
const userFavorites = ref([])

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

// 扩展的模板数据
const templates = ref([
  {
    id: 1,
    title: '员工满意度调查',
    description: '全面了解员工对工作环境、薪酬福利、职业发展等方面的满意度，为企业管理提供数据支持',
    category: '企业管理',
    categoryValue: 'enterprise',
    questions: 25,
    duration: 15,
    rating: 4.8,
    usageCount: 1250,
    isHot: true,
    isNew: false,
    isPro: true,
    tags: ['员工', '满意度', '企业管理', '人力资源', 'HR'],
    template: {
      sections: [
        {
          title: '基本信息',
          questions: [
            { type: 'single', title: '您的工作部门是？', required: true },
            { type: 'single', title: '您的工作年限是？', required: true },
            { type: 'single', title: '您的职位级别是？', required: true }
          ]
        },
        {
          title: '工作满意度',
          questions: [
            { type: 'rating', title: '您对当前工作内容的满意度', required: true },
            { type: 'rating', title: '您对工作环境的满意度', required: true },
            { type: 'rating', title: '您对薪酬福利的满意度', required: true }
          ]
        }
      ]
    }
  },
  {
    id: 2,
    title: '产品用户体验调研',
    description: '收集用户对产品功能、界面设计、使用体验的反馈和建议，优化产品设计',
    category: '产品研发',
    categoryValue: 'product',
    questions: 20,
    duration: 12,
    rating: 4.6,
    usageCount: 980,
    isHot: true,
    isNew: false,
    isPro: false,
    tags: ['用户体验', '产品', '反馈', '优化', 'UX'],
    template: {
      sections: [
        {
          title: '用户画像',
          questions: [
            { type: 'single', title: '您的年龄段是？', required: true },
            { type: 'single', title: '您使用我们产品多长时间了？', required: true }
          ]
        },
        {
          title: '使用体验',
          questions: [
            { type: 'rating', title: '产品整体满意度', required: true },
            { type: 'multiple', title: '您最喜欢的功能有哪些？', required: false }
          ]
        }
      ]
    }
  },
  {
    id: 3,
    title: '心理健康状况评估',
    description: '专业的心理健康评估量表，帮助了解个人心理状况，提供心理健康指导',
    category: '心理健康',
    categoryValue: 'psychology',
    questions: 30,
    duration: 20,
    rating: 4.9,
    usageCount: 2340,
    isHot: true,
    isNew: false,
    isPro: true,
    tags: ['心理健康', '评估', '量表', '专业', '心理测试'],
    template: {
      sections: [
        {
          title: '基本情况',
          questions: [
            { type: 'single', title: '您的性别是？', required: true },
            { type: 'single', title: '您的年龄段是？', required: true }
          ]
        },
        {
          title: '心理状况',
          questions: [
            { type: 'likert', title: '我感到心情愉快', required: true },
            { type: 'likert', title: '我对未来充满希望', required: true }
          ]
        }
      ]
    }
  },
  {
    id: 4,
    title: '课程教学效果评价',
    description: '评价课程内容、教学方法、学习效果的综合调研问卷，提升教学质量',
    category: '教育培训',
    categoryValue: 'education',
    questions: 18,
    duration: 10,
    rating: 4.7,
    usageCount: 756,
    isHot: false,
    isNew: true,
    isPro: false,
    tags: ['教学', '课程', '评价', '教育', '培训'],
    template: {
      sections: [
        {
          title: '课程信息',
          questions: [
            { type: 'single', title: '您参加的课程名称是？', required: true },
            { type: 'single', title: '您的学习背景是？', required: true }
          ]
        },
        {
          title: '教学评价',
          questions: [
            { type: 'rating', title: '课程内容的实用性', required: true },
            { type: 'rating', title: '教师的教学水平', required: true }
          ]
        }
      ]
    }
  },
  {
    id: 5,
    title: '品牌认知度调研',
    description: '了解目标用户对品牌的认知程度、印象和偏好，为品牌营销策略提供依据',
    category: '市场调研',
    categoryValue: 'market',
    questions: 22,
    duration: 15,
    rating: 4.5,
    usageCount: 1180,
    isHot: true,
    isNew: false,
    isPro: false,
    tags: ['品牌', '认知度', '市场调研', '营销', '用户调研'],
    template: {
      sections: [
        {
          title: '用户画像',
          questions: [
            { type: 'single', title: '您的年龄段是？', required: true },
            { type: 'single', title: '您的职业是？', required: true }
          ]
        },
        {
          title: '品牌认知',
          questions: [
            { type: 'single', title: '您是否听说过我们的品牌？', required: true },
            { type: 'rating', title: '您对我们品牌的整体印象', required: true }
          ]
        }
      ]
    }
  },
  {
    id: 6,
    title: '网站可用性测试',
    description: '评估网站的易用性、导航设计、内容布局等方面的用户体验',
    category: '用户体验',
    categoryValue: 'ux',
    questions: 16,
    duration: 12,
    rating: 4.4,
    usageCount: 645,
    isHot: false,
    isNew: true,
    isPro: false,
    tags: ['网站', '可用性', 'UX', '用户测试', '界面设计'],
    template: {
      sections: [
        {
          title: '用户背景',
          questions: [
            { type: 'single', title: '您使用网站的频率是？', required: true },
            { type: 'single', title: '您主要使用什么设备访问？', required: true }
          ]
        },
        {
          title: '使用体验',
          questions: [
            { type: 'rating', title: '网站导航的清晰度', required: true },
            { type: 'rating', title: '信息查找的便利性', required: true }
          ]
        }
      ]
    }
  },
  {
    id: 7,
    title: '学术研究问卷',
    description: '标准的学术研究调查问卷模板，适用于各类社会科学研究项目',
    category: '学术研究',
    categoryValue: 'academic',
    questions: 35,
    duration: 25,
    rating: 4.6,
    usageCount: 420,
    isHot: false,
    isNew: false,
    isPro: true,
    tags: ['学术研究', '科研', '调查', '数据收集', '统计分析'],
    template: {
      sections: [
        {
          title: '研究参与者信息',
          questions: [
            { type: 'single', title: '您的教育背景是？', required: true },
            { type: 'single', title: '您的研究领域是？', required: true }
          ]
        },
        {
          title: '研究问题',
          questions: [
            { type: 'likert', title: '研究问题1的态度量表', required: true },
            { type: 'text', title: '请详细说明您的观点', required: false }
          ]
        }
      ]
    }
  },
  {
    id: 8,
    title: '活动反馈调查',
    description: '收集参与者对活动组织、内容、服务等方面的反馈意见',
    category: '活动反馈',
    categoryValue: 'event',
    questions: 14,
    duration: 8,
    rating: 4.3,
    usageCount: 890,
    isHot: false,
    isNew: true,
    isPro: false,
    tags: ['活动', '反馈', '服务', '组织', '参与体验'],
    template: {
      sections: [
        {
          title: '参与信息',
          questions: [
            { type: 'single', title: '您是第几次参加我们的活动？', required: true },
            { type: 'single', title: '您是如何了解到本次活动的？', required: true }
          ]
        },
        {
          title: '活动评价',
          questions: [
            { type: 'rating', title: '活动内容的丰富程度', required: true },
            { type: 'rating', title: '活动组织的专业性', required: true }
          ]
        }
      ]
    }
  }
])

// 将原始 templates 包装为 hook 的 sourceList：添加 category 与 searchText 字段以支持分类与 tags 搜索
const sourceList = computed(() =>
  templates.value.map((t) => ({
    ...t,
    // hook 默认按 item.category 做分类过滤；模板使用 categoryValue 字段，映射一份
    category: t.categoryValue,
    // 用于全文搜索（包括 tags）
    searchText: `${t.title} ${t.description} ${t.tags?.join(' ')}`,
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
const loadData = () => {
  loading.value = true
  // 模拟加载
  setTimeout(() => {
    loading.value = false
  }, 500)
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

const isFavorite = (templateId) => {
  return userFavorites.value.includes(templateId)
}

const toggleFavorite = (templateId) => {
  const index = userFavorites.value.indexOf(templateId)
  if (index > -1) {
    userFavorites.value.splice(index, 1)
    ElMessage.info('已取消收藏')
  } else {
    userFavorites.value.push(templateId)
    ElMessage.success('已添加到收藏')
  }
}

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
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
    margin-bottom: 32px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

.template-card {
  position: relative;
  border: 2px solid #f0f0f0;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;

  &:hover {
    border-color: var(--color-primary-light-3);
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }

  .template-badges {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    z-index: 1;

    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;

      &.hot-badge {
        background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
        color: white;
      }

      &.new-badge {
        background: linear-gradient(45deg, #4ecdc4, #44a08d);
        color: white;
      }

      &.pro-badge {
        background: linear-gradient(45deg, #a8edea, #fed6e3);
        color: #333;
      }
    }
  }

  .template-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .template-icon {
      color: var(--color-primary-light-3);
    }

    .template-category {
      background: #f0f9ff;
      color: #0369a1;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
  }

  .template-body {
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    p {
      color: #666;
      line-height: 1.5;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .template-stats {
    margin-bottom: 16px;

    .stat-group {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.875rem;
        color: #888;
      }
    }

    .rating-group {
      display: flex;
      align-items: center;
      gap: 8px;

      .usage-count {
        font-size: 0.75rem;
        color: #888;
      }
    }
  }

  .template-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .template-footer {
    display: flex;
    gap: 8px;

    .el-button {
      flex: 1;
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