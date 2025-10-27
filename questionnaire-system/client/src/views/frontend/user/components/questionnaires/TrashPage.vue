<template>
  <div class="trash-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-info">
        <h2>回收站</h2>
        <p>已删除的问卷将在回收站保留30天，过期后将被永久删除</p>
        <div class="keyboard-hints" v-if="trashedSurveys.length > 0">
          <el-tag type="info" size="small" effect="plain">Ctrl+A 全选</el-tag>
          <el-tag type="info" size="small" effect="plain">Ctrl+R 恢复</el-tag>
          <el-tag type="info" size="small" effect="plain">Del 删除</el-tag>
          <el-tag type="info" size="small" effect="plain">Esc 取消</el-tag>
        </div>
      </div>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :disabled="selectedIds.length === 0"
          @click="batchRestore"
          size="large"
        >
          <el-icon><RefreshRight /></el-icon>
          批量恢复
          <el-badge 
            v-if="selectedIds.length > 0" 
            :value="selectedIds.length" 
            class="action-badge"
          />
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedIds.length === 0"
          @click="batchDelete"
          size="large"
        >
          <el-icon><Delete /></el-icon>
          批量永久删除
          <el-badge 
            v-if="selectedIds.length > 0" 
            :value="selectedIds.length" 
            class="action-badge"
          />
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <el-row :gutter="16" class="stats-section">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Delete /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ trashedSurveys.length }}</div>
              <div class="stat-label">回收站问卷</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ expiringSoonCount }}</div>
              <div class="stat-label">即将过期</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ selectedIds.length }}</div>
              <div class="stat-label">已选中</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="16">
        <el-col :span="10">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索问卷标题"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="filterCategory"
            placeholder="问卷分类"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部分类" value="" />
            <el-option label="心理健康" value="心理健康" />
            <el-option label="教育" value="教育" />
            <el-option label="职业发展" value="职业发展" />
            <el-option label="产品" value="产品" />
            <el-option label="企业" value="企业" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-col>
        <el-col :span="4">
          <el-button 
            type="warning" 
            @click="clearExpired"
            :disabled="expiringSoonCount === 0"
          >
            <el-icon><Delete /></el-icon>
            清理过期
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 问卷列表 -->
    <div class="survey-list" v-loading="loading">
      <el-checkbox 
        v-model="selectAll" 
        @change="handleSelectAll"
        class="select-all-checkbox"
        v-if="filteredSurveys.length > 0"
      >
        全选
      </el-checkbox>

      <div
        v-for="survey in filteredSurveys"
        :key="survey.id"
        class="survey-item"
        :class="{ 
          'selected': selectedIds.includes(survey.id),
          'expiring-soon': isExpiringSoon(survey.deletedAt)
        }"
      >
        <el-checkbox 
          :model-value="selectedIds.includes(survey.id)"
          @change="toggleSelect(survey.id)"
          class="survey-checkbox"
        />

        <div class="survey-main">
          <div class="survey-icon">
            <el-icon size="24" color="#909399"><Delete /></el-icon>
          </div>
          
          <div class="survey-info">
            <div class="survey-header">
              <h3 class="survey-title">{{ survey.title }}</h3>
              <div class="survey-badges">
                <el-tag size="small" type="primary">{{ survey.category }}</el-tag>
                <el-tag 
                  size="small" 
                  :type="isExpiringSoon(survey.deletedAt) ? 'danger' : 'info'"
                >
                  {{ getExpiryText(survey.deletedAt) }}
                </el-tag>
              </div>
            </div>
            
            <div class="survey-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                删除时间：{{ formatDate(survey.deletedAt) }}
              </span>
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                剩余天数：{{ getRemainingDays(survey.deletedAt) }}天
              </span>
              <span class="meta-item">
                <el-icon><Document /></el-icon>
                题目数：{{ survey.questions }}题
              </span>
              <span class="meta-item">
                <el-icon><User /></el-icon>
                原状态：{{ getOriginalStatus(survey.originalStatus) }}
              </span>
            </div>
            
            <div class="survey-description">
              {{ survey.description }}
            </div>

            <!-- 过期警告 -->
            <el-alert
              v-if="isExpiringSoon(survey.deletedAt)"
              title="即将过期"
              :description="`此问卷将在 ${getRemainingDays(survey.deletedAt)} 天后被永久删除，请及时恢复或备份`"
              type="warning"
              :closable="false"
              show-icon
              class="expiry-alert"
            />
          </div>
        </div>

        <div class="survey-actions">
          <el-button type="success" @click="restoreSurvey(survey)">
            <el-icon><RefreshRight /></el-icon>
            恢复
          </el-button>
          <el-button type="danger" @click="permanentlyDelete(survey.id)">
            <el-icon><Delete /></el-icon>
            永久删除
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="!loading && filteredSurveys.length === 0" 
        description="回收站是空的"
        class="empty-state"
      >
        <el-button type="primary" @click="goToCreated">
          查看我的问卷
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="totalItems > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        layout="prev, pager, next, jumper, total"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 提示信息 -->
    <el-card class="notice-card" shadow="never">
      <template #header>
        <h3>回收站说明</h3>
      </template>
      <div class="notice-content">
        <el-alert
          title="自动清理"
          description="问卷删除后将在回收站保留30天，超过30天的问卷将被自动永久删除。"
          type="info"
          :closable="false"
          show-icon
        />
        <br>
        <el-alert
          title="恢复问卷"
          description="恢复问卷后，问卷将回到原来的状态（草稿、待审核或已发布）。"
          type="success"
          :closable="false"
          show-icon
        />
        <br>
        <el-alert
          title="永久删除"
          description="永久删除后，问卷数据将无法恢复，请谨慎操作。"
          type="warning"
          :closable="false"
          show-icon
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Delete,
  RefreshRight,
  Timer,
  CircleCheck,
  Search,
  Refresh,
  Calendar,
  Document,
  User,
} from "@element-plus/icons-vue";

