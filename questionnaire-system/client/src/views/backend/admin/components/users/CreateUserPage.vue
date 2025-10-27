<template>
  <div class="admin-create-user">
    <el-page-header
      content="创建管理员"
      @back="$router.push('/admin/admins')"
    />

    <el-card style="margin-top: 16px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="admin@example.com" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">创建</el-button>
          <el-button type="text" @click="$router.push('/admin/admins')"
            >取消</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import request from "@/api";

const form = reactive({ email: "", password: "", nickname: "" });

const submit = async () => {
  try {
    const data = { ...form, role: "admin" };
    const res = await request.post("/admin/users", data);
    // success
    ElMessage.success("管理员已创建/更新");
    // go back to admin list
    window.$router?.push("/admin/admins");
  } catch (err) {
    ElMessage.error(err.message || "创建失败");
  }
};
</script>

<style lang="scss" scoped>

.admin-create-user {
  padding: 16px;
}
</style>s
