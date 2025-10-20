<template>
  <div class="create-questionnaire">
    <!-- 头部说明 -->
    <div class="header-section">
      <h1>创建问卷</h1>
      <p>选择您喜欢的方式开始创建问卷，让数据收集变得简单高效</p>
    </div>

    <!-- 创建方式选择 -->
    <div class="creation-options">
      <div class="option-card" @click="goToCustomCreate">
        <div class="card-icon">
          <el-icon size="48"><Edit /></el-icon>
        </div>
        <h3>自定义创建</h3>
        <p>从零开始设计您的问卷，完全自定义问题类型、逻辑和样式</p>
        <div class="card-features">
          <span class="feature-tag">✨ 完全自定义</span>
          <span class="feature-tag">🎨 丰富组件</span>
          <span class="feature-tag">🔗 逻辑跳转</span>
        </div>
        <el-button type="primary" size="large" class="card-button">
          开始创建
        </el-button>
      </div>

      <div class="option-card" @click="goToTemplateSelect">
        <div class="card-icon">
          <el-icon size="48"><Document /></el-icon>
        </div>
        <h3>模板创建</h3>
        <p>选择专业的问卷模板，快速创建高质量的调研问卷</p>
        <div class="card-features">
          <span class="feature-tag">⚡ 快速创建</span>
          <span class="feature-tag">🎯 专业设计</span>
          <span class="feature-tag">📊 科学分析</span>
        </div>
        <el-button type="success" size="large" class="card-button">
          选择模板
        </el-button>
      </div>
    </div>

    <!-- 模板展示区域 -->
    <div class="template-showcase" v-if="showTemplates">
      <div class="showcase-header">
        <h2>
          <el-icon><Star /></el-icon>
          热门模板推荐
        </h2>
        <p>精选专业问卷模板，助您快速创建高质量调研</p>
      </div>

      <div class="template-grid">
        <div 
          v-for="template in featuredTemplates" 
          :key="template.id"
          class="template-card"
          @click="selectTemplate(template)"
        >
          <div class="template-header">
            <div class="template-category">{{ template.category }}</div>
            <div class="template-rating">
              <el-rate v-model="template.rating" disabled size="small" />
              <span class="rating-text">({{ template.rating }})</span>
            </div>
          </div>
          
          <div class="template-content">
            <h4>{{ template.title }}</h4>
            <p>{{ template.description }}</p>
            
            <div class="template-stats">
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>{{ template.questions }}题</span>
              </div>
              <div class="stat-item">
                <el-icon><Clock /></el-icon>
                <span>{{ template.duration }}分钟</span>
              </div>
              <div class="stat-item">
                <el-icon><User /></el-icon>
                <span>{{ template.usageCount }}人使用</span>
              </div>
            </div>

            <div class="template-tags">
              <el-tag 
                v-for="tag in template.tags.slice(0, 3)" 
                :key="tag"
                size="small"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <div class="template-actions">
            <el-button type="primary" size="small" @click.stop="useTemplate(template)">
              使用模板
            </el-button>
            <el-button size="small" @click.stop="previewTemplate(template)">
              预览
            </el-button>
          </div>
        </div>
      </div>

      <div class="view-all-templates">
        <el-button @click="goToTemplateSelect" size="large">
          查看所有模板
        </el-button>
      </div>
    </div>

    <!-- 最近创建的问卷 -->
    <div class="recent-questionnaires" v-if="recentQuestionnaires.length > 0">
      <h2>
        <el-icon><Clock /></el-icon>
        最近创建的问卷
      </h2>
      
      <div class="recent-list">
        <div 
          v-for="questionnaire in recentQuestionnaires" 
          :key="questionnaire.id"
          class="recent-item"
          @click="editQuestionnaire(questionnaire.id)"
        >
          <div class="recent-info">
            <h4>{{ questionnaire.title }}</h4>
            <p>{{ questionnaire.description }}</p>
            <div class="recent-meta">
              <span>{{ questionnaire.questions }}个问题</span>
              <span>{{ questionnaire.responses }}份回答</span>
              <span>{{ formatDate(questionnaire.updatedAt) }}</span>
            </div>
          </div>
          
          <div class="recent-status">
            <el-tag 
              :type="getStatusType(questionnaire.status)"
              size="small"
            >
              {{ getStatusText(questionnaire.status) }}
            </el-tag>
          </div>

          <div class="recent-actions">
            <el-dropdown @command="handleQuestionnaireAction">
              <el-button type="text" size="small">
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="`edit_${questionnaire.id}`">编辑</el-dropdown-item>
                  <el-dropdown-item :command="`copy_${questionnaire.id}`">复制</el-dropdown-item>
                  <el-dropdown-item :command="`share_${questionnaire.id}`">分享</el-dropdown-item>
                  <el-dropdown-item :command="`delete_${questionnaire.id}`" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Edit, 
  Document, 
  Star, 
  Clock, 
  User, 
  More 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const showTemplates = ref(true)
const featuredTemplates = ref([])
const recentQuestionnaires = ref([])

