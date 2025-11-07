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

      <div v-if="loading" class="loading-section">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else class="template-grid">
        <TemplateCard
          v-for="template in featuredTemplates" 
          :key="template.id"
          :template="template"
          @click="selectTemplate"
          @use="useTemplate"
          @preview="showPreview"
        />
      </div>

      <div class="view-all-templates">
        <el-button @click="goToTemplateSelect" size="large">
          查看所有模板
        </el-button>
      </div>
    </div>

    <!-- 预览对话框 -->
    <TemplatePreviewDialog
      v-model="previewVisible"
      :template="previewTemplate"
      @use="useTemplate"
    />
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
  User
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import TemplateCard from './components/TemplateCard.vue'
import TemplatePreviewDialog from './components/TemplatePreviewDialog.vue'
import { useTemplates } from '@/composables/useTemplates'

const router = useRouter()
const showTemplates = ref(true)
const featuredTemplates = ref([])

// 使用 composable
const { 
  loading, 
  previewVisible, 
  previewTemplate, 
  loadFeaturedTemplates: loadFeatured,
  showPreview: handleShowPreview 
} = useTemplates()

onMounted(async () => {
  // 加载推荐模板
  featuredTemplates.value = await loadFeatured(3)
})

const goToCustomCreate = () => {
  router.push('/create/custom')
}

const goToTemplateSelect = () => {
  router.push('/create/templates')
}

const selectTemplate = (template) => {
  router.push(`/create/template/${template.id}`)
}

const useTemplate = (template) => {
  ElMessage.success(`正在使用模板：${template.title}`)
  router.push(`/create/template/${template.id}`)
}

const showPreview = (template) => {
  handleShowPreview(template)
}

</script>

<style lang="scss" scoped>
.create-questionnaire {
  background-color: var(--theme-background-color);
  margin: 0 auto;
  padding: 30px 285px;

  .header-section {
    text-align: center;
    margin-bottom: 48px;

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 12px;
    }
    p {
      font-size: 1.125rem;
      color: #666;
      margin: 0;
    }
  }

  .creation-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 32px;
    margin-bottom: 64px;

    .option-card {
      background: white;
      border-radius: 20px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
        border-color: var(--color-primary-light-3);
      }

      .card-icon {
        color: var(--color-primary-light-3);
        margin-bottom: 24px;
      }

      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
      }

      p {
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

        .feature-tag {
          background: #f0f9ff;
          color: #0369a1;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 500;
        }
      }

      .card-button {
        width: 160px;
      }
    }
  }

  .template-showcase {
    margin-bottom: 64px;

    .showcase-header {
      text-align: center;
      margin-bottom: 40px;

      h2 {
        font-size: 2rem;
        font-weight: 700;
        color: #333;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      p {
        color: #666;
        font-size: 1rem;
        margin: 0;
      }
    }

    .loading-section {
      padding: 40px 0;
      text-align: center;
    }

    .template-grid {
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

    .view-all-templates {
      text-align: center;
    }
  }

  @media (max-width: 768px) {
    .creation-options {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .template-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>