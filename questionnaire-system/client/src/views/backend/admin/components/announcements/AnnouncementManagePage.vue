<template>
  <div class="announcement-manage-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>公告管理</h1>
        <p>发布和管理系统公告通知</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          发布新公告
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-section">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalCount }}</div>
              <div class="stat-label">总公告数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ activeCount }}</div>
              <div class="stat-label">生效中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon expired">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ expiredCount }}</div>
              <div class="stat-label">已过期</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon views">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalViews }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和操作 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索公告标题"
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
            v-model="filterType"
            placeholder="公告类型"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部" value="" />
            <el-option label="信息" value="info" />
            <el-option label="成功" value="success" />
            <el-option label="警告" value="warning" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="filterStatus"
            placeholder="状态"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部" value="" />
            <el-option label="生效中" value="active" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadAnnouncements">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 公告列表 -->
    <el-card class="list-card" shadow="never">
      <el-table :data="filteredAnnouncements" v-loading="loading" row-key="id">
        <el-table-column prop="title" label="公告标题" min-width="200">
          <template #default="{ row }">
            <div class="announcement-title">
              <el-icon :color="getTypeColor(row.type)" size="18">
                <component :is="getTypeIcon(row.type)" />
              </el-icon>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="公告内容" min-width="300">
          <template #default="{ row }">
            <div class="announcement-content">{{ row.content }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="views"
          label="浏览量"
          width="100"
          align="center"
        />

        <el-table-column prop="publishedAt" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.publishedAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="isAnnouncementActive(row) ? 'success' : 'info'"
              size="small"
            >
              {{ isAnnouncementActive(row) ? "生效中" : "已过期" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="editAnnouncement(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="text" size="small" @click="toggleStatus(row)">
              <el-icon><Switch /></el-icon>
              {{ row.isActive ? "停用" : "启用" }}
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="deleteAnnouncement(row)"
              class="danger-btn"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredAnnouncements.length === 0"
        description="暂无公告"
      />

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="totalCount > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑公告对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑公告' : '发布新公告'"
      width="600px"
    >
      <el-form
        :model="announcementForm"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="公告标题" prop="title">
          <el-input
            v-model="announcementForm.title"
            placeholder="请输入公告标题"
          />
        </el-form-item>

        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="announcementForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入公告内容"
          />
        </el-form-item>

        <el-form-item label="公告类型" prop="type">
          <el-select
            v-model="announcementForm.type"
            placeholder="请选择公告类型"
          >
            <el-option label="信息" value="info" />
            <el-option label="成功" value="success" />
            <el-option label="警告" value="warning" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select
            v-model="announcementForm.priority"
            placeholder="请选择优先级"
          >
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>

        <el-form-item label="过期时间">
          <el-date-picker
            v-model="announcementForm.expiresAt"
            type="datetime"
            placeholder="选择过期时间(可选)"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="announcementForm.isActive" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAnnouncement">
            {{ isEditing ? "保存" : "发布" }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Search,
  Refresh,
  Document,
  CircleCheck,
  Clock,
  View,
  Edit,
  Delete,
  Switch,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user";
import { useListFilter } from "@/hooks/useListFilter";
import {
  getAnnouncementsApi,
  createAnnouncementApi,
  updateAnnouncementApi,
  deleteAnnouncementApi,
} from "@/api/admin";

const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const announcements = ref([]);
const filterType = ref("");
const filterStatus = ref("");
const dialogVisible = ref(false);
const isEditing = ref(false);
const formRef = ref(null);

// 公告表单
const announcementForm = reactive({
  id: null,
  title: "",
  content: "",
  type: "info",
  priority: "medium",
  isActive: true,
  expiresAt: null,
});

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: "请输入公告标题", trigger: "blur" },
    {
      min: 2,
      max: 100,
      message: "标题长度在 2 到 100 个字符",
      trigger: "blur",
    },
  ],
  content: [
    { required: true, message: "请输入公告内容", trigger: "blur" },
    {
      min: 10,
      max: 500,
      message: "内容长度在 10 到 500 个字符",
      trigger: "blur",
    },
  ],
  type: [{ required: true, message: "请选择公告类型", trigger: "change" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
};

// 计算属性
const totalCount = computed(() => announcements.value.length);
const activeCount = computed(
  () => announcements.value.filter((a) => isAnnouncementActive(a)).length
);
const expiredCount = computed(
  () => announcements.value.filter((a) => !isAnnouncementActive(a)).length
);
const totalViews = computed(() =>
  announcements.value.reduce((sum, a) => sum + (a.views || 0), 0)
);

// 为保留按类型/状态的筛选，在传入 useListFilter 前先做预过滤
const sourceForFilter = computed(() => {
  let list = announcements.value;

  if (filterType.value) {
    list = list.filter((item) => item.type === filterType.value);
  }

  if (filterStatus.value) {
    list = list.filter((item) => {
      const active = isAnnouncementActive(item);
      return filterStatus.value === "active" ? active : !active;
    });
  }

  return list;
});

// 使用复用的 hooks 管理搜索/分页/通用筛选
const {
  searchKeyword,
  currentPage,
  pageSize,
  filteredList: filteredAnnouncements,
  totalItems,
  handleSearch,
  handleFilter,
  handlePageChange,
} = useListFilter({ sourceList: sourceForFilter, searchFields: ["title"] });

// 方法
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const isAnnouncementActive = (announcement) => {
  if (!announcement.isActive) return false;
  if (!announcement.expiresAt) return true;
  return new Date(announcement.expiresAt) > new Date();
};

const getTypeColor = (type) => {
  const colorMap = {
    info: "#67d474d5",
    success: "#67C23A",
    warning: "#E6A23C",
    error: "#F56C6C",
  };
  return colorMap[type] || "#67d474d5";
};

const getTypeIcon = (type) => {
  const iconMap = {
    info: "InfoFilled",
    success: "SuccessFilled",
    warning: "WarningFilled",
    error: "CircleCloseFilled",
  };
  return iconMap[type] || "InfoFilled";
};

const getTypeTagType = (type) => {
  const typeMap = {
    info: "",
    success: "success",
    warning: "warning",
    error: "danger",
  };
  return typeMap[type] || "";
};

const getTypeText = (type) => {
  const textMap = {
    info: "信息",
    success: "成功",
    warning: "警告",
    error: "错误",
  };
  return textMap[type] || "信息";
};

const getPriorityTagType = (priority) => {
  const typeMap = {
    high: "danger",
    medium: "warning",
    low: "info",
  };
  return typeMap[priority] || "info";
};

const getPriorityText = (priority) => {
  const textMap = {
    high: "高",
    medium: "中",
    low: "低",
  };
  return textMap[priority] || "中";
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("zh-CN");
};

const loadAnnouncements = async () => {
  loading.value = true;
  try {
    const data = await getAnnouncementsApi({
      sort: "publishedAt",
      order: "desc",
    });
    announcements.value = data;
  } catch (error) {
    ElMessage.error("加载公告失败：" + error.message);
  } finally {
    loading.value = false;
  }
};

const showCreateDialog = () => {
  isEditing.value = false;
  Object.assign(announcementForm, {
    id: null,
    title: "",
    content: "",
    type: "info",
    priority: "medium",
    isActive: true,
    expiresAt: null,
  });
  dialogVisible.value = true;
};

const editAnnouncement = (announcement) => {
  isEditing.value = true;
  Object.assign(announcementForm, {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    priority: announcement.priority,
    isActive: announcement.isActive,
    expiresAt: announcement.expiresAt,
  });
  dialogVisible.value = true;
};

const submitAnnouncement = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      const data = {
        title: announcementForm.title,
        content: announcementForm.content,
        type: announcementForm.type,
        priority: announcementForm.priority,
        isActive: announcementForm.isActive,
        expiresAt: announcementForm.expiresAt,
        publishedBy: userStore.profile?.id || "3",
        publishedByName: userStore.profile?.nickname || "系统管理员",
        views: 0,
      };

      if (isEditing.value) {
        // 编辑公告
        await updateAnnouncementApi(announcementForm.id, {
          ...data,
          id: announcementForm.id,
          publishedAt:
            announcements.value.find((a) => a.id === announcementForm.id)
              ?.publishedAt || new Date().toISOString(),
        });

        ElMessage.success("公告已更新");
      } else {
        // 创建新公告
        data.publishedAt = new Date().toISOString();

        await createAnnouncementApi(data);

        ElMessage.success("公告已发布");
      }

      dialogVisible.value = false;
      await loadAnnouncements();
    } catch (error) {
      ElMessage.error("操作失败：" + error.message);
    }
  });
};