import { useUserStore } from "@/store/user";
import { useListFilter } from "@/hooks/useListFilter";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const trashedSurveys = ref([]);
const selectedIds = ref([]);
const selectAll = ref(false);

// 使用 useListFilter 管理搜索/分类/分页
const {
  searchKeyword,
  filterCategory,
  dateRange,
  currentPage,
  pageSize,
  filteredList: filteredSurveys,
  totalItems,
  handleSearch,
  handleFilter,
  handlePageChange,
} = useListFilter({ sourceList: trashedSurveys, searchFields: ["title"] });

// 计算属性
const expiringSoonCount = computed(() => 
  trashedSurveys.value.filter(s => isExpiringSoon(s.deletedAt)).length
);

// filteredSurveys / totalItems / handlers 由 useListFilter 提供

// 方法
const loadTrashedSurveys = async () => {
  loading.value = true;
  try {
    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error("请先登录");
      trashedSurveys.value = [];
      return;
    }
    
    // 从 json-server 获取回收站数据
    const response = await fetch('http://localhost:3002/recycleBin');
    if (!response.ok) {
      throw new Error('加载回收站失败');
    }
    
    const allTrashed = await response.json();
    
    // 筛选当前用户的已删除问卷
    const userTrashed = allTrashed.filter(item => 
      item.userId === userId || item.authorId === userId
    );
    
    // 格式化数据
    trashedSurveys.value = userTrashed.map(item => ({
      id: item.id,
      surveyId: item.surveyId,
      title: item.title,
      description: item.description,
      category: item.category,
      originalStatus: item.originalStatus,
      deletedAt: item.deletedAt,
      questions: item.questions || 0,
      surveyData: item.surveyData
    }));
    
    console.log('Loaded trashed surveys:', trashedSurveys.value);
  } catch (error) {
    console.error('加载回收站失败:', error);
    ElMessage.error("加载回收站失败：" + error.message);
    trashedSurveys.value = [];
  } finally {
    loading.value = false;
  }
};

