import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getTemplatesApi, getCategoriesApi } from '@/api/survey'

/**
 * 模板数据管理 composable
 * 提供模板加载、数据处理等通用逻辑
 */
export function useTemplates() {
  const templates = ref([])
  const categories = ref([])
  const loading = ref(false)
  const previewVisible = ref(false)
  const previewTemplate = ref(null)

  /**
   * 处理模板数据格式
   * 统一处理从 API 获取的模板数据
   */
  const processTemplateData = (templateData) => {
    return templateData.map(t => ({
      ...t,
      category: t.category || '其他',
      categoryValue: t.categoryValue || t.category,
      // 保留 questionList 用于预览
      questionList: t.questionList || [],
      // questions 字段表示问题数量
      questions: t.questionList?.length || t.questions || 0,
      tags: t.tags || [],
      isHot: t.participants > 1500 || false,
      isNew: new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isPro: t.isPro || false,
      usageCount: t.usageCount || t.participants || 0
    }))
  }

  /**
   * 加载所有模板
   */
  const loadTemplates = async () => {
    loading.value = true
    try {
      const templateData = await getTemplatesApi()
      console.log('[useTemplates] 获取到的模板数据:', templateData)
      
      templates.value = processTemplateData(templateData)
      
      console.log('[useTemplates] 处理后的模板数据:', templates.value)
      return templates.value
    } catch (error) {
      console.error('[useTemplates] 加载模板失败:', error)
      ElMessage.error('加载模板失败：' + error.message)
      templates.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载推荐模板（前N个）
   */
  const loadFeaturedTemplates = async (count = 3) => {
    loading.value = true
    try {
      const templateData = await getTemplatesApi()
      console.log('[useTemplates] 获取到的推荐模板数据:', templateData)
      
      const processedTemplates = processTemplateData(templateData)
      const featured = processedTemplates.slice(0, count)
      
      console.log('[useTemplates] 推荐模板:', featured)
      return featured
    } catch (error) {
      console.error('[useTemplates] 加载推荐模板失败:', error)
      ElMessage.error('加载推荐模板失败：' + error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载分类数据
   */
  const loadCategories = async () => {
    try {
      const categoryData = await getCategoriesApi()
      console.log('[useTemplates] 获取到的分类数据:', categoryData)
      
      // 直接使用 API 返回的数据，只做简单的字段映射
      categories.value = categoryData.map(c => ({
        label: c.name || c.label,
        value: c.slug || c.value || c.id
      }))
      
      console.log('[useTemplates] 处理后的分类数据:', categories.value)
      return categories.value
    } catch (error) {
      console.error('[useTemplates] 加载分类失败:', error)
      ElMessage.error('加载分类失败：' + error.message)
      categories.value = []
      return []
    }
  }

  /**
   * 显示预览
   */
  const showPreview = (template) => {
    console.log('[useTemplates] 显示预览:', template)
    previewTemplate.value = template
    previewVisible.value = true
  }

  /**
   * 关闭预览
   */
  const closePreview = () => {
    previewVisible.value = false
    previewTemplate.value = null
  }

  return {
    // 状态
    templates,
    categories,
    loading,
    previewVisible,
    previewTemplate,
    
    // 方法
    loadTemplates,
    loadFeaturedTemplates,
    loadCategories,
    processTemplateData,
    showPreview,
    closePreview
  }
}