// 模拟的问卷模板数据
const mockTemplates = [
  {
    id: 1,
    title: '员工满意度调查',
    description: '全面了解员工对工作环境、薪酬福利、职业发展等方面的满意度',
    category: '企业管理',
    questions: 25,
    duration: 15,
    rating: 4.8,
    usageCount: 1250,
    tags: ['员工', '满意度', '企业管理', '人力资源'],
    template: {
      sections: [
        {
          title: '基本信息',
          questions: [
            { type: 'single', title: '您的工作部门是？', required: true },
            { type: 'single', title: '您的工作年限是？', required: true }
          ]
        },
        {
          title: '工作满意度',
          questions: [
            { type: 'rating', title: '您对当前工作内容的满意度', required: true },
            { type: 'rating', title: '您对工作环境的满意度', required: true }
          ]
        }
      ]
    }
  },
  {
    id: 2,
    title: '产品用户体验调研',
    description: '收集用户对产品功能、界面设计、使用体验的反馈和建议',
    category: '产品研发',
    questions: 20,
    duration: 12,
    rating: 4.6,
    usageCount: 980,
    tags: ['用户体验', '产品', '反馈', '优化'],
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
    description: '专业的心理健康评估量表，帮助了解个人心理状况',
    category: '心理健康',
    questions: 30,
    duration: 20,
    rating: 4.9,
    usageCount: 2340,
    tags: ['心理健康', '评估', '量表', '专业'],
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
    description: '评价课程内容、教学方法、学习效果的综合调研问卷',
    category: '教育培训',
    questions: 18,
    duration: 10,
    rating: 4.7,
    usageCount: 756,
    tags: ['教学', '课程', '评价', '教育'],
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
  }
]

// 模拟的最近创建问卷数据
const mockRecentQuestionnaires = [
  {
    id: 1,
    title: '新员工入职体验调研',
    description: '了解新员工入职过程中的体验和改进建议',
    questions: 15,
    responses: 23,
    status: 'published',
    updatedAt: '2024-02-01T10:30:00Z'
  },
  {
    id: 2,
    title: '产品功能需求调研',
    description: '收集用户对新功能的需求和期望',
    questions: 12,
    responses: 0,
    status: 'draft',
    updatedAt: '2024-01-30T15:20:00Z'
  }
]

onMounted(() => {
  loadFeaturedTemplates()
  loadRecentQuestionnaires()
})

const loadFeaturedTemplates = () => {
  // 取前3个作为推荐模板
  featuredTemplates.value = mockTemplates.slice(0, 3)
}

const loadRecentQuestionnaires = () => {
  // 模拟加载用户最近创建的问卷
  recentQuestionnaires.value = mockRecentQuestionnaires
}

const goToCustomCreate = () => {
  router.push('/create/custom')
}

const goToTemplateSelect = () => {
  router.push('/create/templates')
}

const selectTemplate = (template) => {
  // 跳转到模板创建页面，传递模板ID
  router.push(`/create/template/${template.id}`)
}

const useTemplate = (template) => {
  ElMessage.success(`正在使用模板：${template.title}`)
  // 跳转到模板创建页面，传递模板ID
  router.push(`/create/template/${template.id}`)
}

const previewTemplate = (template) => {
  ElMessage.info(`预览模板：${template.title}`)
  // 这里可以打开预览对话框或跳转到预览页面
}

const editQuestionnaire = (id) => {
  // 跳转到编辑页面
  router.push(`/questionnaires/edit/${id}`)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1天前'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
  return `${Math.ceil(diffDays / 30)}个月前`
}

const getStatusType = (status) => {
  const statusMap = {
    'draft': 'info',
    'published': 'success',
    'paused': 'warning',
    'closed': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'published': '已发布',
    'paused': '已暂停',
    'closed': '已关闭'
  }
  return statusMap[status] || '未知'
}

const handleQuestionnaireAction = (command) => {
  const [action, id] = command.split('_')
  
  switch (action) {
    case 'edit':
      editQuestionnaire(id)
      break
    case 'copy':
      ElMessage.success('问卷已复制')
      break
    case 'share':
      ElMessage.success('分享链接已复制到剪贴板')
      break
    case 'delete':
      ElMessage.warning('删除功能暂未实现')
      break
  }
}
</script>

<style scoped>
.create-questionnaire {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.header-section {
  text-align: center;
  margin-bottom: 48px;
}

.header-section h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.header-section p {
  font-size: 1.125rem;
  color: #666;
  margin: 0;
}

.creation-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  margin-bottom: 64px;
}

.option-card {
  background: white;
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.option-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.card-icon {
  color: #409eff;
  margin-bottom: 24px;
}

.option-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.option-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
}

.card-features {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.feature-tag {
  background: #f0f9ff;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.card-button {
  width: 160px;
}

.template-showcase {
  margin-bottom: 64px;
}

.showcase-header {
  text-align: center;
  margin-bottom: 40px;
}

.showcase-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.showcase-header p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.template-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: #67c23a;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.template-category {
  background: #f0f9ff;
  color: #0369a1;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.template-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-text {
  font-size: 0.875rem;
  color: #666;
}

.template-content h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.template-content p {
  color: #666;
  line-height: 1.5;
  margin-bottom: 16px;
}

.template-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: #888;
}

.template-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.template-actions {
  display: flex;
  gap: 12px;
}

.template-actions .el-button {
  flex: 1;
}

.view-all-templates {
  text-align: center;
}

.recent-questionnaires {
  margin-bottom: 32px;
}

.recent-questionnaires h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recent-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recent-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recent-info {
  flex: 1;
}

.recent-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.recent-info p {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.recent-meta {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: #888;
}

.recent-status {
  margin-right: 8px;
}

.recent-actions {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .creation-options {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .recent-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .recent-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>