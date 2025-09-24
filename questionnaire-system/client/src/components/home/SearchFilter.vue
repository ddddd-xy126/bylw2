<template>
  <div class="search-filter-section">
    <div class="search-header">
      <h3>
        <el-icon><Search /></el-icon>
        发现感兴趣的问卷
      </h3>
      <p>通过搜索和分类筛选，找到最适合您的心理测试</p>
    </div>
    
    <div class="search-controls">
      <div class="search-input-wrapper">
        <el-input
          :model-value="searchQuery"
          @update:model-value="$emit('update:searchQuery', $event)"
          placeholder="输入关键词搜索问卷..."
          size="large"
          @input="$emit('search')"
          class="search-input"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <div class="category-select-wrapper">
        <el-select
          :model-value="selectedCategory"
          @update:model-value="$emit('update:selectedCategory', $event)"
          placeholder="选择分类"
          size="large"
          @change="$emit('categoryChange')"
          clearable
          class="category-select"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="`${category.name} (${category.count})`"
            :value="category.id"
          >
            <span class="category-option">
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">{{ category.count }}</span>
            </span>
          </el-option>
        </el-select>
      </div>
    </div>
    
    <!-- 快捷分类标签 -->
    <div class="quick-categories">
      <span class="quick-label">热门分类：</span>
      <el-tag 
        v-for="category in topCategories" 
        :key="category.id"
        :type="selectedCategory === category.id ? 'primary' : ''"
        :effect="selectedCategory === category.id ? 'dark' : 'plain'"
        class="category-tag"
        @click="selectQuickCategory(category.id)"
      >
        {{ category.name }}
      </el-tag>
      <el-tag 
        v-if="selectedCategory"
        type="info"
        class="category-tag clear-tag"
        @click="clearCategory"
      >
        清除筛选
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Search } from "@element-plus/icons-vue";

const props = defineProps({
  searchQuery: String,
  selectedCategory: [String, Number],
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:searchQuery', 'update:selectedCategory', 'search', 'categoryChange']);

// 热门分类（取前4个）
const topCategories = computed(() => {
  return props.categories
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
})

const selectQuickCategory = (categoryId) => {
  emit('update:selectedCategory', categoryId)
  emit('categoryChange')
}

const clearCategory = () => {
  emit('update:selectedCategory', null)
  emit('categoryChange')
}
</script>

<style scoped>
.search-filter-section {
  margin-bottom: 32px;
}

.search-header {
  text-align: center;
  margin-bottom: 32px;
}

.search-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.search-header p {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}

.search-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.search-input-wrapper {
  flex: 2;
}

.category-select-wrapper {
  flex: 1;
  min-width: 200px;
}

.search-input {
  border-radius: 12px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-icon {
  color: #999;
}

.category-select {
  border-radius: 12px;
}

.category-select :deep(.el-select__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.category-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.category-name {
  font-weight: 500;
}

.category-count {
  color: #999;
  font-size: 0.85rem;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 8px;
}

.quick-categories {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.quick-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.category-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 16px;
  font-size: 0.85rem;
}

.category-tag:hover {
  transform: translateY(-1px);
}

.clear-tag {
  margin-left: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .category-select-wrapper {
    min-width: auto;
  }
  
  .quick-categories {
    padding: 12px;
  }
  
  .quick-label {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .search-header h3 {
    font-size: 1.25rem;
  }
}
</style>