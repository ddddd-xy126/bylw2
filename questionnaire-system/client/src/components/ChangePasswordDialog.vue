<template>
  <el-dialog
    v-model="visible"
    :append-to-body="true"
    :destroy-on-close="true"
    :z-index="3000"
    width="480px"
    class="password-dialog"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-icon">
          <el-icon><Lock /></el-icon>
        </div>
        <div class="header-text">
          <h3>修改密码</h3>
          <p>为了您的账户安全，请定期更换密码</p>
        </div>
      </div>
    </template>

    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      label-width="80px"
      class="password-form"
    >
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="请输入6位以上的新密码"
          show-password
          size="large"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          size="large"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <div class="password-tips">
        <el-icon><InfoFilled /></el-icon>
        <span>密码强度建议：包含字母、数字和特殊字符，长度不少于8位</span>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="large">取消</el-button>
        <el-button
          type="primary"
          @click="changePassword"
          :loading="changingPassword"
          size="large"
        >
          <el-icon v-if="!changingPassword"><Check /></el-icon>
          确认修改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { Lock, InfoFilled, Check } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "success"]);

const userStore = useUserStore();
const passwordFormRef = ref();
const changingPassword = ref(false);

const visible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
  }
);

watch(visible, (val) => {
  emit("update:modelValue", val);
});

const passwordForm = reactive({
  newPassword: "",
  confirmPassword: "",
});

const passwordRules = {
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const handleClose = () => {
  visible.value = false;
  // 清空表单
  Object.assign(passwordForm, {
    newPassword: "",
    confirmPassword: "",
  });
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate();
  }
};

const changePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();
    changingPassword.value = true;

    // 获取当前用户信息
    const currentProfile = userStore.profile;
    if (!currentProfile) {
      throw new Error("用户未登录");
    }

    // 调用后端 API 更新密码
    const { updateProfileApi } = await import("@/api/user.js");
    await updateProfileApi(currentProfile.id, {
      password: passwordForm.newPassword,
    });

    // 同步更新本地 store
    const updatedProfile = {
      ...currentProfile,
      password: passwordForm.newPassword,
    };
    userStore.setProfile(updatedProfile);

    ElMessage.success("密码修改成功");
    emit("success");
    handleClose();
  } catch (error) {
    console.error("修改密码失败:", error);
    ElMessage.error(error.message || "修改密码失败，请重试");
  } finally {
    changingPassword.value = false;
  }
};
</script>

<style scoped lang="scss">
/* 密码弹窗样式 */
:deep(.password-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    padding: 0;
    margin: 0;
  }

  .el-dialog__body {
    padding: 24px 32px;
  }

  .el-dialog__footer {
    padding: 16px 32px 24px;
    border-top: 1px solid #f0f2f5;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: var(--color-primary-light-1);
  color: white;

  .header-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 24px;
  }

  .header-text {
    flex: 1;

    h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }
  }
}

.password-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  .el-input {
    border-radius: 8px;
  }

  .password-tips {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f0f9ff;
    border-left: 3px solid #67d474d5;
    border-radius: 4px;
    color: #606266;
    font-size: 13px;
    margin-top: 8px;

    .el-icon {
      color: #67d474d5;
      font-size: 16px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    border-radius: 8px;
    padding: 10px 24px;
    font-weight: 500;
  }
}
</style>
