<template>
  <div class="admin-admins">
    <el-page-header
      content="后台 - 管理员管理"
      @back="$router.push('/admin')"
    />
    <el-card style="margin-top: 16px">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        "
      >
        <div>
          <el-button
            type="primary"
            @click="$router.push('/admin/admins/create')"
            >创建管理员</el-button
          >
        </div>
        <div>
          <el-button @click="fetch">刷新</el-button>
        </div>
      </div>

      <el-table :data="items" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="mini" @click="openEdit(row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="confirmDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="编辑管理员" :visible.sync="dialogVisible">
        <el-form :model="editForm" label-width="100px">
          <el-form-item label="邮箱">
            <el-input v-model="editForm.email" disabled />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="editForm.nickname" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="editForm.password"
              type="password"
              placeholder="留空则不修改"
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">保存</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import request from "@/api";
import { ElMessage, ElMessageBox } from "element-plus";

const items = ref([]);
const dialogVisible = ref(false);
const editForm = reactive({ id: null, email: "", nickname: "", password: "" });

const fetch = async () => {
  try {
    const { items: list } = await request.get("/admin/users");
    items.value = list.filter((u) => u.role === "admin");
  } catch (err) {
    ElMessage.error(err.message || "加载失败");
  }
};

const openEdit = (row) => {
  editForm.id = row.id;
  editForm.email = row.email;
  editForm.nickname = row.nickname;
  editForm.password = "";
  dialogVisible.value = true;
};

const submitEdit = async () => {
  try {
    const payload = { email: editForm.email, nickname: editForm.nickname };
    if (editForm.password) payload.password = editForm.password;
    await request.post("/admin/users", payload);
    ElMessage.success("保存成功");
    dialogVisible.value = false;
    await fetch();
  } catch (err) {
    ElMessage.error(err.message || "保存失败");
  }
};

const confirmDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定删除该用户？", "删除确认", {
      type: "warning",
    });
    await request.delete(`/admin/users/${row.id}`);
    ElMessage.success("删除成功");
    await fetch();
  } catch (err) {
    if (err !== "cancel") ElMessage.error(err.message || "删除失败");
  }
};

onMounted(fetch);
</script>

<style lang="scss" scoped>

.admin-admins {
  padding: 16px;
}
</style>