// handleSearch/handleFilter/handlePageChange 来自 useListFilter

const refreshData = () => {
  selectedIds.value = [];
  selectAll.value = false;
  loadTrashedSurveys();
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("zh-CN");
};

const getRemainingDays = (deletedAt) => {
  const deleteTime = new Date(deletedAt);
  const expiryTime = new Date(deleteTime.getTime() + 30 * 24 * 60 * 60 * 1000);
  const remaining = Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, remaining);
};

const isExpiringSoon = (deletedAt) => {
  return getRemainingDays(deletedAt) <= 7;
};

const getExpiryText = (deletedAt) => {
  const days = getRemainingDays(deletedAt);
  if (days === 0) return "今天过期";
  if (days <= 7) return `${days}天后过期`;
  return `${days}天后过期`;
};

const getOriginalStatus = (status) => {
  const statusMap = {
    draft: "草稿",
    pending: "待审核",
    published: "已发布"
  };
  return statusMap[status] || "未知";
};

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
  updateSelectAll();
};

const handleSelectAll = (checked) => {
  if (checked) {
    selectedIds.value = filteredSurveys.value.map(s => s.id);
  } else {
    selectedIds.value = [];
  }
};

const updateSelectAll = () => {
  selectAll.value = filteredSurveys.value.length > 0 && 
    selectedIds.value.length === filteredSurveys.value.length;
};

const restoreSurvey = async (survey) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复问卷"${survey.title}"吗？恢复后问卷将回到${getOriginalStatus(survey.originalStatus)}状态。`,
      '确认恢复',
      {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'success'
      }
    );
    
    // 恢复问卷到 surveys 表
    const restoreData = {
      ...survey.surveyData,
      status: survey.originalStatus,
      updatedAt: new Date().toISOString()
    };
    
    const createResponse = await fetch('http://localhost:3002/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(restoreData)
    });
    
    if (!createResponse.ok) {
      throw new Error('恢复问卷失败');
    }
    
    // 从回收站删除
    const deleteResponse = await fetch(`http://localhost:3002/recycleBin/${survey.id}`, {
      method: 'DELETE'
    });
    
    if (!deleteResponse.ok) {
      throw new Error('从回收站删除失败');
    }
    
    ElMessage.success("问卷恢复成功");
    await loadTrashedSurveys();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复问卷失败:', error);
      ElMessage.error("恢复失败：" + error.message);
    }
  }
};

const permanentlyDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要永久删除这个问卷吗？此操作不可撤销！',
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    );
    
    // 从回收站永久删除
    const response = await fetch(`http://localhost:3002/recycleBin/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('永久删除失败');
    }
    
    ElMessage.success("问卷已永久删除");
    await loadTrashedSurveys();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('永久删除失败:', error);
      ElMessage.error("删除失败：" + error.message);
    }
  }
};

const batchRestore = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请先选择要恢复的问卷");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要恢复选中的 ${selectedIds.value.length} 个问卷吗？恢复后问卷将回到各自的原状态。`,
      '批量恢复',
      {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'success'
      }
    );
    
    // 显示加载状态
    loading.value = true;
    let successCount = 0;
    let failCount = 0;
    const totalCount = selectedIds.value.length;
    const failedItems = [];
    
    // 使用 ElMessage 显示进度
    const progressMessage = ElMessage({
      message: `正在恢复问卷... (0/${totalCount})`,
      type: 'info',
      duration: 0,
      showClose: false
    });
    
    for (let i = 0; i < selectedIds.value.length; i++) {
      const id = selectedIds.value[i];
      const survey = trashedSurveys.value.find(s => s.id === id);
      
      if (!survey) {
        failCount++;
        failedItems.push({ id, title: '未知问卷', reason: '问卷数据不存在' });
        continue;
      }
      
      try {
        // 恢复问卷到 surveys 表
        const restoreData = {
          ...survey.surveyData,
          status: survey.originalStatus,
          updatedAt: new Date().toISOString()
        };
        
        const createResponse = await fetch('http://localhost:3002/surveys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(restoreData)
        });
        
        if (!createResponse.ok) {
          throw new Error('恢复问卷失败');
        }
        
        // 从回收站删除
        const deleteResponse = await fetch(`http://localhost:3002/recycleBin/${id}`, {
          method: 'DELETE'
        });
        
        if (!deleteResponse.ok) {
          throw new Error('从回收站删除失败');
        }
        
        successCount++;
        
        // 更新进度
        progressMessage.close();
        ElMessage({
          message: `正在恢复问卷... (${successCount + failCount}/${totalCount})`,
          type: 'info',
          duration: 0,
          showClose: false
        });
      } catch (error) {
        console.error(`恢复问卷 ${survey.title} 失败:`, error);
        failCount++;
        failedItems.push({ 
          id, 
          title: survey.title, 
          reason: error.message 
        });
      }
    }
    
    // 关闭进度提示
    progressMessage.close();
    
    // 显示结果
    loading.value = false;
    
    if (successCount > 0 && failCount === 0) {
      ElMessage.success(`成功恢复 ${successCount} 个问卷！`);
    } else if (successCount > 0 && failCount > 0) {
      ElMessageBox.alert(
        `成功恢复 ${successCount} 个问卷，${failCount} 个失败。\n\n失败列表：\n${failedItems.map(item => `• ${item.title}: ${item.reason}`).join('\n')}`,
        '批量恢复结果',
        {
          type: 'warning',
          confirmButtonText: '知道了'
        }
      );
    } else {
      ElMessageBox.alert(
        `批量恢复失败！\n\n失败列表：\n${failedItems.map(item => `• ${item.title}: ${item.reason}`).join('\n')}`,
        '批量恢复失败',
        {
          type: 'error',
          confirmButtonText: '知道了'
        }
      );
    }
    
    // 清空选择并刷新列表
    selectedIds.value = [];
    selectAll.value = false;
    await loadTrashedSurveys();
  } catch (error) {
    loading.value = false;
    if (error !== 'cancel') {
      console.error('批量恢复失败:', error);
      ElMessage.error("批量恢复失败：" + error.message);
    }
  }
};

const batchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请先选择要删除的问卷");
    return;
  }

  try {
    // 获取选中问卷的标题列表
    const selectedSurveys = trashedSurveys.value.filter(s => selectedIds.value.includes(s.id));
    const surveyTitles = selectedSurveys.map(s => s.title).slice(0, 5);
    const titleList = surveyTitles.join('、');
    const moreText = selectedIds.value.length > 5 ? `等 ${selectedIds.value.length} 个问卷` : '';
    
    await ElMessageBox.confirm(
      `确定要永久删除以下问卷吗？\n\n${titleList}${moreText}\n\n⚠️ 此操作不可撤销，数据将永久丢失！`,
      '严重警告',
      {
        confirmButtonText: '确认永久删除',
        cancelButtonText: '我再想想',
        type: 'error',
        confirmButtonClass: 'el-button--danger',
        dangerouslyUseHTMLString: true
      }
    );
    
    // 二次确认
    await ElMessageBox.confirm(
      `您真的要删除这 ${selectedIds.value.length} 个问卷吗？删除后无法恢复！\n\n请输入"确认删除"以继续。`,
      '最后确认',
      {
        confirmButtonText: '继续删除',
        cancelButtonText: '取消',
        type: 'error',
        inputPlaceholder: '请输入"确认删除"',
        inputPattern: /^确认删除$/,
        inputErrorMessage: '请输入"确认删除"',
        showInput: true
      }
    );
    
    // 显示加载状态
    loading.value = true;
    let successCount = 0;
    let failCount = 0;
    const totalCount = selectedIds.value.length;
    const failedItems = [];
    
    // 使用 ElMessage 显示进度
    const progressMessage = ElMessage({
      message: `正在删除问卷... (0/${totalCount})`,
      type: 'warning',
      duration: 0,
      showClose: false
    });
    
    for (let i = 0; i < selectedIds.value.length; i++) {
      const id = selectedIds.value[i];
      const survey = trashedSurveys.value.find(s => s.id === id);
      
      try {
        const response = await fetch(`http://localhost:3002/recycleBin/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('删除失败');
        }
        
        successCount++;
        
        // 更新进度
        progressMessage.close();
        ElMessage({
          message: `正在删除问卷... (${successCount + failCount}/${totalCount})`,
          type: 'warning',
          duration: 0,
          showClose: false
        });
      } catch (error) {
        console.error(`删除问卷 ${survey?.title || id} 失败:`, error);
        failCount++;
        failedItems.push({ 
          id, 
          title: survey?.title || '未知问卷', 
          reason: error.message 
        });
      }
    }
    
    // 关闭进度提示
    progressMessage.close();
    
    // 显示结果
    loading.value = false;
    
    if (successCount > 0 && failCount === 0) {
      ElMessage.success(`成功永久删除 ${successCount} 个问卷！`);
    } else if (successCount > 0 && failCount > 0) {
      ElMessageBox.alert(
        `成功删除 ${successCount} 个问卷，${failCount} 个失败。\n\n失败列表：\n${failedItems.map(item => `• ${item.title}: ${item.reason}`).join('\n')}`,
        '批量删除结果',
        {
          type: 'warning',
          confirmButtonText: '知道了'
        }
      );
    } else {
      ElMessageBox.alert(
        `批量删除失败！\n\n失败列表：\n${failedItems.map(item => `• ${item.title}: ${item.reason}`).join('\n')}`,
        '批量删除失败',
        {
          type: 'error',
          confirmButtonText: '知道了'
        }
      );
    }
    
    // 清空选择并刷新列表
    selectedIds.value = [];
    selectAll.value = false;
    await loadTrashedSurveys();
  } catch (error) {
    loading.value = false;
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error("批量删除失败：" + error.message);
    }
  }
};

const clearExpired = async () => {
  try {
    const expiredSurveys = trashedSurveys.value.filter(s => getRemainingDays(s.deletedAt) === 0);
    
    if (expiredSurveys.length === 0) {
      ElMessage.info("没有过期的问卷需要清理");
      return;
    }
    
    // 显示过期问卷列表
    const expiredTitles = expiredSurveys.map(s => s.title).slice(0, 5);
    const titleList = expiredTitles.join('、');
    const moreText = expiredSurveys.length > 5 ? `等 ${expiredSurveys.length} 个问卷` : '';
    
    await ElMessageBox.confirm(
      `发现 ${expiredSurveys.length} 个已过期问卷：\n\n${titleList}${moreText}\n\n这些问卷已超过30天保留期，确定要清理吗？`,
      '清理过期问卷',
      {
        confirmButtonText: '确定清理',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 显示加载状态
    loading.value = true;
    let successCount = 0;
    let failCount = 0;
    const totalCount = expiredSurveys.length;
    const failedItems = [];
    
    // 使用 ElMessage 显示进度
    const progressMessage = ElMessage({
      message: `正在清理过期问卷... (0/${totalCount})`,
      type: 'info',
      duration: 0,
      showClose: false
    });
    
    for (let i = 0; i < expiredSurveys.length; i++) {
      const survey = expiredSurveys[i];
      
      try {
        const response = await fetch(`http://localhost:3002/recycleBin/${survey.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('删除失败');
        }
        
        successCount++;
        
        // 更新进度
        progressMessage.close();
        ElMessage({
          message: `正在清理过期问卷... (${successCount + failCount}/${totalCount})`,
          type: 'info',
          duration: 0,
          showClose: false
        });
      } catch (error) {
        console.error(`清理问卷 ${survey.title} 失败:`, error);
        failCount++;
        failedItems.push({ 
          id: survey.id, 
          title: survey.title, 
          reason: error.message 
        });
      }
    }
    
    // 关闭进度提示
    progressMessage.close();
    
    // 显示结果
    loading.value = false;
    
    if (successCount > 0 && failCount === 0) {
      ElMessage.success(`成功清理 ${successCount} 个过期问卷！`);
    } else if (successCount > 0 && failCount > 0) {
      ElMessageBox.alert(
        `成功清理 ${successCount} 个问卷，${failCount} 个失败。\n\n失败列表：\n${failedItems.map(item => `• ${item.title}: ${item.reason}`).join('\n')}`,
        '清理结果',
        {
          type: 'warning',
          confirmButtonText: '知道了'
        }
      );
    } else {
      ElMessageBox.alert(
        `清理失败！\n\n失败列表：\n${failedItems.map(item => `• ${item.title}: ${item.reason}`).join('\n')}`,
        '清理失败',
        {
          type: 'error',
          confirmButtonText: '知道了'
        }
      );
    }
    
    await loadTrashedSurveys();
  } catch (error) {
    loading.value = false;
    if (error !== 'cancel') {
      console.error('清理过期问卷失败:', error);
      ElMessage.error("清理失败：" + error.message);
    }
  }
};

