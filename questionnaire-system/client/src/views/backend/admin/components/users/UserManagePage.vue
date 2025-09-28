<template>
  <div class="admin-users">
    <el-page-header
      content="用户管理"
      @back="$router.push('/admin/dashboard')"
    />

    <div class="users-content">
      <!-- 筛选和操作栏 -->
      <el-card class="toolbar-card">
        <el-row :gutter="16" justify="space-between">
          <el-col :span="12">
            <el-row :gutter="12">
              <el-col :span="8">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索用户名或邮箱"
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
                  v-model="roleFilter"
                  placeholder="角色筛选"
                  clearable
                  @change="handleFilter"
                >
                  <el-option label="全部角色" value="" />
                  <el-option label="管理员" value="admin" />
                  <el-option label="普通用户" value="user" />
                </el-select>
              </el-col>

              <el-col :span="6">
                <el-select
                  v-model="statusFilter"
                  placeholder="状态筛选"
                  clearable
                  @change="handleFilter"
                >
                  <el-option label="全部状态" value="" />
                  <el-option label="正常" value="active" />
                  <el-option label="已封禁" value="banned" />
                  <el-option label="未激活" value="inactive" />
                </el-select>
              </el-col>
            </el-row>
          </el-col>

          <el-col :span="12" class="toolbar-actions">
            <el-button type="primary" @click="createUser">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
            <el-button @click="exportUsers">
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

      <!-- 用户统计 -->
      <el-row :gutter="20" class="stats-section">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#409EFF"><User /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ totalUsers }}</div>
                <div class="stats-label">总用户数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#67C23A"><UserFilled /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ activeUsers }}</div>
                <div class="stats-label">活跃用户</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#E6A23C"><Warning /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ bannedUsers }}</div>
                <div class="stats-label">已封禁</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#F56C6C"><Avatar /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ adminUsers }}</div>
                <div class="stats-label">管理员</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-card class="users-table-card">
        <el-table
          :data="filteredUsers"
          v-loading="loading"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />

          <el-table-column prop="id" label="ID" width="80" />

          <el-table-column label="用户信息" min-width="200">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="32" :src="getUserAvatar(row.username)">
                  {{ row.username?.charAt(0) }}
                </el-avatar>
                <div class="user-details">
                  <h4>{{ row.username }}</h4>
                  <p>{{ row.email }}</p>
                  <span class="user-id">ID: {{ row.id }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="nickname" label="昵称" width="120" />

          <el-table-column label="地区/职业" width="150">
            <template #default="{ row }">
              <div class="location-info">
                <div class="city">{{ row.city || '未知' }}</div>
                <div class="profession">{{ row.profession || '未填写' }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.role === 'admin' ? 'danger' : 'primary'"
                size="small"
              >
                {{ row.role === "admin" ? "管理员" : "普通用户" }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row)" size="small">
                {{ getStatusText(row) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="统计数据" width="140">
            <template #default="{ row }">
              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-label">答卷:</span>
                  <span class="stat-value">{{ row._count?.answers || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">收藏:</span>
                  <span class="stat-value">{{
                    row._count?.favorites || 0
                  }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="注册时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column prop="lastLoginAt" label="最后登录" width="120">
            <template #default="{ row }">
              {{ formatDate(row.lastLoginAt) || "从未" }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="viewUserDetail(row)"
                >
                  查看
                </el-button>

                <el-dropdown @command="(cmd) => handleAction(cmd, row)">
                  <el-button type="info" size="small">
                    更多 <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        编辑信息
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="row.role === 'admin' ? 'demote' : 'promote'"
                      >
                        {{ row.role === "admin" ? "降为用户" : "提升管理员" }}
                      </el-dropdown-item>
                      <el-dropdown-item command="resetPassword">
                        重置密码
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="row.banned ? 'unban' : 'ban'"
                        :class="row.banned ? '' : 'danger-item'"
                        divided
                      >
                        {{ row.banned ? "解除封禁" : "封禁用户" }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" class="danger-item">
                        删除用户
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 批量操作 -->
        <div class="batch-actions" v-if="selectedUsers.length > 0">
          <span class="selected-info">
            已选择 {{ selectedUsers.length }} 项
          </span>

          <el-button type="warning" @click="batchBan"> 批量封禁 </el-button>

          <el-button type="success" @click="batchUnban"> 批量解封 </el-button>

          <el-popconfirm
            title="确定要删除选中的用户吗？"
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

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="60%"
      :destroy-on-close="true"
    >
      <div v-if="selectedUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">
            {{ selectedUser.username }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ selectedUser.email }}
          </el-descriptions-item>
          <el-descriptions-item label="昵称">
            {{ selectedUser.nickname || "未设置" }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ selectedUser.phone || "未绑定" }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag
              :type="selectedUser.role === 'admin' ? 'danger' : 'primary'"
            >
              {{ selectedUser.role === "admin" ? "管理员" : "普通用户" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedUser)">
              {{ getStatusText(selectedUser) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="城市">
            {{ selectedUser.city || "未填写" }}
          </el-descriptions-item>
          <el-descriptions-item label="职业">
            {{ selectedUser.profession || "未填写" }}
          </el-descriptions-item>
          <el-descriptions-item label="年龄">
            {{ selectedUser.age ? selectedUser.age + '岁' : "未填写" }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ selectedUser.gender === 'male' ? '男' : selectedUser.gender === 'female' ? '女' : '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="积分等级">
            {{ selectedUser.points }}分 / 等级{{ selectedUser.level }}
          </el-descriptions-item>
          <el-descriptions-item label="个人简介" :span="2">
            {{ selectedUser.bio || "暂无简介" }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ formatDateTime(selectedUser.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录">
            {{ formatDateTime(selectedUser.lastLoginAt) || "从未登录" }}
          </el-descriptions-item>
          <el-descriptions-item label="登录IP">
            {{ selectedUser.lastLoginIp || "未知" }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="activity-stats" v-if="selectedUser.stats">
          <h4>活动统计</h4>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="activity-item">
                <span class="activity-label">答题数量</span>
                <span class="activity-value">{{
                  selectedUser.stats.totalAnswers || 0
                }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="activity-item">
                <span class="activity-label">收藏数量</span>
                <span class="activity-value">{{
                  selectedUser.stats.totalFavorites || 0
                }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="activity-item">
                <span class="activity-label">总积分</span>
                <span class="activity-value">{{
                  selectedUser.stats.totalPoints || 0
                }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="editUser(selectedUser)">
          编辑用户
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户"
      width="50%"
      :destroy-on-close="true"
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="banned">
          <el-switch
            v-model="editForm.banned"
            active-text="已封禁"
            inactive-text="正常"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser" :loading="saving">
          保存
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
  User,
  UserFilled,
  Warning,
  Avatar,
} from "@element-plus/icons-vue";

import {
  getUsersApi,
  getUserDetailApi,
  updateUserApi,
  banUserApi,
  unbanUserApi,
  deleteUserApi,
  resetPasswordApi,
} from "@/api/admin";

const router = useRouter();

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const users = ref([]);
const searchKeyword = ref("");
const roleFilter = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const selectedUsers = ref([]);

const detailDialogVisible = ref(false);
const editDialogVisible = ref(false);
const selectedUser = ref(null);

const editForm = reactive({
  id: "",
  username: "",
  email: "",
  nickname: "",
  role: "user",
  banned: false,
});

const editRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
};

const editFormRef = ref();

// 计算属性
const filteredUsers = computed(() => {
  let result = users.value;

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter(
      (user) =>
        user.username.includes(searchKeyword.value) ||
        user.email.includes(searchKeyword.value) ||
        user.nickname?.includes(searchKeyword.value)
    );
  }

  // 角色筛选
  if (roleFilter.value) {
    result = result.filter((user) => user.role === roleFilter.value);
  }

  // 状态筛选
  if (statusFilter.value) {
    if (statusFilter.value === "active") {
      result = result.filter((user) => !user.banned && user.isActive);
    } else if (statusFilter.value === "banned") {
      result = result.filter((user) => user.banned);
    } else if (statusFilter.value === "inactive") {
      result = result.filter((user) => !user.isActive);
    }
  }

  total.value = result.length;
  return result;
});

const totalUsers = computed(() => users.value.length);
const activeUsers = computed(
  () => users.value.filter((u) => !u.banned && u.isActive).length
);
const bannedUsers = computed(() => users.value.filter((u) => u.banned).length);
const adminUsers = computed(
  () => users.value.filter((u) => u.role === "admin").length
);

// 方法
const loadUsers = async () => {
  loading.value = true;
  try {
    // 从json-server加载用户数据
    const { getUsersApi } = await import('@/api/admin.js');
    const response = await getUsersApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchKeyword.value,
      status: statusFilter.value,
      role: roleFilter.value
    });
    users.value = response.list;
    total.value = response.total;
  } catch (error) {
    ElMessage.error("加载用户列表失败：" + error.message);
  } finally {
    loading.value = false;
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
  loadUsers();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadUsers();
};

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
};

const refreshData = () => {
  loadUsers();
};

const getStatusType = (user) => {
  if (user.banned) return "danger";
  if (!user.isActive) return "warning";
  return "success";
};

const getStatusText = (user) => {
  if (user.banned) return "已封禁";
  if (!user.isActive) return "未激活";
  return "正常";
};

const getUserAvatar = (username) => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("zh-CN");
};

const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("zh-CN");
};

const createUser = () => {
  // 打开创建用户对话框
  Object.assign(editForm, {
    id: "",
    username: "",
    email: "",
    nickname: "",
    role: "user",
    banned: false,
  });
  editDialogVisible.value = true;
};

const viewUserDetail = async (user) => {
  try {
    const detail = await getUserDetailApi(user.id);
    selectedUser.value = detail;
    detailDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取用户详情失败：" + error.message);
  }
};

const editUser = (user) => {
  Object.assign(editForm, {
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.nickname || "",
    role: user.role,
    banned: user.banned || false,
  });
  editDialogVisible.value = true;
  detailDialogVisible.value = false;
};

const saveUser = async () => {
  try {
    await editFormRef.value.validate();
    saving.value = true;

    if (editForm.id) {
      // 更新用户
      await updateUserApi(editForm.id, editForm);
      ElMessage.success("用户信息更新成功");
    } else {
      // 创建用户
      await createUserApi(editForm);
      ElMessage.success("用户创建成功");
    }

    editDialogVisible.value = false;
    refreshData();
  } catch (error) {
    ElMessage.error("保存失败：" + error.message);
  } finally {
    saving.value = false;
  }
};

const handleAction = async (command, user) => {
  switch (command) {
    case "edit":
      editUser(user);
      break;

    case "promote":
    case "demote":
      try {
        const newRole = command === "promote" ? "admin" : "user";
        await updateUserApi(user.id, { role: newRole });
        user.role = newRole;
        ElMessage.success(
          `用户角色已更新为${newRole === "admin" ? "管理员" : "普通用户"}`
        );
      } catch (error) {
        ElMessage.error("角色更新失败：" + error.message);
      }
      break;

    case "resetPassword":
      try {
        await ElMessageBox.confirm("确定要重置该用户的密码吗？", "确认重置", {
          type: "warning",
        });
        const newPassword = await resetPasswordApi(user.id);
        ElMessage.success(`密码已重置为：${newPassword}`);
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("重置密码失败：" + error.message);
        }
      }
      break;

    case "ban":
      try {
        await banUserApi(user.id);
        user.banned = true;
        ElMessage.success("用户已封禁");
      } catch (error) {
        ElMessage.error("封禁失败：" + error.message);
      }
      break;

    case "unban":
      try {
        await unbanUserApi(user.id);
        user.banned = false;
        ElMessage.success("用户已解封");
      } catch (error) {
        ElMessage.error("解封失败：" + error.message);
      }
      break;

    case "delete":
      try {
        await ElMessageBox.confirm(
          "确定要删除这个用户吗？删除后无法恢复！",
          "警告",
          {
            type: "warning",
          }
        );
        await deleteUserApi(user.id);
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

const batchBan = async () => {
  try {
    const ids = selectedUsers.value.map((u) => u.id);
    await Promise.all(ids.map((id) => banUserApi(id)));
    ElMessage.success("批量封禁成功");
    refreshData();
  } catch (error) {
    ElMessage.error("批量封禁失败：" + error.message);
  }
};

const batchUnban = async () => {
  try {
    const ids = selectedUsers.value.map((u) => u.id);
    await Promise.all(ids.map((id) => unbanUserApi(id)));
    ElMessage.success("批量解封成功");
    refreshData();
  } catch (error) {
    ElMessage.error("批量解封失败：" + error.message);
  }
};

const batchDelete = async () => {
  try {
    const ids = selectedUsers.value.map((u) => u.id);
    await Promise.all(ids.map((id) => deleteUserApi(id)));
    ElMessage.success("批量删除成功");
    refreshData();
  } catch (error) {
    ElMessage.error("批量删除失败：" + error.message);
  }
};

const exportUsers = () => {
  // 导出用户数据
  const csvContent = filteredUsers.value
    .map((user) =>
      [
        user.id,
        user.username,
        user.email,
        user.nickname || "",
        user.role === "admin" ? "管理员" : "普通用户",
        getStatusText(user),
        formatDate(user.createdAt),
        formatDate(user.lastLoginAt) || "从未",
      ].join(",")
    )
    .join("\n");

  const header = "ID,用户名,邮箱,昵称,角色,状态,注册时间,最后登录\n";
  const blob = new Blob([header + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "用户数据.csv";
  link.click();

  ElMessage.success("导出成功");
};

// 生命周期
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.admin-users {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.users-content {
  margin-top: 20px;
}

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar-actions {
  text-align: right;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-card {
  height: 80px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stats-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.users-table-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
}

.user-details p {
  margin: 0 0 2px 0;
  font-size: 12px;
  color: #666;
}

.user-id {
  font-size: 11px;
  color: #999;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.city {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.profession {
  font-size: 11px;
  color: #666;
}

.user-stats {
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

.user-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.activity-stats {
  margin-top: 20px;
}

.activity-stats h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.activity-label {
  color: #666;
}

.activity-value {
  font-weight: bold;
  color: #333;
}

.danger-item {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .admin-users {
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

  .stats-section .el-col {
    margin-bottom: 12px;
  }
}
</style>