const toggleStatus = async (announcement) => {
  try {
    await updateAnnouncementApi(announcement.id, {
      isActive: !announcement.isActive,
    });

    ElMessage.success(`公告已${announcement.isActive ? "停用" : "启用"}`);
    await loadAnnouncements();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

const deleteAnnouncement = async (announcement) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除公告"${announcement.title}"吗？`,
      "确认删除",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteAnnouncementApi(announcement.id);

    ElMessage.success("公告已删除");
    await loadAnnouncements();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败：" + error.message);
    }
  }
};

onMounted(() => {
  loadAnnouncements();
});
</script>

<style lang="scss" scoped>
.announcement-manage-page {
  padding: 0;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-content {
      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
        color: #1a202c;
      }

      p {
        margin: 0;
        color: #718096;
        font-size: 16px;
      }
    }
  }

  .stats-section {
    margin-bottom: 20px;

    .stat-card {
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;

          &.total {
            background: linear-gradient(135deg, #67d474d5, #66b1ff);
          }
          &.active {
            background: linear-gradient(135deg, #67c23a, #85ce61);
          }
          &.expired {
            background: linear-gradient(135deg, #909399, #b1b3b8);
          }
          &.views {
            background: linear-gradient(135deg, #e6a23c, #ebb563);
          }
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
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;
    border-radius: 12px;
  }

  .list-card {
    border-radius: 12px;
  }

  .announcement-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .announcement-content {
    color: #606266;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .danger-btn {
    color: #f56c6c !important;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
