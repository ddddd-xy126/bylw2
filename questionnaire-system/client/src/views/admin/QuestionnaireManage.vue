<template>
  <div class="admin-surveys">
    <el-page-header
      content="问卷管理"
      @back="$router.push('/admin/dashboard')"
    />

    <div class="surveys-content">
      <!-- 筛选和操作栏 -->
      <el-card class="toolbar-card">
        <el-row :gutter="16" justify="space-between">
          <el-col :span="12">
            <el-row :gutter="12">
              <el-col :span="8">
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
                  v-model="statusFilter"
                  placeholder="状态筛选"
                  clearable
                  @change="handleFilter"
                >
                  <el-option label="全部状态" value="" />
                  <el-option label="进行中" value="active" />
                  <el-option label="已暂停" value="paused" />
                  <el-option label="已结束" value="ended" />
                </el-select>
              </el-col>

              <el-col :span="6">
                <el-select
                  v-model="categoryFilter"
                  placeholder="分类筛选"
                  clearable
                  @change="handleFilter"
                >
                  <el-option label="全部分类" value="" />
                  <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-col>
            </el-row>
          </el-col>

          <el-col :span="12" class="toolbar-actions">
            <el-button type="primary" @click="createSurvey">
              <el-icon><Plus /></el-icon>
              新建问卷
            </el-button>
            <el-button @click="exportSurveys">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 问卷列表 -->
      <el-card class="surveys-table-card">
        <el-table
          :data="filteredSurveys"
          v-loading="loading"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />

          <el-table-column prop="id" label="ID" width="80" />

          <el-table-column prop="title" label="问卷标题" min-width="200">
            <template #default="{ row }">
              <div class="survey-title">
                <h4>{{ row.title }}</h4>
                <p>{{ row.description }}</p>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="category" label="分类" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.category?.name || "未分类" }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="统计数据" width="160">
            <template #default="{ row }">
              <div class="survey-stats">
                <div class="stat-item">
                  <span class="stat-label">问题数:</span>
                  <span class="stat-value">{{
                    row.questions?.length || 0
                  }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">答卷数:</span>
                  <span class="stat-value">{{ row._count?.answers || 0 }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="editSurvey(row.id)"
                >
                  编辑
                </el-button>

                <el-dropdown @command="(cmd) => handleAction(cmd, row)">
                  <el-button type="info" size="small">
                    更多 <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="view">
                        查看详情
                      </el-dropdown-item>
                      <el-dropdown-item command="analytics">
                        数据分析
                      </el-dropdown-item>
                      <el-dropdown-item command="copy">
                        复制问卷
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="
                          row.status === 'active' ? 'pause' : 'activate'
                        "
                      >
                        {{ row.status === "active" ? "暂停" : "激活" }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="delete"
                        class="danger-item"
                        divided
                      >
                        删除问卷
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 批量操作 -->
        <div class="batch-actions" v-if="selectedSurveys.length > 0">
          <span class="selected-info">
            已选择 {{ selectedSurveys.length }} 项
          </span>

          <el-button type="warning" @click="batchUpdateStatus('paused')">
            批量暂停
          </el-button>

          <el-button type="success" @click="batchUpdateStatus('active')">
            批量激活
          </el-button>

          <el-popconfirm
            title="确定要删除选中的问卷吗？"
            @confirm="batchDelete"
          >
            <template #reference>
              <el-button type="danger">批量删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-card>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper, total, sizes"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 问卷详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="问卷详情"
      width="70%"
      :destroy-on-close="true"
    >
      <div v-if="selectedSurvey" class="survey-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="问卷标题">
            {{ selectedSurvey.title }}
          </el-descriptions-item>
          <el-descriptions-item label="问卷状态">
            <el-tag :type="getStatusType(selectedSurvey.status)">
              {{ getStatusText(selectedSurvey.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ selectedSurvey.category?.name || "未分类" }}
          </el-descriptions-item>
          <el-descriptions-item label="创建者">
            {{ selectedSurvey.creator?.username || "未知" }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(selectedSurvey.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(selectedSurvey.updatedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="问题数量">
            {{ selectedSurvey.questions?.length || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="答卷数量">
            {{ selectedSurvey._count?.answers || 0 }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="survey-description">
          <h4>问卷描述</h4>
          <p>{{ selectedSurvey.description || "暂无描述" }}</p>
        </div>

        <div class="questions-preview" v-if="selectedSurvey.questions?.length">
          <h4>问题预览</h4>
          <div
            v-for="(question, index) in selectedSurvey.questions"
            :key="question.id"
            class="question-item"
          >
            <div class="question-header">
              <span class="question-number">Q{{ index + 1 }}</span>
              <span class="question-type">{{
                getQuestionTypeText(question.type)
              }}</span>
            </div>
            <div class="question-text">{{ question.text }}</div>
            <div class="question-options" v-if="question.options?.length">
              <el-tag
                v-for="option in question.options"
                :key="option"
                size="small"
                class="option-tag"
              >
                {{ option }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="editSurvey(selectedSurvey.id)">
          编辑问卷
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Plus,
  Download,
  Refresh,
  ArrowDown,
} from "@element-plus/icons-vue";

import {
  getSurveysApi,
  getSurveyDetailApi,
  deleteSurveyApi,
  updateSurveyStatusApi,
  copySurveyApi,
  getCategoriesApi,
} from "@/api/admin";

const router = useRouter();

// 响应式数据
const loading = ref(false);
const surveys = ref([]);
const categories = ref([]);
const searchKeyword = ref("");
const statusFilter = ref("");
const categoryFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const selectedSurveys = ref([]);

const detailDialogVisible = ref(false);
const selectedSurvey = ref(null);

// 计算属性
const filteredSurveys = computed(() => {
  let result = surveys.value;

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter(
      (survey) =>
        survey.title.includes(searchKeyword.value) ||
        survey.description?.includes(searchKeyword.value)
    );
  }

  // 状态筛选
  if (statusFilter.value) {
    result = result.filter((survey) => survey.status === statusFilter.value);
  }

  // 分类筛选
  if (categoryFilter.value) {
    result = result.filter(
      (survey) => survey.categoryId === categoryFilter.value
    );
  }

  total.value = result.length;
  return result;
});

// 方法
const loadSurveys = async () => {
  loading.value = true;
  try {
    const data = await getSurveysApi({
      page: currentPage.value,
      limit: pageSize.value,
    });
    surveys.value = data.items || [];
    total.value = data.total || 0;
  } catch (error) {
    ElMessage.error("加载问卷列表失败：" + error.message);
  } finally {
    loading.value = false;
  }
};

const loadCategories = async () => {
  try {
    const data = await getCategoriesApi();
    categories.value = data || [];
  } catch (error) {
    console.error("加载分类失败：", error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleFilter = () => {
  currentPage.value = 1;
};

const handlePageChange = (page) => {
  currentPage.value = page;
  loadSurveys();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadSurveys();
};

const handleSelectionChange = (selection) => {
  selectedSurveys.value = selection;
};

const refreshData = () => {
  loadSurveys();
  loadCategories();
};

const getStatusType = (status) => {
  const types = {
    active: "success",
    paused: "warning",
    ended: "info",
  };
  return types[status] || "info";
};

const getStatusText = (status) => {
  const texts = {
    active: "进行中",
    paused: "已暂停",
    ended: "已结束",
  };
  return texts[status] || "未知";
};

const getQuestionTypeText = (type) => {
  const texts = {
    single: "单选题",
    multiple: "多选题",
    text: "文本题",
    scale: "量表题",
  };
  return texts[type] || "未知";
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("zh-CN");
};

const createSurvey = () => {
  router.push("/admin/surveys/create");
};

const editSurvey = (surveyId) => {
  router.push(`/admin/surveys/edit/${surveyId}`);
};

const handleAction = async (command, survey) => {
  switch (command) {
    case "view":
      try {
        const detail = await getSurveyDetailApi(survey.id);
        selectedSurvey.value = detail;
        detailDialogVisible.value = true;
      } catch (error) {
        ElMessage.error("获取问卷详情失败：" + error.message);
      }
      break;

    case "analytics":
      router.push(`/admin/surveys/${survey.id}/analytics`);
      break;

    case "copy":
      try {
        await copySurveyApi(survey.id);
        ElMessage.success("问卷复制成功");
        refreshData();
      } catch (error) {
        ElMessage.error("复制失败：" + error.message);
      }
      break;

    case "pause":
    case "activate":
      try {
        const newStatus = command === "pause" ? "paused" : "active";
        await updateSurveyStatusApi(survey.id, newStatus);
        survey.status = newStatus;
        ElMessage.success(`问卷已${newStatus === "paused" ? "暂停" : "激活"}`);
      } catch (error) {
        ElMessage.error("状态更新失败：" + error.message);
      }
      break;

    case "delete":
      try {
        await ElMessageBox.confirm(
          "确定要删除这个问卷吗？删除后无法恢复！",
          "警告",
          {
            type: "warning",
          }
        );
        await deleteSurveyApi(survey.id);
        ElMessage.success("删除成功");
        refreshData();
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败：" + error.message);
        }
      }
      break;
  }
};

const batchUpdateStatus = async (status) => {
  try {
    const ids = selectedSurveys.value.map((s) => s.id);
    await Promise.all(ids.map((id) => updateSurveyStatusApi(id, status)));
    ElMessage.success(`批量${status === "paused" ? "暂停" : "激活"}成功`);
    refreshData();
  } catch (error) {
    ElMessage.error("批量操作失败：" + error.message);
  }
};

const batchDelete = async () => {
  try {
    const ids = selectedSurveys.value.map((s) => s.id);
    await Promise.all(ids.map((id) => deleteSurveyApi(id)));
    ElMessage.success("批量删除成功");
    refreshData();
  } catch (error) {
    ElMessage.error("批量删除失败：" + error.message);
  }
};

const exportSurveys = () => {
  // 导出问卷数据
  const csvContent = filteredSurveys.value
    .map((survey) =>
      [
        survey.id,
        survey.title,
        survey.category?.name || "未分类",
        getStatusText(survey.status),
        survey.questions?.length || 0,
        survey._count?.answers || 0,
        formatDate(survey.createdAt),
      ].join(",")
    )
    .join("\n");

  const header = "ID,标题,分类,状态,问题数,答卷数,创建时间\n";
  const blob = new Blob([header + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "问卷数据.csv";
  link.click();

  ElMessage.success("导出成功");
};

// 生命周期
onMounted(() => {
  loadSurveys();
  loadCategories();
});
</script>

<style scoped>
.admin-surveys {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.surveys-content {
  margin-top: 20px;
}

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar-actions {
  text-align: right;
}

.surveys-table-card {
  margin-bottom: 20px;
}

.survey-title h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
}

.survey-title p {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.survey-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.stat-label {
  color: #666;
}

.stat-value {
  color: #333;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-top: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.selected-info {
  font-size: 14px;
  color: #666;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.survey-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.survey-description {
  margin: 20px 0;
}

.survey-description h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.survey-description p {
  margin: 0;
  line-height: 1.6;
  color: #666;
}

.questions-preview {
  margin-top: 20px;
}

.questions-preview h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.question-item {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.question-number {
  font-weight: bold;
  color: #409eff;
}

.question-type {
  font-size: 12px;
  color: #666;
}

.question-text {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.question-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-tag {
  margin-right: 0;
}

.danger-item {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .admin-surveys {
    padding: 16px;
  }

  .toolbar-actions {
    text-align: left;
    margin-top: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .batch-actions {
    flex-wrap: wrap;
  }
}
</style>