const goToCreated = () => {
  router.push("/profile/questionnaires/created");
};

// 键盘快捷键
const handleKeydown = (event) => {
  // Ctrl/Cmd + A: 全选
  if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
    event.preventDefault();
    if (filteredSurveys.value.length > 0) {
      selectAll.value = true;
      handleSelectAll(true);
    }
  }
  
  // Delete 键: 批量删除
  if (event.key === 'Delete' && selectedIds.value.length > 0 && !event.shiftKey) {
    event.preventDefault();
    batchDelete();
  }
  
  // Ctrl/Cmd + R: 批量恢复
  if ((event.ctrlKey || event.metaKey) && event.key === 'r' && selectedIds.value.length > 0) {
    event.preventDefault();
    batchRestore();
  }
  
  // Escape: 取消选择
  if (event.key === 'Escape' && selectedIds.value.length > 0) {
    selectedIds.value = [];
    selectAll.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadTrashedSurveys();
  
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown);
});

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.trash-page {
  padding: 20px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-info h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
}

.header-info p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.keyboard-hints {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.keyboard-hints .el-tag {
  font-family: 'Courier New', monospace;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-badge {
  margin-left: 8px;
}

.header-actions .el-button {
  position: relative;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, #909399, #b1b3b8);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #E6A23C, #ebb563);
}

.stat-icon.success {
  background: linear-gradient(135deg, #67C23A, #85ce61);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

/* 问卷列表 */
.survey-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.select-all-checkbox {
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.survey-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid #909399;
}

.survey-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.survey-item.selected {
  border-left-color: #409EFF;
  background: #f0f9ff;
}

.survey-item.expiring-soon {
  border-left-color: #F56C6C;
}

.survey-checkbox {
  flex-shrink: 0;
}

.survey-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.survey-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f5f7fa;
  border-radius: 12px;
  flex-shrink: 0;
}

.survey-info {
  flex: 1;
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.survey-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.survey-badges {
  display: flex;
  gap: 8px;
}

.survey-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
}

.survey-description {
  color: #909399;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.expiry-alert {
  margin-top: 12px;
}

.survey-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  margin: 40px 0;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 提示卡片 */
.notice-card {
  margin-top: 20px;
  border-radius: 12px;
}

.notice-card h3 {
  margin: 0;
  color: #303133;
}

.notice-content .el-alert {
  margin-bottom: 12px;
}

.notice-content .el-alert:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trash-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .stats-section .el-col {
    margin-bottom: 16px;
  }
  
  .survey-item {
    flex-direction: column;
    gap: 16px;
  }
  
  .survey-main {
    width: 100%;
  }
  
  .survey-actions {
    width: 100%;
    justify-content: center;
  }
  
  .survey-meta {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .survey-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .survey-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .header-actions {
    flex-direction: column;
  }
}
</style>