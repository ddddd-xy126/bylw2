# Home页面重构说明

## 🎯 重构目标
将原本混乱的Home.vue页面重构为清晰的组件化架构，实现业务逻辑与UI展示的分离。

## 📁 新的文件结构

### 业务逻辑层
- **`src/composables/useHomeLogic.js`** - 首页所有业务逻辑
  - 数据获取和处理
  - 搜索、过滤、排序逻辑
  - 收藏功能
  - 事件处理

### UI组件层
- **`src/components/home/SearchFilter.vue`** - 搜索和分类过滤组件
- **`src/components/home/StatsCards.vue`** - 统计信息卡片组件
- **`src/components/home/SurveyCard.vue`** - 单个问卷卡片组件
- **`src/components/home/SurveyList.vue`** - 问卷列表容器组件

### 页面层
- **`src/views/Home.vue`** - 主页面，只负责组装和展示

## 🏗️ 架构优势

### 1. 职责分离
- **业务逻辑** → `useHomeLogic.js`
- **UI展示** → 各个组件
- **页面组装** → `Home.vue`

### 2. 可复用性
- 组件可以在其他页面复用
- 业务逻辑可以被其他composable引用

### 3. 可维护性
- 单一职责原则
- 代码更清晰易读
- 更容易测试和调试

### 4. 可扩展性
- 新增功能只需修改对应层级
- 组件独立，互不影响

## 🔄 数据流

```
useHomeLogic.js (业务逻辑)
    ↓ 提供数据和方法
Home.vue (页面组装)
    ↓ 传递props和事件
子组件 (UI展示)
    ↓ 触发事件
Home.vue (事件处理)
    ↓ 调用方法
useHomeLogic.js (执行逻辑)
```

## 📦 组件功能

### SearchFilter
- 搜索输入框
- 分类选择器
- 支持v-model双向绑定

### StatsCards  
- 展示统计数据
- 图标+数字+标签格式
- 响应式布局

### SurveyCard
- 单个问卷信息展示
- 收藏功能
- 点击跳转

### SurveyList
- 问卷列表容器
- 排序控制
- 加载状态
- 空状态展示

## 🚀 使用方式

### 在Home.vue中
```vue
<template>
  <!-- 只需要组装组件 -->
  <SearchFilter v-model:search-query="searchQuery" />
  <StatsCards :total-surveys="surveys.length" />
  <SurveyList :surveys="filteredSurveys" />
</template>

<script setup>
// 只需要导入和使用composable
const { searchQuery, surveys, filteredSurveys } = useHomeLogic();
</script>
```

## ✅ 重构成果

1. **代码行数减少** - Home.vue从200+行减少到50+行
2. **职责清晰** - 每个文件都有明确的职责
3. **易于维护** - 修改某个功能只需要找到对应文件
4. **可复用** - 组件可以在其他页面使用
5. **可测试** - 业务逻辑独立，容易编写单元测试

这种架构模式可以应用到项目的其他页面，实现整体代码质量的提升。